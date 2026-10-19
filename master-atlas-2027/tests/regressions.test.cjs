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
test('Il pulsante di accesso mantiene il contrasto WCAG AA sui due estremi del gradiente',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../dist/auth.css'),'utf8');
  const gradient=css.match(/\.auth-actions \.button\.primary\{[^}]*background:linear-gradient\(135deg,(#[0-9a-f]{6}),(#[0-9a-f]{6})\)/i);
  assert.ok(gradient,'gradiente principale del pulsante di accesso presente');
  const luminance=hex=>{const channels=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
  for(const background of gradient.slice(1))assert.ok(1.05/(luminance(background)+.05)>=4.5,`bianco su ${background} deve raggiungere almeno 4,5:1`);
});
test('Le etichette secondarie rispettano il contrasto minimo in modalità chiara e scura',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  const luminance=hex=>{const channels=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return .2126*channels[0]+.7152*channels[1]+.0722*channels[2]};
  const contrast=(foreground,background)=>{const a=luminance(foreground),b=luminance(background);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  assert.match(css,/:root\{--muted:#5d697a\}/);
  assert.ok(contrast('#5d697a','#eef3f9')>=4.5,'testo secondario su fondo chiaro');
  assert.ok(contrast('#5d697a','#fbfcff')>=4.5,'testo secondario su scheda chiara');
  assert.ok(contrast('#a6b3c5','#0c1422')>=4.5,'testo secondario su fondo scuro');
  assert.ok(contrast('#596779','#eef2f8')>=4.5,'etichette dei badge su fondo grigio');
});
test('La lingua si cambia dal profilo e resta salvata tra le sessioni',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
  const i18n=fs.readFileSync(path.join(__dirname,'../dist/i18n.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  const sw=fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8');
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  const workerBuild=fs.readFileSync(path.join(__dirname,'../scripts/build.mjs'),'utf8');
  assert.match(html,/class="profile-language"[^>]*for="language-select"[\s\S]*id="language-select" aria-label="Lingua"[\s\S]*<option value="it">Italiano<\/option>[\s\S]*<option value="en">English<\/option>[\s\S]*<option value="es">Español<\/option>[\s\S]*<option value="fr">Français<\/option>[\s\S]*<option value="de">Deutsch<\/option>/);
  assert.ok(html.indexOf('src="i18n.js" defer')<html.indexOf('src="auth.js" defer'),'la lingua è pronta prima dei contenuti dinamici del profilo');
  assert.match(i18n,/localStorage\.getItem\('atlas-language'\)/);
  assert.match(i18n,/localStorage\.setItem\('atlas-language', locale\)/);
  assert.match(i18n,/new MutationObserver/,'anche le schermate renderizzate in seguito vengono tradotte');
  assert.match(i18n,/Claude: add the connector on the web, then use it on iOS or Android/,'le istruzioni MCP spiegano il flusso mobile in inglese');
  assert.match(workerBuild,/['"]i18n\.js['"]:\s*['"]text\/javascript; charset=utf-8['"]/,'il Worker pubblica anche lo script delle traduzioni');
  assert.match(sw,/master-atlas-shell-v12/,'la shell aggiorna la cache dopo la correzione del Worker');
  assert.match(css,/\.profile-language select\{[\s\S]*border-radius:11px/);
  assert.match(css,/:root\[data-theme="dark"\] \.profile-language select/);
  assert.match(app,/option value="\$\{esc\(s\)\}" \$\{r\.stage===s\?'selected':''\}/,'le traduzioni delle candidature non alterano il valore salvato');
  assert.match(html,/<option value="Europa">Europa<\/option><option value="Extra-Europa">Extra-Europa<\/option>/,'le opzioni geografiche mantengono valori stabili quando cambia la lingua');
  assert.match(app,/map\(t=>`<option value="\$\{esc\(t\)\}" \$\{kind===t\?'selected':''\}>\$\{esc\(t\)\}<\/option>`\)/,'il filtro per tipologia conserva il valore originale indipendentemente dall’etichetta tradotta');
  const saved=new Map();const sandbox={localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)}};sandbox.globalThis=sandbox;
  vm.runInNewContext(i18n,sandbox);
  for(const [locale,expected] of [['en','Overview'],['es','Resumen'],['fr','Vue d’ensemble'],['de','Übersicht']]){
    assert.equal(sandbox.AtlasI18n.translate('Panoramica',locale),expected);
    assert.equal(sandbox.AtlasI18n.translate('Accedi',locale).length>0,true,`accesso tradotto in ${locale}`);
  }
  assert.equal(sandbox.AtlasI18n.translate('Cancer, Stem Cells', 'en'),'Cancer, Stem Cells','i nomi del catalogo restano invariati');
  assert.equal(sandbox.AtlasI18n.setLocale('fr'),true);
  assert.equal(saved.get('atlas-language'),'fr');
  const runtimeStorage=new Map();let observer;
  class FakeText{constructor(value,parent){this.nodeType=3;this.nodeValue=value;this.parentElement=parent}}
  class FakeElement{
    constructor(tag,attrs={}){this.nodeType=1;this.tagName=tag.toUpperCase();this.attrs=new Map(Object.entries(attrs));this.childNodes=[];this.listeners={};this.value='';}
    append(...nodes){for(const node of nodes){if(node.nodeType===1)node.parentElement=this;else if(node.nodeType===3)node.parentElement=this;this.childNodes.push(node)}}
    closest(){return null}
    getAttribute(name){return this.attrs.has(name)?this.attrs.get(name):null}
    setAttribute(name,value){this.attrs.set(name,String(value))}
    addEventListener(name,callback){this.listeners[name]=callback}
    querySelectorAll(){const found=[];const visit=node=>{for(const child of node.childNodes||[]){if(child.nodeType===1){found.push(child);visit(child)}}};visit(this);return found}
  }
  const body=new FakeElement('body'),rootText=new FakeText('Panoramica',body),select=new FakeElement('select',{'aria-label':'Lingua'});select.id='language-select';select.value='it';
  body.append(rootText,select);
  const document={body,documentElement:{lang:'it'},querySelector:selector=>selector==='#language-select'?select:null,createTreeWalker(root){const nodes=[];const visit=node=>{for(const child of node.childNodes||[]){if(child.nodeType===3)nodes.push(child);else if(child.nodeType===1)visit(child)}};visit(root);let index=-1;return{nextNode(){index++;return index<nodes.length?(this.currentNode=nodes[index],true):false}}}};
  class FakeObserver{constructor(callback){observer=callback}observe(){}}
  const runtime={document,NodeFilter:{SHOW_TEXT:4},MutationObserver:FakeObserver,localStorage:{getItem:key=>runtimeStorage.get(key)||null,setItem:(key,value)=>runtimeStorage.set(key,value)}};runtime.globalThis=runtime;
  vm.runInNewContext(i18n,runtime);
  select.value='en';select.listeners.change();
  assert.equal(rootText.nodeValue,'Overview');assert.equal(document.documentElement.lang,'en-GB');
  const dynamic=new FakeText('Aggiungi passkey',body);body.append(dynamic);observer([{type:'childList',addedNodes:[dynamic]}]);
  assert.equal(dynamic.nodeValue,'Add passkey','anche gli elementi dinamici ricevono la lingua attiva');
  select.value='fr';select.listeners.change();
  assert.equal(rootText.nodeValue,'Vue d’ensemble');assert.equal(dynamic.nodeValue,'Ajouter une clé d’accès');
  assert.equal(runtimeStorage.get('atlas-language'),'fr');
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
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8'),/master-atlas-shell-v12/,'la cache PWA viene invalidata per caricare le lingue e il modulo IA');
});
test('La panoramica usa schede liquid glass e mantiene una griglia leggibile su telefono',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'../dist/glass-ui.css'),'utf8');
  assert.match(app,/class="dashboard-grid" aria-label="Riepilogo del tuo atlante"/);
  assert.match(app,/<article class="dashboard-card atlas-hero-card" aria-label="Atlante e panoramica"><div class="atlas-hero-globe">\$\{globeCard\(\)\}<\/div>[\s\S]*?<section class="distribution-card" aria-label="Panoramica del tuo atlante">[\s\S]*?<\/section><\/article>/,'atlante e panoramica condividono una sola hero card');
  assert.match(app,/class="distribution-donut \$\{europe\+extra[\s\S]*data-region-tab="Europa"/);
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
  assert.match(fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8'),/src="globe\.js" defer><\/script><script src="ai\.js" defer><\/script><script src="app\.js" defer/);
  const serviceWorker=fs.readFileSync(path.join(__dirname,'../dist/sw.js'),'utf8');
  assert.match(serviceWorker,/\/globe\.js/);
  assert.match(serviceWorker,/master-atlas-shell-v12/);
  assert.match(serviceWorker,/\/i18n\.js/);
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
test('Catalogo personale: il profilo nuovo parte vuoto e mostra solo le voci aggiunte',()=>{
  const main={innerHTML:''},el={open:false,addEventListener(){}};
  const sandbox={fixture:JSON.parse(JSON.stringify(catalog)),AtlasCore:Core,main,document:{querySelector(selector){return selector==='#main'?main:el},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){},scrollTo(){}},location:{hash:'#programs'},fetch:()=>new Promise(()=>{}),setTimeout,clearTimeout};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8')+`;D=fixture;basePrograms=D.programs.slice();baseUniversities=D.universities.slice();render=()=>{};view='programs';region='Tutte';state=AtlasCore.normalize(AtlasCore.empty(),D);syncPersonalCatalog(state);globalThis.newProfileCounts=[D.programs.length,D.universities.length];const program=basePrograms[0],university=baseUniversities[0];state.catalogPrograms[program.id]={included:true,updatedAt:10};state.catalogUniversities[university.id]={included:true,updatedAt:10};state.customPrograms.push({id:'custom-program-1',name:'Percorso personale',university:'Università personale',createdAt:10,updatedAt:10});state.customUniversities.push({id:'custom-uni-personale1',name:'Università personale',city:'Perugia',country:'Italia',region:'Europa',offer:'Biotecnologie',createdAt:10,updatedAt:10});syncPersonalCatalog(state);globalThis.selectedProgramIds=D.programs.map(p=>p.id);globalThis.selectedUniversityNames=D.universities.map(u=>u.name);view='universities';universities();globalThis.universityMarkup=main.innerHTML;state.catalogPrograms[program.id]={included:false,updatedAt:20};state.catalogUniversities[university.id]={included:false,updatedAt:20};syncPersonalCatalog(state);globalThis.afterRemoval=[D.programs.map(p=>p.id),D.universities.map(u=>u.name)];`,sandbox);
  assert.deepEqual(Array.from(sandbox.newProfileCounts),[0,0],'un nuovo profilo non eredita il catalogo predefinito');
  assert.deepEqual(Array.from(sandbox.selectedProgramIds),[catalog.programs[0].id,'custom-program-1']);
  assert.deepEqual(Array.from(sandbox.selectedUniversityNames),[catalog.universities[0].name,'Università personale']);
  assert.match(sandbox.universityMarkup,/Rimuovi dal mio catalogo/,'le università del profilo si possono eliminare dalla sezione');
  assert.deepEqual(JSON.parse(JSON.stringify(sandbox.afterRemoval)),[['custom-program-1'],['Università personale']],'rimuovere una voce condivisa la toglie solo dal catalogo corrente');
});
test('Migrazione catalogo: i profili esistenti partono vuoti conservando i dati e le modifiche successive si uniscono',()=>{
  const program=catalog.programs[0].id,university=catalog.universities[0].id;
  const legacy=Core.normalize({favorites:[program],preferences:'Biotecnologie',records:{[program]:{notes:'Nota da conservare',updatedAt:10}},catalogPrograms:{[program]:{included:true,updatedAt:10}},catalogUniversities:{[university]:{included:true,updatedAt:10}}},catalog);
  assert.deepEqual(legacy.catalogPrograms,{});assert.deepEqual(legacy.catalogUniversities,{});assert.deepEqual(legacy.favorites,[program]);assert.equal(legacy.records[program].notes,'Nota da conservare');assert.equal(legacy.preferences,'Biotecnologie');
  const old=Core.normalize({catalogVersion:1,catalogPrograms:{[program]:{included:false,updatedAt:20}},catalogUniversities:{[university]:{included:false,updatedAt:20}}},catalog);
  const newer=Core.normalize({catalogVersion:1,catalogPrograms:{[program]:{included:true,updatedAt:30}},catalogUniversities:{[university]:{included:true,updatedAt:30}}},catalog);
  const merged=Core.merge(old,newer);assert.equal(merged.catalogPrograms[program].included,true);assert.equal(merged.catalogUniversities[university].included,true);
});
test('Preferiti e candidature precedenti restano consultabili fuori dal catalogo personale',()=>{
  const program=catalog.programs[0],main={innerHTML:''},resultCount={textContent:''},results={innerHTML:''},search={value:''},el={open:false,addEventListener(){}},elements={'#main':main,'#result-count':resultCount,'#results':results,'#search':search};
  const sandbox={fixture:JSON.parse(JSON.stringify(catalog)),AtlasCore:Core,main,resultCount,results,search,document:{querySelector(selector){return elements[selector]||el},querySelectorAll(){return []},addEventListener(){}},window:{addEventListener(){},scrollTo(){}},location:{hash:'#favorites'},fetch:()=>new Promise(()=>{}),setTimeout,clearTimeout};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8')+`;D=fixture;basePrograms=D.programs.slice();baseUniversities=D.universities.slice();D.programs=[];D.universities=[];state=AtlasCore.normalize({favorites:[${JSON.stringify(program.id)}],records:{[${JSON.stringify(program.id)}]:{stage:'In preparazione',notes:'Nota conservata'}}},{programs:basePrograms,universities:baseUniversities,legacyIds:D.legacyIds});view='favorites';globalThis.previousFavorites=filtered().map(p=>p.id);catalog();globalThis.favoriteMarkup=main.innerHTML;globalThis.favoriteCount=resultCount.textContent;globalThis.favoriteResults=results.innerHTML;view='applications';applications();globalThis.previousApplication=main.innerHTML;`,sandbox);
  assert.deepEqual(Array.from(sandbox.previousFavorites),[program.id]);
  assert.match(sandbox.favoriteMarkup,new RegExp('data-region-tab=\"'+program.region+'\">'+program.region+' · 1'));const otherRegion=program.region==='Europa'?'Extra-Europa':'Europa';assert.match(sandbox.favoriteMarkup,new RegExp('data-region-tab=\"'+otherRegion+'\">'+otherRegion+' · 0'));assert.match(sandbox.favoriteMarkup,/data-region-tab=\"Tutte\">Tutte · 1/);assert.match(sandbox.favoriteCount,/^1 percorsi/);assert.match(sandbox.favoriteResults,/PRECEDENTE/);assert.match(sandbox.favoriteResults,/data-toggle-catalog-program/);
  assert.match(sandbox.previousApplication,new RegExp(program.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.match(sandbox.previousApplication,/In preparazione/);
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
test('Un account nuovo parte davvero da un catalogo vuoto, anche senza dati locali',()=>{
  const entries=new Map([['master-atlas-2027-v2',JSON.stringify({favorites:[first],records:{[first]:{notes:'Profilo condiviso precedente'}}})]]);
  const sandbox={AtlasCore:Core,ATLAS_CONFIG:{accounts:true,cloudSync:true},AtlasAuth:{currentUser:{id:'account-appena-creato'}},window:{addEventListener(){}},localStorage:{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)},setTimeout,clearTimeout};
  vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/storage.js'),'utf8')+';globalThis.Store=AtlasStore',sandbox);
  const store=new sandbox.Store(catalog,()=>{},()=>{});
  assert.deepEqual(store.state.catalogPrograms,{});assert.deepEqual(store.state.catalogUniversities,{});assert.deepEqual(store.state.favorites,[],'i dati locali non condivisi non migrano nel nuovo profilo');
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
  assert.deepEqual(fs.readdirSync(dir).sort(),['.nojekyll','ai.js','app.js','auth.css','auth.js','config.js','core.js','data.json','glass-ui.css','globe.js','i18n.js','icons','index.html','manifest.webmanifest','pwa.css','pwa.js','release.json','storage.js','style.css','sw.js'].sort());
  assert.deepEqual(fs.readdirSync(path.join(dir,'icons')).sort(),['atlas-180.png','atlas-192.png','atlas-512.png']);
  assert.ok(fs.readFileSync(path.join(dir,'icons/atlas-512.png')).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(dir,'config.js'),'utf8'),context);
  assert.equal(context.ATLAS_CONFIG.cloudSync,false);assert.equal(context.ATLAS_CONFIG.public,true);
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(html.includes('Sito pubblico'));assert.ok(!html.includes('Spazio privato'));assert.ok(html.includes('glass-ui.css'));assert.ok(html.includes('command-palette'));
  assert.ok(html.indexOf('src="config.js"')<html.indexOf('src="app.js"'));
  assert.ok(html.indexOf('src="globe.js"')<html.indexOf('src="app.js"'));
  assert.ok(html.includes('rel="manifest"'));assert.ok(fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes("url.pathname.startsWith('/api/')"));assert.ok(fs.readFileSync(path.join(dir,'sw.js'),'utf8').includes("'/glass-ui.css'"));
});
