const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const test=require('node:test');

const source=fs.readFileSync(path.join(__dirname,'../dist/pwa.js'),'utf8');

function createPwa({userAgent='Windows',standalone=false,serviceWorker=true}={}){
  const listeners=()=>({});
  const button={hidden:false,events:listeners(),addEventListener(type,handler){this.events[type]=handler}};
  const close={events:listeners(),addEventListener(type,handler){this.events[type]=handler}};
  const dialog={open:false,events:listeners(),addEventListener(type,handler){this.events[type]=handler},showModal(){this.open=true},close(){this.open=false},setAttribute(name){if(name==='open')this.open=true},removeAttribute(name){if(name==='open')this.open=false}};
  const steps={rows:[],replaceChildren(...rows){this.rows=rows}};
  const intro={textContent:''};
  const elements={'#install-app':button,'#install-dialog':dialog,'#install-steps':steps,'#install-intro':intro,'#install-close':close};
  const document={querySelector(selector){return elements[selector]||null},createElement(tag){return {tag,className:'',textContent:'',children:[],append(...children){this.children.push(...children)}}},addEventListener(){}};
  const window={events:listeners(),addEventListener(type,handler){this.events[type]=handler},matchMedia(){return {matches:standalone,addEventListener(){}}}};
  let updateCalls=0,registrationOptions;
  const navigator={userAgent,standalone,onLine:true,platform:'',maxTouchPoints:0};
  if(serviceWorker)navigator.serviceWorker={register(pathname,options){registrationOptions={pathname,options};return Promise.resolve({update(){updateCalls++;return Promise.resolve()}})}};
  vm.runInNewContext(source,{document,window,navigator,Promise});
  return {button,close,dialog,steps,intro,window,get updateCalls(){return updateCalls},get registrationOptions(){return registrationOptions},emit(type,event={}){window.events[type]?.(event)}};
}

test('L’installazione nativa accetta il prompt e nasconde il pulsante',async()=>{
  const app=createPwa();let prevented=false,promptCalls=0;
  app.emit('beforeinstallprompt',{preventDefault(){prevented=true},async prompt(){promptCalls++},userChoice:Promise.resolve({outcome:'accepted'})});
  await app.button.events.click();
  assert.equal(prevented,true);assert.equal(promptCalls,1);assert.equal(app.button.hidden,true);
});

test('Senza prompt mostra istruzioni iOS con passaggi accessibili',()=>{
  const app=createPwa({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'});
  app.button.events.click();
  assert.equal(app.dialog.open,true);assert.match(app.intro.textContent,/Safari/);assert.equal(app.steps.rows.length,3);
  assert.deepEqual(app.steps.rows.map(row=>row.children[1].textContent),['Apri questo sito in Safari e tocca Condividi.','Scegli “Aggiungi alla schermata Home”.','Attiva “Apri come app web”, poi tocca Aggiungi.']);
});

test('Se il prompt nativo genera un errore resta disponibile la guida manuale',async()=>{
  const app=createPwa();
  app.emit('beforeinstallprompt',{preventDefault(){},async prompt(){throw new Error('prompt non disponibile')}});
  await app.button.events.click();
  assert.equal(app.button.hidden,false);assert.equal(app.dialog.open,true);assert.equal(app.steps.rows.length,3);
});

test('L’app installata nasconde il pulsante e la vista standalone non lo mostra',()=>{
  const installed=createPwa();installed.emit('appinstalled');assert.equal(installed.button.hidden,true);
  const standalone=createPwa({standalone:true});assert.equal(standalone.button.hidden,true);
});

test('Il service worker controlla subito gli aggiornamenti senza riusare la cache HTTP',async()=>{
  const app=createPwa();app.emit('load');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(app.registrationOptions.pathname,'/sw.js');assert.equal(app.registrationOptions.options.updateViaCache,'none');assert.equal(app.updateCalls,1);
});
