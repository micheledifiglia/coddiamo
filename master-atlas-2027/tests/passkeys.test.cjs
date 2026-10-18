const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Core=require('../dist/core.js');
const {createHandler}=require('../worker/handler.js');
const {createPasskeyAuth}=require('../worker/passkeys.mjs');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/data.json'),'utf8'));

function database(){
  const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(':memory:');
  const dir=path.join(__dirname,'../drizzle');for(const file of fs.readdirSync(dir).filter(file=>file.endsWith('.sql')).sort())db.exec(fs.readFileSync(path.join(dir,file),'utf8'));
  const env={ATLAS_AUTH_ORIGIN:'https://atlas.test',ATLAS_RP_ID:'atlas.test',DB:{
    prepare(sql){
      return {bind(...values){
        const stmt=db.prepare(sql);
        return {
          async run(){const result=stmt.run(...values);return{meta:{changes:result.changes}};},
          async first(){return stmt.get(...values)||null;},
          async all(){return{results:stmt.all(...values)};}
        };
      }};
    },
    async batch(statements){db.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results}catch(error){db.exec('ROLLBACK');throw error}}
  }};
  return{env,db};
}
function fakeWebAuthn(){
  let number=0;
  return{
    async generateRegistrationOptions(options){assert.equal(options.authenticatorSelection.userVerification,'required');return{challenge:`reg-${++number}`,user:{id:'encoded-user'}};},
    async verifyRegistrationResponse(options){assert.equal(options.expectedOrigin,'https://atlas.test');assert.equal(options.expectedRPID,'atlas.test');assert.equal(options.requireUserVerification,true);assert.equal(options.expectedChallenge,options.response.challenge);return{verified:true,registrationInfo:{credential:{id:options.response.id,publicKey:Uint8Array.from([1,2,3]),counter:0,transports:['internal']},credentialDeviceType:'multiDevice',credentialBackedUp:true}};},
    async generateAuthenticationOptions(options){assert.equal(options.userVerification,'required');return{challenge:`auth-${++number}`,allowCredentials:options.allowCredentials};},
    async verifyAuthenticationResponse(options){assert.equal(options.expectedOrigin,'https://atlas.test');assert.equal(options.expectedRPID,'atlas.test');assert.equal(options.requireUserVerification,true);assert.equal(options.expectedChallenge,options.response.challenge);return{verified:options.response.bad!==true,authenticationInfo:{newCounter:1}};}
  };
}
function request(url,method='GET',body,cookie,origin='https://atlas.test',ip='192.0.2.20'){
  return new Request('https://atlas.test'+url,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),...(origin?{origin}:{}),'cf-connecting-ip':ip},...(body?{body:JSON.stringify(body)}:{})});
}
async function register(handle,env,username,remember){
  const optionsResponse=await handle(request('/api/auth/register/options','POST',{username}),env);
  assert.equal(optionsResponse.status,200);
  const options=await optionsResponse.json();
  const created=await handle(request('/api/auth/register/verify','POST',{flowId:options.flowId,remember,response:{id:`credential-${username}`,challenge:options.publicKey.challenge}}),env);
  return{response:created,cookie:created.headers.get('set-cookie')?.split(';')[0]};
}

