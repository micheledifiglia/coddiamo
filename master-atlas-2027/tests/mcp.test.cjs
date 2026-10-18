const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {DatabaseSync}=require('node:sqlite');
const Core=require('../dist/core.js');
const {createHandler}=require('../worker/handler.js');
const {createMcpHandler}=require('../worker/mcp.js');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/data.json'),'utf8'));

function database(){
  const db=new DatabaseSync(':memory:');
  const dir=path.join(__dirname,'../drizzle');
  for(const file of fs.readdirSync(dir).filter(file=>file.endsWith('.sql')).sort())db.exec(fs.readFileSync(path.join(dir,file),'utf8'));
  const env={ATLAS_AUTH_ORIGIN:'https://atlas.test',DB:{
    prepare(sql){return{bind(...values){const stmt=db.prepare(sql);return{
      async run(){const result=stmt.run(...values);return{meta:{changes:result.changes}}},
      async first(){return stmt.get(...values)||null},
      async all(){return{results:stmt.all(...values)}}
    }}}},
    async batch(statements){db.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results}catch(error){db.exec('ROLLBACK');throw error}}
  }};
  return{db,env};
}
function request(route,{method='GET',body,contentType='application/json',cookie='',origin='https://atlas.test',headers={}}={}){
  return new Request(`https://atlas.test${route}`,{method,headers:{...(body!==undefined?{'content-type':contentType}:{}),...(cookie?{cookie}:{}),...(origin?{origin}:{}),...headers},...(body!==undefined?{body:typeof body==='string'?body:JSON.stringify(body)}:{})});
}
function b64url(bytes){return Buffer.from(bytes).toString('base64url')}
async function pkce(){const verifier=b64url(crypto.getRandomValues(new Uint8Array(32)));const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));return{verifier,challenge:b64url(digest)}}

