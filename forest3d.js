import * as THREE from './vendor/three.module.min.js';
import { WORLD, castles, loreNodes, wanderers, lakes, walkable, near } from './world.js?v=4';

// Scène locale en géométrie réelle : aucune image ou bibliothèque chargée sur un CDN.
export function createForest3D(viewport) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x20343a);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  const canvas=renderer.domElement;canvas.className='forest-canvas';canvas.dataset.renderer='webgl';canvas.setAttribute('aria-label','Forêt en trois dimensions avec ton héros et son compagnon');
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x20343a,24,65);
  const camera=new THREE.OrthographicCamera(-12,12,9,-9,.1,110);
  const sun=new THREE.DirectionalLight(0xffe7b5,2.8);sun.position.set(10,25,15);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.5,far:65});sun.shadow.bias=-.0007;scene.add(sun,sun.target);
  scene.add(new THREE.HemisphereLight(0xc3dbdd,0x21382b,2.2));
  const materials=new Map();
  const material=(color,extra={})=>{const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.9,...extra}));return materials.get(key);};
  function mesh(geometry,color,parent=scene,position=[0,0,0],extra={}){const m=new THREE.Mesh(geometry,material(color,extra));m.position.set(...position);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const box=(w,h,d,c,p,pos)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,pos);
  const sphere=(r,c,p,pos)=>mesh(new THREE.SphereGeometry(r,10,8),c,p,pos);
  const cylinder=(a,b,h,c,p,pos,sides=8)=>mesh(new THREE.CylinderGeometry(a,b,h,sides),c,p,pos);
  const group=(parent=scene,pos=[0,0,0])=>{const g=new THREE.Group();g.position.set(...pos);parent.add(g);return g;};
  box(80,.35,62,0x2e4c38,scene,[32,-.2,22.5]);
  // Les chemins conservent les mêmes coordonnées que les collisions et la sauvegarde.
  const paths=[[WORLD.spawn,...loreNodes.slice(0,3),castles[0],...loreNodes.slice(3,6),castles[1],...loreNodes.slice(6,9),castles[2],...loreNodes.slice(9,12),castles[3]],[loreNodes[11],wanderers[2],loreNodes[2]],[loreNodes[10],castles[4],wanderers[1],loreNodes[8]]];
  for(const path of paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=(b.x-a.x)/32,dz=(b.y-a.y)/32;const road=box(1.25,.035,Math.hypot(dx,dz),0x84744b,scene,[(a.x+b.x)/64,.012,(a.y+b.y)/64]);road.rotation.y=Math.atan2(dx,dz);road.castShadow=false;}
  for(const lake of lakes){box((lake.w+26)/32,.05,(lake.h+26)/32,0x678166,scene,[(lake.x+lake.w/2)/32,.006,(lake.y+lake.h/2)/32]);const water=box(lake.w/32,.08,lake.h/32,0x316a77,scene,[(lake.x+lake.w/2)/32,.045,(lake.y+lake.h/2)/32]);water.material=material(0x316a77,{roughness:.2,metalness:.18});water.castShadow=false;}
  const treePositions=[],landmarks=[WORLD.spawn,...castles,...loreNodes,...wanderers];
  for(let i=0;i<470;i++){const x=48+(i*173+Math.floor(i/7)*37)%1940,y=45+(i*293+Math.floor(i/9)*51)%1340;if(walkable(x,y)&&!landmarks.some(p=>near({x,y},p,95)))treePositions.push({x:x/32,z:y/32,s:.75+(i%9)*.075});}
  const dummy=new THREE.Object3D();
  for(const [geometry,color,y,scale] of [[new THREE.CylinderGeometry(.09,.15,1.2,6),0x67573b,.6,1],[new THREE.ConeGeometry(.9,1.7,7),0x345d3e,1.3,1],[new THREE.ConeGeometry(.75,1.7,7),0x47764b,2.2,1],[new THREE.ConeGeometry(.55,1.5,7),0x5b8551,3,1]]){
    const instances=new THREE.InstancedMesh(geometry,material(color),treePositions.length);instances.castShadow=true;instances.receiveShadow=true;
    treePositions.forEach((p,i)=>{dummy.position.set(p.x,y*p.s,p.z);dummy.scale.setScalar(p.s*scale);dummy.rotation.set(0,i*.7,0);dummy.updateMatrix();instances.setMatrixAt(i,dummy.matrix);});scene.add(instances);
  }
  for(const castle of castles){const g=group(scene,[castle.x/32,0,castle.y/32-1]);
    box(3.7,1.8,1.7,0x8b9080,g,[0,.9,0]);box(4.2,.18,2.3,0xa6a38d,g,[0,.08,0]);
    for(const x of [-1.5,1.5]){cylinder(.62,.68,3.2,0x9b9c89,g,[x,1.6,0]);cylinder(0,.86,1.5,castle.boss?0x6a526d:0x435d5a,g,[x,3.85,0]);box(.17,.4,.035,0xffd58c,g,[x,2.2,.625]);}
    box(.85,1.3,.06,0x26302c,g,[0,.65,.88]);box(1.2,.12,.9,0xb3aa86,g,[0,.06,1.15]);
    const pole=cylinder(.025,.025,2,0xc0b083,g,[.4,2.6,0]);pole.castShadow=false;box(.6,.4,.035,castle.boss?0xb789af:0xc2a36b,g,[.72,3.25,0]);
  }
  for(const node of loreNodes){const g=group(scene,[node.x/32,0,node.y/32]);box(.8,.18,.7,0xa4aa88,g,[0,.09,0]);box(.62,1.15,.28,0x91a185,g,[0,.7,0]);const rune=mesh(new THREE.OctahedronGeometry(.17),0xf4d893,g,[0,1.1,.17],{emissive:0xbc8b35,emissiveIntensity:.5});rune.rotation.z=.4;}
  for(const monster of wanderers){const g=group(scene,[monster.x/32,0,monster.y/32]);const body=sphere(.5,0x605765,g,[0,.6,0]);body.scale.set(1,1.3,.8);cylinder(0,.18,.5,0x8f8594,g,[-.3,1.3,0],4);cylinder(0,.18,.5,0x8f8594,g,[.3,1.3,0],4);for(const x of [-.16,.16])sphere(.065,0xf5c881,g,[x,.9,.37]);}
  const camp=group(scene,[WORLD.spawn.x/32,0,WORLD.spawn.y/32]);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const stone=sphere(.18,0x858b74,camp,[Math.cos(a)*.5,.12,Math.sin(a)*.5]);stone.scale.y=.6;}
  const flame=mesh(new THREE.ConeGeometry(.3,.8,6),0xffc879,camp,[0,.45,0],{emissive:0xf5893c,emissiveIntensity:1});
  const motes=[];for(let i=0;i<24;i++){const m=sphere(.035,0xdecf8c,scene,[4+(i*139%1800)/32,.6+(i%4)*.2,3+(i*181%1200)/32]);m.material=material(0xdecf8c,{emissive:0xb9aa63,emissiveIntensity:1});m.castShadow=false;motes.push(m);}

  function heroModel(kind){const g=group();const colors={guerrier:0xba956b,mage:0x9a83c2,archer:0x659b80};const c=colors[kind]||colors.guerrier;
    box(.6,.66,.35,0x596e6b,g,[0,1.05,0]);const cape=mesh(new THREE.ConeGeometry(.47,.95,4),c,g,[0,.96,-.24]);cape.rotation.y=Math.PI/4;
    sphere(.24,0xd9b79a,g,[0,1.65,0]);const hair=sphere(.25,0x383f3d,g,[0,1.77,-.035]);hair.scale.y=.65;
    for(const x of [-.085,.085])sphere(.024,0x263530,g,[x,1.67,.225]);
    const legs=[],arms=[];for(const side of [-1,1]){const leg=group(g,[side*.17,.72,0]);box(.19,.53,.22,0x364743,leg,[0,-.23,0]);box(.23,.16,.32,0x293a35,leg,[0,-.54,.06]);legs.push(leg);const arm=group(g,[side*.4,1.32,0]);box(.17,.5,.2,c,arm,[0,-.24,0]);sphere(.095,0xd9b79a,arm,[0,-.51,0]);arms.push(arm);}
    const weapon=group(arms[1],[0,-.3,.1]);
    if(kind==='mage'){cylinder(.035,.045,1.5,0xa9926d,weapon,[.08,.25,0]);mesh(new THREE.OctahedronGeometry(.17),0xc7b2f0,weapon,[.08,1.1,0],{emissive:0x715b9a,emissiveIntensity:.6});}
    else if(kind==='archer'){const bow=mesh(new THREE.TorusGeometry(.4,.035,5,12,Math.PI),0xbaaa7d,weapon,[0,0,.1]);bow.rotation.z=Math.PI/2;}
    else {box(.085,.8,.04,0xcbd4c9,weapon,[0,.15,0]);box(.33,.07,.09,0xc6ab6d,weapon,[0,-.17,0]);}
    return {group:g,legs,arms,cape};
  }
  function animalModel(kind){const g=group(),legs=[],wings=[];let tail=null;
    const c=kind==='dragon'?0xaa7656:0xc5d5cb;
    if(kind==='corbeau'){
      const body=sphere(.32,0x344355,g,[0,1.05,0]);body.scale.set(.85,1.05,1.3);sphere(.22,0x354558,g,[0,1.39,.28]);const beak=cylinder(0,.09,.3,0xd8bd77,g,[0,1.36,.53],4);beak.rotation.x=Math.PI/2;
      for(const side of [-1,1]){const wing=group(g,[side*.2,1.16,0]);const part=box(.76,.045,.4,0x485d71,wing,[side*.36,0,-.06]);part.rotation.y=side*.3;wings.push(wing);sphere(.033,0xefdaa1,g,[side*.12,1.44,.44]);}
    }else{
      const body=sphere(.4,c,g,[0,.52,0]);body.scale.set(.8,.8,1.5);sphere(.29,c,g,[0,.92,.49]);const snout=sphere(.19,kind==='dragon'?0xc59665:0xe1e7d7,g,[0,.84,.76]);snout.scale.set(.75,.7,1.25);
      for(const x of [-.23,.23])for(const z of [-.38,.36]){const leg=group(g,[x,.4,z]);box(.12,.38,.17,c,leg,[0,-.16,0]);legs.push(leg);}
      for(const x of [-.18,.18]){cylinder(0,.12,.33,kind==='dragon'?0xe8d8ac:c,g,[x,1.19,.47],3);sphere(.035,kind==='dragon'?0xf6d18a:0x9ddde4,g,[x,.99,.68]);}
      tail=group(g,[0,.65,-.59]);const tailMesh=cylinder(.035,.13,.75,c,tail,[0,.1,-.26],6);tailMesh.rotation.x=-1.15;
      if(kind==='dragon')for(const side of [-1,1]){const wing=group(g,[side*.25,.79,-.12]);const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(side*.9,.43);shape.lineTo(side*.7,-.25);shape.lineTo(0,-.08);const m=mesh(new THREE.ShapeGeometry(shape),0x856b94,wing,[0,0,0],{side:THREE.DoubleSide});m.rotation.x=-.35;wings.push(wing);}
    }
    return {group:g,legs,wings,tail,kind};
  }
  let hero=null,animal=null,kind=null,companionKind=null,host=viewport,markers=[],lastHero=null,trail=[],facing=0,wasMoving=false;
  const center=new THREE.Vector3(),projected=new THREE.Vector3(),raycaster=new THREE.Raycaster(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),intersection=new THREE.Vector3();
  const marker3d=new THREE.Mesh(new THREE.TorusGeometry(.25,.025,5,24),new THREE.MeshBasicMaterial({color:0xf2d18b}));marker3d.rotation.x=Math.PI/2;marker3d.position.y=.07;scene.add(marker3d);
  function replaceActors(profile){
    if(kind!==profile.class){if(hero)scene.remove(hero.group);hero=heroModel(profile.class);kind=profile.class;}
    if(companionKind!==profile.companion){if(animal)scene.remove(animal.group);animal=animalModel(profile.companion);companionKind=profile.companion;lastHero=null;trail=[];canvas.dataset.companion=companionKind;}
  }
  function project(x,y,z){projected.set(x,y,z).project(camera);return {x:(projected.x*.5+.5)*host.clientWidth,y:(-.5*projected.y+.5)*host.clientHeight,visible:projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<1.15&&Math.abs(projected.y)<1.15};}
  function attach(next){host=next;next.prepend(canvas);next.classList.add('has-3d');const labels=next.querySelector('#forest-scene');labels.style.transform='none';labels.querySelector('.forest-art').hidden=true;
    markers=[...labels.querySelectorAll('[data-walk]')].map(node=>{const id=node.dataset.walk;const object=id==='camp'?{...WORLD.spawn,id}:[...castles,...loreNodes,...wanderers].find(o=>o.id===id);return {node,object,height:castles.some(c=>c.id===id)?4.7:loreNodes.some(c=>c.id===id)?1.55:1.7};});
    next.querySelector('#world-companion-label')?.remove();const label=document.createElement('div');label.id='world-companion-label';label.className='companion-world-label';labels.append(label);
  }
  function render(world,profile,dt=0,now=0,target=null){
    if(!host?.isConnected||!host.clientWidth||!host.clientHeight)return;
    replaceActors(profile);const x=world.x/32,z=world.y/32,position=new THREE.Vector3(x,0,z);
    const distance=lastHero?position.distanceTo(lastHero):100,moving=distance>.001&&distance<8;
    if(distance>8){hero.group.position.copy(position);animal.group.position.set(x-.85,0,z+.7);trail=[{x,z},{x:x-.85,z:z+.7}];}
    else if(moving){facing=Math.atan2(x-lastHero.x,z-lastHero.z);trail.unshift({x,z});if(trail.length>45)trail.pop();}
    hero.group.position.copy(position);hero.group.rotation.y=facing;lastHero=position.clone();
    const gait=now*.012;hero.legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(gait+i*Math.PI)*.48:Math.sin(now*.001)*.02);hero.arms.forEach((arm,i)=>arm.rotation.x=moving?Math.sin(gait+i*Math.PI)*.24:0);hero.cape.rotation.x=Math.sin(now*.002)*.04;
    let walked=0,goal=trail.at(-1)||{x:x-.85,z:z+.7};for(let i=1;i<trail.length;i++){walked+=Math.hypot(trail[i].x-trail[i-1].x,trail[i].z-trail[i-1].z);if(walked>=1.2){goal=trail[i];break;}}
    const before=animal.group.position.clone(),alpha=1-Math.exp(-Math.max(dt,.016)*4.5);animal.group.position.lerp(new THREE.Vector3(goal.x,0,goal.z),alpha);const animalMoving=before.distanceTo(animal.group.position)>.002;
    if(animalMoving)animal.group.rotation.y=Math.atan2(animal.group.position.x-before.x,animal.group.position.z-before.z);
    animal.legs.forEach((leg,i)=>leg.rotation.x=animalMoving?Math.sin(gait*1.4+(i%2)*Math.PI)*.5:0);animal.wings.forEach((wing,i)=>wing.rotation.z=Math.sin(now*(animal.kind==='corbeau'?.009:.005))*.4*(i?-1:1));if(animal.tail)animal.tail.rotation.y=Math.sin(now*.004)*.25;
    animal.group.position.y=animal.kind==='corbeau'?Math.sin(now*.004)*.06:Math.sin(now*.003)*.015;
    flame.scale.y=1+Math.sin(now*.007)*.12;motes.forEach((m,i)=>m.position.y=.7+Math.sin(now*.0018+i)*.25);
    const width=host.clientWidth,height=host.clientHeight;if(canvas.width!==Math.round(width*renderer.getPixelRatio())||canvas.height!==Math.round(height*renderer.getPixelRatio()))renderer.setSize(width,height,false);
    const half=9,aspect=width/height;camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
    const cx=Math.max(half*aspect,Math.min(64-half*aspect,x)),cz=Math.max(10,Math.min(35,z));center.set(cx,0,cz);camera.position.set(cx,28,cz+22);camera.lookAt(center);camera.updateMatrixWorld();sun.position.set(cx+10,25,cz+10);sun.target.position.copy(center);
    for(const {node,object,height:y} of markers){const p=project(object.x/32,y,object.y/32);node.style.left=p.x+'px';node.style.top=p.y+'px';node.style.visibility=p.visible?'visible':'hidden';}
    const heroLabel=host.querySelector('#world-player'),p=project(x,2.05,z);heroLabel.style.left=p.x+'px';heroLabel.style.top=p.y+'px';
    const companionLabel=host.querySelector('#world-companion-label'),cp=project(animal.group.position.x,animal.kind==='corbeau'?1.9:1.45,animal.group.position.z);companionLabel.style.left=cp.x+'px';companionLabel.style.top=cp.y+'px';companionLabel.textContent={loup:'Loup spectral',corbeau:'Corbeau des runes',dragon:'Dragon miniature'}[profile.companion];companionLabel.dataset.x=String(animal.group.position.x*32);companionLabel.dataset.y=String(animal.group.position.z*32);
    marker3d.visible=Boolean(target);if(target)marker3d.position.set(target.x/32,.07,target.y/32);renderer.render(scene,camera);wasMoving=moving;
  }
  function screenToWorld(clientX,clientY){const rect=host.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1),camera);if(!raycaster.ray.intersectPlane(ground,intersection))return null;return {x:intersection.x*32,y:intersection.z*32};}
  attach(viewport);
  return {attach,render,screenToWorld,canvas,dispose(){renderer.dispose();renderer.forceContextLoss();scene.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());}};
}
