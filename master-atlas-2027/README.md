# Master Atlas 2027

App privata per esplorare 208 percorsi e seguire le candidature. Frontend senza framework, API Cloudflare Worker, database D1 fornito da Sites. L'autenticazione e l'accesso al sito sono gestiti da Sites; l'API richiede l'identità autenticata e separa i dati per utente.

## Sviluppo e verifiche

1. Installare le dipendenze con `npm ci` (servono solo allo sviluppo e alla generazione delle migrazioni).
2. `python parse_data.py` rigenera il catalogo dal file versionato `data/dossier.md`. È possibile passare `--source` e `--output`.
3. `npm test` verifica identificativi, migrazione, filtri dei partner, conflitti dei backup, isolamento e concorrenza dell'API. Richiede Python 3 e Node.js 24 con `node:sqlite`.
4. `npm run build` genera `dist/server/index.js`. I file frontend in `dist/` sono sorgenti versionati; `dist/server/` è output ignorato.

Gli ID dei percorsi derivano da università e nome, mai dal ranking. `data/legacy-ids.json` è la mappa immutabile dei vecchi ID: non rigenerarla dopo un riordino. Se si rinomina un programma o cambia l'ateneo di riferimento, mantenere esplicitamente il precedente ID o predisporre una migrazione; non assegnare silenziosamente le note a un nuovo corso.

## Dati e recupero

La prima apertura migra i dati locali v1 senza eliminare la vecchia copia. Le modifiche si salvano automaticamente; una copia locale permette di lavorare offline. Dopo l'accesso, i dati si sincronizzano nel database privato. In caso di salvataggi concorrenti il server controlla la revisione e il client unisce le schede in base alla data di modifica. Per modifiche simultanee alla stessa scheda prevale la più recente; le versioni precedenti sono recuperabili.

L'app mantiene fino a 10 copie locali e 20 revisioni cloud. In **Dossier e legenda → Copie di recupero** è possibile scaricarle e importarle con anteprima. L'importazione mantiene le schede esistenti salvo scelta esplicita di sostituirle; crea prima una copia di recupero. I backup v1 restano importabili. Il cloud locale di anteprima non è il database di produzione.

## Pubblicazione verificata

Un push su GitHub da solo non pubblica il Worker su Sites. Per ogni attività Codex che cambia l'app, il flusso completo è:

1. Eseguire test e build; creare un commit descrittivo e verificare il push automatico.
2. Aprire il Site esistente con la skill Sites e credenziali temporanee, in un checkout separato dal repository GitHub.
3. `node scripts/prepare-release.mjs <checkout-sites>` copia soltanto il codice versionato, verificando che GitHub corrisponda al commit locale e che il Site sia quello corretto. Registra il commit GitHub in `.openai/release.json` del checkout Sites.
4. Nel checkout Sites, eseguire la build e il source helper con packaging; passare la sua apertura precedente e le credenziali soltanto tramite stdin. Pubblicare con il tool nativo privato, poi verificare lo stato terminale.
5. Riportare commit GitHub, URL e stato della pubblicazione. Un errore di deploy non deve essere presentato come un aggiornamento online riuscito.

Su Windows il packager del plugin deve usare Git Bash nel PATH e `TAR_OPTIONS=--force-local`; il Bash di WSL interpreta diversamente i percorsi Windows. Nessun token va salvato nel repository. L'hook di push è locale al PC e non viene trasferito clonando il repository.

## Database

Schema in `db/schema.ts`, migrazioni in `drizzle/`. Dopo una modifica allo schema: `npm run db:generate`, ispezione SQL, test e build. Le migrazioni già pubblicate non si modificano. Sites applica quelle pendenti durante il deploy. Nessuna creazione o alterazione di tabelle nelle richieste dell'app.
