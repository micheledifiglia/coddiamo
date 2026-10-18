/* Copies a clean GitHub source state to the already opened private Sites checkout. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const source=path.resolve(import.meta.dirname,'..');
const repository=execFileSync('git',['-C',path.resolve(source,'..'),'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const target=path.resolve(process.argv[2]||'');
if(!process.argv[2] || target===source || !fs.existsSync(path.join(target,'.git')))throw Error('Indica un checkout Sites separato, già aperto con site-workflow.');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'.openai/hosting.json')));
const other=JSON.parse(fs.readFileSync(path.join(target,'.openai/hosting.json')));
if(manifest.project_id!==other.project_id)throw Error('Il checkout appartiene a un altro Site.');
const git=(args)=>execFileSync('git',args,{cwd:repository,encoding:'utf8'}).trim();
if(git(['status','--porcelain']))throw Error('Prima completa controlli, commit e push del progetto.');
const sha=git(['rev-parse','HEAD']);
const remote=git(['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];
if(sha!==remote)throw Error('GitHub non è aggiornato al commit locale.');
const prefix=path.relative(repository,source).replaceAll(path.sep,'/')+'/';
const files=git(['ls-files','--',prefix]).split('\n').filter(Boolean).map(file=>file.slice(prefix.length)).filter(Boolean);
for(const file of files){
  const dest=path.join(target,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(source,file),dest);
}
fs.writeFileSync(path.join(target,'.openai/release.json'),JSON.stringify({github_commit:sha,prepared_at:new Date().toISOString()},null,2)+'\n');
console.log(JSON.stringify({project_id:manifest.project_id,github_commit:sha,checkout:target,files:files.length}));