test('Passkey: registrazione, sessione persistente, accesso e dati isolati per profilo',async()=>{
  const{env,db}=database();
  const auth=createPasskeyAuth(fakeWebAuthn());
  const handle=createHandler({},catalog,Core,auth);
  const alice=await register(handle,env,'alice',true);
  assert.equal(alice.response.status,201);
  assert.match(alice.response.headers.get('set-cookie'),/Max-Age=2592000/);
  const session=await handle(request('/api/auth/session','GET',undefined,alice.cookie),env);
  const sessionData=await session.json();assert.equal(sessionData.user.username,'alice');assert.match(sessionData.user.id,/^[0-9a-f-]{36}$/);
  const aliceState=await handle(request('/api/state','GET',undefined,alice.cookie),env);
  assert.equal(aliceState.status,200);
  const state=Core.normalize({records:{[catalog.legacyIds['3-1']]:{notes:'Solo Alice',updatedAt:10}}},catalog);
  assert.equal((await handle(request('/api/state','PUT',{state,revision:0},alice.cookie),env)).status,200);

  const bob=await register(handle,env,'bob',false);
  assert.equal(bob.response.status,201);
  assert.doesNotMatch(bob.response.headers.get('set-cookie'),/Max-Age=/);
  const loginOptions=await handle(request('/api/auth/login/options','POST',{username:'alice'}),env);
  const login=await loginOptions.json();
  const loginResponse=await handle(request('/api/auth/login/verify','POST',{flowId:login.flowId,remember:false,response:{id:'credential-alice',challenge:login.publicKey.challenge}},undefined),env);
  assert.equal(loginResponse.status,200);
  assert.doesNotMatch(loginResponse.headers.get('set-cookie'),/Max-Age=/);
  const bobData=await(await handle(request('/api/state','GET',undefined,bob.cookie),env)).json();
  const aliceData=await(await handle(request('/api/state','GET',undefined,alice.cookie),env)).json();
  assert.deepEqual(bobData.state.records,{});
  assert.equal(aliceData.state.records[catalog.legacyIds['3-1']].notes,'Solo Alice');
  db.close();
});

test('Password: hash salato, requisiti minimi, accesso, sessione persistente e rinomina',async()=>{
  const{env,db}=database();
  const handle=createHandler({},catalog,Core,createPasskeyAuth(fakeWebAuthn()));
  const short=await handle(request('/api/auth/password/register','POST',{username:'alice',password:'short'}),env);
  assert.equal(short.status,400);
  const created=await handle(request('/api/auth/password/register','POST',{username:'alice',password:'correct horse battery staple'}),env);
  assert.equal(created.status,201);
  assert.match(created.headers.get('set-cookie'),/Max-Age=2592000/);
  const stored=db.prepare('SELECT password_hash FROM atlas_accounts WHERE username=?').get('alice').password_hash;
  assert.match(stored,/^pbkdf2-sha256\$100000\$/);assert.ok(Number(stored.split('$')[1])<=100000,'il runtime Cloudflare rifiuta oltre 100.000 iterazioni PBKDF2');assert.notEqual(stored,'correct horse battery staple');
  const cookie=created.headers.get('set-cookie').split(';')[0];
  const wrong=await handle(request('/api/auth/password/login','POST',{username:'alice',password:'incorrect secure phrase'}),env);
  assert.equal(wrong.status,401);assert.equal((await wrong.json()).error,'Nome utente o password non corretti.');
  const login=await handle(request('/api/auth/password/login','POST',{username:'alice',password:'correct horse battery staple'}),env);
  assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/Max-Age=2592000/);
  const refreshed=await handle(request('/api/auth/session','GET',undefined,cookie),env);
  assert.equal((await refreshed.json()).user.username,'alice');assert.match(refreshed.headers.get('set-cookie'),/Max-Age=2592000/);
  const badRename=await handle(request('/api/auth/profile/rename','POST',{username:'alice_new',password:'wrong password'},cookie),env);
  assert.equal(badRename.status,401);
  const renamed=await handle(request('/api/auth/profile/rename','POST',{username:'alice_new',password:'correct horse battery staple'},cookie),env);
  assert.equal((await renamed.json()).user.username,'alice_new');
  assert.equal((await handle(request('/api/auth/password/login','POST',{username:'alice_new',password:'correct horse battery staple'}),env)).status,200);
  db.close();
});

