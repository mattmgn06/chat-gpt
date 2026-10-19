# chat-gpt

# Anatomia — Les Terres oubliées

Aventure de révision anatomique en français, sur ordinateur et mobile. Version 0.2 : une forêt ouverte à parcourir, des découvertes pédagogiques sur le terrain et de véritables combats au tour par tour.

## Lancer et vérifier

Depuis `/workspace/chat-gpt`, lancer `npm start` (serveur HTTP Python, port 5173). Aucun paquet npm à installer. `npm test` vérifie le moteur, les combats, les parcours et les sauvegardes.

`python3 scripts/build_site.py` prépare `dist/`, puis `python3 tests/smoke.py` démarre un serveur de test temporaire et vérifie le site préparé dans Chromium : ordinateur, mobile, déplacement, lecture, entrée automatique dans un château, attaque et riposte, victoire, sauvegarde et migration d'une ancienne partie. Chromium et Python Playwright doivent être disponibles. Le test bloque les requêtes externes.

`python3 tests/standalone.py` construit et teste l'export autonome. Les captures de tests sont conservées dans `test-results/` (ignoré par Git).

## Explorer et apprendre

La forêt de 2048 × 1440 pixels est continue. La caméra suit le héros. Déplacements : flèches ou ZQSD/WASD, boutons tactiles maintenus, ou clic/toucher sur le sol. Les trajets automatiques contournent les lacs. La carte des lieux permet aussi de choisir une destination sans téléporter le personnage.

Douze stèles et carnets présentent des extraits déclaratifs du cours, trois ou quatre notions à la fois. Approcher un lieu puis appuyer sur E ou « Observer », ou cliquer sur le lieu pour y marcher. L'apprentissage ne prend plus la forme de la future question affichée juste avant le combat. Après chaque lecture, les notions concernées sont exclues des rencontres pendant huit cases supplémentaires (256 pixels de marche). Les notions révisables déjà échues sont prioritaires ; les nouvelles questions sont formulées avec plusieurs variantes et leurs choix sont mélangés.

Cinq châteaux déclenchent automatiquement leur rencontre lorsque le héros passe leur entrée. Trois créatures sont aussi présentes dans la forêt, avec un délai de deux minutes avant une nouvelle rencontre. Après un combat, le héros réapparaît à distance de l'entrée pour ne pas redéclencher le même combat en boucle.

Lire ne fait pas artificiellement monter un niveau de maîtrise : seuls les rappels testés font progresser une notion. Chaque notion garde son historique : apprentissage, renforcement après dix minutes, difficile après un jour, examen après trois jours, puis rappel après sept jours. Une erreur fait redescendre d'une étape et rapproche le rappel. Répondre avant l'échéance ne fait pas monter la maîtrise. Une victoire ne valide pas automatiquement un examen.

## Combats

Le joueur choisit une frappe rapide, une attaque puissante (2 points de concentration) ou une garde. Il répond ensuite à une question. Une bonne réponse déclenche son attaque ; une erreur la fait manquer. Les frappes rapides et défensives réussies restaurent un point de concentration, dans la limite de trois.

Si le monstre survit, son tour démarre automatiquement : il attaque après une réponse juste comme après une erreur. La garde réduit la riposte de 65 %. La classe et l'équipement modifient dégâts et protection. Les animations et le journal distinguent les deux tours. La correction reste lisible après la riposte ; le joueur choisit quand commencer le tour suivant. Un monstre vaincu ne peut pas attaquer.

La victoire exige de réduire les PV du monstre à zéro, avec un héros encore debout. Fin maximale d'une rencontre normale après huit tours, d'un boss après douze tours. En apprentissage, le compagnon empêche le dernier coup de faire tomber le héros sous un PV. Dans les niveaux suivants, une défaite est possible. Les réponses sont sauvegardées dès leur validation ; les récompenses ne sont attribuées qu'au bilan, une seule fois.

Trois classes interchangeables hors combat et trois compagnons au choix. Deux bonus d'équipement se débloquent avec les victoires. L'or reste conservé pour une future boutique.

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
