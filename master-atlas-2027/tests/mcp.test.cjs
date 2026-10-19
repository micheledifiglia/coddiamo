const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {DatabaseSync}=require('node:sqlite');
const Core=require('../dist/core.js');
const {createHandler}=require('../worker/handler.js');
const {createMcpHandler}=require('../worker/mcp.js');
const catalog={legacyIds:{},retiredProgramIds:[],programs:[{id:'p-example-002',name:'Secondo percorso di prova',university:'Ateneo di prova',city:'Città di prova',region:'Europa',type:'M',conditions:'—',notes:[],partners:['Ateneo di prova']},{id:'p-example-001',name:'Percorso di prova',university:'Ateneo di prova',city:'Città di prova',region:'Europa',type:'M',conditions:'—',notes:[],partners:['Ateneo di prova']}],universities:[{id:'u-example-001',name:'Ateneo di prova',city:'Città di prova',region:'Europa',offer:'',custom:false}]};

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
  const pathResource=await handle(request('/.well-known/oauth-protected-resource/api/atlas-mcp'),env);
  assert.equal(pathResource.status,200,'RFC 9728 richiede i metadati nel percorso derivato dalla risorsa MCP');
  const pathResourceMetadata=await pathResource.json();assert.equal(pathResourceMetadata.resource,'https://atlas.test/api/atlas-mcp');assert.deepEqual(pathResourceMetadata.authorization_servers,[oauthMetadata.issuer]);
  const unauth=await handle(request('/api/atlas-mcp',{method:'POST',body:{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25'}}}),env);
  assert.equal(unauth.status,401);assert.equal(unauth.headers.get('www-authenticate'),'Bearer resource_metadata="https://atlas.test/.well-known/oauth-protected-resource/api/atlas-mcp", scope="atlas:read atlas:write"');

  const registered=await handle(request('/oauth/register',{method:'POST',body:{client_name:'Assistente test',redirect_uris:['https://ai.example/callback']}}),env);
  assert.equal(registered.status,201);const client=await registered.json();
  const {verifier,challenge}=await pkce();
  const query=new URLSearchParams({response_type:'code',client_id:client.client_id,redirect_uri:'https://ai.example/callback',state:'stato-casuale',code_challenge:challenge,code_challenge_method:'S256',scope:'atlas:read atlas:write offline_access',resource:'https://atlas.test/api/atlas-mcp'});
  const loginResponse=await handle(request('/oauth/authorize?'+query),env),loginHtml=await loginResponse.text();
  assert.equal(loginResponse.status,200);assert.match(loginHtml,/Accedi per collegare l’IA/);assert.match(loginHtml,/Usa una passkey/,'il login OAuth deve permettere password o passkey');
  assert.doesNotThrow(()=>new vm.Script(loginHtml.match(/<script>([\s\S]*?)<\/script>/)[1]),'lo script della pagina di accesso deve essere valido');
  const authorization=await handle(request('/oauth/authorize?'+query,{cookie:'session=alice'}),env);
  assert.equal(authorization.status,200);const profileHtml=await authorization.text();
  assert.match(profileHtml,/Verifica il profilo/);assert.match(profileHtml,/alice/);assert.match(profileHtml,/Accedi con un altro profilo/);assert.doesNotMatch(profileHtml,/consent-form/,'i permessi non devono apparire prima della verifica del profilo');
  const profileScript=profileHtml.match(/<script>([\s\S]*?)<\/script>/)[1];assert.doesNotThrow(()=>new vm.Script(profileScript),'lo script per cambiare profilo deve essere valido');
  let switchHandler,loginHandler,profileReloaded=false,loginPayload;const switchPanel={hidden:true},message={textContent:''},submitButton={disabled:false};
  const switchForm={username:{value:'prova',focus(){}},password:{value:'password-di-prova'},addEventListener(type,handler){assert.equal(type,'submit');loginHandler=handler},querySelector(){return submitButton}};
  const fakeDocument={querySelector(selector){if(selector==='#login')return switchForm;if(selector==='#message')return message;if(selector==='#switch-profile')return{addEventListener(type,handler){assert.equal(type,'click');switchHandler=handler}};if(selector==='#switch-panel')return switchPanel;if(selector==='#login-passkey')return{addEventListener(){}};return null}};
  vm.runInNewContext(profileScript,{document:fakeDocument,location:{reload(){profileReloaded=true}},fetch:async(path,options)=>{loginPayload={path,body:JSON.parse(options.body)};return{ok:true,json:async()=>({user:{username:'prova'}})}}});
  switchHandler();assert.equal(switchPanel.hidden,false,'il cambio account deve mostrare i controlli di accesso');await loginHandler({preventDefault(){}});
  assert.equal(loginPayload.path,'/api/auth/password/login');assert.equal(loginPayload.body.username,'prova');assert.equal(profileReloaded,true,'dopo il login del profilo scelto la pagina OAuth deve ricaricarsi e rivalidare l’account');
  const requestId=profileHtml.match(/name="request_id" value="([^"]+)"/)?.[1];assert.ok(requestId);
  const wrongProfile=await handle(request('/oauth/confirm',{method:'POST',cookie:'session=bob',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:requestId}).toString()}),env);
  assert.equal(wrongProfile.status,400);assert.match(await wrongProfile.text(),/profilo attivo non corrisponde/,'un altro profilo non può confermare la richiesta');
  const confirmed=await handle(request('/oauth/confirm',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:requestId}).toString()}),env);
  assert.equal(confirmed.status,200);const page=await confirmed.text();
  assert.match(page,/Profilo Marea: <strong>alice<\/strong>/);assert.match(page,/ai\.example/);assert.match(page,/Modificare il mio atlante/);assert.match(page,/consent-form/);assert.match(page,/dataset\.submitting/);assert.match(page,/target="_top"/,'il callback OAuth deve raggiungere la finestra principale del client');
  assert.match(confirmed.headers.get('content-security-policy'),/form-action 'self' https:\/\/ai\.example;/,'la policy della schermata permessi deve consentire solo l’origine callback già verificata');
  assert.doesNotMatch(confirmed.headers.get('content-security-policy'),/form-action[^;]*\*/,'la policy non deve aprire il redirect verso origini arbitrarie');
  let submitHandler,restartHandler,recovery,reloaded=false;const deny={value:'deny',disabled:false,style:{},setAttribute(){},removeAttribute(){}};const approve={value:'approve',disabled:false,style:{},textContent:'Consenti',setAttribute(){},removeAttribute(){}};const buttons=[deny,approve],status={textContent:''},restart={hidden:true,addEventListener(type,handler){assert.equal(type,'click');restartHandler=handler}};
  const consentForm={dataset:{},isConnected:true,addEventListener(type,handler){assert.equal(type,'submit');submitHandler=handler},querySelectorAll(){return buttons}};
  const document={querySelector(selector){return selector==='#consent-form'?consentForm:selector==='#consent-status'?status:restart}};
  vm.runInNewContext(page.match(/<script>([\s\S]*?)<\/script>/)[1],{document,location:{reload(){reloaded=true}},setTimeout(callback,delay){assert.equal(delay,15000);recovery=callback}});
  let duplicateBlocked=false;submitHandler({submitter:approve,preventDefault(){duplicateBlocked=true}});
  assert.equal(approve.disabled,false,'il pulsante approvato deve restare nel modulo inviato');assert.equal(deny.disabled,true);assert.equal(approve.style.pointerEvents,'none');assert.match(status.textContent,/riportando all’assistente/);
  submitHandler({submitter:approve,preventDefault(){duplicateBlocked=true}});assert.equal(duplicateBlocked,true,'un secondo invio deve essere fermato');
  recovery();assert.equal(approve.disabled,false);assert.equal(deny.disabled,false);assert.equal(restart.hidden,false);assert.match(status.textContent,/ritorno all’assistente non è riuscito/,'se il client non torna, la pagina deve offrire un recupero visibile');restartHandler();assert.equal(reloaded,true);
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
  assert.ok(tools.includes('apply_atlas_plan'));assert.ok(tools.includes('add_custom_program'));assert.ok(tools.includes('search_my_custom_programs'));
  for(const name of ['search_master_universities','add_catalog_program_to_my_atlas','remove_catalog_program_from_my_atlas','add_catalog_university_to_my_atlas','remove_catalog_university_from_my_atlas','add_custom_university','remove_custom_university'])assert.ok(tools.includes(name),`strumento MCP disponibile: ${name}`);
  const programId=catalog.programs[0].id;
  const applied=await mcpRequest({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'apply_atlas_plan',arguments:{preferences:'Neuroscienze e ricerca sperimentale',addProgramIds:[programId],compareProgramIds:[programId],customProgramsToAdd:[{name:'Master di prova',university:'Università personale',city:'Perugia',country:'Italia',region:'Europa',notes:'Da verificare'},],applicationUpdates:[{programId,stage:'In preparazione',deadline:'2027-06-15',notes:'Preparare il dossier'}]}}});
  assert.equal(applied.status,200);const appliedResult=await applied.json();assert.equal(appliedResult.result?.structuredContent?.updated,true,JSON.stringify(appliedResult));
  const aliceState=Core.normalize(JSON.parse(db.prepare('SELECT body FROM atlas_states WHERE owner=?').get(alice).body),catalog);
  assert.equal(aliceState.preferences,'Neuroscienze e ricerca sperimentale');assert.ok(aliceState.favorites.includes(programId));assert.equal(aliceState.compare[0],programId);assert.equal(aliceState.customPrograms[0].university,'Università personale');assert.equal(aliceState.records[programId].deadline,'2027-06-15');assert.equal(aliceState.catalogPrograms[programId].included,true,'aggiungere un percorso alla shortlist lo inserisce anche nel catalogo personale');assert.equal(aliceState.catalogUniversities[catalog.universities[0].id].included,true,'l’ateneo del percorso selezionato entra nel catalogo personale');assert.ok(aliceState.customUniversities.some(item=>item.name==='Università personale'),'l’università di un percorso personale viene aggiunta al catalogo dell’account');
  const publicSearch=await mcpRequest({jsonrpc:'2.0',id:31,method:'tools/call',params:{name:'search_master_programs',arguments:{query:'Università personale'}}});
  assert.deepEqual((await publicSearch.json()).result.structuredContent,{count:0,results:[]},'la ricerca del catalogo pubblico non restituisce né consulta i percorsi personali');
  const personalSearch=await mcpRequest({jsonrpc:'2.0',id:32,method:'tools/call',params:{name:'search_my_custom_programs',arguments:{query:'Università personale'}}});
  const personalResults=(await personalSearch.json()).result.structuredContent;assert.equal(personalResults.count,1);assert.equal(personalResults.results[0].name,'Master di prova');assert.equal(personalResults.results[0].custom,true);
  const callProfileTool=async(name,args,id)=>{const response=await mcpRequest({jsonrpc:'2.0',id,method:'tools/call',params:{name,arguments:args}});const payload=await response.json();assert.equal(payload.error,undefined,JSON.stringify(payload));assert.equal(payload.result?.isError,undefined,JSON.stringify(payload));return payload.result.structuredContent};
  const catalogProgram=catalog.programs[1],addedCatalogProgram=await callProfileTool('add_catalog_program_to_my_atlas',{programId:catalogProgram.id},33);assert.equal(addedCatalogProgram.included,true);
  let personalState=Core.normalize(JSON.parse(db.prepare('SELECT body FROM atlas_states WHERE owner=?').get(alice).body),catalog);
  assert.equal(personalState.catalogPrograms[catalogProgram.id].included,true);assert.ok(personalState.favorites.includes(programId));assert.equal(personalState.records[programId].deadline,'2027-06-15');
  const removedCatalogProgram=await callProfileTool('remove_catalog_program_from_my_atlas',{programId:catalogProgram.id},34);assert.equal(removedCatalogProgram.included,false);
  personalState=Core.normalize(JSON.parse(db.prepare('SELECT body FROM atlas_states WHERE owner=?').get(alice).body),catalog);assert.equal(personalState.catalogPrograms[catalogProgram.id].included,false);assert.ok(personalState.favorites.includes(programId),'la rimozione di un altro percorso non tocca la shortlist');
  const catalogUniversity=catalog.universities[0],searchedUniversities=await mcpRequest({jsonrpc:'2.0',id:35,method:'tools/call',params:{name:'search_master_universities',arguments:{query:catalogUniversity.name}}});assert.ok((await searchedUniversities.json()).result.structuredContent.results.some(item=>item.id===catalogUniversity.id));
  assert.equal((await callProfileTool('add_catalog_university_to_my_atlas',{universityId:catalogUniversity.id},36)).included,true);
  assert.equal((await callProfileTool('remove_catalog_university_from_my_atlas',{universityId:catalogUniversity.id},37)).included,false);
  const customUniversity=await callProfileTool('add_custom_university',{name:'Università personale indipendente',city:'Perugia',country:'Italia',region:'Europa',offer:'Ateneo aggiunto dal profilo'},38);assert.equal(customUniversity.added,true);assert.equal(customUniversity.university.name,'Università personale indipendente');
  assert.equal((await callProfileTool('remove_custom_university',{name:'Università personale indipendente'},39)).removed,true);
  const restoredUniversity=await callProfileTool('add_custom_university',{name:'Università personale indipendente',city:'Perugia'},40);assert.equal(restoredUniversity.added,true,'una voce personale rimossa può essere aggiunta di nuovo nello stesso account');
  personalState=Core.normalize(JSON.parse(db.prepare('SELECT body FROM atlas_states WHERE owner=?').get(alice).body),catalog);
  assert.equal(personalState.customUniversities.filter(item=>!item.deletedAt).length,2);assert.equal(personalState.catalogUniversities[catalogUniversity.id].included,false);
  const bobState=await handle(request('/api/state',{cookie:'session=bob'}),env);
  const emptyBob=(await bobState.json()).state;assert.deepEqual(emptyBob,Core.empty());assert.deepEqual(emptyBob.catalogPrograms,{});assert.deepEqual(emptyBob.catalogUniversities,{},'il nuovo account riceve un catalogo vuoto indipendente');
  const visible=await mcpRequest({jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'get_my_atlas',arguments:{}}});
  const atlas=(await visible.json()).result.structuredContent;assert.equal(atlas.selected[0].id,programId);assert.equal(atlas.compare[0].id,programId);assert.equal(atlas.customPrograms[0].university,'Università personale');assert.deepEqual(atlas.customUniversities.map(item=>item.name).sort(),['Università personale','Università personale indipendente']);assert.deepEqual(atlas.catalogProgramIds,[programId]);assert.deepEqual(atlas.catalogUniversityIds,[]);

  const clients=await handle(request('/api/auth/mcp/clients',{cookie:'session=alice'}),env);
  const clientList=await clients.json();assert.equal(clientList.clients.length,1);assert.equal(clientList.siteMcpLinked,false);
  const revoked=await handle(request('/api/auth/mcp/clients',{method:'DELETE',cookie:'session=alice',body:{clientId:client.client_id}}),env);
  assert.equal(revoked.status,200);
  const denied=await mcpRequest({jsonrpc:'2.0',id:5,method:'tools/list',params:{}});
  assert.equal(denied.status,401);

  const secondPkce=await pkce(),secondQuery=new URLSearchParams({response_type:'code',client_id:client.client_id,redirect_uri:'https://ai.example/callback',state:'stato-annullato',code_challenge:secondPkce.challenge,code_challenge_method:'S256',scope:'atlas:read atlas:write',resource:'https://atlas.test/api/atlas-mcp'});
  const secondAuthorization=await handle(request('/oauth/authorize?'+secondQuery,{cookie:'session=alice'}),env),secondProfilePage=await secondAuthorization.text(),secondRequestId=secondProfilePage.match(/name="request_id" value="([^"]+)"/)?.[1];assert.ok(secondRequestId);assert.match(secondProfilePage,/Verifica il profilo/);
  const secondConfirmation=await handle(request('/oauth/confirm',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:secondRequestId}).toString()}),env);assert.equal(secondConfirmation.status,200);
  const cancellation=await handle(request('/oauth/consent',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:secondRequestId,decision:'deny'}).toString()}),env);
  assert.equal(cancellation.status,303);const deniedTarget=new URL(cancellation.headers.get('location'));assert.equal(deniedTarget.searchParams.get('error'),'access_denied');assert.equal(deniedTarget.searchParams.get('state'),'stato-annullato');assert.equal(deniedTarget.searchParams.get('iss'),oauthMetadata.issuer);assert.equal(deniedTarget.searchParams.get('code'),null);
  db.close();
});

