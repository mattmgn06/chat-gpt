"""Produit une démo locale en un fichier HTML, sans connexion cloud."""
import base64
import json
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parent
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'anatomia.html'

def module(name):
    text = (root / name).read_text()
    text = re.sub(r'^import .*?;\s*$', '', text, flags=re.M)
    return re.sub(r'\bexport (?=(?:const|let|function|async function)\b)', '', text)

def data_url(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()

pdf = base64.b64encode((root / 'assets/cours-cheville-pied.pdf').read_bytes()).decode()
images = {str(page): data_url(root / f'assets/cours-{page}.jpg', 'image/jpeg') for page in [4,7,9,10,12,13,14]}
prelude = f"""
let pdfUrl;
function openCourse(page = 1) {{
  try {{
    if (!pdfUrl) {{
      const source = document.getElementById('anatomia-pdf').textContent.trim();
      const bytes = Uint8Array.from(atob(source), c => c.charCodeAt(0));
      pdfUrl = URL.createObjectURL(new Blob([bytes], {{type:'application/pdf'}}));
    }}
    window.open(pdfUrl + '#page=' + page, '_blank', 'noopener');
  }} catch (error) {{ toast('Le navigateur ne peut pas ouvrir le PDF intégré. Tu peux continuer à jouer ; les réponses du cours restent affichées.'); }}
}}
document.addEventListener('click', function(event) {{
  const link = event.target.closest('[data-course-page]');
  if (link) {{ event.preventDefault(); openCourse(Number(link.dataset.coursePage)); }}
}});
const COURSE_IMAGES = {json.dumps(images)};
const cloudAvailable = false;
async function sync() {{}}
async function disconnect() {{}}
async function connect() {{throw Error('Version locale sans connexion cloud');}}
"""
app = module('app.js')
app = app.replace('href="assets/cours-cheville-pied.pdf#page=', 'href="#" data-course-page="')
app = app.replace("window.open('assets/cours-cheville-pied.pdf','_blank','noopener')", "openCourse(1)")
app = re.sub(r'src="assets/cours-\$\{([^}]+)\}\.jpg"', r'src="${COURSE_IMAGES[\1]}"', app)
script = '\n'.join([module('content.js'), module('engine.js'), module('world.js'), prelude, app])
if '</script' in script.lower():
    raise ValueError('Fin de script inattendue dans le code embarqué')
html = (root / 'index.html').read_text()
css = re.sub(r'@import\s+url\([^)]*\)\s*;', '', (root / 'style.css').read_text())
html = re.sub(r'<link rel="stylesheet" href="style\.css(?:\?[^"]*)?">', lambda _: '<style>' + css + '</style>', html)
fallback = '''<section id="anatomia-startup" style="max-width:650px;margin:45px auto;padding:28px;border:1px solid #cfb580;border-radius:8px;background:#172224;color:#eeeae0;font:16px/1.7 system-ui,sans-serif">
<h1 style="font:36px Georgia,serif;margin:0 0 18px">Anatomia — la forêt ouverte</h1>
<p id="startup-message">Le jeu est en cours de démarrage. Si cet écran reste affiché, le jeu n’a pas pu démarrer dans ce mode d’ouverture.</p>
<p>Télécharge entièrement le fichier, puis ouvre-le depuis le dossier Téléchargements avec un navigateur à jour. L’aperçu d’une messagerie ou d’un lecteur de documents peut empêcher son exécution.</p>
<p id="startup-error" style="white-space:pre-wrap;color:#f0c69b;overflow-wrap:anywhere"></p>
<button id="startup-recover" hidden style="padding:12px;background:#cfb580;color:#172224;border:0;border-radius:5px;cursor:pointer">Recommencer avec une sauvegarde de secours</button>
<p style="font-size:13px">Si le blocage persiste, envoie une capture de cet écran et du message ci-dessus.</p>
</section>'''
bootstrap = '''<script>
(function(){
  window.anatomiaReport = function(error){
    var panel=document.getElementById('anatomia-startup');
    panel.hidden=false;
    document.getElementById('startup-message').textContent='Le navigateur a rencontré une erreur. Ton fichier est ouvert, mais le jeu n’a pas pu continuer.';
    document.getElementById('startup-error').textContent='Message : '+(error && error.message || String(error));
    document.getElementById('startup-recover').hidden=false;
  };
  window.addEventListener('error',function(event){if(event.message)window.anatomiaReport(event.error || event.message);});
  window.addEventListener('unhandledrejection',function(event){window.anatomiaReport(event.reason);});
  document.getElementById('startup-recover').onclick=function(){
    window.anatomiaRecovering=true;
    try {
      var old=localStorage.getItem('anatomia.v1');
      if(old)localStorage.setItem('anatomia.backup.'+Date.now(),old);
      localStorage.removeItem('anatomia.v1');
      location.reload();
    } catch(error){window.anatomiaRecovering=false;window.anatomiaReport(error);}
  };
})();
</script>'''
html = html.replace('<div id="app"></div>', fallback + bootstrap + '<div id="app"></div>')
wrapped = "try {\n" + script + "\ndocument.getElementById('anatomia-startup').hidden=true;\n} catch(error) { window.anatomiaReport(error); }"
html = re.sub(r'<script type="module" src="app\.js(?:\?[^"]*)?"></script>', lambda _: '<script id="anatomia-pdf" type="application/octet-stream">' + pdf + '</script><script>' + wrapped + '</script>', html)
output.write_text(html)
print(f'Démo locale produite : {output.name} ({output.stat().st_size:,} octets)')
