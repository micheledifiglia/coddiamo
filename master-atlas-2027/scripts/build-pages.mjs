import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname,'..');
const out = path.join(root,'_site');
const files = ['index.html','style.css','app.js','core.js','storage.js','config.js','auth.js','auth.css','pwa.js','pwa.css','sw.js','manifest.webmanifest','data.json','icons/atlas-180.png','icons/atlas-192.png','icons/atlas-512.png'];
const allowed = new Set([...files,'.nojekyll','release.json']);
fs.mkdirSync(out,{recursive:true});
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
  if(file==='index.html')content=content.replace('● Spazio privato','● Sito pubblico').replace('<span class="avatar">MD</span>','<span class="avatar">MA</span>');
  fs.writeFileSync(target,content);
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
const commit = process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({commit,mode:'public-local',builtAt:new Date().toISOString()},null,2)+'\n');
console.log('Sito pubblico pronto in '+out+' · dati personali salvati soltanto nel browser.');
