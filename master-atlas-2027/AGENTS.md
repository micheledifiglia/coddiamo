# Aggiornamenti dell'app

- Applicare anche le istruzioni del repository principale.
- Ogni attività che modifica il comportamento o i dati dell'app deve terminare con test, build, commit descrittivo, push verificato e aggiornamento del Site privato esistente tramite la skill Sites. La sola riuscita del push GitHub non significa che l'app online sia aggiornata.
- Usare un checkout Sites separato e aperto con il source helper, senza spostare o alterare `.git` del repository principale. Eseguire `scripts/prepare-release.mjs` soltanto dopo il commit e il push: collega il codice pubblicato al commit GitHub e copia solo i file versionati.
- Seguire il flusso di pubblicazione in README.md e le istruzioni della skill Sites disponibile nella sessione. Non conservare credenziali temporanee in file o impostazioni Git.
- Non rigenerare `data/legacy-ids.json`: preservare la migrazione dei dati già salvati. Verificare il test di riordino delle classifiche dopo modifiche al parser.
- Non pubblicare dati personali di runtime, copie di recupero o archivi di deployment su GitHub. Usare il database privato, mantenendo separazione tra utenti e controllo della revisione.
