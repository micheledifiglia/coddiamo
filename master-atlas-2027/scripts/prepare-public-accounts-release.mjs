/* Copies a clean GitHub source state into the public accounts Site checkout. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const source=path.resolve(import.meta.dirname,'..');
const repository=execFileSync('git',['-C',path.resolve(source,'..'),'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const target=path.resolve(process.argv[2]||'');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
if(!process.argv[2]||target===source||!fs.existsSync(path.join(target,'.git')))throw Error('Indica il checkout separato del Site pubblico esistente, già aperto con site-workflow.');
const sourceConfig=readJson(path.join(source,'.openai/hosting.json'));
const targetConfigPath=path.join(target,'.openai/hosting.json');
if(!fs.existsSync(targetConfigPath))throw Error('Il checkout del Site pubblico non contiene .openai/hosting.json.');
const targetConfig=readJson(targetConfigPath);
if(!sourceConfig.project_id||!targetConfig.project_id||sourceConfig.project_id!==targetConfig.project_id)throw Error('Il checkout deve corrispondere al progetto Sites pubblico configurato.');
if(targetConfig.d1&&targetConfig.d1!=='DB')throw Error('Il binding D1 del Site pubblico non è DB; correggere la configurazione prima del rilascio.');
targetConfig.d1='DB';
targetConfig.r2=null;
const git=args=>execFileSync('git',args,{cwd:repository,encoding:'utf8'}).trim();
if(git(['status','--porcelain']))throw Error('Prima completa controlli, commit e push del progetto.');
const sha=git(['rev-parse','HEAD']);
const remote=git(['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];
if(sha!==remote)throw Error('GitHub non è aggiornato al commit locale.');
const prefix=path.relative(repository,source).replaceAll(path.sep,'/')+'/';
const files=git(['ls-files','--',prefix]).split('\n').filter(Boolean).map(file=>file.slice(prefix.length)).filter(file=>file&&!file.startsWith('.openai/'));
for(const file of files){
  const dest=path.join(target,file);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.copyFileSync(path.join(source,file),dest);
}
for(const icon of ['atlas-180.png','atlas-192.png','atlas-512.png','atlas-app-180.png','atlas-app-192.png','atlas-app-512.png','master-atlas-logo.png','master-atlas-logo-v2.png','master-atlas-logo-v3.png'])fs.rmSync(path.join(target,'dist/icons',icon),{force:true});
fs.writeFileSync(targetConfigPath,JSON.stringify(targetConfig,null,2)+'\n');
fs.writeFileSync(path.join(target,'.openai/release.json'),JSON.stringify({github_commit:sha,prepared_at:new Date().toISOString(),mode:'public-password-passkey-accounts'},null,2)+'\n');
console.log(JSON.stringify({project_id:targetConfig.project_id,github_commit:sha,checkout:target,files:files.length}));
