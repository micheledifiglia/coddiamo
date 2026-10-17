'use strict';
(()=>{
  const button=document.querySelector('#install-app');
  const dialog=document.querySelector('#install-dialog');
  const steps=document.querySelector('#install-steps');
  if(!button||!dialog||!steps)return;
  let installPrompt=null;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const renderSteps=(items)=>{steps.replaceChildren(...items.map((text,index)=>{const row=document.createElement('p');const number=document.createElement('span');number.className='install-step-number';number.textContent=String(index+1);const label=document.createElement('span');label.textContent=text;row.append(number,label);return row;}));};
  const openGuide=()=>{
    const ua=navigator.userAgent;
    const apple=/iPhone|iPad|iPod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    document.querySelector('#install-intro').textContent=apple?'Da Safari, aggiungi Master Atlas alla schermata Home e aprilo come app.':'Dal menu del browser scegli “Installa app” o “Aggiungi a schermata Home”.';
    renderSteps(apple?['Apri questo sito in Safari e tocca Condividi.','Scegli “Aggiungi alla schermata Home”.','Attiva “Apri come app web”, poi tocca Aggiungi.']:['Apri il menu ⋮ del browser.','Tocca “Installa app” o “Aggiungi a schermata Home”.','Conferma l’installazione.']);
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  };
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  window.addEventListener('appinstalled',()=>{installPrompt=null;button.hidden=true;});
  button.addEventListener('click',async()=>{
    if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();const result=await prompt.userChoice;if(result?.outcome==='accepted')button.hidden=true;return;}
    openGuide();
  });
  document.querySelector('#install-close')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  const syncVisibility=()=>{button.hidden=standalone();};
  syncVisibility();
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change',syncVisibility);
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}),{once:true});
})();
