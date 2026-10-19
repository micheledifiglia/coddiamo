import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build as bundle} from 'esbuild';

const root = path.resolve(import.meta.dirname,'..');
const out = path.join(root,'_site');
await bundle({entryPoints:[path.join(root,'scripts/globe-client.js')],bundle:true,minify:true,format:'iife',platform:'browser',target:'es2020',outfile:path.join(root,'dist/globe.js'),logLevel:'silent'});
const files = ['index.html','style.css','glass-ui.css','app.js','ai.js','globe.js','core.js','storage.js','config.js','i18n.js','auth.js','auth.css','pwa.js','pwa.css','sw.js','manifest.webmanifest','data.json','icons/master-atlas-logo-v3.png'];
const allowed = new Set([...files,'.nojekyll','release.json']);
fs.mkdirSync(out,{recursive:true});
for(const icon of ['atlas-180.png','atlas-192.png','atlas-512.png','atlas-app-180.png','atlas-app-192.png','atlas-app-512.png','master-atlas-logo.png','master-atlas-logo-v2.png'])fs.rmSync(path.join(out,'icons',icon),{force:true});
for(const file of fs.readdirSync(out)) {
  const target=path.join(out,file),stat=fs.lstatSync(target);
  if(file==='icons'&&stat.isDirectory()){
    for(const icon of fs.readdirSync(target))if(!files.includes('icons/'+icon)||!fs.lstatSync(path.join(target,icon)).isFile())throw Error('Icona inattesa nella cartella pubblicabile: '+icon);
    continue;
  }
  if(!allowed.has(file)||!stat.isFile())throw Error('File inatteso nella cartella pubblicabile: '+file);
}
for(const file of files) {
  const source=path.join(root,'dist',file),target=path.join(out,file);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  if(file.endsWith('.png')){fs.copyFileSync(source,target);continue;}
  let content = fs.readFileSync(source,'utf8');
  if(file==='config.js')content='globalThis.ATLAS_CONFIG = Object.freeze({public: true, cloudSync: false});\n';
  if(file==='index.html')content=content.replace('● Spazio personale','● Sito pubblico').replace('<span class="avatar" id="account-avatar">MD</span>','<span class="avatar" id="account-avatar">MA</span>');
  fs.writeFileSync(target,content);
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
let commit = process.env.GITHUB_SHA || '';
for(const cwd of [root,path.dirname(root)]) {
  if(commit) break;
  try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{}
}
if(!commit)commit='local-build';
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({commit,mode:'public-local',builtAt:new Date().toISOString()},null,2)+'\n');
console.log('Sito pubblico pronto in '+out+' · dati personali salvati soltanto nel browser.');
