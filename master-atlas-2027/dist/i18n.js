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
    ['Scrivi ELIMINA per confermare.', 'Type DELETE to confirm.', 'Escribe ELIMINAR para confirmar.', 'Saisissez SUPPRIMER pour confirmer.', 'Gib LÖSCHEN zur Bestätigung ein.'],
    ['Eliminazione in corso…', 'Deleting…', 'Eliminando…', 'Suppression…', 'Wird gelöscht…'],
    ['Eliminare definitivamente il profilo e tutti i dati sincronizzati? Questa azione non si può annullare.', 'Permanently delete the profile and all synced data? This cannot be undone.', '¿Eliminar definitivamente el perfil y todos los datos sincronizados? Esta acción no se puede deshacer.', 'Supprimer définitivement le profil et toutes les données synchronisées ? Cette action est irréversible.', 'Profil und alle synchronisierten Daten endgültig löschen? Dies kann nicht rückgängig gemacht werden.'],
    ['Passkey aggiunta al profilo.', 'Passkey added to profile.', 'Clave de acceso añadida al perfil.', 'Clé d’accès ajoutée au profil.', 'Passkey zum Profil hinzugefügt.'],
    ['Non è stato possibile aggiungere la passkey.', 'Could not add the passkey.', 'No se ha podido añadir la clave de acceso.', 'Impossible d’ajouter la clé d’accès.', 'Passkey konnte nicht hinzugefügt werden.'],
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
    const key = String(value).trim();
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
    if (String(value) === key) return result;
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
