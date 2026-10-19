"""Parcours navigateur de la forêt et des combats, sans service distant."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
import threading,json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
RESULTS=ROOT/'test-results';RESULTS.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def copyfile(self,source,outputfile):
        try:super().copyfile(source,outputfile)
        except (BrokenPipeError,ConnectionResetError):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE=f'http://127.0.0.1:{server.server_port}'

def new_page(browser,**kwargs):
    context=browser.new_context(**kwargs)
    page=context.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(BASE) else route.abort())
    return context,page,errors

def profile(page,name='Aëlys',kind='guerrier'):
    page.goto(BASE,wait_until='domcontentloaded')
    page.locator('#hero-name').fill(name);page.locator('#hero-class').select_option(kind)
    page.locator('#profile-form button[type="submit"]').click()
    page.wait_for_selector('#forest-viewport')

def destination(page,name):
    page.locator('[data-action="atlas"]').click()
    page.locator(f'[data-travel="{name}"]').click()

def answer(page,written=False):
    prompt=page.locator('.question-card h2').inner_text()
    value=page.evaluate('''async prompt=>{const {facts}=await import('./content.js?v=3');return facts.find(f=>f.questions.includes(prompt)).answer;}''',prompt)
    if written:
        if page.locator('[data-mode="written"]').count():page.locator('[data-mode="written"]').click()
        page.locator('#answer').fill(value);page.locator('#answer-form button').click()
    else:
        page.locator('.answers button').filter(has_text=value).last.click()
    return value

try:
 with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context,page,errors=new_page(browser,viewport={'width':1440,'height':1050})
    profile(page)
    assert page.locator('.world-castle').count()==5
    start=page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.x")
    page.keyboard.down('ArrowRight');page.wait_for_timeout(300);page.keyboard.up('ArrowRight');page.wait_for_timeout(700)
    assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.x")>start
    destination(page,'stele-1');page.wait_for_selector('.field-notes',timeout=10000)
    notes=page.locator('.field-notes').inner_text()
    assert 'Quel est' not in notes and 'Quels sont' not in notes
    assert len(page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.readings"))==3
    page.locator('[data-action="close"]').click()
    page.screenshot(path=str(RESULTS/'foret-desktop.png'),full_page=True)
    destination(page,'surfaces')
    page.wait_for_selector('.skill-grid',timeout=15000)
    assert page.locator('.lesson').count()==0
    assert page.locator('#answer').count()==0
    for turn in range(4):
        page.locator('[data-ability="quick"]').click()
        if turn==0:
            page.screenshot(path=str(RESULTS/'foret-combat.png'),full_page=True)
            assert page.locator('.question-card h2').inner_text() not in notes
        answer(page)
        if turn<3:
            page.wait_for_selector('.enemy-report',timeout=5000)
            assert 'dégâts' in page.locator('.enemy-report').inner_text()
            if turn==0:
                assert '93 / 100' in page.locator('.hero-combatant').inner_text()
                page.screenshot(path=str(RESULTS/'foret-riposte.png'),full_page=True)
        else:
            page.wait_for_selector('.phase-victory')
            hp=page.locator('.hero-combatant').inner_text()
            page.wait_for_timeout(1800)
            assert page.locator('.hero-combatant').inner_text()==hp
        page.locator('[data-action="next"]').click()
    assert 'Le gardien est vaincu' in page.locator('.result h1').inner_text()
    assert '4 / 4' in page.locator('.result').inner_text()
    saved=page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1'))")
    assert len(saved['rewards'])==1
    page.locator('[data-action="finish"]').click();page.wait_for_timeout(1000)
    assert page.locator('#forest-viewport').count()==1 and page.locator('.skill-grid').count()==0
    x=page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.x")
    page.reload(wait_until='domcontentloaded');assert page.locator('#profile-form').count()==0
    assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.x")==x
    page.locator('[data-tab="hero"]').first.click();page.locator('[data-class="mage"]').click()
    assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).profile.class")=='mage'
    page.locator('[data-tab="journal"]').first.click();assert page.locator('.knowledge-card').count()==36
    assert not errors,errors
    print('Ordinateur : marche, découvertes sans question, entrée automatique, alternance des tours, victoire réelle, sauvegarde et classes OK',flush=True)
    context.close()

    context,page,errors=new_page(browser,viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    profile(page,'Nox','archer')
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    control=page.locator('[data-move="right"]');box=control.bounding_box()
    page.mouse.move(box['x']+15,box['y']+15);page.mouse.down();page.wait_for_timeout(400);page.mouse.up();page.wait_for_timeout(700)
    assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).world.x")>160
    page.screenshot(path=str(RESULTS/'foret-mobile.png'),full_page=True)
    destination(page,'surfaces');page.wait_for_selector('.skill-grid',timeout=15000)
    page.locator('[data-ability="guard"]').click();answer(page,written=True)
    page.wait_for_selector('.enemy-report',timeout=5000)
    assert '96 / 100' in page.locator('.hero-combatant').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert not errors,errors
    print('Mobile 390px : commandes tactiles, déplacement vers château, réponse écrite et garde OK',flush=True)
    context.close()

    context,page,errors=new_page(browser,viewport={'width':1280,'height':900})
    legacy={'version':1,'profile':{'name':'Ancienne partie','class':'mage','companion':'dragon'},'updatedAt':123,'knowledge':{'tc-1':{'stage':1,'attempts':2,'correct':1,'due':0,'updatedAt':123}},'rewards':{'old':{'xp':100,'gold':15,'win':True,'at':123}}}
    page.add_init_script('localStorage.setItem("anatomia.v1",'+json.dumps(json.dumps(legacy))+');')
    page.goto(BASE,wait_until='domcontentloaded')
    assert page.locator('#profile-form').count()==0
    assert page.locator('#forest-viewport').count()==1
    assert 'Niv. 2' in page.locator('.resources').inner_text()
    page.locator('[data-tab="hero"]').first.click();assert 'Ancienne partie' in page.locator('h1').inner_text()
    assert not errors,errors
    print('Ancienne sauvegarde : héros, niveau, or et connaissances conservés OK',flush=True)
    browser.close()
finally:
 server.shutdown()
