# chat-gpt

# Anatomia — Les Terres oubliées

Prototype d'aventure anatomique en français, responsive, sans dépendance de compilation.

## Jouer en développement

Depuis `/workspace/chat-gpt`, lancer `npm start` (ou `python3 -m http.server 5173 --bind 0.0.0.0`). Servir les fichiers via HTTP ; les modules JavaScript ne fonctionnent pas en ouvrant directement index.html. `npm test` exécute les tests du moteur de révision.

La première partie propose un héros personnalisable, trois classes interchangeables, trois compagnons au choix, une carte et une exploration au clavier et par boutons tactiles. Quatre missions courtes permettent de découvrir 36 notions de l'articulation talo-crurale ; un boss propose huit questions écrites. Les victoires débloquent deux bonus d'équipement ; l'or est collecté pour une future boutique. Pas de paiement.

`npm run export` produit aussi `/workspace/anatomia.html` : une démo autonome à télécharger puis ouvrir directement dans un navigateur sur ordinateur, sans serveur. Elle embarque le cours et les planches et utilise une sauvegarde locale distincte de la version hébergée. La synchronisation Google y est désactivée ; l'export/import de partie reste disponible. Sur téléphone, l'ouverture de fichiers HTML dépend du navigateur et du gestionnaire de fichiers : la version hébergée est préférable.

La version autonome 2 ne fait aucune requête réseau au démarrage : ses polices de secours sont locales et le PDF n'est décodé qu'à son ouverture. Un écran statique explique les blocages si JavaScript n'est pas exécuté. Les erreurs de démarrage sont affichées avec une option pour repartir en conservant une copie de secours de l'ancienne sauvegarde. Les identifiants de récompenses fonctionnent même sans `crypto.randomUUID`.

Pour vérifier cette version : `python build_standalone.py test-results/anatomia-v2.html`, puis, serveur de développement en marche, `python tests/standalone.py`. Le test vérifie démarrage, combat, persistance, absence de requête externe, API PDF/UUID indisponibles, JavaScript désactivé et récupération après sauvegarde invalide. `ANATOMIA_BASE_URL` permet de changer l'adresse du serveur de test. L'ouverture directe `file://` et Firefox ne sont pas validés dans l'environnement cloud : le navigateur disponible interdit le premier et le réseau bloque le téléchargement du second.

## Périmètre pédagogique

Source : PDF fourni « 1A - UE 1.7 - HB - arthrologie cheville pied », pages 3 à 14, conservé dans `assets/cours-cheville-pied.pdf`. Chaque question indique sa page. Les planches 4, 7, 9, 10, 12, 13 et 14 sont extraites du document ; les illustrations de fantasy sont originales en SVG et ne servent pas de références anatomiques.

Ce prototype n'est pas une couverture exhaustive des neuf documents. Il évalue 36 notions textuelles de cheville. Les repères des figures, les articulations du pied et les huit autres PDF restent à intégrer. Les images sont consultables en apprentissage ; les exercices d'identification avec légendes masquées ne sont pas encore implémentés. Les réponses écrites sont comparées à des formulations et groupes de termes explicitement enregistrés, sans service d'IA : elles tolèrent accents, casse et tirets mais pas toutes les formulations possibles. Les corrections restent consultables dans le PDF. Une relecture pédagogique de la banque est recommandée avant utilisation pour une évaluation réelle.

Chaque notion suit quatre étapes. Première réponse juste : renforcement et rappel après dix minutes. Réussite à cette échéance : difficile et rappel après un jour. Réussite de mémoire : examen et rappel après trois jours. Réussite à cette échéance : examen validé et rappel après sept jours. Une erreur fait redescendre d'une étape et programme un rappel deux minutes plus tard. Répondre avant l'échéance ne fait pas monter la maîtrise. Le boss est une simulation ; le titre « examen » ne signifie pas que les notions ont toutes atteint leur dernière étape.

Victoire normale : trois bonnes réponses sur quatre ; victoire boss : sept sur huit, avec des PV restants. Le coup de grâce est déclenché au bilan si ce seuil est atteint. Les statistiques de classe et équipements modifient dégâts et protection. Les séances peuvent être quittées : les révisions sont sauvegardées à chaque réponse, les récompenses seulement au bilan. Pas de chronomètre imposé.

## Sauvegarde et connexion Google

La sauvegarde locale et l'export/import JSON fonctionnent immédiatement. Google et la synchronisation sont **préparés mais non activés par défaut**. Aucun faux bouton ne simule une connexion réussie.

Pour les activer :

1. Créer un projet Firebase et y enregistrer une application Web.
2. Activer Authentication > Google, configurer les coordonnées et domaines autorisés (dont le domaine HTTPS qui hébergera le jeu).
3. Créer Firestore, puis publier les règles de `firestore.rules`. Chaque compte n'accède qu'à son document `players/{uid}`. Ne pas utiliser le mode test ouvert.
4. Remplacer `null` dans `firebase-config.js` par la configuration **publique Web** fournie par Firebase (`apiKey`, `authDomain`, `projectId`, `appId`, etc.). Ne jamais mettre une clé privée de compte de service ou un secret OAuth dans le navigateur.
5. Héberger ces fichiers sur un domaine HTTPS. Autoriser les accès nécessaires à `www.gstatic.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `firestore.googleapis.com`, `accounts.google.com` et au domaine Firebase configuré. Une politique CSP éventuelle doit permettre les imports de modules Firebase et l'authentification correspondante.
6. Tester avec un véritable compte Google sur ordinateur et téléphone : créer une partie, terminer une mission, se connecter sur le second appareil et vérifier XP et notions. Tester aussi la déconnexion et un refus d'accès entre deux comptes distincts. Ces vérifications ne sont pas réalisables sans projet configuré.

Le rapprochement conserve les récompenses par identifiants uniques et prend la révision la plus récente de chaque notion. La dernière modification de profil l'emporte. Éviter deux séances simultanées sur la même notion : les événements de révision ne sont pas encore fusionnés individuellement. Les connexions nécessitent Internet ; les modules Firebase ne sont chargés qu'à la demande. Les polices Google sont facultatives, avec des polices système de secours. Pas de service worker ni de promesse de fonctionnement hors ligne.

Ne pas connecter plusieurs comptes différents sur un navigateur partagé sans séparer leurs profils de navigateur : la sauvegarde locale est unique à cet appareil. Il n'y a pas encore d'interface de suppression de compte.

## Suite prévue

Validation de cette boucle de jeu, intégration des autres documents avec traçabilité page par page, exercices sur schémas, récit plus développé, tutoriel scénarisé des trois classes et boutique d'équipement. Les choix initiaux de classe permettent déjà d'essayer leurs différences en mission.
