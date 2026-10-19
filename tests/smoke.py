from playwright.sync_api import sync_playwright
import json
BASE='http://127.0.0.1:5173'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1050},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)))
 page.goto(BASE)
 page.locator('#hero-name').fill('Aëlys')
 page.locator('#hero-class').select_option('mage')
 page.locator('input[value="dragon"]').check()
 page.get_by_role('button',name='Entrer dans l’aventure').click()
 page.wait_for_selector('.map-panel')
 assert page.locator('.map-node').count()==4
 page.screenshot(path='/workspace/chat-gpt/test-results/desktop.png',full_page=True)
 page.locator('[data-region="surfaces"]').click()
 old=page.locator('.walking-hero').get_attribute('style')
 page.keyboard.press('ArrowRight')
 assert old!=page.locator('.walking-hero').get_attribute('style')
 page.get_by_role('button',name='Entrer en mission').click()
 for i in range(4):
  if page.locator('[data-action="start-fight"]').count():page.locator('[data-action="start-fight"]').click()
  if i==0:
   page.screenshot(path='/workspace/chat-gpt/test-results/combat.png',full_page=True)
  answer=page.evaluate('''async()=>{const {facts}=await import('/content.js'); const question=document.querySelector('.question-card h2').textContent;return facts.find(f=>f.question===question).answer;}''')
  page.get_by_role('button',name=answer,exact=False).last.click()
  assert page.locator('.feedback.correct').count()==1
  page.locator('[data-action="next"]').click()
 assert '4 / 4' in page.locator('.result').inner_text()
 assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).rewards")
 page.locator('[data-action="finish"]').click()
 page.reload()
 assert page.locator('#profile-form').count()==0
 page.locator('[data-tab="hero"]').first.click()
 assert 'Aëlys' in page.locator('h1').inner_text()
 assert '60 XP' in page.locator('.page-heading p').inner_text()
 page.locator('[data-class="archer"]').click()
 assert page.evaluate("JSON.parse(localStorage.getItem('anatomia.v1')).profile.class")=='archer'
 page.locator('[data-tab="world"]').first.click()
 page.locator('[data-action="boss"]').click()
 assert page.locator('#answer').count()==1
 assert page.locator('.answers').count()==0
 page.locator('#answer').fill('Je ne sais pas')
 page.locator('#answer-form button').click()
 assert page.locator('.feedback.incorrect').count()==1
 page.locator('[data-action="abandon"]').click()
 page.locator('[data-action="confirm-abandon"]').click()
 page.locator('[data-action="login"]').click()
 assert 'à activer' in page.locator('.modal h1').inner_text()
 page.locator('[data-action="close"]').click()
 page.locator('[data-tab="journal"]').first.click()
 assert page.locator('.knowledge-card').count()==36
 page.locator('[data-filter="due"]').click()
 assert page.locator('.knowledge-card').count()==0
 print('Desktop: mission, déplacement, récompenses, rechargement, classes, réponse écrite, abandon, compte non configuré, filtres OK')
 assert not errors,errors
 mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 mp=mobile.new_page();mp.on('pageerror',lambda e:errors.append(str(e)));mp.goto(BASE)
 mp.locator('#hero-name').fill('Nox');mp.locator('button[type="submit"]').click()
 assert mp.evaluate('document.documentElement.scrollWidth<=window.innerWidth'),mp.evaluate('[document.documentElement.scrollWidth,window.innerWidth]')
 mp.screenshot(path='/workspace/chat-gpt/test-results/mobile.png',full_page=True)
 mp.locator('[data-region="medial"]').click();mp.locator('[data-move="up"]').click()
 mp.locator('[data-action="interact"]').click();mp.locator('[data-action="start-fight"]').click()
 mp.locator('[data-mode="written"]').click()
 mp.locator('#answer').fill('deltoïde');mp.locator('#answer-form button').click()
 assert mp.locator('.feedback.correct').count()==1
 assert mp.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
 print('Mobile 390px: création du héros, exploration tactile, réponse écrite, aucun débordement horizontal OK')
 assert not errors,errors
 browser.close()
