const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const Core=require('../dist/core.js');
const {createHandler}=require('../worker/handler.js');
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/data.json'),'utf8'));
const first=catalog.legacyIds['3-1'],second=catalog.legacyIds['3-2'];
test('La testata resta essenziale e le azioni profilo sono raccolte nel menu',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  const header=html.match(/<header class="app-header">([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header,'testata applicazione presente');
  const left=header.split('<div class="header-right">')[0],right=header.split('<div class="header-right">')[1];
  assert.match(left,/id="profile-toggle"[^>]*aria-label="Apri profilo"[\s\S]*class="brand-mark app-profile-icon"/);
  assert.doesNotMatch(left,/id="command-toggle"|id="theme-toggle"|Cerca percorsi/);
  assert.match(right,/href="#programs" aria-label="Esplora e aggiungi percorsi"/);
  assert.match(right,/id="command-toggle"[^>]*aria-label="Apri ricerca rapida"[\s\S]*id="theme-toggle"/);
  assert.ok(right.indexOf('href="#programs"')<right.indexOf('id="command-toggle"')&&right.indexOf('id="command-toggle"')<right.indexOf('id="theme-toggle"'),'azioni in ordine +, ricerca, tema');
  assert.match(header,/id="install-app"[\s\S]*id="account-manage-profile"[\s\S]*id="account-logout"/);
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8'),/@media\(max-width:820px\)[\s\S]*\.command-trigger \.command-copy\{display:block/);
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8'),/\.header-actions-glass\{display:flex[\s\S]*backdrop-filter:blur\(26px\)/);
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8'),/\.sidebar>\.brand,\.sidebar>\.edition,\.sidebar>\.sidebar-bottom\{display:none\}/);
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8'),/#compare-tray\{position:fixed[\s\S]*border-radius:999px[\s\S]*backdrop-filter:blur\(28px\)/);
});
test('Le icone dell’interfaccia usano SVG coerenti su iOS e desktop',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  assert.match(html,/id="install-app"[\s\S]*id="account-manage-profile"[\s\S]*class="profile-action-icon"[\s\S]*id="account-logout"[\s\S]*class="profile-action-icon"/);
  assert.match(`${html}\n${fs.readFileSync(path.join(__dirname,'../dist/auth.js'),'utf8')}`,/account-add-passkey|nome utente|passkey/i);
  assert.match(html,/id="theme-toggle"[\s\S]*<svg class="theme-glyph theme-icon-sun"[\s\S]*<svg class="theme-glyph theme-icon-moon"/);
  assert.match(app,/button\.title=theme==='dark'\?'Passa al tema chiaro':'Passa al tema scuro'/);
  assert.doesNotMatch(app,/\.theme-glyph',button\)\.innerHTML/,'le icone del tema restano SVG statiche per compatibilità Safari');
  assert.match(app,/class="focus-orbit"[\s\S]*<svg viewBox="0 0 48 48"/);
  assert.doesNotMatch(`${html}\n${app}`,/⚙|↪|⌑|✳|☀|◐/,'le icone non dipendono dai font emoji di sistema');
  assert.match(css,/\.profile-action-icon\{display:block;width:23px;height:23px/);
  assert.match(css,/\.focus-orbit svg\{position:relative;width:29px;height:29px/);
  assert.match(css,/\.header-actions-glass \.theme-glyph\{display:none;width:22px;height:22px/);
  assert.match(css,/:root\[data-theme="dark"\].*\.theme-icon-sun,:root\[data-theme="light"\].*\.theme-icon-moon\{display:block\}/);
});
test('L’accesso offre password e passkey senza pulsanti di provider esterni',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  const auth=fs.readFileSync(path.join(__dirname,'../dist/auth.js'),'utf8');
  assert.match(auth,/type="password" autocomplete="current-password"/);
  assert.match(auth,/api\/auth\/password\/register/);
  assert.match(auth,/api\/auth\/password\/login/);
  assert.match(auth,/Usa una passkey/);
  assert.match(html,/id="account-add-passkey"/);
  assert.doesNotMatch(`${html}\n${auth}`,/Continua con Google|Continua con Apple|accounts\.google\.com|appleid\.apple\.com/);
  assert.ok(html.indexOf('href="glass-ui.css"')<html.indexOf('href="auth.css"'),'lo stile di accesso prevale sulle regole generali liquid glass');
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8'),/master-atlas-shell-v8/,'la cache PWA viene invalidata dopo il cambio stile');
});
test('La panoramica usa schede liquid glass e mantiene una griglia leggibile su telefono',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  assert.match(app,/class="dashboard-grid" aria-label="Riepilogo del tuo atlante"/);
  assert.match(app,/<article class="dashboard-card atlas-hero-card" aria-label="Atlante e panoramica"><div class="atlas-hero-globe">\$\{globeCard\(\)\}<\/div>[\s\S]*?<section class="distribution-card" aria-label="Panoramica del dossier">[\s\S]*?<\/section><\/article>/,'atlante e panoramica condividono una sola hero card');
  assert.match(app,/class="distribution-donut"[\s\S]*data-region-tab="Europa"/);
  assert.match(app,/class="stage-list"/);assert.match(app,/class="dashboard-card shortlist-card"/);
  assert.match(app,/function globeCard\(\)[\s\S]*globeCoordinates[\s\S]*data-globe-focus/);
  assert.match(app,/mapSamples:16000[\s\S]*mapBrightness:1\.8[\s\S]*mapBaseBrightness:0\.01/);
  const overview=app.slice(app.indexOf('function overview(){'),app.indexOf('function card(p)'));
  assert.ok(overview.indexOf('${globeCard()}')<overview.indexOf('class="distribution-card"'),'la panoramica è integrata accanto al globo nella hero card');
  assert.match(app,/theta\+=\s*\(e\.clientY-old\.y\)\/220[\s\S]*frame\.theta=orientation\.theta/);
  assert.match(app,/theta\+=\(next\.y-before\.y\)\/240/);
  assert.doesNotMatch(app,/theta=wrapTheta/);
  assert.doesNotMatch(app,/phi\+=0\.0012/);
  assert.match(app,/selectedNames\.has\(u\.name\)\?\.12:\.075/);
  assert.match(app,/data-globe-zoom/);
  assert.match(app,/data-globe-north[\s\S]*globe-compass-needle/);
  assert.match(app,/pointerType==='mouse'[\s\S]*setPointerCapture/);
  assert.match(app,/next\.distance\/before\.distance/);
  assert.match(app,/globeData\.north=[\s\S]*globeData\.reset=/);
  assert.match(css,/\.dashboard-card\{[\s\S]*backdrop-filter:blur\(30px\)/);
  assert.match(css,/\.dashboard-grid>\.atlas-hero-card\{grid-column:1\/-1\}/);
  assert.match(css,/\.university-globe-card[\s\S]*touch-action:none/);
  assert.match(css,/\.atlas-hero-card\{display:grid;grid-template-columns:minmax\(0,1\.5fr\) minmax\(260px,\.82fr\)/);
  assert.match(css,/@media\(max-width:820px\)\{[\s\S]*\.atlas-hero-card\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(css,/#main:has\(>\.title-row \+ \.dashboard-grid\)>.title-row\{margin-bottom:10px\}/);
  assert.match(css,/\.globe-compass-needle\{width:21px/);
  assert.match(css,/@media\(max-width:560px\)\{[\s\S]*\.dashboard-rail\{grid-template-columns:minmax\(0,1fr\)\}/);
});
test('Il globo mantiene una rotazione continua attraverso i poli e i giri completi',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  const normalizeSource=app.match(/function normalizeGlobeOrientation\(phi,theta\)\{[\s\S]*?\n\}/)?.[0];
  const targetSource=app.match(/function globeTargetAngles\(longitude,latitude,currentPhi,currentTheta\)\{[\s\S]*?\n\}/)?.[0];
  assert.ok(normalizeSource&&targetSource,'funzioni di normalizzazione e centratura presenti');
  const normalize=vm.runInNewContext(`(${normalizeSource})`);
  const target=vm.runInNewContext(`(${targetSource})`);
  const north=normalize(.4,-.25),south=normalize(.4,Math.PI+.25),manyTurns=normalize(.4,40*Math.PI+.3);
  assert.ok(Math.abs(north.theta-(Math.PI*2-.25))<1e-9);assert.ok(Math.abs(north.phi-.4)<1e-9);
  assert.ok(Math.abs(south.theta-(Math.PI+.25))<1e-9);assert.ok(Math.abs(south.phi-.4)<1e-9);
  assert.ok(Math.abs(manyTurns.theta-.3)<1e-9);assert.ok(Math.abs(manyTurns.phi-.4)<1e-9);
  const before=normalize(.4,Math.PI*2-1e-6),after=normalize(.4,Math.PI*2+1e-6);
  assert.ok(Math.abs(before.phi-after.phi)<1e-9,'il passaggio a 360 gradi non cambia la rotazione orizzontale');
  assert.ok(before.theta>Math.PI*2-.00001&&after.theta<.00001,'il passaggio a 360 gradi resta continuo');
  for(const [lon,lat] of [[120,45],[151.1873,-33.8886],[-74.006,40.7128]]){
    const centered=target(lon,lat,.2,100*Math.PI+.3);
    assert.ok(Number.isFinite(centered.phi)&&Number.isFinite(centered.theta),'la centratura resta valida anche dopo molte rotazioni');
    const view=normalize(centered.phi,centered.theta);
    const actualLat=Math.asin(Math.sin(view.theta))*180/Math.PI;
    const actualLon=Math.atan2(-Math.cos(view.phi)*Math.cos(view.theta),-Math.sin(view.phi)*Math.cos(view.theta))*180/Math.PI;
    const lonError=Math.atan2(Math.sin((actualLon-lon)*Math.PI/180),Math.cos((actualLon-lon)*Math.PI/180))*180/Math.PI;
    assert.ok(Math.abs(actualLat-lat)<1e-7,`latitudine centrata per ${lon}, ${lat}`);
    assert.ok(Math.abs(lonError)<1e-7,`longitudine centrata per ${lon}, ${lat}`);
  }
});
test('Il globo copre con coordinate valide tutti i 27 atenei del dossier',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  assert.match(app,/favorites=state\.favorites[\s\S]*const globeData=\{canvas,resizeTimer:0,resize:null\}/);
  assert.doesNotMatch(app,/const state=\{canvas,resizeTimer:0,resize:null\}/);
  const source=app.match(/const globeCoordinates=(\{[\s\S]*?\n\});/)?.[1];
  assert.ok(source,'coordinate del globo presenti');
  const locations=vm.runInNewContext('('+source+')');
  assert.equal(Object.keys(locations).length,catalog.universities.length);
  for(const uni of catalog.universities){const point=locations[uni.name];assert.ok(point,`coordinate per ${uni.name}`);assert.equal(point.length,2);assert.ok(point[0]>=-90&&point[0]<=90);assert.ok(point[1]>=-180&&point[1]<=180)}
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/src="globe\.js" defer><\/script><script src="app\.js" defer/);
  const serviceWorker=fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8');
  assert.match(serviceWorker,/\/globe\.js/);
  assert.match(serviceWorker,/master-atlas-shell-v8/);
});

test('La tipografia dell’interfaccia usa il sans-serif Manrope come nelle immagini di riferimento',()=>{
  const base=fs.readFileSync(path.join(__dirname,'../dist/style.css'),'utf8');
  const glass=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  const auth=fs.readFileSync(path.join(__dirname,'../dist/auth.css'),'utf8');
  assert.match(base,/--serif:'Manrope',system-ui,sans-serif/);
  assert.match(glass,/--serif:'Manrope',system-ui,sans-serif/);
  assert.match(auth,/auth-card h1[^}]*Manrope/);
  assert.doesNotMatch(base,/family=Newsreader/);
});
test('Il catalogo contiene tutte le voci e ID univoci',()=>{
  assert.equal(catalog.programs.length,208);assert.equal(catalog.universities.length,27);
  assert.equal(new Set(catalog.programs.map(p=>p.id)).size,208);
  assert.equal(Object.keys(catalog.legacyIds).length,208);
});
test('Le risorse PWA sono servite dal Worker con manifest e icone PNG validi',async()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/manifest.webmanifest'),'utf8'));
  assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');
  assert.ok(manifest.icons.some(icon=>icon.sizes==='192x192'));
  assert.ok(manifest.icons.some(icon=>icon.sizes==='512x512'&&icon.purpose.includes('maskable')));
  const assets={'/manifest.webmanifest':{type:'application/manifest+json',body:JSON.stringify(manifest)},'/icons/atlas-192.png':{type:'image/png',body:{encoding:'base64',value:fs.readFileSync(path.join(__dirname,'../dist/icons/atlas-192.png')).toString('base64')}}};
  const handle=createHandler(assets,catalog,Core);
  const json=await handle(new Request('https://atlas.test/manifest.webmanifest'),{});
  assert.match(json.headers.get('content-type'),/application\/manifest\+json/);
  const icon=await handle(new Request('https://atlas.test/icons/atlas-192.png'),{});
  assert.equal(icon.headers.get('content-type'),'image/png');
  assert.deepEqual([...new Uint8Array(await icon.arrayBuffer()).slice(0,8)],[137,80,78,71,13,10,26,10]);
});
test('Migrazione v1 preserva note, candidature, preferiti e confronto',()=>{
  const out=Core.normalize({favorites:['3-1'],compare:['4-1'],records:{'3-1':{notes:'Le mie note',stage:'In preparazione',checklist:[0,4]}}},catalog);
  assert.deepEqual(out.favorites,[first]);assert.deepEqual(out.compare,[catalog.legacyIds['4-1']]);
  assert.equal(out.records[first].notes,'Le mie note');assert.deepEqual(out.records[first].checklist,[0,4]);
});
test('Riordinare la classifica non sposta gli identificativi né la mappa legacy',()=>{
  const src=catalog.source.split('\n');
  const a=src.findIndex(s=>s.startsWith('| 1 | [Cancer, Stem Cells'));
  const b=src.findIndex(s=>s.startsWith('| 2 | [Molecular and Cellular Life'));
  src[a]=src[a].replace('| 1 |','| 2 |');src[b]=src[b].replace('| 2 |','| 1 |');
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-reorder-'));
  const input=path.join(temp,'dossier.md'),output=path.join(temp,'catalog.json');fs.writeFileSync(input,src.join('\n'));
  const run=spawnSync('python',[path.join(__dirname,'../parse_data.py'),'--source',input,'--output',output],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const reordered=JSON.parse(fs.readFileSync(output));
  assert.equal(reordered.programs.find(p=>p.rank===2&&p.region==='Europa').id,first);
  assert.deepEqual(reordered.legacyIds,catalog.legacyIds);
  fs.unlinkSync(input);fs.unlinkSync(output);fs.rmdirSync(temp);
});
test('Atenei partner: Vienna, ETH e Karolinska includono i programmi congiunti',()=>{
  for(const [id,university] of [['3-31','Vienna'],['3-107','ETH'],['3-30','Karolinska']]){
    assert.equal(Core.belongsTo(catalog.programs.find(p=>p.id===catalog.legacyIds[id]),university),true);
  }
});
test('Aprendo i preferiti si azzerano i filtri del catalogo e si vedono quelli extraeuropei',()=>{
  const el={open:false,addEventListener(){}};
  const sandbox={fixture:catalog,AtlasCore:Core,document:{querySelector(){return el},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){},scrollTo(){}},location:{hash:'#favorites'},fetch:()=>new Promise(()=>{}),setTimeout,clearTimeout};
  vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8')+`;D=fixture;render=()=>{};view='programs';uni='Utrecht';query='Utrecht';region='Europa';state=AtlasCore.normalize({favorites:['4-1']},D);route();globalThis.visible=filtered().length;globalThis.activeRegion=region;`,sandbox);
  assert.equal(sandbox.visible,1);assert.equal(sandbox.activeRegion,'Tutte');
});
test('Importazione: conflitti visibili e note attuali preservate per default',()=>{
  const a=Core.normalize({records:{[first]:{notes:'Nuova',updatedAt:20}}},catalog);
  const b=Core.normalize({records:{[first]:{notes:'Vecchia',updatedAt:10},[second]:{notes:'Da importare'}}},catalog);
  assert.deepEqual(Core.conflicts(a,b),[first]);
  assert.equal(Core.importBackup(a,b,false,30).records[first].notes,'Nuova');
  assert.equal(Core.importBackup(a,b,false,30).records[second].notes,'Da importare');
  assert.equal(Core.importBackup(a,b,true,30).records[first].notes,'Vecchia');
});
test('Merge cloud: modifiche a schede distinte e rimozione preferito non si perdono',()=>{
  const a=Core.normalize({records:{[first]:{notes:'A',updatedAt:30}},favorites:[first],favoritesUpdated:{[first]:{selected:true,updatedAt:10}}},catalog);
  const b=Core.normalize({records:{[second]:{notes:'B',updatedAt:25}},favoritesUpdated:{[first]:{selected:false,updatedAt:20}}},catalog);
  const out=Core.merge(a,b);assert.equal(out.records[first].notes,'A');assert.equal(out.records[second].notes,'B');assert.deepEqual(out.favorites,[]);
});
function database(){
  const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(':memory:');
  const dir=path.join(__dirname,'../drizzle');for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort())db.exec(fs.readFileSync(path.join(dir,f),'utf8'));
  const env={DB:{prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {async run(){const r=stmt.run(...values);return {meta:{changes:r.changes}}},async first(){return stmt.get(...values)||null},async all(){return {results:stmt.all(...values)}}}}}},async batch(statements){db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}};
  return {env,db};
}
test('API: accesso, isolamento utenti, controllo revisione, copie di recupero',async()=>{
  const {env,db}=database();const handle=createHandler({},catalog,Core);
  const request=(owner,method='GET',value,route='/api/state',origin='https://atlas.test')=>new Request('https://atlas.test'+route,{method,headers:{...(owner?{'oai-authenticated-user-id':owner}:{}),...(method==='PUT'?{'origin':origin,'content-type':'application/json'}:{})},...(value?{body:JSON.stringify(value)}:{})});
  assert.equal((await handle(request(null),env)).status,401);
  assert.equal((await handle(request('alice','PUT',{state:{},revision:0},'/api/state','https://evil.test'),env)).status,403);
  const a=await (await handle(request('alice'),env)).json();assert.equal(a.revision,0);
  const state=Core.normalize({records:{[first]:{notes:'Privata',updatedAt:1}}},catalog);
  assert.equal((await handle(request('alice','PUT',{state,revision:0}),env)).status,200);
  assert.equal((await handle(request('alice','PUT',{state:Core.empty(),revision:0}),env)).status,409);
  const alice=await (await handle(request('alice'),env)).json();assert.equal(alice.state.records[first].notes,'Privata');
  const bob=await (await handle(request('bob'),env)).json();assert.deepEqual(bob.state.records,{});
  const copies=await (await handle(request('alice','GET',null,'/api/backups'),env)).json();assert.equal(copies.backups.length,1);
  assert.equal((await handle(request('bob','GET',null,'/api/backups/0'),env)).status,404);
  db.close();
});
test('Il client migra la v1 e crea una copia locale di recupero',()=>{
  const entries=new Map([['master-atlas-2027-v1',JSON.stringify({favorites:['3-1'],records:{'3-1':{notes:'Da preservare'}}})]]);
  const sandbox={AtlasCore:Core,window:{addEventListener(){}},localStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},setTimeout,clearTimeout};
  vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
  const store=new sandbox.Store(catalog,()=>{},()=>{});
  assert.equal(store.state.records[first].notes,'Da preservare');assert.equal(store.snapshots().length,1);
  assert.ok(entries.has('master-atlas-2027-v1'));
});
test('Due dispositivi sincronizzano note diverse senza sovrascriverle',async()=>{
  const {env,db}=database();const handle=createHandler({},catalog,Core);
  const devices=[];
  for(let i=0;i<2;i++){
    const values=new Map();
    const fetch=async(url,init={})=>handle(new Request('https://atlas.test'+url,{...init,headers:{...init.headers,'oai-authenticated-user-id':'alice',origin:'https://atlas.test'}}),env);
    const sandbox={AtlasCore:Core,window:{addEventListener(){}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},fetch,setTimeout,clearTimeout,AbortSignal};
    vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
    devices.push(new sandbox.Store(catalog,()=>{},()=>{}));
  }
  devices[0].save(Core.normalize({records:{[first]:{notes:'PC',updatedAt:10}}},catalog));
  devices[1].save(Core.normalize({records:{[second]:{notes:'Telefono',updatedAt:20}}},catalog));
  for(const d of devices)clearTimeout(d.timer);
  await devices[0].sync();await devices[1].sync();await devices[0].sync();
  assert.equal(devices[0].state.records[first].notes,'PC');
  assert.equal(devices[0].state.records[second].notes,'Telefono');
  db.close();
});
test('La versione pubblica salva localmente senza richieste API o timer cloud',async()=>{
  const entries=new Map();let requests=0;
  const sandbox={AtlasCore:Core,ATLAS_CONFIG:{public:true,cloudSync:false},window:{addEventListener(){}},localStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},fetch:()=>{requests++;throw Error('API non prevista')},setTimeout,clearTimeout,setInterval:()=>{throw Error('Polling non previsto')}};
  vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
  const store=new sandbox.Store(catalog,()=>{},()=>{});
  await store.start();store.save(Core.normalize({records:{[first]:{notes:'Personale',updatedAt:1}}},catalog));await store.sync();
  assert.equal(requests,0);assert.equal(JSON.parse(entries.get('master-atlas-2027-v2')).records[first].notes,'Personale');
});
test('Le modifiche in schede pubbliche diverse vengono unite e persistite localmente',()=>{
  const entries=new Map(),listeners=[];
  const storage={getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)};
  const makeStore=()=>{
    const handlers={};
    const sandbox={AtlasCore:Core,ATLAS_CONFIG:{public:true,cloudSync:false},window:{addEventListener:(name,fn)=>{handlers[name]=fn}},localStorage:storage,setTimeout,clearTimeout};
    vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
    const store=new sandbox.Store(catalog,()=>{},()=>{});listeners.push(handlers.storage);return store;
  };
  const a=makeStore(),b=makeStore();
  a.save(Core.normalize({records:{[first]:{notes:'Nota dalla prima scheda',updatedAt:10}}},catalog));
  b.save(Core.normalize({records:{[second]:{notes:'Nota dalla seconda scheda',updatedAt:20}}},catalog));
  const bValue=entries.get('master-atlas-2027-v2');
  listeners[0]({key:'master-atlas-2027-v2',newValue:bValue});
  const merged=JSON.parse(entries.get('master-atlas-2027-v2'));
  assert.equal(merged.records[first].notes,'Nota dalla prima scheda');
  assert.equal(merged.records[second].notes,'Nota dalla seconda scheda');
  listeners[1]({key:'master-atlas-2027-v2',newValue:entries.get('master-atlas-2027-v2')});
  assert.equal(JSON.parse(entries.get('master-atlas-2027-v2')).records[first].notes,'Nota dalla prima scheda');
  assert.equal(JSON.parse(entries.get('master-atlas-2027-v2')).records[second].notes,'Nota dalla seconda scheda');
});
test('La build Pages contiene soltanto risorse pubbliche e disabilita il cloud',()=>{
  const run=spawnSync(process.execPath,[path.join(__dirname,'../scripts/build-pages.mjs')],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const dir=path.join(__dirname,'../_site');
  assert.deepEqual(fs.readdirSync(dir).sort(),['.nojekyll','app.js','auth.css','auth.js','config.js','core.js','data.json','glass-ui.css','globe.js','icons','index.html','manifest.webmanifest','pwa.css','pwa.js','release.json','storage.js','style.css','sw.js'].sort());
  assert.deepEqual(fs.readdirSync(path.join(dir,'icons')).sort(),['atlas-180.png','atlas-192.png','atlas-512.png']);
  assert.ok(fs.readFileSync(path.join(dir,'icons/atlas-512.png')).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(dir,'config.js'),'utf8'),context);
  assert.equal(context.ATLAS_CONFIG.cloudSync,false);assert.equal(context.ATLAS_CONFIG.public,true);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(html.includes('Sito pubblico'));assert.ok(!html.includes('Spazio privato'));assert.ok(html.includes('glass-ui.css'));assert.ok(html.includes('command-palette'));
  assert.ok(html.indexOf('src="config.js"')<html.indexOf('src="app.js"'));
  assert.ok(html.indexOf('src="globe.js"')<html.indexOf('src="app.js"'));
  assert.ok(html.includes('rel="manifest"'));assert.ok(fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes("url.pathname.startsWith('/api/')"));assert.ok(fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes("'/glass-ui.css'"));
});