test('OAuth MCP: PKCE, consenso, modifica atomica per account, isolamento e revoca',async()=>{
  const{db,env}=database();
  const alice='alice-owner',bob='bob-owner';
  db.prepare('INSERT INTO atlas_accounts(id,username,created_at) VALUES(?,?,?)').run(alice,'alice','2026-01-01');
  db.prepare('INSERT INTO atlas_accounts(id,username,created_at) VALUES(?,?,?)').run(bob,'bob','2026-01-01');
  const auth={async resolveOwner(req){const cookie=req.headers.get('cookie')||'';return cookie.includes('session=alice')?alice:cookie.includes('session=bob')?bob:null}};
  const mcp=createMcpHandler(auth,Core,catalog),handle=createHandler({},catalog,Core,auth,mcp);
  const discovery=await handle(request('/.well-known/oauth-authorization-server'),env);
  assert.equal(discovery.status,200);const oauthMetadata=await discovery.json();assert.equal(oauthMetadata.issuer,'https://atlas.test');assert.equal(oauthMetadata.authorization_endpoint,'https://atlas.test/oauth/authorize');assert.ok(oauthMetadata.authorization_response_iss_parameter_supported);assert.ok(oauthMetadata.code_challenge_methods_supported.includes('S256'));
  const resource=await handle(request('/.well-known/oauth-protected-resource'),env);
  const resourceMetadata=await resource.json();assert.equal(resourceMetadata.resource,'https://atlas.test/api/atlas-mcp');assert.deepEqual(resourceMetadata.authorization_servers,[oauthMetadata.issuer]);
  const unauth=await handle(request('/api/atlas-mcp',{method:'POST',body:{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25'}}}),env);
  assert.equal(unauth.status,401);assert.match(unauth.headers.get('www-authenticate'),/oauth-protected-resource/);

  const registered=await handle(request('/oauth/register',{method:'POST',body:{client_name:'Assistente test',redirect_uris:['https://ai.example/callback']}}),env);
  assert.equal(registered.status,201);const client=await registered.json();
  const {verifier,challenge}=await pkce();
  const query=new URLSearchParams({response_type:'code',client_id:client.client_id,redirect_uri:'https://ai.example/callback',state:'stato-casuale',code_challenge:challenge,code_challenge_method:'S256',scope:'atlas:read atlas:write offline_access',resource:'https://atlas.test/api/atlas-mcp'});
  const authorization=await handle(request('/oauth/authorize?'+query,{cookie:'session=alice'}),env);
  assert.equal(authorization.status,200);const page=await authorization.text();
  assert.match(page,/ai\.example/);assert.match(page,/Modificare il mio atlante/);assert.match(page,/consent-form/);assert.match(page,/dataset\.submitting/);assert.match(page,/target="_top"/,'il callback OAuth deve raggiungere la finestra principale del client');
  let submitHandler,restartHandler,recovery,reloaded=false;const deny={value:'deny',disabled:false,style:{},setAttribute(){},removeAttribute(){}};const approve={value:'approve',disabled:false,style:{},textContent:'Consenti',setAttribute(){},removeAttribute(){}};const buttons=[deny,approve],status={textContent:''},restart={hidden:true,addEventListener(type,handler){assert.equal(type,'click');restartHandler=handler}};
  const consentForm={dataset:{},isConnected:true,addEventListener(type,handler){assert.equal(type,'submit');submitHandler=handler},querySelectorAll(){return buttons}};
  const document={querySelector(selector){return selector==='#consent-form'?consentForm:selector==='#consent-status'?status:restart}};
  vm.runInNewContext(page.match(/<script>([\s\S]*?)<\/script>/)[1],{document,location:{reload(){reloaded=true}},setTimeout(callback,delay){assert.equal(delay,15000);recovery=callback}});
  let duplicateBlocked=false;submitHandler({submitter:approve,preventDefault(){duplicateBlocked=true}});
  assert.equal(approve.disabled,false,'il pulsante approvato deve restare nel modulo inviato');assert.equal(deny.disabled,true);assert.equal(approve.style.pointerEvents,'none');assert.match(status.textContent,/riportando all’assistente/);
  submitHandler({submitter:approve,preventDefault(){duplicateBlocked=true}});assert.equal(duplicateBlocked,true,'un secondo invio deve essere fermato');
  recovery();assert.equal(approve.disabled,false);assert.equal(deny.disabled,false);assert.equal(restart.hidden,false);assert.match(status.textContent,/ritorno all’assistente non è riuscito/,'se il client non torna, la pagina deve offrire un recupero visibile');restartHandler();assert.equal(reloaded,true);
  const requestId=page.match(/name="request_id" value="([^"]+)"/)?.[1];assert.ok(requestId);
  const form=new URLSearchParams({request_id:requestId,read:'1',write:'1',offline:'1',decision:'approve'});
  const consent=await handle(request('/oauth/consent',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:form.toString()}),env);
  assert.equal(consent.status,303);const consentTarget=new URL(consent.headers.get('location'));const authorizationCode=consentTarget.searchParams.get('code');assert.ok(authorizationCode);assert.equal(consentTarget.origin,'https://ai.example');assert.equal(consentTarget.pathname,'/callback');assert.equal(consentTarget.searchParams.get('state'),'stato-casuale');assert.equal(consentTarget.searchParams.get('iss'),oauthMetadata.issuer);assert.equal(consentTarget.searchParams.get('error'),null);
  const duplicateConsent=await handle(request('/oauth/consent',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:form.toString()}),env);
  assert.equal(duplicateConsent.status,400);assert.match(await duplicateConsent.text(),/Questo consenso è già stato inviato/);
  const tokenForm=new URLSearchParams({grant_type:'authorization_code',client_id:client.client_id,code:authorizationCode,redirect_uri:'https://ai.example/callback',code_verifier:verifier,resource:'https://atlas.test/api/atlas-mcp'});
  const tokenResponse=await handle(request('/oauth/token',{method:'POST',contentType:'application/x-www-form-urlencoded',body:tokenForm.toString()}),env);
  assert.equal(tokenResponse.status,200);const tokens=await tokenResponse.json();assert.ok(tokens.refresh_token);assert.equal(tokens.token_type,'Bearer');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM atlas_mcp_tokens WHERE owner=? AND token_hash=?').get(alice,tokens.access_token).n,0,'il token viene archiviato solo come hash');

  const mcpRequest=async(payload,cookieToken=tokens.access_token)=>handle(request('/api/atlas-mcp',{method:'POST',body:payload,headers:{authorization:`Bearer ${cookieToken}`}}),env);
  const listed=await mcpRequest({jsonrpc:'2.0',id:2,method:'tools/list',params:{}});
  assert.equal(listed.status,200);const tools=(await listed.json()).result.tools.map(tool=>tool.name);
  assert.ok(tools.includes('apply_atlas_plan'));assert.ok(tools.includes('add_custom_program'));
  const programId=catalog.programs[0].id;
  const applied=await mcpRequest({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'apply_atlas_plan',arguments:{preferences:'Neuroscienze e ricerca sperimentale',addProgramIds:[programId],compareProgramIds:[programId],customProgramsToAdd:[{name:'Master di prova',university:'Università personale',city:'Perugia',country:'Italia',region:'Europa',notes:'Da verificare'},],applicationUpdates:[{programId,stage:'In preparazione',deadline:'2027-06-15',notes:'Preparare il dossier'}]}}});
  assert.equal(applied.status,200);const appliedResult=await applied.json();assert.equal(appliedResult.result?.structuredContent?.updated,true,JSON.stringify(appliedResult));
  const aliceState=Core.normalize(JSON.parse(db.prepare('SELECT body FROM atlas_states WHERE owner=?').get(alice).body),catalog);
  assert.equal(aliceState.preferences,'Neuroscienze e ricerca sperimentale');assert.ok(aliceState.favorites.includes(programId));assert.equal(aliceState.compare[0],programId);assert.equal(aliceState.customPrograms[0].university,'Università personale');assert.equal(aliceState.records[programId].deadline,'2027-06-15');
  const bobState=await handle(request('/api/state',{cookie:'session=bob'}),env);
  assert.deepEqual((await bobState.json()).state,Core.empty());
  const visible=await mcpRequest({jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'get_my_atlas',arguments:{}}});
  const atlas=(await visible.json()).result.structuredContent;assert.equal(atlas.selected[0].id,programId);assert.equal(atlas.compare[0].id,programId);assert.equal(atlas.customPrograms[0].university,'Università personale');

  const clients=await handle(request('/api/auth/mcp/clients',{cookie:'session=alice'}),env);
  assert.equal((await clients.json()).clients.length,1);
  const revoked=await handle(request('/api/auth/mcp/clients',{method:'DELETE',cookie:'session=alice',body:{clientId:client.client_id}}),env);
  assert.equal(revoked.status,200);
  const denied=await mcpRequest({jsonrpc:'2.0',id:5,method:'tools/list',params:{}});
  assert.equal(denied.status,401);

  const secondPkce=await pkce(),secondQuery=new URLSearchParams({response_type:'code',client_id:client.client_id,redirect_uri:'https://ai.example/callback',state:'stato-annullato',code_challenge:secondPkce.challenge,code_challenge_method:'S256',scope:'atlas:read atlas:write',resource:'https://atlas.test/api/atlas-mcp'});
  const secondAuthorization=await handle(request('/oauth/authorize?'+secondQuery,{cookie:'session=alice'}),env),secondPage=await secondAuthorization.text(),secondRequestId=secondPage.match(/name="request_id" value="([^"]+)"/)?.[1];assert.ok(secondRequestId);
  const cancellation=await handle(request('/oauth/consent',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:secondRequestId,decision:'deny'}).toString()}),env);
  assert.equal(cancellation.status,303);const deniedTarget=new URL(cancellation.headers.get('location'));assert.equal(deniedTarget.searchParams.get('error'),'access_denied');assert.equal(deniedTarget.searchParams.get('state'),'stato-annullato');assert.equal(deniedTarget.searchParams.get('iss'),oauthMetadata.issuer);assert.equal(deniedTarget.searchParams.get('code'),null);
  db.close();
});

