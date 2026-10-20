(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const COLORS = {composition:'#8ccab8', em:'#e8c97f', strong:'#e6a1bc', weak:'#8fb8ee', higgs:'#baa1e7'};
  const TYPE_NAMES = {composition:'组成关系',em:'电磁相互作用',strong:'强相互作用',weak:'弱反应关联',higgs:'希格斯场耦合'};
  const TYPE_NAMES_EN = {composition:'Composition',em:'Electromagnetic interaction',strong:'Strong interaction',weak:'Weak reaction',higgs:'Higgs field coupling'};
  const LEVEL_TITLES = ['原子整体','原子结构','核子','价夸克'];
  const LEVEL_TITLES_EN = ['Whole atom','Nucleus + e⁻','Nucleons','Quarks'];
  const english = () => window.I18n?.language === 'en';
  const bilingual = (zh,en) => english() ? en : zh;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rgb = c => { if (/^#[\da-f]{3}$/i.test(c)) c='#'+[...c.slice(1)].map(x=>x+x).join(''); return /^#[\da-f]{6}$/i.test(c) ? [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)] : [131,230,211]; };
  const rgba = (c,a) => `rgba(${rgb(c).join(',')},${clamp(a,0,1)})`;
  const mix = (a,b,t) => a.map((v,i)=>v+(b[i]-v)*t);
  function installStyle(){
    if(document.getElementById('relation-atlas-3d-style'))return;
    const s=document.createElement('style');s.id='relation-atlas-3d-style';s.textContent=`
      .ra3d-overlay{position:absolute;inset:0;overflow:hidden;pointer-events:none;isolation:isolate}
      .ra3d-overlay .ra3d-node,.ra3d-overlay .ra3d-edge{position:absolute;left:0;top:0;pointer-events:auto;box-sizing:border-box;border:1px solid transparent;cursor:pointer;font-family:inherit;white-space:nowrap;will-change:transform;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:background .2s,border-color .2s,opacity .2s;color:#cfdfdf}
      .ra3d-overlay .ra3d-node{display:flex;align-items:center;gap:7px;min-height:32px;padding:4px 8px;border-radius:7px;background:rgba(8,14,20,.84);font-size:12px;line-height:1.25;box-shadow:0 2px 12px #080e1480}
      .ra3d-overlay .ra3d-node .ra3d-symbol{font:italic 19px Georgia,serif;color:var(--node-color);min-width:17px;text-align:center}
      .ra3d-overlay .ra3d-node .ra3d-title{font-weight:550;letter-spacing:.06em}
      .ra3d-overlay .ra3d-node .ra3d-dot{width:4px;height:4px;border-radius:50%;background:var(--node-color);margin-left:1px;opacity:.65}
      .ra3d-overlay .ra3d-node:hover,.ra3d-overlay .ra3d-node:focus-visible{border-color:var(--node-color);background:#12252b;opacity:1!important;outline:2px solid #83e6d344;outline-offset:2px;z-index:100!important}
      .ra3d-overlay .ra3d-node[aria-pressed=true]{background:rgba(26,48,48,.94);border-color:var(--node-color);color:#f1f8f5}
      .ra3d-overlay .ra3d-edge{min-height:28px;max-width:168px;padding:3px 7px;border-radius:4px;font-size:10px;line-height:1.4;letter-spacing:.025em;background:rgba(8,14,20,.9);color:var(--edge-color);border-color:rgba(127,166,170,.13)}
      .ra3d-overlay .ra3d-edge:hover,.ra3d-overlay .ra3d-edge:focus-visible{background:#203138;border-color:var(--edge-color);outline:1px solid var(--edge-color);z-index:99!important}
      .ra3d-overlay .ra3d-edge[hidden]{display:none}
      @media(max-width:600px){.ra3d-overlay .ra3d-node{min-height:29px;font-size:11px;padding:3px 6px;gap:4px}.ra3d-overlay .ra3d-node .ra3d-symbol{font-size:17px;min-width:15px}.ra3d-overlay .ra3d-edge{font-size:9px;padding:3px 5px;max-width:132px}}
    `;document.head.appendChild(s);
  }
  function mount({canvas,overlay,onSelect=()=>{},onEdgeSelect=()=>{},onCameraChange=()=>{},nodes=[],edges=[]}){
    if(!canvas||!overlay)throw new Error('RelationAtlas3D requires canvas and overlay');
    installStyle();
    const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('Canvas 2D is unavailable');
    overlay.classList.add('ra3d-overlay');
    const oldTouchAction=canvas.style.touchAction; canvas.style.touchAction='none';
    const levels={atom:0,nucleus:1,electron:1,proton:2,neutron:2,up:3,down:3};
    const items=nodes.map((n,i)=>({...n,position:(n.position||[0,0,0]).map(Number),color:n.color||'#83e6d3',role:n.role||(n.id in levels?'composition':'interaction'),level:n.level??levels[n.id],index:i}));
    const byId=new Map(items.map(n=>[n.id,n]));
    const links=edges.filter(e=>byId.has(e.from)&&byId.has(e.to)).map((e,i)=>({...e,id:e.id||`relation-${i}`,index:i,type:e.type||'composition'}));
    const layers=(window.RELATION_LAYERS||[0,1,2,3].map(level=>({level,y:items.find(n=>n.level===level)?.position[1]||0}))).map(layer=>({xMin:-4.35,xMax:1.9,zMin:-1.1,zMax:1.1,...layer}));
    const fieldArea={xMin:3.08,xMax:5.58,yMin:-4.72,yMax:3.32,z:-1.18};
    const stagePoints=[...items.map(n=>n.position),...layers.flatMap(l=>[[l.xMin,l.y,l.zMin],[l.xMax,l.y,l.zMin],[l.xMax,l.y,l.zMax],[l.xMin,l.y,l.zMax]]),[fieldArea.xMin,fieldArea.yMax,fieldArea.z],[fieldArea.xMax,fieldArea.yMin,fieldArea.z]];
    const center=items.length?[0,1,2].map(i=>items.reduce((a,n)=>a+n.position[i],0)/items.length):[0,0,0];
    const bound=Math.max(1,...items.map(n=>Math.hypot(...n.position.map((v,i)=>v-center[i]))));
    const initialYaw=.12,initialPitch=-.23;
    let yaw=initialYaw,pitch=initialPitch,zoom=1,target=[...center],goalTarget=[...center];
    let W=0,H=0,dpr=1,selected='',focusId='',filter='all',playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    let alive=true,raf=0,last=0,time=0,autopauseUntil=0,dirty=true,proj=new Map(),edgePaths=[],stageLabels=[];
    let fitting={scale:1,cx:0,cy:0},fitInitialized=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const pointers=new Map();let gesture=null,lastTap={id:'',at:0},dragged=false;
    let rndSeed=72119; const random=()=>{rndSeed=(rndSeed*16807)%2147483647;return(rndSeed-1)/2147483646;};
    const stars=Array.from({length:95},()=>({x:random(),y:random(),a:random(),r:random()}));
    const atmosphere=window.ParticleAtmosphere?.create({seed:72119});
    let atmosphereAmount=.8;
    canvas.dataset.atmosphere='0.8';
    const nodeDust=new Map(items.map(n=>{
      const count=n.id==='atom'?1100:n.id==='nucleus'?350:['proton','neutron'].includes(n.id)?280:160;
      const bins=Array.from({length:5},()=>[]);
      for(let i=0;i<count;i++){
        const radial=Math.min(2.5,-Math.log(Math.max(1e-8,random()*random()))/2.3),u=random()*2-1,phi=random()*TAU;
        const shell=Math.sqrt(1-u*u)*radial;
        const q={x:shell*Math.cos(phi),y:radial*u,z:shell*Math.sin(phi),size:.4+random()*.65,phase:random()*TAU};
        bins[Math.floor(random()*5)].push(q);
      }
      return[n.id,{bins,palette:bins.map((_,i)=>rgba(n.color,.16+i*.12))}];
    }));
    const atomCloud=Array.from({length:220},()=>{const rr=Math.min(1.9,-Math.log(Math.max(1e-6,random()*random()))/3),u=random()*2-1,a=random()*TAU;return{x:rr*Math.sqrt(1-u*u)*Math.cos(a),y:rr*u,z:rr*Math.sqrt(1-u*u)*Math.sin(a),a:.2+random()*.7};});
    overlay.replaceChildren();
    const nodeEls=new Map(),edgeEls=new Map();
    items.forEach(n=>{
      const b=document.createElement('button');b.type='button';b.className='ra3d-node';b.dataset.node=n.id;b.style.setProperty('--node-color',n.color);b.setAttribute('aria-label',`${n.name}，${n.subtitle||bilingual('查看性质与关系','Explore properties and relationships')}；${bilingual('双击聚焦','Double-click to focus')}`);b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="ra3d-symbol">${esc(n.symbol||'·')}</span><span class="ra3d-title">${esc(n.name)}</span><span class="ra3d-dot" aria-hidden="true"></span>`;
      b.addEventListener('click',e=>{e.stopPropagation();choose(n.id);const at=performance.now();if(lastTap.id===n.id&&at-lastTap.at<360)focus(n.id);lastTap={id:n.id,at};});
      b.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();focus(n.id);});
      b.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.shiftKey){e.preventDefault();focus(n.id);}});
      nodeEls.set(n.id,b);overlay.appendChild(b);
    });
    links.forEach(e=>{
      const b=document.createElement('button');b.type='button';b.className='ra3d-edge';b.dataset.edge=e.id;b.style.setProperty('--edge-color',COLORS[e.type]||COLORS.composition);b.textContent=e.label||bilingual(TYPE_NAMES[e.type],TYPE_NAMES_EN[e.type]);b.setAttribute('aria-label',`${byId.get(e.from).name} → ${byId.get(e.to).name}：${e.label||bilingual(TYPE_NAMES[e.type],TYPE_NAMES_EN[e.type])}。${bilingual('查看关系解释','Explore this relationship')}`);b.title=e.description||e.label||'';b.hidden=true;b.onclick=evt=>{evt.stopPropagation();onEdgeSelect(e);};edgeEls.set(e.id,b);overlay.appendChild(b);
    });
    function updateAccessibility(){
      const translate=value=>window.I18n?.t(value)||value;
      items.forEach(n=>{nodeEls.get(n.id).setAttribute('aria-label',bilingual(`${n.name}，${n.subtitle||'查看性质与关系'}；双击聚焦`,`${translate(n.name)}. ${translate(n.subtitle||'Explore properties and relationships')}. Double-click to focus.`));});
      links.forEach(e=>{const from=translate(byId.get(e.from).name),to=translate(byId.get(e.to).name),label=translate(e.label||bilingual(TYPE_NAMES[e.type],TYPE_NAMES_EN[e.type]));edgeEls.get(e.id).setAttribute('aria-label',bilingual(`${from} → ${to}：${label}。查看关系解释`,`${from} → ${to}: ${label}. Explore this relationship.`));});
      dirty=true;
    }
    function cameraChanged(){onCameraChange({yaw,pitch,zoom,target:[...target],dragging:pointers.size>0});}
    function choose(id){setSelected(id);onSelect(id);}
    function setSelected(id){selected=byId.has(id)?id:'';for(const[n,b]of nodeEls)b.setAttribute('aria-pressed',String(n===selected));dirty=true;}
    function setFilter(type){filter=type||'all';dirty=true;}
    function focus(id){const n=byId.get(id);if(!n)return;goalTarget=[...n.position];focusId=id;zoom=Math.max(zoom,1.16);autopauseUntil=performance.now()+8000;dirty=true;cameraChanged();}
    function reset(){focusId='';yaw=initialYaw;pitch=initialPitch;zoom=1;goalTarget=[...center];target=[...center];fitInitialized=false;autopauseUntil=performance.now()+1500;dirty=true;cameraChanged();}
    function setZoom(z){zoom=clamp(Number(z)||1,.6,1.8);dirty=true;cameraChanged();}
    function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;W=r.width;H=r.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);fitInitialized=false;dirty=true;}
    function rotate(pos){const p=pos.map((v,i)=>v-target[i]);if(W<500){p[0]*=.75;p[1]*=1.35;p[2]*=.75;}const co=Math.cos(yaw),si=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p[0]*co+p[2]*si,z=-p[0]*si+p[2]*co;return{x,y:p[1]*cp-z*sp,z:p[1]*sp+z*cp};}
    function projection(pos){const p=rotate(pos),persp=bound*4.6/(bound*4.6-p.z);return{x:p.x*persp,y:-p.y*persp,z:p.z,persp};}
    function point(pos){const p=projection(pos);return{x:fitting.cx+p.x*fitting.scale*zoom,y:fitting.cy+p.y*fitting.scale*zoom,z:p.z,persp:p.persp};}
    function updateProjection(){
      const mobile=W<500,top=Math.min(150,H*.23),bottom=Math.min(105,H*.16),left=mobile?42:58,right=left;
      const raw=stagePoints.map(pos=>projection(pos));
      const minX=Math.min(...raw.map(p=>p.x)),maxX=Math.max(...raw.map(p=>p.x)),minY=Math.min(...raw.map(p=>p.y)),maxY=Math.max(...raw.map(p=>p.y));
      const padding=mobile?35:40,availableH=Math.max(170,H-top-bottom-padding*2);
      const scale=Math.min(Math.max(120,W-left-right-34)/Math.max(maxX-minX,bound*.1),availableH/Math.max(maxY-minY,bound*.1));
      const fit={scale,cx:W/2-(focusId?0:(minX+maxX)*.5*scale*zoom),cy:top+padding+availableH/2-(focusId?0:(minY+maxY)*.5*scale*zoom)};
      if(!fitInitialized){fitting=fit;fitInitialized=true;}else{for(const k of ['scale','cx','cy'])fitting[k]+=(fit[k]-fitting[k])*.14;}
      proj.clear();items.forEach(n=>{const p=point(n.position);let natural=Number(n.radius)||bound*.045;if(natural>bound*.5)natural=bound*.045;const radius=clamp(natural*fitting.scale*p.persp*Math.sqrt(zoom),n.id==='atom'?(mobile?18:23):(mobile?9:11),n.id==='atom'?mobile?28:35:mobile?18:24);proj.set(n.id,{...p,r:radius});});
    }
    const rectOverlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    function layoutLabels(){
      const placed=stageLabels.map(r=>({...r})),pad=7,top=Math.min(144,H*.22),bottom=H-Math.min(95,H*.15),mobile=W<500;
      const nearby=new Set([selected]);links.forEach(e=>{if(e.from===selected)nearby.add(e.to);if(e.to===selected)nearby.add(e.from);});
      // Stable placement order avoids labels jumping as objects pass in depth.
      items.forEach(n=>{
        const b=nodeEls.get(n.id),p=proj.get(n.id),w=b.offsetWidth||80,h=b.offsetHeight||30;
        const gap=p.r+5,candidates=[[-w/2,gap],[-w/2,-gap-h],[gap,-h/2],[-gap-w,-h/2],[-w*.85,gap+7],[-w*.15,-gap-h-7],[gap+7,gap],[-gap-w-7,-gap-h]];
        let best=null,score=Infinity;
        candidates.forEach(([dx,dy],i)=>{
          const r={x:clamp(p.x+dx,pad,W-w-pad),y:clamp(p.y+dy,top,bottom-h),w,h};
          let s=i*10+Math.hypot(r.x-(p.x+dx),r.y-(p.y+dy))*6;
          placed.forEach(q=>s+=rectOverlap(r,q)*16);
          proj.forEach((q,id)=>{if(id!==n.id)s+=rectOverlap(r,{x:q.x-q.r-4,y:q.y-q.r-4,w:q.r*2+8,h:q.r*2+8})*4;});
          if(s<score){score=s;best=r;}
        });
        // Extend the search if a dense view needs more room, particularly on phones.
        if(score>800){for(let ring=1;ring<=3;ring++){for(let k=0;k<12;k++){const a=k*TAU/12,rr=gap+ring*22;const r={x:clamp(p.x+Math.cos(a)*rr-w/2,pad,W-w-pad),y:clamp(p.y+Math.sin(a)*rr-h/2,top,bottom-h),w,h};let s=70+ring*20+Math.hypot(r.x+w/2-p.x,r.y+h/2-p.y)*.2;placed.forEach(q=>s+=rectOverlap(r,q)*16);proj.forEach((q,id)=>{if(id!==n.id)s+=rectOverlap(r,{x:q.x-q.r-4,y:q.y-q.r-4,w:q.r*2+8,h:q.r*2+8})*4;});if(s<score){score=s;best=r;}}}}
        placed.push({...best,id:n.id});b.style.transform=`translate(${best.x.toFixed(1)}px,${best.y.toFixed(1)}px)`;b.style.zIndex=String(30+Math.round((p.z/bound+1)*10)+(n.id===selected?25:0));
        const matches=filter==='all'||links.some(e=>e.type===filter&&(e.from===n.id||e.to===n.id));b.style.opacity=String(n.id===selected?1:!matches?.55:selected&&!nearby.has(n.id)?.8:.92);
        // A fine leader links displaced labels to the exact 3D node.
        const ex=clamp(p.x,best.x,best.x+best.w),ey=clamp(p.y,best.y,best.y+best.h);if(Math.hypot(ex-p.x,ey-p.y)>p.r+6){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(ex,ey);ctx.strokeStyle=rgba(n.color,.2);ctx.lineWidth=.7;ctx.stroke();}
      });
      // Small screens prioritise a few composition labels; every relationship
      // line stays visible and hit-testable, and a type filter reveals its labels.
      const labelPriority={composition:0,strong:1,em:2,weak:3,higgs:4};
      const visibleLinks=filter!=='all'?links.filter(e=>e.type===filter):links.filter(e=>selected&&(e.from===selected||e.to===selected)).sort((a,b)=>labelPriority[a.type]-labelPriority[b.type]||a.index-b.index).slice(0,mobile?3:Infinity);
      const visibleEdgeIds=new Set(visibleLinks.map(e=>e.id));
      links.forEach(e=>{
        const b=edgeEls.get(e.id),path=edgePaths.find(x=>x.edge.id===e.id);
        const show=!!path&&visibleEdgeIds.has(e.id);
        b.hidden=!show;if(!show)return;
        const p=path.points[Math.floor(path.points.length/2)],w=b.offsetWidth||95,h=b.offsetHeight||28;
        let pos={x:clamp(p.x-w/2,7,W-w-7),y:clamp(p.y-h/2,top,bottom-h),w,h};
        const candidates=[0,-30,30,-53,53];let best=pos,bestScore=Infinity;
        candidates.forEach(dy=>{const r={...pos,y:clamp(pos.y+dy,top,bottom-h)};let s=Math.abs(dy);placed.forEach(q=>s+=rectOverlap(r,q)*20);if(s<bestScore){bestScore=s;best=r;}});
        placed.push(best);b.style.transform=`translate(${best.x.toFixed(1)}px,${best.y.toFixed(1)}px)`;b.style.zIndex='22';
      });
    }
    function glow(x,y,r,color,alpha){if(r<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(color,alpha));g.addColorStop(.35,rgba(color,alpha*.32));g.addColorStop(1,rgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();}
    function background(){ctx.clearRect(0,0,W,H);const g=ctx.createRadialGradient(W*.5,H*.55,10,W*.5,H*.55,Math.max(W,H)*.7);g.addColorStop(0,'#0b1427');g.addColorStop(1,'#050b15');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      if(atmosphere){atmosphere.draw(ctx,{W,H,time,yaw,pitch,zoom,center,bound,project:point,amount:atmosphereAmount});return;}
      stars.forEach(s=>{ctx.fillStyle=`rgba(156,193,196,${s.a*.3})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,.25+s.r*.65,0,TAU);ctx.fill();});
      // A restrained, perspective reference plane communicates depth without orbital paths.
      const floor=Math.min(...items.map(n=>n.position[1]))-bound*.18;ctx.strokeStyle='rgba(105,168,160,.045)';ctx.lineWidth=.6;
      for(let i=-4;i<=4;i++){const p1=point([center[0]+i*bound/4,floor,center[2]-bound]),p2=point([center[0]+i*bound/4,floor,center[2]+bound]);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();const q1=point([center[0]-bound,floor,center[2]+i*bound/4]),q2=point([center[0]+bound,floor,center[2]+i*bound/4]);ctx.beginPath();ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);ctx.stroke();}
    }
    function polygon(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
    function roundedRect(x,y,w,h,r=5){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
    function stageLabel(text,x,y,{color='#8ccab8',small=false,secondary=''}={}){
      const mobile=W<500,size=small?(mobile?8:9):(mobile?9:11),h=secondary?(mobile?33:38):(mobile?20:23);
      ctx.font=`${small?400:550} ${size}px system-ui,sans-serif`;
      const width=Math.max(ctx.measureText(text).width,secondary?ctx.measureText(secondary).width:0)+16;
      const rect={x:clamp(x,7,Math.max(7,W-width-7)),y:clamp(y,Math.min(145,H*.22),H-Math.min(98,H*.15)-h),w:width,h};
      roundedRect(rect.x,rect.y,width,h,4);ctx.fillStyle='rgba(6,17,25,.94)';ctx.fill();ctx.strokeStyle=rgba(color,.32);ctx.lineWidth=.7;ctx.stroke();
      ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle=rgba(color,.95);ctx.fillText(text,rect.x+8,rect.y+(secondary?11:h/2));
      if(secondary){ctx.font=`${mobile?8:9}px system-ui,sans-serif`;ctx.fillStyle='rgba(155,179,189,.85)';ctx.fillText(secondary,rect.x+8,rect.y+(mobile?25:28));}
      stageLabels.push(rect);
    }
    function drawHierarchy(){
      stageLabels=[];ctx.save();
      // These translucent shelves are conceptual levels. Their perspective,
      // together with the directed links, shows whole-to-part containment.
      const ordered=[...layers].sort((a,b)=>point([0,a.y,0]).z-point([0,b.y,0]).z);
      ordered.forEach(layer=>{
        const color=['#8ccab8','#8dc6cb','#afa7d7','#d1ab7e'][layer.level]||'#8ccab8';
        const corners=[[layer.xMin,layer.y,layer.zMin],[layer.xMax,layer.y,layer.zMin],[layer.xMax,layer.y,layer.zMax],[layer.xMin,layer.y,layer.zMax]].map(point);
        const active=items.some(n=>n.level===layer.level&&n.id===selected);
        polygon(corners);ctx.fillStyle=rgba(color,active?.105:.05);ctx.fill();ctx.strokeStyle=rgba(color,active?.48:.26);ctx.lineWidth=active?1.15:.8;ctx.stroke();
        // A short depth grid makes the plane legible even at a shallow angle.
        ctx.strokeStyle=rgba(color,.10);ctx.lineWidth=.6;
        for(let i=1;i<5;i++){const x=layer.xMin+(layer.xMax-layer.xMin)*i/5,a=point([x,layer.y,layer.zMin]),b=point([x,layer.y,layer.zMax]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
        const front=corners[3],end=corners[2];ctx.strokeStyle=rgba(color,.48);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(front.x,front.y);ctx.lineTo(end.x,end.y);ctx.stroke();
        const shortLabel=bilingual(LEVEL_TITLES[layer.level],LEVEL_TITLES_EN[layer.level]);
        let label=W<500?shortLabel:bilingual(layer.title||LEVEL_TITLES[layer.level],layer.en||LEVEL_TITLES_EN[layer.level]);
        ctx.font=`550 ${W<500?9:11}px system-ui,sans-serif`;
        if(ctx.measureText(`${layer.level} · ${label}`).width+32>front.x)label=shortLabel;
        const caption=`${layer.level} · ${label}`;
        // Keep level headings to the left of their shelf, leaving the
        // constituents and their clickable names unobstructed.
        stageLabel(caption,front.x-ctx.measureText(caption).width-25,front.y-10,{color});
      });
      // The field column is a separate knowledge region, not another level
      // of material constituents or a claim about physical location.
      const a=fieldArea,corners=[[a.xMin,a.yMax,a.z],[a.xMax,a.yMax,a.z],[a.xMax,a.yMin,a.z],[a.xMin,a.yMin,a.z]].map(point);
      polygon(corners);ctx.fillStyle='rgba(151,145,188,.035)';ctx.fill();ctx.strokeStyle='rgba(163,164,195,.24)';ctx.lineWidth=.8;ctx.setLineDash([4,6]);ctx.stroke();ctx.setLineDash([]);
      const anchor=point([(a.xMin+a.xMax)/2,a.yMax,a.z]);
      const heading=bilingual('相互作用与场','Interactions & fields'),caption=bilingual('概念关联 · 非额外组成层','Conceptual links');
      ctx.font=`550 ${W<500?9:11}px system-ui,sans-serif`;
      const titleWidth=ctx.measureText(heading).width+16;
      stageLabel(heading,anchor.x-titleWidth/2,anchor.y-40,{color:'#b3b2d1',secondary:caption});
      ctx.restore();
    }
    function drawNodeDust(n,p,r){
      if(atmosphereAmount<=0)return;
      const dust=nodeDust.get(n.id),mobile=W<500;
      const angle=yaw+time*.025,co=Math.cos(angle),si=Math.sin(angle),cp=Math.cos(pitch),sp=Math.sin(pitch);
      const spread=r*(n.id==='atom'?1.65:1.42),step=mobile?2:1;
      ctx.save();ctx.globalCompositeOperation='lighter';
      dust.bins.forEach((bin,j)=>{
        ctx.fillStyle=dust.palette[j];ctx.globalAlpha=atmosphereAmount*(.76+.24*Math.sin(time*.45+j+n.index));
        for(let i=0;i<bin.length;i+=step){const q=bin[i],x=q.x*co+q.z*si,z=-q.x*si+q.z*co,y=q.y*cp-z*sp;
          const perspective=1+z*.045,xx=p.x+x*spread*perspective,yy=p.y+y*spread*perspective,size=q.size*(n.id==='atom'?1.15:.8);
          ctx.fillRect(xx,yy,size,size);
        }
      });ctx.restore();
    }
    function trimLine(points,start,end){
      const distances=[0];for(let i=1;i<points.length;i++)distances.push(distances[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
      const length=distances[distances.length-1];if(length<start+end+8)return points;
      const at=d=>{let i=1;while(i<distances.length-1&&distances[i]<d)i++;const t=(d-distances[i-1])/(distances[i]-distances[i-1]||1),a=points[i-1],b=points[i];return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};};
      return[at(start),...points.filter((p,i)=>distances[i]>start&&distances[i]<length-end),at(length-end)];
    }
    function prepareEdges(){edgePaths=links.map(e=>{const a=byId.get(e.from).position,b=byId.get(e.to).position;const length=Math.hypot(...b.map((v,i)=>v-a[i]));const middle=mix(a,b,.5);middle[2]+=e.type==='composition'?bound*.01:Math.sin(e.index*1.9)*Math.min(length*.15,bound*.13);let points=[];for(let i=0;i<=36;i++){const t=i/36,pt=a.map((v,k)=>(1-t)*(1-t)*v+2*(1-t)*t*middle[k]+t*t*b[k]);points.push(point(pt));}if(e.type==='composition')points=trimLine(points,proj.get(e.from).r*(e.from==='atom'?1.45:1)+5,proj.get(e.to).r+7);return{edge:e,points,z:points.reduce((a,p)=>a+p.z,0)/points.length};});}
    function edgeAlpha(e){const connected=e.from===selected||e.to===selected;return filter!=='all'?(e.type===filter?.92:.08):selected?(connected?.96:e.type==='composition'?.42:.17):e.type==='composition'?.9:.43;}
    function drawEdge(path){const e=path.edge,color=COLORS[e.type]||COLORS.composition,alpha=edgeAlpha(e),pts=path.points,active=e.from===selected||e.to===selected;ctx.save();ctx.strokeStyle=rgba(color,alpha);ctx.lineWidth=(e.type==='composition'?(active?2.6:1.8):(active?1.7:1))*(filter==='all'||e.type===filter?1:.8);if(e.type==='weak')ctx.setLineDash([3,6]);else if(e.type==='higgs')ctx.setLineDash([1,5]);else if(e.type==='em')ctx.setLineDash([6,4]);else if(e.type==='strong')ctx.setLineDash([3,2]);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
      if(e.type==='composition'){const a=pts[pts.length-2],b=pts[pts.length-1],ang=Math.atan2(b.y-a.y,b.x-a.x),sz=active?10:8;ctx.fillStyle=rgba(color,alpha);ctx.strokeStyle='rgba(6,17,25,.8)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-Math.cos(ang-.44)*sz,b.y-Math.sin(ang-.44)*sz);ctx.lineTo(b.x-Math.cos(ang+.44)*sz,b.y-Math.sin(ang+.44)*sz);ctx.closePath();ctx.stroke();ctx.fill();}
      // One slow pulse signals a conceptual link, not a measured particle trajectory.
      if(playing&&alpha>.4){const t=(time*.12+e.index*.173)%1,p=pts[Math.round(t*(pts.length-1))];glow(p.x,p.y,4,color,alpha*.5);}
      ctx.restore();
    }
    function drawNode(n){const p=proj.get(n.id),c=n.color,r=p.r;const matches=filter==='all'||links.some(e=>e.type===filter&&(e.from===n.id||e.to===n.id));const related=!selected||n.id===selected||links.some(e=>(e.from===n.id&&e.to===selected)||(e.to===n.id&&e.from===selected));const a=!matches?.55:related?1:.8;ctx.save();ctx.globalAlpha=a;drawNodeDust(n,p,r);glow(p.x,p.y,r*3.5,c,n.id===selected?.34:.22);
      if(n.id==='atom'||n.kind==='atom'){
        const yawCloud=yaw+time*.06;atomCloud.forEach(q=>{const x=q.x*Math.cos(yawCloud)+q.z*Math.sin(yawCloud),z=-q.x*Math.sin(yawCloud)+q.z*Math.cos(yawCloud),persp=1+z*.06;ctx.fillStyle=rgba(c,q.a*.65);ctx.beginPath();ctx.arc(p.x+x*r*1.2*persp,p.y+q.y*r*1.2*persp,.45+q.a*.45,0,TAU);ctx.fill();});
        // The enclosing corners mark an entire atom as the root concept,
        // rather than another small ball beside its constituent nucleus.
        const rw=r*1.6,rh=r*1.25,corner=r*.37;ctx.strokeStyle=rgba(c,.68);ctx.lineWidth=1.25;
        for(const sx of[-1,1])for(const sy of[-1,1]){ctx.beginPath();ctx.moveTo(p.x+sx*(rw-corner),p.y+sy*rh);ctx.lineTo(p.x+sx*rw,p.y+sy*rh);ctx.lineTo(p.x+sx*rw,p.y+sy*(rh-corner));ctx.stroke();}
        ctx.font=`${W<500?16:20}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=rgba('#e7f6e9',.94);ctx.fillText('⁴He',p.x,p.y);
      }
      else{const g=ctx.createRadialGradient(p.x-r*.35,p.y-r*.4,r*.02,p.x,p.y,r);g.addColorStop(0,rgba('#ffffff',.84));g.addColorStop(.15,rgba(c,.92));g.addColorStop(.62,rgba(c,.36));g.addColorStop(1,rgba(c,.07));ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.strokeStyle=rgba(c,.55);ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.arc(p.x-r*.35,p.y-r*.4,r*.16,0,TAU);ctx.fillStyle=rgba('#ffffff',.5);ctx.fill();
        if(n.id==='nucleus'){[-.45,.4].forEach((x,i)=>{glow(p.x+x*r,p.y+(i?-.1:.2)*r,r*.48,i?'#b6a1e1':'#efb28a',.65);});}
        if(n.id==='proton'||n.id==='neutron'){
          ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,r*.83,0,TAU);ctx.clip();ctx.strokeStyle=rgba(COLORS.strong,.63);ctx.lineWidth=.8;
          for(let j=0;j<3;j++){ctx.beginPath();for(let k=0;k<=24;k++){const u=k/24,x=p.x+(u-.5)*r*1.75,y=p.y+Math.sin(u*TAU*1.5+j*1.7+time*.6)*r*.31+(j-1)*r*.18;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}ctx.restore();
        }
        if(n.id==='photon'||n.id==='gluon'){ctx.beginPath();for(let i=0;i<=30;i++){const x=(i/30-.5)*r*2.6,y=Math.sin(i/30*TAU*2+time*1.4)*r*.22*Math.sin(i/30*Math.PI);i?ctx.lineTo(p.x+x,p.y+y):ctx.moveTo(p.x+x,p.y+y);}ctx.strokeStyle=rgba(c,.8);ctx.lineWidth=1;ctx.stroke();}
      }
      if(n.id===selected){ctx.strokeStyle=rgba(c,.75);ctx.lineWidth=1;ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(p.x,p.y,r+6,0,TAU);ctx.stroke();ctx.setLineDash([]);const len=4;for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(p.x+Math.cos(a)*(r+9),p.y+Math.sin(a)*(r+9));ctx.lineTo(p.x+Math.cos(a)*(r+9+len),p.y+Math.sin(a)*(r+9+len));ctx.stroke();}}
      ctx.restore();
    }
    function render(){if(!W||!H)return;updateProjection();background();drawHierarchy();prepareEdges();const objects=[...edgePaths.map(e=>({z:e.z,draw:()=>drawEdge(e)})),...items.map(n=>({z:proj.get(n.id).z,draw:()=>drawNode(n)}))];objects.sort((a,b)=>a.z-b.z).forEach(o=>o.draw());layoutLabels();dirty=false;}
    function frame(now){if(!alive)return;raf=requestAnimationFrame(frame);const dt=last?Math.min(.04,(now-last)/1000):.016;last=now;if(document.hidden)return;let moving=false;
      if(playing){const oldSway=Math.sin(time*.12)*.18;time+=dt;moving=true;if(now>autopauseUntil&&!pointers.size)yaw+=Math.sin(time*.12)*.18-oldSway;}
      if(target.some((v,i)=>Math.abs(v-goalTarget[i])>bound*.0001)){target=mix(target,goalTarget,Math.min(1,dt*5));moving=true;}
      if(dirty||moving)render();
    }
    function snapshotGesture(){const p=[...pointers.values()];gesture=p.length>=2?{type:'pinch',dist:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom}:p.length?{type:'rotate',x:p[0].x,y:p[0].y,yaw,pitch}:null;}
    function down(e){if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});if(pointers.size===1)dragged=false;snapshotGesture();autopauseUntil=performance.now()+8000;}
    function move(e){const p=pointers.get(e.pointerId);if(!p)return;e.preventDefault();p.x=e.clientX;p.y=e.clientY;const ps=[...pointers.values()];if(Math.hypot(p.x-p.startX,p.y-p.startY)>4)dragged=true;if(gesture?.type==='pinch'&&ps.length>=2){const dist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);zoom=clamp(gesture.zoom*dist/Math.max(1,gesture.dist),.6,1.8);dragged=true;}else if(gesture?.type==='rotate'){yaw=gesture.yaw+(p.x-gesture.x)*.006;pitch=clamp(gesture.pitch+(p.y-gesture.y)*.004,-.85,.85);}dirty=true;autopauseUntil=performance.now()+8000;cameraChanged();}
    function hitNode(x,y){return [...items].sort((a,b)=>proj.get(b.id).z-proj.get(a.id).z).find(n=>{const p=proj.get(n.id);return Math.hypot(p.x-x,p.y-y)<=Math.max(p.r+8,20);});}
    function distanceSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
    function up(e){if(!pointers.has(e.pointerId))return;const wasSingle=pointers.size===1;pointers.delete(e.pointerId);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(wasSingle&&!dragged&&e.type==='pointerup'){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const n=hitNode(x,y);if(n){choose(n.id);const at=performance.now();if(lastTap.id===n.id&&at-lastTap.at<360)focus(n.id);lastTap={id:n.id,at};}else{let found=null,dist=7;edgePaths.forEach(path=>{if(edgeAlpha(path.edge)<.4)return;for(let i=1;i<path.points.length;i++){const d=distanceSegment({x,y},path.points[i-1],path.points[i]);if(d<dist){dist=d;found=path.edge;}}});if(found)onEdgeSelect(found);}}
      if(pointers.size)snapshotGesture();else gesture=null;dirty=true;cameraChanged();
    }
    function wheel(e){e.preventDefault();setZoom(zoom*Math.exp(-e.deltaY*.0011));autopauseUntil=performance.now()+8000;}
    function doubleClick(e){const r=canvas.getBoundingClientRect(),n=hitNode(e.clientX-r.left,e.clientY-r.top);if(n)focus(n.id);}
    const listeners=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['wheel',wheel],['dblclick',doubleClick]];listeners.forEach(([name,fn])=>canvas.addEventListener(name,fn,{passive:false}));
    const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;ro?.observe(canvas);window.addEventListener('resize',resize);
    const motionChanged=()=>{dirty=true;};reduced.addEventListener?.('change',motionChanged);
    window.addEventListener('microcosmos:language',updateAccessibility);window.addEventListener('microcosmos:labels',motionChanged);
    updateAccessibility();resize();render();raf=requestAnimationFrame(frame);
    return{setSelected,setFilter,focus,reset,setPlaying(value){playing=!!value;dirty=true;},setAtmosphere(value){atmosphereAmount=clamp(Number(value)||0,0,1);canvas.dataset.atmosphere=String(atmosphereAmount);dirty=true;},setZoom,resize,destroy(){alive=false;cancelAnimationFrame(raf);ro?.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('microcosmos:language',updateAccessibility);window.removeEventListener('microcosmos:labels',motionChanged);reduced.removeEventListener?.('change',motionChanged);listeners.forEach(([name,fn])=>canvas.removeEventListener(name,fn));atmosphere?.destroy?.();canvas.style.touchAction=oldTouchAction;overlay.replaceChildren();overlay.classList.remove('ra3d-overlay');}};
  }
  window.RelationAtlas3D={mount};
})();
