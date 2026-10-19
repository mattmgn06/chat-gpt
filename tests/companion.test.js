import test from 'node:test';
import assert from 'node:assert/strict';
import {facts} from '../content.js';
import {review,normalize} from '../engine.js';
import {helpFor,requestHint,companionSupport,combatDifficulty} from '../companion.js';

test('les aides couvrent le cours sans afficher la réponse complète',()=>{
  for(const f of facts){const help=helpFor(f);assert.equal(help.length,3,f.id);for(const text of help){assert.ok(text.length>15,f.id);assert.ok(!normalize(text).includes(normalize(f.answer)),f.id);}}
});
test('les indices sont demandés, progressifs et indisponibles en examen',()=>{
  const initial={phase:'question',index:0,hintLevel:0,assisted:false};
  const first=requestHint(initial,0);assert.equal(first.hintLevel,1);assert.equal(first.assisted,true);
  const second=requestHint(first,0);assert.equal(second.hintLevel,2);assert.equal(requestHint(second,0),second);
  assert.equal(requestHint(initial,3),initial);assert.equal(requestHint({...initial,phase:'resolved'},0).hintLevel,0);
});
test('Éclaircissement ne peut être répété avant trois tours',()=>{
  const initial={phase:'question',index:0,rephrased:false};
  const used=requestHint(initial,0,{special:true});assert.equal(used.rephrased,true);assert.equal(used.assisted,true);assert.equal(used.lastSpecialRound,0);
  const next={...used,index:1,rephrased:false};assert.equal(requestHint(next,0,{special:true}),next);
  assert.equal(requestHint({...next,index:3},0,{special:true}).lastSpecialRound,3);
  assert.equal(requestHint(initial,3,{special:true}),initial);
});
test('une réponse aidée enregistre un entraînement sans valider ni déplacer le rappel',()=>{
  const before={stage:2,attempts:3,correct:3,due:300,mastered:false};
  const aided=review(before,true,500,{assisted:true});assert.equal(aided.stage,2);assert.equal(aided.attempts,3);assert.equal(aided.correct,3);assert.equal(aided.due,300);assert.equal(aided.practiceCorrect,1);
  const solo=review(aided,true,600);assert.equal(solo.stage,3);assert.equal(solo.attempts,4);
  const fresh=review(null,true,100,{assisted:true});assert.equal(fresh.stage,0);assert.equal(fresh.correct,0);assert.equal(fresh.practiceAttempts,1);
});
test('le compagnon soutient une fois par tour sans ressusciter ni dépasser les PV',()=>{
  const before={phase:'resolved',hp:93,index:0};const helped=companionSupport(before);assert.equal(helped.hp,96);assert.equal(helped.companionHealing,3);assert.equal(companionSupport(helped),helped);
  assert.equal(companionSupport({phase:'defeat',hp:0,index:0}).hp,0);
  assert.equal(companionSupport({phase:'resolved',hp:99,index:0}).hp,100);
});
test('la difficulté est réglable et le mode adaptatif ignore les entraînements aidés',()=>{
  assert.equal(combatDifficulty({profile:{difficulty:'relaxed'}}),.8);
  assert.equal(combatDifficulty({profile:{difficulty:'challenge'}}),1.2);
  assert.equal(combatDifficulty({knowledge:{a:{attempts:10,correct:3,practiceCorrect:50}}}),.85);
  assert.equal(combatDifficulty({knowledge:{a:{attempts:10,correct:10}}}),1.1);
  assert.equal(combatDifficulty({knowledge:{a:{attempts:0,correct:0,practiceCorrect:100}}}),1);
});
