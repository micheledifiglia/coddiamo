const COOKIE = '__Host-atlas_session';
const STATE_COOKIE = '__Host-atlas_oauth_state';
const SESSION_MS = 365 * 24 * 60 * 60 * 1000;
const CHALLENGE_MS = 10 * 60 * 1000;
const encoder = new TextEncoder();
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers}});
const b64url = bytes => {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};
const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), c => c.charCodeAt(0));
const token = (length = 32) => {const bytes = new Uint8Array(length); crypto.getRandomValues(bytes); return b64url(bytes);};
const digest = async value => b64url(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const cookie = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
const getCookieValue = (request, name) => (request.headers.get('cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1) || '';
const getCookie = request => getCookieValue(request, COOKIE);
const stateCookie = value => `${STATE_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=600`;
const clearStateCookie = () => `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`;
const redirect = (location, cookies = []) => {
  const headers = new Headers({'location': location, 'cache-control': 'no-store'});
  for (const value of cookies) headers.append('set-cookie', value);
  return new Response(null, {status: 303, headers});
};
const b64json = value => JSON.parse(new TextDecoder().decode(decode(value)));
const pemBytes = value => Uint8Array.from(atob(value.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')), c => c.charCodeAt(0));

function providerConfig(env, provider, origin) {
  const settings = provider === 'google'
    ? {clientId: env.ATLAS_GOOGLE_CLIENT_ID, clientSecret: env.ATLAS_GOOGLE_CLIENT_SECRET, redirectUri: env.ATLAS_GOOGLE_REDIRECT_URI}
    : {clientId: env.ATLAS_APPLE_CLIENT_ID, teamId: env.ATLAS_APPLE_TEAM_ID, keyId: env.ATLAS_APPLE_KEY_ID, privateKey: env.ATLAS_APPLE_PRIVATE_KEY, redirectUri: env.ATLAS_APPLE_REDIRECT_URI};
  if (Object.values(settings).some(value => !value)) return null;
  const expectedPath = `/api/auth/${provider}/callback`;
  try {
    const redirect = new URL(settings.redirectUri);
    if (redirect.protocol !== 'https:' || redirect.origin !== origin || redirect.pathname !== expectedPath || redirect.search || redirect.hash) return null;
  } catch { return null; }
  return settings;
}

async function appleClientSecret(config) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(encoder.encode(JSON.stringify({alg: 'ES256', kid: config.keyId, typ: 'JWT'})));
  const claims = b64url(encoder.encode(JSON.stringify({iss: config.teamId, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: config.clientId})));
  const signingInput = `${header}.${claims}`;
  const key = await crypto.subtle.importKey('pkcs8', pemBytes(config.privateKey), {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign']);
  const signature = await crypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, key, encoder.encode(signingInput));
  return `${signingInput}.${b64url(signature)}`;
}

const jwksCache = new Map();
async function verifyIdToken(idToken, provider, config, expectedNonce) {
  const parts = idToken.split('.');
  if (parts.length !== 3 || idToken.length > 12000) throw Error('invalid identity token');
  const header = b64json(parts[0]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw Error('invalid token algorithm');
  const jwksUrl = provider === 'google' ? 'https://www.googleapis.com/oauth2/v3/certs' : 'https://appleid.apple.com/auth/keys';
  let cached = jwksCache.get(jwksUrl);
  if (!cached || cached.until < Date.now()) {
    const response = await fetch(jwksUrl, {headers: {'accept': 'application/json'}});
    if (!response.ok) throw Error('identity keys unavailable');
    const keys = await response.json();
    if (!Array.isArray(keys.keys)) throw Error('invalid identity keys');
    cached = {keys: keys.keys, until: Date.now() + 60 * 60 * 1000};
    jwksCache.set(jwksUrl, cached);
  }
  const jwk = cached.keys.find(key => key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig');
  if (!jwk) {jwksCache.delete(jwksUrl); throw Error('identity key not found');}
  const key = await crypto.subtle.importKey('jwk', jwk, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['verify']);
  if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, decode(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`))) throw Error('invalid token signature');
  const claims = b64json(parts[1]), now = Math.floor(Date.now() / 1000);
  const issuers = provider === 'google' ? ['https://accounts.google.com', 'accounts.google.com'] : ['https://appleid.apple.com'];
  const audience = claims.aud;
  if (!issuers.includes(claims.iss) || !(audience === config.clientId || Array.isArray(audience) && audience.includes(config.clientId)) || Array.isArray(audience) && claims.azp !== config.clientId || !claims.sub || typeof claims.sub !== 'string' || claims.sub.length > 255 || !Number.isFinite(claims.exp) || claims.exp <= now || !Number.isFinite(claims.iat) || claims.iat > now + 60 || now - claims.iat > 3600 || claims.nonce !== expectedNonce) throw Error('invalid identity claims');
  if (claims.email_verified !== undefined && claims.email_verified !== true && claims.email_verified !== 'true') throw Error('unverified email');
  return claims;
}

export function createOAuthAuth() {
  async function allowStart(request, env, provider) {
    const now = Date.now(), window = 15 * 60 * 1000, ip = request.headers.get('cf-connecting-ip') || 'unknown';
    for (const [scope, subject, limit] of [['oauth-provider', provider, 12], ['oauth-ip', 'all', 40]]) {
      const key = await digest(`${scope}\0${subject}\0${ip}`);
      const row = await env.DB.prepare(`INSERT INTO atlas_auth_rate_limits(key,window_start,attempts) VALUES(?,?,1)
        ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,
        window_start=CASE WHEN window_start<=? THEN ? ELSE window_start END RETURNING attempts`)
        .bind(key, now, now - window, now - window, now).first();
      if ((row?.attempts || limit + 1) > limit) return false;
    }
    return true;
  }

  async function getSession(request, env) {
    const raw = getCookie(request);
    if (!raw || raw.length > 128 || !env.DB) return null;
    const tokenHash = await digest(raw), now = Date.now();
    const row = await env.DB.prepare(`SELECT a.id, i.email, i.display_name, i.provider, s.expires_at FROM atlas_sessions s JOIN atlas_accounts a ON a.id=s.owner JOIN atlas_identities i ON i.owner=a.id WHERE s.token_hash=? AND s.expires_at>? ORDER BY i.last_login_at DESC LIMIT 1`)
      .bind(tokenHash, now).first();
    if (!row) return null;
    const expiresAt = now + SESSION_MS;
    await env.DB.prepare('UPDATE atlas_sessions SET expires_at=? WHERE token_hash=?').bind(expiresAt, tokenHash).run();
    return {user: {id: row.id, email: row.email, name: row.display_name, provider: row.provider}, setCookie: cookie(raw, Math.floor(SESSION_MS / 1000))};
  }

  async function consumeState(env, state, provider) {
    if (!state || state.length > 100) return null;
    const row = await env.DB.prepare('UPDATE atlas_auth_challenges SET consumed_at=? WHERE id=? AND purpose=? AND consumed_at IS NULL AND expires_at>? RETURNING challenge')
      .bind(Date.now(), state, `oauth-${provider}`, Date.now()).first();
    if (!row) return null;
    try { return JSON.parse(row.challenge); } catch { return null; }
  }

  async function start(request, env, provider) {
    const origin = new URL(request.url).origin, config = providerConfig(env, provider, origin);
    if (env.ATLAS_AUTH_MODE !== 'oauth' || !config) return new Response('Accesso non configurato', {status: 503});
    if (!await allowStart(request, env, provider)) return new Response('Troppi tentativi. Riprova tra 15 minuti.', {status: 429, headers: {'retry-after': '900', 'cache-control': 'no-store'}});
    const state = token(), nonce = token(), browserToken = token();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM atlas_auth_challenges WHERE expires_at<?').bind(Date.now()),
      env.DB.prepare('DELETE FROM atlas_sessions WHERE expires_at<?').bind(Date.now()),
      env.DB.prepare('DELETE FROM atlas_auth_rate_limits WHERE window_start<?').bind(Date.now() - 24 * 60 * 60 * 1000)
    ]);
    await env.DB.prepare('INSERT INTO atlas_auth_challenges(id,challenge,purpose,expires_at) VALUES(?,?,?,?)')
      .bind(state, JSON.stringify({nonce, browserHash: await digest(browserToken)}), `oauth-${provider}`, Date.now() + CHALLENGE_MS).run();
    const endpoint = provider === 'google' ? 'https://accounts.google.com/o/oauth2/v2/auth' : 'https://appleid.apple.com/auth/authorize';
    const url = new URL(endpoint);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', config.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('response_mode', provider === 'apple' ? 'form_post' : 'query');
    url.searchParams.set('scope', provider === 'google' ? 'openid email profile' : 'name email');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    if (provider === 'google') url.searchParams.set('prompt', 'select_account');
    return new Response(null, {status: 302, headers: {'location': url.toString(), 'cache-control': 'no-store', 'set-cookie': stateCookie(browserToken)}});
  }

  async function callback(request, env, provider) {
    const url = new URL(request.url), config = providerConfig(env, provider, url.origin);
    if (env.ATLAS_AUTH_MODE !== 'oauth' || !config) return new Response('Accesso non configurato', {status: 503});
    let params;
    if (request.method === 'GET') params = url.searchParams;
    else if (request.method === 'POST' && request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
      if (Number(request.headers.get('content-length') || 0) > 65536) return new Response('Richiesta troppo grande', {status: 413});
      const form = await request.text();
      if (form.length > 65536) return new Response('Richiesta troppo grande', {status: 413});
      params = new URLSearchParams(form);
    }
    else return new Response('Richiesta non valida', {status: 405});
    const state = params.get('state'), code = params.get('code');
    const flow = await consumeState(env, state, provider);
    if (!flow || !code || code.length > 4096 || params.has('error') || !getCookieValue(request, STATE_COOKIE) || flow.browserHash !== await digest(getCookieValue(request, STATE_COOKIE))) return redirect(`${url.origin}/?auth_error=cancelled`, [clearStateCookie()]);

    const clientSecret = provider === 'google' ? config.clientSecret : await appleClientSecret(config);
    const form = new URLSearchParams({grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, client_id: config.clientId, client_secret: clientSecret});
    const response = await fetch(provider === 'google' ? 'https://oauth2.googleapis.com/token' : 'https://appleid.apple.com/auth/token', {
      method: 'POST', headers: {'content-type': 'application/x-www-form-urlencoded', 'accept': 'application/json'}, body: form
    });
    if (!response.ok) return redirect(`${url.origin}/?auth_error=provider`, [clearStateCookie()]);
    const tokens = await response.json();
    if (typeof tokens.id_token !== 'string') return redirect(`${url.origin}/?auth_error=provider`, [clearStateCookie()]);
    let claims;
    try { claims = await verifyIdToken(tokens.id_token, provider, config, flow.challenge); }
    catch { return redirect(`${url.origin}/?auth_error=verify`, [clearStateCookie()]); }

    let name = typeof claims.name === 'string' ? claims.name.slice(0, 160) : '';
    let email = typeof claims.email === 'string' ? claims.email.slice(0, 320) : '';
    if (provider === 'apple' && !name) {
      try {
        const user = JSON.parse(params.get('user') || '{}');
        name = [user.name?.firstName, user.name?.lastName].filter(Boolean).join(' ').slice(0, 160);
        if (!email && typeof user.email === 'string') email = user.email.slice(0, 320);
      } catch {}
    }
    const owner = crypto.randomUUID(), now = new Date().toISOString();
    const existing = await env.DB.prepare('SELECT owner FROM atlas_identities WHERE provider=? AND subject=?').bind(provider, claims.sub).first();
    const verifiedEmail = claims.email_verified === true || claims.email_verified === 'true';
    const matchingEmail = !existing && email && verifiedEmail
      ? await env.DB.prepare('SELECT owner FROM atlas_identities WHERE lower(email)=lower(?) LIMIT 1').bind(email).first()
      : null;
    let id = existing?.owner || matchingEmail?.owner || owner;
    const sessionToken = token(), tokenHash = await digest(sessionToken), expiresAt = Date.now() + SESSION_MS;
    if (existing) {
      await env.DB.batch([
        env.DB.prepare('UPDATE atlas_identities SET email=COALESCE(NULLIF(?,\'\'),email), display_name=COALESCE(NULLIF(?,\'\'),display_name), last_login_at=? WHERE provider=? AND subject=?').bind(email, name, now, provider, claims.sub),
        env.DB.prepare('UPDATE atlas_accounts SET last_login_at=? WHERE id=?').bind(now, id),
        env.DB.prepare('INSERT INTO atlas_sessions(token_hash,owner,persistent,created_at,expires_at) VALUES(?,?,1,?,?)').bind(tokenHash, id, Date.now(), expiresAt)
      ]);
    } else {
      await env.DB.batch([
        env.DB.prepare('INSERT INTO atlas_accounts(id,created_at,last_login_at) VALUES(?,?,?)').bind(id, now, now),
        env.DB.prepare('INSERT INTO atlas_identities(provider,subject,owner,email,display_name,created_at,last_login_at) VALUES(?,?,?,?,?,?,?)').bind(provider, claims.sub, id, email, name, now, now),
        env.DB.prepare('INSERT INTO atlas_states(owner,body,revision) VALUES(?,?,0)').bind(id, JSON.stringify(globalThis.AtlasCore.empty())),
        env.DB.prepare('INSERT INTO atlas_sessions(token_hash,owner,persistent,created_at,expires_at) VALUES(?,?,1,?,?)').bind(tokenHash, id, Date.now(), expiresAt)
      ]);
    }
    return redirect(`${url.origin}/?signed_in=1`, [cookie(sessionToken, Math.floor(SESSION_MS / 1000)), clearStateCookie()]);
  }

  async function handle(request, env) {
    const url = new URL(request.url), route = url.pathname;
    if (!route.startsWith('/api/auth/')) return null;
    if (!env.DB) return json({error: 'Servizio non disponibile'}, 503);
    const providers = ['google', 'apple'].filter(provider => providerConfig(env, provider, url.origin));
    if (route === '/api/auth/mode' && request.method === 'GET') return json({mode: env.ATLAS_AUTH_MODE === 'oauth' && providers.length === 2 ? 'oauth' : 'unavailable', providers});
    if (route === '/api/auth/google/start' && request.method === 'GET') return start(request, env, 'google');
    if (route === '/api/auth/apple/start' && request.method === 'GET') return start(request, env, 'apple');
    if (route === '/api/auth/google/callback') return callback(request, env, 'google');
    if (route === '/api/auth/apple/callback') return callback(request, env, 'apple');
    if (route === '/api/auth/session' && request.method === 'GET') {
      try {
        const session = await getSession(request, env);
        return session ? json({user: session.user}, 200, {'set-cookie': session.setCookie}) : json({error: 'Accesso richiesto'}, 401);
      } catch { return json({error: 'Sessione non disponibile'}, 503); }
    }
    if (request.method !== 'POST') return json({error: 'Metodo non consentito'}, 405);
    if (request.headers.get('origin') !== url.origin) return json({error: 'Origine non consentita'}, 403);
    const raw = getCookie(request), rawHash = raw && raw.length < 128 ? await digest(raw) : null;
    if (route === '/api/auth/logout') {
      if (rawHash) await env.DB.prepare('DELETE FROM atlas_sessions WHERE token_hash=?').bind(rawHash).run();
      return json({ok: true}, 200, {'set-cookie': clearCookie()});
    }
    if (route === '/api/auth/profile/delete') {
      let input;
      try { input = await request.json(); } catch { return json({error: 'Richiesta non valida'}, 400); }
      if (input.confirm !== 'ELIMINA' || !rawHash) return json({error: 'Conferma non valida'}, 400);
      const row = await env.DB.prepare('SELECT owner FROM atlas_sessions WHERE token_hash=? AND expires_at>?').bind(rawHash, Date.now()).first();
      if (!row) return json({error: 'Accesso richiesto'}, 401);
      await env.DB.batch([
        env.DB.prepare('DELETE FROM atlas_history WHERE owner=?').bind(row.owner),
        env.DB.prepare('DELETE FROM atlas_states WHERE owner=?').bind(row.owner),
        env.DB.prepare('DELETE FROM atlas_sessions WHERE owner=?').bind(row.owner),
        env.DB.prepare('DELETE FROM atlas_auth_challenges WHERE owner=?').bind(row.owner),
        env.DB.prepare('DELETE FROM atlas_accounts WHERE id=?').bind(row.owner)
      ]);
      return json({ok: true}, 200, {'set-cookie': clearCookie()});
    }
    return json({error: 'Endpoint non trovato'}, 404);
  }

  return {
    handle,
    async resolveOwner(request, env) {
      try { return (await getSession(request, env))?.user.id || null; } catch { return null; }
    }
  };
}