test('Passkey: origine, challenge monouso, rate limit e logout sono verificati',async()=>{
  const{env,db}=database();
  const handle=createHandler({},catalog,Core,createPasskeyAuth(fakeWebAuthn()));
  const denied=await handle(request('/api/auth/register/options','POST',{username:'alice'},undefined,'https://evil.test'),env);
  assert.equal(denied.status,403);
  const account=await register(handle,env,'alice',false);
  const options=await handle(request('/api/auth/login/options','POST',{username:'alice'}),env);
  const login=await options.json();
  const payload={flowId:login.flowId,remember:false,response:{id:'credential-alice',challenge:login.publicKey.challenge}};
  assert.equal((await handle(request('/api/auth/login/verify','POST',payload),env)).status,200);
  assert.equal((await handle(request('/api/auth/login/verify','POST',payload),env)).status,401);
  const logout=await handle(request('/api/auth/logout','POST',{},account.cookie),env);
  assert.equal(logout.status,200);assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
  assert.equal((await handle(request('/api/auth/session','GET',undefined,account.cookie),env)).status,401);
  let last;
  for(let i=0;i<12;i++)last=await handle(request('/api/auth/login/options','POST',{username:'alice'}),env);
  assert.equal(last.status,429);
  db.close();
});

test('Passkey: il limite tentativi di un IP non blocca lo stesso profilo agli altri',async()=>{
  const{env,db}=database();
  const handle=createHandler({},catalog,Core,createPasskeyAuth(fakeWebAuthn()));
  await register(handle,env,'alice',false);
  for(let i=0;i<12;i++)assert.equal((await handle(request('/api/auth/login/options','POST',{username:'alice'},undefined,'https://atlas.test','192.0.2.30'),env)).status,200);
  assert.equal((await handle(request('/api/auth/login/options','POST',{username:'alice'},undefined,'https://atlas.test','192.0.2.30'),env)).status,429);
  assert.equal((await handle(request('/api/auth/login/options','POST',{username:'alice'},undefined,'https://atlas.test','192.0.2.31'),env)).status,200);
  db.close();
});

test('Storage browser-side: i dati locali sono separati per profilo e non migrano da una chiave condivisa',()=>{
  const entries=new Map([['master-atlas-2027-v1',JSON.stringify({records:{'3-1':{notes:'Dati non associati a un profilo'}}})]]);
  const sandbox={AtlasCore:Core,ATLAS_CONFIG:{accounts:true,cloudSync:true},AtlasAuth:{currentUser:{id:'alice'}},window:{addEventListener(){}},localStorage:{getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)},setTimeout,clearTimeout,fetch:()=>new Promise(()=>{})};
  require('node:vm').createContext(sandbox);
  require('node:vm').runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
  const store=new sandbox.Store(catalog,()=>{},()=>{});
  assert.deepEqual(store.state.records,{});
  assert.ok(entries.has('master-atlas-2027-v2:alice'));
  assert.ok(entries.has('master-atlas-2027-v1'));
});

