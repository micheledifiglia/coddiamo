/* Prompt handoff helpers: no provider key, account data, or catalog leaves this browser unless the user copies it. */
(function (root) {
  'use strict';
  const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const stages = ['Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto'];
  const languageText = {
    it: 'Rispondi nella lingua di questo messaggio.',
    en: 'Reply in the language of this message.',
    es: 'Responde en el idioma de este mensaje.',
    fr: 'Réponds dans la langue de ce message.',
    de: 'Antworte in der Sprache dieser Nachricht.'
  };
  function createPrompt(catalog, state, language = 'it') {
    const programs = [...(catalog.programs || []), ...(state.customPrograms || []).filter(item => !item.deletedAt)];
    const directory = programs.map(item => ({
      id: item.id, name: item.name, university: item.university, city: item.city || '',
      country: item.country || '', region: item.region || '', field: item.field || '', degree: item.degree || ''
    }));
    const context = {
      currentPreferences: state.preferences || '',
      currentShortlistIds: state.favorites || [],
      currentCompareIds: state.compare || [],
      existingCustomPrograms: (state.customPrograms || []).filter(item => !item.deletedAt).map(item => ({id: item.id, name: item.name, university: item.university, city: item.city, country: item.country, field: item.field, degree: item.degree, notes: clean(item.notes, 500)})),
      trackedApplications: Object.entries(state.records || {}).slice(0, 60).map(([programId, record]) => ({programId, stage: record.stage || '', deadline: record.deadline || '', notes: clean(record.notes, 800)})),
      availablePrograms: directory
    };
    return `Sei l’assistente personale di Marea, un atlante di percorsi universitari. Aiuta l’utente a personalizzare il proprio profilo in base alle sue preferenze e alle informazioni che fornisce. ${languageText[language] || languageText.it}

Usa SOLO gli ID presenti in availablePrograms. Non inventare requisiti, scadenze o fatti. Se manca un percorso preciso, proponi un elemento in customProgramsToAdd e marca le note come “Da verificare”; non presentarlo come verificato. Mantieni le candidature esistenti se l’utente non chiede di cambiarle. selectedProgramIds è la shortlist completa che l’utente vuole dopo la modifica: conserva le scelte già rilevanti e aggiungi/togli solo ciò che è coerente con la richiesta. Se la richiesta non contiene abbastanza informazioni, chiedi prima chiarimenti invece di produrre una modifica.

Se sei collegata al connettore MCP Marea, leggi prima il profilo e poi applica tutte le modifiche richieste con una sola chiamata a apply_atlas_plan. Altrimenti, quando puoi applicare le modifiche senza inventare dati, restituisci SOLO un oggetto JSON valido, senza Markdown o testo prima/dopo, in questo formato:
{"preferences":"obiettivi e criteri sintetici (max 2000 caratteri)","selectedProgramIds":["ID esistente"],"compareProgramIds":["fino a 4 ID esistenti"],"customProgramsToAdd":[{"name":"nome del percorso","university":"università","city":"città","country":"paese","region":"Europa oppure Extra-Europa","degree":"titolo","field":"area","url":"URL https:// oppure stringa vuota","notes":"Da verificare: ..."}],"applicationUpdates":[{"programId":"ID esistente","stage":"Da valutare | In preparazione | Inviata | Esito ricevuto","deadline":"YYYY-MM-DD oppure stringa vuota","deadlineUrl":"URL https:// oppure stringa vuota","notes":"testo","checklist":[0,1,2,3,4]}]}
Usa array vuoti quando non servono nuovi percorsi o aggiornamenti. Per le candidature includi solo campi che l’utente ha indicato. Non rimuovere candidature o percorsi personalizzati esistenti. Se non puoi ricavare una modifica affidabile, spiega cosa manca e non produrre JSON.

Richiesta dell’utente: [SCRIVI QUI COSA VUOI CAMBIARE]

Dati attuali del profilo e catalogo consentito:
${JSON.stringify(context)}`;
  }
  function parseResponse(raw, catalog, state) {
    if (typeof raw !== 'string' || raw.length > 100000) throw new Error('Incolla una risposta JSON valida, entro 100.000 caratteri.');
    const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    let value;
    try { value = JSON.parse(text); } catch { throw new Error('La risposta non è JSON valido. Chiedi all’IA di restituire soltanto il JSON richiesto.'); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('La risposta JSON deve essere un oggetto.');
    const available = new Set([...(catalog.programs || []).map(item => item.id), ...(state.customPrograms || []).filter(item => !item.deletedAt).map(item => item.id)]);
    if (!Array.isArray(value.selectedProgramIds) || value.selectedProgramIds.length > 308 || value.selectedProgramIds.some(id => typeof id !== 'string' || !available.has(id))) throw new Error('La shortlist deve contenere al massimo 308 ID presenti nel catalogo del tuo atlante.');
    if (value.compareProgramIds !== undefined && (!Array.isArray(value.compareProgramIds) || value.compareProgramIds.length > 4 || value.compareProgramIds.some(id => typeof id !== 'string' || !available.has(id)))) throw new Error('Il confronto può contenere fino a quattro percorsi presenti nel tuo atlante.');
    if (value.preferences !== undefined && (typeof value.preferences !== 'string' || value.preferences.length > 2000)) throw new Error('Le preferenze possono contenere al massimo 2.000 caratteri.');
    const customProgramsToAdd = value.customProgramsToAdd === undefined ? [] : value.customProgramsToAdd;
    if (!Array.isArray(customProgramsToAdd) || customProgramsToAdd.length > 30) throw new Error('Puoi importare fino a 30 nuovi percorsi per volta.');
    const custom = customProgramsToAdd.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Un percorso personale non ha un formato valido.');
      const name = clean(item.name, 180), university = clean(item.university, 140);
      if (name.length < 2 || university.length < 2) throw new Error('Ogni percorso personalizzato deve avere nome e università.');
      const url = clean(item.url, 1200);
      if (url) { try { if (new URL(url).protocol !== 'https:') throw Error(); } catch { throw new Error('I link dei percorsi devono usare HTTPS.'); } }
      return {name, university, city: clean(item.city, 100), country: clean(item.country, 100), region: item.region === 'Extra-Europa' ? 'Extra-Europa' : 'Europa', degree: clean(item.degree, 100), field: clean(item.field, 180), url, notes: clean(item.notes, 3000)};
    });
    const applicationUpdates = value.applicationUpdates === undefined ? [] : value.applicationUpdates;
    if (!Array.isArray(applicationUpdates) || applicationUpdates.length > 50) throw new Error('Puoi aggiornare fino a 50 candidature per volta.');
    const updates = applicationUpdates.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.programId !== 'string' || !available.has(item.programId)) throw new Error('Una candidatura indica un percorso non presente nel tuo atlante.');
      const output = {programId: item.programId};
      if (item.stage !== undefined) { if (!stages.includes(item.stage)) throw new Error('Uno stato candidatura non è valido.'); output.stage = item.stage; }
      if (item.deadline !== undefined) { if (typeof item.deadline !== 'string' || (item.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(item.deadline))) throw new Error('Una scadenza deve usare il formato YYYY-MM-DD.'); output.deadline = item.deadline; }
      if (item.deadlineUrl !== undefined) { const url = clean(item.deadlineUrl, 1200); if (url) { try { if (new URL(url).protocol !== 'https:') throw Error(); } catch { throw new Error('I link delle candidature devono usare HTTPS.'); } } output.deadlineUrl = url; }
      if (item.notes !== undefined) { if (typeof item.notes !== 'string' || item.notes.length > 5000) throw new Error('Le note importate non possono superare 5.000 caratteri per candidatura.'); output.notes = item.notes; }
      if (item.checklist !== undefined) { if (!Array.isArray(item.checklist) || item.checklist.length > 5 || item.checklist.some(i => !Number.isInteger(i) || i < 0 || i > 4)) throw new Error('Una checklist candidatura non è valida.'); output.checklist = [...new Set(item.checklist)]; }
      return output;
    });
    return {preferences: value.preferences, selectedProgramIds: [...new Set(value.selectedProgramIds)], compareProgramIds: value.compareProgramIds === undefined ? undefined : [...new Set(value.compareProgramIds)], customProgramsToAdd: custom, applicationUpdates: updates};
  }
  const api = {createPrompt, parseResponse};
  root.AtlasAI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
