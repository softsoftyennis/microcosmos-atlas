/* An exploded composition hierarchy; positions are not measured particle locations.
   An atom is the whole system. Nucleus and electrons are its direct components.
   Electron elementary status is independent of its position in this hierarchy. */
window.RELATION_LAYERS = [
 {level:0,title:'整体 · 氦-4 原子',en:'WHOLE · HELIUM-4 ATOM',description:'一个原子核 + 2个电子',descriptionEn:'One nucleus + 2 electrons',y:4,xMin:-4.35,xMax:1.9,zMin:-1.1,zMax:1.1},
 {level:1,title:'一级组成 · 原子核与电子',en:'LEVEL 1 · NUCLEUS & ELECTRONS',description:'两者都属于同一个原子',descriptionEn:'Both belong to the same atom',y:1.65,xMin:-4.35,xMax:1.9,zMin:-1.1,zMax:1.1},
 {level:2,title:'展开原子核 · 质子与中子',en:'LEVEL 2 · PROTONS & NEUTRONS',description:'本例原子核含2颗质子和2颗中子',descriptionEn:'The nucleus contains 2 protons and 2 neutrons',y:-.6,xMin:-4.35,xMax:1.9,zMin:-1.1,zMax:1.1},
 {level:3,title:'展开核子 · 上、下价夸克',en:'LEVEL 3 · VALENCE QUARKS',description:'价夸克种类汇总；核子内还有胶子场与夸克海',descriptionEn:'Valence-quark types; nucleons also contain gluon fields and a quark sea',y:-2.85,xMin:-4.35,xMax:1.9,zMin:-1.1,zMax:1.1}
];
window.RELATION_TYPES = {
 composition:{name:'组成关系',short:'组成',color:'#83e6d3',description:'从整体展开到组成部分。数字表示本例中的数量；夸克节点代表种类，不是同一颗夸克被多个核子共用。'},
 em:{name:'电磁相互作用',short:'电磁',color:'#e6cd88',description:'光子是电磁相互作用的媒介。电子、质子和带电夸克都参与电磁相互作用；图中只选取部分联系。'},
 strong:{name:'强相互作用',short:'强作用',color:'#ec9fb1',description:'胶子与具有色荷的夸克相互作用，也能彼此相互作用。核子之间的核力是强相互作用的剩余效应。'},
 weak:{name:'弱反应关联',short:'弱反应',color:'#8eb6ec',description:'中微子可与核子通过弱相互作用发生反应。这里的连线表示反应联系，中微子不是核子的组成部分；弱力媒介 W/Z 未在此展开。'},
 higgs:{name:'希格斯场耦合',short:'希格斯场',color:'#c5a7e6',description:'电子和夸克与希格斯场的耦合关联其质量。图中借希格斯玻色子标记这个联系，不表示原子中常驻一颗希格斯玻色子。'}
};
window.RELATION_NODES = window.PARTICLES.map(p=>{
 const layout={
  atom:{position:[-1.3,4,0],radius:.58,subtitle:'整体 · 原子核 + 2e⁻',kind:'atom',level:0,role:'composition'},
  nucleus:{position:[-2.3,1.65,.1],radius:.39,subtitle:'一级组成 · 2p + 2n',kind:'nucleus',level:1,role:'composition'},
  electron:{position:[.8,1.65,.1],radius:.23,subtitle:'一级组成 · 2个电子的概率云',level:1,role:'composition'},
  proton:{position:[-3.3,-.6,.4],radius:.33,subtitle:'二级组成 · uud',level:2,role:'composition'},
  neutron:{position:[-1,-.6,-.3],radius:.33,subtitle:'二级组成 · udd',level:2,role:'composition'},
  up:{position:[-3.3,-2.85,.4],radius:.23,subtitle:'核子中的价夸克 · +⅔ e',level:3,role:'composition'},
  down:{position:[-1,-2.85,-.3],radius:.23,subtitle:'核子中的价夸克 · −⅓ e',level:3,role:'composition'},
  photon:{position:[4.25,2.25,-.8],radius:.24,subtitle:'电磁相互作用媒介',level:null,role:'interaction'},
  gluon:{position:[4.25,.05,-.8],radius:.24,subtitle:'核子内部的胶子场',level:null,role:'interaction'},
  neutrino:{position:[4.25,-2.1,.3],radius:.22,subtitle:'弱反应联系 · 非原子组成',level:null,role:'interaction'},
  higgs:{position:[4.25,-4,.3],radius:.28,subtitle:'希格斯场的量子激发',level:null,role:'interaction'}
 };
 return {id:p.id,name:p.id==='atom'?'氦原子':p.id==='nucleus'?'氦原子核':p.name,symbol:p.symbol,color:p.color,...layout[p.id]};
});
window.RELATION_EDGES = [
 {id:'atom-nucleus',from:'atom',to:'nucleus',type:'composition',label:'1个原子核',description:'本图以中性的氦-4 原子为中心：它含一个由2颗质子和2颗中子构成的原子核。原子核与电子云的尺度相差约十万倍，此处将层级展开以便阅读。'},
 {id:'atom-electron',from:'atom',to:'electron',type:'composition',label:'2个电子 · 概率云',description:'中性氦原子有2个电子，其量子态形成电子云。图中的电子节点代表这一种粒子，不是以固定轨道绕核飞行的一颗小球。'},
 {id:'nucleus-proton',from:'nucleus',to:'proton',type:'composition',label:'2颗质子',description:'氦-4 原子核含2颗质子。每颗质子带+1个基本电荷，使原子核的净电荷为+2e。一个质子节点在这里代表这类核子。'},
 {id:'nucleus-neutron',from:'nucleus',to:'neutron',type:'composition',label:'2颗中子',description:'氦-4 原子核含2颗中子。它们不带净电荷，与质子一起构成稳定的氦-4 核。图谱按粒子种类展开，并未画出每一颗粒子。'},
 {id:'proton-up',from:'proton',to:'up',type:'composition',label:'2个上价夸克',description:'每颗质子的价夸克结构是uud：2个上价夸克加1个下价夸克。此外还存在动态的胶子场与夸克—反夸克海。'},
 {id:'proton-down',from:'proton',to:'down',type:'composition',label:'1个下价夸克',description:'每颗质子含1个下价夸克。价夸克电荷相加：⅔ + ⅔ − ⅓ = +1；质子的质量却不能由这些夸克的流质量简单相加得到。'},
 {id:'neutron-up',from:'neutron',to:'up',type:'composition',label:'1个上价夸克',description:'每颗中子的价夸克结构是udd：1个上价夸克加2个下价夸克。共享的上夸克节点只是同一种类的汇总，并不是质子和中子共用某一颗夸克。'},
 {id:'neutron-down',from:'neutron',to:'down',type:'composition',label:'2个下价夸克',description:'每颗中子含2个下价夸克。⅔ − ⅓ − ⅓ = 0，所以中子的净电荷为零；中性不代表内部没有电荷分布。'},
 {id:'electron-photon',from:'electron',to:'photon',type:'em',label:'电磁相互作用',description:'电子带电，参与以光子为媒介的电磁相互作用。原子吸收或发射合适能量的光子，可以改变其电子量子态。连线不表示原子内部永久存放着一颗光子。'},
 {id:'proton-photon',from:'proton',to:'photon',type:'em',label:'带电 · 电磁作用',description:'质子带正电，电子带负电，原子束缚涉及电磁相互作用。光子是这一相互作用的量子媒介，并不是在两者间沿图中连线来回公转的小球。'},
 {id:'up-gluon',from:'up',to:'gluon',type:'strong',label:'色荷 · 强相互作用',description:'上夸克携带色荷，与胶子场相互作用。夸克与胶子被禁闭在强子中；本图把关系展开展示，并不表示可以在空间中分离这些自由粒子。'},
 {id:'down-gluon',from:'down',to:'gluon',type:'strong',label:'色荷 · 强相互作用',description:'下夸克同样携带色荷，与胶子场相互作用。胶子自身也有色荷，能够彼此相互作用。颜色和曲线是教学标记，不是真实可见颜色与轨道。'},
 {id:'nucleon-force',from:'proton',to:'neutron',type:'strong',label:'核力 · 剩余强作用',description:'原子核中核子之间的束缚涉及剩余强相互作用。不能简单理解为两个完整核子各自带色、由一根可见胶子线黏住；核力还有自旋、距离与量子态依赖。'},
 {id:'neutron-neutrino',from:'neutron',to:'neutrino',type:'weak',label:'弱反应联系 · 非组成',description:'中微子参与弱相互作用。一个相关例子是自由中子的β⁻衰变：n → p + e⁻ + ν̄e（反电子中微子）；氦-4 核内的中子不会按自由中子的方式衰变。该反应涉及的W玻色子未在这11类对象中展开。'},
 {id:'electron-higgs',from:'electron',to:'higgs',type:'higgs',label:'与希格斯场耦合',description:'电子与希格斯场的耦合关联其静止质量。这里用“希格斯玻色子”节点作为场与激发的知识入口，并不表示电子需要不断吸收希格斯玻色子才能具有质量。'},
 {id:'up-higgs',from:'up',to:'higgs',type:'higgs',label:'与希格斯场耦合',description:'上夸克的质量与其对希格斯场的耦合相关。质子和中子的大部分质量来自强相互作用的能量；不能说原子核的全部质量都由希格斯场直接赋予。'},
 {id:'down-higgs',from:'down',to:'higgs',type:'higgs',label:'与希格斯场耦合',description:'下夸克也与希格斯场耦合。希格斯玻色子是该场的量子激发，不是原子的一层壳，也不是围绕原子核运行的卫星。'}
];