test('MCP OAuth mostra e vincola il profilo scelto prima del consenso',async()=>{
  const{db,env}=database(),alice='alice-owner',bob='bob-owner';
  db.prepare('INSERT INTO atlas_accounts(id,username,created_at) VALUES(?,?,?)').run(alice,'alice','2026-01-01');
  db.prepare('INSERT INTO atlas_accounts(id,username,created_at) VALUES(?,?,?)').run(bob,'prova','2026-01-01');
  const auth={async resolveOwner(req){const cookie=req.headers.get('cookie')||'';return cookie.includes('session=alice')?alice:cookie.includes('session=bob')?bob:null}};
  const handle=createHandler({},catalog,Core,auth,createMcpHandler(auth,Core,catalog));
  const registered=await handle(request('/oauth/register',{method:'POST',body:{client_name:'ChatGPT',redirect_uris:['https://ai.example/callback']}}),env),client=await registered.json();
  const {verifier,challenge}=await pkce(),query=new URLSearchParams({response_type:'code',client_id:client.client_id,redirect_uri:'https://ai.example/callback',state:'stato-prova',code_challenge:challenge,code_challenge_method:'S256',scope:'atlas:read',resource:'https://atlas.test/api/atlas-mcp'});
  const alicePage=await handle(request('/oauth/authorize?'+query,{cookie:'session=alice'}),env),aliceHtml=await alicePage.text();
  assert.match(aliceHtml,/alice/);assert.match(aliceHtml,/Continua come alice/);
  const bobPage=await handle(request('/oauth/authorize?'+query,{cookie:'session=bob'}),env),bobHtml=await bobPage.text();
  assert.match(bobHtml,/prova/);assert.match(bobHtml,/Continua come prova/);
  const bobRequestId=bobHtml.match(/name="request_id" value="([^"]+)"/)?.[1];assert.ok(bobRequestId);
  const crossAccount=await handle(request('/oauth/confirm',{method:'POST',cookie:'session=alice',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:bobRequestId}).toString()}),env);
  assert.equal(crossAccount.status,400);assert.match(await crossAccount.text(),/profilo attivo non corrisponde/);
  const confirmation=await handle(request('/oauth/confirm',{method:'POST',cookie:'session=bob',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:bobRequestId}).toString()}),env);
  assert.equal(confirmation.status,200);assert.match(await confirmation.text(),/consent-form/);
  const approved=await handle(request('/oauth/consent',{method:'POST',cookie:'session=bob',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({request_id:bobRequestId,read:'1',decision:'approve'}).toString()}),env);
  assert.equal(approved.status,303);const code=new URL(approved.headers.get('location')).searchParams.get('code');assert.ok(code);
  const token=await handle(request('/oauth/token',{method:'POST',contentType:'application/x-www-form-urlencoded',body:new URLSearchParams({grant_type:'authorization_code',client_id:client.client_id,code,redirect_uri:'https://ai.example/callback',code_verifier:verifier,resource:'https://atlas.test/api/atlas-mcp'}).toString()}),env);
  assert.equal(token.status,200);await token.json();
  assert.equal(db.prepare('SELECT COUNT(*) n FROM atlas_mcp_tokens WHERE owner=?').get(alice).n,0);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM atlas_mcp_tokens WHERE owner=?').get(bob).n,1,'la connessione del profilo di prova deve produrre un token solo per quel profilo');
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
  assert.ok(tools.includes('get_my_atlas'));assert.ok(tools.includes('apply_atlas_plan'));assert.ok(tools.includes('link_my_atlas_profile'));assert.ok(tools.includes('search_my_custom_programs'));

  const deniedCode=await handle(request('/api/auth/mcp/site-link-code',{method:'POST'}),env);assert.equal(deniedCode.status,401);
  const crossOrigin=await handle(request('/api/auth/mcp/site-link-code',{method:'POST',cookie:'session=alice',origin:'https://evil.example'}),env);assert.equal(crossOrigin.status,403);
  const codeResponse=await handle(request('/api/auth/mcp/site-link-code',{method:'POST',cookie:'session=alice'}),env);
  assert.equal(codeResponse.status,200);const{code,expiresAt}=await codeResponse.json();assert.match(code,/^[A-Za-z0-9_-]{12}$/);assert.ok(expiresAt>Date.now());
  const stored=db.prepare("SELECT challenge,expires_at FROM atlas_auth_challenges WHERE purpose='sites-mcp-link'").get();
  assert.notEqual(stored.challenge,code);assert.ok(stored.expires_at>Date.now());

  const siteRequest=(name,args,siteId='chatgpt-user-alice')=>handle(request('/mcp',{method:'POST',headers:{'oai-authenticated-user-id':siteId},body:{jsonrpc:'2.0',id:3,method:'tools/call',params:{name,arguments:args}}}),env);
  const unlinked=await siteRequest('get_my_atlas',{});assert.match(JSON.stringify((await unlinked.json()).result),/Profilo non collegato/);
  const publicSearchBeforeLink=await siteRequest('search_master_programs',{query:catalog.programs[0].name.slice(0,4)});
  assert.match(JSON.stringify((await publicSearchBeforeLink.json()).result),/Profilo non collegato/,'anche gli strumenti di ricerca richiedono il collegamento al profilo');
  const privateSearch=await siteRequest('search_my_custom_programs',{query:'personale'});assert.match(JSON.stringify((await privateSearch.json()).result),/Profilo non collegato/);
  const linked=await siteRequest('link_my_atlas_profile',{code});assert.equal((await linked.json()).result.structuredContent.linked,true);
  const replay=await siteRequest('link_my_atlas_profile',{code});assert.match(JSON.stringify((await replay.json()).result),/scaduto o già utilizzato/);
  assert.equal(db.prepare("SELECT owner FROM atlas_identities WHERE provider='sites-mcp' AND subject=?").get('chatgpt-user-alice').owner,alice);

  const publicSearch=await siteRequest('search_master_programs',{query:catalog.programs[0].name.slice(0,4)});
  const publicResults=(await publicSearch.json()).result.structuredContent;assert.ok(publicResults.count>0);assert.ok(publicResults.results.every(item=>item.custom===false));
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM atlas_states').get().count,0,'la ricerca del catalogo usa i dati pubblici senza inizializzare lo stato personale');

  const programId=catalog.programs[0].id;
  const updated=await siteRequest('add_program_to_shortlist',{programId});assert.equal((await updated.json()).result.structuredContent.selected,true);
  const accountState=await handle(request('/api/state',{cookie:'session=alice'}),env);
  assert.ok((await accountState.json()).state.favorites.includes(programId),'l’app ChatGPT modifica lo stesso profilo autenticato sul sito');
  const otherUser=await siteRequest('get_my_atlas',{},'chatgpt-user-bob');assert.match(JSON.stringify((await otherUser.json()).result),/Profilo non collegato/);
  const linkedStatus=await handle(request('/api/auth/mcp/clients',{cookie:'session=alice'}),env);assert.equal((await linkedStatus.json()).siteMcpLinked,true);
  const crossSiteUnlink=await handle(request('/api/auth/mcp/clients',{method:'DELETE',cookie:'session=alice',origin:'https://evil.example',body:{siteMcp:true}}),env);assert.equal(crossSiteUnlink.status,403);
  const siteUnlink=await handle(request('/api/auth/mcp/clients',{method:'DELETE',cookie:'session=alice',body:{siteMcp:true}}),env);assert.deepEqual(await siteUnlink.json(),{ok:true,siteMcpLinked:false});
  const unlinkedStatus=await handle(request('/api/auth/mcp/clients',{cookie:'session=alice'}),env);assert.equal((await unlinkedStatus.json()).siteMcpLinked,false);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM atlas_identities WHERE provider='sites-mcp' AND owner=?").get(alice).count,0);
  const afterUnlink=await siteRequest('get_my_atlas',{});assert.match(JSON.stringify((await afterUnlink.json()).result),/Profilo non collegato/);
  db.close();
});
