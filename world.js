export const WORLD = { width:2048, height:1440, tile:32, speed:195, spawn:{x:160,y:1184} };
export const castles = [
  {id:'surfaces',x:768,y:1056,title:'Château de la Mortaise',region:'surfaces'},
  {id:'capsule',x:1456,y:928,title:'Sanctuaire des Membranes',region:'capsule'},
  {id:'medial',x:1536,y:256,title:'Bastion du Deltoïde',region:'medial'},
  {id:'lateral',x:384,y:288,title:'Les trois Tours',region:'lateral'},
  {id:'boss',x:1056,y:544,title:'Citadelle des Brumes',boss:true},
];
export const loreNodes = [
  {id:'stele-1',x:256,y:1120,region:'surfaces',ids:['tc-1','tc-2','tc-3'],title:'La stèle des trois os'},
  {id:'stele-2',x:448,y:1152,region:'surfaces',ids:['tc-4','tc-5','tc-6'],title:'Le carnet de la Mortaise'},
  {id:'stele-3',x:544,y:960,region:'surfaces',ids:['tc-7','tc-8','tc-9'],title:'La source du cartilage'},
  {id:'stele-4',x:928,y:1184,region:'capsule',ids:['tc-10','tc-11','tc-12'],title:'L’herbier du Passeur'},
  {id:'stele-5',x:1120,y:1088,region:'capsule',ids:['tc-13','tc-14'],title:'Les deux membranes'},
  {id:'stele-6',x:1248,y:928,region:'capsule',ids:['tc-15','tc-16'],title:'La fontaine de la synoviale'},
  {id:'stele-7',x:1696,y:800,region:'medial',ids:['tc-17','tc-18','tc-19'],title:'Le gardien du Deltoïde'},
  {id:'stele-8',x:1792,y:576,region:'medial',ids:['tc-20','tc-21','tc-22'],title:'La pierre superficielle'},
  {id:'stele-9',x:1664,y:416,region:'medial',ids:['tc-23','tc-24','tc-25','tc-26'],title:'Les racines profondes'},
  {id:'stele-10',x:1216,y:320,region:'lateral',ids:['tc-27','tc-28','tc-29'],title:'Les trois sentinelles'},
  {id:'stele-11',x:960,y:352,region:'lateral',ids:['tc-30','tc-31','tc-32'],title:'Le journal de l’éclaireur'},
  {id:'stele-12',x:672,y:416,region:'lateral',ids:['tc-33','tc-34','tc-35','tc-36'],title:'La corde de pierre'},
];
export const wanderers = [
  {id:'ombre-sud',x:944,y:1008,region:'surfaces',title:'Loup des brumes'},
  {id:'ombre-nord',x:1344,y:512,region:'medial',title:'Rôdeur des racines'},
  {id:'ombre-ouest',x:416,y:736,region:'lateral',title:'Sentinelle égarée'},
];
export const lakes = [{x:864,y:640,w:320,h:256},{x:1440,y:1152,w:256,h:160}];
export function makeWorld(saved) {
  return {x:WORLD.spawn.x,y:WORLD.spawn.y,distance:0,readings:{},cooldowns:{},updatedAt:0,...saved};
}
export function walkable(x,y) {
  return x>=32&&y>=32&&x<=WORLD.width-32&&y<=WORLD.height-32&&!lakes.some(l=>x>l.x-12&&x<l.x+l.w+12&&y>l.y-12&&y<l.y+l.h+12);
}
export function near(a,b,radius=64) {return Math.hypot(a.x-b.x,a.y-b.y)<=radius;}
export function castleAt(position) {return castles.find(c=>Math.abs(position.x-c.x)<=50&&position.y>=c.y-38&&position.y<=c.y+20);}
export function findPath(from,to) {
  const tile=WORLD.tile, cols=WORLD.width/tile, rows=WORLD.height/tile;
  const cell=p=>({x:Math.max(1,Math.min(cols-2,Math.floor(p.x/tile))),y:Math.max(1,Math.min(rows-2,Math.floor(p.y/tile)))});
  const start=cell(from), target=cell(to), key=p=>p.y*cols+p.x;
  if(!walkable(target.x*tile+16,target.y*tile+16))return [];
  const queue=[start], visited=new Map([[key(start),null]]);let end=null;
  for(let i=0;i<queue.length;i++) {
    const point=queue[i];if(point.x===target.x&&point.y===target.y){end=point;break;}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const next={x:point.x+dx,y:point.y+dy},id=key(next);
      if(!visited.has(id)&&walkable(next.x*tile+16,next.y*tile+16)){visited.set(id,point);queue.push(next);}
    }
  }
  if(!end)return [];
  const path=[];for(let p=end;visited.get(key(p));p=visited.get(key(p)))path.push({x:p.x*tile+16,y:p.y*tile+16});
  path.reverse();
  if(walkable(to.x,to.y))path.push({x:to.x,y:to.y});
  return path;
}
