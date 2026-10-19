import test from 'node:test';
import assert from 'node:assert/strict';
import {facts,classes} from '../content.js';
import {freshState,mergeStates,recallReady,encounterFacts,chooseAbility,playerAttack,enemyAttack} from '../engine.js';
import {WORLD,loreNodes,castles,walkable,castleAt,findPath,makeWorld} from '../world.js';

const fight=()=>({phase:'choose',enemy:96,hp:100,energy:3,index:0,streak:0,ability:null,boss:false});
test('une bonne réponse permet une attaque puis le monstre attaque réellement',()=>{
  let b=chooseAbility(fight(),'quick');b=playerAttack(b,true,classes.guerrier);
  assert.equal(b.enemy,72);assert.equal(b.phase,'player-result');assert.equal(b.hp,100);
  b=enemyAttack({...b,phase:'enemy-turn'},classes.guerrier);
  assert.equal(b.phase,'resolved');assert.equal(b.hp,93);assert.equal(b.incoming,7);
  assert.deepEqual(enemyAttack(b,classes.guerrier),b,'une même phase ne peut infliger deux attaques');
});
test('une attaque manquée est aussi suivie du tour du monstre',()=>{
  let b=playerAttack(chooseAbility(fight(),'quick'),false,classes.mage);
  assert.equal(b.enemy,96);b=enemyAttack({...b,phase:'enemy-turn'},classes.mage);
  assert.equal(b.hp,89);
});
test('garde, énergie et mort du monstre changent le déroulement du combat',()=>{
  let b=playerAttack(chooseAbility(fight(),'guard'),true,classes.guerrier);
  b=enemyAttack({...b,phase:'enemy-turn'},classes.guerrier);
  assert.equal(b.incoming,2);
  const empty={...fight(),energy:1};assert.equal(chooseAbility(empty,'power'),empty);
  const strong=chooseAbility(fight(),'power');assert.equal(strong.energy,1);
  const dead=playerAttack(chooseAbility({...fight(),enemy:20},'quick'),true,classes.guerrier);
  assert.equal(dead.phase,'victory');assert.equal(dead.enemy,0);
  assert.equal(enemyAttack({...dead,phase:'enemy-turn'},classes.guerrier).hp,100);
});
test('protection en apprentissage, défaite dans les autres niveaux',()=>{
  const b={...fight(),phase:'enemy-turn',ability:'quick',hp:2};
  assert.equal(enemyAttack(b,classes.mage,{learning:true}).hp,1);
  assert.equal(enemyAttack(b,classes.mage).phase,'defeat');
});
test('une notion lue est exclue avant huit cases de balade et devient éligible après',()=>{
  const state={...freshState(),world:makeWorld({distance:100,readings:{'tc-1':{seenAt:1,seenDistance:100}}})};
  assert.equal(recallReady(state.world.readings['tc-1'],355),false);
  assert.ok(!encounterFacts(facts,state,{region:'surfaces'}).some(f=>f.id==='tc-1'));
  state.world.distance=356;assert.equal(recallReady(state.world.readings['tc-1'],356),true);
  assert.equal(encounterFacts(facts,state,{region:'surfaces'})[0].id,'tc-1');
});
test('le monde conserve toutes les découvertes lors de la fusion des sauvegardes',()=>{
  const a={...freshState(),world:makeWorld({x:100,distance:100,updatedAt:10,readings:{a:{seenAt:10},b:{seenAt:5}}})};
  const b={...freshState(),world:makeWorld({x:400,distance:300,updatedAt:20,readings:{b:{seenAt:20}}})};
  const merged=mergeStates(a,b);assert.equal(merged.world.x,400);assert.equal(merged.world.readings.a.seenAt,10);assert.equal(merged.world.readings.b.seenAt,20);assert.equal(merged.world.distance,300);
});
test('chaque notion est enseignée une fois et les lieux sont accessibles autour des lacs',()=>{
  const ids=loreNodes.flatMap(n=>n.ids);assert.equal(ids.length,36);assert.equal(new Set(ids).size,36);
  for(const f of facts){assert.ok(ids.includes(f.id));assert.ok(f.lesson);assert.ok(f.questions.length>=3);assert.ok(!f.questions.includes(f.lesson));}
  for(const target of [...castles,...loreNodes]){
    assert.ok(walkable(target.x,target.y),target.id);
    const route=findPath(WORLD.spawn,target);assert.ok(route.length,target.id);
    assert.ok(route.every(p=>walkable(p.x,p.y)));
  }
  assert.equal(castleAt({x:castles[0].x,y:castles[0].y}).id,'surfaces');
  assert.equal(castleAt({x:castles[0].x,y:castles[0].y+120}),undefined);
  assert.deepEqual(findPath(WORLD.spawn,{x:1000,y:700}),[],'pas de destination sous le lac');
});
