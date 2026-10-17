import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
const root=path.resolve(import.meta.dirname,'..');
fs.mkdirSync(path.join(root,'.openai/local'),{recursive:true});
const db=new DatabaseSync(path.join(root,'.openai/local/preview.sqlite'));
db.exec('CREATE TABLE IF NOT EXISTS preview_migrations (name TEXT PRIMARY KEY)');
for(const file of fs.readdirSync(path.join(root,'drizzle')).filter(f=>f.endsWith('.sql')).sort()) {
  if(db.prepare('SELECT name FROM preview_migrations WHERE name = ?').get(file))continue;
  db.exec('BEGIN');
  try{db.exec(fs.readFileSync(path.join(root,'drizzle',file),'utf8'));db.prepare('INSERT INTO preview_migrations VALUES (?)').run(file);db.exec('COMMIT');}
  catch(error){db.exec('ROLLBACK');throw error;}
}
const accountPreview=process.argv.includes('--accounts');
const env={...(accountPreview?{ATLAS_AUTH_ORIGIN:'http://localhost:8790',ATLAS_RP_ID:'localhost'}:{}),DB:{prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {async run(){const r=stmt.run(...values);return {meta:{changes:r.changes}}},async first(){return stmt.get(...values)||null},async all(){return {results:stmt.all(...values)}}}}}},async batch(statements){db.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());db.exec('COMMIT');return result}catch(e){db.exec('ROLLBACK');throw e}}}};
const {default:worker}=await import('../dist/server/index.js?preview='+Date.now());
const server=http.createServer(async(req,res)=>{
  try{
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    const headers=new Headers(req.headers);if(!accountPreview)headers.set('oai-authenticated-user-id','local-preview-only');
    const request=new Request(`${accountPreview?'http://localhost':'http://127.0.0.1'}:8790${req.url}`,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
    const response=await worker.fetch(request,env,{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){res.writeHead(500);res.end('Errore anteprima locale');console.error(error.message);}
});
server.listen(8790,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8790 · database di anteprima separato'));
