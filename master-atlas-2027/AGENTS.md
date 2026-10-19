# Aggiornamenti dell'app

- Applicare anche le istruzioni del repository principale.
- Il solo sito dell'app è il progetto Sites pubblico dei profili. GitHub contiene il sorgente e i controlli, non una seconda distribuzione. Per ogni modifica eseguire test e build, poi preparare e verificare il rilascio pubblico seguendo `README.md`.
- Usare il checkout separato del Site pubblico e `npm run prepare:public-accounts-release -- <checkout-sites>` soltanto dopo commit e push; lo script copia i file tracciati e verifica l'identità del progetto Sites.
- Preservare il catalogo pubblico e l'isolamento dei dati personali per account. Ogni richiesta di profilo richiede una sessione valida; non usare l'identità del visitatore fornita da un header come autenticazione di ripiego.
- Non conservare credenziali temporanee, dati personali di runtime, copie di recupero o archivi di deployment in GitHub.
- Non rigenerare `data/legacy-ids.json`: preservare la migrazione dei dati già salvati. Verificare il test di riordino delle classifiche dopo modifiche al parser.
