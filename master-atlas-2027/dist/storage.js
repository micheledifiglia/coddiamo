/* Local recovery + authenticated D1 sync. No credentials in browser code. */
class AtlasStore {
  constructor(catalog, onChange, onStatus) {
    this.catalog = catalog; this.onChange = onChange; this.onStatus = onStatus;
    this.cloudSync = globalThis.ATLAS_CONFIG?.cloudSync !== false;
    const accountId=globalThis.ATLAS_CONFIG?.accounts===true?globalThis.AtlasAuth?.currentUser?.id:null;
    this.key = 'master-atlas-2027-v2'+(accountId?':'+accountId:''); this.revision = 0; this.pending = false; this.busy = false;
    this.state = AtlasCore.empty();
    try {
      const current = localStorage.getItem(this.key);
      const legacy = current || (accountId?null:localStorage.getItem('master-atlas-2027-v1'));
      this.state = AtlasCore.normalize(legacy ? JSON.parse(legacy) : {}, catalog);
      if (legacy && !current) this.snapshot(this.state,'Migrazione dalla prima versione');
    } catch { onStatus('Archivio locale non leggibile: usa un backup per recuperare i progressi.'); }
    this.writeLocal();
    this.storageListener = e => {
      if (e.key !== this.key || !e.newValue) return;
      try {
        const merged = AtlasCore.merge(this.state,AtlasCore.normalize(JSON.parse(e.newValue),catalog));
        if (JSON.stringify(merged) === JSON.stringify(this.state)) return;
        this.state = merged;
        this.writeLocal();
        this.onChange(this.state);
        if (this.cloudSync) {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => this.sync(),600);
        }
      } catch {}
    };
    window.addEventListener('storage',this.storageListener);
    window.addEventListener('online',()=>this.sync());
  }
  snapshots() {
    try {const rows=JSON.parse(localStorage.getItem(this.key+'-recovery') || '[]');return Array.isArray(rows)?rows:[];} catch {return []}
  }
  snapshot(state, reason) {
    try {
      const rows=this.snapshots();
      if (rows[0]?.body===JSON.stringify(state) && reason==='Salvataggio automatico') return;
      rows.unshift({at:new Date().toISOString(),reason,body:JSON.stringify(state)});
      localStorage.setItem(this.key+'-recovery',JSON.stringify(rows.slice(0,10)));
    } catch { /* Current state is still saved independently of recovery copies. */ }
  }
  writeLocal() {
    try {localStorage.setItem(this.key,JSON.stringify(this.state));return true;}
    catch {this.onStatus('Copia locale non disponibile: esporta un backup per conservare i progressi.');return false;}
  }
  save(state) {
    try {const prior=localStorage.getItem(this.key);if(prior)this.snapshot(JSON.parse(prior),'Salvataggio automatico');} catch {}
    this.state = AtlasCore.normalize(state,this.catalog); this.pending=true;
    const local=this.writeLocal();
    if(!this.cloudSync){this.pending=false;this.onStatus(local?'Salvato su questo browser · backup disponibile':'Esporta un backup: salvataggio locale non disponibile');return local;}
    this.onStatus(local?'Salvato nel browser · sincronizzazione…':'Sincronizzazione in corso…');
    clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),600);
    return local;
  }
  async start() {if(!this.cloudSync){this.onStatus('Dati personali su questo browser');return;}await this.sync();this.interval=setInterval(()=>this.sync(),20000);}
  async sync() {
    if(!this.cloudSync)return;
    if(this.busy)return;
    this.busy=true;
    try {
      for(let attempt=0;attempt<4;attempt++) {
        const response=await fetch('/api/state',{cache:'no-store',signal:AbortSignal.timeout(10000)});
        if(!response.ok){if(response.status===401&&globalThis.ATLAS_CONFIG?.accounts===true){this.onStatus('Sessione terminata · riaccedi per sincronizzare.');setTimeout(()=>location.reload(),1200);return;}throw Error(response.status===401?'Accedi con ChatGPT per sincronizzare.':'Offline · progressi conservati nel browser');}
        const remote=await response.json();
        const merged=AtlasCore.merge(this.state,AtlasCore.normalize(remote.state,this.catalog));
        this.state=merged;this.revision=remote.revision;this.writeLocal();this.onChange(this.state);
        if(JSON.stringify(merged)===JSON.stringify(AtlasCore.normalize(remote.state,this.catalog))) {
          this.pending=false;this.onStatus('Sincronizzato · copia locale disponibile');return;
        }
        const sent=JSON.stringify(merged);
        const put=await fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({state:merged,revision:this.revision}),signal:AbortSignal.timeout(10000)});
        if(put.status===409)continue;
        if(!put.ok)throw Error('Cloud non disponibile · progressi conservati nel browser');
        this.revision=(await put.json()).revision;
        if(JSON.stringify(this.state)!==sent)continue;
        this.pending=false;this.onStatus('Sincronizzato · copia locale disponibile');return;
      }
      this.onStatus('Modifiche concorrenti · nuovo tentativo automatico');
    } catch(error) {this.onStatus(error.message || 'Offline · progressi conservati nel browser');}
    finally {this.busy=false;}
  }
}
