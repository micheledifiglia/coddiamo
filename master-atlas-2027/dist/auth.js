(() => {
  const config=globalThis.ATLAS_CONFIG||{};
  const enabled=config.accounts===true;
  const gate=document.querySelector('#auth-gate');
  let resolveReady;
  const ready=new Promise(resolve=>{resolveReady=resolve;});
  const auth={currentUser:null,ready};
  globalThis.AtlasAuth=auth;

  if(!enabled){document.body.classList.remove('auth-pending');resolveReady(null);return;}

  const b64decode=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'=')),c=>c.charCodeAt(0));
  const b64encode=value=>{const bytes=new Uint8Array(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
  const convertOptions=(options,creation)=>{
    const publicKey={...options,challenge:b64decode(options.challenge)};
    if(creation)publicKey.user={...options.user,id:b64decode(options.user.id)};
    for(const key of ['allowCredentials','excludeCredentials'])if(options[key])publicKey[key]=options[key].map(item=>({...item,id:b64decode(item.id)}));
    return publicKey;
  };
  const serializeCredential=credential=>{
    const response={clientDataJSON:b64encode(credential.response.clientDataJSON)};
    if(credential.response.attestationObject)response.attestationObject=b64encode(credential.response.attestationObject);
    if(credential.response.authenticatorData)response.authenticatorData=b64encode(credential.response.authenticatorData);
    if(credential.response.signature)response.signature=b64encode(credential.response.signature);
    if(credential.response.userHandle)response.userHandle=b64encode(credential.response.userHandle);
    const result={id:credential.id,rawId:b64encode(credential.rawId),type:credential.type,response};
    if(typeof credential.response.getTransports==='function')result.response.transports=credential.response.getTransports();
    if(credential.authenticatorAttachment)result.authenticatorAttachment=credential.authenticatorAttachment;
    if(credential.getClientExtensionResults)result.clientExtensionResults=credential.getClientExtensionResults();
    return result;
  };
  const api=async(route,payload)=>{
    const response=await fetch(route,{method:payload===undefined?'GET':'POST',cache:'no-store',headers:payload===undefined?{}:{'content-type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload)});
    const data=await response.json().catch(()=>({error:'Risposta del server non valida.'}));
    if(!response.ok)throw Error(data.error||'Operazione non riuscita.');
    return data;
  };
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function view(message=''){
    gate.hidden=false;
    gate.innerHTML=`<div class="auth-card"><div class="auth-mark">m<span>·</span></div><div class="eyebrow">BIOSCIENCES · 2027</div><h1 id="auth-title">Il tuo atlante, sempre con te.</h1><p class="auth-intro">Crea un profilo o accedi con nome utente e passkey. I tuoi progressi si salvano online e si sincronizzano tra dispositivi.</p><form id="auth-form"><label for="auth-username">Nome utente</label><input id="auth-username" name="username" autocomplete="username" minlength="3" maxlength="32" pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}" required placeholder="es. michele_bio"><label class="auth-remember"><input id="auth-remember" type="checkbox"><span><strong>Resta connesso</strong><small>Conserva l’accesso su questo dispositivo per 30 giorni.</small></span></label><p id="auth-message" class="auth-message" role="status" aria-live="polite">${escape(message)}</p><div class="auth-actions"><button id="auth-login" type="button" class="button">Accedi con passkey</button><button id="auth-register" type="button" class="button primary">Crea profilo</button></div></form><p class="auth-footnote">Il passkey si sblocca con il metodo del tuo dispositivo, come impronta, volto o PIN. Master Atlas non riceve i tuoi dati biometrici. Aggiungi un passkey su un altro dispositivo: senza una copia, il profilo non è recuperabile.</p></div>`;
    document.querySelector('#auth-login').addEventListener('click',()=>login(false));
    document.querySelector('#auth-register').addEventListener('click',()=>register(false));
    document.querySelector('#auth-form').addEventListener('submit',event=>{event.preventDefault();login(false);});
  }
  function setMessage(message){const el=document.querySelector('#auth-message');if(el)el.textContent=message;}
  async function withBusy(action){
    const buttons=[...gate.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);setMessage('Attendi: verifica in corso…');
    try{await action();}catch(error){setMessage(error.message||'Operazione non riuscita.');}
    finally{buttons.forEach(b=>b.disabled=false);}
  }
  async function begin(route,username){
    const {flowId,publicKey}=await api(route,{username});
    const credential=route.includes('register')
      ?await navigator.credentials.create({publicKey:convertOptions(publicKey,true)})
      :await navigator.credentials.get({publicKey:convertOptions(publicKey,false)});
    if(!credential)throw Error('Operazione annullata.');
    return {flowId,response:serializeCredential(credential)};
  }
  async function login(addPasskey){
    const username=document.querySelector('#auth-username').value.trim().toLowerCase();
    if(!username){setMessage('Inserisci il nome utente del profilo.');document.querySelector('#auth-username').focus();return;}
    if(!window.PublicKeyCredential){setMessage('Questo browser non supporta i passkey. Prova con una versione aggiornata di Chrome, Safari, Firefox o Edge.');return;}
    await withBusy(async()=>{
      const flow=await begin('/api/auth/login/options',username);
      const {user}=await api('/api/auth/login/verify',{...flow,remember:document.querySelector('#auth-remember').checked});
      activate(user);
    });
  }
  async function register(addPasskey){
    const username=document.querySelector('#auth-username').value.trim().toLowerCase();
    if(!username){setMessage('Scegli prima un nome utente.');document.querySelector('#auth-username').focus();return;}
    if(!window.PublicKeyCredential){setMessage('Questo browser non supporta i passkey. Prova con una versione aggiornata di Chrome, Safari, Firefox o Edge.');return;}
    await withBusy(async()=>{
      const flow=await begin('/api/auth/register/options',username);
      const {user}=await api('/api/auth/register/verify',{...flow,remember:document.querySelector('#auth-remember').checked});
      activate(user);
    });
  }
  function activate(user){
    auth.currentUser=user;
    gate.hidden=true;document.body.classList.remove('auth-pending');
    const name=document.querySelector('#account-name');name.textContent=user.username;name.hidden=false;
    document.querySelector('#account-add-passkey').hidden=false;
    document.querySelector('#account-logout').hidden=false;
    resolveReady(user);
  }

  view();
  document.querySelector('#account-logout').addEventListener('click',async()=>{
    try{await api('/api/auth/logout',{});}finally{location.reload();}
  });
  document.querySelector('#account-add-passkey').addEventListener('click',async()=>{
    if(!window.PublicKeyCredential){alert('Questo browser non supporta i passkey.');return;}
    try{
      const {flowId,publicKey}=await api('/api/auth/passkeys/options',{});
      const credential=await navigator.credentials.create({publicKey:convertOptions(publicKey,true)});
      if(!credential)return;
      await api('/api/auth/passkeys/verify',{flowId,response:serializeCredential(credential)});
      setMessage('Nuovo passkey aggiunto al profilo.');alert('Nuovo passkey aggiunto al profilo.');
    }catch(error){alert(error.message||'Non è stato possibile aggiungere il passkey.');}
  });
  api('/api/auth/session').then(({user})=>activate(user)).catch(error=>{if(error.message==='Failed to fetch')setMessage('Server non raggiungibile. Riprova tra poco.');});
})();
