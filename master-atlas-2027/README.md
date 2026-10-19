# Marea

App per esplorare 208 percorsi e seguire le candidature. Il sito pubblico ufficiale è:

**© 2026 Michele Di Figlia. Tutti i diritti riservati in tutto il mondo** per il codice e gli asset originali. Consulta la [licenza del progetto](../LICENSE); componenti e contenuti di terzi restano soggetti ai propri termini.

- **Profili pubblici Sites:** https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/ — profili personali, accesso con nome utente e password o passkey e sincronizzazione cloud separata.

Il sito pubblico Sites è la sola versione destinata ai visitatori. GitHub Pages è stato disattivato; il repository resta pubblico come codice sorgente. Ogni persona crea un profilo con nome utente e password, poi può aggiungere una passkey per accedere con il metodo sicuro del proprio dispositivo. Le password sono conservate nel database soltanto come hash PBKDF2-SHA-256 con sale univoco. La sessione persistente si rinnova mentre usi l’app e resta attiva su questo dispositivo finché non esci o cancelli i cookie. Una password dimenticata non può essere recuperata: aggiungi una passkey sincronizzata o salva la password in un gestore sicuro.

Nel menu **Profilo** puoi aggiungere una passkey, cambiare nome utente o eliminare il profilo, confermando con la parola `ELIMINA` e la password. L’eliminazione rimuove dati sincronizzati, passkey registrate e sessioni. Esporta prima un backup se vuoi conservare i progressi.

## Installazione su telefono

Marea è una **web app installabile (PWA)** e usa lo stesso sito e profilo su iPhone e Android. Su iPhone apri il sito in Safari, tocca **Condividi → Aggiungi alla schermata Home**, attiva **Apri come app web** e conferma. Su Android usa il pulsante **Installa app** nell’interfaccia, oppure il menu del browser e scegli **Installa app** o **Aggiungi a schermata Home**. Non serve scaricarla da App Store o Play Store. La schermata dell’app può essere memorizzata per l’apertura offline, ma accesso e sincronizzazione dei dati personali richiedono Internet.

## Personalizza con la tua IA

Dal menu **Profilo → Personalizza con IA** puoi usare qualunque assistente che hai già sul telefono, senza chiavi API o un abbonamento AI aggiuntivo. L’app prepara un prompt con il catalogo e il tuo atlante; incolli nella tua IA una richiesta come «interessano neuroscienze e ricerca sperimentale, aggiungi i percorsi compatibili e segui le candidature nel Regno Unito». Poi riporti la risposta JSON in Marea, controlli la shortlist, i nuovi percorsi, il confronto e le candidature, e scegli **Applica al mio atlante**. Le modifiche restano nel tuo profilo sincronizzato.

In alternativa, aggiungi `https://<indirizzo-del-sito>/api/atlas-mcp` come connettore MCP remoto. Al primo collegamento accedi a Marea e scegli i permessi: l’IA può leggere il tuo atlante e usare `apply_atlas_plan` per applicare preferenze, shortlist, confronto, percorsi personali e candidature in un’unica scrittura. Può anche cercare nel catalogo e aggiornare singoli elementi. Ogni profilo ha un catalogo personale vuoto, anche quelli creati prima di questa funzione: puoi aggiungere o rimuovere percorsi e università del dossier con i pulsanti **Aggiungi dal catalogo principale**, oppure creare voci tue. Note, candidature e preferenze esistenti restano conservate. Rimuovere un percorso dal catalogo cancella anche shortlist, confronto e candidatura di quel profilo; le voci degli altri account e il dossier principale restano invariati. In MCP puoi cercare gli atenei con `search_master_universities`, aggiungere o rimuovere percorsi con `add_catalog_program_to_my_atlas` e `remove_catalog_program_from_my_atlas`, aggiungere o rimuovere università con `add_catalog_university_to_my_atlas` e `remove_catalog_university_from_my_atlas`, oppure creare voci personali con `add_custom_program` e `add_custom_university`. I token sono associati al profilo, conservati come hash e revocabili in **Profilo → Personalizza con IA**; una persona non può accedere ai dati di un altro profilo. Claude consente di aggiungere il connettore dal web e usarlo anche su iOS/Android. ChatGPT abilita i server MCP personalizzati dal web per workspace Business/Enterprise/Edu; su telefono usa la modalità prompt. La modalità prompt trasferisce all’assistente soltanto ciò che scegli di copiare; non inserire password o dati sensibili nella richiesta.

