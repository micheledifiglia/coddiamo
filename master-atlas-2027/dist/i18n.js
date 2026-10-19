(() => {
  'use strict';

  const languages = {
    it: { name: 'Italiano', tag: 'it-IT' },
    en: { name: 'English', tag: 'en-GB' },
    es: { name: 'Español', tag: 'es-ES' },
    fr: { name: 'Français', tag: 'fr-FR' },
    de: { name: 'Deutsch', tag: 'de-DE' },
  };
  const rows = [
    ['ATLANTE DEI MASTER', 'MASTER ATLAS', 'ATLAS DE MÁSTERES', 'ATLAS DES MASTERS', 'MASTER-ATLAS'],
    ['SCIENZE DELLA VITA', 'LIFE SCIENCES', 'CIENCIAS DE LA VIDA', 'SCIENCES DE LA VIE', 'BIOWISSENSCHAFTEN'],
    ['Creato dal tuo dossier · Aggiornato al 16 ottobre 2026', 'Based on your dossier · Updated 16 October 2026', 'Basado en tu dosier · Actualizado el 16 de octubre de 2026', 'Fondé sur votre dossier · Mis à jour le 16 octobre 2026', 'Aus deinem Dossier · Aktualisiert am 16. Oktober 2026'],
    ['Ricerca rapida', 'Quick search', 'Búsqueda rápida', 'Recherche rapide', 'Schnellsuche'],
    ['naviga', 'navigate', 'navegar', 'naviguer', 'navigieren'],
    ['Invio', 'Enter', 'Intro', 'Entrée', 'Eingabe'],
    ['apri', 'open', 'abrir', 'ouvrir', 'öffnen'],
    ['chiudi', 'close', 'cerrar', 'fermer', 'schließen'],
    ['Copia indirizzo', 'Copy address', 'Copiar dirección', 'Copier l’adresse', 'Adresse kopieren'],
    ['APP CHATGPT', 'CHATGPT APP', 'APP CHATGPT', 'APP CHATGPT', 'CHATGPT-APP'],
    ['IL TUO CATALOGO, LE TUE SCELTE', 'YOUR CATALOGUE, YOUR CHOICES', 'TU CATÁLOGO, TUS DECISIONES', 'VOTRE CATALOGUE, VOS CHOIX', 'DEIN KATALOG, DEINE WAHL'],
    ['Aggiungi o rimuovi percorsi', 'Add or remove programmes', 'Añadir o quitar programas', 'Ajouter ou retirer des formations', 'Studiengänge hinzufügen oder entfernen'],
    ['Aggiungi o rimuovi università', 'Add or remove universities', 'Añadir o quitar universidades', 'Ajouter ou retirer des universités', 'Universitäten hinzufügen oder entfernen'],
    ['Rimuovi il percorso?', 'Remove this programme?', '¿Quitar este programa?', 'Retirer cette formation ?', 'Diesen Studiengang entfernen?'],
    ['Rimuovi l’università?', 'Remove this university?', '¿Quitar esta universidad?', 'Retirer cette université ?', 'Diese Universität entfernen?'],
    ['Rimuovi percorso', 'Remove programme', 'Quitar programa', 'Retirer la formation', 'Studiengang entfernen'],
    ['Rimuovi università', 'Remove university', 'Quitar universidad', 'Retirer l’université', 'Universität entfernen'],
    ['Cerca nel catalogo principale', 'Search the main catalogue', 'Buscar en el catálogo principal', 'Rechercher dans le catalogue principal', 'Im Hauptkatalog suchen'],
    ['Crea una voce personale', 'Create a personal entry', 'Crear una entrada personal', 'Créer une entrée personnelle', 'Eigenen Eintrag erstellen'],
    ['Nome del percorso', 'Programme name', 'Nombre del programa', 'Nom de la formation', 'Name des Studiengangs'],
    ['es. michele_bio', 'e.g. michele_bio', 'p. ej. michele_bio', 'p. ex. michele_bio', 'z. B. michele_bio'],
    ['Città', 'City', 'Ciudad', 'Ville', 'Stadt'],
    ['Paese', 'Country', 'País', 'Pays', 'Land'],
    ['Area di studio', 'Field of study', 'Área de estudio', 'Domaine d’études', 'Fachgebiet'],
    ['Titolo', 'Degree', 'Título', 'Diplôme', 'Abschluss'],
    ['Area geografica', 'Geographic area', 'Zona geográfica', 'Zone géographique', 'Geografische Region'],
    ['Link ufficiale (facoltativo)', 'Official link (optional)', 'Enlace oficial (opcional)', 'Lien officiel (facultatif)', 'Offizieller Link (optional)'],
    ['Note (facoltative)', 'Notes (optional)', 'Notas (opcionales)', 'Notes (facultatives)', 'Notizen (optional)'],
    ['Nome dell’università', 'University name', 'Nombre de la universidad', 'Nom de l’université', 'Name der Universität'],
    ['Sito ufficiale (facoltativo)', 'Official website (optional)', 'Sitio oficial (opcional)', 'Site officiel (facultatif)', 'Offizielle Website (optional)'],
    ['Percorsi o nota (facoltativi)', 'Programmes or note (optional)', 'Programas o nota (opcionales)', 'Formations ou note (facultatives)', 'Studiengänge oder Notiz (optional)'],
    ['Aggiungi al mio catalogo', 'Add to my catalogue', 'Añadir a mi catálogo', 'Ajouter à mon catalogue', 'Zu meinem Katalog hinzufügen'],
    ['IL TUO CATALOGO', 'YOUR CATALOGUE', 'TU CATÁLOGO', 'VOTRE CATALOGUE', 'DEIN KATALOG'],
    ['Rimuovi dal tuo catalogo?', 'Remove from your catalogue?', '¿Quitar de tu catálogo ?', 'Retirer de votre catalogue ?', 'Aus deinem Katalog entfernen?'],
    ['Rimuovi', 'Remove', 'Quitar', 'Retirer', 'Entfernen'],
    ['Per esempio: mi interessano i master in neuroscienze, preferisco la ricerca sperimentale e voglio seguire solo le candidature in Italia e nel Regno Unito.', 'For example: I am interested in neuroscience, prefer experimental research, and want to track applications in Italy and the UK.', 'Por ejemplo: me interesan los másteres en neurociencia, prefiero la investigación experimental y quiero seguir solicitudes en Italia y Reino Unido.', 'Par exemple : je m’intéresse aux masters en neurosciences, préfère la recherche expérimentale et souhaite suivre mes candidatures en Italie et au Royaume-Uni.', 'Zum Beispiel: Ich interessiere mich für Neurowissenschaften, bevorzuge experimentelle Forschung und möchte Bewerbungen in Italien und Großbritannien verfolgen.'],
    ['Indirizzo del connettore MCP', 'MCP connector address', 'Dirección del conector MCP', 'Adresse du connecteur MCP', 'Adresse des MCP-Konnektors'],
    ['Nome, ateneo o città…', 'Name, university or city…', 'Nombre, universidad o ciudad…', 'Nom, université ou ville…', 'Name, Universität oder Stadt…'],
    ['Aggiungi', 'Add', 'Añadir', 'Ajouter', 'Hinzufügen'],
    ['Il pannello del catalogo non è disponibile. Ricarica la pagina e riprova.', 'The catalogue panel is unavailable. Reload the page and try again.', 'El panel del catálogo no está disponible. Recarga la página e inténtalo de nuevo.', 'Le panneau du catalogue est indisponible. Rechargez la page et réessayez.', 'Das Katalogfenster ist nicht verfügbar. Lade die Seite neu und versuche es erneut.'],
    ['Non riesco ad aprire il catalogo. Ricarica la pagina e riprova.', 'I can’t open the catalogue. Reload the page and try again.', 'No puedo abrir el catálogo. Recarga la página e inténtalo de nuevo.', 'Impossible d’ouvrir le catalogue. Rechargez la page et réessayez.', 'Der Katalog lässt sich nicht öffnen. Lade die Seite neu und versuche es erneut.'],
    ['Non riesco a trovare questa voce nel tuo catalogo.', 'I can’t find this entry in your catalogue.', 'No encuentro esta entrada en tu catálogo.', 'Cette entrée est introuvable dans votre catalogue.', 'Dieser Eintrag wurde in deinem Katalog nicht gefunden.'],
    ['Non è stato possibile rimuovere il percorso.', 'The programme could not be removed.', 'No se pudo quitar el programa.', 'Impossible de retirer la formation.', 'Der Studiengang konnte nicht entfernt werden.'],
    ['Percorso rimosso dal tuo catalogo', 'Programme removed from your catalogue', 'Programa eliminado de tu catálogo', 'Formation retirée de votre catalogue', 'Studiengang aus deinem Katalog entfernt'],
    ['Università rimossa dal tuo catalogo', 'University removed from your catalogue', 'Universidad eliminada de tu catálogo', 'Université retirée de votre catalogue', 'Universität aus deinem Katalog entfernt'],
    ['Percorso aggiunto al tuo catalogo', 'Programme added to your catalogue', 'Programa añadido a tu catálogo', 'Formation ajoutée à votre catalogue', 'Studiengang zu deinem Katalog hinzugefügt'],
    ['Il link deve usare HTTPS', 'The link must use HTTPS', 'El enlace debe usar HTTPS', 'Le lien doit utiliser HTTPS', 'Der Link muss HTTPS verwenden'],
    ['Inserisci il nome del percorso e l’università', 'Enter the programme and university names', 'Introduce el nombre del programa y de la universidad', 'Saisissez le nom de la formation et de l’université', 'Gib den Namen des Studiengangs und der Universität ein'],
    ['Puoi salvare al massimo 100 percorsi personali', 'You can save up to 100 personal programmes', 'Puedes guardar hasta 100 programas personales', 'Vous pouvez enregistrer jusqu’à 100 formations personnelles', 'Du kannst bis zu 100 eigene Studiengänge speichern'],
    ['Inserisci il nome dell’università', 'Enter the university name', 'Introduce el nombre de la universidad', 'Saisissez le nom de l’université', 'Gib den Namen der Universität ein'],
    ['Questa università è già nel tuo catalogo', 'This university is already in your catalogue', 'Esta universidad ya está en tu catálogo', 'Cette université figure déjà dans votre catalogue', 'Diese Universität ist bereits in deinem Katalog'],
    ['Percorso personale aggiunto', 'Personal programme added', 'Programa personal añadido', 'Formation personnelle ajoutée', 'Eigener Studiengang hinzugefügt'],
    ['Università personale aggiunta', 'Personal university added', 'Universidad personal añadida', 'Université personnelle ajoutée', 'Eigene Universität hinzugefügt'],
    ['Università aggiunta al tuo catalogo', 'University added to your catalogue', 'Universidad añadida a tu catálogo', 'Université ajoutée à votre catalogue', 'Universität zu deinem Katalog hinzugefügt'],
    ['Modifica applicata, ma il salvataggio locale non è riuscito', 'Changes applied, but they could not be saved locally', 'Cambios aplicados, pero no se pudieron guardar localmente', 'Modifications appliquées, mais impossible de les enregistrer localement', 'Änderung angewendet, aber nicht lokal gespeichert'],
    ['0 risultati nel catalogo principale', '0 results in the main catalogue', '0 resultados en el catálogo principal', '0 résultats dans le catalogue principal', '0 Ergebnisse im Hauptkatalog'],
    ['0 risultati nel catalogo principale · mostrati i primi 60', '0 results in the main catalogue · showing the first 60', '0 resultados en el catálogo principal · se muestran los primeros 60', '0 résultats dans le catalogue principal · les 60 premiers sont affichés', '0 Ergebnisse im Hauptkatalog · die ersten 60 werden angezeigt'],
    ['0 percorsi disponibili · mostra i primi 60 · cerca per nome, ateneo o città', '0 programmes available · showing the first 60 · search by name, university or city', '0 programas disponibles · se muestran los primeros 60 · busca por nombre, universidad o ciudad', '0 formations disponibles · les 60 premières sont affichées · recherchez par nom, université ou ville', '0 Studiengänge verfügbar · die ersten 60 werden angezeigt · suche nach Name, Universität oder Stadt'],
    ['0 università disponibili · cerca per nome, area o percorso', '0 universities available · search by name, region or programme', '0 universidades disponibles · busca por nombre, zona o programa', '0 universités disponibles · recherchez par nom, région ou formation', '0 Universitäten verfügbar · suche nach Name, Region oder Studiengang'],
    ['IL TUO SPAZIO', 'YOUR SPACE', 'TU ESPACIO', 'VOTRE ESPACE', 'DEIN BEREICH'],
    ['0 DI 0 SELEZIONATE', '0 OF 0 SELECTED', '0 DE 0 SELECCIONADAS', '0 SUR 0 SÉLECTIONNÉES', '0 VON 0 AUSGEWÄHLT'],
    ['Controlli del globo', 'Globe controls', 'Controles del globo', 'Commandes du globe', 'Globussteuerung'],
    ['Riporta il nord in alto', 'Point north up', 'Orientar el norte arriba', 'Orienter le nord vers le haut', 'Norden nach oben ausrichten'],
    ['Riduci zoom', 'Zoom out', 'Alejar', 'Dézoomer', 'Verkleinern'],
    ['Ripristina visuale iniziale', 'Reset view', 'Restablecer vista', 'Réinitialiser la vue', 'Ansicht zurücksetzen'],
    ['Aumenta zoom', 'Zoom in', 'Acercar', 'Zoomer', 'Vergrößern'],
    ['Aggiungi percorsi ai preferiti per evidenziare gli atenei scelti.', 'Save programmes as favourites to highlight their universities.', 'Guarda programas como favoritos para destacar sus universidades.', 'Ajoutez des formations aux favoris pour mettre en évidence leurs universités.', 'Speichere Studiengänge als Favoriten, um ihre Universitäten hervorzuheben.'],
    ['Panoramica del dossier', 'Dossier overview', 'Resumen del dosier', 'Vue d’ensemble du dossier', 'Dossierübersicht'],
    ['Percorsi Europa', 'European programmes', 'Programas de Europa', 'Formations en Europe', 'Studiengänge in Europa'],
    ['Percorsi extra-Europa', 'Programmes outside Europe', 'Programas fuera de Europa', 'Formations hors Europe', 'Studiengänge außerhalb Europas'],
    ['Atenei Europa', 'European universities', 'Universidades de Europa', 'Universités en Europe', 'Universitäten in Europa'],
    ['Atenei extra-Europa', 'Universities outside Europe', 'Universidades fuera de Europa', 'Universités hors Europe', 'Universitäten außerhalb Europas'],
    ['La tua bussola.', 'Your compass.', 'Tu brújula.', 'Votre boussole.', 'Dein Kompass.'],
    ['La tua direzione.', 'Your direction.', 'Tu dirección.', 'Votre direction.', 'Deine Richtung.'],
    ['Descrivi all’IA cosa vuoi studiare: percorsi, università e candidature si adatteranno alle tue scelte.', 'Tell the AI what you want to study: programmes, universities and applications will follow your choices.', 'Cuéntale a la IA qué quieres estudiar: programas, universidades y solicitudes se adaptarán a tus elecciones.', 'Décrivez à l’IA ce que vous souhaitez étudier : formations, universités et candidatures suivront vos choix.', 'Beschreibe der KI, was du studieren möchtest: Studiengänge, Universitäten und Bewerbungen richten sich nach deiner Wahl.'],
    ['Obiettivi', 'Goals', 'Objetivos', 'Objectifs', 'Ziele'],
    ['Interessi', 'Interests', 'Intereses', 'Centres d’intérêt', 'Interessen'],
    ['Apri candidature', 'Open applications', 'Abrir solicitudes', 'Ouvrir les candidatures', 'Bewerbungen öffnen'],
    ['Organizza il tuo piano', 'Organize your plan', 'Organiza tu plan', 'Organisez votre plan', 'Plane organisieren'],
    ['Apri il tuo piano', 'Open your plan', 'Abre tu plan', 'Ouvrez votre plan', 'Deinen Plan öffnen'],
    ['Apri shortlist', 'Open shortlist', 'Abrir selección', 'Ouvrir la sélection', 'Auswahl öffnen'],
    ['SCELTI PER TE', 'PICKED FOR YOU', 'ELEGIDOS PARA TI', 'CHOISIS POUR VOUS', 'FÜR DICH AUSGEWÄHLT'],
    ['Esplora tutti i 27 atenei', 'Explore all 27 universities', 'Explorar las 27 universidades', 'Explorer les 27 universités', 'Alle 27 Universitäten entdecken'],
    ['Nessun percorso nel tuo catalogo. Aggiungine uno dal catalogo principale.', 'No programmes in your catalogue yet. Add one from the main catalogue.', 'Todavía no hay programas en tu catálogo. Añade uno del catálogo principal.', 'Aucune formation dans votre catalogue. Ajoutez-en une depuis le catalogue principal.', 'Noch keine Studiengänge in deinem Katalog. Füge einen aus dem Hauptkatalog hinzu.'],
    ['Esplora gli atenei del tuo atlante', 'Explore the universities in your atlas', 'Explora las universidades de tu atlas', 'Explorez les universités de votre atlas', 'Universitäten in deinem Atlas entdecken'],
    ['Il tuo catalogo è vuoto. Aggiungi percorsi o università dal catalogo principale per iniziare.', 'Your catalogue is empty. Add programmes or universities from the main catalogue to get started.', 'Tu catálogo está vacío. Añade programas o universidades del catálogo principal para empezar.', 'Votre catalogue est vide. Ajoutez des formations ou des universités depuis le catalogue principal.', 'Dein Katalog ist leer. Füge Studiengänge oder Universitäten aus dem Hauptkatalog hinzu.'],
    ['IL TUO ATLANTE', 'YOUR ATLAS', 'TU ATLAS', 'VOTRE ATLAS', 'DEIN ATLAS'],
    ['percorsi', 'programmes', 'programas', 'formations', 'Studiengänge'],
    ['nel tuo catalogo', 'in your catalogue', 'en tu catálogo', 'dans votre catalogue', 'in deinem Katalog'],
    ['Aggiungi dal catalogo principale', 'Add from the main catalogue', 'Añadir del catálogo principal', 'Ajouter depuis le catalogue principal', 'Aus dem Hauptkatalog hinzufügen'],
    ['Crea voce personale', 'Create a personal entry', 'Crear entrada personal', 'Créer une entrée personnelle', 'Eigenen Eintrag erstellen'],
    ['Nessun percorso corrisponde alla ricerca.', 'No programmes match your search.', 'Ningún programa coincide con la búsqueda.', 'Aucune formation ne correspond à votre recherche.', 'Keine Studiengänge entsprechen deiner Suche.'],
    ['Nessuna università corrisponde alla ricerca.', 'No universities match your search.', 'Ninguna universidad coincide con la búsqueda.', 'Aucune université ne correspond à votre recherche.', 'Keine Universitäten entsprechen deiner Suche.'],
    ['Rimuovi dal mio catalogo', 'Remove from my catalogue', 'Quitar de mi catálogo', 'Retirer de mon catalogue', 'Aus meinem Katalog entfernen'],
    ['Il tuo catalogo di università è vuoto.', 'Your university catalogue is empty.', 'Tu catálogo de universidades está vacío.', 'Votre catalogue d’universités est vide.', 'Dein Universitätskatalog ist leer.'],
    ['Aggiungi gli atenei che ti interessano o crea una voce personale.', 'Add universities that interest you or create a personal entry.', 'Añade universidades que te interesen o crea una entrada personal.', 'Ajoutez les universités qui vous intéressent ou créez une entrée personnelle.', 'Füge interessante Universitäten hinzu oder erstelle einen eigenen Eintrag.'],
    ['Aggiungi università dal catalogo', 'Add universities from the catalogue', 'Añadir universidades del catálogo', 'Ajouter des universités du catalogue', 'Universitäten aus dem Katalog hinzufügen'],
    ['Crea università personale', 'Create a personal university', 'Crear universidad personal', 'Créer une université personnelle', 'Eigene Universität erstellen'],
    ['Scegli un percorso', 'Choose a programme', 'Elige un programa', 'Choisissez une formation', 'Studiengang auswählen'],
    ['Scarica dossier .md', 'Download dossier .md', 'Descargar dosier .md', 'Télécharger le dossier .md', 'Dossier .md herunterladen'],
    ['Esporta backup JSON', 'Export JSON backup', 'Exportar copia JSON', 'Exporter la sauvegarde JSON', 'JSON-Backup exportieren'],
    ['Importa backup JSON', 'Import JSON backup', 'Importar copia JSON', 'Importer la sauvegarde JSON', 'JSON-Backup importieren'],
    ['Percorso aggiunto al tuo atlante. Verifica le informazioni e il sito ufficiale prima di candidarti.', 'Programme added to your atlas. Check the details and official website before applying.', 'Programa añadido a tu atlas. Comprueba la información y el sitio oficial antes de solicitar plaza.', 'Formation ajoutée à votre atlas. Vérifiez les informations et le site officiel avant de candidater.', 'Studiengang zum Atlas hinzugefügt. Prüfe die Angaben und die offizielle Website vor der Bewerbung.'],
    ['Le posizioni sono separate per area geografica', 'Ranks are separate for each geographic area', 'Las posiciones se separan por zona geográfica', 'Les rangs sont séparés par zone géographique', 'Die Rangplätze sind nach geografischer Region getrennt'],
    ['TROVA LA TUA DIREZIONE', 'FIND YOUR DIRECTION', 'ENCUENTRA TU CAMINO', 'TROUVEZ VOTRE VOIE', 'FINDE DEINEN WEG'],
    ['Un mondo di possibilità.', 'A world of possibilities.', 'Un mundo de posibilidades.', 'Un monde de possibilités.', 'Eine Welt voller Möglichkeiten.'],
    ['LE POSSIBILITÀ CHE CONTANO', 'THE OPTIONS THAT MATTER', 'LAS OPCIONES QUE IMPORTAN', 'LES OPTIONS QUI COMPTENT', 'DIE OPTIONEN, DIE ZÄHLEN'],
    ['La mia selezione.', 'My shortlist.', 'Mi selección.', 'Ma sélection.', 'Meine Auswahl.'],
    ['I tuoi percorsi preferiti, con note e candidature sempre a portata di mano.', 'Your favourite programmes, with notes and applications close at hand.', 'Tus programas favoritos, con notas y solicitudes siempre a mano.', 'Vos formations favorites, avec notes et candidatures à portée de main.', 'Deine bevorzugten Studiengänge mit Notizen und Bewerbungen auf einen Blick.'],
    ['Filtra tipo', 'Filter type', 'Filtrar tipo', 'Filtrer le type', 'Typ filtern'],
    ['Filtra condizioni', 'Filter requirements', 'Filtrar requisitos', 'Filtrer les conditions', 'Voraussetzungen filtern'],
    ['Ordina risultati', 'Sort results', 'Ordenar resultados', 'Trier les résultats', 'Ergebnisse sortieren'],
    ['Nessuna sigla', 'No code', 'Sin código', 'Aucun code', 'Kein Kürzel'],
    ['DE · Tedesco', 'DE · German', 'DE · Alemán', 'DE · Allemand', 'DE · Deutsch'],
    ['L · Lingua da verificare', 'L · Language to check', 'L · Idioma por verificar', 'L · Langue à vérifier', 'L · Sprache prüfen'],
    ['E · Piano in inglese', 'E · English study plan', 'E · Plan en inglés', 'E · Parcours en anglais', 'E · Englischer Studienplan'],
    ['A · Accesso particolare', 'A · Special admission', 'A · Acceso especial', 'A · Admission particulière', 'A · Besondere Zulassung'],
    ['? · 2027 da confermare', '? · Confirm for 2027', '? · Confirmar para 2027', '? · À confirmer pour 2027', '? · Für 2027 prüfen'],
    ['CN · In Cina', 'CN · In China', 'CN · En China', 'CN · En Chine', 'CN · In China'],
    ['Ordine del dossier', 'Dossier order', 'Orden del dosier', 'Ordre du dossier', 'Dossierreihenfolge'],
    ['Nome A–Z', 'Name A–Z', 'Nombre A–Z', 'Nom A–Z', 'Name A–Z'],
    ['Università A–Z', 'University A–Z', 'Universidad A–Z', 'Université A–Z', 'Universität A–Z'],
    ['Vista schede', 'Card view', 'Vista de tarjetas', 'Vue cartes', 'Kartenansicht'],
    ['Vista tabella', 'Table view', 'Vista de tabla', 'Vue tableau', 'Tabellenansicht'],
    ['Schede', 'Cards', 'Tarjetas', 'Cartes', 'Karten'],
    ['Tabella', 'Table', 'Tabla', 'Tableau', 'Tabelle'],
    ['Solo preferiti', 'Favourites only', 'Solo favoritos', 'Favoris uniquement', 'Nur Favoriten'],
    ['Il tuo catalogo di percorsi è vuoto.', 'Your programme catalogue is empty.', 'Tu catálogo de programas está vacío.', 'Votre catalogue de formations est vide.', 'Dein Studiengangkatalog ist leer.'],
    ['Aggiungi percorsi del catalogo principale o crea i tuoi con la tua IA collegata a Master Atlas.', 'Add programmes from the main catalogue or create your own with AI connected to Master Atlas.', 'Añade programas del catálogo principal o crea los tuyos con una IA conectada a Master Atlas.', 'Ajoutez des formations du catalogue principal ou créez les vôtres avec une IA connectée à Master Atlas.', 'Füge Studiengänge aus dem Hauptkatalog hinzu oder erstelle eigene mit einer mit Master Atlas verbundenen KI.'],
    ['La tua shortlist inizia da una curiosità.', 'Your shortlist starts with curiosity.', 'Tu selección empieza con una curiosidad.', 'Votre sélection commence par la curiosité.', 'Deine Auswahl beginnt mit Neugier.'],
    ['Salva i percorsi con il cuore per ritrovarli qui.', 'Save programmes with the heart to find them here.', 'Guarda programas con el corazón para encontrarlos aquí.', 'Ajoutez des formations avec le cœur pour les retrouver ici.', 'Speichere Studiengänge mit dem Herzsymbol, um sie hier wiederzufinden.'],
    ['QUATTRO CLASSIFICHE · ATENEI', 'FOUR RANKINGS · UNIVERSITIES', 'CUATRO CLASIFICACIONES · UNIVERSIDADES', 'QUATRE CLASSEMENTS · UNIVERSITÉS', 'VIER RANGLISTEN · UNIVERSITÄTEN'],
    ['I luoghi delle tue idee.', 'Where your ideas can grow.', 'Donde crecen tus ideas.', 'Les lieux de vos idées.', 'Wo deine Ideen wachsen.'],
    ['AFFIANCA LE TUE POSSIBILITÀ', 'COMPARE YOUR OPTIONS', 'COMPARA TUS OPCIONES', 'COMPAREZ VOS OPTIONS', 'VERGLEICHE DEINE OPTIONEN'],
    ['Una scelta più chiara.', 'A clearer choice.', 'Una elección más clara.', 'Un choix plus clair.', 'Eine klarere Entscheidung.'],
    ['Confronta fino a quattro percorsi. Le posizioni appartengono alle rispettive classifiche.', 'Compare up to four programmes. Ranks refer to their respective lists.', 'Compara hasta cuatro programas. Las posiciones pertenecen a sus respectivas listas.', 'Comparez jusqu’à quatre formations. Les rangs correspondent à leurs classements respectifs.', 'Vergleiche bis zu vier Studiengänge. Die Rangplätze beziehen sich auf ihre jeweilige Liste.'],
    ['Scegli i percorsi', 'Choose programmes', 'Elegir programas', 'Choisir des formations', 'Studiengänge auswählen'],
    ['DALLE IDEE AI PROSSIMI PASSI', 'FROM IDEAS TO NEXT STEPS', 'DE LAS IDEAS A LOS PRÓXIMOS PASOS', 'DES IDÉES AUX PROCHAINES ÉTAPES', 'VON IDEEN ZU NÄCHSTEN SCHRITTEN'],
    ['Le tue candidature.', 'Your applications.', 'Tus solicitudes.', 'Vos candidatures.', 'Deine Bewerbungen.'],
    ['Organizza il percorso, aggiungi scadenze e tieni traccia dei documenti.', 'Organize your plan, add deadlines and keep track of documents.', 'Organiza tu plan, añade plazos y lleva el control de los documentos.', 'Organisez votre parcours, ajoutez des échéances et suivez vos documents.', 'Plane deinen Weg, füge Fristen hinzu und behalte Unterlagen im Blick.'],
    ['LE BASI DEL TUO ATLANTE', 'THE BASIS OF YOUR ATLAS', 'LAS BASES DE TU ATLAS', 'LES BASES DE VOTRE ATLAS', 'DIE GRUNDLAGEN DEINES ATLAS'],
    ['Copie di recupero', 'Recovery copies', 'Copias de recuperación', 'Copies de récupération', 'Sicherungskopien'],
    ['Note sui programmi', 'Programme notes', 'Notas sobre programas', 'Notes sur les formations', 'Notizen zu Studiengängen'],
    ['Offerte storiche e sole mobilità', 'Historical offers and mobility only', 'Ofertas históricas y solo movilidad', 'Offres historiques et mobilités seules', 'Frühere Angebote und reine Mobilität'],
    ['contenitori di Master, track, M1/M2 e varianti sono conservati con il loro tipo. I 27 atenei principali possono partecipare ad accordi con altri partner. Le classifiche seguono l’ateneo di riferimento del dossier: la sede fisica può essere in un altro continente.', 'Master programmes, tracks, M1/M2 and variants retain their type. The 27 main universities may have partner agreements. Rankings follow the university named in the dossier; the actual campus may be on another continent.', 'Los programas de máster, itinerarios, M1/M2 y variantes conservan su tipo. Las 27 universidades principales pueden colaborar con otras instituciones. Las clasificaciones siguen la universidad del dosier; el campus puede estar en otro continente.', 'Les masters, parcours, M1/M2 et variantes conservent leur type. Les 27 universités principales peuvent avoir des partenaires. Les classements suivent l’université du dossier ; le campus peut se trouver sur un autre continent.', 'Masterprogramme, Tracks, M1/M2 und Varianten behalten ihren Typ. Die 27 Hauptuniversitäten können Partnerschaften haben. Die Ranglisten folgen der Universität im Dossier; der Studienort kann auf einem anderen Kontinent liegen.'],
    ['Preferiti, note e candidature vengono sincronizzati nel tuo spazio privato dopo l’accesso al tuo profilo. Una copia locale permette di lavorare offline. Sono disponibili copie di recupero automatiche locali e cloud.', 'Favourites, notes and applications sync to your private space after you sign in. A local copy lets you work offline. Automatic local and cloud recovery copies are available.', 'Favoritos, notas y solicitudes se sincronizan en tu espacio privado al iniciar sesión. Una copia local permite trabajar sin conexión. Hay copias automáticas de recuperación locales y en la nube.', 'Favoris, notes et candidatures se synchronisent dans votre espace privé après connexion. Une copie locale permet de travailler hors ligne. Des sauvegardes automatiques locales et cloud sont disponibles.', 'Favoriten, Notizen und Bewerbungen werden nach der Anmeldung in deinem privaten Bereich synchronisiert. Eine lokale Kopie ermöglicht Offline-Arbeit. Automatische lokale und Cloud-Sicherungen sind verfügbar.'],
    ['Master autonomo o contenitore. La ricerca dipende anche dal laboratorio.', 'Independent or umbrella Master’s programme. Research opportunities also depend on the laboratory.', 'Máster independiente o programa marco. La investigación depende también del laboratorio.', 'Master autonome ou programme cadre. La recherche dépend aussi du laboratoire.', 'Eigenständiger oder übergreifender Master. Forschungsmöglichkeiten hängen auch vom Labor ab.'],
    ['Track, major o concentrazione interna: non un titolo autonomo.', 'Track, major or internal specialization: not a separate degree.', 'Itinerario, especialidad o concentración interna: no es un título independiente.', 'Parcours, majeure ou spécialisation interne : pas un diplôme autonome.', 'Track, Schwerpunkt oder interne Spezialisierung: kein eigenständiger Abschluss.'],
    ['Primo anno francese; normalmente è il punto di ingresso dopo L-2.', 'First year of a French Master’s degree; usually the entry point after L-2.', 'Primer año francés; suele ser el punto de entrada tras L-2.', 'Première année française ; généralement le point d’entrée après L-2.', 'Erstes französisches Masterjahr; meist der Einstieg nach L-2.'],
    ['Secondo anno francese; accesso diretto dopo L-2 non automatico.', 'Second year of a French Master’s degree; direct entry after L-2 is not automatic.', 'Segundo año francés; el acceso directo tras L-2 no es automático.', 'Deuxième année française ; l’accès direct après L-2 n’est pas automatique.', 'Zweites französisches Masterjahr; ein direkter Einstieg nach L-2 ist nicht automatisch möglich.'],
    ['Titolo congiunto.', 'Joint degree.', 'Título conjunto.', 'Diplôme conjoint.', 'Gemeinsamer Abschluss.'],
    ['Doppio o multiplo titolo.', 'Double or multiple degree.', 'Doble o múltiple titulación.', 'Double ou multiple diplôme.', 'Doppel- oder Mehrfachabschluss.'],
    ['Collaborazione didattica: doppio titolo non verificato.', 'Teaching partnership: a double degree has not been confirmed.', 'Colaboración docente: no se ha confirmado una doble titulación.', 'Partenariat pédagogique : le double diplôme n’est pas confirmé.', 'Lehrkooperation: ein Doppelabschluss ist nicht bestätigt.'],
    ['Mobilità strutturata.', 'Structured mobility.', 'Movilidad estructurada.', 'Mobilité structurée.', 'Strukturierte Mobilität.'],
    ['Tedesco richiesto.', 'German required.', 'Se requiere alemán.', 'Allemand requis.', 'Deutsch erforderlich.'],
    ['Lingua da verificare; intero percorso in inglese non confermato.', 'Check the language; a fully English-taught programme is not confirmed.', 'Idioma por verificar; no se ha confirmado que todo el programa sea en inglés.', 'Langue à vérifier ; un parcours entièrement en anglais n’est pas confirmé.', 'Sprache prüfen; ein vollständig englischsprachiger Studiengang ist nicht bestätigt.'],
    ['Piano in inglese da costruire e confermare nei moduli.', 'An English-taught study plan must be built and confirmed module by module.', 'Hay que elaborar y confirmar un plan en inglés módulo por módulo.', 'Le parcours en anglais doit être construit et confirmé module par module.', 'Ein englischsprachiger Studienplan muss für jedes Modul erstellt und bestätigt werden.'],
    ['Accesso particolare o equivalenza L-2 da verificare.', 'Special admission or L-2 equivalence to check.', 'Acceso especial o equivalencia L-2 por verificar.', 'Admission particulière ou équivalence L-2 à vérifier.', 'Besondere Zulassung oder L-2-Gleichwertigkeit prüfen.'],
    ['Offerta, struttura o ingresso 2027 da riconfermare.', 'Confirm the offer, structure or 2027 entry.', 'Volver a confirmar la oferta, estructura o entrada de 2027.', 'Offre, structure ou admission 2027 à reconfirmer.', 'Angebot, Struktur oder Einstieg 2027 erneut prüfen.'],
    ['Ateneo europeo, programma in Cina.', 'European university, programme in China.', 'Universidad europea, programa en China.', 'Université européenne, programme en Chine.', 'Europäische Universität, Studiengang in China.'],
    ['Preferiti, note e candidature vengono sincronizzati nel tuo spazio privato dopo l’accesso al tuo profilo. Una copia locale permette di lavorare offline. Sono disponibili copie di recupero automatiche locali e cloud. Il CSV contiene i risultati della selezione corrente.', 'Favourites, notes and applications sync to your private space after you sign in. A local copy lets you work offline. Automatic local and cloud recovery copies are available. The CSV contains the current selection results.', 'Favoritos, notas y solicitudes se sincronizan en tu espacio privado al iniciar sesión. Una copia local permite trabajar sin conexión. Hay copias automáticas locales y en la nube. El CSV contiene los resultados de la selección actual.', 'Favoris, notes et candidatures se synchronisent dans votre espace privé après connexion. Une copie locale permet de travailler hors ligne. Des sauvegardes automatiques locales et cloud sont disponibles. Le CSV contient les résultats de la sélection actuelle.', 'Favoriten, Notizen und Bewerbungen werden nach der Anmeldung in deinem privaten Bereich synchronisiert. Eine lokale Kopie ermöglicht Offline-Arbeit. Automatische lokale und Cloud-Sicherungen sind verfügbar. Die CSV-Datei enthält die Ergebnisse der aktuellen Auswahl.'],
    ['Esporta risultati CSV', 'Export CSV results', 'Exportar resultados CSV', 'Exporter les résultats CSV', 'CSV-Ergebnisse exportieren'],
    ['0 percorsi nel tuo catalogo personale: aggiungi voci dal dossier o crea percorsi tuoi.', '0 programmes in your personal catalogue: add entries from the dossier or create your own.', '0 programas en tu catálogo personal: añade entradas del dosier o crea las tuyas.', '0 formations dans votre catalogue personnel : ajoutez des entrées du dossier ou créez les vôtres.', '0 Studiengänge in deinem persönlichen Katalog: Füge Einträge aus dem Dossier hinzu oder erstelle eigene.'],
    ['0 università nel tuo catalogo personale; aggiungi atenei dal dossier o crea i tuoi.', '0 universities in your personal catalogue; add universities from the dossier or create your own.', '0 universidades en tu catálogo personal; añade universidades del dosier o crea las tuyas.', '0 universités dans votre catalogue personnel ; ajoutez des universités du dossier ou créez les vôtres.', '0 Universitäten in deinem persönlichen Katalog; füge Universitäten aus dem Dossier hinzu oder erstelle eigene.'],
    ['Lingua', 'Language', 'Idioma', 'Langue', 'Sprache'],
    ['Personalizza con IA', 'Personalize with AI', 'Personalizar con IA', 'Personnaliser avec l’IA', 'Mit KI personalisieren'],
    ['IL TUO ATLANTE, LE TUE REGOLE', 'YOUR ATLAS, YOUR RULES', 'TU ATLAS, TUS REGLAS', 'VOTRE ATLAS, VOS RÈGLES', 'DEIN ATLAS, DEINE REGELN'],
    ['Personalizza con la tua IA', 'Personalize with your AI', 'Personaliza con tu IA', 'Personnalisez avec votre IA', 'Mit deiner KI personalisieren'],
    ['Usa ChatGPT, Claude o l’IA che hai già sul telefono. Copia un prompt unico, incolla qui la risposta e controlla tutto prima di salvarlo.', 'Use ChatGPT, Claude or the AI app already on your phone. Copy one prompt, paste the response here and review everything before saving.', 'Usa ChatGPT, Claude o la IA que ya tienes en el teléfono. Copia un solo prompt, pega aquí la respuesta y revísalo todo antes de guardar.', 'Utilisez ChatGPT, Claude ou l’IA déjà installée sur votre téléphone. Copiez un seul prompt, collez la réponse ici et vérifiez tout avant d’enregistrer.', 'Nutze ChatGPT, Claude oder die KI-App auf deinem Handy. Kopiere einen Prompt, füge die Antwort hier ein und prüfe alles vor dem Speichern.'],
    ['Cosa vuoi cambiare?', 'What would you like to change?', '¿Qué quieres cambiar?', 'Que souhaitez-vous modifier ?', 'Was möchtest du ändern?'],
    ['Crea e copia il prompt completo', 'Create and copy the full prompt', 'Crear y copiar el prompt completo', 'Créer et copier le prompt complet', 'Vollständigen Prompt erstellen und kopieren'],
    ['Prompt da incollare nella tua IA', 'Prompt to paste into your AI', 'Prompt para pegar en tu IA', 'Prompt à coller dans votre IA', 'Prompt zum Einfügen in deine KI'],
    ['Il prompt completo apparirà qui.', 'The full prompt will appear here.', 'El prompt completo aparecerá aquí.', 'Le prompt complet apparaîtra ici.', 'Der vollständige Prompt erscheint hier.'],
    ['L’IA userà il catalogo, i tuoi percorsi e le candidature per preparare una modifica. Non servono chiavi API né abbonamenti aggiuntivi.', 'The AI will use the catalogue, your programmes and applications to prepare a change. No API keys or extra subscriptions are needed.', 'La IA usará el catálogo, tus programas y solicitudes para preparar un cambio. No necesitas claves API ni suscripciones adicionales.', 'L’IA utilisera le catalogue, vos formations et vos candidatures pour préparer une modification. Aucune clé API ni aucun abonnement supplémentaire ne sont nécessaires.', 'Die KI nutzt den Katalog, deine Studiengänge und Bewerbungen für eine Änderung. Du brauchst weder API-Schlüssel noch ein zusätzliches Abo.'],
    ['Incolla qui la risposta JSON dell’IA', 'Paste the AI’s JSON response here', 'Pega aquí la respuesta JSON de la IA', 'Collez ici la réponse JSON de l’IA', 'Füge hier die JSON-Antwort der KI ein'],
    ['Incolla la risposta JSON. Se l’IA aggiunge dei backtick Markdown, l’app li riconosce.', 'Paste the JSON response. The app also recognizes Markdown code fences.', 'Pega la respuesta JSON. La app también reconoce bloques de código Markdown.', 'Collez la réponse JSON. L’application reconnaît aussi les blocs de code Markdown.', 'Füge die JSON-Antwort ein. Markdown-Codeblöcke werden ebenfalls erkannt.'],
    ['Controlla le modifiche', 'Review changes', 'Revisar cambios', 'Vérifier les modifications', 'Änderungen prüfen'],
    ['Applica al mio atlante', 'Apply to my atlas', 'Aplicar a mi atlas', 'Appliquer à mon atlas', 'Auf meinen Atlas anwenden'],
    ['COLLEGAMENTO DIRETTO', 'DIRECT CONNECTION', 'CONEXIÓN DIRECTA', 'CONNEXION DIRECTE', 'DIREKTE VERBINDUNG'],
    ['Usa l’IA dentro ChatGPT o Claude', 'Use AI inside ChatGPT or Claude', 'Usa la IA dentro de ChatGPT o Claude', 'Utilisez l’IA dans ChatGPT ou Claude', 'Nutze KI direkt in ChatGPT oder Claude'],
    ['Collega ChatGPT al tuo profilo', 'Link ChatGPT to your profile', 'Conecta ChatGPT a tu perfil', 'Connectez ChatGPT à votre profil', 'ChatGPT mit deinem Profil verbinden'],
    ['Genera qui un codice monouso. Poi chiedi a ChatGPT di usare lo strumento link_my_atlas_profile con quel codice. Scade dopo 10 minuti.', 'Generate a one-time code here, then ask ChatGPT to use the link_my_atlas_profile tool with it. It expires after 10 minutes.', 'Genera aquí un código de un solo uso y pide a ChatGPT que use la herramienta link_my_atlas_profile con él. Caduca en 10 minutos.', 'Générez ici un code à usage unique, puis demandez à ChatGPT d’utiliser l’outil link_my_atlas_profile avec ce code. Il expire après 10 minutes.', 'Erstelle hier einen Einmalcode und bitte ChatGPT, damit das Tool link_my_atlas_profile zu verwenden. Er läuft nach 10 Minuten ab.'],
    ['Genera codice monouso', 'Generate one-time code', 'Generar código de un solo uso', 'Générer un code à usage unique', 'Einmalcode erstellen'],
    ['Copia codice', 'Copy code', 'Copiar código', 'Copier le code', 'Code kopieren'],
    ['Scade tra 10 minuti', 'Expires in 10 minutes', 'Caduca en 10 minutos', 'Expire dans 10 minutes', 'Läuft in 10 Minuten ab'],
    ['Genero un codice di collegamento…', 'Generating a link code…', 'Generando un código de enlace…', 'Génération du code de liaison…', 'Verknüpfungscode wird erstellt…'],
    ['Codice copiato negli appunti.', 'Code copied to clipboard.', 'Código copiado al portapapeles.', 'Code copié dans le presse-papiers.', 'Code in die Zwischenablage kopiert.'],
    ['Il codice è visibile qui sopra; copialo e incollalo in ChatGPT.', 'The code is shown above; copy it and paste it into ChatGPT.', 'El código aparece arriba; cópialo y pégalo en ChatGPT.', 'Le code est affiché ci-dessus ; copiez-le et collez-le dans ChatGPT.', 'Der Code steht oben; kopiere ihn und füge ihn in ChatGPT ein.'],
    ['Aggiungi questo indirizzo come connettore MCP remoto. Al primo collegamento accedi a Master Atlas e scegli i permessi di lettura e modifica. L’IA può poi aggiornare questo profilo; puoi revocare il collegamento qui sotto.', 'Add this address as a remote MCP connector. The first time, sign in to Master Atlas and choose read and edit permissions. The AI can then update this profile; revoke the connection below at any time.', 'Añade esta dirección como conector MCP remoto. La primera vez, inicia sesión en Master Atlas y elige los permisos de lectura y edición. La IA podrá actualizar este perfil; puedes revocar la conexión abajo.', 'Ajoutez cette adresse comme connecteur MCP distant. Lors de la première connexion, connectez-vous à Master Atlas et choisissez les droits de lecture et de modification. L’IA pourra ensuite mettre à jour ce profil ; vous pouvez révoquer la connexion ci-dessous.', 'Füge diese Adresse als Remote-MCP-Konnektor hinzu. Melde dich beim ersten Mal bei Master Atlas an und wähle Lese- und Änderungsrechte. Die KI kann dieses Profil dann aktualisieren; du kannst die Verbindung unten widerrufen.'],
    ['Claude: collega il connettore dal web; dopo la configurazione puoi usarlo anche su iOS e Android. ChatGPT: il collegamento di server MCP personalizzati è disponibile dal web per Business/Enterprise/Edu. Su telefono usa il percorso con prompt e copia-incolla.', 'Claude: add the connector on the web, then use it on iOS or Android. ChatGPT: custom MCP server setup is available on the web for Business/Enterprise/Edu workspaces. On phones, use the prompt-and-paste flow.', 'Claude: añade el conector desde la web y después úsalo en iOS o Android. ChatGPT: la conexión de servidores MCP personalizados está disponible en la web para espacios Business/Enterprise/Edu. En el teléfono, usa el flujo de copiar y pegar el prompt.', 'Claude : ajoutez le connecteur depuis le web, puis utilisez-le sur iOS ou Android. ChatGPT : la connexion de serveurs MCP personnalisés est disponible sur le web pour les espaces Business/Enterprise/Edu. Sur téléphone, utilisez le prompt à copier-coller.', 'Claude: Füge den Connector im Web hinzu und nutze ihn danach auf iOS oder Android. ChatGPT: Benutzerdefinierte MCP-Server lassen sich im Web für Business/Enterprise/Edu-Workspaces verbinden. Auf dem Smartphone nutze den Prompt zum Kopieren und Einfügen.'],
    ['Nessuna IA collegata a questo profilo.', 'No AI is connected to this profile.', 'No hay ninguna IA conectada a este perfil.', 'Aucune IA n’est connectée à ce profil.', 'Mit diesem Profil ist keine KI verbunden.'],
    ['Revoca', 'Revoke', 'Revocar', 'Révoquer', 'Widerrufen'],
    ['Il prompt portatile viene copiato solo quando lo chiedi. Il connettore MCP vede esclusivamente il tuo profilo e richiede il tuo consenso. Non inviamo chiavi API a Master Atlas.', 'The portable prompt is copied only when you ask. The MCP connector can access only your profile and requires your consent. Master Atlas never receives API keys.', 'El prompt portátil solo se copia cuando lo solicitas. El conector MCP solo ve tu perfil y requiere tu consentimiento. Master Atlas no recibe claves API.', 'Le prompt portable n’est copié qu’à votre demande. Le connecteur MCP ne voit que votre profil et nécessite votre consentement. Master Atlas ne reçoit jamais de clés API.', 'Der portable Prompt wird nur auf Wunsch kopiert. Der MCP-Konnektor sieht nur dein Profil und benötigt deine Zustimmung. Master Atlas erhält keine API-Schlüssel.'],
    ['Prompt copiato. Incollalo nella tua IA e poi riporta qui la risposta JSON.', 'Prompt copied. Paste it into your AI, then bring the JSON response back here.', 'Prompt copiado. Pégalo en tu IA y luego trae aquí la respuesta JSON.', 'Prompt copié. Collez-le dans votre IA, puis rapportez la réponse JSON ici.', 'Prompt kopiert. Füge ihn in deine KI ein und bringe dann die JSON-Antwort hierher.'],
    ['Seleziona e copia il prompt, poi incollalo nella tua IA preferita.', 'Select and copy the prompt, then paste it into your preferred AI.', 'Selecciona y copia el prompt, y pégalo en tu IA preferida.', 'Sélectionnez et copiez le prompt, puis collez-le dans votre IA préférée.', 'Markiere und kopiere den Prompt und füge ihn in deine bevorzugte KI ein.'],
    ['Indirizzo MCP copiato: aggiungilo come connettore nella tua IA.', 'MCP address copied: add it as a connector in your AI app.', 'Dirección MCP copiada: añádela como conector en tu IA.', 'Adresse MCP copiée : ajoutez-la comme connecteur dans votre IA.', 'MCP-Adresse kopiert: Füge sie in deiner KI-App als Connector hinzu.'],
    ['Controlla il riepilogo. L’IA non può salvare le modifiche finché non premi “Applica al mio atlante”.', 'Review the summary. The AI cannot save changes until you select “Apply to my atlas”.', 'Revisa el resumen. La IA no puede guardar los cambios hasta que pulses «Aplicar a mi atlas».', 'Vérifiez le récapitulatif. L’IA ne peut pas enregistrer les modifications avant que vous choisissiez « Appliquer à mon atlas ».', 'Prüfe die Zusammenfassung. Die KI kann Änderungen erst speichern, wenn du „Auf meinen Atlas anwenden“ auswählst.'],
    ['Il collegamento diretto richiede un profilo con sincronizzazione cloud.', 'Direct connection requires a profile with cloud sync.', 'La conexión directa requiere un perfil con sincronización en la nube.', 'La connexion directe nécessite un profil avec synchronisation cloud.', 'Die direkte Verbindung benötigt ein Profil mit Cloud-Synchronisierung.'],
    ['Collegamento IA revocato', 'AI connection revoked', 'Conexión de IA revocada', 'Connexion IA révoquée', 'KI-Verbindung widerrufen'],
    ['ChatGPT · app Master Atlas', 'ChatGPT · Master Atlas app', 'ChatGPT · app Master Atlas', 'ChatGPT · application Master Atlas', 'ChatGPT · Master Atlas App'],
    ['Collegamento app ChatGPT (Sites)', 'ChatGPT app connection (Sites)', 'Conexión de la app ChatGPT (Sites)', 'Connexion de l’application ChatGPT (Sites)', 'ChatGPT-App-Verbindung (Sites)'],
    ['Revoca collegamento ChatGPT', 'Revoke ChatGPT connection', 'Revocar conexión de ChatGPT', 'Révoquer la connexion ChatGPT', 'ChatGPT-Verbindung widerrufen'],
    ['Revocare il collegamento dell’app ChatGPT a questo profilo? ChatGPT perderà l’accesso ai tuoi dati.', 'Revoke the ChatGPT app connection to this profile? ChatGPT will lose access to your data.', '¿Revocar la conexión de la app ChatGPT con este perfil? ChatGPT perderá el acceso a tus datos.', 'Révoquer la connexion de l’application ChatGPT à ce profil ? ChatGPT perdra l’accès à vos données.', 'Die ChatGPT-App-Verbindung zu diesem Profil widerrufen? ChatGPT verliert den Zugriff auf deine Daten.'],
    ['Collegamento ChatGPT revocato', 'ChatGPT connection revoked', 'Conexión de ChatGPT revocada', 'Connexion ChatGPT révoquée', 'ChatGPT-Verbindung widerrufen'],
    ['Non è stato possibile revocare il collegamento. Riprova.', 'Could not revoke the connection. Try again.', 'No se pudo revocar la conexión. Inténtalo de nuevo.', 'Impossible de révoquer la connexion. Réessayez.', 'Die Verbindung konnte nicht widerrufen werden. Bitte versuche es erneut.'],
    ['● Spazio privato', '● Private space', '● Espacio privado', '● Espace privé', '● Privater Bereich'],
    ['● Sito pubblico', '● Public site', '● Sitio público', '● Site public', '● Öffentliche Website'],
    ['Installa app', 'Install app', 'Instalar app', 'Installer l’app', 'App installieren'],
    ['Aggiungi passkey', 'Add passkey', 'Añadir clave de acceso', 'Ajouter une clé d’accès', 'Passkey hinzufügen'],
    ['Il mio profilo', 'My profile', 'Mi perfil', 'Mon profil', 'Mein Profil'],
    ['Esci dal profilo', 'Sign out', 'Cerrar sesión', 'Se déconnecter', 'Abmelden'],
    ['Apri profilo', 'Open profile', 'Abrir perfil', 'Ouvrir le profil', 'Profil öffnen'],
    ['Panoramica', 'Overview', 'Resumen', 'Vue d’ensemble', 'Übersicht'],
    ['Esplora i percorsi', 'Explore programmes', 'Explorar programas', 'Explorer les formations', 'Studiengänge entdecken'],
    ['Università', 'Universities', 'Universidades', 'Universités', 'Universitäten'],
    ['La mia selezione', 'My shortlist', 'Mi selección', 'Ma sélection', 'Meine Auswahl'],
    ['Confronta', 'Compare', 'Comparar', 'Comparer', 'Vergleichen'],
    ['Candidature', 'Applications', 'Solicitudes', 'Candidatures', 'Bewerbungen'],
    ['Dossier e legenda', 'Dossier and key', 'Dossier y leyenda', 'Dossier et légende', 'Dossier und Legende'],
    ['Il tuo spazio personale', 'Your private space', 'Tu espacio personal', 'Votre espace personnel', 'Dein privater Bereich'],
    ['Caricamento dati personali…', 'Loading your data…', 'Cargando tus datos…', 'Chargement de vos données…', 'Deine Daten werden geladen…'],
    ['Azioni rapide', 'Quick actions', 'Acciones rápidas', 'Actions rapides', 'Schnellaktionen'],
    ['Esplora e aggiungi percorsi', 'Explore and add programmes', 'Explorar y añadir programas', 'Explorer et ajouter des formations', 'Studiengänge entdecken und hinzufügen'],
    ['Apri ricerca rapida', 'Open quick search', 'Abrir búsqueda rápida', 'Ouvrir la recherche rapide', 'Schnellsuche öffnen'],
    ['Aggiungi percorsi', 'Add programmes', 'Añadir programas', 'Ajouter des formations', 'Studiengänge hinzufügen'],
    ['Cerca percorsi e università', 'Search programmes and universities', 'Buscar programas y universidades', 'Rechercher des formations et des universités', 'Studiengänge und Universitäten suchen'],
    ['Passa al tema chiaro', 'Switch to light mode', 'Cambiar al modo claro', 'Passer en mode clair', 'Zum hellen Design wechseln'],
    ['Passa al tema scuro', 'Switch to dark mode', 'Cambiar al modo oscuro', 'Passer en mode sombre', 'Zum dunklen Design wechseln'],
    ['Il tuo atlante, sempre con te.', 'Your atlas, always with you.', 'Tu atlas, siempre contigo.', 'Votre atlas, toujours avec vous.', 'Dein Atlas, immer dabei.'],
    ['Accedi con il tuo profilo per ritrovare percorsi, università e candidature su ogni dispositivo.', 'Sign in to find your programmes, universities and applications on any device.', 'Accede a tu perfil para encontrar tus programas, universidades y solicitudes en cualquier dispositivo.', 'Connectez-vous pour retrouver vos formations, universités et candidatures sur tous vos appareils.', 'Melde dich an, um deine Studiengänge, Universitäten und Bewerbungen auf jedem Gerät wiederzufinden.'],
    ['Nome utente', 'Username', 'Nombre de usuario', 'Nom d’utilisateur', 'Benutzername'],
    ['Password', 'Password', 'Contraseña', 'Mot de passe', 'Passwort'],
    ['Resta connesso', 'Keep me signed in', 'Mantener la sesión', 'Rester connecté', 'Angemeldet bleiben'],
    ['L’accesso si rinnova mentre usi l’app.', 'Your session stays active while you use the app.', 'La sesión se mantiene activa mientras usas la app.', 'Votre session reste active pendant l’utilisation de l’app.', 'Deine Sitzung bleibt aktiv, während du die App nutzt.'],
    ['Accedi', 'Sign in', 'Iniciar sesión', 'Se connecter', 'Anmelden'],
    ['Crea profilo', 'Create profile', 'Crear perfil', 'Créer un profil', 'Profil erstellen'],
    ['Usa una passkey', 'Use a passkey', 'Usar una clave de acceso', 'Utiliser une clé d’accès', 'Passkey verwenden'],
    ['Almeno 12 caratteri', 'At least 12 characters', 'Al menos 12 caracteres', '12 caractères minimum', 'Mindestens 12 Zeichen'],
    ['La password viene conservata solo come hash protetto. Puoi aggiungere una passkey al profilo per accedere con Face ID, impronta o il gestore passkey del tuo dispositivo.', 'Your password is stored only as a secure hash. Add a passkey to sign in with Face ID, your fingerprint or your device’s passkey manager.', 'Tu contraseña se guarda únicamente como un hash protegido. Añade una clave de acceso para iniciar sesión con Face ID, tu huella o el gestor de claves de tu dispositivo.', 'Votre mot de passe est conservé uniquement sous forme de hash sécurisé. Ajoutez une clé d’accès pour vous connecter avec Face ID, votre empreinte ou le gestionnaire de clés de votre appareil.', 'Dein Passwort wird nur als sicherer Hash gespeichert. Füge einen Passkey hinzu, um dich mit Face ID, Fingerabdruck oder dem Passkey-Manager deines Geräts anzumelden.'],
    ['Inserisci nome utente e password.', 'Enter your username and password.', 'Introduce tu nombre de usuario y contraseña.', 'Saisissez votre nom d’utilisateur et votre mot de passe.', 'Gib deinen Benutzernamen und dein Passwort ein.'],
    ['Scegli un nome utente e una password.', 'Choose a username and password.', 'Elige un nombre de usuario y una contraseña.', 'Choisissez un nom d’utilisateur et un mot de passe.', 'Wähle einen Benutzernamen und ein Passwort.'],
    ['La password deve contenere almeno 12 caratteri.', 'Your password must contain at least 12 characters.', 'La contraseña debe tener al menos 12 caracteres.', 'Le mot de passe doit contenir au moins 12 caractères.', 'Dein Passwort muss mindestens 12 Zeichen enthalten.'],
    ['Operazione annullata.', 'Operation cancelled.', 'Operación cancelada.', 'Opération annulée.', 'Vorgang abgebrochen.'],
    ['Questo browser non supporta le passkey.', 'This browser does not support passkeys.', 'Este navegador no admite claves de acceso.', 'Ce navigateur ne prend pas en charge les clés d’accès.', 'Dieser Browser unterstützt keine Passkeys.'],
    ['Il tuo spazio', 'Your space', 'Tu espacio', 'Votre espace', 'Dein Bereich'],
    ['Il tuo atlante.', 'Your atlas.', 'Tu atlas.', 'Votre atlas.', 'Dein Atlas.'],
    ['Percorsi, università e candidature raccolti in un unico spazio.', 'Programmes, universities and applications in one place.', 'Programas, universidades y solicitudes en un solo lugar.', 'Formations, universités et candidatures réunies au même endroit.', 'Studiengänge, Universitäten und Bewerbungen an einem Ort.'],
    ['Esplora i percorsi ↗', 'Explore programmes ↗', 'Explorar programas ↗', 'Explorer les formations ↗', 'Studiengänge entdecken ↗'],
    ['ATLANTE INTERATTIVO', 'INTERACTIVE ATLAS', 'ATLAS INTERACTIVO', 'ATLAS INTERACTIF', 'INTERAKTIVER ATLAS'],
    ['Le tue università, nel mondo.', 'Your universities around the world.', 'Tus universidades en el mundo.', 'Vos universités dans le monde.', 'Deine Universitäten weltweit.'],
    ['IL DOSSIER', 'THE DOSSIER', 'EL DOSSIER', 'LE DOSSIER', 'DAS DOSSIER'],
    ['Una panoramica.', 'An overview.', 'Una vista general.', 'Une vue d’ensemble.', 'Ein Überblick.'],
    ['La selezione.', 'Your shortlist.', 'Tu selección.', 'Votre sélection.', 'Deine Auswahl.'],
    ['Le classifiche.', 'The rankings.', 'Las clasificaciones.', 'Les classements.', 'Die Ranglisten.'],
    ['Candidature.', 'Applications.', 'Solicitudes.', 'Candidatures.', 'Bewerbungen.'],
    ['IL PROSSIMO PASSO', 'YOUR NEXT STEP', 'EL SIGUIENTE PASO', 'LA PROCHAINE ÉTAPE', 'DER NÄCHSTE SCHRITT'],
    ['LA TUA BUSSOLA', 'YOUR COMPASS', 'TU BRÚJULA', 'VOTRE BOUSSOLE', 'DEIN KOMPASS'],
    ['LA TUA CHECKLIST', 'YOUR CHECKLIST', 'TU LISTA', 'VOTRE LISTE', 'DEINE CHECKLISTE'],
    ['SCELTI PER TE', 'PICKED FOR YOU', 'PARA TI', 'CHOISIS POUR VOUS', 'FÜR DICH AUSGEWÄHLT'],
    ['DA TENERE VICINO', 'KEEP CLOSE', 'PARA TENER A MANO', 'À GARDER SOUS LA MAIN', 'IM BLICK BEHALTEN'],
    ['Europa', 'Europe', 'Europa', 'Europe', 'Europa'],
    ['Extra-Europa', 'Outside Europe', 'Fuera de Europa', 'Hors Europe', 'Außerhalb Europas'],
    ['Tutte', 'All', 'Todas', 'Toutes', 'Alle'],
    ['Percorsi', 'Programmes', 'Programas', 'Formations', 'Studiengänge'],
    ['Sezioni', 'Sections', 'Secciones', 'Rubriques', 'Bereiche'],
    ['Shortlist', 'Shortlist', 'Selección', 'Sélection', 'Merkliste'],
    ['Il tuo piano', 'Your plan', 'Tu plan', 'Votre plan', 'Dein Plan'],
    ['Le tue note', 'Your notes', 'Tus notas', 'Vos notes', 'Deine Notizen'],
    ['Le tue università, nel mondo.', 'Your universities around the world.', 'Tus universidades en el mundo.', 'Vos universités dans le monde.', 'Deine Universitäten weltweit.'],
    ['Dalla cellula,', 'From the cell,', 'Desde la célula,', 'De la cellule,', 'Von der Zelle,'],
    ['alle possibilità.', 'to every possibility.', 'a todas las posibilidades.', 'à toutes les possibilités.', 'zu allen Möglichkeiten.'],
    ['Biologia cellulare, staminali e rigenerazione: il tuo interesse guida la ricerca.', 'Cell biology, stem cells and regeneration: let your curiosity guide your research.', 'Biología celular, células madre y regeneración: tu interés guía la investigación.', 'Biologie cellulaire, cellules souches et régénération : votre curiosité guide la recherche.', 'Zellbiologie, Stammzellen und Regeneration: Deine Interessen leiten die Forschung.'],
    ['Cellule', 'Cells', 'Células', 'Cellules', 'Zellen'],
    ['Sviluppo', 'Development', 'Desarrollo', 'Développement', 'Entwicklung'],
    ['Ricerca', 'Research', 'Investigación', 'Recherche', 'Forschung'],
    ['Segui la tua curiosità', 'Follow your curiosity', 'Sigue tu curiosidad', 'Suivez votre curiosité', 'Folge deiner Neugier'],
    ['208 voci classificate non significano 208 titoli autonomi:', '208 ranked entries do not mean 208 independent degrees:', '208 entradas clasificadas no equivalen a 208 títulos independientes:', '208 entrées classées ne correspondent pas à 208 diplômes indépendants :', '208 Ranglisteneinträge bedeuten nicht 208 eigenständige Abschlüsse:'],
    ['Le graduatorie misurano affinità e contesto di ricerca in modo qualitativo. Non stimano le probabilità di ingresso.', 'The rankings describe research fit and context qualitatively. They do not estimate admission chances.', 'Las clasificaciones describen cualitativamente la afinidad y el contexto de investigación. No estiman las probabilidades de admisión.', 'Les classements évaluent qualitativement l’adéquation et le contexte de recherche. Ils ne prédisent pas les chances d’admission.', 'Die Ranglisten bewerten Forschungsnähe und -umfeld qualitativ. Sie schätzen keine Zulassungschancen.'],
    ['Esplora tutti i 27 atenei', 'Explore all 27 universities', 'Explora las 27 universidades', 'Explorer les 27 universités', 'Alle 27 Universitäten ansehen'],
    ['Le università nel tuo dossier', 'Universities in your dossier', 'Universidades de tu dossier', 'Universités de votre dossier', 'Universitäten in deinem Dossier'],
    ['Università nel dossier', 'Universities in the dossier', 'Universidades en el dossier', 'Universités du dossier', 'Universitäten im Dossier'],
    ['Una legenda per orientarti', 'A guide to the key', 'Una guía para orientarte', 'Une légende pour vous guider', 'Eine Legende zur Orientierung'],
    ['NOTE DEL DOSSIER', 'DOSSIER NOTES', 'NOTAS DEL DOSSIER', 'NOTES DU DOSSIER', 'DOSSIERNOTIZEN'],
    ['Confronta questo percorso', 'Compare this programme', 'Comparar este programa', 'Comparer cette formation', 'Diesen Studiengang vergleichen'],
    ['Scegli un percorso', 'Choose a programme', 'Elige un programa', 'Choisir une formation', 'Studiengang auswählen'],
    ['Salva il mio piano ✓', 'Save my plan ✓', 'Guardar mi plan ✓', 'Enregistrer mon plan ✓', 'Plan speichern ✓'],
    ['Non monitorata', 'Not tracked', 'Sin seguimiento', 'Non suivie', 'Nicht verfolgt'],
    ['Da valutare', 'To consider', 'Por valorar', 'À étudier', 'Zu prüfen'],
    ['In preparazione', 'In preparation', 'En preparación', 'En préparation', 'In Vorbereitung'],
    ['Inviata', 'Submitted', 'Enviada', 'Envoyée', 'Eingereicht'],
    ['Esito ricevuto', 'Decision received', 'Resultado recibido', 'Réponse reçue', 'Rückmeldung erhalten'],
    ['Stato della candidatura', 'Application status', 'Estado de la solicitud', 'État de la candidature', 'Bewerbungsstatus'],
    ['Nessuna scadenza inserita', 'No deadline added', 'No se ha añadido ninguna fecha límite', 'Aucune échéance ajoutée', 'Keine Frist eingetragen'],
    ['I tuoi prossimi passi appariranno qui.', 'Your next steps will appear here.', 'Tus próximos pasos aparecerán aquí.', 'Vos prochaines étapes apparaîtront ici.', 'Deine nächsten Schritte erscheinen hier.'],
    ['I percorsi che salvi con il cuore appariranno qui.', 'Programmes you save as favourites will appear here.', 'Los programas que guardes como favoritos aparecerán aquí.', 'Les formations ajoutées aux favoris apparaîtront ici.', 'Deine gespeicherten Studiengänge erscheinen hier.'],
    ['Metti le alternative una accanto all’altra.', 'Compare your options side by side.', 'Compara las opciones una al lado de la otra.', 'Comparez les options côte à côte.', 'Vergleiche deine Optionen nebeneinander.'],
    ['Seleziona “Confronta” sulle schede dei percorsi per iniziare.', 'Choose “Compare” on a programme card to get started.', 'Selecciona «Comparar» en una ficha para empezar.', 'Sélectionnez « Comparer » sur une fiche pour commencer.', 'Wähle „Vergleichen“ auf einer Karte, um loszulegen.'],
    ['Sito ufficiale ↗', 'Official website ↗', 'Sitio oficial ↗', 'Site officiel ↗', 'Offizielle Website ↗'],
    ['Apri scheda ↗', 'Open record ↗', 'Abrir ficha ↗', 'Ouvrir la fiche ↗', 'Eintrag öffnen ↗'],
    ['Documento integrale', 'Full document', 'Documento completo', 'Document intégral', 'Vollständiges Dokument'],
    ['Leggi il file originale completo', 'Read the complete original file', 'Leer el archivo original completo', 'Lire le fichier original complet', 'Die vollständige Originaldatei lesen'],
    ['Apri tutte le note originali', 'Open all original notes', 'Abrir todas las notas originales', 'Afficher toutes les notes originales', 'Alle Originalnotizen öffnen'],
    ['Cerca un percorso, una città, un’università…', 'Search programmes, cities or universities…', 'Buscar programas, ciudades o universidades…', 'Rechercher des formations, villes ou universités…', 'Studiengänge, Städte oder Universitäten suchen…'],
    ['Cerca percorsi', 'Search programmes', 'Buscar programas', 'Rechercher des formations', 'Studiengänge suchen'],
    ['Filtra università', 'Filter universities', 'Filtrar universidades', 'Filtrer les universités', 'Universitäten filtern'],
    ['Tutte le università', 'All universities', 'Todas las universidades', 'Toutes les universités', 'Alle Universitäten'],
    ['Tutti i percorsi', 'All programmes', 'Todos los programas', 'Toutes les formations', 'Alle Studiengänge'],
    ['Tutti i tipi', 'All types', 'Todos los tipos', 'Tous les types', 'Alle Typen'],
    ['Tutte le condizioni', 'All requirements', 'Todos los requisitos', 'Toutes les conditions', 'Alle Voraussetzungen'],
    ['Cerca percorsi, università o sezioni', 'Search programmes, universities or sections', 'Buscar programas, universidades o secciones', 'Rechercher des formations, universités ou rubriques', 'Studiengänge, Universitäten oder Bereiche suchen'],
    ['Cerca percorsi, università o una sezione…', 'Search programmes, universities or a section…', 'Buscar programas, universidades o una sección…', 'Rechercher une formation, une université ou une rubrique…', 'Studiengänge, Universitäten oder Bereiche suchen…'],
    ['Digita per cercare percorsi o università.', 'Type to search programmes or universities.', 'Escribe para buscar programas o universidades.', 'Saisissez du texte pour rechercher des formations ou des universités.', 'Studiengänge oder Universitäten suchen.'],
    ['Nessun risultato. Prova con un altro nome o una città.', 'No results. Try another name or city.', 'Sin resultados. Prueba con otro nombre o ciudad.', 'Aucun résultat. Essayez un autre nom ou une ville.', 'Keine Ergebnisse. Versuche einen anderen Namen oder eine Stadt.'],
    ['Rinomina profilo', 'Rename profile', 'Cambiar nombre del perfil', 'Renommer le profil', 'Profil umbenennen'],
    ['Gestisci profilo', 'Manage profile', 'Gestionar perfil', 'Gérer le profil', 'Profil verwalten'],
    ['Il nome utente identifica il tuo profilo. Conferma le modifiche con la password.', 'Your username identifies your profile. Confirm changes with your password.', 'Tu nombre de usuario identifica tu perfil. Confirma los cambios con tu contraseña.', 'Votre nom d’utilisateur identifie votre profil. Confirmez les modifications avec votre mot de passe.', 'Dein Benutzername identifiziert dein Profil. Bestätige Änderungen mit deinem Passwort.'],
    ['Nuovo nome utente', 'New username', 'Nuevo nombre de usuario', 'Nouveau nom d’utilisateur', 'Neuer Benutzername'],
    ['Password attuale', 'Current password', 'Contraseña actual', 'Mot de passe actuel', 'Aktuelles Passwort'],
    ['Elimina profilo', 'Delete profile', 'Eliminar perfil', 'Supprimer le profil', 'Profil löschen'],
    ['Questa operazione elimina il profilo e i dati sincronizzati. Esporta prima un backup se vuoi conservarli.', 'This deletes your profile and synced data. Export a backup first if you want to keep them.', 'Esta acción elimina el perfil y los datos sincronizados. Exporta una copia antes si quieres conservarlos.', 'Cette opération supprime le profil et les données synchronisées. Exportez une sauvegarde si vous souhaitez les conserver.', 'Dadurch werden dein Profil und synchronisierte Daten gelöscht. Exportiere vorher ein Backup, wenn du sie behalten möchtest.'],
    ['Per confermare, scrivi', 'To confirm, type', 'Para confirmar, escribe', 'Pour confirmer, saisissez', 'Zur Bestätigung eingeben'],
    ['Elimina definitivamente', 'Delete permanently', 'Eliminar definitivamente', 'Supprimer définitivement', 'Endgültig löschen'],
    ['Chiudi', 'Close', 'Cerrar', 'Fermer', 'Schließen'],
    ['Aggiungi Master Atlas', 'Add Master Atlas', 'Añadir Master Atlas', 'Ajouter Master Atlas', 'Master Atlas hinzufügen'],
    ['Installa l’atlante sulla schermata Home per aprirlo come un’app.', 'Add the atlas to your Home Screen to open it like an app.', 'Añade el atlas a la pantalla de inicio para abrirlo como una app.', 'Ajoutez l’atlas à l’écran d’accueil pour l’ouvrir comme une app.', 'Füge den Atlas zum Startbildschirm hinzu, um ihn wie eine App zu öffnen.'],
    ['L’app si aggiorna dal sito e sincronizza il profilo quando sei online.', 'The app updates from the website and syncs your profile when you are online.', 'La app se actualiza desde el sitio y sincroniza tu perfil cuando tienes conexión.', 'L’app se met à jour depuis le site et synchronise votre profil lorsque vous êtes en ligne.', 'Die App aktualisiert sich über die Website und synchronisiert dein Profil, wenn du online bist.'],
    ['Ricarica', 'Reload', 'Recargar', 'Recharger', 'Neu laden'],
    ['Ricarica la pagina per riprovare.', 'Reload the page to try again.', 'Recarga la página para volver a intentarlo.', 'Rechargez la page pour réessayer.', 'Lade die Seite neu und versuche es erneut.'],
    ['Non riesco a caricare il dossier.', 'Could not load the dossier.', 'No se ha podido cargar el dossier.', 'Impossible de charger le dossier.', 'Das Dossier konnte nicht geladen werden.'],
    ['Caricamento del tuo atlante…', 'Loading your atlas…', 'Cargando tu atlas…', 'Chargement de votre atlas…', 'Dein Atlas wird geladen…'],
    ['Esporta backup', 'Export backup', 'Exportar copia', 'Exporter la sauvegarde', 'Backup exportieren'],
    ['Importa backup', 'Import backup', 'Importar copia', 'Importer une sauvegarde', 'Backup importieren'],
    ['Esporta backup JSON', 'Export JSON backup', 'Exportar copia JSON', 'Exporter la sauvegarde JSON', 'JSON-Backup exportieren'],
    ['Esporta risultati CSV', 'Export CSV results', 'Exportar resultados CSV', 'Exporter les résultats CSV', 'Ergebnisse als CSV exportieren'],
    ['IMPORTAZIONE PROTETTA', 'SAFE IMPORT', 'IMPORTACIÓN SEGURA', 'IMPORTATION SÉCURISÉE', 'GESICHERTER IMPORT'],
    ['Controlla il backup.', 'Review the backup.', 'Revisa la copia.', 'Vérifiez la sauvegarde.', 'Backup prüfen.'],
    ['Le note esistenti vengono mantenute per impostazione predefinita. Verrà creata una copia di recupero prima di applicare il backup.', 'Existing notes are kept by default. A recovery copy will be created before the backup is applied.', 'Las notas existentes se conservan de forma predeterminada. Se creará una copia de recuperación antes de aplicar la copia.', 'Les notes existantes sont conservées par défaut. Une copie de récupération sera créée avant l’application de la sauvegarde.', 'Vorhandene Notizen bleiben standardmäßig erhalten. Vor dem Import wird eine Wiederherstellungskopie erstellt.'],
    ['Confronta le schede in conflitto', 'Compare conflicting records', 'Comparar fichas en conflicto', 'Comparer les fiches en conflit', 'Konflikte vergleichen'],
    ['Sostituisci anche le schede esistenti con quelle del backup', 'Also replace existing records with those in the backup', 'Sustituir también las fichas existentes por las de la copia', 'Remplacer également les fiches existantes par celles de la sauvegarde', 'Vorhandene Einträge ebenfalls durch das Backup ersetzen'],
    ['Annulla', 'Cancel', 'Cancelar', 'Annuler', 'Abbrechen'],
    ['Applica importazione', 'Apply import', 'Aplicar importación', 'Appliquer l’importation', 'Import anwenden'],
    ['Copie di recupero.', 'Recovery copies.', 'Copias de recuperación.', 'Copies de récupération.', 'Wiederherstellungskopien.'],
    ['Scarica una copia, poi importala per confrontare le differenze prima di ripristinare.', 'Download a copy, then import it to compare changes before restoring.', 'Descarga una copia y luego impórtala para comparar los cambios antes de restaurarla.', 'Téléchargez une copie, puis importez-la pour comparer les changements avant la restauration.', 'Lade eine Kopie herunter und importiere sie, um Änderungen vor dem Wiederherstellen zu vergleichen.'],
    ['Su questo browser', 'On this browser', 'En este navegador', 'Sur ce navigateur', 'In diesem Browser'],
    ['Nel tuo spazio privato', 'In your private space', 'En tu espacio privado', 'Dans votre espace privé', 'In deinem privaten Bereich'],
    ['Nessuna copia locale precedente.', 'No previous local copy.', 'No hay copias locales anteriores.', 'Aucune copie locale précédente.', 'Keine frühere lokale Kopie.'],
    ['Nessuna copia cloud precedente.', 'No previous cloud copy.', 'No hay copias en la nube anteriores.', 'Aucune copie cloud précédente.', 'Keine frühere Cloud-Kopie.'],
    ['Caricamento copie cloud…', 'Loading cloud copies…', 'Cargando copias en la nube…', 'Chargement des copies cloud…', 'Cloud-Kopien werden geladen…'],
    ['Trascina per esplorare · usa due dita per inclinare, ruotare e zoomare.', 'Drag to explore · use two fingers to tilt, rotate and zoom.', 'Arrastra para explorar · usa dos dedos para inclinar, girar y ampliar.', 'Faites glisser pour explorer · utilisez deux doigts pour incliner, tourner et zoomer.', 'Zum Erkunden ziehen · mit zwei Fingern neigen, drehen und zoomen.'],
    ['Trascina · pinch per zoom · N nord · R reset', 'Drag · pinch to zoom · N north · R reset', 'Arrastra · pellizca para ampliar · N norte · R restablecer', 'Glisser · pincer pour zoomer · N nord · R réinitialiser', 'Ziehen · zum Zoomen kneifen · N Norden · R zurücksetzen'],
    ['Torna al nord', 'Return to north', 'Volver al norte', 'Revenir au nord', 'Nach Norden ausrichten'],
    ['Svuota confronto', 'Clear comparison', 'Vaciar comparación', 'Effacer la comparaison', 'Vergleich leeren'],
    ['Esplora i percorsi ↗', 'Explore programmes ↗', 'Explorar programas ↗', 'Explorer les formations ↗', 'Studiengänge entdecken ↗'],
    ['Scadenza verificata da te', 'Deadline verified by you', 'Fecha límite verificada por ti', 'Échéance vérifiée par vous', 'Von dir bestätigte Frist'],
    ['Le tue università, nel mondo.', 'Your universities around the world.', 'Tus universidades en el mundo.', 'Vos universités dans le monde.', 'Deine Universitäten weltweit.'],
    ['Ricerca', 'Search', 'Buscar', 'Recherche', 'Suche'],
    ['Posizione', 'Rank', 'Posición', 'Rang', 'Rang'],
    ['TIPO DI PERCORSO', 'PROGRAMME TYPE', 'TIPO DE PROGRAMA', 'TYPE DE FORMATION', 'STUDIENGANGSTYP'],
    ['CONDIZIONI NEL DOSSIER', 'DOSSIER REQUIREMENTS', 'REQUISITOS DEL DOSSIER', 'CONDITIONS DU DOSSIER', 'VORAUSSETZUNGEN IM DOSSIER'],
    ['TIPO / CONDIZIONI', 'TYPE / REQUIREMENTS', 'TIPO / REQUISITOS', 'TYPE / CONDITIONS', 'TYP / VORAUSSETZUNGEN'],
    ['UNIVERSITÀ / CITTÀ', 'UNIVERSITY / CITY', 'UNIVERSIDAD / CIUDAD', 'UNIVERSITÉ / VILLE', 'UNIVERSITÄT / STADT'],
    ['Seleziona', 'Select', 'Seleccionar', 'Sélectionner', 'Auswählen'],
    ['Rimuovi ×', 'Remove ×', 'Quitar ×', 'Retirer ×', 'Entfernen ×'],
    ['Apri scheda ↗', 'Open record ↗', 'Abrir ficha ↗', 'Ouvrir la fiche ↗', 'Eintrag öffnen ↗'],
    ['Classifiche qualitative del dossier: non sono ranking ufficiali né probabilità di ammissione.', 'The dossier rankings are qualitative. They are not official rankings or admission probabilities.', 'Las clasificaciones del dossier son cualitativas. No son rankings oficiales ni probabilidades de admisión.', 'Les classements du dossier sont qualitatifs. Ils ne sont ni officiels ni des probabilités d’admission.', 'Die Ranglisten im Dossier sind qualitativ. Sie sind weder offizielle Rankings noch Zulassungswahrscheinlichkeiten.'],
    ['Consulta il dossier integrale per ulteriori precisazioni sul percorso.', 'See the full dossier for more details about this programme.', 'Consulta el dossier completo para más detalles sobre el programa.', 'Consultez le dossier intégral pour plus de détails sur cette formation.', 'Weitere Einzelheiten zu diesem Studiengang findest du im vollständigen Dossier.'],
    ['Consulta voci rinominate, non attive o da riconfermare', 'See renamed, inactive or unconfirmed entries', 'Consulta entradas renombradas, inactivas o pendientes de confirmar', 'Consultez les entrées renommées, inactives ou à confirmer', 'Umbenannte, inaktive oder noch zu bestätigende Einträge ansehen'],
    ['I tuoi dati personali', 'Your personal data', 'Tus datos personales', 'Vos données personnelles', 'Deine persönlichen Daten'],
    ['Quando scegli un percorso, qui troverai stati e scadenze.', 'When you choose a programme, you will find its status and deadlines here.', 'Cuando elijas un programa, aquí encontrarás el estado y las fechas límite.', 'Lorsque vous choisirez une formation, vous trouverez ici son état et ses échéances.', 'Wenn du einen Studiengang auswählst, findest du hier Status und Fristen.'],
    ['Ripristina filtri', 'Reset filters', 'Restablecer filtros', 'Réinitialiser les filtres', 'Filter zurücksetzen'],
    ['Trova il primo', 'Find your first one', 'Encuentra el primero', 'Trouvez le premier', 'Finde deinen ersten'],
    ['Scegli i percorsi ↗', 'Choose programmes ↗', 'Elegir programas ↗', 'Choisir des formations ↗', 'Studiengänge auswählen ↗'],
    ['Seleziona “Confronta” sulle schede dei percorsi per iniziare.', 'Select “Compare” on programme cards to get started.', 'Selecciona «Comparar» en las fichas para empezar.', 'Sélectionnez « Comparer » sur une fiche pour commencer.', 'Wähle „Vergleichen“ auf einer Karte, um loszulegen.'],
    ['Sostituisci anche le schede esistenti con quelle del backup', 'Also replace existing records with those in the backup', 'Sustituir también las fichas existentes por las de la copia', 'Remplacer aussi les fiches existantes par celles de la sauvegarde', 'Vorhandene Einträge ebenfalls durch das Backup ersetzen'],
    ['Link al bando / fonte della scadenza', 'Application link / deadline source', 'Enlace a la convocatoria / fuente del plazo', 'Lien de candidature / source de l’échéance', 'Bewerbungslink / Quelle der Frist'],
    ['Sviluppo', 'Development', 'Desarrollo', 'Développement', 'Entwicklung'],
    ['nel dossier', 'in the dossier', 'en el dossier', 'dans le dossier', 'im Dossier'],
    ['percorsi salvati', 'saved programmes', 'programas guardados', 'formations enregistrées', 'gespeicherte Studiengänge'],
    ['che stai seguendo', 'you are tracking', 'que estás siguiendo', 'que vous suivez', 'die du verfolgst'],
    ['Per confermare, scrivi', 'To confirm, type', 'Para confirmar, escribe', 'Pour confirmer, saisissez', 'Zur Bestätigung eingeben'],
    ['Su questo browser', 'On this browser', 'En este navegador', 'Sur ce navigateur', 'In diesem Browser'],
    ['Il CSV contiene i risultati della selezione corrente.', 'The CSV contains the results of your current selection.', 'El CSV contiene los resultados de tu selección actual.', 'Le CSV contient les résultats de votre sélection actuelle.', 'Die CSV-Datei enthält die Ergebnisse deiner aktuellen Auswahl.'],
    ['Le scadenze si inseriscono nelle schede dopo la verifica sul sito ufficiale. Nessuna data è stata dedotta dal dossier. Spostare una scheda in “Inviata” registra il tuo stato: non invia una candidatura.', 'Add deadlines to each record after checking the official website. No dates were inferred from the dossier. Moving a record to “Submitted” only records your status; it does not send an application.', 'Añade las fechas límite tras comprobar el sitio oficial. No se han deducido fechas del dossier. Cambiar una ficha a «Enviada» registra tu estado, pero no envía una solicitud.', 'Ajoutez les échéances après vérification du site officiel. Aucune date n’a été déduite du dossier. Passer une fiche à « Envoyée » enregistre votre état, sans envoyer de candidature.', 'Trage Fristen erst nach Prüfung der offiziellen Website ein. Es wurden keine Daten aus dem Dossier abgeleitet. „Eingereicht“ hält nur deinen Status fest und versendet keine Bewerbung.'],
    ['Le quattro graduatorie del documento combinano affinità scientifica, ricerca sperimentale e ambiente dell’ateneo. Sono valutazioni qualitative personali, non ranking ufficiali o misure di ammissibilità. I dati non sono stati aggiornati con una verifica online.', 'The document’s four rankings combine scientific fit, experimental research and the university environment. They are personal qualitative assessments, not official rankings or measures of admission chances. The data has not been updated through online verification.', 'Las cuatro clasificaciones del documento combinan afinidad científica, investigación experimental y entorno universitario. Son valoraciones cualitativas personales, no rankings oficiales ni medidas de admisión. Los datos no se han actualizado mediante verificación en línea.', 'Les quatre classements du document combinent adéquation scientifique, recherche expérimentale et environnement universitaire. Ce sont des évaluations qualitatives personnelles, et non des classements officiels ni des mesures d’admissibilité. Les données n’ont pas été actualisées par une vérification en ligne.', 'Die vier Ranglisten des Dokuments kombinieren fachliche Passung, experimentelle Forschung und das Umfeld der Universität. Es sind persönliche qualitative Einschätzungen, keine offiziellen Rankings oder Zulassungsprognosen. Die Daten wurden nicht online überprüft.'],
    ['Un campo condizioni vuoto non certifica l’idoneità. Transcript, CFU, inglese e bandi vanno controllati per tutti. Per UNIL, la verifica del dossier usa il catalogo svizzero, non la pagina diretta dell’ateneo.', 'An empty requirements field does not confirm eligibility. Check transcripts, credits, English requirements and calls for every programme. For UNIL, the dossier uses the Swiss catalogue rather than the university’s own page.', 'Un campo de requisitos vacío no confirma la elegibilidad. Comprueba el expediente, créditos, inglés y convocatorias para todos los programas. Para UNIL, el dossier usa el catálogo suizo, no la página directa de la universidad.', 'Un champ de conditions vide ne confirme pas l’admissibilité. Vérifiez les relevés de notes, crédits, anglais et appels pour chaque formation. Pour UNIL, le dossier utilise le catalogue suisse et non le site direct de l’université.', 'Ein leeres Voraussetzungenfeld bestätigt keine Eignung. Prüfe Zeugnisse, Leistungspunkte, Englisch und Ausschreibungen für alle Studiengänge. Bei UNIL nutzt das Dossier den Schweizer Katalog, nicht die direkte Hochschulseite.'],
    ['Candidature.', 'Applications.', 'Solicitudes.', 'Candidatures.', 'Bewerbungen.'],
    ['Confronta ⇄', 'Compare ⇄', 'Comparar ⇄', 'Comparer ⇄', 'Vergleichen ⇄'],
    ['Il dossier, senza perdere nulla.', 'The dossier, without losing a thing.', 'El dossier, sin perder nada.', 'Le dossier, sans rien perdre.', 'Das Dossier, ohne etwas zu verlieren.'],
    ['Contenuti originali aggiornati al 16 ottobre 2026, con legenda e voci storiche.', 'Original content updated on 16 October 2026, with a guide and historical entries.', 'Contenido original actualizado el 16 de octubre de 2026, con leyenda y entradas históricas.', 'Contenu original mis à jour le 16 octobre 2026, avec légende et entrées historiques.', 'Originalinhalte vom 16. Oktober 2026 mit Legende und historischen Einträgen.'],
    ['PERCORSO', 'PROGRAMME', 'PROGRAMA', 'FORMATION', 'STUDIENGANG'],
    ['POSIZIONE', 'RANK', 'POSICIÓN', 'RANG', 'RANG'],
    ['Verifica in corso…', 'Checking…', 'Verificando…', 'Vérification…', 'Wird überprüft…'],
    ['Operazione non riuscita.', 'The operation failed.', 'La operación ha fallado.', 'L’opération a échoué.', 'Der Vorgang ist fehlgeschlagen.'],
    ['Aggiornamento…', 'Updating…', 'Actualizando…', 'Mise à jour…', 'Wird aktualisiert…'],
    ['Nome utente aggiornato.', 'Username updated.', 'Nombre de usuario actualizado.', 'Nom d’utilisateur mis à jour.', 'Benutzername aktualisiert.'],
    ['Non è stato possibile rinominare il profilo.', 'Could not rename the profile.', 'No se ha podido cambiar el nombre del perfil.', 'Impossible de renommer le profil.', 'Das Profil konnte nicht umbenannt werden.'],
    ['Scrivi ELIMINA per confermare.', 'Type ELIMINA to confirm.', 'Escribe ELIMINA para confirmar.', 'Saisissez ELIMINA pour confirmer.', 'Gib ELIMINA zur Bestätigung ein.'],
    ['Eliminazione in corso…', 'Deleting…', 'Eliminando…', 'Suppression…', 'Wird gelöscht…'],
    ['Eliminare definitivamente il profilo e tutti i dati sincronizzati? Questa azione non si può annullare.', 'Permanently delete your profile and all synced data? This action cannot be undone.', '¿Eliminar definitivamente tu perfil y todos los datos sincronizados? Esta acción no se puede deshacer.', 'Supprimer définitivement votre profil et toutes les données synchronisées ? Cette action est irréversible.', 'Profil und alle synchronisierten Daten endgültig löschen? Dieser Schritt kann nicht rückgängig gemacht werden.'],
    ['Passkey aggiunta al profilo.', 'Passkey added to profile.', 'Clave de acceso añadida al perfil.', 'Clé d’accès ajoutée au profil.', 'Passkey zum Profil hinzugefügt.'],
    ['Non è stato possibile aggiungere la passkey.', 'Could not add the passkey.', 'No se ha podido añadir la clave de acceso.', 'Impossible d’ajouter la clé d’accès.', 'Passkey konnte nicht hinzugefügt werden.'],
    ['Questa passkey non appartiene a questo profilo.', 'This passkey does not belong to this profile.', 'Esta clave de acceso no pertenece a este perfil.', 'Cette clé d’accès n’appartient pas à ce profil.', 'Dieser Passkey gehört nicht zu diesem Profil.'],
    ['Verifica della passkey non riuscita. Riprova.', 'Passkey verification failed. Try again.', 'No se pudo verificar la clave de acceso. Inténtalo de nuevo.', 'Échec de la vérification de la clé d’accès. Réessayez.', 'Passkey-Prüfung fehlgeschlagen. Versuche es erneut.'],
    ['La passkey non è stata verificata. Riprova.', 'The passkey could not be verified. Try again.', 'No se pudo verificar la clave de acceso. Inténtalo de nuevo.', 'La clé d’accès n’a pas pu être vérifiée. Réessayez.', 'Der Passkey konnte nicht verifiziert werden. Versuche es erneut.'],
    ['La passkey non è stata verificata.', 'The passkey could not be verified.', 'No se pudo verificar la clave de acceso.', 'La clé d’accès n’a pas pu être vérifiée.', 'Der Passkey konnte nicht verifiziert werden.'],
    ['La passkey non è stata verificata. Riprova la registrazione.', 'The passkey could not be verified. Try registering again.', 'No se pudo verificar la clave de acceso. Intenta registrarla de nuevo.', 'La clé d’accès n’a pas pu être vérifiée. Réessayez de l’enregistrer.', 'Der Passkey konnte nicht verifiziert werden. Versuche die Registrierung erneut.'],
    ['Questa passkey è già collegata a un profilo.', 'This passkey is already linked to a profile.', 'Esta clave de acceso ya está vinculada a un perfil.', 'Cette clé d’accès est déjà associée à un profil.', 'Dieser Passkey ist bereits mit einem Profil verknüpft.'],
    ['Questo profilo non ha passkey registrate.', 'No passkeys are registered for this profile.', 'Este perfil no tiene claves de acceso registradas.', 'Aucune clé d’accès n’est enregistrée pour ce profil.', 'Für dieses Profil sind keine Passkeys registriert.'],
    ['Richiesta scaduta. Riprova.', 'Request expired. Try again.', 'La solicitud ha caducado. Inténtalo de nuevo.', 'La demande a expiré. Réessayez.', 'Die Anfrage ist abgelaufen. Versuche es erneut.'],
    ['Servizio non disponibile', 'Service unavailable', 'Servicio no disponible', 'Service indisponible', 'Dienst nicht verfügbar'],
    ['Accesso richiesto', 'Sign-in required', 'Se requiere iniciar sesión', 'Connexion requise', 'Anmeldung erforderlich'],
    ['Metodo non consentito', 'Method not allowed', 'Método no permitido', 'Méthode non autorisée', 'Methode nicht zulässig'],
    ['Metodo non consentito.', 'Method not allowed.', 'Método no permitido.', 'Méthode non autorisée.', 'Methode nicht zulässig.'],
    ['Scegli un nome utente di 3–32 caratteri: lettere, numeri, punto, trattino o underscore.', 'Choose a 3–32 character username using letters, numbers, periods, hyphens or underscores.', 'Elige un nombre de usuario de 3–32 caracteres con letras, números, puntos, guiones o guiones bajos.', 'Choisissez un nom d’utilisateur de 3 à 32 caractères : lettres, chiffres, points, tirets ou traits de soulignement.', 'Wähle einen Benutzernamen mit 3–32 Zeichen aus Buchstaben, Zahlen, Punkt, Bindestrich oder Unterstrich.'],
    ['La password deve contenere da 12 a 128 caratteri.', 'Your password must contain 12–128 characters.', 'La contraseña debe tener entre 12 y 128 caracteres.', 'Le mot de passe doit contenir de 12 à 128 caractères.', 'Dein Passwort muss 12 bis 128 Zeichen enthalten.'],
    ['Troppi tentativi. Riprova tra 15 minuti.', 'Too many attempts. Try again in 15 minutes.', 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.', 'Trop de tentatives. Réessayez dans 15 minutes.', 'Zu viele Versuche. Versuche es in 15 Minuten erneut.'],
    ['Questo nome utente è già in uso.', 'This username is already in use.', 'Este nombre de usuario ya está en uso.', 'Ce nom d’utilisateur est déjà utilisé.', 'Dieser Benutzername ist bereits vergeben.'],
    ['Nome utente o password non corretti.', 'Incorrect username or password.', 'Nombre de usuario o contraseña incorrectos.', 'Nom d’utilisateur ou mot de passe incorrect.', 'Benutzername oder Passwort ist falsch.'],
    ['Richiesta di registrazione scaduta. Riprova.', 'Registration request expired. Try again.', 'La solicitud de registro ha caducado. Inténtalo de nuevo.', 'La demande d’inscription a expiré. Réessayez.', 'Die Registrierungsanfrage ist abgelaufen. Versuche es erneut.'],
    ['Non è stato possibile creare il profilo. Il nome potrebbe essere già in uso.', 'Could not create the profile. The username may already be in use.', 'No se pudo crear el perfil. Es posible que el nombre de usuario ya esté en uso.', 'Impossible de créer le profil. Le nom d’utilisateur est peut-être déjà utilisé.', 'Das Profil konnte nicht erstellt werden. Der Benutzername ist möglicherweise bereits vergeben.'],
    ['Inserisci il nome utente del profilo.', 'Enter your profile username.', 'Introduce el nombre de usuario del perfil.', 'Saisissez le nom d’utilisateur du profil.', 'Gib den Benutzernamen deines Profils ein.'],
    ['Profilo o passkey non riconosciuto.', 'Profile or passkey not recognised.', 'No se reconoce el perfil o la clave de acceso.', 'Profil ou clé d’accès non reconnu.', 'Profil oder Passkey nicht erkannt.'],
    ['Accedi per aggiungere un passkey.', 'Sign in to add a passkey.', 'Inicia sesión para añadir una clave de acceso.', 'Connectez-vous pour ajouter une clé d’accès.', 'Melde dich an, um einen Passkey hinzuzufügen.'],
    ['Hai già raggiunto il limite di cinque passkey.', 'You have reached the five-passkey limit.', 'Ya has alcanzado el límite de cinco claves de acceso.', 'Vous avez atteint la limite de cinq clés d’accès.', 'Du hast das Limit von fünf Passkeys erreicht.'],
    ['Accedi per rinominare il profilo.', 'Sign in to rename your profile.', 'Inicia sesión para cambiar el nombre del perfil.', 'Connectez-vous pour renommer votre profil.', 'Melde dich an, um dein Profil umzubenennen.'],
    ['Il nome deve contenere 3–32 caratteri: lettere, numeri, punto, trattino o underscore.', 'The name must contain 3–32 characters: letters, numbers, periods, hyphens or underscores.', 'El nombre debe tener entre 3 y 32 caracteres: letras, números, puntos, guiones o guiones bajos.', 'Le nom doit contenir de 3 à 32 caractères : lettres, chiffres, points, tirets ou traits de soulignement.', 'Der Name muss 3–32 Zeichen enthalten: Buchstaben, Zahlen, Punkt, Bindestrich oder Unterstrich.'],
    ['Scegli un nome utente diverso da quello attuale.', 'Choose a different username from the current one.', 'Elige un nombre de usuario distinto del actual.', 'Choisissez un nom d’utilisateur différent de l’actuel.', 'Wähle einen anderen Benutzernamen als den aktuellen.'],
    ['Password non corretta.', 'Incorrect password.', 'Contraseña incorrecta.', 'Mot de passe incorrect.', 'Falsches Passwort.'],
    ['Accesso richiesto.', 'Sign-in required.', 'Se requiere iniciar sesión.', 'Connexion requise.', 'Anmeldung erforderlich.'],
    ['Non è stato possibile rinominare il profilo. Riprova.', 'Could not rename the profile. Try again.', 'No se pudo cambiar el nombre del perfil. Inténtalo de nuevo.', 'Impossible de renommer le profil. Réessayez.', 'Das Profil konnte nicht umbenannt werden. Versuche es erneut.'],
    ['Non è stato possibile eliminare il profilo. Riprova.', 'Could not delete the profile. Try again.', 'No se pudo eliminar el perfil. Inténtalo de nuevo.', 'Impossible de supprimer le profil. Réessayez.', 'Das Profil konnte nicht gelöscht werden. Versuche es erneut.'],
    ['Endpoint non trovato', 'Endpoint not found', 'No se encontró el endpoint', 'Point de terminaison introuvable', 'Endpunkt nicht gefunden'],
    ['Richiesta non valida.', 'Invalid request.', 'Solicitud no válida.', 'Requête invalide.', 'Ungültige Anfrage.'],
    ['Risposta non valida.', 'Invalid response.', 'Respuesta no válida.', 'Réponse invalide.', 'Ungültige Antwort.'],
    ['Troppi tentativi. Riprova più tardi.', 'Too many attempts. Try again later.', 'Demasiados intentos. Inténtalo de nuevo más tarde.', 'Trop de tentatives. Réessayez plus tard.', 'Zu viele Versuche. Versuche es später erneut.'],
    ['JSON non valido.', 'Invalid JSON.', 'JSON no válido.', 'JSON invalide.', 'Ungültiges JSON.'],
    ['Specifica da uno a dodici indirizzi di ritorno HTTPS validi.', 'Specify one to twelve valid HTTPS redirect URLs.', 'Indica entre una y doce URL de redirección HTTPS válidas.', 'Indiquez de une à douze URL de redirection HTTPS valides.', 'Gib ein bis zwölf gültige HTTPS-Weiterleitungsadressen an.'],
    ['Origine non consentita.', 'Origin not allowed.', 'Origen no permitido.', 'Origine non autorisée.', 'Ursprung nicht zulässig.'],
    ['Accedi di nuovo al tuo profilo.', 'Sign in to your profile again.', 'Vuelve a iniciar sesión en tu perfil.', 'Reconnectez-vous à votre profil.', 'Melde dich erneut bei deinem Profil an.'],
    ['Il profilo è stato modificato contemporaneamente. Riprova.', 'The profile changed at the same time. Try again.', 'El perfil se modificó al mismo tiempo. Inténtalo de nuevo.', 'Le profil a été modifié simultanément. Réessayez.', 'Das Profil wurde gleichzeitig geändert. Versuche es erneut.'],
    ['Il tuo atlante contiene già il massimo di 100 percorsi personali.', 'Your atlas already contains the maximum of 100 personal programmes.', 'Tu atlas ya contiene el máximo de 100 programas personales.', 'Votre atlas contient déjà le maximum de 100 formations personnelles.', 'Dein Atlas enthält bereits die Höchstzahl von 100 eigenen Studiengängen.'],
    ['Uno dei percorsi indicati non esiste nel tuo atlante.', 'One of the specified programmes is not in your atlas.', 'Uno de los programas indicados no está en tu atlas.', 'L’une des formations indiquées ne figure pas dans votre atlas.', 'Einer der angegebenen Studiengänge ist nicht in deinem Atlas.'],
    ['Il confronto contiene un percorso che non esiste nel tuo atlante.', 'The comparison includes a programme that is not in your atlas.', 'La comparación incluye un programa que no está en tu atlas.', 'La comparaison contient une formation absente de votre atlas.', 'Der Vergleich enthält einen Studiengang, der nicht in deinem Atlas ist.'],
    ['La shortlist contiene un percorso che non esiste nel tuo atlante.', 'The shortlist includes a programme that is not in your atlas.', 'La selección incluye un programa que no está en tu atlas.', 'La sélection contient une formation absente de votre atlas.', 'Die Auswahl enthält einen Studiengang, der nicht in deinem Atlas ist.'],
    ['Una candidatura indica un percorso che non esiste nel tuo atlante.', 'An application refers to a programme that is not in your atlas.', 'Una solicitud hace referencia a un programa que no está en tu atlas.', 'Une candidature concerne une formation absente de votre atlas.', 'Eine Bewerbung bezieht sich auf einen Studiengang, der nicht in deinem Atlas ist.'],
    ['Il percorso non esiste nel catalogo o nel tuo atlante.', 'The programme is not in the catalogue or your atlas.', 'El programa no está en el catálogo ni en tu atlas.', 'La formation ne figure ni dans le catalogue ni dans votre atlas.', 'Der Studiengang ist weder im Katalog noch in deinem Atlas.'],
    ['Questo ateneo è già presente nel tuo atlante.', 'This university is already in your atlas.', 'Esta universidad ya está en tu atlas.', 'Cette université figure déjà dans votre atlas.', 'Diese Universität ist bereits in deinem Atlas.'],
    ['Il tuo atlante contiene già il massimo di 100 atenei personali.', 'Your atlas already contains the maximum of 100 personal universities.', 'Tu atlas ya contiene el máximo de 100 universidades personales.', 'Votre atlas contient déjà le maximum de 100 universités personnelles.', 'Dein Atlas enthält bereits die Höchstzahl von 100 eigenen Universitäten.'],
    ['L’ateneo personale non è stato trovato.', 'The personal university was not found.', 'No se encontró la universidad personal.', 'L’université personnelle est introuvable.', 'Die eigene Universität wurde nicht gefunden.'],
    ['Il percorso non esiste nel tuo atlante.', 'The programme is not in your atlas.', 'El programa no está en tu atlas.', 'La formation ne figure pas dans votre atlas.', 'Der Studiengang ist nicht in deinem Atlas.'],
    ['Il percorso personale non è stato trovato.', 'The personal programme was not found.', 'No se encontró el programa personal.', 'La formation personnelle est introuvable.', 'Der eigene Studiengang wurde nicht gefunden.'],
    ['Usa POST per le richieste MCP.', 'Use POST for MCP requests.', 'Usa POST para las solicitudes MCP.', 'Utilisez POST pour les requêtes MCP.', 'Verwende POST für MCP-Anfragen.'],
    ['Richiesta troppo grande.', 'Request is too large.', 'La solicitud es demasiado grande.', 'La requête est trop volumineuse.', 'Die Anfrage ist zu groß.'],
    ['JSON-RPC non valido.', 'Invalid JSON-RPC.', 'JSON-RPC no válido.', 'JSON-RPC invalide.', 'Ungültiges JSON-RPC.'],
    ['Richiesta JSON-RPC non valida.', 'Invalid JSON-RPC request.', 'Solicitud JSON-RPC no válida.', 'Requête JSON-RPC invalide.', 'Ungültige JSON-RPC-Anfrage.'],
    ['Accesso OAuth richiesto.', 'OAuth sign-in required.', 'Se requiere acceso mediante OAuth.', 'Connexion OAuth requise.', 'OAuth-Anmeldung erforderlich.'],
    ['Permesso atlas:read mancante.', 'Missing atlas:read permission.', 'Falta el permiso atlas:read.', 'Autorisation atlas:read manquante.', 'Berechtigung atlas:read fehlt.'],
    ['Database non disponibile.', 'Database unavailable.', 'Base de datos no disponible.', 'Base de données indisponible.', 'Datenbank nicht verfügbar.'],
    ['Origine del sito non valida.', 'Invalid site origin.', 'El origen del sitio no es válido.', 'Origine du site invalide.', 'Ungültiger Website-Ursprung.'],
    ['Accedi al tuo profilo per generare un codice.', 'Sign in to your profile to generate a code.', 'Inicia sesión en tu perfil para generar un código.', 'Connectez-vous à votre profil pour générer un code.', 'Melde dich bei deinem Profil an, um einen Code zu erstellen.'],
    ['Hai richiesto troppi codici. Riprova più tardi.', 'You have requested too many codes. Try again later.', 'Has solicitado demasiados códigos. Inténtalo de nuevo más tarde.', 'Vous avez demandé trop de codes. Réessayez plus tard.', 'Du hast zu viele Codes angefordert. Versuche es später erneut.'],
    ['Collegamento non valido.', 'Invalid connection.', 'Conexión no válida.', 'Connexion invalide.', 'Ungültige Verbindung.'],
    ['Accesso ChatGPT richiesto', 'ChatGPT sign-in required', 'Se requiere iniciar sesión en ChatGPT', 'Connexion ChatGPT requise', 'ChatGPT-Anmeldung erforderlich'],
    ['Database non disponibile', 'Database unavailable', 'Base de datos no disponible', 'Base de données indisponible', 'Datenbank nicht verfügbar'],
    ['Origine non consentita', 'Origin not allowed', 'Origen no permitido', 'Origine non autorisée', 'Ursprung nicht zulässig'],
    ['Backup non trovato', 'Backup not found', 'No se encontró la copia de seguridad', 'Sauvegarde introuvable', 'Backup nicht gefunden'],
    ['Non trovato', 'Not found', 'No encontrado', 'Introuvable', 'Nicht gefunden'],
    ['Dati troppo grandi', 'Data is too large', 'Los datos son demasiado grandes', 'Les données sont trop volumineuses', 'Die Daten sind zu groß'],
    ['JSON non valido', 'Invalid JSON', 'JSON no válido', 'JSON invalide', 'Ungültiges JSON'],
    ['Formato non valido', 'Invalid format', 'Formato no válido', 'Format invalide', 'Ungültiges Format'],
    ['Salvataggio remoto temporaneamente indisponibile', 'Remote saving is temporarily unavailable', 'El guardado remoto no está disponible temporalmente', 'L’enregistrement à distance est temporairement indisponible', 'Das Speichern auf dem Server ist vorübergehend nicht verfügbar'],
    ['Server non raggiungibile. Riprova tra poco.', 'Server unavailable. Try again shortly.', 'Servidor no disponible. Vuelve a intentarlo en breve.', 'Serveur inaccessible. Réessayez dans quelques instants.', 'Server nicht erreichbar. Versuche es gleich noch einmal.'],
    ['Backup importato · copia di recupero disponibile', 'Backup imported · recovery copy available', 'Copia importada · copia de recuperación disponible', 'Sauvegarde importée · copie de récupération disponible', 'Backup importiert · Wiederherstellungskopie verfügbar'],
    ['Copia cloud non disponibile', 'Cloud copy unavailable', 'Copia en la nube no disponible', 'Copie cloud indisponible', 'Cloud-Kopie nicht verfügbar'],
    ['Backup esportato', 'Backup exported', 'Copia exportada', 'Sauvegarde exportée', 'Backup exportiert'],
    ['Puoi confrontare fino a quattro percorsi. Rimuovine uno per continuare.', 'You can compare up to four programmes. Remove one to continue.', 'Puedes comparar hasta cuatro programas. Quita uno para continuar.', 'Vous pouvez comparer jusqu’à quatre formations. Retirez-en une pour continuer.', 'Du kannst bis zu vier Studiengänge vergleichen. Entferne einen, um fortzufahren.'],
    ['Il tuo piano è stato salvato ✓', 'Your plan has been saved ✓', 'Tu plan se ha guardado ✓', 'Votre plan a été enregistré ✓', 'Dein Plan wurde gespeichert ✓'],
    ['Backup non valido. Seleziona un JSON esportato da Master Atlas.', 'Invalid backup. Select a JSON file exported from Master Atlas.', 'Copia no válida. Selecciona un JSON exportado desde Master Atlas.', 'Sauvegarde invalide. Sélectionnez un fichier JSON exporté depuis Master Atlas.', 'Ungültiges Backup. Wähle eine aus Master Atlas exportierte JSON-Datei.'],
    ['Le copie di recupero restano su questo browser. Esporta un backup per conservarle anche altrove.', 'Recovery copies stay in this browser. Export a backup to keep them elsewhere.', 'Las copias de recuperación permanecen en este navegador. Exporta una copia para guardarlas en otro lugar.', 'Les copies de récupération restent dans ce navigateur. Exportez une sauvegarde pour les conserver ailleurs.', 'Wiederherstellungskopien bleiben in diesem Browser. Exportiere ein Backup, um sie anderswo aufzubewahren.'],
    ['Copie cloud non disponibili: verifica accesso o connessione.', 'Cloud copies unavailable: check your sign-in or connection.', 'Copias en la nube no disponibles: comprueba el acceso o la conexión.', 'Copies cloud indisponibles : vérifiez votre connexion ou votre accès.', 'Cloud-Kopien nicht verfügbar: Prüfe Anmeldung oder Verbindung.'],
    ['Archivio locale non leggibile: usa un backup per recuperare i progressi.', 'Local storage cannot be read. Use a backup to recover your progress.', 'No se puede leer el almacenamiento local. Usa una copia para recuperar tu progreso.', 'Le stockage local est illisible. Utilisez une sauvegarde pour récupérer vos données.', 'Der lokale Speicher ist nicht lesbar. Stelle deine Fortschritte aus einem Backup wieder her.'],
    ['Copia locale non disponibile: esporta un backup per conservare i progressi.', 'Local copy unavailable. Export a backup to keep your progress.', 'Copia local no disponible. Exporta una copia para conservar tu progreso.', 'Copie locale indisponible. Exportez une sauvegarde pour conserver vos données.', 'Lokale Kopie nicht verfügbar. Exportiere ein Backup, um deine Fortschritte zu behalten.'],
    ['Salvato su questo browser · backup disponibile', 'Saved in this browser · backup available', 'Guardado en este navegador · copia disponible', 'Enregistré dans ce navigateur · sauvegarde disponible', 'In diesem Browser gespeichert · Backup verfügbar'],
    ['Esporta un backup: salvataggio locale non disponibile', 'Export a backup: local saving unavailable', 'Exporta una copia: no se puede guardar localmente', 'Exportez une sauvegarde : enregistrement local indisponible', 'Backup exportieren: lokale Speicherung nicht verfügbar'],
    ['Salvato nel browser · sincronizzazione…', 'Saved in browser · syncing…', 'Guardado en el navegador · sincronizando…', 'Enregistré dans le navigateur · synchronisation…', 'Im Browser gespeichert · Synchronisierung…'],
    ['Sincronizzazione in corso…', 'Syncing…', 'Sincronizando…', 'Synchronisation…', 'Wird synchronisiert…'],
    ['Dati personali su questo browser', 'Personal data on this browser', 'Datos personales en este navegador', 'Données personnelles sur ce navigateur', 'Persönliche Daten in diesem Browser'],
    ['Sessione terminata · riaccedi per sincronizzare.', 'Session ended · sign in again to sync.', 'Sesión finalizada · vuelve a iniciar sesión para sincronizar.', 'Session terminée · reconnectez-vous pour synchroniser.', 'Sitzung beendet · melde dich erneut an, um zu synchronisieren.'],
    ['Offline · progressi conservati nel browser', 'Offline · progress saved in browser', 'Sin conexión · progreso guardado en el navegador', 'Hors ligne · progression conservée dans le navigateur', 'Offline · Fortschritt im Browser gespeichert'],
    ['Cloud non disponibile · progressi conservati nel browser', 'Cloud unavailable · progress saved in browser', 'Nube no disponible · progreso guardado en el navegador', 'Cloud indisponible · progression conservée dans le navigateur', 'Cloud nicht verfügbar · Fortschritt im Browser gespeichert'],
    ['Sincronizzato · copia locale disponibile', 'Synced · local copy available', 'Sincronizado · copia local disponible', 'Synchronisé · copie locale disponible', 'Synchronisiert · lokale Kopie verfügbar'],
    ['Modifiche concorrenti · nuovo tentativo automatico', 'Concurrent changes · retrying automatically', 'Cambios simultáneos · nuevo intento automático', 'Modifications simultanées · nouvelle tentative automatique', 'Gleichzeitige Änderungen · automatischer neuer Versuch'],
    ['Da Safari, aggiungi Master Atlas alla schermata Home e aprilo come app.', 'In Safari, add Master Atlas to your Home Screen and open it as an app.', 'En Safari, añade Master Atlas a la pantalla de inicio y ábrelo como una app.', 'Dans Safari, ajoutez Master Atlas à l’écran d’accueil et ouvrez-le comme une app.', 'Füge Master Atlas in Safari zum Startbildschirm hinzu und öffne es als App.'],
    ['Dal menu del browser scegli “Installa app” o “Aggiungi a schermata Home”.', 'From the browser menu, choose “Install app” or “Add to Home Screen”.', 'En el menú del navegador, elige «Instalar app» o «Añadir a pantalla de inicio».', 'Dans le menu du navigateur, choisissez « Installer l’app » ou « Ajouter à l’écran d’accueil ».', 'Wähle im Browsermenü „App installieren“ oder „Zum Startbildschirm hinzufügen“.'],
    ['Apri questo sito in Safari e tocca Condividi.', 'Open this site in Safari and tap Share.', 'Abre este sitio en Safari y toca Compartir.', 'Ouvrez ce site dans Safari et touchez Partager.', 'Öffne diese Website in Safari und tippe auf „Teilen“.'],
    ['Scegli “Aggiungi alla schermata Home”.', 'Choose “Add to Home Screen”.', 'Elige «Añadir a pantalla de inicio».', 'Choisissez « Ajouter à l’écran d’accueil ».', 'Wähle „Zum Startbildschirm hinzufügen“.'],
    ['Attiva “Apri come app web”, poi tocca Aggiungi.', 'Turn on “Open as Web App”, then tap Add.', 'Activa «Abrir como app web» y toca Añadir.', 'Activez « Ouvrir comme app web », puis touchez Ajouter.', 'Aktiviere „Als Web-App öffnen“ und tippe auf „Hinzufügen“.'],
    ['Apri il menu ⋮ del browser.', 'Open the browser menu ⋮.', 'Abre el menú ⋮ del navegador.', 'Ouvrez le menu ⋮ du navigateur.', 'Öffne das Browsermenü ⋮.'],
    ['Tocca “Installa app” o “Aggiungi a schermata Home”.', 'Tap “Install app” or “Add to Home Screen”.', 'Toca «Instalar app» o «Añadir a pantalla de inicio».', 'Touchez « Installer l’app » ou « Ajouter à l’écran d’accueil ».', 'Tippe auf „App installieren“ oder „Zum Startbildschirm hinzufügen“.'],
    ['Conferma l’installazione.', 'Confirm installation.', 'Confirma la instalación.', 'Confirmez l’installation.', 'Bestätige die Installation.'],
  ];
  const supported = Object.keys(languages);
  const dictionaries = Object.fromEntries(supported.map((locale, column) => [
    locale,
    Object.fromEntries(rows.map(row => [row[0], row[column] || row[0]])),
  ]));
  const sourceByTranslation = new Map();
  for (const row of rows) for (const translated of row.slice(1)) {
    if (translated && translated !== row[0] && !sourceByTranslation.has(translated)) sourceByTranslation.set(translated, row[0]);
  }
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const textOutputs = new WeakMap();
  const attributeOutputs = new WeakMap();
  let locale = 'it';
  try {
    const saved = localStorage.getItem('atlas-language');
    if (supported.includes(saved)) locale = saved;
  } catch {}

  function translate(value, language = locale) {
    const original = String(value).trim();
    const key = sourceByTranslation.get(original) || original;
    if (!key) return String(value);
    const dictionary = dictionaries[language] || dictionaries.it;
    let result = dictionary[key] || key;
    let match = key.match(/^(\d+) percorsi da confrontare$/);
    if (match) {
      const count = match[1];
      result = ({
        en: `${count} programmes to compare`, es: `${count} programas por comparar`,
        fr: `${count} formations à comparer`, de: `${count} Studiengänge vergleichen`,
      })[language] || key;
    }
    match = key.match(/^(\d+) DI (\d+) SELEZIONATE$/);
    if (match) result = ({
      en: `${match[1]} OF ${match[2]} SELECTED`, es: `${match[1]} DE ${match[2]} SELECCIONADAS`,
      fr: `${match[1]} SUR ${match[2]} SÉLECTIONNÉES`, de: `${match[1]} VON ${match[2]} AUSGEWÄHLT`,
    })[language] || key;
    match = key.match(/^(\d+) atenei nella tua selezione$/);
    if (match) result = ({
      en: `${match[1]} universities in your shortlist`, es: `${match[1]} universidades en tu selección`,
      fr: `${match[1]} universités dans votre sélection`, de: `${match[1]} Universitäten in deiner Auswahl`,
    })[language] || key;
    match = key.match(/^(\d+) percorsi Europa e (\d+) extra-Europa$/);
    if (match) result = ({
      en: `${match[1]} European programmes and ${match[2]} outside Europe`,
      es: `${match[1]} programas en Europa y ${match[2]} fuera de Europa`,
      fr: `${match[1]} formations en Europe et ${match[2]} hors Europe`,
      de: `${match[1]} Studiengänge in Europa und ${match[2]} außerhalb Europas`,
    })[language] || key;
    match = key.match(/^Esplora tutti i (\d+) atenei$/);
    if (match) result = ({
      en: `Explore all ${match[1]} universities`, es: `Explorar las ${match[1]} universidades`,
      fr: `Explorer les ${match[1]} universités`, de: `Alle ${match[1]} Universitäten entdecken`,
    })[language] || key;
    match = key.match(/^(\d+) risultati nel catalogo principale$/);
    if (match) result = ({
      en: `${match[1]} results in the main catalogue`, es: `${match[1]} resultados en el catálogo principal`,
      fr: `${match[1]} résultats dans le catalogue principal`, de: `${match[1]} Ergebnisse im Hauptkatalog`,
    })[language] || key;
    match = key.match(/^(\d+) risultati nel catalogo principale · mostrati i primi 60$/);
    if (match) result = ({
      en: `${match[1]} results in the main catalogue · showing the first 60`,
      es: `${match[1]} resultados en el catálogo principal · se muestran los primeros 60`,
      fr: `${match[1]} résultats dans le catalogue principal · les 60 premiers sont affichés`,
      de: `${match[1]} Ergebnisse im Hauptkatalog · die ersten 60 werden angezeigt`,
    })[language] || key;
    match = key.match(/^(\d+) percorsi disponibili · mostra i primi 60 · cerca per nome, ateneo o città$/);
    if (match) result = ({
      en: `${match[1]} programmes available · showing the first 60 · search by name, university or city`,
      es: `${match[1]} programas disponibles · se muestran los primeros 60 · busca por nombre, universidad o ciudad`,
      fr: `${match[1]} formations disponibles · les 60 premières sont affichées · recherchez par nom, université ou ville`,
      de: `${match[1]} Studiengänge verfügbar · die ersten 60 werden angezeigt · suche nach Name, Universität oder Stadt`,
    })[language] || key;
    match = key.match(/^(\d+) università disponibili · cerca per nome, area o percorso$/);
    if (match) result = ({
      en: `${match[1]} universities available · search by name, region or programme`,
      es: `${match[1]} universidades disponibles · busca por nombre, zona o programa`,
      fr: `${match[1]} universités disponibles · recherchez par nom, région ou formation`,
      de: `${match[1]} Universitäten verfügbar · suche nach Name, Region oder Studiengang`,
    })[language] || key;
    match = key.match(/^Rimuovere “(.+)” dal tuo catalogo personale\? Saranno rimosse anche shortlist, confronto e candidatura associate\.$/);
    if (match) result = ({
      en: `Remove “${match[1]}” from your personal catalogue? Its shortlist, comparison and application will also be removed.`,
      es: `¿Quitar “${match[1]}” de tu catálogo personal? También se eliminarán su selección, comparación y solicitud.`,
      fr: `Retirer « ${match[1]} » de votre catalogue personnel ? Sa sélection, sa comparaison et sa candidature seront également supprimées.`,
      de: `„${match[1]}“ aus deinem persönlichen Katalog entfernen? Auswahl, Vergleich und Bewerbung werden ebenfalls entfernt.`,
    })[language] || key;
    match = key.match(/^Rimuovere “(.+)” dalle tue università\? I percorsi associati restano nel tuo catalogo\.$/);
    if (match) result = ({
      en: `Remove “${match[1]}” from your universities? Its programmes will remain in your catalogue.`,
      es: `¿Quitar “${match[1]}” de tus universidades? Sus programas seguirán en tu catálogo.`,
      fr: `Retirer « ${match[1]} » de vos universités ? Ses formations resteront dans votre catalogue.`,
      de: `„${match[1]}“ aus deinen Universitäten entfernen? Die zugehörigen Studiengänge bleiben in deinem Katalog.`,
    })[language] || key;
    match = key.match(/^Rimuovi (.+) dal tuo catalogo$/);
    if (match) result = ({
      en: `Remove ${match[1]} from your catalogue`, es: `Quitar ${match[1]} de tu catálogo`,
      fr: `Retirer ${match[1]} de votre catalogue`, de: `${match[1]} aus deinem Katalog entfernen`,
    })[language] || key;
    match = key.match(/^Revocare l’accesso di (.+) a questo profilo\?$/);
    if (match) result = ({
      en: `Revoke ${match[1]}’s access to this profile?`,
      es: `¿Revocar el acceso de ${match[1]} a este perfil?`,
      fr: `Révoquer l’accès de ${match[1]} à ce profil ?`,
      de: `${match[1]} den Zugriff auf dieses Profil entziehen?`,
    })[language] || key;
    match = key.match(/^Atlante aggiornato · (\d+) nuovi percorsi personali$/);
    if (match) result = ({
      en: `Atlas updated · ${match[1]} new personal programmes`,
      es: `Atlas actualizado · ${match[1]} nuevos programas personales`,
      fr: `Atlas mis à jour · ${match[1]} nouvelles formations personnelles`,
      de: `Atlas aktualisiert · ${match[1]} neue eigene Studiengänge`,
    })[language] || key;
    match = key.match(/^([＋+↓↑↺▦☷])\s*(.+)$/);
    if (match) result = `${match[1]} ${translate(match[2], language)}`;
    match = key.match(/^(.+?)\s*↗$/);
    if (match) result = `${translate(match[1], language)} ↗`;
    match = key.match(/^(.+?)\s*·\s*(\d+)$/);
    if (match) result = `${translate(match[1], language)} · ${match[2]}`;
    match = key.match(/^(\d+) percorsi · (Le posizioni sono separate per area geografica)$/);
    if (match) result = `${match[1]} ${translate('percorsi', language)} · ${translate(match[2], language)}`;
    match = key.match(/^(\d+) (percorsi nel tuo catalogo personale: aggiungi voci dal dossier o crea percorsi tuoi\.|università nel tuo catalogo personale; aggiungi atenei dal dossier o crea i tuoi\.)$/);
    if (match) result = (dictionary[`0 ${match[2]}`] || key).replace(/^0/, match[1]);
    match = key.match(/^(Stato della candidatura) (.+)$/);
    if (match) {
      const prefix = dictionaries[language]['Stato della candidatura'] || match[1];
      result = `${prefix}: ${match[2]}`;
    }
    match = key.match(/^(Aggiungi ai|Rimuovi dai) preferiti: (.+)$/);
    if (match) {
      const verb = match[1] === 'Aggiungi ai'
        ? ({ en: 'Add to', es: 'Añadir a', fr: 'Ajouter aux', de: 'Zu' })[language]
        : ({ en: 'Remove from', es: 'Quitar de', fr: 'Retirer des', de: 'Aus' })[language];
      const noun = ({ en: 'favourites', es: 'favoritos', fr: 'favoris', de: 'Favoriten' })[language];
      if (verb && noun) result = `${verb} ${noun}: ${match[2]}`;
    }
    if (String(value) === original) return result;
    const leading = String(value).match(/^\s*/)?.[0] || '';
    const trailing = String(value).match(/\s*$/)?.[0] || '';
    return `${leading}${result}${trailing}`;
  }

  function excludedText(node) {
    return !!node.parentElement?.closest('script,style,textarea,[contenteditable="true"],[data-i18n-skip],.source-text,.archive-item,.card-title,.card-university,.card-city,.table-title');
  }

  function translateTextNode(node) {
    if (excludedText(node)) return;
    const current = node.nodeValue;
    const previousOutput = textOutputs.get(node);
    const source = previousOutput !== undefined && current === previousOutput ? textSources.get(node) : current;
    textSources.set(node, source);
    const output = translate(source);
    textOutputs.set(node, output);
    if (current !== output) node.nodeValue = output;
  }

  function translateAttribute(element, name) {
    const current = element.getAttribute(name);
    if (current === null) return;
    let sources = attributeSources.get(element);
    let outputs = attributeOutputs.get(element);
    if (!sources) attributeSources.set(element, sources = new Map());
    if (!outputs) attributeOutputs.set(element, outputs = new Map());
    const previousOutput = outputs.get(name);
    const source = previousOutput !== undefined && current === previousOutput ? sources.get(name) : current;
    sources.set(name, source);
    const output = translate(source);
    outputs.set(name, output);
    if (current !== output) element.setAttribute(name, output);
  }

  function translateTree(root) {
    if (!root || typeof document === 'undefined') return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) translateTextNode(node);
    const elements = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
    for (const element of elements) {
      for (const name of ['title', 'aria-label', 'aria-description', 'placeholder', 'alt']) translateAttribute(element, name);
    }
  }

  function setLocale(next) {
    if (!supported.includes(next)) return false;
    locale = next;
    try { localStorage.setItem('atlas-language', locale); } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languages[locale].tag;
      const select = document.querySelector('#language-select');
      if (select) select.value = locale;
      translateTree(document.body);
    }
    return true;
  }

  globalThis.AtlasI18n = Object.freeze({
    languages,
    translate,
    setLocale,
    get locale() { return locale; },
    get localeTag() { return languages[locale].tag; },
  });

  if (typeof document !== 'undefined' && document.body) {
    document.documentElement.lang = languages[locale].tag;
    const select = document.querySelector('#language-select');
    if (select) {
      select.value = locale;
      select.addEventListener('change', () => setLocale(select.value));
    }
    translateTree(document.body);
    const observer = new MutationObserver(changes => {
      for (const change of changes) {
        if (change.type === 'characterData') translateTextNode(change.target);
        else if (change.type === 'attributes') translateAttribute(change.target, change.attributeName);
        else for (const node of change.addedNodes) if (node.nodeType === 1) translateTree(node); else if (node.nodeType === 3) translateTextNode(node);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['title', 'aria-label', 'aria-description', 'placeholder', 'alt'] });
  }
})();
