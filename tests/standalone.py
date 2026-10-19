"""Tests du HTML autonome, servi localement (le cloud bloque file://)."""
from playwright.sync_api import sync_playwright
import os

BASE=os.environ.get('ANATOMIA_BASE_URL','http://127.0.0.1:5173')
URL=BASE+'/test-results/anatomia-v2.html'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for restricted in [False,True]:
        context=browser.new_context()
        page=context.new_page()
        errors=[]; external=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.on('request',lambda request:external.append(request.url) if request.url.startswith('http') and not request.url.startswith(BASE+'/') else None)
        if restricted:
            page.add_init_script("URL.createObjectURL=()=>{throw new Error('PDF indisponible')}; Object.defineProperty(crypto,'randomUUID',{value:undefined});")
        page.goto(URL)
        page.locator('#hero-name').fill('Aelys')
        page.locator('#profile-form button[type="submit"]').click()
        assert page.locator('#anatomia-startup').is_hidden()
        assert page.evaluate("getComputedStyle(document.body).backgroundColor")=='rgb(16, 24, 25)'
        assert page.locator('.map-node').count()==4
        if restricted:
            page.locator('[data-action="course"]').click()
            assert 'continuer à jouer' in page.locator('#toast').inner_text()
        page.locator('[data-mission="surfaces"]').click()
        page.locator('details').click()
        assert page.locator('.course-image').evaluate('(img)=>img.complete && img.naturalWidth>0')
        page.locator('[data-action="start-fight"]').click()
        page.locator('[data-answer="Articulation talo-crurale"]').click()
        assert page.locator('.feedback.correct').count()==1
        page.reload()
        assert page.locator('.map-node').count()==4
        assert not errors,errors
        assert not external,external
        print('Démarrage, schémas, combat, persistance et zéro requête externe : OK'+(' (API PDF/UUID indisponibles)' if restricted else ''))
        context.close()
    context=browser.new_context(java_script_enabled=False)
    page=context.new_page();page.goto(URL)
    assert page.locator('#anatomia-startup').is_visible()
    assert 'mode d’ouverture' in page.locator('#startup-message').inner_text()
    print('JavaScript désactivé : instructions visibles, aucune page blanche')
    context.close()
    context=browser.new_context()
    page=context.new_page()
    page.add_init_script("""if(!sessionStorage.getItem('injected')){sessionStorage.setItem('injected','yes');localStorage.setItem('anatomia.v1',JSON.stringify({version:1,profile:{class:'invalide',name:'Test',companion:'loup'},knowledge:{},rewards:{},updatedAt:1}));}""")
    page.goto(URL)
    assert page.locator('#startup-error').is_visible()
    assert 'Message' in page.locator('#startup-error').inner_text()
    page.locator('#startup-recover').click()
    page.wait_for_selector('#profile-form')
    assert page.evaluate("Object.keys(localStorage).some(k=>k.startsWith('anatomia.backup.'))")
    print('Erreur de démarrage : message visible et récupération avec sauvegarde de secours OK')
    browser.close()