test('MCP non accetta redirect non HTTPS o consenso da un’altra origine',async()=>{
  const{db,env}=database();const auth={async resolveOwner(){return 'owner'}};const handle=createHandler({},catalog,Core,auth,createMcpHandler(auth,Core,catalog));
  const bad=await handle(request('/oauth/register',{method:'POST',body:{redirect_uris:['http://evil.example/callback']}}),env);assert.equal(bad.status,400);
  const crossSite=await handle(request('/oauth/consent',{method:'POST',origin:'https://evil.example',contentType:'application/x-www-form-urlencoded',body:'request_id=bad&decision=approve'}),env);assert.equal(crossSite.status,403);
  db.close();
});

test('MCP limita a 20 per IP i tentativi di scambio token non validi',async()=>{
  const{db,env}=database();const auth={async resolveOwner(){return null}};const handle=createHandler({},catalog,Core,auth,createMcpHandler(auth,Core,catalog));
  const body=new URLSearchParams({grant_type:'authorization_code',client_id:'client-inesistente',code:'codice-inesistente',redirect_uri:'https://ai.example/callback',code_verifier:'a'.repeat(43),resource:'https://atlas.test/api/atlas-mcp'}).toString();
  const statuses=[];
  for(let i=0;i<21;i++){
    const response=await handle(request('/oauth/token',{method:'POST',contentType:'application/x-www-form-urlencoded',body,headers:{'cf-connecting-ip':'203.0.113.50'}}),env);
    statuses.push(response.status);
    if(i===20)assert.equal(response.headers.get('access-control-allow-origin'),'*');
  }
  assert.deepEqual(statuses,[...Array(20).fill(401),429]);
  db.close();
});

