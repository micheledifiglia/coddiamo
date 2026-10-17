# Master Atlas 2027

App per esplorare 208 percorsi e seguire le candidature. Il sito pubblico ufficiale è:

- **Profili pubblici Sites:** https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/ — profili personali, accesso con passkey e sincronizzazione cloud separata.
- **Copia privata Sites:** https://master-atlas-michele-2027.fair-swan-2763.chatgpt.site/ — accesso riservato al proprietario e sincronizzazione personale tramite Worker e D1.

Il sito pubblico Sites è la sola versione destinata ai visitatori. GitHub Pages è stato disattivato; il repository resta pubblico come codice sorgente. Nella versione profili, il nome utente identifica il profilo e il passkey sblocca la chiave del dispositivo; **Resta connesso** mantiene la sessione su quel dispositivo per 30 giorni. È possibile aggiungere fino a cinque passkey. Aggiungine uno su un secondo dispositivo: se perdi tutte le passkey, il profilo non è recuperabile automaticamente.

Nel menu **Profilo** puoi cambiare nome utente o eliminare il profilo, confermando entrambe le operazioni con una passkey. L’eliminazione rimuove dati sincronizzati, sessioni, credenziali passkey registrate sul server e la copia locale del dispositivo corrente. Esporta prima un backup se vuoi conservare i progressi; passkey salvate nel gestore del dispositivo e copie locali su altri dispositivi vanno rimosse separatamente.

## Sviluppo e verifiche

1. Installare le dipendenze con `npm ci` (servono solo allo sviluppo e alla generazione delle migrazioni).
2. `python parse_data.py` rigenera il catalogo dal file versionato `data/dossier.md`. È possibile passare `--source` e `--output`.
3. `npm test` verifica identificativi, migrazione, filtri dei partner, conflitti dei backup, isolamento e concorrenza dell'API. Richiede Python 3 e Node.js 24 con `node:sqlite`.
4. `npm run build` genera il Worker privato; `npm run build:accounts` genera il Worker con passkey. I file frontend in `dist/` sono sorgenti versionati; `dist/server/` è output ignorato.

Gli ID dei percorsi derivano da università e nome, mai dal ranking. `data/legacy-ids.json` è la mappa immutabile dei vecchi ID: non rigenerarla dopo un riordino. Se si rinomina un programma o cambia l'ateneo di riferimento, mantenere esplicitamente il precedente ID o predisporre una migrazione; non assegnare silenziosamente le note a un nuovo corso.

## Dati e recupero

La prima apertura migra i dati locali v1 senza eliminare la vecchia copia. Le modifiche si salvano automaticamente; una copia locale permette di lavorare offline. Dopo l'accesso, i dati si sincronizzano nel database privato. In caso di salvataggi concorrenti il server controlla la revisione e il client unisce le schede in base alla data di modifica. Per modifiche simultanee alla stessa scheda prevale la più recente; le versioni precedenti sono recuperabili.

L'app mantiene fino a 10 copie locali e 20 revisioni cloud. In **Dossier e legenda → Copie di recupero** è possibile scaricarle e importarle con anteprima. L'importazione mantiene le schede esistenti salvo scelta esplicita di sostituirle; crea prima una copia di recupero. I backup v1 restano importabili. Il cloud locale di anteprima non è il database di produzione.

## Pubblicazione verificata

### Profili pubblici: Sites

Il progetto Sites dei profili è separato dalla copia privata. Per aggiornarlo, fare prima commit e push su GitHub, poi usare un checkout Sites separato. `npm run prepare:public-accounts-release -- <checkout-sites>` copia i soli file tracciati dal commit verificato, preserva l'identità del nuovo progetto Sites e configura il binding D1 `DB`; non riutilizzare il `.openai/hosting.json` della copia privata. Eseguire `npm run build:accounts`, passare test e build al source helper Sites e pubblicare sul progetto con URL `master-atlas-profili-2027`. I valori `ATLAS_AUTH_ORIGIN` e `ATLAS_RP_ID` devono corrispondere all'origine HTTPS assegnata. L'accesso pubblico al sito non rende pubblici i dati nel database: ogni richiesta richiede una sessione valida e le query sono isolate per profilo.

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
