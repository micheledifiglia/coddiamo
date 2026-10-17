# Regole operative del progetto

## Commit automatico a fine attività

- Quando Codex termina una modifica a questo progetto, crea autonomamente un commit senza chiedere conferme aggiuntive. Non creare commit vuoti e non fare commit a ogni salvataggio intermedio.
- Dai a ogni aggiornamento un nome chiaro e descrittivo in italiano. Usa quel nome anche come titolo del commit, indicando la funzione o il comportamento cambiato; evita titoli generici come "Update" o "Modifiche".
- Prima del commit, esegui i controlli pertinenti, verifica il diff e includi soltanto i file della modifica richiesta. Non includere modifiche estranee, credenziali, token, file `.env` o archivi di deployment; verifica le esclusioni di `.gitignore`.
- Il repository utilizza già un hook locale `.git/hooks/post-commit` che esegue `git push`. Lascia che il commit attivi l'hook e verifica che il commit remoto corrisponda a quello locale prima di dichiarare GitHub aggiornato.
- Se il push fallisce, conserva il commit locale e comunica l'impedimento. Non usare push forzati né riscrivere la cronologia senza una richiesta esplicita.
- Nella risposta finale indica brevemente il nome dell'aggiornamento e il riferimento o link del commit, distinguendo un commit locale da un push verificato.

La regola riguarda le attività completate da Codex: non installare osservatori dei file, servizi o task che creino commit durante il lavoro manuale dell'utente.
