<p align="center">
  <img src="docs/media/master-atlas-banner.svg" alt="Master Atlas 2027 — un atlante personale per esplorare percorsi magistrali in bioscienze" width="100%">
</p>

<p align="center">
  <a href="https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/"><strong>Apri il sito pubblico</strong></a>
  ·
  <a href="master-atlas-2027/README.md">Guida tecnica</a>
  ·
  <a href="CONTRIBUTING.md">Contribuire</a>
</p>

<p align="center">
  <a href="https://github.com/micheledifiglia/coddiamo/actions/workflows/quality.yml"><img src="https://github.com/micheledifiglia/coddiamo/actions/workflows/quality.yml/badge.svg?branch=main" alt="Stato dei controlli automatici"></a>
  <a href="https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/"><img src="https://img.shields.io/badge/sito-pubblico-246b50" alt="Sito pubblico"></a>
  <img src="https://img.shields.io/badge/lingua-italiano-efe5c8" alt="Interfaccia in italiano">
</p>

# Master Atlas 2027

Un atlante interattivo per esplorare **208 percorsi magistrali in bioscienze**, confrontare le opzioni e organizzare le candidature. Riunisce in un’unica app le quattro classifiche del dossier originale, mantenendo visibili le differenze tra master, track, M1/M2 e programmi congiunti.

Le graduatorie sono valutazioni personali e qualitative: **non sono ranking ufficiali e non stimano le probabilità di ammissione**. Le condizioni di accesso e le offerte 2027 vanno verificate sui siti degli atenei.

## Cosa puoi fare

- Cercare e filtrare programmi per area, ateneo, tipologia e condizioni.
- Salvare preferiti e confrontare fino a quattro percorsi.
- Seguire ogni candidatura con scadenze, note e checklist.
- Importare ed esportare un backup dei propri progressi.
- Consultare il dossier, le note originali e la legenda delle sigle.

## Versioni e dati personali

Il [sito pubblico su Sites](https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/) offre profili personali con passkey e sincronizzazione cloud. Il catalogo è pubblico; i dati di ciascun profilo sono isolati e non visibili agli altri utenti. La [copia privata](https://master-atlas-michele-2027.fair-swan-2763.chatgpt.site/) resta riservata al proprietario.

## Avvio locale

Servono **Python 3.12** e **Node.js 24**. Dalla cartella del progetto:

```powershell
cd master-atlas-2027
python parse_data.py
node --test tests/*.test.cjs
node scripts/build-pages.mjs
python -m http.server 8000 --directory _site
```

Apri poi `http://localhost:8000`. Per generare il Worker privato, usa `npm ci` e `npm run build`; lo sviluppo dello schema D1 usa `npm run db:generate`. Dettagli, migrazioni e procedure di pubblicazione sono nella [guida tecnica](master-atlas-2027/README.md).

## Struttura

```text
.
├── .github/workflows/       # controlli automatici
├── docs/media/              # grafica della pagina progetto
└── master-atlas-2027/
    ├── data/                # dossier sorgente e mappa degli ID legacy
    ├── db/                  # schema D1
    ├── drizzle/             # migrazioni del database
    ├── dist/                # sorgenti frontend e catalogo generato
    ├── scripts/             # build, anteprima e rilascio Sites
    ├── tests/               # test di regressione
    └── worker/              # API autenticata della copia privata
```

Il file autorevole dei contenuti è `master-atlas-2027/data/dossier.md`. Il catalogo in `master-atlas-2027/dist/data.json` viene rigenerato dal parser. Gli identificativi storici in `master-atlas-2027/data/legacy-ids.json` preservano i dati già salvati: non rigenerarli quando cambia l’ordine della classifica.

## Pubblicazione

Il sito pubblico ufficiale è [ospitato su Sites](https://master-atlas-profili-2027.fair-swan-2763.chatgpt.site/). GitHub Pages è stato disattivato; il repository rimane pubblico come sorgente del progetto. Ogni push su `main` avvia [GitHub Actions](https://github.com/micheledifiglia/coddiamo/actions) per rigenerare il catalogo ed eseguire i test, senza pubblicare un sito. Gli aggiornamenti del codice e la pubblicazione Sites sono passaggi distinti; la guida tecnica documenta il flusso.

## Origine dei dati

Il catalogo deriva dal dossier aggiornato al **16 ottobre 2026** e conserva le sue note, i collegamenti e le distinzioni tra tipologie di percorso. L’app non verifica automaticamente bandi, requisiti o disponibilità dei corsi.

## Licenza

Al momento il repository non specifica una licenza per il riutilizzo del codice. La pubblicazione online non equivale a una licenza open source.
