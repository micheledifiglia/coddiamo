const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {DatabaseSync}=require('node:sqlite');
const {createOAuthAuth}=require('../worker/oauth.mjs');

function database({oauth=true}={}){
  const db=new DatabaseSync(':memory:');
  const dir=path.join(__dirname,'../drizzle');
  for(const file of fs.readdirSync(dir).filter(file=>file.endsWith('.sql')&&(!file.startsWith('0003')||oauth)).sort())db.exec(fs.readFileSync(path.join(dir,file),'utf8'));
  const DB={
    prepare(sql){return{bind(...values){const stmt=db.prepare(sql);return{async run(){const r=stmt.run(...values);return{meta:{changes:r.changes}}},async first(){return stmt.get(...values)||null},async all(){return{results:stmt.all(...values)}}}}}},
    async batch(statements){db.exec('BEGIN');try{const out=[];for(const item of statements)out.push(await item.run());db.exec('COMMIT');return out}catch(error){db.exec('ROLLBACK');throw error}}
  };
  return{db,env:{DB,ATLAS_AUTH_MODE:'oauth',ATLAS_GOOGLE_CLIENT_ID:'google-client',ATLAS_GOOGLE_CLIENT_SECRET:'google-secret',ATLAS_GOOGLE_REDIRECT_URI:'https://atlas.test/api/auth/google/callback',ATLAS_APPLE_CLIENT_ID:'apple.service',ATLAS_APPLE_TEAM_ID:'team-id',ATLAS_APPLE_KEY_ID:'key-id',ATLAS_APPLE_PRIVATE_KEY:'not-used-in-mode-test',ATLAS_APPLE_REDIRECT_URI:'https://atlas.test/api/auth/apple/callback'}};
}
const request=(route,method='GET',body,origin='https://atlas.test')=>new Request(`https://atlas.test${route}`,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(origin?{origin}:{})},...(body?{body:JSON.stringify(body)}:{})});

test('Il servizio espone solo il modo OAuth quando Google e Apple sono entrambi configurati',async()=>{
  const{env}=database(),auth=createOAuthAuth();
  let response=await auth.handle(request('/api/auth/mode'),env);
  assert.deepEqual(await response.json(),{mode:'oauth',providers:['google','apple']});
  delete env.ATLAS_APPLE_PRIVATE_KEY;
  response=await auth.handle(request('/api/auth/mode'),env);
  assert.deepEqual(await response.json(),{mode:'unavailable',providers:['google']});
});

test('I redirect OAuth usano state casuale monouso e gli URL callback registrati',async()=>{
  const{env,db}=database(),auth=createOAuthAuth();
  const response=await auth.handle(request('/api/auth/google/start'),env);
  assert.equal(response.status,302);
  const target=new URL(response.headers.get('location'));
  assert.equal(target.origin,'https://accounts.google.com');
  assert.equal(target.searchParams.get('client_id'),'google-client');
  assert.equal(target.searchParams.get('redirect_uri'),env.ATLAS_GOOGLE_REDIRECT_URI);
  assert.equal(target.searchParams.get('response_type'),'code');
  assert.equal(target.searchParams.get('scope'),'openid email profile');
  assert.ok(target.searchParams.get('state'));
  assert.ok(target.searchParams.get('nonce'));
  assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=None/);
  const stored=db.prepare('SELECT challenge,purpose,consumed_at FROM atlas_auth_challenges WHERE id=?').get(target.searchParams.get('state'));
  assert.equal(JSON.parse(stored.challenge).nonce,target.searchParams.get('nonce'));
  assert.equal(stored.purpose,'oauth-google');
  const bad=await auth.handle(request(`/api/auth/google/callback?state=${encodeURIComponent(target.searchParams.get('state'))}&code=opaque`),env);
  assert.equal(bad.status,303);
  assert.match(bad.headers.get('location'),/auth_error=cancelled/);
});

test('Il callback Apple accetta solo POST form e rifiuta richieste cross-origin',async()=>{
  const{env}=database(),auth=createOAuthAuth();
  const invalid=await auth.handle(request('/api/auth/apple/callback','POST',{state:'x',code:'y'}),env);
  assert.equal(invalid.status,405);
  const cross=await auth.handle(request('/api/auth/logout','POST',{},'https://evil.test'),env);
  assert.equal(cross.status,403);
});

test('La migrazione autorizzata elimina account di prova e relativi dati prima del cambio identity',()=>{
  const{db}=database({oauth:false});
  db.exec("INSERT INTO atlas_accounts(id,username,created_at) VALUES('test-owner','tester','2026-01-01'); INSERT INTO atlas_states(owner,body,revision) VALUES('test-owner','{}',0); INSERT INTO atlas_history(owner,revision,body,created_at) VALUES('test-owner',0,'{}','2026-01-01');");
  db.exec(fs.readFileSync(path.join(__dirname,'../drizzle/0003_oauth_identities.sql'),'utf8'));
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_accounts').get().n,0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_states').get().n,0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_history').get().n,0);
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='atlas_identities'").get()?.name,'atlas_identities');
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='atlas_passkeys'").get(),undefined);
});

