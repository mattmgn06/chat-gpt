# Jouer depuis un lien web

La publication publique du jeu et de son cours PDF a été autorisée par l'utilisateur. Les sources ont été envoyées dans `mattmgn06/chat-gpt` et l'utilisateur a confirmé que le site fonctionne. Les mises à jour de cette démo sont dans le périmètre de cette autorisation. Ne pas présenter un déploiement en attente comme une mise à jour déjà servie.

Le dépôt cible est `mattmgn06/chat-gpt`. Conserver les éventuels changements distants et ne pas forcer la mise à jour d'une branche.

Un administrateur du dépôt doit activer **Settings → Pages → Build and deployment → Source → GitHub Actions**. La disponibilité de Pages dépend de la visibilité du dépôt et de l'offre GitHub. Ne pas rendre un dépôt privé public sans accord supplémentaire.

Le workflow **Publier Anatomia sur GitHub Pages** se lance à chaque mise à jour de `main`. Il est aussi possible de le lancer depuis **Actions → Run workflow**. Il produit le site à partir d'une liste explicite de fichiers publics, sans métadonnées Git, sauvegardes de joueurs ni archives de travail. L'adresse effective est affichée par l'étape de déploiement GitHub ; vérifier le statut du déploiement et la page servie avant d'annoncer la mise à jour comme disponible.

La connexion Google reste désactivée tant que Firebase n'est pas configuré. L'activation de Pages ne configure pas Firebase. Les neuf documents ne sont pas encore intégralement couverts.

Validation locale de la préparation : `python3 scripts/build_site.py`, puis servir `dist` avec un serveur HTTP et vérifier le jeu. Le test local ne prouve pas que le site public existe.
