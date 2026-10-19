import test from 'node:test';
import assert from 'node:assert/strict';
import {facts,regions} from '../content.js';
import {review,intervals,checkAnswer,freshState,mergeStates,selectFacts,totals} from '../engine.js';

test('la maîtrise exige des réussites espacées, puis un véritable rappel d’examen',()=>{
  let now=1000000,p=review(null,true,now);
  assert.equal(p.stage,1);assert.equal(p.mastered,false);
  const early=review(p,true,now+1000);
  assert.equal(early.stage,1);assert.equal(early.due,p.due);
  p=review(p,true,p.due);assert.equal(p.stage,2);
  assert.equal(p.due,now+intervals[0]+intervals[1]);
  p=review(p,true,p.due);assert.equal(p.stage,3);assert.equal(p.mastered,false);
  p=review(p,true,p.due);assert.equal(p.mastered,true);
  p=review(p,false,p.due);assert.equal(p.stage,2);assert.equal(p.mastered,false);
});
test('une erreur ne peut faire descendre sous apprentissage',()=>{
  const p=review(null,false,100);assert.equal(p.stage,0);assert.equal(p.due,120100);assert.equal(p.attempts,1);
});
test('chaque réponse canonique est acceptée et chaque distracteur refusé',()=>{
  for(const f of facts){assert.equal(checkAnswer(f,f.answer),true,f.id);for(const c of f.choices.slice(1))assert.equal(checkAnswer(f,c),false,`${f.id}: ${c}`);}
});
test('réponses de mémoire : ordre, accents et termes essentiels',()=>{
  assert.equal(checkAnswer(facts[1],'talus, tibia, fibula'),true);
  assert.equal(checkAnswer(facts[1],'tibia et talus'),false);
  assert.equal(checkAnswer(facts[2],'trochleenne'),true);
  assert.equal(checkAnswer(facts[2],'pas trochléenne'),false);
  assert.equal(checkAnswer(facts[7],'avant ou arrière'),false);
});
test('une fusion conserve les récompenses uniques et les révisions les plus récentes',()=>{
  const a={...freshState(),profile:{name:'A'},updatedAt:100,knowledge:{a:{updatedAt:100,stage:1}},rewards:{x:{xp:10,gold:2,win:true}}};
  const b={...freshState(),profile:{name:'B'},updatedAt:200,knowledge:{a:{updatedAt:50,stage:0},b:{updatedAt:200,stage:2}},rewards:{x:{xp:10,gold:2,win:true},y:{xp:20,gold:3,win:false}}};
  const m=mergeStates(a,b);assert.equal(m.profile.name,'B');assert.equal(m.knowledge.a.stage,1);assert.equal(m.knowledge.b.stage,2);assert.equal(totals(m).xp,30);assert.equal(totals(m).wins,1);
});
test('les missions priorisent les rappels échus, puis les nouvelles notions',()=>{
  const known={};for(let i=0;i<4;i++)known[facts[i].id]={stage:1,due:200,attempts:1,correct:1};
  known[facts[5].id]={stage:1,due:50,attempts:1,correct:0};
  const selected=selectFacts(facts,known,{region:'surfaces',now:100});
  assert.equal(selected.length,4);assert.equal(selected[0].id,facts[5].id);assert.equal(selected[1].id,facts[4].id);
  assert.equal(selectFacts(facts,known,{errors:true}).length,1);
  assert.equal(selectFacts(facts,known,{boss:true}).length,8);
});
test('la banque conserve des identifiants uniques et des références du cours',()=>{
  assert.equal(facts.length,36);assert.equal(new Set(facts.map(f=>f.id)).size,36);
  for(const f of facts){assert.ok(regions.some(r=>r.id===f.region));assert.ok([3,5,6,8,11].includes(f.page));assert.equal(new Set(f.choices).size,4);}
});
