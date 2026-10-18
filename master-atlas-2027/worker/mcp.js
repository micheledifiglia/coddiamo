'use strict';

const ACCESS_LIFETIME = 60 * 60 * 1000;
const REFRESH_LIFETIME = 30 * 24 * 60 * 60 * 1000;
const REQUEST_LIFETIME = 10 * 60 * 1000;
const CODE_LIFETIME = 90 * 1000;
const MCP_ENDPOINT = '/api/atlas-mcp';
const utf8 = value => new TextEncoder().encode(value);
const b64url = value => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};
const randomToken = (size = 32) => { const bytes = new Uint8Array(size); crypto.getRandomValues(bytes); return b64url(bytes); };
const digest = async value => b64url(await crypto.subtle.digest('SHA-256', utf8(value)));
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers}});
const html = (body, status = 200) => new Response(body, {status, headers: {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supportedScopes = new Set(['atlas:read', 'atlas:write', 'offline_access']);
const parseScopes = value => [...new Set(String(value || '').split(/\s+/).filter(scope => supportedScopes.has(scope)))];
const hasScope = (scopes, wanted) => scopes.split(/\s+/).includes(wanted);
const validRedirect = value => {
  try { const url = new URL(value); return (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) && !url.username && !url.password; }
  catch { return false; }
};
const formBody = async request => {
  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/x-www-form-urlencoded')) return null;
  const raw = await request.text();
  if (raw.length > 20000) return null;
  return new URLSearchParams(raw);
};
const htmlShell = content => `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Collega l’IA · Master Atlas</title><style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#eef3f9;color:#182235;font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.card{width:min(100%,520px);padding:clamp(24px,6vw,42px);border:1px solid #ffffffb8;border-radius:30px;background:#ffffffc9;box-shadow:0 24px 80px #2437511c;backdrop-filter:blur(24px)}.mark{display:grid;place-items:center;width:48px;height:48px;margin-bottom:22px;border-radius:17px;background:linear-gradient(145deg,#7b8cf5,#394bcc);color:white;font-size:28px;font-weight:700}h1{margin:0 0 10px;font-size:28px;letter-spacing:-.04em;line-height:1.1}p{color:#647084}.permissions{margin:22px 0;padding:15px;border-radius:18px;background:#f1f4fa}.permissions label{display:flex;gap:10px;align-items:flex-start;margin:12px 0}.permissions small{display:block;color:#69758a}.field{display:block;margin:18px 0 6px;font-weight:600}input[type=text],input[type=password]{width:100%;padding:14px 15px;border:1px solid #cad3e0;border-radius:14px;background:#fff;color:inherit;font:inherit}.buttons{display:flex;gap:10px;margin-top:22px}.buttons button{flex:1;padding:13px 16px;border:1px solid #c9d3e2;border-radius:14px;background:#fff;color:inherit;font:inherit;font-weight:650}.buttons button.primary{border-color:#4058da;background:#4058da;color:white}#message{min-height:1.5em;color:#a43d4a}.fine{font-size:13px}.error{padding:13px;border-radius:14px;background:#fff0f0;color:#913b47}
</style><body><main class="card"><div class="mark">m·</div>${content}</main></body></html>`;

function createMcpHandler(accountAuth, Core, catalog) {
  const dbReady = env => !!env.DB;
  async function rate(request, env, scope, limit = 20) {
    const now = Date.now(), window = 15 * 60 * 1000, ip = request.headers.get('cf-connecting-ip') || 'unavailable';
    const key = await digest(`${scope}\0${ip}`);
    const row = await env.DB.prepare(`INSERT INTO atlas_auth_rate_limits(key,window_start,attempts) VALUES(?,?,1)
      ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,
      window_start=CASE WHEN window_start<=? THEN ? ELSE window_start END RETURNING attempts`)
      .bind(key, now, now-window, now-window, now).first();
    return (row?.attempts || limit + 1) <= limit;
  }
  const expectedOrigin = (request, env) => env.ATLAS_AUTH_ORIGIN || new URL(request.url).origin;
  const validHost = (request, env) => new URL(request.url).origin === expectedOrigin(request, env);
  function errorPage(message) { return html(htmlShell(`<div class="error">${esc(message)}</div><p class="fine">Torna all’app Master Atlas e riprova il collegamento.</p>`), 400); }
  function loginPage() {
    return html(htmlShell(`<h1>Accedi per collegare l’IA</h1><p>Usa il tuo profilo Master Atlas. La password non viene condivisa con ChatGPT o Claude.</p><form id="login"><label class="field" for="username">Nome utente</label><input id="username" name="username" type="text" autocomplete="username" minlength="3" maxlength="32" required><label class="field" for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required><p id="message" role="status" aria-live="polite"></p><div class="buttons"><button class="primary" type="submit">Accedi e continua</button></div></form><p class="fine">Se usi una passkey, accedi prima a Master Atlas nello stesso browser e poi riapri il collegamento. Puoi revocare l’accesso in qualsiasi momento dal profilo.</p><script>
const form=document.querySelector('#login'),message=document.querySelector('#message');form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;message.textContent='Verifica…';try{const response=await fetch('/api/auth/password/login',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({username:form.username.value,password:form.password.value,remember:true})});const data=await response.json().catch(()=>({}));if(!response.ok)throw Error(data.error||'Accesso non riuscito.');location.reload()}catch(error){message.textContent=error.message||'Accesso non riuscito.';button.disabled=false}});
</script>`));
  }
  function consentPage(clientName, requested, requestId, redirectUri) {
    const read = requested.includes('atlas:read'), write = requested.includes('atlas:write'), offline = requested.includes('offline_access');
    const callbackHost = new URL(redirectUri).host;
    return html(htmlShell(`<h1>Collega ${esc(clientName)}</h1><p>Concedi a questa IA l’accesso al tuo spazio personale di Master Atlas. Le credenziali restano sul sito.</p><p class="fine">L’app riceverà il token all’indirizzo verificato <strong>${esc(callbackHost)}</strong>.</p><form id="consent-form" method="post" action="/oauth/consent"><input type="hidden" name="request_id" value="${esc(requestId)}"><div class="permissions"><strong>Permessi richiesti</strong>
${read ? `<label><input type="checkbox" name="read" value="1" checked required><span>Leggere il mio atlante<small>Preferenze, percorsi salvati e candidature.</small></span></label>` : ''}
${write ? `<label><input type="checkbox" name="write" value="1" checked><span>Modificare il mio atlante<small>Aggiungere percorsi, aggiornare shortlist, note e stati.</small></span></label>` : ''}
${offline ? `<label><input type="checkbox" name="offline" value="1" checked><span>Mantenere il collegamento<small>Puoi revocarlo dal profilo in qualsiasi momento.</small></span></label>` : ''}</div><div class="buttons"><button name="decision" value="deny">Annulla</button><button class="primary" name="decision" value="approve">Consenti</button></div></form><p class="fine">L’IA vede soltanto questo profilo. Non può leggere i dati degli altri utenti.</p><script>const consentForm=document.querySelector('#consent-form');consentForm.addEventListener('submit',event=>{if(consentForm.dataset.submitting==='true'){event.preventDefault();return}consentForm.dataset.submitting='true';const submitter=event.submitter;consentForm.querySelectorAll('button').forEach(button=>{if(button!==submitter)button.disabled=true});if(submitter){submitter.setAttribute('aria-disabled','true');submitter.style.pointerEvents='none'}if(submitter?.value==='approve')submitter.textContent='Collegamento in corso…'});</script>`));
  }
  function metadata(origin) {
    return {
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      revocation_endpoint: `${origin}/oauth/revoke`,
      response_types_supported: ['code'],
      response_modes_supported: ['query'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      revocation_endpoint_auth_methods_supported: ['none'],
      scopes_supported: ['atlas:read', 'atlas:write', 'offline_access'],
      authorization_response_iss_parameter_supported: true
    };
  }
  function resourceMetadata(origin) {
    return {resource: `${origin}${MCP_ENDPOINT}`, authorization_servers: [origin], bearer_methods_supported: ['header'], scopes_supported: ['atlas:read', 'atlas:write']};
  }
  async function register(request, env, origin) {
    if (!await rate(request, env, 'mcp-register', 20)) return json({error: 'Troppi tentativi. Riprova più tardi.'}, 429);
    let input; try { input = await request.json(); } catch { return json({error: 'JSON non valido.'}, 400); }
    const redirects = Array.isArray(input.redirect_uris) ? [...new Set(input.redirect_uris.filter(value => typeof value === 'string' && value.length <= 1000 && validRedirect(value)))] : [];
    if (!redirects.length || redirects.length > 12) return json({error: 'Specifica da uno a dodici indirizzi di ritorno HTTPS validi.'}, 400);
    const id = randomToken(24), name = typeof input.client_name === 'string' ? input.client_name.trim().slice(0, 120) : 'Assistente IA';
    await env.DB.prepare('INSERT INTO atlas_mcp_clients(id,name,redirect_uris,created_at) VALUES(?,?,?,?)').bind(id, name || 'Assistente IA', JSON.stringify(redirects), new Date().toISOString()).run();
    return json({client_id: id, client_name: name || 'Assistente IA', redirect_uris: redirects, grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'none'}, 201, {'access-control-allow-origin': '*'});
  }
  async function authorize(request, env, origin) {
    const url = new URL(request.url), q = url.searchParams;
    const clientId = q.get('client_id') || '', redirectUri = q.get('redirect_uri') || '', state = q.get('state') || '';
    const client = clientId.length <= 100 ? await env.DB.prepare('SELECT name,redirect_uris FROM atlas_mcp_clients WHERE id=?').bind(clientId).first() : null;
    let redirects = []; try { redirects = JSON.parse(client?.redirect_uris || '[]'); } catch {}
    if (!client || !redirects.includes(redirectUri) || !validRedirect(redirectUri)) return errorPage('Il client o l’indirizzo di ritorno non è valido.');
    if (q.get('response_type') !== 'code' || q.get('code_challenge_method') !== 'S256') return errorPage('Il client deve usare il flusso Authorization Code con PKCE S256.');
    const challenge = q.get('code_challenge') || '';
    if (!/^[A-Za-z0-9_-]{43,128}$/.test(challenge)) return errorPage('La richiesta di sicurezza PKCE non è valida.');
    if (!state || state.length > 1024) return errorPage('La richiesta non contiene uno stato valido.');
    const resource = q.get('resource') || `${origin}${MCP_ENDPOINT}`;
    if (resource !== `${origin}${MCP_ENDPOINT}`) return errorPage('La risorsa richiesta non corrisponde a Master Atlas.');
    const requested = parseScopes(q.get('scope') || 'atlas:read atlas:write offline_access');
    if (!requested.includes('atlas:read')) requested.unshift('atlas:read');
    const owner = await accountAuth.resolveOwner(request, env);
    if (!owner) return loginPage();
    const requestId = randomToken(24), now = Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM atlas_mcp_authorization_requests WHERE expires_at<? OR consumed_at IS NOT NULL').bind(now),
      env.DB.prepare('INSERT INTO atlas_mcp_authorization_requests(id,owner,client_id,redirect_uri,response_state,code_challenge,scopes,resource,expires_at) VALUES(?,?,?,?,?,?,?,?,?)')
        .bind(requestId, owner, clientId, redirectUri, state, challenge, requested.join(' '), resource, now + REQUEST_LIFETIME)
    ]);
    return consentPage(client.name, requested, requestId, redirectUri);
  }
  async function consent(request, env, origin) {
    if (request.headers.get('origin') !== origin) return json({error: 'Origine non consentita.'}, 403);
    const form = await formBody(request); if (!form) return json({error: 'Richiesta non valida.'}, 400);
    const owner = await accountAuth.resolveOwner(request, env); if (!owner) return json({error: 'Accedi di nuovo al tuo profilo.'}, 401);
    const requestId = form.get('request_id') || '', now = Date.now();
    const row = await env.DB.prepare('UPDATE atlas_mcp_authorization_requests SET consumed_at=? WHERE id=? AND owner=? AND consumed_at IS NULL AND expires_at>? RETURNING *').bind(now, requestId, owner, now).first();
    if (!row) {
      const previous = await env.DB.prepare('SELECT consumed_at FROM atlas_mcp_authorization_requests WHERE id=? AND owner=?').bind(requestId, owner).first();
      if (previous?.consumed_at) return errorPage('Questo consenso è già stato inviato. Torna all’IA per completare il collegamento; se l’errore continua, avvia una nuova connessione dall’app.');
      return errorPage('La richiesta di collegamento non è più valida. Torna all’IA e avvia di nuovo il collegamento.');
    }
    const requested = parseScopes(row.scopes), granted = [];
    if (requested.includes('atlas:read') && form.get('read') === '1') granted.push('atlas:read');
    if (requested.includes('atlas:write') && form.get('write') === '1') granted.push('atlas:write');
    if (requested.includes('offline_access') && form.get('offline') === '1') granted.push('offline_access');
    const target = new URL(row.redirect_uri);
    target.searchParams.set('iss', origin);
    if (form.get('decision') !== 'approve' || !granted.includes('atlas:read')) {
      target.searchParams.set('error', form.get('decision') === 'approve' ? 'access_denied' : 'access_denied');
      target.searchParams.set('error_description', 'Accesso non autorizzato dall’utente.');
      if (row.response_state) target.searchParams.set('state', row.response_state);
      return Response.redirect(target.toString(), 303);
    }
    const code = randomToken(32), codeHash = await digest(code);
    await env.DB.prepare('INSERT INTO atlas_mcp_authorization_codes(code_hash,owner,client_id,redirect_uri,response_state,code_challenge,scopes,resource,expires_at) VALUES(?,?,?,?,?,?,?,?,?)')
      .bind(codeHash, owner, row.client_id, row.redirect_uri, row.response_state, row.code_challenge, granted.join(' '), row.resource, Date.now() + CODE_LIFETIME).run();
    target.searchParams.set('code', code); if (row.response_state) target.searchParams.set('state', row.response_state);
    return Response.redirect(target.toString(), 303);
  }
  async function issueTokens(env, owner, clientId, scopes, resource) {
    const now = Date.now(), access = randomToken(32), accessHash = await digest(access), tokens = [{hash: accessHash, kind: 'access', expires: now + ACCESS_LIFETIME}];
    let refresh = null;
    if (scopes.split(/\s+/).includes('offline_access')) { refresh = randomToken(40); tokens.push({hash: await digest(refresh), kind: 'refresh', expires: now + REFRESH_LIFETIME}); }
    await env.DB.batch(tokens.map(token => env.DB.prepare('INSERT INTO atlas_mcp_tokens(token_hash,owner,client_id,token_type,scopes,resource,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?)')
      .bind(token.hash, owner, clientId, token.kind, scopes, resource, now, token.expires)));
    return {access_token: access, token_type: 'Bearer', expires_in: Math.floor(ACCESS_LIFETIME / 1000), scope: scopes, ...(refresh ? {refresh_token: refresh} : {})};
  }
  async function token(request, env, origin) {
    if (!await rate(request, env, 'mcp-token', 20)) return json({error: 'Troppi tentativi. Riprova più tardi.'}, 429, {'access-control-allow-origin': '*'});
    const form = await formBody(request); if (!form) return json({error: 'invalid_request'} ,400, {'access-control-allow-origin': '*'});
    const clientId = form.get('client_id') || '', grant = form.get('grant_type') || '';
    const client = await env.DB.prepare('SELECT id FROM atlas_mcp_clients WHERE id=?').bind(clientId).first();
    if (!client) return json({error: 'invalid_client'}, 401, {'access-control-allow-origin': '*'});
    const resource = form.get('resource') || `${origin}${MCP_ENDPOINT}`;
    if (resource !== `${origin}${MCP_ENDPOINT}`) return json({error: 'invalid_target'}, 400, {'access-control-allow-origin': '*'});
    if (grant === 'authorization_code') {
      const codeHash = await digest(form.get('code') || ''), row = await env.DB.prepare('SELECT * FROM atlas_mcp_authorization_codes WHERE code_hash=? AND client_id=? AND redirect_uri=? AND consumed_at IS NULL AND expires_at>?')
        .bind(codeHash, clientId, form.get('redirect_uri') || '', Date.now()).first();
      const verifier = form.get('code_verifier') || '';
      if (!row || row.resource !== resource || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || b64url(await crypto.subtle.digest('SHA-256', utf8(verifier))) !== row.code_challenge) return json({error: 'invalid_grant'}, 400, {'access-control-allow-origin': '*'});
      const consumed = await env.DB.prepare('UPDATE atlas_mcp_authorization_codes SET consumed_at=? WHERE code_hash=? AND consumed_at IS NULL AND expires_at>? RETURNING owner,scopes,resource')
        .bind(Date.now(), codeHash, Date.now()).first();
      if (!consumed) return json({error: 'invalid_grant'}, 400, {'access-control-allow-origin': '*'});
      return json(await issueTokens(env, consumed.owner, clientId, consumed.scopes, consumed.resource), 200, {'access-control-allow-origin': '*'});
    }
    if (grant === 'refresh_token') {
      const oldHash = await digest(form.get('refresh_token') || ''), row = await env.DB.prepare("SELECT * FROM atlas_mcp_tokens WHERE token_hash=? AND client_id=? AND token_type='refresh' AND expires_at>?")
        .bind(oldHash, clientId, Date.now()).first();
      if (!row || row.resource !== resource) return json({error: 'invalid_grant'}, 400, {'access-control-allow-origin': '*'});
      const consumed = await env.DB.prepare("DELETE FROM atlas_mcp_tokens WHERE token_hash=? AND token_type='refresh' RETURNING owner,scopes,resource").bind(oldHash).first();
      if (!consumed) return json({error: 'invalid_grant'}, 400, {'access-control-allow-origin': '*'});
      return json(await issueTokens(env, consumed.owner, clientId, consumed.scopes, consumed.resource), 200, {'access-control-allow-origin': '*'});
    }
    return json({error: 'unsupported_grant_type'}, 400, {'access-control-allow-origin': '*'});
  }
  async function revoke(request, env) {
    const form = await formBody(request); if (!form) return new Response(null, {status: 400});
    const hash = await digest(form.get('token') || ''), row = await env.DB.prepare('SELECT owner,client_id FROM atlas_mcp_tokens WHERE token_hash=?').bind(hash).first();
    if (row && (!form.get('client_id') || form.get('client_id') === row.client_id)) await env.DB.prepare('DELETE FROM atlas_mcp_tokens WHERE owner=? AND client_id=?').bind(row.owner, row.client_id).run();
    return new Response(null, {status: 200, headers: {'cache-control': 'no-store', 'access-control-allow-origin': '*'}});
  }
  async function getToken(request, env, origin) {
    const raw = request.headers.get('authorization') || '', token = raw.match(/^Bearer\s+(.+)$/i)?.[1] || '';
    if (!token || token.length > 256) return null;
    const row = await env.DB.prepare("SELECT owner,scopes,resource FROM atlas_mcp_tokens WHERE token_hash=? AND token_type='access' AND expires_at>?").bind(await digest(token), Date.now()).first();
    return row && row.resource === `${origin}${MCP_ENDPOINT}` ? row : null;
  }
  const toolDefinitions = [
    {name: 'get_my_atlas', description: 'Leggi le preferenze, i percorsi selezionati e le candidature dell’account Master Atlas collegato.', inputSchema: {type: 'object', properties: {}, additionalProperties: false}, annotations: {readOnlyHint: true}},
    {name: 'search_master_programs', description: 'Cerca nel catalogo Master Atlas e nei percorsi personali dell’utente.', inputSchema: {type: 'object', properties: {query: {type: 'string', minLength: 2, maxLength: 120}, limit: {type: 'integer', minimum: 1, maximum: 25}}, required: ['query'], additionalProperties: false}, annotations: {readOnlyHint: true}},
    {name: 'set_my_preferences', description: 'Aggiorna la descrizione personale degli obiettivi e dei criteri di ricerca dell’utente.', inputSchema: {type: 'object', properties: {preferences: {type: 'string', maxLength: 2000}}, required: ['preferences'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: true}},
    {name: 'apply_atlas_plan', description: 'Applica in una sola modifica coerente le scelte esplicite dell’utente: preferenze, shortlist completa o aggiunte/rimozioni, confronto, percorsi personali e candidature. Non inventare requisiti o scadenze e chiedi conferma all’utente se una modifica non è esplicita.', inputSchema: {type: 'object', properties: {preferences: {type: 'string', maxLength: 2000}, selectedProgramIds: {type: 'array', items: {type: 'string', maxLength: 100}, maxItems: 308}, addProgramIds: {type: 'array', items: {type: 'string', maxLength: 100}, maxItems: 308}, removeProgramIds: {type: 'array', items: {type: 'string', maxLength: 100}, maxItems: 308}, compareProgramIds: {type: 'array', items: {type: 'string', maxLength: 100}, maxItems: 4}, customProgramsToAdd: {type: 'array', maxItems: 30, items: {type: 'object', properties: {name: {type: 'string', minLength: 2, maxLength: 180}, university: {type: 'string', minLength: 2, maxLength: 140}, city: {type: 'string', maxLength: 100}, country: {type: 'string', maxLength: 100}, region: {type: 'string', enum: ['Europa', 'Extra-Europa']}, degree: {type: 'string', maxLength: 100}, field: {type: 'string', maxLength: 180}, url: {type: 'string', maxLength: 1200}, notes: {type: 'string', maxLength: 3000}}, required: ['name', 'university'], additionalProperties: false}}, applicationUpdates: {type: 'array', maxItems: 50, items: {type: 'object', properties: {programId: {type: 'string', maxLength: 100}, stage: {type: 'string', enum: ['', 'Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto']}, deadline: {type: 'string', pattern: '^$|^\\d{4}-\\d{2}-\\d{2}$'}, deadlineUrl: {type: 'string', maxLength: 1200}, notes: {type: 'string', maxLength: 5000}, checklist: {type: 'array', items: {type: 'integer', minimum: 0, maximum: 4}, maxItems: 5}}, required: ['programId'], additionalProperties: false}}}, additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: true}},
    {name: 'add_program_to_shortlist', description: 'Aggiungi al profilo un percorso esistente del catalogo o un percorso personale già salvato.', inputSchema: {type: 'object', properties: {programId: {type: 'string', maxLength: 100}}, required: ['programId'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: true}},
    {name: 'remove_program_from_shortlist', description: 'Rimuovi un percorso dalla shortlist personale senza cancellare il catalogo o le note.', inputSchema: {type: 'object', properties: {programId: {type: 'string', maxLength: 100}}, required: ['programId'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: true}},
    {name: 'add_custom_program', description: 'Crea un percorso personale con i dati forniti dall’utente e lo aggiunge alla shortlist.', inputSchema: {type: 'object', properties: {name: {type: 'string', minLength: 2, maxLength: 180}, university: {type: 'string', minLength: 2, maxLength: 140}, city: {type: 'string', maxLength: 100}, country: {type: 'string', maxLength: 100}, region: {type: 'string', enum: ['Europa', 'Extra-Europa']}, degree: {type: 'string', maxLength: 100}, field: {type: 'string', maxLength: 180}, url: {type: 'string', maxLength: 1200}, notes: {type: 'string', maxLength: 3000}}, required: ['name', 'university'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: false}},
    {name: 'update_application', description: 'Aggiorna note, stato e scadenza personale per un percorso del profilo.', inputSchema: {type: 'object', properties: {programId: {type: 'string', maxLength: 100}, stage: {type: 'string', enum: ['', 'Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto']}, deadline: {type: 'string', pattern: '^$|^\d{4}-\d{2}-\d{2}$'}, deadlineUrl: {type: 'string', maxLength: 1200}, notes: {type: 'string', maxLength: 5000}, checklist: {type: 'array', items: {type: 'integer', minimum: 0, maximum: 4}, maxItems: 5}}, required: ['programId'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: false, idempotentHint: true}},
    {name: 'remove_custom_program', description: 'Rimuovi un percorso creato personalmente dal tuo atlante e dalla shortlist.', inputSchema: {type: 'object', properties: {programId: {type: 'string', maxLength: 100}}, required: ['programId'], additionalProperties: false}, annotations: {readOnlyHint: false, destructiveHint: true, idempotentHint: true}}
  ];
  const tool = name => toolDefinitions.find(item => item.name === name);
  const textResult = data => ({content: [{type: 'text', text: JSON.stringify(data)}], structuredContent: data});
  const failedTool = message => ({isError: true, content: [{type: 'text', text: message}]});
  async function readState(env, owner) {
    await env.DB.prepare('INSERT OR IGNORE INTO atlas_states(owner,body,revision) VALUES(?,?,0)').bind(owner, JSON.stringify(Core.empty())).run();
    const row = await env.DB.prepare('SELECT body,revision FROM atlas_states WHERE owner=?').bind(owner).first();
    return {state: Core.normalize(JSON.parse(row.body), catalog), revision: Number(row.revision)};
  }
  async function updateState(env, owner, change) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const current = await readState(env, owner), next = JSON.parse(JSON.stringify(current.state));
      const result = await change(next);
      if (result?.error) return result;
      const normalized = Core.normalize(next, catalog), body = JSON.stringify(normalized), now = new Date().toISOString();
      const writes = await env.DB.batch([
        env.DB.prepare('UPDATE atlas_states SET body=?,revision=revision+1 WHERE owner=? AND revision=?').bind(body, owner, current.revision),
        env.DB.prepare('INSERT OR IGNORE INTO atlas_history(owner,revision,body,created_at) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM atlas_states WHERE owner=? AND revision=? AND body=?)')
          .bind(owner, current.revision, JSON.stringify(current.state), now, owner, current.revision + 1, body),
        env.DB.prepare('DELETE FROM atlas_history WHERE owner=? AND revision<?').bind(owner, Math.max(0, current.revision - 19))
      ]);
      if (writes[0].meta.changes) return {state: normalized, revision: current.revision + 1, result};
    }
    return {error: 'Il profilo è stato modificato contemporaneamente. Riprova.'};
  }
  function programExists(id, state) {
    return catalog.programs.some(program => program.id === id) || state.customPrograms.some(program => program.id === id && !program.deletedAt);
  }
  async function callTool(name, args, context, env) {
    const {owner, scopes} = context;
    if (!args || typeof args !== 'object' || Array.isArray(args)) return failedTool('Argomenti non validi.');
    const read = name === 'get_my_atlas' || name === 'search_master_programs';
    if (!hasScope(scopes, read ? 'atlas:read' : 'atlas:write')) return failedTool(`Il collegamento non ha il permesso ${read ? 'di lettura' : 'di modifica'} necessario. Ricollega l’account concedendo il permesso richiesto.`);
    if (name === 'get_my_atlas') {
      const {state} = await readState(env, owner), active = state.customPrograms.filter(p => !p.deletedAt);
      const selected = state.favorites.map(id => {
        const p = active.find(item => item.id === id) || catalog.programs.find(item => item.id === id);
        return p ? {id: p.id, name: p.name, university: p.university, city: p.city, region: p.region, url: p.url || '', application: state.records[id] || {}} : null;
      }).filter(Boolean);
      const byId = id => active.find(item => item.id === id) || catalog.programs.find(item => item.id === id);
      const compare = state.compare.map(id => byId(id)).filter(Boolean).map(program => ({id: program.id, name: program.name, university: program.university}));
      return textResult({preferences: state.preferences, selected, compare, customPrograms: active, tracked: Object.entries(state.records).map(([programId, record]) => ({programId, ...record}))});
    }
    if (name === 'search_master_programs') {
      const query = typeof args.query === 'string' ? args.query.trim().toLocaleLowerCase() : '';
      if (query.length < 2) return failedTool('Scrivi almeno due caratteri per cercare.');
      const {state} = await readState(env, owner), custom = state.customPrograms.filter(p => !p.deletedAt);
      const results = [...catalog.programs, ...custom].filter(p => [p.name, p.university, p.city, p.region, p.field, p.degree, ...(p.notes instanceof Array ? p.notes : [p.notes || ''])].join(' ').toLocaleLowerCase().includes(query))
        .slice(0, Math.max(1, Math.min(25, Number(args.limit) || 15))).map(p => ({id: p.id, name: p.name, university: p.university, city: p.city, region: p.region, field: p.field || '', degree: p.degree || '', url: p.url || '', custom: p.custom === true}));
      return textResult({count: results.length, results});
    }
    if (name === 'set_my_preferences') {
      if (typeof args.preferences !== 'string' || args.preferences.length > 2000) return failedTool('Le preferenze devono contenere al massimo 2.000 caratteri.');
      const update = await updateState(env, owner, state => {state.preferences = args.preferences.trim(); state.preferencesUpdatedAt = Date.now(); return {preferences: state.preferences};});
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    if (name === 'apply_atlas_plan') {
      if (Object.keys(args).length === 0) return failedTool('Specifica almeno una modifica richiesta dall’utente.');
      if (args.preferences !== undefined && (typeof args.preferences !== 'string' || args.preferences.length > 2000)) return failedTool('Le preferenze devono contenere al massimo 2.000 caratteri.');
      for (const key of ['selectedProgramIds','addProgramIds','removeProgramIds']) {
        if (args[key] !== undefined && (!Array.isArray(args[key]) || args[key].length > 308 || args[key].some(id => typeof id !== 'string' || id.length > 100))) return failedTool(`La lista ${key} non è valida o supera il limite di 308 percorsi.`);
      }
      if (args.compareProgramIds !== undefined && (!Array.isArray(args.compareProgramIds) || args.compareProgramIds.length > 4 || args.compareProgramIds.some(id => typeof id !== 'string' || id.length > 100))) return failedTool('Puoi confrontare al massimo quattro percorsi.');
      const customItems = args.customProgramsToAdd ?? [];
      if (!Array.isArray(customItems) || customItems.length > 30) return failedTool('Puoi aggiungere al massimo 30 percorsi personali per volta.');
      for (const item of customItems) {
        if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.length > 180 || typeof item.university !== 'string' || item.university.trim().length < 2 || item.university.length > 140) return failedTool('Ogni percorso personale deve avere nome e università validi.');
        for (const [key, limit] of Object.entries({city:100,country:100,degree:100,field:180,notes:3000})) if (item[key] !== undefined && (typeof item[key] !== 'string' || item[key].length > limit)) return failedTool(`Il campo ${key} non è valido o è troppo lungo.`);
        if (item.url) {try {if (typeof item.url !== 'string' || item.url.length > 1200 || new URL(item.url).protocol !== 'https:') throw Error()} catch {return failedTool('I link dei percorsi personali devono usare HTTPS.')}}
      }
      const applicationUpdates = args.applicationUpdates ?? [];
      if (!Array.isArray(applicationUpdates) || applicationUpdates.length > 50) return failedTool('Puoi aggiornare al massimo 50 candidature per volta.');
      const validStages = ['', 'Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto'];
      for (const item of applicationUpdates) {
        if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.programId !== 'string' || item.programId.length > 100) return failedTool('Una candidatura indica un percorso non valido.');
        if (item.stage !== undefined && !validStages.includes(item.stage)) return failedTool('Uno stato candidatura non è valido.');
        if (item.deadline !== undefined && (typeof item.deadline !== 'string' || (item.deadline && (!/^\d{4}-\d{2}-\d{2}$/.test(item.deadline) || Number(item.deadline.slice(0,4)) < 2020 || Number(item.deadline.slice(0,4)) > 2040)))) return failedTool('Una scadenza deve usare il formato YYYY-MM-DD.');
        if (item.deadlineUrl !== undefined && item.deadlineUrl !== '') {try {if (typeof item.deadlineUrl !== 'string' || new URL(item.deadlineUrl).protocol !== 'https:') throw Error()} catch {return failedTool('Il link della scadenza deve usare HTTPS.')}}
        if (item.notes !== undefined && (typeof item.notes !== 'string' || item.notes.length > 5000)) return failedTool('Le note possono contenere al massimo 5.000 caratteri.');
        if (item.checklist !== undefined && (!Array.isArray(item.checklist) || item.checklist.length > 5 || item.checklist.some(i => !Number.isInteger(i) || i < 0 || i > 4))) return failedTool('Checklist non valida: usa valori interi da 0 a 4.');
      }
      const now = Date.now();
      const update = await updateState(env, owner, state => {
        const created = [];
        if (state.customPrograms.filter(item => !item.deletedAt).length + customItems.length > 100) return {error: 'Il tuo atlante contiene già il massimo di 100 percorsi personali.'};
        let selected = args.selectedProgramIds === undefined ? [...state.favorites] : [...new Set(args.selectedProgramIds)];
        for (const id of [...(args.addProgramIds || []), ...(args.removeProgramIds || [])]) if (!programExists(id, state)) return {error: 'Uno dei percorsi indicati non esiste nel tuo atlante.'};
        if ((args.compareProgramIds || []).some(id => !programExists(id, state))) return {error: 'Il confronto contiene un percorso che non esiste nel tuo atlante.'};
        selected = [...new Set([...selected, ...(args.addProgramIds || [])])].filter(id => !(args.removeProgramIds || []).includes(id));
        if (selected.some(id => !programExists(id, state))) return {error: 'La shortlist contiene un percorso che non esiste nel tuo atlante.'};
        if (args.preferences !== undefined) {state.preferences = args.preferences.trim(); state.preferencesUpdatedAt = now;}
        for (const id of state.favorites) state.favoritesUpdated[id] = {selected: false, updatedAt: now};
        for (const id of selected) state.favoritesUpdated[id] = {selected: true, updatedAt: now};
        for (const item of customItems) {
          const program = {id: `custom-${crypto.randomUUID()}`, name: item.name.trim(), university: item.university.trim(), city: String(item.city || '').trim(), country: String(item.country || '').trim(), region: item.region === 'Extra-Europa' ? 'Extra-Europa' : 'Europa', degree: String(item.degree || '').trim(), field: String(item.field || '').trim(), url: String(item.url || '').trim(), notes: String(item.notes || '').trim(), createdAt: now, updatedAt: now, deletedAt: 0};
          state.customPrograms.push(program); selected.push(program.id); state.favoritesUpdated[program.id] = {selected: true, updatedAt: now}; created.push(program.id);
        }
        state.favorites = [...new Set(selected)];
        for (const item of applicationUpdates) {
          if (!programExists(item.programId, state)) return {error: 'Una candidatura indica un percorso che non esiste nel tuo atlante.'};
          const prior = state.records[item.programId] || {stage:'',deadline:'',deadlineUrl:'',notes:'',checklist:[],updatedAt:0};
          state.records[item.programId] = {...prior, ...(item.stage !== undefined ? {stage:item.stage} : {}), ...(item.deadline !== undefined ? {deadline:item.deadline} : {}), ...(item.deadlineUrl !== undefined ? {deadlineUrl:item.deadlineUrl} : {}), ...(item.notes !== undefined ? {notes:item.notes} : {}), ...(item.checklist !== undefined ? {checklist:[...new Set(item.checklist)]} : {}), updatedAt:now};
        }
        if (args.compareProgramIds !== undefined) {state.compare = [...new Set(args.compareProgramIds)]; state.compareUpdated = now;}
        return {updated:true, selectedCount:state.favorites.length, customProgramIds:created, applicationUpdates:applicationUpdates.length};
      });
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    if (name === 'add_program_to_shortlist' || name === 'remove_program_from_shortlist') {
      const id = typeof args.programId === 'string' ? args.programId : '';
      const update = await updateState(env, owner, state => {
        if (!programExists(id, state)) return {error: 'Il percorso non esiste nel catalogo o nel tuo atlante.'};
        const selected = name === 'add_program_to_shortlist';
        state.favoritesUpdated[id] = {selected, updatedAt: Date.now()};
        state.favorites = [...new Set([...state.favorites.filter(value => value !== id), ...(selected ? [id] : [])])];
        return {programId: id, selected};
      });
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    if (name === 'add_custom_program') {
      const textFields = ['name','university','city','country','degree','field','notes'];
      for (const key of textFields) if (args[key] !== undefined && (typeof args[key] !== 'string' || args[key].length > ({name:180,university:140,city:100,country:100,degree:100,field:180,notes:3000}[key]))) return failedTool(`Il campo ${key} non è valido o è troppo lungo.`);
      if (!String(args.name || '').trim() || !String(args.university || '').trim()) return failedTool('Nome del percorso e università sono obbligatori.');
      let url = '';
      if (args.url) { try {const parsed = new URL(args.url); if (parsed.protocol !== 'https:') throw Error(); url = parsed.toString().slice(0,1200);} catch {return failedTool('Il link deve essere un indirizzo HTTPS valido.');} }
      const now = Date.now(), program = {id: `custom-${crypto.randomUUID()}`, name: args.name.trim(), university: args.university.trim(), city: String(args.city || '').trim(), country: String(args.country || '').trim(), region: args.region === 'Extra-Europa' ? 'Extra-Europa' : 'Europa', degree: String(args.degree || '').trim(), field: String(args.field || '').trim(), url, notes: String(args.notes || '').trim(), createdAt: now, updatedAt: now, deletedAt: 0};
      const update = await updateState(env, owner, state => {
        if (state.customPrograms.filter(item => !item.deletedAt).length >= 100) return {error: 'Il tuo atlante contiene già il massimo di 100 percorsi personali.'};
        state.customPrograms.push(program); state.favorites.push(program.id); state.favorites = [...new Set(state.favorites)];
        state.favoritesUpdated[program.id] = {selected: true, updatedAt: now};
        return {program};
      });
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    if (name === 'update_application') {
      const id = typeof args.programId === 'string' ? args.programId : '';
      const validStages = ['', 'Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto'];
      if (args.stage !== undefined && !validStages.includes(args.stage)) return failedTool('Stato candidatura non valido.');
      if (args.deadline !== undefined && args.deadline !== '' && (!/^\d{4}-\d{2}-\d{2}$/.test(args.deadline) || Number(args.deadline.slice(0,4)) < 2020 || Number(args.deadline.slice(0,4)) > 2040)) return failedTool('La scadenza deve usare il formato YYYY-MM-DD.');
      if (args.deadlineUrl !== undefined && args.deadlineUrl !== '') { try {if (new URL(args.deadlineUrl).protocol !== 'https:') throw Error();} catch {return failedTool('Il link della scadenza deve usare HTTPS.');} }
      if (args.notes !== undefined && (typeof args.notes !== 'string' || args.notes.length > 5000)) return failedTool('Le note possono contenere al massimo 5.000 caratteri per questa modifica.');
      if (args.checklist !== undefined && (!Array.isArray(args.checklist) || args.checklist.length > 5 || args.checklist.some(i => !Number.isInteger(i) || i < 0 || i > 4))) return failedTool('Checklist non valida. Usa valori interi da 0 a 4.');
      const update = await updateState(env, owner, state => {
        if (!programExists(id, state)) return {error: 'Il percorso non esiste nel tuo atlante.'};
        const prior = state.records[id] || {stage: '', deadline: '', deadlineUrl: '', notes: '', checklist: [], updatedAt: 0};
        state.records[id] = {...prior, ...(args.stage !== undefined ? {stage: args.stage} : {}), ...(args.deadline !== undefined ? {deadline: args.deadline} : {}), ...(args.deadlineUrl !== undefined ? {deadlineUrl: args.deadlineUrl} : {}), ...(args.notes !== undefined ? {notes: args.notes} : {}), ...(args.checklist !== undefined ? {checklist: [...new Set(args.checklist)]} : {}), updatedAt: Date.now()};
        return {programId: id, record: state.records[id]};
      });
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    if (name === 'remove_custom_program') {
      const id = typeof args.programId === 'string' ? args.programId : '', now = Date.now();
      const update = await updateState(env, owner, state => {
        const item = state.customPrograms.find(program => program.id === id && !program.deletedAt);
        if (!item) return {error: 'Il percorso personale non è stato trovato.'};
        item.deletedAt = now; item.updatedAt = now;
        state.favorites = state.favorites.filter(value => value !== id); state.favoritesUpdated[id] = {selected: false, updatedAt: now};
        state.compare = state.compare.filter(value => value !== id); state.compareUpdated = now; delete state.records[id];
        return {programId: id, removed: true};
      });
      return update.error ? failedTool(update.error) : textResult(update.result);
    }
    return failedTool('Strumento MCP non riconosciuto.');
  }
  async function mcp(request, env, origin) {
    const headers = {'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type,mcp-protocol-version', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-expose-headers': 'www-authenticate,mcp-session-id', 'cache-control': 'no-store'};
    if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers});
    if (request.method !== 'POST') return json({error: 'Usa POST per le richieste MCP.'}, 405, headers);
    const auth = await getToken(request, env, origin);
    if (!auth) return json({error: 'Accesso OAuth richiesto.'}, 401, {...headers, 'www-authenticate': `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource", scope="atlas:read atlas:write"`});
    if (!hasScope(auth.scopes, 'atlas:read')) return json({error: 'Permesso atlas:read mancante.'}, 403, headers);
    let input; try {const raw = await request.text(); if (raw.length > 100000) return json({error: 'Richiesta troppo grande.'}, 413, headers); input = JSON.parse(raw);} catch {return json({error: 'JSON-RPC non valido.'}, 400, headers);}
    if (!input || input.jsonrpc !== '2.0' || typeof input.method !== 'string') return json({error: 'Richiesta JSON-RPC non valida.'}, 400, headers);
    if (input.method === 'notifications/initialized' || input.method === 'notifications/cancelled') return new Response(null, {status: 202, headers});
    const id = input.id ?? null;
    if (input.method === 'initialize') {
      const supported = ['2025-03-26', '2025-06-18', '2025-11-25'];
      const version = supported.includes(input.params?.protocolVersion) ? input.params.protocolVersion : '2025-03-26';
      return json({jsonrpc: '2.0', id, result: {protocolVersion: version, capabilities: {tools: {listChanged: false}}, serverInfo: {name: 'master-atlas', version: '1.0.0'}}}, 200, headers);
    }
    if (input.method === 'ping') return json({jsonrpc: '2.0', id, result: {}}, 200, headers);
    if (input.method === 'tools/list') return json({jsonrpc: '2.0', id, result: {tools: toolDefinitions}}, 200, headers);
    if (input.method === 'tools/call') {
      const name = input.params?.name, args = input.params?.arguments || {};
      if (!tool(name)) return json({jsonrpc: '2.0', id, error: {code: -32602, message: 'Strumento sconosciuto.'}}, 200, headers);
      try {return json({jsonrpc: '2.0', id, result: await callTool(name, args, auth, env)}, 200, headers);}
      catch {return json({jsonrpc: '2.0', id, result: failedTool('Operazione temporaneamente non disponibile. Riprova.')}, 200, headers);}
    }
    return json({jsonrpc: '2.0', id, error: {code: -32601, message: 'Metodo non supportato.'}}, 200, headers);
  }
  return {async handle(request, env) {
    const url = new URL(request.url), path = url.pathname;
    const mcpPaths = new Set(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource/mcp', '/.well-known/oauth-authorization-server', '/oauth/register', '/oauth/authorize', '/oauth/consent', '/oauth/token', '/oauth/revoke', MCP_ENDPOINT, '/api/auth/mcp/clients']);
    if (!mcpPaths.has(path)) return null;
    if (!dbReady(env)) return json({error: 'Database non disponibile.'}, 503);
    const origin = expectedOrigin(request, env);
    if (!validHost(request, env)) return json({error: 'Origine del sito non valida.'}, 421);
    if (path === '/api/auth/mcp/clients') {
      const owner = await accountAuth.resolveOwner(request, env);
      if (!owner) return json({error: 'Accesso richiesto.'}, 401);
      if (request.method === 'GET') {
        const rows = await env.DB.prepare(`SELECT c.id,c.name,MIN(t.created_at) AS connected_at FROM atlas_mcp_tokens t
          JOIN atlas_mcp_clients c ON c.id=t.client_id WHERE t.owner=? AND t.expires_at>? GROUP BY c.id,c.name ORDER BY connected_at DESC`).bind(owner, Date.now()).all();
        return json({clients: (rows.results || []).map(row => ({id: row.id, name: row.name, connectedAt: row.connected_at}))});
      }
      if (request.method !== 'DELETE') return json({error: 'Metodo non consentito.'}, 405);
      if (request.headers.get('origin') !== origin) return json({error: 'Origine non consentita.'}, 403);
      let input; try {input = await request.json()} catch {return json({error: 'Richiesta non valida.'}, 400)}
      const clientId = typeof input.clientId === 'string' ? input.clientId.slice(0,100) : '';
      if (!clientId) return json({error: 'Collegamento non valido.'}, 400);
      await env.DB.batch([
        env.DB.prepare('DELETE FROM atlas_mcp_tokens WHERE owner=? AND client_id=?').bind(owner, clientId),
        env.DB.prepare('DELETE FROM atlas_mcp_authorization_codes WHERE owner=? AND client_id=?').bind(owner, clientId),
        env.DB.prepare('DELETE FROM atlas_mcp_authorization_requests WHERE owner=? AND client_id=?').bind(owner, clientId)
      ]);
      return json({ok: true});
    }
    if (path === '/.well-known/oauth-protected-resource' || path === '/.well-known/oauth-protected-resource/mcp') return json(resourceMetadata(origin), 200, {'access-control-allow-origin': '*'});
    if (path === '/.well-known/oauth-authorization-server') return json(metadata(origin), 200, {'access-control-allow-origin': '*'});
    if (path === '/oauth/register' && request.method === 'POST') return register(request, env, origin);
    if (path === '/oauth/authorize' && request.method === 'GET') return authorize(request, env, origin);
    if (path === '/oauth/consent' && request.method === 'POST') return consent(request, env, origin);
    if (path === '/oauth/token' && request.method === 'POST') return token(request, env, origin);
    if (path === '/oauth/revoke' && request.method === 'POST') return revoke(request, env);
    if (path === MCP_ENDPOINT) return mcp(request, env, origin);
    return json({error: 'Metodo non consentito.'}, 405);
  }};
}

if (typeof module !== 'undefined' && module.exports) module.exports = {createMcpHandler};