## Sviluppo e verifiche

1. Installare le dipendenze con `npm ci` (servono solo allo sviluppo e alla generazione delle migrazioni).
2. `python parse_data.py` rigenera il catalogo dal file versionato `data/dossier.md`. È possibile passare `--source` e `--output`.
3. `npm test` verifica identificativi, migrazione, filtri dei partner, conflitti dei backup, isolamento e concorrenza dell'API. Richiede Python 3 e Node.js 24 con `node:sqlite`.
4. `npm run build` genera il Worker del sito pubblico con accesso account e passkey. I file frontend in `dist/` sono sorgenti versionati; `dist/server/` è output ignorato.

Gli ID dei percorsi derivano da università e nome, mai dal ranking. `data/legacy-ids.json` è la mappa immutabile dei vecchi ID: non rigenerarla dopo un riordino. Se si rinomina un programma o cambia l'ateneo di riferimento, mantenere esplicitamente il precedente ID o predisporre una migrazione; non assegnare silenziosamente le note a un nuovo corso.

## Dati e recupero

La prima apertura migra i dati locali v1 senza eliminare la vecchia copia. Le modifiche si salvano automaticamente; una copia locale permette di lavorare offline. Dopo l'accesso, i dati si sincronizzano nel database del sito pubblico e restano isolati per profilo. In caso di salvataggi concorrenti il server controlla la revisione e il client unisce le schede in base alla data di modifica. Per modifiche simultanee alla stessa scheda prevale la più recente; le versioni precedenti sono recuperabili.

L'app mantiene fino a 10 copie locali e 20 revisioni cloud. In **Dossier e legenda → Copie di recupero** è possibile scaricarle e importarle con anteprima. L'importazione mantiene le schede esistenti salvo scelta esplicita di sostituirle; crea prima una copia di recupero. I backup v1 restano importabili. Il cloud locale di anteprima non è il database di produzione.

## Pubblicazione verificata

### Sito pubblico: Sites

Per aggiornare il sito, fare prima commit e push su GitHub, poi usare il checkout Sites pubblico separato. `npm run prepare:public-accounts-release -- <checkout-sites>` copia i soli file tracciati dal commit verificato e controlla che il checkout appartenga proprio al progetto Sites pubblico; mantiene il binding D1 `DB`. Il runtime richiede `ATLAS_AUTH_ORIGIN` e `ATLAS_RP_ID`, senza credenziali esterne. Eseguire `npm run build`, passare test e build al source helper Sites e pubblicare. La migrazione `0003` azzera i profili di prova già autorizzati; la `0004` aggiunge hash password e credenziali passkey; la `0005` abilita client OAuth, consensi MCP, codici monouso e token per profilo. PBKDF2 usa 100.000 iterazioni perché il runtime Cloudflare Workers rifiuta valori superiori. Il catalogo è pubblico, mentre ogni richiesta dei dati personali richiede una sessione valida e le query sono isolate per profilo.

Un push su GitHub non pubblica automaticamente Sites. Per aggiornare il sito pubblico:

1. Eseguire test e build; creare un commit descrittivo e verificare il push automatico.
2. Aprire il Site pubblico esistente e il suo checkout, separato dal repository GitHub.
3. `npm run prepare:public-accounts-release -- <checkout-sites>` copia soltanto il codice versionato, verificando che GitHub corrisponda al commit locale e che il checkout appartenga al Site pubblico. Registra il commit GitHub in `.openai/release.json` del checkout Sites.
4. Nel checkout Sites, eseguire la build e il source helper con packaging; passare l'apertura precedente soltanto tramite stdin. Pubblicare con il tool Sites e verificare lo stato terminale.
5. Riportare commit GitHub, URL e stato della pubblicazione. Un errore di deploy non deve essere presentato come un aggiornamento online riuscito.

Su Windows il packager del plugin deve usare Git Bash nel PATH e `TAR_OPTIONS=--force-local`; il Bash di WSL interpreta diversamente i percorsi Windows. Nessun token va salvato nel repository. L'hook di push è locale al PC e non viene trasferito clonando il repository.

## Database

Schema in `db/schema.ts`, migrazioni in `drizzle/`. Dopo una modifica allo schema: `npm run db:generate`, ispezione SQL, test e build. Le migrazioni già pubblicate non si modificano. Sites applica quelle pendenti durante il deploy. Nessuna creazione o alterazione di tabelle nelle richieste dell'app.
