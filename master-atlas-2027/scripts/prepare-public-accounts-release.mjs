/* Copies a clean GitHub source state into the distinct public accounts Site checkout. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const source=path.resolve(import.meta.dirname,'..');
const target=path.resolve(process.argv[2]||'');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
if(!process.argv[2]||target===source||!fs.existsSync(path.join(target,'.git')))throw Error('Indica il checkout separato del nuovo Site, già aperto con site-workflow.');
const sourceConfig=readJson(path.join(source,'.openai/hosting.json'));
const targetConfigPath=path.join(target,'.openai/hosting.json');
if(!fs.existsSync(targetConfigPath))throw Error('Il checkout del nuovo Site non contiene .openai/hosting.json.');
const targetConfig=readJson(targetConfigPath);
if(!sourceConfig.project_id||!targetConfig.project_id||sourceConfig.project_id===targetConfig.project_id)throw Error('Il Site account deve avere un project_id distinto dal Site privato.');
if(targetConfig.d1&&targetConfig.d1!=='DB')throw Error('Il binding D1 del nuovo Site non è DB; correggere la configurazione prima del rilascio.');
targetConfig.d1='DB';
targetConfig.r2=null;
const git=args=>execFileSync('git',args,{cwd:source,encoding:'utf8'}).trim();
if(git(['status','--porcelain']))throw Error('Prima completa controlli, commit e push del progetto.');
const sha=git(['rev-parse','HEAD']);
const remote=git(['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];
if(sha!==remote)throw Error('GitHub non è aggiornato al commit locale.');
const files=git(['ls-files','--','.']).split('\n').filter(Boolean).filter(file=>!file.startsWith('.openai/'));
for(const file of files){
  const dest=path.join(target,file);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(path.join(source,file),dest);
}
fs.writeFileSync(targetConfigPath,JSON.stringify(targetConfig,null,2)+'\n');
fs.writeFileSync(path.join(target,'.openai/release.json'),JSON.stringify({github_commit:sha,prepared_at:new Date().toISOString(),mode:'public-password-passkey-accounts'},null,2)+'\n');
console.log(JSON.stringify({project_id:targetConfig.project_id,github_commit:sha,checkout:target,files:files.length}));
