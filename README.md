# chat-gpt

# Anatomia — Les Terres oubliées

Aventure de révision anatomique en français, sur ordinateur et mobile. Version 0.3 : première forêt en 3D stylisée, compagnon animé qui suit le héros, indices progressifs et pouvoir de reformulation.

## Lancer et vérifier

Depuis `/workspace/chat-gpt`, lancer `npm start` (serveur HTTP Python, port 5173). Le site utilise les fichiers Three.js inclus dans `vendor/`, sans CDN. `npm ci --ignore-scripts` installe les versions verrouillées nécessaires pour reconstruire l’export autonome ; il n’est pas requis pour servir le site déjà préparé. `npm test` vérifie le moteur, les combats, les parcours et les sauvegardes.

`python3 scripts/build_site.py` prépare `dist/`, puis `python3 tests/smoke.py` démarre un serveur de test temporaire et vérifie le site préparé dans Chromium : ordinateur, mobile, déplacement, lecture, entrée automatique dans un château, attaque et riposte, victoire, sauvegarde et migration d'une ancienne partie. Chromium et Python Playwright doivent être disponibles. Le test active un rendu WebGL logiciel, vérifie le véritable canvas 3D, le suivi du compagnon, le joystick, les réponses aidées, les trois espèces et le repli sans WebGL. Les requêtes externes sont bloquées.

`python3 tests/standalone.py` construit et teste l'export autonome. Les captures de tests sont conservées dans `test-results/` (ignoré par Git).

## Explorer et apprendre

Le terrain de 2048 × 1440 unités de sauvegarde est représenté en 3D, avec une caméra orthographique qui suit le héros. Déplacements : flèches ou ZQSD/WASD, joystick sur téléphone, ou clic/toucher sur le sol. Le clic 3D est projeté sur le sol par un rayon ; le déplacement et les collisions conservent le même référentiel que les anciennes sauvegardes. Si WebGL est indisponible, la forêt et le compagnon restent utilisables en 2D. Les trajets automatiques contournent les lacs. La carte des lieux permet aussi de choisir une destination sans téléporter le personnage.

Douze stèles et carnets présentent des extraits déclaratifs du cours, trois ou quatre notions à la fois. Approcher un lieu puis appuyer sur E ou « Observer », ou cliquer sur le lieu pour y marcher. L'apprentissage ne prend plus la forme de la future question affichée juste avant le combat. Après chaque lecture, les notions concernées sont exclues des rencontres pendant huit cases supplémentaires (256 pixels de marche). Les notions révisables déjà échues sont prioritaires ; les nouvelles questions sont formulées avec plusieurs variantes et leurs choix sont mélangés.

Cinq châteaux déclenchent automatiquement leur rencontre lorsque le héros passe leur entrée. Trois créatures sont aussi présentes dans la forêt, avec un délai de deux minutes avant une nouvelle rencontre. Après un combat, le héros réapparaît à distance de l'entrée pour ne pas redéclencher le même combat en boucle.

Lire ne fait pas artificiellement monter un niveau de maîtrise : seuls les rappels testés font progresser une notion. Chaque notion garde son historique : apprentissage, renforcement après dix minutes, difficile après un jour, examen après trois jours, puis rappel après sept jours. Une erreur fait redescendre d'une étape et rapproche le rappel. Répondre avant l'échéance ne fait pas monter la maîtrise. Une victoire ne valide pas automatiquement un examen.

## Combats

Le joueur choisit une frappe rapide, une attaque puissante (2 points de concentration) ou une garde. Il répond ensuite à une question. Une bonne réponse déclenche son attaque ; une erreur la fait manquer. Les frappes rapides et défensives réussies restaurent un point de concentration, dans la limite de trois.

Si le monstre survit, son tour démarre automatiquement : il attaque après une réponse juste comme après une erreur. La garde réduit la riposte de 65 %. La classe et l'équipement modifient dégâts et protection. Les animations et le journal distinguent les deux tours. La correction reste lisible après la riposte ; le joueur choisit quand commencer le tour suivant. Un monstre vaincu ne peut pas attaquer.

La victoire exige de réduire les PV du monstre à zéro, avec un héros encore debout. Fin maximale d'une rencontre normale après huit tours, d'un boss après douze tours. En apprentissage, le compagnon empêche le dernier coup de faire tomber le héros sous un PV. Dans les niveaux suivants, une défaite est possible. Les réponses sont sauvegardées dès leur validation ; les récompenses ne sont attribuées qu'au bilan, une seule fois.

Après une défaite ou une rencontre inachevée, le joueur peut réessayer, revoir ses erreurs ou explorer ailleurs. Le réglage « Adaptative » ajuste les dégâts selon les réponses sans aide ; « Détente » et « Défi » permettent un choix manuel. Ces réglages ne valident pas de maîtrise pédagogique.

