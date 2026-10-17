import fs from 'node:fs';
import path from 'node:path';
import {build as bundle} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const out=path.join(dist,'server');
const accounts=process.argv.includes('--accounts');
const files={'index.html':'text/html; charset=utf-8','config.js':'text/javascript; charset=utf-8','app.js':'text/javascript; charset=utf-8','core.js':'text/javascript; charset=utf-8','storage.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8','auth.js':'text/javascript; charset=utf-8','auth.css':'text/css; charset=utf-8','pwa.js':'text/javascript; charset=utf-8','pwa.css':'text/css; charset=utf-8','sw.js':'text/javascript; charset=utf-8','manifest.webmanifest':'application/manifest+json','data.json':'application/json','icons/atlas-180.png':'image/png','icons/atlas-192.png':'image/png','icons/atlas-512.png':'image/png'};
const assets=Object.fromEntries(Object.entries(files).map(([file,type])=>{
  const binary=type.startsWith('image/');
  let body=fs.readFileSync(path.join(dist,file),binary?null:'utf8');
  if(binary)body={encoding:'base64',value:body.toString('base64')};
  if(file==='config.js'&&accounts)body='globalThis.ATLAS_CONFIG = Object.freeze({public: true, cloudSync: true, accounts: true});\n';
  if(file==='index.html'&&accounts)body=body.replace('● Spazio privato','● Spazio personale').replace('<span class="avatar">MD</span>','<span class="avatar" id="account-avatar">MA</span>');
  return ['/'+file,{type,body}];
}));
fs.mkdirSync(out,{recursive:true});
fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});
if(accounts){
  const generated=path.join(out,'assets.generated.mjs');
  fs.writeFileSync(generated,'export default '+JSON.stringify(assets)+';\n');
  try{
    await bundle({entryPoints:[path.join(root,'worker/accounts-entry.mjs')],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:path.join(out,'index.js'),logLevel:'info'});
  }finally{fs.rmSync(generated,{force:true});}
}else{
  const core=fs.readFileSync(path.join(dist,'core.js'),'utf8');
  const handler=fs.readFileSync(path.join(root,'worker/handler.js'),'utf8');
  fs.writeFileSync(path.join(out,'index.js'),core+'\n'+handler+'\nconst assets = '+JSON.stringify(assets)+';\nconst handle=createHandler(assets,JSON.parse(assets["/data.json"].body),globalThis.AtlasCore);\nexport default {fetch:handle};\n');
}
fs.copyFileSync(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
console.log(accounts?'Worker pubblico con autenticazione passkey e database D1 generato.':'Worker privato e risorse generati; database D1 configurato.');
