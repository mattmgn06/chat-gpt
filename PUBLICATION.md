# Jouer depuis un lien web

La publication est préparée mais n'a pas été effectuée. Le jeu et son cours PDF seraient accessibles publiquement. Obtenir l'accord de l'utilisateur avant tout envoi des sources ou publication ; ne pas présenter une adresse prévue comme un site déjà actif.

Le dépôt cible est `mattmgn06/chat-gpt`. Après accord, enregistrer et envoyer les fichiers du projet dans ce dépôt en conservant les éventuels changements distants. Ne pas forcer la mise à jour d'une branche.

Un administrateur du dépôt doit activer **Settings → Pages → Build and deployment → Source → GitHub Actions**. La disponibilité de Pages dépend de la visibilité du dépôt et de l'offre GitHub. Ne pas rendre un dépôt privé public sans accord supplémentaire.

Depuis **Actions**, sélectionner **Publier Anatomia sur GitHub Pages**, puis lancer **Run workflow**. Le workflow est manuel, il ne se lance pas au simple envoi du code. Il produit le site à partir d'une liste explicite de fichiers publics, sans métadonnées Git, sauvegardes de joueurs ni archives de travail. L'adresse effective est affichée par l'étape de déploiement GitHub ; l'ouvrir et vérifier la création du personnage, une mission et la sauvegarde avant d'annoncer le lien comme utilisable.

La connexion Google reste désactivée tant que Firebase n'est pas configuré. L'activation de Pages ne configure pas Firebase. Les neuf documents ne sont pas encore intégralement couverts.

Validation locale de la préparation : `python3 scripts/build_site.py`, puis servir `dist` avec un serveur HTTP et vérifier le jeu. Le test local ne prouve pas que le site public existe.
