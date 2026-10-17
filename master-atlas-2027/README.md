# Master Atlas 2027

App per esplorare 208 percorsi e seguire le candidature. Il sito pubblico ufficiale è:

- **Profili pubblici Sites:** https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/ — profili personali, accesso con nome utente e password o passkey e sincronizzazione cloud separata.
- **Copia privata Sites:** https://master-atlas-michele-2027.fair-swan-2763.chatgpt.site/ — accesso riservato al proprietario e sincronizzazione personale tramite Worker e D1.

Il sito pubblico Sites è la sola versione destinata ai visitatori. GitHub Pages è stato disattivato; il repository resta pubblico come codice sorgente. Ogni persona crea un profilo con nome utente e password, poi può aggiungere una passkey per accedere con il metodo sicuro del proprio dispositivo. Le password sono conservate nel database soltanto come hash PBKDF2-SHA-256 con sale univoco. La sessione persistente si rinnova mentre usi l’app e resta attiva su questo dispositivo finché non esci o cancelli i cookie. Una password dimenticata non può essere recuperata: aggiungi una passkey sincronizzata o salva la password in un gestore sicuro.

Nel menu **Profilo** puoi aggiungere una passkey, cambiare nome utente o eliminare il profilo, confermando con la parola `ELIMINA` e la password. L’eliminazione rimuove dati sincronizzati, passkey registrate e sessioni. Esporta prima un backup se vuoi conservare i progressi.

## Installazione su telefono

Master Atlas è una **web app installabile (PWA)** e usa lo stesso sito e profilo su iPhone e Android. Su iPhone apri il sito in Safari, tocca **Condividi → Aggiungi alla schermata Home**, attiva **Apri come app web** e conferma. Su Android usa il pulsante **Installa app** nell’interfaccia, oppure il menu del browser e scegli **Installa app** o **Aggiungi a schermata Home**. Non serve scaricarla da App Store o Play Store. La schermata dell’app può essere memorizzata per l’apertura offline, ma accesso e sincronizzazione dei dati personali richiedono Internet.

## Sviluppo e verifiche

1. Installare le dipendenze con `npm ci` (servono solo allo sviluppo e alla generazione delle migrazioni).
2. `python parse_data.py` rigenera il catalogo dal file versionato `data/dossier.md`. È possibile passare `--source` e `--output`.
3. `npm test` verifica identificativi, migrazione, filtri dei partner, conflitti dei backup, isolamento e concorrenza dell'API. Richiede Python 3 e Node.js 24 con `node:sqlite`.
4. `npm run build` genera il Worker privato; `npm run build:accounts` genera il Worker con accesso account e passkey. I file frontend in `dist/` sono sorgenti versionati; `dist/server/` è output ignorato.

Gli ID dei percorsi derivano da università e nome, mai dal ranking. `data/legacy-ids.json` è la mappa immutabile dei vecchi ID: non rigenerarla dopo un riordino. Se si rinomina un programma o cambia l'ateneo di riferimento, mantenere esplicitamente il precedente ID o predisporre una migrazione; non assegnare silenziosamente le note a un nuovo corso.

## Dati e recupero

La prima apertura migra i dati locali v1 senza eliminare la vecchia copia. Le modifiche si salvano automaticamente; una copia locale permette di lavorare offline. Dopo l'accesso, i dati si sincronizzano nel database privato. In caso di salvataggi concorrenti il server controlla la revisione e il client unisce le schede in base alla data di modifica. Per modifiche simultanee alla stessa scheda prevale la più recente; le versioni precedenti sono recuperabili.

L'app mantiene fino a 10 copie locali e 20 revisioni cloud. In **Dossier e legenda → Copie di recupero** è possibile scaricarle e importarle con anteprima. L'importazione mantiene le schede esistenti salvo scelta esplicita di sostituirle; crea prima una copia di recupero. I backup v1 restano importabili. Il cloud locale di anteprima non è il database di produzione.

## Pubblicazione verificata

### Profili pubblici: Sites

Il progetto Sites dei profili è separato dalla copia privata. Per aggiornarlo, fare prima commit e push su GitHub, poi usare un checkout Sites separato. `npm run prepare:public-accounts-release -- <checkout-sites>` copia i soli file tracciati dal commit verificato, preserva l'identità del progetto Sites e configura il binding D1 `DB`; non riutilizzare il `.openai/hosting.json` della copia privata. Il runtime richiede `ATLAS_AUTH_ORIGIN` e `ATLAS_RP_ID`, senza credenziali esterne. Eseguire `npm run build:accounts`, passare test e build al source helper Sites e pubblicare. La migrazione `0003` azzera i profili di prova già autorizzati; la `0004` aggiunge hash password e credenziali passkey. Il sito pubblico non rende pubblici i dati nel database: ogni richiesta richiede una sessione valida e le query sono isolate per profilo.

### Copia privata: Sites

Un push su GitHub non pubblica automaticamente i progetti Sites. Per aggiornare la copia privata, il flusso Sites è:

1. Eseguire test e build; creare un commit descrittivo e verificare il push automatico.
2. Aprire il Site esistente con la skill Sites e credenziali temporanee, in un checkout separato dal repository GitHub.
3. `node scripts/prepare-release.mjs <checkout-sites>` copia soltanto il codice versionato, verificando che GitHub corrisponda al commit locale e che il Site sia quello corretto. Registra il commit GitHub in `.openai/release.json` del checkout Sites.
4. Nel checkout Sites, eseguire la build e il source helper con packaging; passare la sua apertura precedente e le credenziali soltanto tramite stdin. Pubblicare con il tool nativo privato, poi verificare lo stato terminale.
5. Riportare commit GitHub, URL e stato della pubblicazione. Un errore di deploy non deve essere presentato come un aggiornamento online riuscito.

Su Windows il packager del plugin deve usare Git Bash nel PATH e `TAR_OPTIONS=--force-local`; il Bash di WSL interpreta diversamente i percorsi Windows. Nessun token va salvato nel repository. L'hook di push è locale al PC e non viene trasferito clonando il repository.

## Database

Schema in `db/schema.ts`, migrazioni in `drizzle/`. Dopo una modifica allo schema: `npm run db:generate`, ispezione SQL, test e build. Le migrazioni già pubblicate non si modificano. Sites applica quelle pendenti durante il deploy. Nessuna creazione o alterazione di tabelle nelle richieste dell'app.