test('MCP Sites dichiara gli strumenti e li collega al solo profilo verificato',async()=>{
  const{db,env}=database(),alice='alice-owner';
  db.prepare('INSERT INTO atlas_accounts(id,username,created_at) VALUES(?,?,?)').run(alice,'alice','2026-01-01');
  const auth={async resolveOwner(req){return(req.headers.get('cookie')||'').includes('session=alice')?alice:null}};
  const handle=createHandler({},catalog,Core,auth,createMcpHandler(auth,Core,catalog));
  const discover=await handle(request('/mcp',{method:'POST',body:{jsonrpc:'2.0',id:1,method:'server/discover'}}),env);
  assert.deepEqual((await discover.json()).result.supportedVersions,['2026-07-28']);
  const listed=await handle(request('/mcp',{method:'POST',body:{jsonrpc:'2.0',id:2,method:'tools/list'}}),env);
  const tools=(await listed.json()).result.tools.map(item=>item.name);
  assert.ok(tools.includes('get_my_atlas'));assert.ok(tools.includes('apply_atlas_plan'));assert.ok(tools.includes('link_my_atlas_profile'));

  const deniedCode=await handle(request('/api/auth/mcp/site-link-code',{method:'POST'}),env);assert.equal(deniedCode.status,401);
  const crossOrigin=await handle(request('/api/auth/mcp/site-link-code',{method:'POST',cookie:'session=alice',origin:'https://evil.example'}),env);assert.equal(crossOrigin.status,403);
  const codeResponse=await handle(request('/api/auth/mcp/site-link-code',{method:'POST',cookie:'session=alice'}),env);
  assert.equal(codeResponse.status,200);const{code,expiresAt}=await codeResponse.json();assert.match(code,/^[A-Za-z0-9_-]{12}$/);assert.ok(expiresAt>Date.now());
  const stored=db.prepare("SELECT challenge,expires_at FROM atlas_auth_challenges WHERE purpose='sites-mcp-link'").get();
  assert.notEqual(stored.challenge,code);assert.ok(stored.expires_at>Date.now());

  const siteRequest=(name,args,siteId='chatgpt-user-alice')=>handle(request('/mcp',{method:'POST',headers:{'oai-authenticated-user-id':siteId},body:{jsonrpc:'2.0',id:3,method:'tools/call',params:{name,arguments:args}}}),env);
  const unlinked=await siteRequest('get_my_atlas',{});assert.match(JSON.stringify((await unlinked.json()).result),/Profilo non collegato/);
  const linked=await siteRequest('link_my_atlas_profile',{code});assert.equal((await linked.json()).result.structuredContent.linked,true);
  const replay=await siteRequest('link_my_atlas_profile',{code});assert.match(JSON.stringify((await replay.json()).result),/scaduto o già utilizzato/);
  assert.equal(db.prepare("SELECT owner FROM atlas_identities WHERE provider='sites-mcp' AND subject=?").get('chatgpt-user-alice').owner,alice);

  const programId=catalog.programs[0].id;
  const updated=await siteRequest('add_program_to_shortlist',{programId});assert.equal((await updated.json()).result.structuredContent.selected,true);
  const accountState=await handle(request('/api/state',{cookie:'session=alice'}),env);
  assert.ok((await accountState.json()).state.favorites.includes(programId),'l’app ChatGPT modifica lo stesso profilo autenticato sul sito');
  const otherUser=await siteRequest('get_my_atlas',{},'chatgpt-user-bob');assert.match(JSON.stringify((await otherUser.json()).result),/Profilo non collegato/);
  db.close();
});