test('Profilo: il cambio nome richiede una nuova verifica passkey e conserva account e dati',async()=>{
  const{env,db}=database();
  const handle=createHandler({},catalog,Core,createPasskeyAuth(fakeWebAuthn()));
  const alice=await register(handle,env,'alice',false);
  const aliceId=db.prepare('SELECT id FROM atlas_accounts WHERE username=?').get('alice').id;
  const bob=await register(handle,env,'bob',false);
  const before=await handle(request('/api/state','GET',undefined,alice.cookie),env);
  assert.equal(before.status,200);
  const duplicate=await handle(request('/api/auth/profile/rename/options','POST',{username:'bob'},alice.cookie),env);
  assert.equal(duplicate.status,409);
  assert.equal((await handle(request('/api/auth/profile/rename/options','POST',{username:'new_alice'},undefined),env)).status,401);

  const options=await handle(request('/api/auth/profile/rename/options','POST',{username:'new_alice'},alice.cookie),env);
  assert.equal(options.status,200);
  const flow=await options.json();
  const foreign=await handle(request('/api/auth/profile/rename/verify','POST',{flowId:flow.flowId,response:{id:'credential-bob',challenge:flow.publicKey.challenge}},alice.cookie),env);
  assert.equal(foreign.status,401);
  const replay=await handle(request('/api/auth/profile/rename/verify','POST',{flowId:flow.flowId,response:{id:'credential-alice',challenge:flow.publicKey.challenge}},alice.cookie),env);
  assert.equal(replay.status,400);
  assert.equal(db.prepare('SELECT username FROM atlas_accounts WHERE id=?').get(aliceId).username,'alice');

  const retry=await handle(request('/api/auth/profile/rename/options','POST',{username:'new_alice'},alice.cookie),env);
  const retryFlow=await retry.json();
  const renamed=await handle(request('/api/auth/profile/rename/verify','POST',{flowId:retryFlow.flowId,response:{id:'credential-alice',challenge:retryFlow.publicKey.challenge}},alice.cookie),env);
  assert.equal(renamed.status,200);
  assert.equal((await renamed.json()).user.username,'new_alice');
  assert.equal((await handle(request('/api/auth/login/options','POST',{username:'new_alice'}),env)).status,200);
  assert.equal((await handle(request('/api/auth/login/options','POST',{username:'alice'}),env)).status,401);
  assert.equal((await handle(request('/api/state','GET',undefined,alice.cookie),env)).status,200);
  assert.equal((await handle(request('/api/state','GET',undefined,bob.cookie),env)).status,200);
  db.close();
});

test('Profilo: eliminazione richiede la password e cancella solo i dati dell’account',async()=>{
  const{env,db}=database();
  const handle=createHandler({},catalog,Core,createPasskeyAuth(fakeWebAuthn()));
  const create=async(username,password)=>{const response=await handle(request('/api/auth/password/register','POST',{username,password}),env);return{response,cookie:response.headers.get('set-cookie')?.split(';')[0]};};
  const alice=await create('alice','correct horse battery staple');
  const bob=await create('bob','another secure phrase');
  assert.equal(alice.response.status,201);assert.equal(bob.response.status,201);
  const aliceId=db.prepare('SELECT id FROM atlas_accounts WHERE username=?').get('alice').id;
  db.prepare('INSERT INTO atlas_history(owner,revision,body,created_at) VALUES(?,?,?,?)').run(aliceId,1,'{}','2026-01-01T00:00:00.000Z');
  assert.equal((await handle(request('/api/auth/profile/delete','POST',{confirm:'wrong',password:'correct horse battery staple'},alice.cookie),env)).status,400);
  assert.equal((await handle(request('/api/auth/profile/delete','POST',{confirm:'ELIMINA',password:'incorrect password'},alice.cookie),env)).status,401);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_accounts WHERE id=?').get(aliceId).n,1);
  const deleted=await handle(request('/api/auth/profile/delete','POST',{confirm:'ELIMINA',password:'correct horse battery staple'},alice.cookie),env);
  assert.equal(deleted.status,200);
  assert.match(deleted.headers.get('set-cookie'),/Max-Age=0/);
  for(const table of ['atlas_accounts','atlas_states','atlas_history','atlas_sessions','atlas_passkeys','atlas_auth_challenges','atlas_mcp_tokens','atlas_mcp_authorization_codes','atlas_mcp_authorization_requests']){
    const column=table==='atlas_accounts'?'id':'owner';
    assert.equal(db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ${column}=?`).get(aliceId).n,0,table);
  }
  assert.equal((await handle(request('/api/auth/session','GET',undefined,alice.cookie),env)).status,401);
  assert.equal((await handle(request('/api/state','GET',undefined,bob.cookie),env)).status,200);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM atlas_accounts WHERE id=?').get(db.prepare('SELECT id FROM atlas_accounts WHERE username=?').get('bob').id).n,1);
  db.close();
});
