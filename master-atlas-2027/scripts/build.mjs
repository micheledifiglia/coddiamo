import fs from 'node:fs';
import path from 'node:path';
import {build as bundle} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'dist');
const out=path.join(dist,'server');
const files={'index.html':'text/html; charset=utf-8','config.js':'text/javascript; charset=utf-8','app.js':'text/javascript; charset=utf-8','globe.js':'text/javascript; charset=utf-8','ai.js':'text/javascript; charset=utf-8','i18n.js':'text/javascript; charset=utf-8','core.js':'text/javascript; charset=utf-8','storage.js':'text/javascript; charset=utf-8','style.css':'text/css; charset=utf-8','auth.js':'text/javascript; charset=utf-8','auth.css':'text/css; charset=utf-8','pwa.js':'text/javascript; charset=utf-8','pwa.css':'text/css; charset=utf-8','glass-ui.css':'text/css; charset=utf-8','sw.js':'text/javascript; charset=utf-8','manifest.webmanifest':'application/manifest+json','data.json':'application/json','icons/marea-icon.png':'image/png'};
const assets=Object.fromEntries(Object.entries(files).map(([file,type])=>{
  const binary=type.startsWith('image/');
  let body=fs.readFileSync(path.join(dist,file),binary?null:'utf8');
  if(binary)body={encoding:'base64',value:body.toString('base64')};
  return ['/'+file,{type,body}];
}));
fs.mkdirSync(out,{recursive:true});
fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});
const generated=path.join(out,'assets.generated.mjs');
fs.writeFileSync(generated,'export default '+JSON.stringify(assets)+';\n');
try{
  await bundle({entryPoints:[path.join(root,'worker/accounts-entry.mjs')],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:path.join(out,'index.js'),logLevel:'info'});
}finally{fs.rmSync(generated,{force:true});}
fs.copyFileSync(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
console.log('Worker pubblico con profili, password, passkey e sincronizzazione isolata generato.');
