# Aggiornamenti dell'app

- Applicare anche le istruzioni del repository principale.
- Il sito pubblico principale è GitHub Pages, aggiornato automaticamente dal workflow `.github/workflows/deploy-pages.yml` a ogni push su `main`. Terminare ogni modifica con test, build pubblica, commit descrittivo, push e verifica del workflow: il solo push non prova che il deploy sia riuscito.
- La copia privata su Sites rimane separata, con database D1 e autenticazione. Se cambia codice condiviso, aggiornare anche quella copia tramite la skill Sites, mantenendone l'accesso privato. Non renderla pubblica per aggirare l'autenticazione.
- Usare un checkout Sites separato e aperto con il source helper, senza spostare o alterare `.git` del repository principale. Eseguire `scripts/prepare-release.mjs` soltanto dopo il commit e il push: collega il codice pubblicato al commit GitHub e copia solo i file versionati.
- Seguire il flusso di pubblicazione in README.md e le istruzioni della skill Sites disponibile nella sessione. Non conservare credenziali temporanee in file o impostazioni Git.
- Non rigenerare `data/legacy-ids.json`: preservare la migrazione dei dati già salvati. Verificare il test di riordino delle classifiche dopo modifiche al parser.
- Non pubblicare dati personali di runtime, copie di recupero o archivi di deployment su GitHub. La build Pages deve includere soltanto i file della lista consentita, con `cloudSync: false`; i dati personali dei visitatori rimangono nel loro browser. La build Sites mantiene database privato, separazione tra utenti e controllo della revisione.
