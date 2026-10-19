export const SAVE_KEY = 'anatomia.v1';
// Les identifiants de récompenses ne sont pas des secrets. randomUUID n'est
// pas disponible dans tous les contextes d'ouverture de fichiers locaux.
export function rewardId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  if (typeof globalThis.crypto?.getRandomValues === 'function') return Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');
  return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2);
}
export const intervals = [10 * 60e3, 24 * 3600e3, 3 * 86400e3, 7 * 86400e3];
export const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/œ/g,'oe').replace(/[^a-z0-9]+/g,' ').trim();
// Comparaison conservatrice : jamais de validation par simple présence d'un mot
// dans une phrase négative ou proposant des réponses contradictoires.
export function checkAnswer(fact, text) {
  const value = normalize(text);
  if (!value || /\b(non|pas|aucun|sauf|ou)\b/.test(value)) return false;
  if (value === normalize(fact.answer)) return true;
  return fact.aliases.some(alias => Array.isArray(alias)
    ? alias.every(term => (` ${value} `).includes(` ${normalize(term)} `))
    : value === normalize(alias) || value === normalize(`le ${alias}`) || value === normalize(`la ${alias}`));
}
export function freshState() {
  return { version:1, profile:null, knowledge:{}, rewards:{}, updatedAt:0 };
}
export function mergeStates(a, b) {
  const result = {...freshState(), ...a};
  if (!b || b.version !== 1) return result;
  const aProfileTime=a.profileUpdatedAt ?? a.updatedAt ?? 0;
  const bProfileTime=b.profileUpdatedAt ?? b.updatedAt ?? 0;
  result.profile = (bProfileTime > aProfileTime ? b.profile : a.profile) || b.profile || a.profile;
  result.profileUpdatedAt=Math.max(aProfileTime,bProfileTime);
  result.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  result.rewards = {...a.rewards, ...b.rewards};
  result.knowledge = {...a.knowledge};
  for (const [id, entry] of Object.entries(b.knowledge || {})) {
    if (!result.knowledge[id] || entry.updatedAt > result.knowledge[id].updatedAt) result.knowledge[id] = entry;
  }
  if(a.world||b.world) {
    const x=a.world||{},y=b.world||{};
    result.world={...(x.updatedAt>y.updatedAt?x:y),distance:Math.max(x.distance||0,y.distance||0),readings:{...x.readings},cooldowns:{...x.cooldowns,...y.cooldowns}};
    for(const [id,entry] of Object.entries(y.readings||{}))if(!result.world.readings[id]||entry.seenAt>result.world.readings[id].seenAt)result.world.readings[id]=entry;
  }
  return result;
}
export function review(previous, correct, now = Date.now()) {
  const p = previous || {stage:0, attempts:0, correct:0, due:0, mastered:false};
  const eligible = now >= p.due;
  const stage = correct ? Math.min(3, p.stage + (eligible ? 1 : 0)) : Math.max(0, p.stage - 1);
  return {...p, stage, attempts:p.attempts + 1, correct:p.correct + Number(correct),
    mastered: correct && (p.mastered || (p.stage === 3 && eligible)),
    due: correct ? (eligible ? now + intervals[p.stage] : p.due) : now + 120e3,
    updatedAt:now};
}
export function selectFacts(facts, knowledge, {region, boss=false, errors=false, now=Date.now()} = {}) {
  let pool = facts.filter(f => !region || f.region === region);
  if (errors) pool = pool.filter(f => knowledge[f.id] && knowledge[f.id].correct < knowledge[f.id].attempts);
  return [...pool].sort((a,b) => {
    const x=knowledge[a.id], y=knowledge[b.id];
    if (boss) return (x?.correct || 0) - (y?.correct || 0);
    const score = p => !p ? 1 : p.due <= now ? 0 : 2;
    return score(x)-score(y) || (x?.due || 0)-(y?.due || 0) || (x?.attempts || 0)-(y?.attempts || 0);
  }).slice(0,boss ? 8 : 4);
}
export function totals(state) {
  const entries=Object.values(state.rewards || {});
  const xp=entries.reduce((n,r)=>n+r.xp,0), gold=entries.reduce((n,r)=>n+r.gold,0);
  const wins=entries.filter(r=>r.win).length;
  return {xp,gold,wins,level:1+Math.floor(xp/100)};
}

export function recallReady(reading, distance) {
  // Après une lecture, il faut parcourir huit cases avant de revoir la notion.
  return !reading || distance-(reading.seenDistance||0)>=256;
}
export function encounterFacts(facts,state,{region,boss=false,errors=false,now=Date.now()}={}) {
  let pool=facts.filter(f=>recallReady(state.world?.readings?.[f.id],state.world?.distance||0));
  if(errors)pool=pool.filter(f=>state.knowledge[f.id]&&state.knowledge[f.id].correct<state.knowledge[f.id].attempts);
  const regional=pool.filter(f=>!region||f.region===region);
  if(regional.length)pool=regional;
  return pool.sort((a,b)=>{
    const score=f=>{const k=state.knowledge[f.id];return k?(k.due<=now?0:2):state.world?.readings?.[f.id]?1:3;};
    return score(a)-score(b)||(state.knowledge[a.id]?.due||0)-(state.knowledge[b.id]?.due||0);
  }).slice(0,boss?12:8);
}
export const abilities = {
  quick:{cost:0,damage:0,block:0,desc:'Attaque fiable. Une bonne réponse rend 1 point de concentration.'},
  power:{cost:2,damage:14,block:0,desc:'Attaque puissante. Coûte 2 points de concentration.'},
  guard:{cost:0,damage:-10,block:.65,desc:'Attaque défensive. Réduit la prochaine frappe de 65 %.'},
};
export function chooseAbility(combat,id) {
  const skill=abilities[id];
  if(combat.phase!=='choose'||!skill||combat.energy<skill.cost)return combat;
  return {...combat,ability:id,energy:combat.energy-skill.cost,phase:'question'};
}
export function playerAttack(combat,correct,character,wins=0) {
  if(combat.phase!=='question')return combat;
  const streak=correct?combat.streak+1:0;
  const damage=correct?Math.max(1,character.damage+abilities[combat.ability].damage+(character.title==='Archer'&&streak%2===0?16:0)+(wins>=2?2:0)):0;
  const enemy=Math.max(0,combat.enemy-damage);
  return {...combat,enemy,streak,damage,energy:Math.min(3,combat.energy+(correct&&combat.ability!=='power'?1:0)),phase:enemy===0?'victory':'player-result'};
}
export function enemyAttack(combat,character,{learning=false,wins=0}={}) {
  if(combat.phase!=='enemy-turn'||combat.enemy<=0)return combat;
  const raw=(combat.boss?19:11)+[0,6,2][combat.index%3];
  const blocked=abilities[combat.ability]?.block||0;
  const incoming=Math.max(1,Math.round((raw-character.defense-(wins>=5?2:0))*(1-blocked)));
  const hp=Math.max(learning?1:0,combat.hp-incoming);
  return {...combat,hp,incoming:combat.hp-hp,protected:learning&&hp===1,phase:hp===0?'defeat':'resolved'};
}
