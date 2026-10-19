"""Vérifie l'export autonome actuel dans Chromium, via un serveur temporaire."""
from pathlib import Path
from tempfile import TemporaryDirectory
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import subprocess,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,source,outputfile):
  try:super().copyfile(source,outputfile)
  except (BrokenPipeError,ConnectionResetError):pass
with TemporaryDirectory() as tmp:
 subprocess.run(['python3',str(ROOT/'build_standalone.py'),str(Path(tmp)/'index.html')],check=True)
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=tmp));threading.Thread(target=server.serve_forever,daemon=True).start()
 BASE=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
   for restricted in [False,True]:
    context=browser.new_context();page=context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith('http') and not r.url.startswith(BASE) else None)
    if restricted:page.add_init_script("URL.createObjectURL=()=>{throw Error('PDF indisponible')};Object.defineProperty(crypto,'randomUUID',{value:undefined});")
    page.goto(BASE);page.locator('#hero-name').fill('Gardienne');page.locator('#profile-form button').click()
    assert page.locator('#anatomia-startup').is_hidden()
    assert page.evaluate("getComputedStyle(document.body).backgroundColor")=='rgb(16, 24, 25)'
    page.locator('[data-action="atlas"]').click();page.locator('[data-travel="stele-1"]').click()
    page.wait_for_selector('.field-notes');page.locator('details').click()
    assert page.locator('.course-image').get_attribute('src').startswith('data:image/jpeg;base64,')
    page.wait_for_function("document.querySelector('.course-image')?.complete && document.querySelector('.course-image')?.naturalWidth>0")
    page.locator('[data-action="close"]').click()
    page.locator('[data-action="atlas"]').click();page.locator('[data-travel="surfaces"]').click()
    page.wait_for_selector('.skill-grid',timeout=15000);page.locator('[data-ability="quick"]').click()
    page.locator('[data-answer="Articulation talo-crurale"]').click()
    page.wait_for_selector('.enemy-report');assert page.locator('.feedback.correct').count()==1
    page.reload();assert page.locator('#profile-form').count()==0
    assert not errors,errors
    assert not external,external
    print('Export autonome : exploration, planche intégrée, combat, riposte et sauvegarde OK'+(' sans API PDF/UUID' if restricted else ''),flush=True)
    context.close()
   context=browser.new_context(java_script_enabled=False);page=context.new_page();page.goto(BASE)
   assert page.locator('#anatomia-startup').is_visible();context.close()
   context=browser.new_context();page=context.new_page()
   page.add_init_script("if(!sessionStorage.getItem('injected')){sessionStorage.setItem('injected','yes');localStorage.setItem('anatomia.v1',JSON.stringify({version:1,profile:{class:'invalide',name:'Test',companion:'loup'},knowledge:{},rewards:{},updatedAt:1}));}")
   page.goto(BASE);assert 'Message' in page.locator('#startup-error').inner_text()
   page.locator('#startup-recover').click();page.wait_for_selector('#profile-form')
   assert page.evaluate("Object.keys(localStorage).some(k=>k.startsWith('anatomia.backup.'))")
   print('Diagnostic sans JavaScript et récupération de sauvegarde invalide OK',flush=True)
   browser.close()
 finally:server.shutdown()