Trois classes interchangeables hors combat et trois compagnons au choix. Deux bonus d'équipement se débloquent avec les victoires. L'or reste conservé pour une future boutique.

## Le compagnon

Loup spectral, corbeau et dragon possèdent chacun leur modèle 3D, leurs animations et leur portrait. Le compagnon suit la trace du héros. Il reste visible en combat ; après chaque riposte, si le héros est encore debout, il lui rend automatiquement jusqu’à 3 PV. Il explique aussi les erreurs à partir de la phrase sourcée du cours, sans inventer de diagnostic anatomique.

Pendant une question hors examen, le joueur peut demander jusqu’à deux indices, du plus général au plus précis. Éclaircissement reformule la question sans donner la réponse ; il peut être utilisé tous les trois tours. Les aides n’affichent pas la réponse complète et sont bloquées au niveau examen. Les réponses écrites en cours de saisie sont conservées lorsqu’une aide est demandée.

Toute réponse aidée est enregistrée séparément comme entraînement : elle ne modifie ni le niveau, ni l’échéance, ni les compteurs de réussite sans aide de la notion. Elle rapporte 5 XP au lieu de 10 en cas de réussite, et permet néanmoins d’attaquer. Une réussite ultérieure sans aide est nécessaire pour progresser. Les anciennes sauvegardes sont compatibles avec ces champs supplémentaires.

## Rendu et bibliothèques

Three.js 0.180.0 est installé depuis le registre npm avec le verrou d’intégrité de `package-lock.json`. Les deux modules navigateur nécessaires et leur licence MIT sont conservés dans `vendor/` pour servir le jeu sans dépendance à un CDN. Les modèles et le décor sont construits localement en géométrie ; aucun modèle externe ni service 3D n’est appelé. L’export autonome est assemblé avec esbuild 0.25.10, puis contient lui aussi le moteur 3D intégré.

Le monde 3D est une première zone de la cheville. Les écrans de combat restent en 2D animée avec le portrait du compagnon. Les quêtes narratives, le développement du village et les autres chapitres ne sont pas encore implémentés.

## Source et limites pédagogiques

36 notions textuelles de l'articulation talo-crurale, d'après le PDF fourni « 1A - UE 1.7 - HB - arthrologie cheville pied », pages 3 à 14. Le document et ses planches restent consultables ; chaque correction cite sa page. Les décors de fantasy ne sont pas des références anatomiques.

Les repères des figures ne sont pas encore tous évalués. La partie pied et les huit autres documents restent à intégrer. Les réponses écrites sont comparées à des formulations et groupes de termes enregistrés, sans IA distante : accents, casse et tirets sont tolérés, mais certaines reformulations peuvent ne pas être reconnues. Toujours consulter la correction et sa source en cas de doute.

## Sauvegarde et Google

Le format de sauvegarde `anatomia.v1` est conservé. Les anciennes parties gardent héros, or, équipement et maîtrise des notions ; elles reçoivent simplement une position de départ dans la forêt. Les nouvelles parties enregistrent aussi position, distance parcourue et lectures. Export/import JSON dans le grimoire.

Google et la synchronisation restent préparés mais **non activés** : `firebase-config.js` contient `null`. Pour les activer : créer une application Web Firebase, activer Authentication > Google avec le domaine du site autorisé, créer Firestore et publier `firestore.rules`, puis saisir uniquement la configuration Web publique dans `firebase-config.js`. Ne jamais mettre une clé privée de compte de service ou un secret OAuth dans le navigateur.

Tester ensuite un vrai compte sur deux appareils : progression, reconnexion et séparation entre comptes. La fusion conserve les récompenses uniques, les révisions les plus récentes et les découvertes du monde. Éviter deux séances simultanées sur la même notion : les événements de révision ne sont pas encore fusionnés individuellement.

## Publication et export

La publication publique de la démo, PDF inclus, a été autorisée par l'utilisateur. Le workflow `.github/workflows/pages.yml` déploie `dist/` à chaque mise à jour de `main` et peut aussi être lancé manuellement. GitHub Pages doit utiliser la source « GitHub Actions ». Voir `PUBLICATION.md`. La préparation ou l'envoi Git ne prouvent pas que le site public est déjà à jour : vérifier le déploiement et la page servie.

`npm run export` produit `/workspace/anatomia.html`, un fichier autonome sans requête réseau au démarrage, sans connexion Google, avec cours et illustrations intégrés. Un écran de diagnostic reste visible si le navigateur n'exécute pas le jeu ; les erreurs sont affichées et une récupération conserve une copie de secours de la sauvegarde. Les API PDF et UUID ne sont pas nécessaires au lancement du jeu. L'ouverture directe `file://` et Firefox ne peuvent pas être validés dans cet environnement cloud (restrictions de navigation et téléchargement réseau du navigateur) ; les tests Chromium servent l'export par HTTP.
