/* Microcosmos — a qualitative, single-particle double-slit laboratory. */
(function () {
  'use strict';

  var teardown = null;
  var seq = 0;

  function mount(container, options = {}) {
    if (!container || !container.appendChild) throw new Error('WaveLab.mount 需要一个容器元素');
    unmount();
    var uid = 'wave-lab-' + (++seq);
    var root = document.createElement('section');
    root.className = 'wl';
    root.setAttribute('aria-label', '波粒二象性互动实验');
    root.innerHTML = `
      <style>
      .wl{--wl-ink:#e6f1ee;--wl-muted:#839b9e;--wl-green:#79ead9;--wl-line:rgba(137,195,191,.17);background:#070d13;color:var(--wl-ink);height:100%;min-height:600px;width:100%;overflow:auto;font-family:Inter,"PingFang SC","Microsoft YaHei",sans-serif;box-sizing:border-box;color-scheme:dark}
      .wl *{box-sizing:border-box}.wl button{font:inherit;color:inherit;cursor:pointer}.wl button:focus-visible,.wl input:focus-visible{outline:2px solid var(--wl-green);outline-offset:5px}.wl button:disabled{opacity:.38;cursor:wait}.wl-shell{max-width:1580px;margin:auto;padding:32px 40px 28px}.wl-eyebrow{font-size:10px;letter-spacing:3px;color:var(--wl-green);font-weight:600}.wl-header{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:28px}.wl h1{font-weight:500;font-size:clamp(25px,3vw,40px);letter-spacing:2px;margin:13px 0 10px}.wl-intro{font-size:13px;line-height:1.8;color:var(--wl-muted);margin:0;max-width:700px}.wl-back{border:1px solid var(--wl-line);background:transparent;padding:11px 15px;font-size:12px!important;white-space:nowrap;letter-spacing:1px;transition:background .2s}.wl-back:hover{background:rgba(121,234,217,.07)}.wl-topline{border:1px solid var(--wl-line);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:24px}.wl-particles{display:flex;gap:8px;align-items:center}.wl-caption{font-size:10px;letter-spacing:1.6px;color:var(--wl-muted);margin-right:12px}.wl-choice{border:1px solid transparent;background:transparent;padding:8px 15px;font-size:12px!important;border-radius:2px;color:var(--wl-muted)!important}.wl-choice[aria-pressed=true]{border-color:rgba(121,234,217,.45);background:rgba(121,234,217,.08);color:var(--wl-green)!important}.wl-dot{display:inline-block;height:6px;width:6px;background:currentColor;border-radius:50%;margin-right:9px;vertical-align:1px}.wl-detect{display:flex;align-items:center;gap:12px;font-size:12px;cursor:pointer;line-height:1.6}.wl-switch{appearance:none;-webkit-appearance:none;width:34px;height:19px;background:#203039;border:1px solid #46616a;border-radius:20px;position:relative;cursor:pointer;flex:none;margin:0}.wl-switch:before{content:"";position:absolute;left:3px;top:3px;background:#a0b7b9;width:11px;height:11px;border-radius:50%;transition:transform .2s,background .2s}.wl-switch:checked{background:rgba(121,234,217,.15);border-color:var(--wl-green)}.wl-switch:checked:before{transform:translateX(15px);background:var(--wl-green)}.wl-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;border:1px solid var(--wl-line);border-top:0}.wl-stage{position:relative;min-width:0;border-right:1px solid var(--wl-line);display:flex;flex-direction:column}.wl-stage-heading{display:flex;justify-content:space-between;gap:15px;padding:19px 22px 0;z-index:1}.wl-stage-label{font-size:10px;color:var(--wl-muted);letter-spacing:2px}.wl-live{font-size:10px;letter-spacing:1px;color:var(--wl-green)}.wl-live:before{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:currentColor;margin-right:7px;box-shadow:0 0 10px currentColor}.wl-canvas-wrap{position:relative;flex:1;height:360px;min-height:330px}.wl-canvas{display:block;width:100%;height:100%;touch-action:pan-y}.wl-scene-note{position:absolute;bottom:8px;left:22px;right:22px;pointer-events:none;color:#6e868d;font-size:10px;line-height:1.7}.wl-controls{border-top:1px solid var(--wl-line);padding:16px 20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.wl-action{border:1px solid var(--wl-line);background:transparent;padding:10px 14px;font-size:11px!important;transition:background .2s}.wl-action:hover{background:rgba(121,234,217,.06)}.wl-action-primary{background:var(--wl-green);border-color:var(--wl-green);color:#082124!important;font-weight:600}.wl-action-primary:hover{background:#a2f2e6}.wl-count{margin-left:auto;color:var(--wl-muted);font-size:10px;display:flex;align-items:baseline;gap:9px;font-variant-numeric:tabular-nums}.wl-count strong{color:var(--wl-ink);font-size:21px;font-weight:400}.wl-aside{padding:25px 24px;display:flex;flex-direction:column}.wl-number{font-size:10px;color:var(--wl-green);letter-spacing:2px}.wl-aside h2{font-size:19px;line-height:1.5;font-weight:400;margin:13px 0 14px;letter-spacing:1px}.wl-aside p{font-size:12px;line-height:1.9;color:#a1b6b8;margin:0 0 18px}.wl-state-note{border-top:1px solid var(--wl-line);padding-top:18px;margin-top:4px}.wl-tag{font-size:10px;color:var(--wl-green);display:inline-block;border:1px solid rgba(121,234,217,.25);padding:5px 8px;margin-bottom:12px}.wl-key{margin-top:auto;padding-top:14px;font-size:10px!important;color:#667f87!important}.wl-insights{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;margin-top:25px}.wl-insight{padding-left:14px;border-left:1px solid rgba(121,234,217,.27)}.wl-insight small{font-size:9px;color:var(--wl-green);letter-spacing:1px}.wl-insight h3{font-size:12px;font-weight:500;margin:8px 0;letter-spacing:.5px}.wl-insight p{font-size:11px;line-height:1.8;color:var(--wl-muted);margin:0}.wl-footer{display:flex;justify-content:space-between;gap:20px;color:#617a82;font-size:9px;letter-spacing:.5px;border-top:1px solid var(--wl-line);padding-top:18px;margin-top:27px;line-height:1.8}.wl-footer a{color:#90b7b7;text-decoration:none}.wl-footer a:hover{text-decoration:underline}.wl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.wl-toast{position:absolute;top:45px;left:22px;right:22px;z-index:2;color:var(--wl-green);font-size:11px;pointer-events:none;opacity:0;transition:opacity .25s}.wl-toast.wl-visible{opacity:1}
      .wl-scene-note{position:static;flex:none;padding:0 22px 14px}
      @media(min-width:1450px){.wl-canvas-wrap{height:430px;min-height:400px}.wl-shell{padding-top:40px}}
      @media(max-width:1000px){.wl-shell{padding:25px 25px}.wl-layout{grid-template-columns:minmax(0,1fr) 235px}.wl-aside{padding:22px 20px}.wl-controls{padding:14px}.wl-action{padding:10px}.wl-count{gap:5px}.wl-count strong{font-size:19px}}
      @media(max-width:760px){.wl{min-height:100%}.wl-shell{padding:22px 18px}.wl-header{gap:12px;margin-bottom:21px}.wl-header h1{font-size:26px}.wl-intro{font-size:11px}.wl-back{padding:9px 11px;font-size:10px!important}.wl-topline{padding:12px;align-items:flex-start;gap:15px;flex-wrap:wrap}.wl-caption{margin-right:5px;font-size:9px}.wl-choice{padding:7px 11px}.wl-detect{font-size:11px;margin-left:auto;padding-top:3px}.wl-layout{grid-template-columns:1fr}.wl-stage{border-right:0}.wl-stage-heading{padding:17px 15px 0}.wl-canvas-wrap{height:330px;min-height:300px}.wl-scene-note{left:15px;right:15px;font-size:9px}.wl-aside{border-top:1px solid var(--wl-line);padding:19px;display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.wl-aside h2{font-size:17px;margin:8px 0}.wl-aside p{font-size:11px;margin-bottom:0}.wl-state-note{margin:0;padding:0 0 0 18px;border-top:0;border-left:1px solid var(--wl-line)}.wl-key{display:none}.wl-insights{gap:17px}.wl-insight{padding-left:9px}.wl-insight h3{font-size:11px;line-height:1.5}.wl-insight p{font-size:10px}.wl-insight small{font-size:8px;letter-spacing:0}.wl-count{font-size:9px}.wl-footer{font-size:8px;flex-direction:column;gap:4px}.wl-toast{left:15px;font-size:10px}}
      @media(max-width:760px){.wl-header{display:block;position:relative}.wl-header .wl-eyebrow{padding-right:108px;line-height:1.8;min-height:32px}.wl-header .wl-back{position:absolute;top:0;right:0}.wl-header h1{width:100%;text-wrap:balance}.wl-scene-note{padding:0 15px 13px}}
      @media(prefers-reduced-motion:reduce){.wl *{transition:none!important}}
      </style>
      <div class="wl-shell">
        <header class="wl-header">
          <div><div class="wl-eyebrow">EXPERIMENT 01 / THE DOUBLE SLIT</div><h1>一粒一粒，涌现波纹。</h1><p class="wl-intro">让电子或光子逐个通过双缝。每一次只留下一个点，许多次之后，概率的形状浮现。</p></div>
          <button class="wl-back" type="button" aria-label="返回粒子图谱">↖ 返回图谱</button>
        </header>
        <div class="wl-topline">
          <div class="wl-particles" role="group" aria-label="选择实验粒子"><span class="wl-caption">入射粒子</span><button class="wl-choice" data-particle="electron" type="button" aria-pressed="true"><span class="wl-dot"></span>电子 e⁻</button><button class="wl-choice" data-particle="photon" type="button" aria-pressed="false"><span class="wl-dot"></span>光子 γ</button></div>
          <label class="wl-detect" for="${uid}-detect"><input class="wl-switch" id="${uid}-detect" type="checkbox"><span>记录粒子经过哪条缝</span></label>
        </div>
        <div class="wl-layout">
          <div class="wl-stage">
            <div class="wl-stage-heading"><span class="wl-stage-label">单粒子双缝实验</span><span class="wl-live">等待发射</span></div>
            <div class="wl-canvas-wrap"><canvas class="wl-canvas" aria-label="双缝示意：左侧粒子源、中部双缝、右侧探测屏；探测点逐次累积，未记录路径时形成干涉条纹" role="img"></canvas><div class="wl-toast" aria-live="polite"></div></div>
            <div class="wl-scene-note">波纹表示概率幅的示意，屏幕上的亮点表示一次局域探测；连线不表示已知轨迹。</div>
            <div class="wl-controls"><button class="wl-action wl-action-primary" data-action="single" type="button">＋ 逐个发射</button><button class="wl-action" data-action="run" type="button" aria-pressed="false">▷ 连续发射</button><button class="wl-action" data-action="clear" type="button">清空屏幕</button><div class="wl-count"><span>已探测</span><strong aria-live="off">0</strong><span>次</span></div></div>
          </div>
          <aside class="wl-aside">
            <div><div class="wl-number">观察 / 01</div><h2 class="wl-aside-title">每一次是粒子，<br>分布呈现干涉。</h2><p class="wl-aside-copy">单次探测只出现一个局域亮点。大量重复后，明暗相间的条纹显现：两条路径的概率幅发生干涉。</p></div>
            <div class="wl-state-note"><span class="wl-tag">路径信息：未记录</span><p class="wl-state-copy">两条路径保持相干。无需两个粒子同时在场，逐次累积也能形成干涉分布。</p></div>
            <p class="wl-key">键盘操作：Space 发射一个 · Enter 连续 / 暂停 · C 清空。所有控件均可用 Tab 访问。</p>
          </aside>
        </div>
        <div class="wl-insights">
          <article class="wl-insight"><small>01 / LOCAL DETECTION</small><h3>一个落点，一次探测</h3><p>不记录路径，探测仍然是局域的。波粒二象性不等于粒子在两种外形之间切换。</p></article>
          <article class="wl-insight"><small>02 / PROBABILITY AMPLITUDE</small><h3>振幅相加，再求概率</h3><p>保持相干时，两条路径的概率幅相加；相位关系带来增强与抵消，最终形成干涉。</p></article>
          <article class="wl-insight"><small>03 / WHICH-PATH INFORMATION</small><h3>相互作用改变相干性</h3><p>路径探测使粒子与探测器产生关联，路径间相干消失。关键是物理关联，并非人看了一眼。</p></article>
        </div>
        <footer class="wl-footer"><span>教学模型 · 非真实尺度 / 量子动力学模拟 · 电子与光子的图形参数均未作物理标定</span><span>曲线为相对概率密度，点的位置随机采样。动画速度不是粒子的真实速度。</span></footer>
        <div class="wl-sr" role="status" aria-live="polite"></div>
      </div>`;
    container.appendChild(root);

    var canvas = root.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var wrap = root.querySelector('.wl-canvas-wrap');
    var detectInput = root.querySelector('.wl-switch');
    var runButton = root.querySelector('[data-action="run"]');
    var countElement = root.querySelector('.wl-count strong');
    var liveElement = root.querySelector('.wl-live');
    var toastElement = root.querySelector('.wl-toast');
    var srElement = root.querySelector('.wl-sr');
    var particle = options && options.particle === 'photon' ? 'photon' : 'electron';
    var recording = false;
    var running = false;
    var alive = true;
    var shots = [];
    var hits = [];
    var count = 0;
    var width = 0, height = 0, ratio = 1;
    var prevTime = 0, emitAccumulator = 0;
    var frame = 0, toastTimer = 0;
    var density = [], cumulative = [], maxDensity = 1;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var abort = new AbortController();

    function listen(target, type, callback) {
      target.addEventListener(type, callback, { signal: abort.signal });
    }
    function densityAt(u) {
      var sigma = .42, offset = .17;
      var a = Math.exp(-Math.pow(u + offset, 2) / (4 * sigma * sigma));
      var b = Math.exp(-Math.pow(u - offset, 2) / (4 * sigma * sigma));
      return recording ? a * a + b * b : a * a + b * b + 2 * a * b * Math.cos(12 * Math.PI * u);
    }
    function rebuildDensity() {
      density = []; cumulative = []; maxDensity = 0;
      var total = 0;
      for (var i = 0; i <= 800; i++) {
        var d = Math.max(0, densityAt(i / 400 - 1));
        total += d;
        density.push(d);
        cumulative.push(total);
        maxDensity = Math.max(maxDensity, d);
      }
      for (var j = 0; j < cumulative.length; j++) cumulative[j] /= total;
    }
    function sample() {
      var r = Math.random(), lo = 0, hi = cumulative.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cumulative[mid] < r) lo = mid + 1; else hi = mid; }
      return (lo + Math.random() - .5) / 400 - 1;
    }
    function announce(message) {
      toastElement.textContent = message;
      toastElement.classList.add('wl-visible');
      srElement.textContent = message;
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () { toastElement.classList.remove('wl-visible'); }, 3000);
    }
    function clear(silent) {
      hits = []; shots = []; count = 0; emitAccumulator = 0;
      countElement.textContent = '0';
      if (!silent) announce('屏幕已清空，下一次发射将开始新的累积。');
    }
    function setRunning(value) {
      running = value;
      emitAccumulator = 0;
      runButton.textContent = running ? 'Ⅱ 暂停发射' : '▷ 连续发射';
      runButton.setAttribute('aria-pressed', String(running));
      liveElement.textContent = running ? '连续发射中' : (shots.length ? '等待探测' : '等待发射');
    }
    function emit() {
      if (shots.length >= 80) return;
      shots.push({ u: sample(), slit: Math.random() < .5 ? -1 : 1, age: 0, duration: reducedMotion ? .12 : 1.15, jitter: Math.random() });
      liveElement.textContent = running ? '连续发射中' : '等待探测';
    }
    function updateDescription() {
      root.querySelectorAll('[data-particle]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.particle === particle));
      });
      root.querySelector('.wl-aside-title').innerHTML = recording ? '保留路径信息，<br>干涉不再出现。' : '每一次是粒子，<br>分布呈现干涉。';
      root.querySelector('.wl-aside-copy').textContent = recording ? '每次仍只出现一个局域亮点。两条路径不再保持相干，累积结果趋近两个宽包络的概率之和。' : '单次探测只出现一个局域亮点。大量重复后，明暗相间的条纹显现：两条路径的概率幅发生干涉。';
      root.querySelector('.wl-tag').textContent = recording ? '路径信息：已记录' : '路径信息：未记录';
      root.querySelector('.wl-state-copy').textContent = recording ? '开关代表理想的完整路径探测。粒子与探测器的关联破坏路径间相干；即使没人读取记录，也会失去干涉。' : '两条路径保持相干。无需两个粒子同时在场，逐次累积也能形成干涉分布。';
      var canvasDescription = particle === 'electron'
        ? (recording ? '双缝实验示意。当前为电子，记录路径，无干涉分布。' : '双缝实验示意。当前为电子，未记录路径，有干涉分布。')
        : (recording ? '双缝实验示意。当前为光子，记录路径，无干涉分布。' : '双缝实验示意。当前为光子，未记录路径，有干涉分布。');
      canvas.setAttribute('aria-label', canvasDescription);
    }
    function resize() {
      var rect = wrap.getBoundingClientRect();
      width = Math.max(240, rect.width); height = Math.max(240, rect.height);
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function line(x1, y1, x2, y2, color, lineWidth) {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    function text(str, x, y, color, size, align) {
      str = window.I18n ? window.I18n.t(str) : str;
      ctx.fillStyle = color || '#839b9e'; ctx.font = (size || 10) + 'px "PingFang SC", sans-serif'; ctx.textAlign = align || 'center'; ctx.fillText(str, x, y);
    }
    function dot(x, y, radius, color, glow) {
      ctx.fillStyle = color;
      if (glow) { ctx.shadowBlur = glow; ctx.shadowColor = color; }
      ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.fill(); ctx.shadowBlur = 0;
    }
    function draw(now, delta) {
      var w = width, h = height;
      if (!w || !h) return;
      var mobile = w < 540;
      var sourceX = w * .105, slitX = w * .37, screenX = w * .735;
      var midY = h * .49, range = h * .315, slitGap = h * .07, slitOpening = h * .019;
      var top = midY - range, bottom = midY + range;
      var screenWidth = Math.max(23, w * .065), curveX = w * .88, curveWidth = w * .075;
      var accent = particle === 'electron' ? '#79ead9' : '#e4c987';
      ctx.clearRect(0, 0, w, h);

      // A restrained reference grid keeps the scene readable without suggesting scale.
      ctx.fillStyle = 'rgba(140,191,188,.09)';
      for (var gx = 20; gx < w; gx += 28) for (var gy = 28; gy < h - 24; gy += 28) ctx.fillRect(gx, gy, 1, 1);
      line(sourceX, midY, screenX + screenWidth + 7, midY, 'rgba(121,234,217,.09)');
      ctx.setLineDash([3, 5]);
      line(slitX, top - 10, slitX, bottom + 10, 'rgba(143,172,180,.12)');
      ctx.setLineDash([]);

      // Source, barrier, and a finite display of the detector plane.
      ctx.strokeStyle = 'rgba(121,234,217,.17)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(sourceX, midY, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(sourceX, midY, 27, -.7, .7); ctx.stroke();
      dot(sourceX, midY, 5, accent, 17);
      text(particle === 'electron' ? 'e⁻' : 'γ', sourceX, midY + 4, '#d6ffef', 9);
      text(particle === 'electron' ? '电子源' : '光子源', sourceX, bottom + 25, '#9bb1b3', 10);
      var slitYs = [midY - slitGap, midY + slitGap];
      var barrierTop = top - 12, barrierBottom = bottom + 12;
      line(slitX, barrierTop, slitX, slitYs[0] - slitOpening, '#6d858d', 4);
      line(slitX, slitYs[0] + slitOpening, slitX, slitYs[1] - slitOpening, '#6d858d', 4);
      line(slitX, slitYs[1] + slitOpening, slitX, barrierBottom, '#6d858d', 4);
      slitYs.forEach(function (sy, index) {
        line(slitX - 5, sy - slitOpening, slitX + 5, sy - slitOpening, 'rgba(121,234,217,.6)');
        line(slitX - 5, sy + slitOpening, slitX + 5, sy + slitOpening, 'rgba(121,234,217,.6)');
        if (recording) {
          ctx.strokeStyle = '#e4c987'; ctx.strokeRect(slitX - 10, sy - slitOpening - 6, 20, 2 * slitOpening + 12);
          dot(slitX + 14, sy, 2, '#e4c987');
        }
        text(index === 0 ? 'A' : 'B', slitX - 15, sy + 3, '#617d85', 8);
      });
      text(recording ? '双缝 · 路径探测开启' : '双缝', slitX, bottom + 25, '#9bb1b3', mobile ? 8 : 10);
      ctx.fillStyle = '#0c1920'; ctx.fillRect(screenX - 2, top - 7, screenWidth + 4, 2 * range + 14);
      ctx.strokeStyle = 'rgba(121,234,217,.19)'; ctx.strokeRect(screenX - 2, top - 7, screenWidth + 4, 2 * range + 14);
      text('探测屏', screenX + screenWidth / 2, bottom + 25, '#9bb1b3', 10);
      text('相对概率', curveX + curveWidth / 2, top - 20, '#617e85', mobile ? 8 : 9);
      line(curveX, top - 4, curveX, bottom + 4, 'rgba(121,234,217,.18)');

      // The curve and samples use precisely the same normalized probability model.
      ctx.beginPath(); ctx.moveTo(curveX, top);
      for (var di = 0; di < density.length; di++) ctx.lineTo(curveX + density[di] / maxDensity * curveWidth, top + di / (density.length - 1) * 2 * range);
      ctx.lineTo(curveX, bottom); ctx.closePath();
      ctx.fillStyle = recording ? 'rgba(228,201,135,.075)' : 'rgba(121,234,217,.075)'; ctx.fill();
      ctx.beginPath();
      for (var ci = 0; ci < density.length; ci++) {
        var cx = curveX + density[ci] / maxDensity * curveWidth, cy = top + ci / (density.length - 1) * 2 * range;
        if (!ci) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = recording ? 'rgba(228,201,135,.7)' : 'rgba(121,234,217,.7)'; ctx.lineWidth = 1; ctx.stroke();

      // Soft, expanding probability-amplitude cues are deliberately not trajectories.
      if (!reducedMotion) {
        ctx.save(); ctx.beginPath(); ctx.rect(slitX + 4, top - 6, screenX - slitX - 8, 2 * range + 12); ctx.clip();
        var activity = running || shots.length > 0;
        if (activity) {
          slitYs.forEach(function (sy, si) {
            for (var k = 0; k < 6; k++) {
              var phase = ((now * .00018 + k / 6 + si * .03) % 1);
              var rad = phase * (screenX - slitX) * 1.3;
              ctx.strokeStyle = recording ? 'rgba(228,201,135,' + (.08 * (1 - phase)) + ')' : 'rgba(121,234,217,' + (.16 * (1 - phase)) + ')';
              ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(slitX, sy, rad, -1.2, 1.2); ctx.stroke();
            }
          });
        }
        ctx.restore();
      }

      // Old detections stay on the screen. A bounded point buffer avoids long-session growth.
      for (var hi = 0; hi < hits.length; hi++) {
        var hit = hits[hi];
        var y = midY + hit.u * range, x = screenX + 2 + hit.jitter * (screenWidth - 4);
        var fresh = Math.max(0, 1 - (now - hit.time) / 550);
        dot(x, y, fresh > 0 ? 1.2 + fresh * 1.4 : 1, accent, fresh * 9);
        if (fresh > 0) {
          ctx.strokeStyle = particle === 'electron' ? 'rgba(121,234,217,' + fresh * .45 + ')' : 'rgba(228,201,135,' + fresh * .45 + ')';
          ctx.beginPath(); ctx.arc(x, y, 3 + (1 - fresh) * 9, 0, Math.PI * 2); ctx.stroke();
        }
      }

      var remaining = [];
      shots.forEach(function (shot) {
        shot.age += delta;
        var t = shot.age / shot.duration;
        if (t >= 1) {
          hits.push({ u: shot.u, jitter: shot.jitter, time: now });
          if (hits.length > 10000) hits.shift();
          count++;
          countElement.textContent = count.toLocaleString('zh-CN');
          return;
        }
        remaining.push(shot);
        var splitTime = .36;
        if (t < splitTime) {
          var p = t / splitTime;
          var px = sourceX + (slitX - sourceX - 7) * p;
          // A broad incoming packet, rather than a choice of one path before measurement.
          ctx.strokeStyle = particle === 'electron' ? 'rgba(121,234,217,.55)' : 'rgba(228,201,135,.55)';
          ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, midY, 3, 5 + p * slitGap * 1.3, 0, 0, Math.PI * 2); ctx.stroke();
        } else if (recording) {
          var rp = (t - splitTime) / (1 - splitTime);
          var sy = midY + shot.slit * slitGap;
          var tx = slitX + (screenX - slitX) * rp;
          var ty = sy + (midY + shot.u * range - sy) * rp;
          dot(tx, ty, 2, accent, 7);
          if (rp < .18) dot(slitX + 14, sy, 3, '#e4c987', 12);
        }
      });
      shots = remaining;
      if (!running && shots.length === 0) liveElement.textContent = count ? '等待下一次发射' : '等待发射';
    }
    function tick(now) {
      if (!alive) return;
      var delta = prevTime ? Math.min((now - prevTime) / 1000, .1) : 0;
      prevTime = now;
      if (running && document.visibilityState !== 'hidden') {
        emitAccumulator += delta;
        while (emitAccumulator >= .065) { emit(); emitAccumulator -= .065; }
      }
      draw(now, delta);
      frame = window.requestAnimationFrame(tick);
    }

    listen(root.querySelector('.wl-back'), 'click', function () {
      setRunning(false);
      root.dispatchEvent(new CustomEvent('wavelab:back', { bubbles: true }));
    });
    listen(root.querySelector('[data-action="single"]'), 'click', emit);
    listen(runButton, 'click', function () { setRunning(!running); });
    listen(root.querySelector('[data-action="clear"]'), 'click', function () { clear(false); });
    listen(detectInput, 'change', function () {
      recording = detectInput.checked;
      clear(true); rebuildDensity(); updateDescription();
      announce(recording ? '路径探测已开启，已清空先前结果。现在累积的是无干涉分布。' : '路径探测已关闭，已清空先前结果。现在可以累积干涉条纹。');
    });
    root.querySelectorAll('[data-particle]').forEach(function (button) {
      listen(button, 'click', function () {
        if (particle === button.dataset.particle) return;
        particle = button.dataset.particle;
        clear(true); updateDescription();
        announce(particle === 'electron' ? '已切换为电子。图形参数为示意，没有对应真实速度或波长。' : '已切换为光子。图形参数为示意，没有对应真实速度或波长。');
      });
    });
    listen(window, 'keydown', function (event) {
      if (!root.isConnected || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      // Global shortcuts must not act on the experiment behind a modal dialog.
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])')) return;
      var tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA' || tag === 'SELECT' || (event.target && event.target.isContentEditable)) return;
      if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) emit(); }
      else if (event.code === 'Enter') { event.preventDefault(); if (!event.repeat) setRunning(!running); }
      else if (event.code === 'KeyC') { if (!event.repeat) clear(false); }
    });
    listen(document, 'visibilitychange', function () { prevTime = 0; emitAccumulator = 0; });
    var observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (observer) observer.observe(wrap); else listen(window, 'resize', resize);
    rebuildDensity(); resize(); updateDescription();
    frame = window.requestAnimationFrame(tick);
    teardown = function () {
      alive = false; running = false;
      window.cancelAnimationFrame(frame); window.clearTimeout(toastTimer);
      abort.abort(); if (observer) observer.disconnect();
      root.remove(); hits = []; shots = [];
    };
    return { root: root, emit: emit, clear: function () { clear(false); } };
  }

  function unmount() {
    if (teardown) { var dispose = teardown; teardown = null; dispose(); }
  }

  window.WaveLab = { mount: mount, unmount: unmount };
})();
