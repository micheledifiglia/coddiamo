const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Regression: ISSUE-001 — quick-search descriptions remained Italian in other locales.
// Found by /qa on 2026-10-19.
// Report: .gstack/qa-reports/qa-report-master-atlas-profili-2026-10-19.md
const context = {localStorage: {getItem: () => null, setItem: () => {}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/i18n.js'), 'utf8'), context);
const {translate} = context.AtlasI18n;

test('Le descrizioni della ricerca rapida sono localizzate e reversibili', () => {
  const descriptions = [
    'La tua home · riepilogo e classifiche',
    '208 programmi · ricerca e filtri',
    '27 atenei nel dossier',
    'Percorsi salvati e candidature',
    'Affianca fino a quattro percorsi',
    'Checklist e prossime scadenze',
    'Fonti, note e backup',
  ];
  for (const description of descriptions) {
    for (const language of ['en', 'es', 'fr', 'de']) {
      const localized = translate(description, language);
      assert.notEqual(localized, description, `${language}: ${description}`);
      assert.equal(translate(localized, 'it'), description, `${language} → it: ${description}`);
    }
  }
});
