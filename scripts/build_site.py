"""Prépare uniquement les fichiers publics du jeu pour un hébergement statique."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
destination = root / 'dist'
destination.mkdir(exist_ok=True)
public_files = ['index.html', 'style.css', 'app.js', 'engine.js', 'content.js', 'world.js', 'forest3d.js', 'companion.js', 'cloud.js', 'firebase-config.js']
for name in public_files:
    shutil.copyfile(root / name, destination / name)
shutil.copytree(root / 'assets', destination / 'assets', dirs_exist_ok=True)
shutil.copytree(root / 'vendor', destination / 'vendor', dirs_exist_ok=True)
(destination / '.nojekyll').touch()
print('Site préparé dans dist/ ; aucune publication effectuée.')
