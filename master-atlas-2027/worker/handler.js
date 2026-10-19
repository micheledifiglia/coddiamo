/* API authorization uses the identity supplied by Sites' authenticated dispatch. */
function createHandler(assets, catalog, Core, accountAuth = null, mcp = null) {
  const json = (value, status = 200) => new Response(JSON.stringify(value), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
  return async function handle(request, env) {
    const url = new URL(request.url);
    if (mcp) {
      const response = await mcp.handle(request,env);
      if (response) return response;
    }
    if (accountAuth && url.pathname.startsWith('/api/auth/')) return accountAuth.handle(request,env);
    if (!url.pathname.startsWith('/api/')) {
      if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
      const assetPath = url.pathname === '/' ? '/index.html' : url.pathname === '/favicon.ico' ? '/icons/marea-icon.png' : url.pathname;
      const asset = assets[assetPath];
      if (!asset) return new Response('Not found', {status:404});
      const body=asset.body?.encoding==='base64' ? Uint8Array.from(atob(asset.body.value),char=>char.charCodeAt(0)) : asset.body;
      return new Response(request.method === 'HEAD' ? null : body, {headers:{'content-type':asset.type,'cache-control':'no-cache','x-content-type-options':'nosniff'}});
    }
    const owner = accountAuth ? await accountAuth.resolveOwner(request,env) : null;
    if (!owner) return json({error:'Accesso ChatGPT richiesto'},401);
    if (!env.DB) return json({error:'Database non disponibile'},503);
    if (!['GET','PUT'].includes(request.method)) return json({error:'Metodo non consentito'},405);
    if (request.method === 'PUT' && request.headers.get('origin') !== url.origin) return json({error:'Origine non consentita'},403);
    try {
      await env.DB.prepare('INSERT OR IGNORE INTO atlas_states (owner, body, revision) VALUES (?, ?, 0)').bind(owner,JSON.stringify(Core.empty())).run();
      const row = await env.DB.prepare('SELECT body, revision FROM atlas_states WHERE owner = ?').bind(owner).first();
      if (url.pathname === '/api/state' && request.method === 'GET') return json({state:JSON.parse(row.body), revision:row.revision});
      if (url.pathname === '/api/backups' && request.method === 'GET') {
        const rows = await env.DB.prepare('SELECT revision, created_at FROM atlas_history WHERE owner = ? ORDER BY revision DESC LIMIT 20').bind(owner).all();
        return json({backups:rows.results});
      }
      const backup = /^\/api\/backups\/(\d+)$/.exec(url.pathname);
      if (backup && request.method === 'GET') {
        const r = await env.DB.prepare('SELECT body FROM atlas_history WHERE owner = ? AND revision = ?').bind(owner,Number(backup[1])).first();
        return r ? json({app:'marea',version:2,state:JSON.parse(r.body)}) : json({error:'Backup non trovato'},404);
      }
      if (url.pathname !== '/api/state' || request.method !== 'PUT') return json({error:'Non trovato'},404);
      if (Number(request.headers.get('content-length') || 0) > 2000000) return json({error:'Dati troppo grandi'},413);
      const text = await request.text();
      if (text.length > 2000000) return json({error:'Dati troppo grandi'},413);
      let input; try {input = JSON.parse(text)} catch {return json({error:'JSON non valido'},400)}
      if (!Number.isInteger(input.revision) || !input.state || typeof input.state !== 'object') return json({error:'Formato non valido'},400);
      if (input.revision !== row.revision) return json({state:JSON.parse(row.body),revision:row.revision},409);
      const body = JSON.stringify(Core.normalize(input.state,catalog));
      const result = await env.DB.batch([
        env.DB.prepare('UPDATE atlas_states SET body = ?, revision = revision + 1 WHERE owner = ? AND revision = ?').bind(body,owner,row.revision),
        env.DB.prepare('INSERT OR IGNORE INTO atlas_history (owner, revision, body, created_at) SELECT ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM atlas_states WHERE owner = ? AND revision = ? AND body = ?)').bind(owner,row.revision,row.body,new Date().toISOString(),owner,row.revision+1,body),
        env.DB.prepare('DELETE FROM atlas_history WHERE owner = ? AND revision < ?').bind(owner,Math.max(0,row.revision-19))
      ]);
      if (!result[0].meta.changes) {
        const current = await env.DB.prepare('SELECT body, revision FROM atlas_states WHERE owner = ?').bind(owner).first();
        return json({state:JSON.parse(current.body),revision:current.revision},409);
      }
      return json({revision:row.revision+1});
    } catch (error) {return json({error:'Salvataggio remoto temporaneamente indisponibile'},503)}
  };
}
if (typeof module !== 'undefined' && module.exports) module.exports = {createHandler};
