/* Continuous journeys through a helium-4 atom. Offline Canvas 2D drawing of
   rotated 3D volumes; every structure and scale is a teaching illustration. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
  const ease = t => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
  const smooth = (a,b,t) => { const u=clamp((t-a)/(b-a),0,1); return u*u*(3-2*u); };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const C = {atom:'#83e6d3',electron:'#83e6d3',nucleus:'#edb28c',proton:'#edb28c',neutron:'#a59bd9',up:'#e7bd7b',down:'#b2a4eb',gluon:'#ec9fb1',photon:'#e6cd88',neutrino:'#8eb6ec',higgs:'#c5a7e6'};
  const rgb = c => /^#[\da-f]{6}$/i.test(c) ? [1,3,5].map(i=>parseInt(c.slice(i,i+2),16)) : [131,230,211];
  const rgba = (c,a) => `rgba(${rgb(c).join(',')},${clamp(a,0,1)})`;
  const META = {
    overview:{id:'atom',title:'一颗氦原子',en:'A HELIUM-4 ATOM',note:'结构示意 · 非等比例。点击原子进入内部；点数不代表电子数量，没有固定绕核轨道。',noteEn:'Structural illustration · not to scale. Enter the atom; dots do not count electrons, and there are no fixed orbits.'},
    atom:{id:'atom',title:'在电子云之中',en:'INSIDE THE ELECTRON CLOUD',note:'结构示意 · 非等比例。2个电子形成概率云；点数非电子数，无固定轨道。中心原子核已放大。',noteEn:'Not to scale. Two electrons form a probability cloud; dots do not count electrons or mark fixed orbits. The nucleus is enlarged.'},
    nucleus:{id:'nucleus',title:'走近氦原子核',en:'INSIDE THE HELIUM-4 NUCLEUS',note:'结构示意 · 非等比例。氦-4核含2个质子 + 2个中子；球体并非静止核子。点击任一核子进入。',noteEn:'Structural illustration · not to scale. Helium-4 has two protons and two neutrons; spheres are not stationary nucleons. Enter any nucleon.'},
    proton:{id:'proton',title:'质子的内部',en:'INSIDE A PROTON · uud',note:'结构示意 · 非等比例。2上 + 1下价夸克，还有动态胶子场与夸克海。曲线非轨迹；颜色是教学标记。',noteEn:'Not to scale. Two up and one down valence quark, plus gluon fields and a quark sea. Curves are not trajectories; colours are teaching cues.'},
    neutron:{id:'neutron',title:'中子的内部',en:'INSIDE A NEUTRON · udd',note:'结构示意 · 非等比例。1上 + 2下价夸克，还有动态胶子场与夸克海。曲线非轨迹；基本粒子不再拆分。',noteEn:'Not to scale. One up and two down valence quarks, plus gluon fields and a quark sea. Curves are not trajectories; elementary particles are not subdivided.'},
    photon:{id:'photon',title:'一束光的量子',en:'PHOTON · A QUANTUM OF LIGHT',note:'独立知识入口：光子是电磁场的量子。波形表示场振幅，不是飞行路径。',noteEn:'A separate knowledge view: a photon is a quantum of the electromagnetic field. Waves illustrate amplitude, not a flight path.'},
    neutrino:{id:'neutrino',title:'与物质擦肩而过',en:'NEUTRINO · THROUGH MATTER',note:'独立知识入口：中微子参与弱相互作用，不是这颗原子的常驻组成。',noteEn:'A separate knowledge view: neutrinos interact weakly and are not resident constituents of this atom.'},
    higgs:{id:'higgs',title:'场的一次激发',en:'HIGGS · A FIELD EXCITATION',note:'独立知识入口：希格斯玻色子是场的短暂激发，不是原子的常驻组成。',noteEn:'A separate knowledge view: a Higgs boson is a short-lived field excitation, not a resident constituent of an atom.'}
  };
  const POS = [[-.38,.25,.30],[.33,.24,-.29],[.28,-.33,.26],[-.29,-.31,-.28]];
  function item(uid,particleId,pos,radius,zh,en,extra={}) {return {uid,particleId,pos,radius,zh,en,...extra};}
  const NUCLEONS = [
    item('proton-1','proton',POS[0],.365,'质子 01','Proton 01',{symbol:'p⁺',gate:'proton'}),
    item('neutron-1','neutron',POS[1],.365,'中子 01','Neutron 01',{symbol:'n⁰',gate:'neutron'}),
    item('proton-2','proton',POS[2],.365,'质子 02','Proton 02',{symbol:'p⁺',gate:'proton'}),
    item('neutron-2','neutron',POS[3],.365,'中子 02','Neutron 02',{symbol:'n⁰',gate:'neutron'})
  ];
  function objects(key) {
    if (key==='overview') return [item('helium-atom','atom',[0,0,0],1.19,'氦-4原子','Helium-4 atom',{symbol:'He',gate:'atom',labelPos:[0,-1.15,0]})];
    if (key==='atom') return [
      item('helium-nucleus','nucleus',[0,0,0],.245,'原子核 · 已放大','Nucleus · enlarged',{symbol:'⁴He',gate:'nucleus',labelPos:[0,-.32,0]}),
      item('two-electron-cloud','electron',[.95,.46,.10],.33,'电子概率云 · 2e⁻','Electron cloud · 2e⁻',{symbol:'e⁻',labelPos:[.88,.68,.20],field:true})
    ];
    if (key==='nucleus') return NUCLEONS;
    if (key==='proton'||key==='neutron') {
      const ids=key==='proton'?['up','up','down']:['up','down','down'];
      return ids.map((id,i)=>item(`${key}-${id}-${i+1}`,id,[[-.66,.23,.24],[.55,.29,-.27],[.02,-.55,.12]][i],.14,
        `${id==='up'?'上':'下'}夸克 ${i+1}`,`${id==='up'?'Up':'Down'} quark ${i+1}`,{symbol:id==='up'?'u':'d'}))
        .concat(item(`${key}-gluon-field`,'gluon',[.74,-.53,.26],.19,'动态胶子场','Dynamic gluon field',{symbol:'g',field:true}));
    }
    return [item(`${key}-quantum`,key,[0,0,0],.34,{photon:'光子',neutrino:'中微子',higgs:'希格斯玻色子'}[key],{photon:'Photon',neutrino:'Neutrino',higgs:'Higgs boson'}[key],{symbol:{photon:'γ',neutrino:'ν',higgs:'H⁰'}[key],labelPos:[0,-.64,0]})];
  }
  function installStyle() {
    if(document.getElementById('micro-explorer-3d-style'))return;
    const s=document.createElement('style');s.id='micro-explorer-3d-style';
    s.textContent=`
      .me3d-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;isolation:isolate}
      .me3d-overlay[data-transitioning=true]{visibility:hidden;pointer-events:none}
      .me3d-node{position:absolute;left:0;top:0;display:flex;align-items:center;gap:8px;pointer-events:auto;min-height:36px;padding:7px 10px;border:1px solid color-mix(in srgb,var(--me-color) 24%,transparent);border-radius:8px;background:rgba(7,18,27,.83);color:#d8e7e9;box-shadow:0 6px 24px #02091055;font:11px/1.2 inherit;white-space:nowrap;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;will-change:transform;transition:background .2s,border-color .2s,box-shadow .2s}
      .me3d-node .me3d-symbol{font:italic 20px/1 Georgia,serif;color:var(--me-color);min-width:19px;text-align:center}
      .me3d-node .me3d-name{font-size:11px;font-weight:500;letter-spacing:.025em}
      .me3d-node .me3d-arrow{font-size:12px;color:var(--me-color);margin-left:3px}
      .me3d-node:hover,.me3d-node:focus-visible{background:#142d38;border-color:var(--me-color);color:#f2ffff;outline:2px solid #83e6d344;outline-offset:3px;z-index:100!important}
      .me3d-node[aria-pressed=true]{border-color:var(--me-color);box-shadow:0 0 20px #83e6d31a;background:#102b32e8}
      .me3d-gate{border-color:color-mix(in srgb,var(--me-color) 40%,transparent)}
      @media(max-width:600px){.me3d-node{min-height:33px;padding:6px 8px;gap:6px}.me3d-node .me3d-name{font-size:10px}.me3d-node .me3d-symbol{font-size:18px;min-width:16px}}
      @media(prefers-reduced-motion:reduce){.me3d-node{transition:none}}
    `;
    document.head.appendChild(s);
  }
  function mount({canvas,overlay,onSelect=()=>{},onSceneChange=()=>{}}) {
    if(!canvas||!overlay)throw new Error('MicroExplorer3D requires canvas and overlay');
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D is unavailable');
    installStyle();overlay.classList.add('me3d-overlay');overlay.dataset.noI18n='true';
    const oldTouch=canvas.style.touchAction;canvas.style.touchAction='none';
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let alive=true,W=0,H=0,dpr=1,raf=0,last=0,time=0,dirty=true;
    let key='overview',selected='atom',selectedUid='helium-atom',playing=!media.matches,amount=.8;
    let yaw=-.27,pitch=.16,zoom=1,targetZoom=1,focusPoint=[0,0,0],focusGoal=[0,0,0];
    let transition=null,autopauseUntil=0,hitObjects=[],activeObjects=objects(key),labelEls=new Map();
    let sequence=0,gesture=null,moved=false,hoverUid='',lastNotifyZoom=1;
    const pointers=new Map(),off=[];
    const atmosphere=window.ParticleAtmosphere?.create({seed:261020});
    let seed=983721;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
    const normal=()=>Math.sqrt(-2*Math.log(Math.max(.000001,random())))*Math.cos(TAU*random());
    // Isotropic samples of a smooth 1s-like probability density; not trajectories.
    const cloud=Array.from({length:4600},()=>{
      const r=Math.min(2.3,-Math.log(Math.max(.000001,random()*random()*random()))/3.8),u=random()*2-1,a=random()*TAU;
      return {p:[r*Math.sqrt(1-u*u)*Math.cos(a),r*u,r*Math.sqrt(1-u*u)*Math.sin(a)],a:.2+random()*.8,r:.5+random()*.9,phase:random()*TAU};
    });
    const shell=Array.from({length:950},()=>{
      const u=random()*2-1,a=random()*TAU,r=.82+random()*.38;
      return {p:[r*Math.sqrt(1-u*u)*Math.cos(a),r*u,r*Math.sqrt(1-u*u)*Math.sin(a)],a:.1+random()*.5,phase:random()*TAU};
    });
    const sea=Array.from({length:220},()=>({p:[normal()*.42,normal()*.42,normal()*.42],a:random(),phase:random()*TAU}));
    const stars=Array.from({length:110},()=>({x:random(),y:random(),a:.12+random()*.45,r:.3+random()*.6,phase:random()*TAU}));
    const sprites=new Map();
    function sprite(color) {
      if(sprites.has(color))return sprites.get(color);
      const c=document.createElement('canvas');c.width=c.height=128;const s=c.getContext('2d');
      const g=s.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,rgba(color,.9));g.addColorStop(.12,rgba(color,.45));g.addColorStop(.4,rgba(color,.11));g.addColorStop(1,rgba(color,0));s.fillStyle=g;s.fillRect(0,0,128,128);sprites.set(color,c);return c;
    }
    function color(id){return window.PARTICLES?.find(p=>p.id===id)?.color||C[id]||C.atom;}
    function english(){return window.I18n?.language==='en';}
    function loc(zh,en){return english()?en:zh;}
    function primary(scene=key){return META[scene]?.id||'atom';}
    function nextScene(scene=key){return {overview:'atom',atom:'nucleus',nucleus:'proton'}[scene]||null;}
    function parent(scene=key){return {atom:'overview',nucleus:'atom',proton:'nucleus',neutron:'nucleus',photon:'overview',neutrino:'overview',higgs:'overview'}[scene]||null;}
    function canEnter(){const chosen=activeObjects.find(o=>o.uid===selectedUid);return chosen?!!chosen.gate:selected===primary()&&!!nextScene();}
    function getState(){
      const m=META[key],pathKeys=['overview'];
      if(['atom','nucleus','proton','neutron'].includes(key))pathKeys.push('atom');
      if(['nucleus','proton','neutron'].includes(key))pathKeys.push('nucleus');
      if(['proton','neutron','photon','neutrino','higgs'].includes(key))pathKeys.push(key);
      return {key,selectedId:selected,canBack:!!parent(),canEnter:canEnter(),primaryId:m.id,
        path:pathKeys.map(k=>({key:k,id:META[k].id,title:META[k].title,en:META[k].en})),title:m.title,titleEn:m.en,note:m.note,noteEn:m.noteEn,zoom:targetZoom,transitioning:!!transition};
    }
    function notify(){if(alive)onSceneChange(getState());}
    function selectOnly(id,uid,callback=false){
      if(!C[id])return;selected=id;selectedUid=uid||activeObjects.find(o=>o.particleId===id)?.uid||'';
      for(const [u,b]of labelEls)b.setAttribute('aria-pressed',String(u===selectedUid));
      dirty=true;if(callback)onSelect(id);notify();
    }
    function buildLabels(){
      overlay.replaceChildren();labelEls.clear();overlay.dataset.scene=key;
      activeObjects=objects(key);
      for(const o of activeObjects){
        const b=document.createElement('button');b.type='button';b.className='me3d-node'+(o.gate?' me3d-gate':'');b.dataset.uid=o.uid;b.dataset.particle=o.particleId;
        if(o.gate)b.dataset.enter=o.gate;
        b.style.setProperty('--me-color',color(o.particleId));
        const label=loc(o.zh,o.en),action=o.gate?loc('点击进入内部','Enter inside'):loc('查看粒子详情','View particle details');
        b.setAttribute('aria-label',`${label} · ${action}`);b.title=action;b.setAttribute('aria-pressed',String(o.uid===selectedUid));
        b.innerHTML=`<span class="me3d-symbol" aria-hidden="true">${esc(o.symbol||'·')}</span><span class="me3d-name">${esc(label)}</span><span class="me3d-arrow" aria-hidden="true">${o.gate?'↘':'＋'}</span>`;
        b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();activate(o);});
        labelEls.set(o.uid,b);overlay.appendChild(b);
      }
      dirty=true;
    }
    function camera(custom={}) {
      return {yaw,pitch,zoom,focus:focusPoint,...custom};
    }
    function project(pos,cam=camera()) {
      const p=pos.map((v,i)=>v-cam.focus[i]),co=Math.cos(cam.yaw),si=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
      const x=p[0]*co+p[2]*si,z=-p[0]*si+p[2]*co,y=p[1]*cp-z*sp,zz=p[1]*sp+z*cp;
      const perspective=4.6/Math.max(.45,4.6-zz),top=Math.min(160,H*.245),bottom=Math.min(145,H*.22);
      const S=Math.min(W*.31,Math.max(135,(H-top-bottom)*.50));
      return {x:W*.5+x*perspective*S*cam.zoom,y:top+(H-top-bottom)*.51-y*perspective*S*cam.zoom,z:zz,persp:perspective,scale:S*cam.zoom};
    }
    function glow(p,r,c,a=1){if(!Number.isFinite(r)||r<=0)return;ctx.save();ctx.globalAlpha*=a;ctx.drawImage(sprite(c),p.x-r,p.y-r,r*2,r*2);ctx.restore();}
    function sphere(pos,r,c,cam,{alpha=1,symbol='',uid='',soft=false}={}) {
      const p=project(pos,cam),R=r*p.scale*p.persp;if(R<.2)return p;
      ctx.save();ctx.globalAlpha*=alpha;glow(p,R*(soft?3.1:2.5),c,soft?.35:.36);
      const g=ctx.createRadialGradient(p.x-R*.33,p.y-R*.36,R*.02,p.x,p.y,R);
      g.addColorStop(0,rgba('#f4fdff',soft?.5:.94));g.addColorStop(.1,rgba(c,soft?.65:.98));g.addColorStop(.55,rgba(c,soft?.24:.6));g.addColorStop(1,rgba(c,soft?.015:.12));
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,R,0,TAU);ctx.fill();
      ctx.strokeStyle=rgba(c,soft?.13:.48);ctx.lineWidth=.9;ctx.stroke();
      if(!soft){ctx.beginPath();ctx.ellipse(p.x-R*.26,p.y-R*.27,R*.16,R*.09,-.7,0,TAU);ctx.fillStyle='#ffffff65';ctx.fill();}
      if(symbol&&R>16){ctx.fillStyle=rgba('#fff7f0',.9);ctx.font=`italic ${clamp(R*.67,12,32)}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(symbol,p.x,p.y+R*.04);}
      if(uid&&(selectedUid===uid||hoverUid===uid)){
        ctx.strokeStyle=rgba(c,.8);ctx.lineWidth=1;ctx.setLineDash([2,5]);ctx.beginPath();ctx.arc(p.x,p.y,R+7,0,TAU);ctx.stroke();ctx.setLineDash([]);
        for(let i=0;i<4;i++){const a=i*TAU/4+.3;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*(R+12),p.y+Math.sin(a)*(R+12));ctx.lineTo(p.x+Math.cos(a)*(R+17),p.y+Math.sin(a)*(R+17));ctx.stroke();}
      }
      ctx.restore();return {...p,r:R};
    }
    function drawCloud(cam,radius=1,c=C.atom,alpha=1,{inside=false}={}) {
      const p=project([0,0,0],cam),R=radius*p.scale;
      ctx.save();ctx.globalAlpha*=alpha;const inheritedAlpha=ctx.globalAlpha;ctx.globalCompositeOperation='screen';
      glow(p,R*1.9,c,inside?.24:.30);glow(project([-.25,.22,-.3],cam),R*1.2,'#7b9de1',.12);
      const bins=Array.from({length:9},()=>[]),step=W<560?2:1;
      for(let i=0;i<cloud.length;i+=step){
        const q=cloud[i],s=1+Math.sin(time*.32+q.phase)*.012,pt=q.p.map(v=>v*radius*s),v=project(pt,cam);
        if(v.x<-5||v.y<-5||v.x>W+5||v.y>H+5)continue;
        const a=q.a*(inside?.42:.6)*(v.z>0?1:.6),j=clamp(Math.floor(a*9),0,8);
        bins[j].push(v.x,v.y,q.r*Math.sqrt(v.persp)*(inside?1.04:.92));
      }
      ctx.fillStyle=c;
      for(let j=0;j<bins.length;j++){ctx.globalAlpha=inheritedAlpha*(j+.7)/9;const a=bins[j];for(let k=0;k<a.length;k+=3)ctx.fillRect(a[k],a[k+1],a[k+2],a[k+2]);}
      ctx.restore();
    }
    function drawCluster(cam,scale=1,interactive=false) {
      const cluster=NUCLEONS.map(o=>({...o,pos:o.pos.map(v=>v*scale),radius:o.radius*scale}));
      // Every constituent has its own 3D coordinate, and depth sorting changes on rotation.
      cluster.sort((a,b)=>project(a.pos,cam).z-project(b.pos,cam).z);
      for(const o of cluster)sphere(o.pos,o.radius,color(o.particleId),cam,{symbol:scale>.5?o.symbol:'',uid:interactive?o.uid:'',alpha:1});
    }
    function drawField(cam,kind) {
      const quarks=objects(kind).filter(o=>!o.field),pairs=[[0,1],[1,2],[2,0]],paths=[];
      for(let strand=0;strand<27;strand++){
        const pair=pairs[strand%3],a=quarks[pair[0]].pos,b=quarks[pair[1]].pos,phase=strand*1.77,pts=[];
        for(let j=0;j<=36;j++){
          const t=j/36,envelope=Math.sin(t*Math.PI),wave=t*TAU*(1.25+strand%3*.35)+time*(.42+(strand%4)*.08)+phase;
          const pos=mix(a,b,t);pos[0]+=Math.sin(wave)*envelope*(.10+(strand%4)*.038);pos[1]+=Math.cos(wave*.89+phase)*envelope*.23;pos[2]+=Math.sin(wave*.76+phase)*envelope*.39;
          pts.push(project(pos,cam));
        }
        paths.push({pts,z:pts.reduce((a,p)=>a+p.z,0)/pts.length,c:strand%4===0?'#e9c78e':strand%3===0?'#8ed9d1':C.gluon,a:strand%3===0?.42:.20});
      }
      paths.sort((a,b)=>a.z-b.z);
      ctx.save();const inheritedAlpha=ctx.globalAlpha;ctx.globalCompositeOperation='screen';
      for(const path of paths){ctx.beginPath();path.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=rgba(path.c,path.a);ctx.lineWidth=.7;ctx.stroke();}
      for(let i=0;i<sea.length;i++){
        const q=sea[i],p=project(q.p,cam);ctx.globalAlpha=inheritedAlpha*(.11+q.a*.22);ctx.fillStyle=i%3===0?C.gluon:'#9cdbdf';const rr=.7+Math.sin(time*.44+q.phase)*.25;ctx.fillRect(p.x,p.y,rr,rr);
      }
      ctx.restore();
      // Gluon field has a selectable region, not a fixed inventory of glue particles.
      const anchor=project([.74,-.53,.26],cam);glow(anchor,31,C.gluon,selected==='gluon'?.65:.25);
    }
    function drawNucleonShell(cam) {
      const bins=[[],[],[]];
      for(let i=0;i<shell.length;i++){
        const q=shell[i],p=project(q.p,cam),j=i%3;bins[j].push(p.x,p.y,p.persp*(.5+(i%5)*.13));
      }
      ctx.save();const inheritedAlpha=ctx.globalAlpha;ctx.globalCompositeOperation='screen';
      [C.gluon,'#8cbfdf',C.nucleus].forEach((c,j)=>{ctx.fillStyle=c;ctx.globalAlpha=inheritedAlpha*.18;const b=bins[j];for(let i=0;i<b.length;i+=3)ctx.fillRect(b[i],b[i+1],b[i+2],b[i+2]);});
      glow(project([0,0,0],cam),project([0,0,0],cam).scale*1.8,C.gluon,.16);ctx.restore();
    }
    function drawGeneric(scene,cam) {
      const col=color(scene),center=project([0,0,0],cam);
      glow(center,center.scale*1.65,col,.25);
      if(scene==='photon'){
        // Orthogonal field amplitudes in 3D; these are not a photon trajectory.
        ctx.save();ctx.globalCompositeOperation='screen';
        for(let band=0;band<2;band++){
          const pts=[];for(let i=0;i<=160;i++){const x=(i/160-.5)*2.45,envelope=Math.exp(-x*x*.8),v=Math.sin(x*TAU*1.5-time*1.35)*.34*envelope;pts.push(project(band?[x,0,v]:[x,v,0],cam));}
          ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineWidth=band?1:1.8;ctx.strokeStyle=rgba(band?'#8bd5dd':col,band?.5:.85);ctx.stroke();
          for(let i=0;i<pts.length;i+=8){const a=project([(i/160-.5)*2.45,0,0],cam),b=pts[i];ctx.strokeStyle=rgba(col,.13);ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
        }
        ctx.restore();glow(center,45,col,.65);
      }else if(scene==='neutrino'){
        for(let i=0;i<70;i++){const q=sea[i],p=project([q.p[0]*1.8,q.p[1]*1.8,q.p[2]*1.8],cam);glow(p,1.5+i%3,'#8eb6ec',.2);}
        sphere([0,0,0],.13,col,cam,{soft:true});
        for(let i=0;i<3;i++){const a=i*TAU/3+time*.09,p=project([Math.cos(a)*.47,Math.sin(a)*.47,Math.sin(a*2)*.27],cam);glow(p,20,col,.18);}
      }else{
        // A spherical scalar-field disturbance; no physical scale is implied.
        ctx.save();ctx.globalCompositeOperation='screen';
        for(let band=0;band<13;band++){
          const y=(band/12-.5)*1.7,rr=Math.sqrt(Math.max(.001,1-y*y));ctx.beginPath();
          for(let j=0;j<=90;j++){const a=j/90*TAU,r=rr*(1+Math.sin(a*3+time*.5+band*.4)*.04),p=project([r*Math.cos(a),y,r*Math.sin(a)],cam);j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);}ctx.strokeStyle=rgba(col,.12+Math.sin(band/12*Math.PI)*.17);ctx.lineWidth=.8;ctx.stroke();
        }
        ctx.restore();sphere([0,0,0],.17,col,cam,{soft:true});
      }
    }
    function drawScene(scene,cam,alpha=1) {
      if(alpha<=.001)return;ctx.save();ctx.globalAlpha=alpha;
      if(scene==='overview'){
        drawCloud(cam,1,C.atom,1);glow(project([0,0,0],cam),17,C.nucleus,.8);drawCluster(cam,.055);
      }else if(scene==='atom'){
        drawCloud(cam,1.72,C.atom,.73,{inside:true});drawCluster(cam,.26);
        const p=project([0,0,0],cam);glow(p,62,C.nucleus,.25);
      }else if(scene==='nucleus'){
        glow(project([0,0,0],cam),project([0,0,0],cam).scale*1.6,C.nucleus,.15);drawCluster(cam,1,true);
      }else if(scene==='proton'||scene==='neutron'){
        drawNucleonShell(cam);drawField(cam,scene);
        const q=objects(scene).filter(o=>!o.field).sort((a,b)=>project(a.pos,cam).z-project(b.pos,cam).z);
        for(const o of q)sphere(o.pos,o.radius,color(o.particleId),cam,{symbol:o.symbol,uid:o.uid});
      }else drawGeneric(scene,cam);
      ctx.restore();
    }
    function background(){
      ctx.clearRect(0,0,W,H);
      const g=ctx.createRadialGradient(W*.52,H*.52,0,W*.5,H*.5,Math.max(W,H)*.68);g.addColorStop(0,'#0b1a2b');g.addColorStop(.5,'#07111f');g.addColorStop(1,'#040b15');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      if(atmosphere)atmosphere.draw(ctx,{W,H,time,yaw,pitch,zoom:1,center:[0,0,-.6],bound:1.65,amount:amount*.8,project:p=>project(p,camera({zoom:1,focus:[0,0,0]}))});
      else {ctx.fillStyle='#b6d8df';for(const s of stars){ctx.globalAlpha=s.a*amount;ctx.fillRect(s.x*W,s.y*H,s.r,s.r);}ctx.globalAlpha=1;}
      // A dark vignette retains readable corners while the central volume stays luminous.
      const shade=ctx.createRadialGradient(W*.5,H*.52,Math.min(W,H)*.25,W*.5,H*.52,Math.max(W,H)*.7);shade.addColorStop(0,'#02071100');shade.addColorStop(1,'#02071180');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
    }
    function labelLayout(){
      hitObjects=[];const placed=[],mobile=W<560,top=Math.min(162,H*.247),bottom=H-Math.min(150,H*.23),pad=mobile?12:18;
      const ordered=[...activeObjects].sort((a,b)=>!!b.gate-!!a.gate);
      for(const o of ordered){
        const b=labelEls.get(o.uid),p=project(o.pos),lp=project(o.labelPos||o.pos),r=o.radius*p.scale*p.persp;
        hitObjects.push({...p,r:Math.max(o.field?25:18,r),o});
        const w=b.offsetWidth||112,h=b.offsetHeight||35;
        const candidates=o.labelPos?[[lp.x-w/2,lp.y+12],[lp.x-w/2,lp.y-h-12]]:[[p.x+r+13,p.y-h/2],[p.x-r-w-13,p.y-h/2],[p.x-w/2,p.y+r+15],[p.x-w/2,p.y-r-h-14]];
        let best=null,bestScore=Infinity;
        for(let k=0;k<candidates.length;k++){
          const [xx,yy]=candidates[k],q={x:clamp(xx,pad,Math.max(pad,W-w-pad)),y:clamp(yy,top,Math.max(top,bottom-h)),w,h};
          let score=k*12+Math.hypot(q.x-xx,q.y-yy)*2;
          for(const v of placed){const area=Math.max(0,Math.min(q.x+w,v.x+v.w)-Math.max(q.x,v.x))*Math.max(0,Math.min(q.y+h,v.y+v.h)-Math.max(q.y,v.y));score+=area*12;}
          if(score<bestScore){bestScore=score;best=q;}
        }
        // Four labels remain separate on narrow screens even while their 3D nodes cross.
        if(bestScore>400&&ordered.length>2){
          for(let col=0;col<2;col++)for(let row=0;row<5;row++){
            const q={x:col?W-w-pad:pad,y:top+row*(h+9),w,h};if(q.y+h>bottom)continue;
            let score=80+Math.hypot(q.x+w/2-p.x,q.y+h/2-p.y)*.35;
            for(const v of placed)score+=Math.max(0,Math.min(q.x+w,v.x+v.w)-Math.max(q.x,v.x))*Math.max(0,Math.min(q.y+h,v.y+v.h)-Math.max(q.y,v.y))*12;
            if(score<bestScore){bestScore=score;best=q;}
          }
        }
        placed.push(best);b.style.transform=`translate(${best.x.toFixed(1)}px,${best.y.toFixed(1)}px)`;b.style.zIndex=String(20+Math.round(p.z*5)+(o.uid===selectedUid?10:0));
        b.style.opacity=p.z<-.2?'.86':'1';
        const ex=clamp(p.x,best.x,best.x+w),ey=clamp(p.y,best.y,best.y+h),distance=Math.hypot(ex-p.x,ey-p.y);
        if(distance>Math.min(r+8,40)){
          const dx=(ex-p.x)/distance,dy=(ey-p.y)/distance,start=Math.min(r*.8,25);
          ctx.beginPath();ctx.moveTo(p.x+dx*start,p.y+dy*start);ctx.lineTo(ex,ey);ctx.strokeStyle=rgba(color(o.particleId),.28);ctx.lineWidth=.7;ctx.stroke();
          ctx.fillStyle=rgba(color(o.particleId),.6);ctx.beginPath();ctx.arc(p.x+dx*start,p.y+dy*start,1.5,0,TAU);ctx.fill();
        }
      }
      hitObjects.sort((a,b)=>b.z-a.z);
    }
    function render(now){
      if(!W||!H)return;background();
      if(transition){
        const tr=transition,t=clamp((now-tr.start)/tr.duration,0,1),e=ease(t),forward=tr.forward;
        if(forward){
          const sourceCam={...tr.fromCam,focus:mix(tr.fromCam.focus,tr.anchor,e),zoom:tr.fromCam.zoom*Math.pow(7,e)};
          const destCam=camera({zoom:lerp(.19,1,e),focus:[0,0,0]});
          drawScene(tr.from,sourceCam,1-smooth(.28,.80,t));drawScene(tr.to,destCam,smooth(.18,.72,t));
        }else{
          const sourceCam={...tr.fromCam,zoom:tr.fromCam.zoom*lerp(1,.18,e)};
          const destCam=camera({focus:mix(tr.anchor,[0,0,0],e),zoom:lerp(5,1,e)});
          drawScene(tr.to,destCam,smooth(.08,.70,t));drawScene(tr.from,sourceCam,1-smooth(.18,.82,t));
        }
        if(t>=1){finishTransition(tr);labelLayout();}
      }else{drawScene(key,camera());labelLayout();}
      dirty=false;
    }
    function frame(now){
      if(!alive)return;raf=requestAnimationFrame(frame);const dt=last?Math.min(.045,(now-last)/1000):.016;last=now;if(document.hidden)return;
      let moving=false;
      if(playing&&!media.matches){time+=dt;moving=true;if(!transition&&!pointers.size&&now>autopauseUntil)yaw+=dt*.045;}
      if(Math.abs(zoom-targetZoom)>.0001){zoom=lerp(zoom,targetZoom,Math.min(1,dt*10));moving=true;}
      if(focusPoint.some((v,i)=>Math.abs(v-focusGoal[i])>.0001)){focusPoint=mix(focusPoint,focusGoal,Math.min(1,dt*7));moving=true;}
      if(dirty||moving||transition)render(now);
    }
    function finishTransition(tr){
      if(transition!==tr)return;transition=null;zoom=targetZoom=1;focusPoint=focusGoal=[0,0,0];overlay.dataset.transitioning='false';canvas.dataset.transitioning='false';buildLabels();notify();dirty=true;
    }
    function navigate(next,{animate=true,selectId=null,anchor=null,emit=true,forward=null}={}){
      if(!META[next]||!alive)return false;
      if(transition)return false;
      if(next===key){if(selectId)selectOnly(selectId,null,emit);return true;}
      const prev=key,fromCam=camera({focus:[...focusPoint]}),toObj=activeObjects.find(o=>o.gate===next);
      const destination=anchor||toObj?.pos||[0,0,0];
      const incoming=parent(prev)===next?false:forward===null?true:forward;
      key=next;activeObjects=objects(key);selected=selectId||primary(next);selectedUid=activeObjects.find(o=>o.particleId===selected)?.uid||'';
      sequence++;hitObjects=[];hoverUid='';pointers.clear();gesture=null;autopauseUntil=performance.now()+1800;
      canvas.dataset.scene=key;
      if(animate&&!media.matches){
        transition={id:sequence,from:prev,to:next,fromCam,anchor:destination,start:performance.now(),duration:900,forward:incoming};
        overlay.dataset.transitioning='true';canvas.dataset.transitioning='true';
      }else{zoom=targetZoom=1;focusPoint=focusGoal=[0,0,0];buildLabels();}
      if(emit)onSelect(selected);notify();dirty=true;return true;
    }
    function activate(o){
      if(transition)return;
      if(o.gate)navigate(o.gate,{anchor:o.pos});else selectOnly(o.particleId,o.uid,true);
    }
    function reveal(id,options={}){
      if(!C[id])return;
      let scene={atom:'overview',nucleus:'atom',electron:'atom',proton:'nucleus',neutron:'nucleus',photon:'photon',neutrino:'neutrino',higgs:'higgs'}[id];
      if(['up','down','gluon'].includes(id))scene=['proton','neutron'].includes(key)?key:'proton';
      if(transition){transition=null;overlay.dataset.transitioning='false';canvas.dataset.transitioning='false';zoom=targetZoom=1;focusPoint=focusGoal=[0,0,0];buildLabels();}
      if(scene!==key)navigate(scene,{...options,selectId:id,emit:false});else selectOnly(id,null,false);
      return getState();
    }
    function enter(){
      if(transition||!canEnter())return false;
      const chosen=activeObjects.find(o=>o.uid===selectedUid&&o.gate)||activeObjects.find(o=>o.gate);
      return chosen?navigate(chosen.gate,{anchor:chosen.pos}):false;
    }
    function back(){
      if(transition||!parent())return false;
      const previous=key,next=parent();
      // Reverse the same visual portal: a particular nucleon appears inside its nucleus.
      const anchor=objects(next).find(o=>o.gate===previous)?.pos||[0,0,0];
      return navigate(next,{anchor,forward:false});
    }
    function goToScene(scene,options={}){return navigate(scene,options);}
    function reset(){
      if(transition){transition=null;overlay.dataset.transitioning='false';canvas.dataset.transitioning='false';}
      yaw=-.27;pitch=.16;focusPoint=focusGoal=[0,0,0];zoom=targetZoom=1;
      if(key!=='overview')navigate('overview',{animate:false});else{selected='atom';selectedUid='helium-atom';buildLabels();notify();}
    }
    function focus(id){
      if(transition)return;
      const o=activeObjects.find(o=>o.uid===id)||activeObjects.find(o=>o.particleId===id);
      if(!o)return;selectOnly(o.particleId,o.uid,false);focusGoal=o.pos.map(v=>v*.28);targetZoom=Math.max(targetZoom,1.18);autopauseUntil=performance.now()+6000;dirty=true;notify();
    }
    function setSelected(id){selectOnly(id,null,false);}
    function setPlaying(value){playing=!!value;dirty=true;}
    function setAtmosphere(value){amount=clamp(Number(value)||0,0,1);canvas.dataset.atmosphere=String(amount);dirty=true;}
    function setZoom(value){targetZoom=clamp(Number(value)||1,.62,2.5);autopauseUntil=performance.now()+4000;dirty=true;if(Math.abs(targetZoom-lastNotifyZoom)>.015){lastNotifyZoom=targetZoom;notify();}}
    function resize(){
      const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;W=r.width;H=r.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true;
    }
    function listen(el,event,fn,options){el.addEventListener(event,fn,options);off.push(()=>el.removeEventListener(event,fn,options));}
    function xy(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
    function hit(p){
      const direct=hitObjects.find(q=>Math.hypot(q.x-p.x,q.y-p.y)<q.r);if(direct)return direct;
      // The luminous volume itself is selectable, not only its small label anchor.
      if(key==='atom'||key==='proton'||key==='neutron'){
        const center=project([0,0,0]),radius=center.scale*(key==='atom'?1.75:1.08);
        if(Math.hypot(p.x-center.x,p.y-center.y)<radius)return hitObjects.find(q=>q.o.field);
      }
      return null;
    }
    function gestureStart(){
      const ps=[...pointers.values()];gesture=ps.length>1?{type:'pinch',dist:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),zoom:targetZoom}:ps.length?{type:'rotate',...ps[0],yaw,pitch}:null;
    }
    listen(canvas,'pointerdown',e=>{
      if(transition||e.button>0)return;e.preventDefault();canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,xy(e));moved=false;gestureStart();autopauseUntil=performance.now()+5000;canvas.style.cursor='grabbing';
    });
    listen(canvas,'pointermove',e=>{
      const p=xy(e);if(transition)return;
      if(!pointers.has(e.pointerId)){const h=hit(p);if(hoverUid!==(h?.o.uid||'')){hoverUid=h?.o.uid||'';canvas.style.cursor=h?'pointer':'grab';dirty=true;}return;}
      pointers.set(e.pointerId,p);const ps=[...pointers.values()];if(!gesture)return;
      if(ps.length>1&&gesture.type==='pinch'){const dist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);setZoom(gesture.zoom*dist/Math.max(1,gesture.dist));moved=true;}
      else if(gesture.type==='rotate'){
        const dx=p.x-gesture.x,dy=p.y-gesture.y;if(Math.hypot(dx,dy)>5)moved=true;
        if(moved){yaw=gesture.yaw+dx*.006;pitch=clamp(gesture.pitch+dy*.005,-1.12,1.12);dirty=true;}
      }
    });
    function pointerEnd(e){
      if(!pointers.has(e.pointerId))return;const wasMulti=pointers.size>1,p=xy(e);pointers.delete(e.pointerId);
      if(e.type==='pointerup'&&!moved&&!wasMulti&&!transition){const h=hit(p);if(h)activate(h.o);}
      if(pointers.size)gestureStart();else gesture=null;canvas.style.cursor='grab';dirty=true;
    }
    listen(canvas,'pointerup',pointerEnd);listen(canvas,'pointercancel',pointerEnd);
    listen(canvas,'wheel',e=>{if(transition)return;e.preventDefault();setZoom(targetZoom*Math.exp(-e.deltaY*.0012));},{passive:false});
    listen(window,'resize',resize);
    listen(window,'microcosmos:language',()=>{buildLabels();notify();});
    listen(window,'microcosmos:labels',()=>{dirty=true;});
    listen(document,'visibilitychange',()=>{last=0;dirty=true;});
    const reducedChanged=()=>{if(media.matches){playing=false;if(transition)finishTransition(transition);}dirty=true;};
    if(media.addEventListener)listen(media,'change',reducedChanged);
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(canvas);
    canvas.style.cursor='grab';canvas.dataset.scene=key;canvas.dataset.atmosphere=String(amount);overlay.dataset.transitioning='false';canvas.dataset.transitioning='false';
    resize();buildLabels();raf=requestAnimationFrame(frame);notify();
    return {reveal,goToScene,enter,back,reset,focus,setSelected,setPlaying,setAtmosphere,setZoom,resize,getState,
      destroy(){alive=false;cancelAnimationFrame(raf);off.forEach(f=>f());observer?.disconnect();atmosphere?.destroy();sprites.forEach(c=>{c.width=c.height=1;});sprites.clear();overlay.replaceChildren();overlay.classList.remove('me3d-overlay');delete overlay.dataset.noI18n;delete overlay.dataset.transitioning;delete overlay.dataset.scene;canvas.style.touchAction=oldTouch;canvas.style.cursor='';}
    };
  }
  window.MicroExplorer3D={mount};
})();
