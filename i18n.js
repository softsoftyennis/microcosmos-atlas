/* Bilingual presentation layer. Scientific state and simulation state stay intact. */
(() => {
 'use strict';
 const dictionary=new Map(), textSources=new WeakMap(), attrSources=new WeakMap();
 const attributes=['aria-label','title','placeholder','alt','content'];
 let lang='zh',observer,scheduled=false,started=false;
 try{lang=localStorage.getItem('microcosmos-language')==='en'?'en':'zh';}catch{}
 const han=/[\u3400-\u9fff]/;
 function t(value){
  const raw=String(value??'');if(lang!=='en')return raw;
  if(dictionary.has(raw))return dictionary.get(raw);
  const trimmed=raw.trim();if(dictionary.has(trimmed))return raw.replace(trimmed,dictionary.get(trimmed));
  if(!han.test(raw))return raw;
  let m;
  if((m=trimmed.match(/^(.+)，(.+)；双击聚焦$/)))return `${t(m[1])}. ${t(m[2])}. Double-click to focus.`;
  if((m=trimmed.match(/^(.+)与(.+)：(.+)。查看关系解释$/)))return `${t(m[1])} ↔ ${t(m[2])}: ${t(m[3])}. View relationship.`;
  if((m=trimmed.match(/^(.+)的教学动画$/)))return `${t(m[1])} teaching animation`;
  if((m=trimmed.match(/^(.+) \/ RELATIONSHIP$/)))return `${t(m[1])} / RELATIONSHIP`;
  if((m=trimmed.match(/^(.+)能跑多快？$/))){const name=t(m[1]).toLowerCase();return `How fast can ${/^[aeiou]/.test(name)?'an':'a'} ${name} move?`;}
  // Dynamic text often adds a symbol or an arrow to an otherwise complete label.
  const symbolMatch=trimmed.match(/^([↖↗✦＋▷Ⅱ⌖◎]\s*)?(.+?)(\s*[↗→λ])?$/);
  if(symbolMatch&&dictionary.has(symbolMatch[2]))return raw.replace(symbolMatch[2],dictionary.get(symbolMatch[2]));
  if((m=trimmed.match(/^(.+) · (.+)$/))&&(dictionary.has(m[1])||dictionary.has(m[2])))return `${t(m[1])} · ${t(m[2])}`;
  return raw;
 }
 function excluded(node){return !node.parentElement||!!node.parentElement.closest('script,style,[data-no-i18n]');}
 function translateText(node){
  if(excluded(node))return;const current=node.data;let saved=textSources.get(node);
  if(!saved||current!==saved.output){saved={source:current,output:current};textSources.set(node,saved);}
  const output=t(saved.source);saved.output=output;if(current!==output)node.data=output;
 }
 function translateAttributes(el){
  if(el.matches('script,style,[data-no-i18n]'))return;
  let saved=attrSources.get(el);if(!saved){saved={};attrSources.set(el,saved);}
  for(const attr of attributes){
   if(!el.hasAttribute(attr))continue;
   const current=el.getAttribute(attr);let record=saved[attr];
   if(!record||current!==record.output)record=saved[attr]={source:current,output:current};
   const output=t(record.source);record.output=output;if(current!==output)el.setAttribute(attr,output);
  }
 }
 function apply(root=document.documentElement){
  if(root.nodeType===Node.TEXT_NODE){translateText(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  translateAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode())){if(node.nodeType===Node.TEXT_NODE)translateText(node);else translateAttributes(node);}
 }
 function observe(){
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
 }
 function updateButton(){const b=document.getElementById('languageToggle');if(!b)return;b.textContent=lang==='zh'?'EN':'中文';b.disabled=false;b.setAttribute('aria-label',lang==='zh'?'Switch the page to English':'切换网页为中文');b.title=lang==='zh'?'Switch to English':'切换为中文';}
 function set(next){
  lang=next==='en'?'en':'zh';observer?.disconnect();
  document.documentElement.lang=lang==='en'?'en':'zh-CN';
  document.documentElement.dataset.language=lang;
  apply();updateButton();
  try{localStorage.setItem('microcosmos-language',lang);}catch{}
  if(started)observe();
  window.dispatchEvent(new CustomEvent('microcosmos:language',{detail:{language:lang}}));
 }
 function start(){
  started=true;
  observer=new MutationObserver(records=>{
   observer.disconnect();const roots=new Set();
   for(const r of records){if(r.type==='characterData')roots.add(r.target);else if(r.type==='attributes')roots.add(r.target);else for(const n of r.addedNodes)if(n.nodeType===Node.ELEMENT_NODE||n.nodeType===Node.TEXT_NODE)roots.add(n);}
   for(const root of roots)apply(root);updateButton();observe();
   if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;window.dispatchEvent(new Event('microcosmos:labels'));});}
  });
  document.getElementById('languageToggle')?.addEventListener('click',()=>set(lang==='zh'?'en':'zh'));
  set(lang);
 }
 window.I18n={t,set,get language(){return lang;},add(entries){for(const [key,value]of Object.entries(entries))dictionary.set(key,value);},apply,has:key=>dictionary.has(key)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
