const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = {localStorage: {getItem: () => null, setItem: () => {}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/i18n.js'), 'utf8'), context);
const {translate} = context.AtlasI18n;

test('Le schermate del profilo e del catalogo hanno traduzioni nelle cinque lingue', () => {
  for (const key of ['IL TUO CATALOGO, LE TUE SCELTE', 'Crea una voce personale', 'Rimuovi dal tuo catalogo?', 'Nome dell’università', 'La tua bussola.']) {
    for (const language of ['en', 'es', 'fr', 'de']) {
      assert.notEqual(translate(key, language), key, `${language}: ${key}`);
    }
  }
});

test('Le etichette dinamiche conservano numeri e ritornano alla lingua scelta', () => {
  for (const language of ['en', 'es', 'fr', 'de']) {
    const label = translate('3 DI 12 SELEZIONATE', language);
    assert.match(label, /3/);
    assert.match(label, /12/);
    assert.doesNotMatch(label, /SELEZIONATE/);
    assert.notEqual(translate('↓ Esporta backup JSON', language), '↓ Esporta backup JSON');
    assert.equal(translate(translate('La tua bussola.', language), 'it'), 'La tua bussola.');
  }
  assert.equal(translate('0 percorsi Europa e 0 extra-Europa', 'en'), '0 European programmes and 0 outside Europe');
  assert.equal(translate('208 percorsi disponibili · mostra i primi 60 · cerca per nome, ateneo o città', 'en'), '208 programmes available · showing the first 60 · search by name, university or city');
  assert.equal(translate('83 risultati nel catalogo principale · mostrati i primi 60', 'de'), '83 Ergebnisse im Hauptkatalog · die ersten 60 werden angezeigt');
  assert.equal(translate('Aggiungi', 'fr'), 'Ajouter');
  assert.equal(translate('Rimuovere “Neuroscienze molecolari” dal tuo catalogo personale? Saranno rimosse anche shortlist, confronto e candidatura associate.', 'en'), 'Remove “Neuroscienze molecolari” from your personal catalogue? Its shortlist, comparison and application will also be removed.');
  assert.equal(translate('Rimuovi Neuroscienze molecolari dal tuo catalogo', 'fr'), 'Retirer Neuroscienze molecolari de votre catalogue');
  assert.equal(translate('Revocare l’accesso di Claude a questo profilo?', 'de'), 'Claude den Zugriff auf dieses Profil entziehen?');
  assert.equal(translate('Atlante aggiornato · 2 nuovi percorsi personali', 'en'), 'Atlas updated · 2 new personal programmes');
  assert.equal(translate('Università aggiunta al tuo catalogo', 'es'), 'Universidad añadida a tu catálogo');
  assert.notEqual(translate('Eliminare definitivamente il profilo e tutti i dati sincronizzati? Questa azione non si può annullare.', 'fr'), 'Eliminare definitivamente il profilo e tutti i dati sincronizzati? Questa azione non si può annullare.');
  for (const language of ['en', 'es', 'fr', 'de']) assert.match(translate('Scrivi ELIMINA per confermare.', language), /ELIMINA/);
});

test('Gli errori API di account, MCP e sincronizzazione sono localizzati', () => {
  const messages = new Set();
  for (const file of ['../worker/passkeys.mjs', '../worker/mcp.js', '../worker/handler.js']) {
    const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const pattern = /(?:error\s*:\s*|throw\s+new\s+Error\s*\(\s*|return\s+json\s*\(\s*\{error\s*:\s*)(['"])(.*?)\1/gs;
    for (const match of source.matchAll(pattern)) messages.add(match[2]);
  }
  for (const message of messages) {
    if (/^[a-z_]+$/.test(message)) continue; // OAuth machine-readable error codes.
    for (const language of ['en', 'es', 'fr', 'de']) {
      assert.notEqual(translate(message, language), message, `${language}: ${message}`);
    }
  }
});
