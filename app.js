(() => {
 'use strict';
 const $ = s => document.querySelector(s), particles = window.PARTICLES;
 let atlasMode='explore', relationAtlas=null, explorer=null, explorerState=null, relationFilter='all', restoringRoute=true;
 const graphEdges=window.RELATION_EDGES, graphTypes=window.RELATION_TYPES;
 const initialRoute=readRoute();
 let current = particles.find(p=>p.id===initialRoute.id) || particles[0], playing=!matchMedia('(prefers-reduced-motion: reduce)').matches, zoom=1, time=0, view='atlas';
 const canvas=$('#universeCanvas'), ctx=canvas.getContext('2d'); let W=0,H=0,dpr=1,cx=0,cy=0,R=0;
 let seed=7193; const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const stars=Array.from({length:95},()=>({x:random(),y:random(),a:random(),r:random()}));
 const cloud=Array.from({length:4200},()=>{let r=-Math.log(Math.max(1e-10,random()*random()*random()))/4.8,cos=2*random()-1,phi=random()*Math.PI*2;return{x:r*Math.sqrt(1-cos*cos)*Math.cos(phi),y:r*Math.sqrt(1-cos*cos)*Math.sin(phi),z:r*cos,a:random(),phase:random()*Math.PI*2};});
 function list(query=''){
  const q=query.trim().toLowerCase();let last='';
  $('#particleList').innerHTML=particles.filter(p=>(p.name+p.en+p.short+p.symbol).toLowerCase().includes(q)).map(p=>{
   const group=p.group!==last?`<div class="group-label">${p.group}</div>`:'';last=p.group;
   return group+`<button class="particle-item ${p.id===current.id?'active':''}" data-id="${p.id}" aria-pressed="${p.id===current.id}"><span class="particle-icon" style="--particle-color:${p.color}">${p.symbol}</span><span class="cn">${p.name}</span><span class="en">${p.short}</span></button>`;
  }).join('')||'<p class="no-result">未找到粒子，试试“电子”或 photon。</p>';
 }
 function hierarchyContext(p){
  const names={atom:'氦原子',nucleus:'原子核',electron:'电子',proton:'质子',neutron:'中子',up:'上夸克',down:'下夸克',gluon:'胶子'};
  const nucleon=explorerState?.key==='neutron'?'neutron':'proton';
  const paths={atom:['atom'],nucleus:['atom','nucleus'],electron:['atom','electron'],proton:['atom','nucleus','proton'],neutron:['atom','nucleus','neutron'],up:['atom','nucleus',nucleon,'up'],down:['atom','nucleus',nucleon,'down'],gluon:['atom','nucleus',nucleon,'gluon']};
  const notes={
   atom:'一个原子核与2个电子共同组成这个氦-4原子。',
   nucleus:'原子核位于原子中心，由2颗质子与2颗中子组成。',
   electron:'电子是基本粒子，没有已知内部结构，不能再拆成核子或夸克。它在原子中以概率云描述。',
   proton:'质子属于原子核；它的价夸克组成是2颗上夸克与1颗下夸克。',
   neutron:'中子属于原子核；它的价夸克组成是1颗上夸克与2颗下夸克。',
   up:'上夸克是基本粒子。核子内部还有动态胶子场与夸克海，三颗价夸克并非全部内容。',
   down:'下夸克是基本粒子。核子内部还有动态胶子场与夸克海，三颗价夸克并非全部内容。',
   photon:'光子传递电磁相互作用；它不是这个氦原子的常驻组成。',
   gluon:'胶子传递强相互作用。这里的胶子场位于核子内部，与夸克持续相互作用。',
   neutrino:'中微子参与弱相互作用，不是这个氦原子的常驻组成。',
   higgs:'希格斯场耦合关联电子和夸克的质量；希格斯玻色子不是原子的常驻组成。'
  };
  const path=paths[p.id];
  const crumbs=path?path.map((id,i)=>`<button data-id="${id}" ${i===path.length-1?'aria-current="page"':''}>${names[id]}</button>`).join('<span class="ancestor-separator" aria-hidden="true">›</span>'):`<span aria-current="page">${p.name}</span>`;
  return `<section class="hierarchy-context ${path?'':'interaction-context'}"><div class="hierarchy-context-label">${path?'科学路径':'相互作用与场'}</div><nav class="ancestor-path" aria-label="${path?'可点击的组成路径':'相互作用关联入口'}">${crumbs}</nav><p>${notes[p.id]}</p></section>`;
 }
 function detail(){const p=current;
  $('#detailPanel').innerHTML=`<div class="detail-kicker"><span>PARTICLE / ${String(particles.indexOf(p)+1).padStart(2,'0')}</span><span class="tag">${p.tag}</span></div>${hierarchyContext(p)}<div class="particle-title"><div><h2>${p.title}</h2><p>${p.en}</p></div><span class="big-symbol" style="color:${p.color}">${p.symbol}</span></div><p class="detail-description">${p.desc}</p><div class="stats"><div><div class="stat-label">${p.id==='atom'||p.id==='nucleus'?'质量（示例体系）':'静止质量'}</div><div class="stat-value ${p.mass.length>14?'small':''}">${p.mass}</div><div class="stat-unit">${p.massUnit}</div></div><div><div class="stat-label">电荷</div><div class="stat-value">${p.charge}</div><div class="stat-unit">${p.chargeUnit}</div></div><div><div class="stat-label">${p.sizeLabel}</div><div class="stat-value ${p.size.length>10?'small':''}">${p.size}</div></div><div><div class="stat-label">${p.spinLabel}</div><div class="stat-value ${p.spin.length>5?'small':''}">${p.spin}</div></div></div><div class="speed-section"><div class="section-label"><svg viewBox="0 0 20 20"><path d="M3 14a8 8 0 1 1 14 0M10 10l4-4M5 15h10"/></svg> 它运动得有多快？</div><div class="speed-value" style="${p.speed.length>12?'font-size:20px':''}">${p.speed}<small>${p.speedUnit}</small></div><p class="speed-context">${p.speedContext}</p>${p.rest!==undefined?'<button class="text-link" id="openSpeed">探索能量与速度 <span>↗</span></button>':''}</div><div class="connection-section"><div class="connection-title">${['atom','nucleus','proton','neutron'].includes(p.id)?'继续深入 · 组成与联系':'相遇于此 · 相关粒子'}</div><div class="relations">${p.relations.map(id=>{const o=particles.find(x=>x.id===id);return `<button class="relation" data-id="${id}">${o.name} <span>↗</span></button>`}).join('')}</div></div><div class="insight">${p.insight}</div><button class="dive-button" id="diveBtn">${p.dive}<span>↗</span></button>`;
  updateDiveButton();
  if($('#openSpeed'))$('#openSpeed').onclick=()=>speedModal(p);
 }
 function select(id,hash=true,reveal=true){
  const p=particles.find(p=>p.id===id);if(!p)return;current=p;
  if(atlasMode==='single'){zoom=1;$('#resetZoom').textContent='1.0×';}
  list($('#search').value);detail();renderConnections();
  canvas.setAttribute('aria-label',p.title+'的教学动画');
  if(atlasMode==='single'){canvas.classList.remove('transitioning');void canvas.offsetWidth;canvas.classList.add('transitioning');hotspots();}
  relationAtlas?.setSelected(id);
  if(atlasMode==='explore'&&reveal)explorer?.reveal(id);
  updateSceneChrome();if(hash)writeRoute();
 }
 function updateDiveButton(){
  const b=$('#diveBtn');if(!b)return;
  if(atlasMode==='explore'&&['atom','nucleus','proton','neutron'].includes(current.id)){
   const inside=explorerState?.key===current.id;
   const next=inside?(current.id==='atom'?'nucleus':current.id==='nucleus'?'proton':null):current.id;
   if(next){b.innerHTML=enterLabel(next)+'<span>↗</span>';b.onclick=()=>{explorer?.setSelected(next);explorer?.enter();};return;}
  }
  b.innerHTML=current.dive+'<span>↗</span>';b.onclick=()=>current.next==='lab'?setView('lab'):select(current.next);
 }
 function readRoute(){
  const [id,query='']=location.hash.slice(1).split('?'),params=new URLSearchParams(query);
  return{id,mode:['explore','relations','single'].includes(params.get('mode'))?params.get('mode'):'explore',scene:params.get('scene')};
 }
 function writeRoute(){
  if(restoringRoute)return;
  if(view==='lab'){history.replaceState(null,'','#double-slit');return;}
  const params=new URLSearchParams();if(atlasMode!=='explore')params.set('mode',atlasMode);
  else if(explorerState?.key)params.set('scene',explorerState.key);
  history.replaceState(null,'','#'+current.id+(params.size?'?'+params.toString():''));
 }
 function enterLabel(id){return({atom:'进入原子内部',nucleus:'进入原子核内部',proton:'进入质子内部',neutron:'进入中子内部'})[id]||'进入内部';}
 function sceneChanged(snapshot){
  explorerState=snapshot;if(atlasMode==='explore'&&Number.isFinite(snapshot.zoom)){zoom=snapshot.zoom;$('#resetZoom').textContent=zoom.toFixed(1)+'×';}
  if(atlasMode==='explore'){
   if(snapshot.selectedId&&snapshot.selectedId!==current.id)select(snapshot.selectedId,false,false);
   updateSceneChrome();writeRoute();
  }
 }
 function renderConnections(){
  const edges=graphEdges.filter(e=>e.from===current.id||e.to===current.id);
  const rows=items=>items.map(e=>{const other=particles.find(p=>p.id===(e.from===current.id?e.to:e.from));return `<button class="connection-row" data-edge="${e.id}" style="--edge-color:${graphTypes[e.type].color}"><i></i><span><b>${other.id==='atom'?'氦原子':other.name}</b><small>${e.label}</small></span><em>↗</em></button>`}).join('');
  const groups=[['组成关系',edges.filter(e=>e.type==='composition')],['相互作用与场',edges.filter(e=>e.type!=='composition')]];
  $('.connection-section').innerHTML=groups.filter(([,items])=>items.length).map(([title,items])=>`<div class="connection-group"><div class="connection-title">${title} <span class="connection-count">${items.length}</span></div><div class="connection-rows">${rows(items)}</div></div>`).join('');
 }
 function showEdge(edge){if(typeof edge==='string')edge=graphEdges.find(e=>e.id===edge);if(!edge)return;const a=particles.find(p=>p.id===edge.from),b=particles.find(p=>p.id===edge.to),type=graphTypes[edge.type];modal(`<div class="modal-eyebrow" style="color:${type.color}">${type.name} / RELATIONSHIP</div><h2>${a.id==='atom'?'氦原子':a.name} <span style="color:${type.color}">${edge.type==='composition'?'→':'↔'}</span> ${b.name}</h2><div class="edge-label" style="--edge-color:${type.color}">${edge.label}</div><p>${edge.description}</p><div class="insight">${type.description}</div><p>三维位置和连线用来组织知识，不对应真实粒子位置、轨道或相互作用的传播路径。</p>`);}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-edge]');if(b)showEdge(b.dataset.edge);});
 function updateSceneChrome(){
  const p=current,rel=atlasMode==='relations',inside=atlasMode==='explore',state=explorerState;
  $('.scene-heading h1').innerHTML=inside?'向内，<br>再看见一个宇宙<span>。</span>':rel?'一颗原子，<br>连起微观世界<span>。</span>':'万物之下，<br>另有宇宙<span>。</span>';
  $('.eyebrow').innerHTML='<span class="short-line"></span>'+ (inside?'A JOURNEY INWARD':rel?'CONNECTED PARTICLE ATLAS':'THE UNIVERSE WITHIN');
  $('.scene-heading p').textContent=inside?(['proton','neutron'].includes(state?.key)?'点击夸克或胶子场，查看性质。':current.id==='electron'?'电子是基本粒子，没有已知内部结构。':['photon','neutrino','higgs'].includes(state?.key)?'独立知识入口 · 了解基本粒子的性质。':state?.key&&state.key!=='overview'?'点击眼前的粒子，继续向内探索。':'点击原子，飞入它的内部。'):rel?'拖动旋转全景 · 点击节点，发现粒子之间的联系。':'从一颗原子出发，探索构成世界的基本粒子。';
  $('#sceneName').textContent=inside?(window.I18n?.language==='en'?(state?.titleEn||'A HELIUM-4 ATOM'):(state?.title||'氦-4原子')):rel?'11类对象 · 一张关系图':p.title;
  $('#sceneSubtitle').textContent=inside?(state?.titleEn||'HELIUM-4 / THE JOURNEY BEGINS'):rel?'CONNECTED PARTICLES / 3D':p.sub;
  $('#sceneMode').textContent=p.scene;
  $('#sceneNote').textContent=inside?(window.I18n?.language==='en'?(state?.noteEn||'A complete helium-4 atom · Select it to enter'):(state?.note||'完整的氦-4原子 · 点击主体进入')):rel?'实线＝组成 · 虚线＝作用关系 · 星尘为氛围，非实测分布':p.note;
  $('.model-label').textContent=inside?'结构示意 · 非等比例':rel?'拖动旋转 · 滚轮/双指缩放':'教学示意 · 非真实比例';
  if(inside){
   const path=state?.path||[{key:'overview',id:'atom',title:'原子之外',en:'Outside the atom'}];
   $('#scenePath').innerHTML=path.map((step,i)=>`<button data-scene="${step.key}" ${i===path.length-1?'aria-current="step"':''}>${window.I18n?.language==='en'?step.en:step.title}</button>`).join('<span aria-hidden="true">›</span>');
   $('#sceneBack').disabled=!state?.canBack;
   const terminal=['electron','up','down','gluon','photon','neutrino','higgs'].includes(current.id);
   const enter=$('#enterScene'),canEnter=state?.canEnter&&!terminal;enter.disabled=!canEnter||!!state?.transitioning;
   $('#sceneBack').disabled=!state?.canBack||!!state?.transitioning;
   const target=state?.selectedId==='atom'&&state?.key==='atom'?'nucleus':state?.selectedId==='nucleus'&&state?.key==='nucleus'?'proton':state?.selectedId||'atom';
   enter.innerHTML=canEnter?enterLabel(target)+'<span>↗</span>':`<span class="entry-complete">${terminal?'基本粒子 · 无已知内部结构':'已进入内部 · 选择夸克查看详情'}</span>`;
  }
  updateDiveButton();
 }
 function syncPlaying(){
  relationAtlas?.setPlaying(atlasMode==='relations'&&view==='atlas'&&playing);
  explorer?.setPlaying(atlasMode==='explore'&&view==='atlas'&&playing);
 }
 function switchMode(mode,route=true){
  if(!['explore','relations','single'].includes(mode))return;
  atlasMode=mode;const rel=mode==='relations',inside=mode==='explore',single=mode==='single';
  $('.universe').classList.toggle('relation-mode',rel);$('.universe').classList.toggle('explore-mode',inside);$('.universe').classList.toggle('single-mode',single);
  $('#relationCanvas').hidden=!rel;$('#relationOverlay').hidden=!rel;$('#relationFilters').hidden=!rel;
  $('#exploreCanvas').hidden=!inside;$('#exploreOverlay').hidden=!inside;$('#scenePath').hidden=!inside;$('#exploreActions').hidden=!inside;
  canvas.hidden=!single;$('#hotspots').hidden=!single;
  for(const [id,key]of [['exploreMode','explore'],['relationsMode','relations'],['singleMode','single']]){const active=mode===key;$('#'+id).classList.toggle('active',active);$('#'+id).setAttribute('aria-pressed',active);}
  syncPlaying();
  if(inside){if(!restoringRoute&&explorerState?.selectedId!==current.id)explorer?.reveal(current.id);explorer?.resize();zoom=explorerState?.zoom||1;}
  else if(rel){relationAtlas?.resize();relationAtlas?.setZoom(1);zoom=1;}
  else{zoom=1;resize();}
  $('#resetZoom').textContent=zoom.toFixed(1)+'×';updateSceneChrome();if(route)writeRoute();
 }
 $('#exploreMode').onclick=()=>switchMode('explore');$('#relationsMode').onclick=()=>switchMode('relations');$('#singleMode').onclick=()=>switchMode('single');
 $('#sceneBack').onclick=()=>explorer?.back();$('#enterScene').onclick=()=>explorer?.enter();
 $('#scenePath').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(b)explorer?.goToScene(b.dataset.scene);});
 $('#fitGraph').onclick=()=>{relationAtlas?.reset();zoom=1;$('#resetZoom').textContent='1.0×';};
 $('#focusGraph').onclick=()=>relationAtlas?.focus(current.id);
 $('#dustToggle').onclick=()=>{const open=$('#dustPanel').hidden;$('#dustPanel').hidden=!open;$('#dustToggle').setAttribute('aria-expanded',open);};
 $('#dustAmount').oninput=e=>{const value=Number(e.target.value);$('#dustValue').textContent=value+'%';relationAtlas?.setAtmosphere(value/100);explorer?.setAtmosphere(value/100);};
 document.addEventListener('click',e=>{if(!e.target.closest('.dust-controls')){$('#dustPanel').hidden=true;$('#dustToggle').setAttribute('aria-expanded','false');}});
 document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{relationFilter=b.dataset.filter;relationAtlas?.setFilter(relationFilter);document.querySelectorAll('[data-filter]').forEach(el=>{const active=el===b;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b){if(view!=='atlas')setView('atlas');select(b.dataset.id);}});
 $('#search').addEventListener('input',e=>list(e.target.value));
 function setView(v){if(v===view)return;view=v;$('#atlasView').hidden=v!=='atlas';$('#labView').hidden=v!=='lab';$('#atlasNav').classList.toggle('active',v==='atlas');$('#labNav').classList.toggle('active',v==='lab');syncPlaying();if(v==='lab'){window.WaveLab.mount($('#labView'),{particle:current.id==='photon'?'photon':'electron'});}else{window.WaveLab.unmount();resize();relationAtlas?.resize();explorer?.resize();}writeRoute();}
 $('#atlasNav').onclick=()=>setView('atlas');$('#labNav').onclick=$('#footerLab').onclick=()=>setView('lab');$('#labView').addEventListener('wavelab:back',()=>setView('atlas'));
 function pause(){playing=!playing;$('#pauseBtn').textContent=playing?'Ⅱ':'▷';$('#pauseBtn').setAttribute('aria-label',playing?'暂停动画':'播放动画');syncPlaying();}
 $('#pauseBtn').onclick=pause;if(!playing){$('#pauseBtn').textContent='▷';$('#pauseBtn').setAttribute('aria-label','播放动画');}
 function setZoom(z){zoom=Math.max(.65,Math.min(2,z));$('#resetZoom').textContent=zoom.toFixed(1)+'×';if(atlasMode==='relations')relationAtlas?.setZoom(zoom);else if(atlasMode==='explore')explorer?.setZoom(zoom);else hotspots();}
 $('#zoomIn').onclick=()=>setZoom(zoom+.15);$('#zoomOut').onclick=()=>setZoom(zoom-.15);$('#resetZoom').onclick=()=>setZoom(1);
 canvas.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();setZoom(zoom-e.deltaY*.002);}},{passive:false});
 function modal(content){$('#modalContent').innerHTML=content;$('#modal').showModal();}
 $('#closeModal').onclick=()=>$('#modal').close();$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
 function guide(){modal(`<div class="modal-eyebrow">A JOURNEY INWARD</div><h2>从熟悉的物质，走进量子的世界。</h2><p>从一颗完整的氦-4原子出发。点击主体，镜头飞入内部；拖动旋转，滚轮或双指缩放。顶部路径和返回按钮带你回到刚才的场景。</p><div class="guide-step"><b>01</b><div><strong>先进入原子</strong><p>原子内部有原子核和电子概率云。电子是基本粒子，没有已知内部结构，不能继续拆分。</p></div></div><div class="guide-step"><b>02</b><div><strong>再进入原子核</strong><p>这个氦-4原子核含2颗质子与2颗中子。点击其中一颗，继续进入它的内部。</p></div></div><div class="guide-step"><b>03</b><div><strong>看见夸克与胶子场</strong><p>质子含2上1下价夸克，中子含1上2下价夸克。核子还包含动态胶子场与夸克海，不能理解为只有3颗静止小球。</p></div></div><div class="guide-step"><b>04</b><div><strong>切换视角，发现联系</strong><p>关系全景保留三维星尘中的粒子网络，粒子特写展示单独对象。双缝实验则让你逐个发射电子或光子，亲手积累干涉条纹。</p></div></div><button class="solid-btn" id="guideStart">从原子开始 →</button>`);$('#guideStart').onclick=()=>{$('#modal').close();setView('atlas');switchMode('explore');explorer?.reset();};}
 $('#guideNav').onclick=$('#startJourney').onclick=guide;
 $('#sourcesBtn').onclick=()=>modal(`<div class="modal-eyebrow">SCIENCE & SOURCES</div><h2>让想象有科学的边界。</h2><p>内部探索模拟从原子进入原子核、再进入核子的观察过程。放大与镜头运动用于解释组成关系，不能按画面测量真实尺度。电子是基本粒子，没有已知内部结构。核子中的三颗价夸克之外，还有动态胶子场与夸克海。关系全景中的实线表示组成，虚线表示作用、反应或场耦合；节点位置、间距和星尘是教学视觉。电子以概率云描述，没有行星式轨道。</p><p>从原子到原子核的实际尺度差异远大于画面展示；组成路径不表示粒子衰变。</p><h3>怎样理解“大小”和“速度”？</h3><p>复合粒子可用特定半径或尺度描述；基本粒子目前未发现内部结构，不能把点状图标当成实测半径。速度依状态、能量与参考系而定；数值示例会注明适用条件。</p><h3>数据与延伸阅读</h3><ul class="source-list">${window.SCIENCE_SOURCES.map(s=>`<li><a href="${s[1]}" target="_blank" rel="noopener noreferrer">${s[0]} ↗</a><br>${s[2]}</li>`).join('')}</ul><p>单位：e 为基本电荷，fm = 10⁻¹⁵ m，MeV/c² 为质量单位；自旋以 ħ 为单位。自由粒子计算采用相对论能量—动量关系。内容为入门精选，并非标准模型的完整粒子列表。</p>`);
 function speedModal(p){const photon=p.rest===0;modal(`<div class="modal-eyebrow">ENERGY → MOTION</div><h2>${p.name}能跑多快？</h2><p>${photon?'调节光子能量，观察波长变化。真空中的光速保持不变。':'调节自由粒子的动能，观察速度与德布罗意波长的变化。这里计算的是自由粒子，不是束缚态内部运动。'}</p><div class="speed-control"><label for="energy">${photon?'光子能量':'动能 K'}<span id="energyValue"></span></label><input type="range" id="energy" min="-2" max="12" step="0.05" value="${photon?'0.3':p.id==='electron'?'3':'9'}" aria-label="以对数刻度调节能量，单位电子伏特"><label><span>0.01 eV</span><span>对数刻度</span><span>1 TeV</span></label></div><div class="speed-output" aria-live="polite"><div><small>速度 v</small><strong id="velocity"></strong></div><div><small>${photon?'光子波长':'德布罗意波长'} λ</small><strong id="wavelength"></strong></div></div><div class="speed-formula">${photon?'v = c　　λ = hc / E':'E = K + mc²　　λ = h / p'}</div><p id="velocityNote"></p>`);
  const fmtE=n=>n>=1e12?(n/1e12).toFixed(2)+' TeV':n>=1e9?(n/1e9).toFixed(2)+' GeV':n>=1e6?(n/1e6).toFixed(2)+' MeV':n>=1e3?(n/1e3).toFixed(2)+' keV':n.toFixed(n<1?3:1)+' eV';
  function update(){const k=10**Number($('#energy').value),m=p.rest;const beta=photon?1:Math.sqrt(k*(k+2*m))/(k+m);const lam=1.239841984e-6/(photon?k:Math.sqrt(k*(k+2*m)));$('#energyValue').textContent=fmtE(k);$('#velocity').textContent=photon?'1.000000 c':beta>.999999?'≈ 1 c':beta<.0001?(beta*299792458).toFixed(1)+' m/s':beta.toFixed(6)+' c';$('#wavelength').textContent=lam>=1e-6?(lam/1e-6).toFixed(3)+' μm':lam>=1e-9?(lam/1e-9).toFixed(3)+' nm':lam>=1e-12?(lam/1e-12).toFixed(3)+' pm':(lam/1e-15).toFixed(3)+' fm';$('#velocityNote').textContent=photon?'在真空中，增大能量会缩短波长，速度仍为 299,792,458 m/s。':'有质量的粒子无论动能多高，速度都小于真空光速 c。高能时显示的“≈ 1 c”只是数值近似；波长不是粒子的直径。';}
  $('#energy').oninput=update;update();
 }
 document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||$('#modal').open)return;if(e.key==='/'){e.preventDefault();setView('atlas');$('#search').focus();}if(e.key==='Escape'&&view==='lab')setView('atlas');if(view==='atlas'&&e.code==='Space'){e.preventDefault();pause();}if(view==='atlas'&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();const i=particles.indexOf(current);select(particles[(i+(e.key==='ArrowRight'?1:particles.length-1))%particles.length].id);}});
 function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;W=rect.width;H=rect.height;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cx=W*.5;cy=H*.53+22;R=Math.min(W*.39,H*.29);hotspots();}
 function hotspots(){if(!W)return;let spots=[];const r=R*zoom;
  if(current.id==='atom')spots=[{id:'nucleus',name:'氦原子核 · 2p + 2n',x:cx+r*.25,y:cy+r*.28,color:'#edb28c'},{id:'electron',name:'电子概率云 · 2e⁻',x:cx+r*.7,y:cy-r*.45,color:'#83e6d3'}];
  if(current.id==='nucleus')spots=[{id:'proton',name:'质子',x:cx-r*.58,y:cy+r*.3,color:'#edb28c'},{id:'neutron',name:'中子',x:cx+r*.63,y:cy-r*.25,color:'#a59bd9'}];
  if(['proton','neutron'].includes(current.id))spots=[{id:'up',name:'上夸克',x:cx-r*.69,y:cy-r*.15,color:'#e7bd7b'},{id:'down',name:'下夸克',x:cx+r*.69,y:cy+r*.45,color:'#b2a4eb'}];
  $('#hotspots').innerHTML=spots.map(s=>`<button class="hotspot" data-id="${s.id}" style="left:${s.x}px;top:${s.y}px;--hot-color:${s.color}"><i></i>${s.name}<span>↗</span></button>`).join('');
 }
 new ResizeObserver(resize).observe($('.universe'));
 function hex(c,a){return c+Math.round(Math.max(0,Math.min(1,a))*255).toString(16).padStart(2,'0');}
 function glow(x,y,r,c,a=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hex(c,a));g.addColorStop(.22,hex(c,a*.45));g.addColorStop(1,hex(c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
 function circle(x,y,r,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();}
 function sphere(x,y,r,c,label){glow(x,y,r*2,c,.14);const g=ctx.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);g.addColorStop(0,hex(c,.9));g.addColorStop(.4,hex(c,.55));g.addColorStop(1,hex(c,.08));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();circle(x,y,r,hex(c,.48),.7);circle(x-r*.12,y-r*.14,r*.65,hex(c,.1),.5);if(label){ctx.fillStyle='#f5f1e6';ctx.font=`italic ${r*.7}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y);}}
 function background(){ctx.clearRect(0,0,W,H);ctx.lineWidth=.5;ctx.strokeStyle='#3e64730c';for(let x=25;x<W;x+=55){for(let y=25;y<H;y+=55){ctx.beginPath();ctx.moveTo(x-2,y);ctx.lineTo(x+2,y);ctx.moveTo(x,y-2);ctx.lineTo(x,y+2);ctx.stroke();}}
  stars.forEach(s=>{ctx.fillStyle=`rgba(142,182,190,${s.a*.32})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r*.75+.2,0,Math.PI*2);ctx.fill();});
  ctx.strokeStyle='#4f8a7c16';ctx.lineWidth=.6;const r=R*zoom;circle(cx,cy,r*1.08,'#4f8a7c15');ctx.setLineDash([2,7]);circle(cx,cy,r*1.25,'#4f8a7c1b');ctx.setLineDash([]);
  for(let a=0;a<Math.PI*2;a+=Math.PI/12){const r1=r*1.25,r2=r1+((Math.round(a/(Math.PI/12))%3===0)?7:3);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);ctx.stroke();}
  ctx.font='7px monospace';ctx.fillStyle='#47766e66';ctx.textAlign='left';ctx.fillText('QUANTUM VIEW / '+current.id.toUpperCase(),23,H-60);
 }
 function atom(){const r=R*zoom;glow(cx,cy,r*1.45,'#5dd9c2',.065);for(const p of cloud){const x=cx+p.x*r,y=cy+p.y*r;if(Math.abs(p.x)>1.5||Math.abs(p.y)>1.4)continue;const a=(.14+p.a*.54)*(.7+.3*Math.sin(time*.8+p.phase));ctx.fillStyle=hex('#7ce1ce',a);ctx.beginPath();ctx.arc(x,y,(.35+p.a*.68)*zoom,0,Math.PI*2);ctx.fill();}glow(cx,cy,34*zoom,'#f4b285',.4);sphere(cx,cy,8*zoom,'#f2b48b','');circle(cx,cy,16*zoom,'#e6c39d44',.5);ctx.strokeStyle='#95d6c02b';ctx.setLineDash([3,6]);ctx.beginPath();ctx.moveTo(cx-r*1.05,cy);ctx.lineTo(cx+r*1.05,cy);ctx.stroke();ctx.setLineDash([]);ctx.font='8px monospace';ctx.fillStyle='#80a99f';ctx.textAlign='left';ctx.fillText('1s² / probability',cx-r*.9,cy+r*.95);}
 function nucleus(){const r=R*zoom;glow(cx,cy,r,'#b29ce0',.12);const s=r*.28;const locs=[[-.35,-.28,'#a59bd9','n'],[.32,-.19,'#edb28c','p'],[-.33,.31,'#edb28c','p'],[.3,.35,'#a59bd9','n']];locs.forEach(([x,y,c,l],i)=>sphere(cx+x*r,cy+y*r,s,c,l));ctx.font='9px monospace';ctx.fillStyle='#928caa';ctx.textAlign='center';ctx.fillText('2 PROTONS + 2 NEUTRONS',cx,cy+r*.99);}
 function gluonLine(x1,y1,x2,y2,i,alpha=.6){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);ctx.beginPath();for(let k=0;k<=90;k++){const s=k/90,wiggle=Math.sin(s*Math.PI*18+time*1.5+i)*Math.sin(s*Math.PI)*7*zoom;const x=x1+dx*s-dy/len*wiggle,y=y1+dy*s+dx/len*wiggle;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=hex('#d7acbd',alpha);ctx.lineWidth=.8;ctx.stroke();}
 function nucleon(){const r=R*zoom;const g=ctx.createRadialGradient(cx-r*.2,cy-r*.3,0,cx,cy,r*.9);g.addColorStop(0,'#16332d77');g.addColorStop(.7,'#21463e22');g.addColorStop(1,'#15362c00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r*.92,0,Math.PI*2);ctx.fill();circle(cx,cy,r*.88,'#779f8f33',.7);const pts=[{x:cx-r*.4,y:cy-r*.23,c:'#e7bd7b',l:'u'},{x:cx+r*.39,y:cy-r*.2,c:current.id==='proton'?'#8fd7bd':'#b2a4eb',l:current.id==='proton'?'u':'d'},{x:cx,y:cy+r*.42,c:'#b2a4eb',l:'d'}];pts.forEach((p,i)=>gluonLine(p.x,p.y,pts[(i+1)%3].x,pts[(i+1)%3].y,i,.65));pts.forEach(p=>sphere(p.x,p.y,r*.17,p.c,p.l));for(let i=0;i<30;i++){const a=i*2.4,rr=r*(.27+(i%7)*.08);glow(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,3,'#89c8b1',.25+.1*Math.sin(time+i));}ctx.fillStyle='#72988c';ctx.font='8px monospace';ctx.textAlign='center';ctx.fillText('VALENCE QUARKS + GLUON FIELD + SEA',cx,cy+r*1.05);}
 function wave(){const r=R*zoom;const color=current.color;glow(cx,cy,r*.9,color,.08);ctx.strokeStyle='#789f9b44';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(cx-r*1.1,cy);ctx.lineTo(cx+r*1.1,cy);ctx.stroke();for(let layer=0;layer<3;layer++){ctx.beginPath();for(let i=0;i<=260;i++){const s=(i/260-.5)*2.2,x=cx+s*r,env=Math.exp(-s*s*2.9),y=cy+Math.sin(s*17-time*1.8+layer*.45)*env*r*(.22+layer*.045);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=hex(color,layer===0?.8:.23);ctx.lineWidth=layer===0?1.5:.7;ctx.stroke();}if(current.id==='electron'){glow(cx,cy,35*zoom,color,.6);sphere(cx,cy,7*zoom,color,'');}ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle=hex(color,.7);ctx.fillText(current.id==='photon'?'E = hf    ·    p = h/λ':'ψ(x)    ·    p = h/λ',cx,cy+r*.8);}
 function quark(){const r=R*zoom,c=current.color;glow(cx,cy,r*.85,c,.15);circle(cx,cy,r*.6,hex(c,.13),.5);circle(cx,cy,r*.83,hex(c,.08),.5);sphere(cx,cy,r*.16,c,current.symbol);const marks=[{a:-Math.PI*.8,l:'COLOR CHARGE'},{a:.1,l:'½ SPIN'},{a:Math.PI*.6,l:current.id==='up'?'+⅔ e':'−⅓ e'}];marks.forEach((m,i)=>{const x=cx+Math.cos(m.a)*r*.9,y=cy+Math.sin(m.a)*r*.9;ctx.strokeStyle=hex(c,.2);ctx.beginPath();ctx.moveTo(cx+Math.cos(m.a)*r*.22,cy+Math.sin(m.a)*r*.22);ctx.lineTo(x,y);ctx.stroke();glow(x,y,8,c,.4);ctx.font='8px monospace';ctx.fillStyle=hex(c,.6);ctx.textAlign='center';ctx.fillText(m.l,x,y+19);});ctx.font='8px monospace';ctx.textAlign='center';ctx.fillStyle=hex(c,.6);ctx.fillText('CONFINED / NO ISOLATED FREE STATE',cx,cy+r*1.12);}
 function gluon(){const r=R*zoom;glow(cx,cy,r*.8,current.color,.08);const pts=[[-.65,.3],[0,-.55],[.65,.3]].map(([x,y])=>({x:cx+x*r,y:cy+y*r}));pts.forEach((p,i)=>{gluonLine(p.x,p.y,pts[(i+1)%3].x,pts[(i+1)%3].y,i,.7);glow(p.x,p.y,r*.14,['#e7bd7b','#83e6d3','#b2a4eb'][i],.7);});ctx.font='italic 36px Georgia';ctx.fillStyle=current.color;ctx.textAlign='center';ctx.fillText('g',cx,cy+12);}
 function neutrino(){const r=R*zoom;ctx.save();ctx.beginPath();ctx.rect(cx-r*1.1,cy-r*.7,r*2.2,r*1.4);ctx.clip();for(let i=0;i<50;i++){const sx=(i*.071+time*.14)%1,x=cx+(sx-.5)*r*2.8,y=cy+Math.sin(i*41.23)*r*.52;ctx.strokeStyle='#8eb6ec30';ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x,y);ctx.stroke();glow(x,y,5,'#8eb6ec',.55);}ctx.restore();ctx.font='italic 42px Georgia';ctx.fillStyle='#a7caf1';ctx.textAlign='center';ctx.fillText('ν',cx,cy+15);}
 function higgs(){const r=R*zoom;for(let i=0;i<8;i++){const rr=r*(.16+i*.1);circle(cx,cy,rr,hex(current.color,.04+.08*(.5+.5*Math.sin(time-i*.8))),1);ctx.save();ctx.translate(cx,cy);ctx.scale(1,.35);circle(0,0,rr,hex(current.color,.12),1);ctx.restore();}glow(cx,cy,r*.4,current.color,.25);sphere(cx,cy,r*.12,current.color,'H');}
 let last=0;function frame(now){requestAnimationFrame(frame);if(view!=='atlas'||atlasMode!=='single'||document.hidden){last=now;return;}const dt=Math.min((now-last)/1000,.05);last=now;if(playing)time+=dt;background();if(current.id==='atom')atom();else if(current.id==='nucleus')nucleus();else if(['proton','neutron'].includes(current.id))nucleon();else if(['electron','photon'].includes(current.id))wave();else if(['up','down'].includes(current.id))quark();else if(current.id==='gluon')gluon();else if(current.id==='neutrino')neutrino();else higgs();}
 relationAtlas=window.RelationAtlas3D.mount({canvas:$('#relationCanvas'),overlay:$('#relationOverlay'),nodes:window.RELATION_NODES,edges:graphEdges,onSelect:id=>select(typeof id==='string'?id:id.id),onEdgeSelect:showEdge,onCameraChange:state=>{if(atlasMode==='relations'&&Number.isFinite(state?.zoom)){zoom=state.zoom;$('#resetZoom').textContent=zoom.toFixed(1)+'×';}}});
 explorer=window.MicroExplorer3D.mount({canvas:$('#exploreCanvas'),overlay:$('#exploreOverlay'),onSelect:id=>select(typeof id==='string'?id:id.id,false,false),onSceneChange:sceneChanged});
 relationAtlas.setAtmosphere(Number($('#dustAmount').value)/100);explorer.setAtmosphere(Number($('#dustAmount').value)/100);
 function restoreRoute(route){
  restoringRoute=true;
  if(route.id==='double-slit'){setView('lab');restoringRoute=false;return;}
  setView('atlas');const targetId=(particles.find(p=>p.id===route.id)||particles[0]).id;current=particles.find(p=>p.id===targetId);switchMode(route.mode,false);select(targetId,false,false);
  if(route.mode==='explore'){
   explorer.reveal(targetId,{animate:false});
   if(route.scene){explorer.goToScene(route.scene,{animate:false});explorer.setSelected(targetId);explorerState=explorer.getState();}
  }
  updateSceneChrome();restoringRoute=false;writeRoute();
 }
 restoreRoute(initialRoute);requestAnimationFrame(frame);
 window.addEventListener('hashchange',()=>restoreRoute(readRoute()));
 window.addEventListener('popstate',()=>restoreRoute(readRoute()));
 window.addEventListener('microcosmos:language',()=>{updateSceneChrome();});
})();
