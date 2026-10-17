const SESSION_COOKIE = '__Host-atlas_session';
const SESSION_LIFETIME = 12 * 60 * 60 * 1000;
const REMEMBER_LIFETIME = 30 * 24 * 60 * 60 * 1000;
const CHALLENGE_LIFETIME = 5 * 60 * 1000;
const text = value => new TextEncoder().encode(value);
const toBase64url = value => {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};
const fromBase64url = value => Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
const randomToken = (size=32) => {const bytes=new Uint8Array(size);crypto.getRandomValues(bytes);return toBase64url(bytes);};
const digest = async value => toBase64url(await crypto.subtle.digest('SHA-256',text(value)));
const cookie = (name,value,age) => `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict${age===undefined?'':`; Max-Age=${age}`}`;
const clearCookie = name => `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
const getCookie = (request,name) => (request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||'';
const json = (body,status=200,headers={}) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}});

export function createPasskeyAuth(webauthn) {
  async function config(env,request) {
    const origin=env.ATLAS_AUTH_ORIGIN, rpID=env.ATLAS_RP_ID;
    if(!origin||!rpID||new URL(origin).origin!==origin||new URL(origin).hostname!==rpID||origin!==new URL(request.url).origin)throw Error('Passkey origin is not configured for this Site');
    return {origin,rpID};
  }
  function requireOrigin(request) {
    if(request.headers.get('origin')!==new URL(request.url).origin)throw Error('Request origin rejected');
  }
  async function body(request) {
    if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw Error('JSON required');
    const raw=await request.text();
    if(raw.length>64000)throw Error('Request too large');
    try{return JSON.parse(raw)}catch{throw Error('Invalid JSON')}
  }
  async function rate(request,env,scope,subject,limit=20) {
    const now=Date.now(), window=15*60*1000;
    const ip=request.headers.get('cf-connecting-ip')||'unavailable';
    const key=await digest(`${scope}\0${subject}\0${ip}`);
    const row=await env.DB.prepare(`INSERT INTO atlas_auth_rate_limits(key,window_start,attempts) VALUES(?,?,1)
      ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<=? THEN 1 ELSE attempts+1 END,
      window_start=CASE WHEN window_start<=? THEN ? ELSE window_start END RETURNING attempts`)
      .bind(key,now,now-window,now-window,now).first();
    return (row?.attempts||limit+1)<=limit;
  }
  async function issueSession(env,user,persistent) {
    const token=randomToken(), now=Date.now(), lifetime=persistent?REMEMBER_LIFETIME:SESSION_LIFETIME;
    const tokenHash=await digest(token);
    await env.DB.prepare('INSERT INTO atlas_sessions(token_hash,owner,persistent,created_at,expires_at) VALUES(?,?,?,?,?)')
      .bind(tokenHash,user.id,persistent?1:0,now,now+lifetime).run();
    return {header:cookie(SESSION_COOKIE,token,persistent?Math.floor(lifetime/1000):undefined),user:{id:user.id,username:user.username}};
  }
  async function session(request,env) {
    const token=getCookie(request,SESSION_COOKIE);
    if(!token||token.length>128)return null;
    const tokenHash=await digest(token), now=Date.now();
    const row=await env.DB.prepare(`SELECT a.id,a.username,s.expires_at FROM atlas_sessions s JOIN atlas_accounts a ON a.id=s.owner WHERE s.token_hash=? AND s.expires_at>?`)
      .bind(tokenHash,now).first();
    return row?{id:row.id,username:row.username}:null;
  }
  async function saveChallenge(env,challenge,purpose,owner=null,username=null) {
    const id=randomToken(24), expiresAt=Date.now()+CHALLENGE_LIFETIME;
    await env.DB.prepare('INSERT INTO atlas_auth_challenges(id,challenge,purpose,owner,username,expires_at) VALUES(?,?,?,?,?,?)')
      .bind(id,challenge,purpose,owner,username,expiresAt).run();
    return {id,expiresAt};
  }
  async function consumeChallenge(env,id,purpose) {
    if(typeof id!=='string'||id.length>80)return null;
    return env.DB.prepare(`UPDATE atlas_auth_challenges SET consumed_at=? WHERE id=? AND purpose=? AND consumed_at IS NULL AND expires_at>? RETURNING challenge,owner,username`)
      .bind(Date.now(),id,purpose,Date.now()).first();
  }
  async function cleanup(env) {
    const now=Date.now();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM atlas_auth_challenges WHERE expires_at<?').bind(now),
      env.DB.prepare('DELETE FROM atlas_sessions WHERE expires_at<?').bind(now),
      env.DB.prepare('DELETE FROM atlas_auth_rate_limits WHERE window_start<?').bind(now-24*60*60*1000)
    ]);
  }
  async function handle(request,env) {
    const url=new URL(request.url), route=url.pathname;
    if(!route.startsWith('/api/auth/'))return null;
    if(!env.DB)return json({error:'Servizio non disponibile'},503);
    try {
      if(route==='/api/auth/session'&&request.method==='GET'){
        const user=await session(request,env);
        return user?json({user}):json({error:'Accesso richiesto'},401);
      }
      if(request.method!=='POST')return json({error:'Metodo non consentito'},405);
      requireOrigin(request);
      if(route==='/api/auth/logout'){
        const token=getCookie(request,SESSION_COOKIE);
        if(token)await env.DB.prepare('DELETE FROM atlas_sessions WHERE token_hash=?').bind(await digest(token)).run();
        return json({ok:true},200,{'set-cookie':clearCookie(SESSION_COOKIE)});
      }
      const input=await body(request), authConfig=await config(env,request);
      if(route==='/api/auth/register/options'){
        const username=String(input.username||'').trim().toLowerCase();
        if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username))return json({error:'Scegli un nome utente di 3–32 caratteri: lettere, numeri, punto, trattino o underscore.'},400);
        if(!await rate(request,env,'register',username,8)||!await rate(request,env,'register-ip','all',20))return json({error:'Troppi tentativi. Riprova tra 15 minuti.'},429);
        await cleanup(env);
        const existing=await env.DB.prepare('SELECT id FROM atlas_accounts WHERE username=?').bind(username).first();
        if(existing)return json({error:'Questo nome utente è già in uso.'},409);
        const userID=crypto.randomUUID();
        const options=await webauthn.generateRegistrationOptions({rpName:'Master Atlas 2027',rpID:authConfig.rpID,userID:text(userID),userName:username,userDisplayName:username,attestationType:'none',authenticatorSelection:{residentKey:'required',userVerification:'required'}});
        const flow=await saveChallenge(env,options.challenge,'register',userID,username);
        return json({flowId:flow.id,publicKey:options});
      }
      if(route==='/api/auth/register/verify'){
        const flow=await consumeChallenge(env,input.flowId,'register');
        if(!flow?.owner||!flow.username)return json({error:'Richiesta di registrazione scaduta. Riprova.'},400);
        let verification;
        try{verification=await webauthn.verifyRegistrationResponse({response:input.response,expectedChallenge:flow.challenge,expectedOrigin:authConfig.origin,expectedRPID:authConfig.rpID,requireUserVerification:true});}
        catch{return json({error:'Il passkey non è stato verificato. Riprova la registrazione.'},400);}
        if(!verification.verified||!verification.registrationInfo)return json({error:'Il passkey non è stato verificato.'},400);
        const info=verification.registrationInfo, credential=info.credential, now=new Date().toISOString();
        try{
          await env.DB.batch([
            env.DB.prepare('INSERT INTO atlas_accounts(id,username,created_at,last_login_at) VALUES(?,?,?,?)').bind(flow.owner,flow.username,now,now),
            env.DB.prepare('INSERT INTO atlas_passkeys(credential_id,owner,public_key,counter,transports,device_type,backed_up,created_at) VALUES(?,?,?,?,?,?,?,?)')
              .bind(credential.id,flow.owner,toBase64url(credential.publicKey),credential.counter,JSON.stringify(credential.transports||[]),info.credentialDeviceType,info.credentialBackedUp?1:0,now),
            env.DB.prepare('INSERT INTO atlas_states(owner,body,revision) VALUES(?,?,0)').bind(flow.owner,JSON.stringify(globalThis.AtlasCore.empty()))
          ]);
        }catch{return json({error:'Non è stato possibile creare il profilo. Il nome potrebbe essere già in uso.'},409);}
        const issued=await issueSession(env,{id:flow.owner,username:flow.username},input.remember===true);
        return json({user:issued.user},201,{'set-cookie':issued.header});
      }
      if(route==='/api/auth/login/options'){
        const username=String(input.username||'').trim().toLowerCase();
        if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username))return json({error:'Inserisci il nome utente del profilo.'},400);
        if(!await rate(request,env,'login',username,12)||!await rate(request,env,'login-ip','all',60))return json({error:'Troppi tentativi. Riprova tra 15 minuti.'},429);
        await cleanup(env);
        const user=await env.DB.prepare('SELECT id,username FROM atlas_accounts WHERE username=?').bind(username).first();
        if(!user)return json({error:'Profilo o passkey non riconosciuto.'},401);
        const rows=await env.DB.prepare('SELECT credential_id,transports FROM atlas_passkeys WHERE owner=?').bind(user.id).all();
        if(!rows.results.length)return json({error:'Profilo o passkey non riconosciuto.'},401);
        const options=await webauthn.generateAuthenticationOptions({rpID:authConfig.rpID,allowCredentials:rows.results.map(row=>({id:row.credential_id,transports:JSON.parse(row.transports)})),userVerification:'required'});
        const flow=await saveChallenge(env,options.challenge,'login',user.id,user.username);
        return json({flowId:flow.id,publicKey:options});
      }
      if(route==='/api/auth/login/verify'){
        const flow=await consumeChallenge(env,input.flowId,'login');
        if(!flow?.owner)return json({error:'Profilo o passkey non riconosciuto.'},401);
        const credentialId=String(input.response?.id||'');
        const row=await env.DB.prepare('SELECT credential_id,public_key,counter,transports FROM atlas_passkeys WHERE credential_id=? AND owner=?').bind(credentialId,flow.owner).first();
        if(!row)return json({error:'Profilo o passkey non riconosciuto.'},401);
        let verification;
        try{verification=await webauthn.verifyAuthenticationResponse({response:input.response,expectedChallenge:flow.challenge,expectedOrigin:authConfig.origin,expectedRPID:authConfig.rpID,requireUserVerification:true,credential:{id:row.credential_id,publicKey:fromBase64url(row.public_key),counter:row.counter,transports:JSON.parse(row.transports)}});}
        catch{return json({error:'Profilo o passkey non riconosciuto.'},401);}
        if(!verification.verified)return json({error:'Profilo o passkey non riconosciuto.'},401);
        const user=await env.DB.prepare('SELECT id,username FROM atlas_accounts WHERE id=?').bind(flow.owner).first();
        if(!user)return json({error:'Profilo o passkey non riconosciuto.'},401);
        await env.DB.batch([
          env.DB.prepare('UPDATE atlas_passkeys SET counter=? WHERE credential_id=? AND owner=?').bind(verification.authenticationInfo.newCounter,row.credential_id,flow.owner),
          env.DB.prepare('UPDATE atlas_accounts SET last_login_at=? WHERE id=?').bind(new Date().toISOString(),flow.owner)
        ]);
        const issued=await issueSession(env,user,input.remember===true);
        return json({user:issued.user},200,{'set-cookie':issued.header});
      }
      if(route==='/api/auth/passkeys/options'){
        const user=await session(request,env);
        if(!user)return json({error:'Accedi per aggiungere un passkey.'},401);
        const rows=await env.DB.prepare('SELECT credential_id,transports FROM atlas_passkeys WHERE owner=?').bind(user.id).all();
        if(rows.results.length>=5)return json({error:'Hai già raggiunto il limite di cinque passkey.'},409);
        const options=await webauthn.generateRegistrationOptions({rpName:'Master Atlas 2027',rpID:authConfig.rpID,userID:text(user.id),userName:user.username,userDisplayName:user.username,attestationType:'none',excludeCredentials:rows.results.map(row=>({id:row.credential_id,transports:JSON.parse(row.transports)})),authenticatorSelection:{residentKey:'required',userVerification:'required'}});
        const flow=await saveChallenge(env,options.challenge,'add-passkey',user.id,user.username);
        return json({flowId:flow.id,publicKey:options});
      }
      if(route==='/api/auth/passkeys/verify'){
        const user=await session(request,env);
        if(!user)return json({error:'Accedi per aggiungere un passkey.'},401);
        const flow=await consumeChallenge(env,input.flowId,'add-passkey');
        if(!flow||flow.owner!==user.id)return json({error:'Richiesta scaduta. Riprova.'},400);
        const count=await env.DB.prepare('SELECT COUNT(*) AS count FROM atlas_passkeys WHERE owner=?').bind(user.id).first();
        if(count.count>=5)return json({error:'Hai già raggiunto il limite di cinque passkey.'},409);
        let verification;
        try{verification=await webauthn.verifyRegistrationResponse({response:input.response,expectedChallenge:flow.challenge,expectedOrigin:authConfig.origin,expectedRPID:authConfig.rpID,requireUserVerification:true});}
        catch{return json({error:'Il passkey non è stato verificato. Riprova.'},400);}
        if(!verification.verified||!verification.registrationInfo)return json({error:'Il passkey non è stato verificato.'},400);
        const info=verification.registrationInfo, credential=info.credential;
        try{await env.DB.prepare('INSERT INTO atlas_passkeys(credential_id,owner,public_key,counter,transports,device_type,backed_up,created_at) VALUES(?,?,?,?,?,?,?,?)')
          .bind(credential.id,user.id,toBase64url(credential.publicKey),credential.counter,JSON.stringify(credential.transports||[]),info.credentialDeviceType,info.credentialBackedUp?1:0,new Date().toISOString()).run();}
        catch{return json({error:'Questo passkey è già collegato a un profilo.'},409);}
        return json({ok:true});
      }
      return json({error:'Endpoint non trovato'},404);
    }catch(error){
      const status=error.message==='Request origin rejected'?403:error.message==='Passkey origin is not configured for this Site'?503:400;
      return json({error:status===403?'Origine non consentita':status===503?'Autenticazione non configurata':'Richiesta non valida'},status);
    }
  }
  return {
    handle,
    async resolveOwner(request,env){
      try{return (await session(request,env))?.id||null;}catch{return null;}
    }
  };
}
