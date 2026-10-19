# Contribuire

Grazie per voler migliorare Marea. Mantieni le correzioni circoscritte, spiegane il motivo e verifica il comportamento interessato prima di aprire una pull request.

## Modifiche al catalogo

1. Aggiorna `master-atlas-2027/data/dossier.md`, mantenendo chiari fonti, date e condizioni da verificare.
2. Rigenera il catalogo con `python parse_data.py` dalla cartella `master-atlas-2027`.
3. Non modificare a mano `dist/data.json` e non ricreare `data/legacy-ids.json`: il parser e gli ID legacy proteggono preferiti e candidature già salvati.
4. Esegui `node --test tests/*.test.cjs` e controlla il diff generato.

## Modifiche al codice

Usa Node.js 24 e Python 3.12. Dalla cartella `master-atlas-2027`, esegui i test. GitHub Actions controlla catalogo e test; il sito pubblico è ospitato separatamente su Sites e non viene pubblicato dai push GitHub.

Non aggiungere credenziali, file `.env`, backup personali, database locali o archivi di deploy. Non alterare le migrazioni già applicate: aggiungi una nuova migrazione quando cambia lo schema.

## Pull request

Descrivi il problema, il risultato atteso e i controlli eseguiti. Per modifiche ai dati, indica le fonti e la data di verifica. Non includere note personali o backup nelle segnalazioni.
