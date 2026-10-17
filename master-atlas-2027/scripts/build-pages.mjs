import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname,'..');
const out = path.join(root,'_site');
const files = ['index.html','style.css','app.js','core.js','storage.js','config.js','data.json'];
const allowed = new Set([...files,'.nojekyll','release.json']);
fs.mkdirSync(out,{recursive:true});
for(const file of fs.readdirSync(out)) {
  if(!allowed.has(file) || !fs.lstatSync(path.join(out,file)).isFile()) throw Error('File inatteso nella cartella pubblicabile: '+file);
}
for(const file of files) {
  let content = fs.readFileSync(path.join(root,'dist',file),'utf8');
  if(file==='config.js')content='globalThis.ATLAS_CONFIG = Object.freeze({public: true, cloudSync: false});\n';
  if(file==='index.html')content=content.replace('● Spazio privato','● Sito pubblico').replace('<span class="avatar">MD</span>','<span class="avatar">MA</span>');
  fs.writeFileSync(path.join(out,file),content);
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
const commit = process.env.GITHUB_SHA || execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
fs.writeFileSync(path.join(out,'release.json'),JSON.stringify({commit,mode:'public-local',builtAt:new Date().toISOString()},null,2)+'\n');
console.log('Sito pubblico pronto in '+out+' · dati personali salvati soltanto nel browser.');
