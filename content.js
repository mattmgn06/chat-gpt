// Contenu limité à la cheville : pages 3 à 14 du PDF fourni.
// Les formulations anatomiques suivent le cours, sans ajouter de données externes.
export const regions = [
  { id: 'surfaces', title: 'Le passage de la Mortaise', subtitle: 'Os et surfaces articulaires', pages: [3, 5], diagram: 4, monster: 'Sentinelle de pierre', color: '#b5c6a8' },
  { id: 'capsule', title: 'Le sanctuaire des Membranes', subtitle: 'Capsule et synoviale', pages: [6], diagram: 7, monster: 'Spectre des brumes', color: '#a2c6d8' },
  { id: 'medial', title: 'Le bastion du Deltoïde', subtitle: 'Ligament collatéral médial', pages: [8], diagram: 9, monster: 'Gardien du bastion', color: '#c5a6dc' },
  { id: 'lateral', title: 'Les trois Tours', subtitle: 'Ligament collatéral latéral', pages: [11], diagram: 12, monster: 'Chimère des trois Tours', color: '#d4ad7d' },
];
let count = 0;
const fact = (region, page, question, answer, aliases, distractors) => ({ id: `tc-${++count}`, region, page, question, answer, aliases, choices: [answer, ...distractors] });
export const facts = [
  fact('surfaces',3,'Quel est le nom anatomique de l’articulation de la cheville ?','Articulation talo-crurale',['talo crurale'],['Articulation subtalaire','Articulation calcanéo-cuboïdienne','Articulation cunéo-naviculaire']),
  fact('surfaces',3,'Quels sont les trois os unis par l’articulation talo-crurale ?','Tibia, fibula et talus',[['tibia','fibula','talus'],['tibia','perone','astragale']],['Talus, calcanéus et naviculaire','Tibia, patella et fémur','Fibula, cuboïde et calcanéus']),
  fact('surfaces',5,'De quel type est l’articulation talo-crurale ?','Ginglyme (trochléenne)',['ginglyme','trochleenne','trochleen'],['Sphéroïde','En selle','Ellipsoïde']),
  fact('surfaces',5,'Quelle surface du tibia participe à l’articulation talo-crurale ?','La surface inférieure',['surface inferieure','face inferieure'],['La surface supérieure','La tubérosité tibiale','Le bord antérieur']),
  fact('surfaces',5,'Quelles malléoles présentent une surface articulaire dans la cheville ?','Les malléoles médiale et latérale',[['mediale','laterale'],['interne','externe']],['La malléole médiale seulement','La malléole latérale seulement','Aucune malléole']),
  fact('surfaces',5,'Quelle partie du talus s’encastre dans la mortaise tibio-fibulaire ?','La trochlée du talus',['trochlee'],['La tête du talus','Le tubercule médial','Le processus postérieur']),
  fact('surfaces',5,'Quelles surfaces malléolaires du talus participent à la cheville ?','Les surfaces médiale et latérale',[['mediale','laterale'],['interne','externe']],['La surface antérieure seulement','La surface postérieure seulement','Les surfaces supérieure et inférieure']),
  fact('surfaces',5,'La mortaise tibio-fibulaire est-elle plus large en avant ou en arrière ?','En avant',['avant','anterieurement'],['En arrière','Elle a une largeur constante','Le cours ne le précise pas']),
  fact('surfaces',5,'De quoi sont recouvertes toutes ces surfaces articulaires ?','De cartilage',['cartilage'],['De périoste','De tissu musculaire','De tissu adipeux']),
  fact('capsule',6,'Où la capsule s’insère-t-elle habituellement ?','Près du pourtour des surfaces cartilagineuses',[['pourtour','cartilagineuses'],['bord','cartilage']],['Au milieu des surfaces articulaires','Sur les corps musculaires','Uniquement sur la fibula']),
  fact('capsule',6,'À quel endroit la capsule s’éloigne-t-elle du talus ?','En avant',['avant','anterieurement'],['En arrière','Uniquement latéralement','Uniquement médialement']),
  fact('capsule',6,'De quelle distance environ la capsule s’éloigne-t-elle du talus en avant ?','Près de 1 cm',['1 cm','un centimetre','1 centimetre','10 mm'],['Près de 1 mm','Près de 5 cm','Près de 10 cm']),
  fact('capsule',6,'Quelles sont les deux membranes de la capsule ?','Fibreuse et synoviale',[['fibreuse','synoviale']],['Musculaire et osseuse','Cartilagineuse et graisseuse','Périostée et tendineuse']),
  fact('capsule',6,'Quelle membrane est la plus proche de l’articulation ?','La membrane synoviale',['synoviale'],['La membrane fibreuse','Le périoste','Le ligament deltoïde']),
  fact('capsule',6,'Entre quels os la synoviale présente-t-elle des culs-de-sac ?','Entre le tibia et la fibula',[['tibia','fibula'],['tibia','perone']],['Entre talus et naviculaire','Entre calcanéus et cuboïde','Entre fémur et patella']),
  fact('capsule',6,'Où se trouvent les culs-de-sac décrits entre tibia et fibula ?','À l’avant et à l’arrière',[['avant','arriere'],['anterieur','posterieur']],['À l’avant seulement','À l’arrière seulement','Uniquement sous le talus']),
  fact('medial',8,'Quel est l’autre nom du ligament collatéral médial ?','Ligament deltoïde',['deltoide'],['Ligament bifurqué','Ligament en haie','Ligament plantaire long']),
  fact('medial',8,'Quelle forme présente le ligament deltoïde ?','Triangulaire',['triangulaire','triangle'],['Circulaire','En Y','Annulaire']),
  fact('medial',8,'Combien de couches possède le ligament deltoïde ?','Deux : superficielle et profonde',[['superficielle','profonde'],'deux','2'],['Une seule','Trois couches','Quatre couches']),
  fact('medial',8,'Où s’insère le sommet du ligament deltoïde ?','Sur la face médiale de la malléole médiale',[['face mediale','malleole mediale']],['Sur la face latérale de la malléole latérale','Sur la tête du talus','Sur la tubérosité du cuboïde']),
  fact('medial',8,'Quels ligaments constituent la couche superficielle du deltoïde ?','Tibio-naviculaire et tibio-calcanéen',[['tibio naviculaire','tibio calcaneen']],['Talo-tibiaux antérieur et postérieur','Talo-fibulaires antérieur et postérieur','Calcanéo-fibulaire et bifurqué']),
  fact('medial',8,'Du tibia, vers quel relief va le ligament tibio-naviculaire ?','La tubérosité naviculaire',[['tuberosite','naviculaire']],['Le col du talus','La tubérosité du cuboïde','Le tubercule latéral du talus']),
  fact('medial',8,'Sur quels éléments se fixe le ligament tibio-calcanéen ?','Le ligament calcanéo-naviculaire plantaire et le sustentaculum tali',[['calcaneo naviculaire','plantaire','sustentaculum']],['Le col du talus et le cuboïde','La trochlée et la tête du talus','La fibula et la patella']),
  fact('medial',8,'Quels ligaments constituent la couche profonde du deltoïde ?','Talo-tibiaux antérieur et postérieur',[['talo tibial','anterieur','posterieur'],['talo tibiaux','anterieur','posterieur']],['Tibio-naviculaire et tibio-calcanéen','Talo-fibulaire antérieur et calcanéo-fibulaire','Plantaire long et bifurqué']),
  fact('medial',8,'Sur quelle partie du talus s’insère le ligament talo-tibial antérieur ?','La face médiale du col du talus',[['mediale','col']],['La face latérale du col','La face supérieure de la tête','Le tubercule latéral']),
  fact('medial',8,'Sur quels éléments du talus s’insère le ligament talo-tibial postérieur ?','La face médiale du corps et le tubercule médial',[['mediale','corps','tubercule medial']],['La face latérale du col et la tête','La trochlée seulement','Le tubercule latéral seulement']),
  fact('lateral',11,'Combien de faisceaux possède le ligament collatéral latéral ?','Trois',['trois','3'],['Deux','Quatre','Un seul']),
  fact('lateral',11,'Quels sont les trois faisceaux du ligament collatéral latéral ?','Talo-fibulaire antérieur, talo-fibulaire postérieur et calcanéo-fibulaire',[['talo fibulaire','anterieur','posterieur','calcaneo fibulaire']],['Tibio-naviculaire, tibio-calcanéen et bifurqué','Plantaire long, deltoïde et interosseux','Talo-tibiaux antérieur et postérieur, tibio-naviculaire']),
  fact('lateral',11,'Comment le cours décrit-il le ligament talo-fibulaire antérieur ?','Court et large',[['court','large']],['Long et fin','Très long et étroit','En forme de Y']),
  fact('lateral',11,'D’où naît le ligament talo-fibulaire antérieur ?','Du bord antérieur de la malléole fibulaire',[['bord anterieur','malleole fibulaire'],['bord anterieur','malleole laterale']],['Du bord postérieur de la malléole médiale','Du sustentaculum tali','De la tubérosité naviculaire']),
  fact('lateral',11,'Vers quelle partie du talus se dirige le ligament talo-fibulaire antérieur ?','La face antérieure du col du talus',[['anterieure','col']],['La tête du talus','Le tubercule médial','La face supérieure de la trochlée']),
  fact('lateral',11,'Quel faisceau latéral est décrit comme très résistant ?','Le ligament talo-fibulaire postérieur',[['talo fibulaire','posterieur']],['Le ligament tibio-naviculaire','Le ligament talo-naviculaire','Le ligament bifurqué']),
  fact('lateral',11,'Quels éléments unit le ligament talo-fibulaire postérieur ?','La malléole latérale et le tubercule latéral du talus',[['malleole laterale','tubercule lateral'],['malleole fibulaire','tubercule lateral']],['La malléole médiale et le naviculaire','Le tibia et le cuboïde','Le calcanéus et le naviculaire']),
  fact('lateral',11,'Comment le cours décrit-il le ligament calcanéo-fibulaire ?','Une longue corde',[['longue','corde']],['Un triangle','Un éventail','Un anneau']),
  fact('lateral',11,'D’où part le ligament calcanéo-fibulaire ?','De la partie postérieure de la malléole fibulaire',[['posterieure','malleole fibulaire'],['posterieure','malleole laterale']],['Du bord antérieur de la malléole médiale','De la tête du talus','Du naviculaire']),
  fact('lateral',11,'Où se termine le ligament calcanéo-fibulaire ?','Sur la face latérale du calcanéus',[['laterale','calcaneus'],['laterale','calcaneum']],['Sur la face médiale du talus','Sur la face plantaire du naviculaire','Sur la face dorsale du cuboïde']),
];
export const stages = ['Apprentissage','Renforcement','Difficile','Examen'];
export const classes = {
  guerrier: { title:'Guerrier', icon:'⚔', desc:'Une armure solide. Réduit de 4 les dégâts reçus.', damage:24, defense:4, color:'#d4a76a' },
  mage: { title:'Mage', icon:'✧', desc:'Des sorts puissants. Inflige 8 dégâts supplémentaires.', damage:32, defense:0, color:'#b9a2ee' },
  archer: { title:'Archer', icon:'➶', desc:'Une frappe précise. Toutes les deux bonnes réponses, +16 dégâts.', damage:24, defense:0, color:'#8dc5ad' },
};
export const companions = { loup: { title:'Loup spectral',icon:'♧',desc:'Un allié fidèle venu des brumes.' }, corbeau: { title:'Corbeau des runes',icon:'♜',desc:'Un éclaireur à l’œil attentif.' }, dragon: { title:'Dragon miniature',icon:'♨',desc:'Une petite flamme au grand courage.' } };
