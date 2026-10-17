(() => {
  const config = globalThis.ATLAS_CONFIG || {};
  const gate = document.querySelector('#auth-gate');
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const auth = {currentUser: null, ready};
  globalThis.AtlasAuth = auth;
  if (config.accounts !== true) {document.body.classList.remove('auth-pending'); resolveReady(null); return;}

  const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const api = async (route, payload) => {
    const response = await fetch(route, {method: payload === undefined ? 'GET' : 'POST', cache: 'no-store', headers: payload === undefined ? {} : {'content-type': 'application/json'}, body: payload === undefined ? undefined : JSON.stringify(payload)});
    const data = await response.json().catch(() => ({error: 'Risposta del server non valida.'}));
    if (!response.ok) throw Error(data.error || 'Operazione non riuscita.');
    return data;
  };
  const errors = {cancelled: 'Accesso annullato.', provider: 'Il provider non ha completato l’accesso. Riprova.', verify: 'Non è stato possibile verificare l’identità. Riprova.', unavailable: 'Accesso Google e Apple non ancora configurato.'};
  const query = new URLSearchParams(location.search);
  const initialMessage = errors[query.get('auth_error')] || '';
  if (query.has('auth_error') || query.has('signed_in')) history.replaceState(null, '', location.pathname + location.hash);
  const providerIcon = provider => provider === 'google'
    ? '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z"/><path fill="#EA4335" d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.2l6.8 5.3C14.2 15.7 18.7 12.1 24 12.1Z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.37 12.44c.03 3.13 2.74 4.17 2.77 4.19-.02.07-.43 1.49-1.42 2.95-.86 1.27-1.76 2.53-3.17 2.56-1.39.03-1.84-.82-3.44-.82-1.6 0-2.1.79-3.42.85-1.37.05-2.42-1.37-3.29-2.63-1.79-2.59-3.16-7.32-1.32-10.51a5.09 5.09 0 0 1 4.29-2.6c1.34-.03 2.61.9 3.44.9.82 0 2.36-1.1 3.98-.94.68.03 2.6.27 3.83 2.07-.1.06-2.29 1.33-2.27 3.98ZM13.76 4.7A4.9 4.9 0 0 1 17.4 2.8a4.86 4.86 0 0 1-1.14 3.63 4.17 4.17 0 0 1-3.52 1.67 4.53 4.53 0 0 1 1.02-3.4Z"/></svg>';

  function showGate(message, mode) {
    gate.hidden = false;
    const buttons = mode === 'oauth'
      ? '<a class="auth-provider-button" href="/api/auth/google/start">' + providerIcon('google') + '<span>Continua con Google</span></a><a class="auth-provider-button" href="/api/auth/apple/start">' + providerIcon('apple') + '<span>Continua con Apple</span></a>'
      : '<button class="auth-provider-button" disabled>' + providerIcon('google') + '<span>Continua con Google</span></button><button class="auth-provider-button" disabled>' + providerIcon('apple') + '<span>Continua con Apple</span></button>';
    gate.innerHTML = `<div class="auth-card"><div class="auth-mark">m<span>·</span></div><div class="eyebrow">BIOSCIENCES · 2027</div><h1 id="auth-title">Il tuo atlante, sempre con te.</h1><p class="auth-intro">Accedi in modo sicuro per ritrovare percorsi, università e candidature su ogni dispositivo.</p><div class="auth-actions">${buttons}</div><p id="auth-message" class="auth-message" role="status" aria-live="polite">${escape(message || (mode === 'oauth' ? 'Scegli come accedere.' : errors.unavailable))}</p><p class="auth-footnote">La sessione si rinnova quando usi l’app. Puoi uscire in qualsiasi momento dal menu profilo. Google e Apple gestiscono le credenziali del tuo account.</p></div>`;
  }
  function activate(user) {
    auth.currentUser = user;
    gate.hidden = true;
    document.body.classList.remove('auth-pending');
    const name = document.querySelector('#account-name');
    name.textContent = user.name || user.email || 'Profilo'; name.hidden = false;
    document.querySelector('#account-manage-profile').hidden = false;
    document.querySelector('#account-logout').hidden = false;
    resolveReady(user);
  }
  const profileDialog = document.querySelector('#profile-dialog');
  const profileMessage = document.querySelector('#profile-message');
  document.querySelector('#account-manage-profile').addEventListener('click', () => {
    const user = auth.currentUser;
    document.querySelector('#profile-email').textContent = user?.email || 'Email non condivisa';
    document.querySelector('#profile-provider').textContent = user?.provider === 'apple' ? 'Apple' : 'Google';
    document.querySelector('#profile-delete-confirm').value = '';
    profileMessage.textContent = '';
    profileDialog.showModal();
  });
  document.querySelector('#profile-close').addEventListener('click', () => profileDialog.close());
  document.querySelector('#profile-delete-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (document.querySelector('#profile-delete-confirm').value.trim() !== 'ELIMINA') {profileMessage.textContent = 'Scrivi ELIMINA per confermare.'; return;}
    if (!window.confirm('Eliminare definitivamente il profilo e tutti i dati sincronizzati? Questa azione non si può annullare.')) return;
    const button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true; profileMessage.textContent = 'Eliminazione in corso…';
    try {
      await api('/api/auth/profile/delete', {confirm: 'ELIMINA'});
      const storageKey = `master-atlas-2027-v2:${auth.currentUser.id}`;
      try {localStorage.removeItem(storageKey); localStorage.removeItem(`${storageKey}-recovery`);} catch {}
      location.reload();
    } catch (error) {profileMessage.textContent = error.message || 'Non è stato possibile eliminare il profilo.';}
    finally {button.disabled = false;}
  });
  document.querySelector('#account-logout').addEventListener('click', async () => {try {await api('/api/auth/logout', {});} finally {location.reload();}});

  api('/api/auth/mode').then(async ({mode}) => {
    if (mode !== 'oauth') {showGate(initialMessage, 'unavailable'); resolveReady(null); return;}
    try {const {user} = await api('/api/auth/session'); activate(user);}
    catch {showGate(initialMessage, 'oauth'); resolveReady(null);}
  }).catch(() => {showGate('Server non raggiungibile. Riprova tra poco.', 'unavailable'); resolveReady(null);});
})();
