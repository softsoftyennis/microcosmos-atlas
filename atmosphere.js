/* Decorative quantum dust: an artistic depth cue, never measured particle
   density, an atom's inventory, or a model of classical particle trajectories. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const PALETTE = ['#9fdedb', '#d3e9e9', '#b6a3dc', '#e7ce98', '#779cba'];

  function create({ seed = 742319 } = {}) {
    let state = (Number(seed) >>> 0) || 742319;
    const random = () => {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
    const normal = () => Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))) * Math.cos(TAU * random());
    const sprites = [];
    const makeSprite = (color, star) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = star ? 96 : 192;
      const c = canvas.getContext('2d');
      const s = canvas.width, m = s / 2;
      const gradient = c.createRadialGradient(m, m, 0, m, m, m);
      gradient.addColorStop(0, color + (star ? 'ff' : '62'));
      gradient.addColorStop(star ? .06 : .18, color + (star ? 'b8' : '42'));
      gradient.addColorStop(.35, color + (star ? '19' : '20'));
      gradient.addColorStop(1, color + '00');
      c.fillStyle = gradient; c.fillRect(0, 0, s, s);
      if (star) {
        c.strokeStyle = color + 'a8';
        c.lineWidth = 1.2;
        c.beginPath(); c.moveTo(m, m - 21); c.lineTo(m, m + 21);
        c.moveTo(m - 21, m); c.lineTo(m + 21, m); c.stroke();
        c.fillStyle = '#f2ffff'; c.fillRect(m - 2.5, m - 2.5, 5, 5);
        c.fillRect(m - .8, m - 8, 1.6, 16);
        c.fillRect(m - 8, m - .8, 16, 1.6);
      }
      return canvas;
    };
    PALETTE.forEach(color => sprites.push(makeSprite(color, true)));
    const fogSprites = [makeSprite('#54a6b1', false), makeSprite('#886abb', false), makeSprite('#be935d', false)];

    // All coordinates are bounded in units of the graph radius. Their loose
    // spiral structure becomes a tilted stellar river, without enclosing nodes
    // in rings. Two populations interleave, so reducing density stays uniform.
    const stars = Array.from({ length: 6800 }, (_, i) => {
      const type = random();
      let x, y, z, fog = false;
      if (type < .70) {
        const radius = .13 + Math.pow(random(), .66) * 2.0;
        const arm = Math.floor(random() * 3);
        const angle = arm * TAU / 3 + radius * 2.25 + normal() * (.15 + radius * .08);
        const u = Math.cos(angle) * radius;
        const v = Math.sin(angle) * radius;
        x = u; y = u * .42 + v * .31 + normal() * .105;
        z = v * .78 - .48 + normal() * .17;
        fog = true;
      } else if (type < .90) {
        const u = (random() * 2 - 1) * 2.35;
        const v = normal() * .48;
        x = u; y = u * .43 + v + normal() * .11;
        z = (random() * 2 - 1) * 1.32 - .3;
      } else {
        const u = random() * 2 - 1, a = random() * TAU;
        const radius = 1.2 + random() * 1.4;
        x = Math.sqrt(1 - u * u) * Math.cos(a) * radius;
        y = u * radius * .72;
        z = Math.sqrt(1 - u * u) * Math.sin(a) * radius * .69 - .25;
      }
      const colorRand = random();
      const color = colorRand < .44 ? 0 : colorRand < .68 ? 1 : colorRand < .83 ? 2 : colorRand < .91 ? 3 : 4;
      const luminous = random();
      return {
        x, y, z, color, fog,
        size: luminous > .978 ? 2 : luminous > .77 ? 1 : 0,
        alpha: .23 + Math.pow(random(), .8) * .65,
        phase: random() * TAU, speed: .27 + random() * .48,
        bright: i % 73 === 0,
        rank: random()
      };
    });
    const mist = Array.from({ length: 17 }, (_, i) => {
      const radius = .48 + random() * 1.1, arm = i % 3;
      const angle = arm * TAU / 3 + radius * 2.25;
      const u = Math.cos(angle) * radius, v = Math.sin(angle) * radius;
      return { x: u, y: u * .42 + v * .31, z: v * .78 - .56, radius: .45 + random() * .48, color: i % 7 === 0 ? 2 : i % 3 === 0 ? 1 : 0, phase: random() * TAU };
    });
    // Fixed fill styles, eight alpha levels and three sizes: ordinary stars use
    // batched fillRect calls, with no per-star gradients, paths, or CSS strings.
    const buckets = Array.from({ length: PALETTE.length * 8 * 3 }, () => []);
    const sparkles = [];
    let disposed = false;

    function draw(ctx, options = {}) {
      if (disposed) return;
      const { W, H, time = 0, project } = options;
      if (!W || !H || typeof project !== 'function') return;
      const amount = clamp(Number.isFinite(options.amount) ? options.amount : .8, 0, 1);
      if (amount <= .001) return;
      const center = options.center || [0, 0, 0], bound = Math.max(.001, Number(options.bound) || 1);
      const zoom = Math.max(.2, Number(options.zoom) || 1);
      const zoomCompensation = Math.pow(zoom, .72);
      const centerPoint = project(center);
      if (!centerPoint || !Number.isFinite(centerPoint.x) || !Number.isFinite(centerPoint.y)) return;
      const cx = centerPoint.x, cy = centerPoint.y;
      const compact = W < 650;
      const population = compact ? 2850 : 6800;
      const count = Math.round(population * (.28 + amount * .72));
      const strength = amount * .93;
      const top = Math.min(150, H * .23), bottom = Math.min(100, H * .16);
      const maskAt = (x, y) => {
        const topFade = clamp((y - top * .35) / Math.max(1, top * .8), 0, 1);
        const bottomFade = clamp((H - y - bottom * .18) / Math.max(1, bottom * .82), 0, 1);
        const dx = (x - W * .51) / Math.max(1, W * .31);
        const dy = (y - H * .55) / Math.max(1, H * .36);
        // A transparent window through the river keeps relation lines readable.
        const centerFade = .58 + .42 * clamp((dx * dx + dy * dy) * .65, 0, 1);
        return topFade * bottomFade * centerFade;
      };
      const projected = (x, y, z) => {
        const p = project([center[0] + x * bound, center[1] + y * bound, center[2] + z * bound]);
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.persp <= .12 || p.persp > 4.2) return null;
        p.x = cx + (p.x - cx) / zoomCompensation;
        p.y = cy + (p.y - cy) / zoomCompensation;
        return p;
      };
      for (let i = 0; i < buckets.length; i++) buckets[i].length = 0;
      sparkles.length = 0;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Pre-rendered colored vapour, kept very faint at the graph's centre.
      const ruler = projected(1, 0, -.45);
      const origin = projected(0, 0, -.45);
      const pixelScale = ruler && origin ? clamp(Math.hypot(ruler.x - origin.x, ruler.y - origin.y), 40, W * .55) : Math.min(W, H) * .31;
      for (let i = 0; i < mist.length; i++) {
        const q = mist[i], p = projected(q.x, q.y, q.z);
        if (!p) continue;
        const mask = maskAt(p.x, p.y);
        if (mask <= 0) continue;
        const radius = q.radius * pixelScale * clamp(p.persp, .6, 1.5);
        ctx.globalAlpha = strength * mask * (q.color === 2 ? .11 : .16) * (.94 + Math.sin(time * .12 + q.phase) * .06);
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-.38 - (options.yaw || 0) * .08);
        ctx.drawImage(fogSprites[q.color], -radius * 1.7, -radius * .9, radius * 3.4, radius * 1.8); ctx.restore();
      }
      // Interleaved deterministic sampling preserves the whole spatial volume
      // at mobile density and when the dust amount is reduced.
      const stride = 6800 / count;
      for (let n = 0; n < count; n++) {
        const q = stars[Math.min(6799, Math.floor(n * stride))];
        const drift = Math.sin(time * .085 + q.phase) * .0035;
        const p = projected(q.x + drift, q.y + drift * .35, q.z);
        if (!p || p.x < -30 || p.x > W + 30 || p.y < 0 || p.y > H) continue;
        const mask = maskAt(p.x, p.y);
        if (mask < .015) continue;
        const twinkle = .79 + Math.sin(time * q.speed + q.phase) * .13 + Math.sin(time * q.speed * .49 + q.phase * 2) * .08;
        const alpha = clamp(q.alpha * twinkle * mask * strength * (q.fog ? 1.43 : 1.30), 0, 1);
        const alphaIndex = clamp(Math.floor(alpha * 8), 0, 7);
        if (alphaIndex === 0 && alpha < .045) continue;
        const scale = clamp(Math.sqrt(p.persp), .74, 1.35);
        const size = (q.size === 0 ? .74 : q.size === 1 ? 1.20 : 1.72) * scale;
        const bucket = buckets[(q.color * 8 + alphaIndex) * 3 + q.size];
        bucket.push(p.x, p.y, size);
        if (q.bright && alpha > .12 && !compact) sparkles.push(p.x, p.y, 26 + q.size * 7, q.color, alpha);
        else if (q.bright && alpha > .16 && compact) sparkles.push(p.x, p.y, 18, q.color, alpha * .85);
      }
      for (let color = 0; color < PALETTE.length; color++) {
        ctx.fillStyle = PALETTE[color];
        for (let a = 0; a < 8; a++) {
          ctx.globalAlpha = (a + .65) / 8;
          for (let size = 0; size < 3; size++) {
            const bucket = buckets[(color * 8 + a) * 3 + size];
            for (let j = 0; j < bucket.length; j += 3) {
              const s = bucket[j + 2]; ctx.fillRect(bucket[j], bucket[j + 1], s, s);
            }
          }
        }
      }
      for (let i = 0; i < sparkles.length; i += 5) {
        const size = sparkles[i + 2]; ctx.globalAlpha = Math.min(1, sparkles[i + 4] * 1.04);
        ctx.drawImage(sprites[sparkles[i + 3]], sparkles[i] - size / 2, sparkles[i + 1] - size / 2, size, size);
      }
      // One short, restrained glimmer about every nine seconds; its direction
      // follows a projected 3D segment, with no implied physical trajectory.
      const cycle = Math.floor(time / 9.3), progress = (time % 9.3) / 9.3;
      if (amount > .45 && progress > .77 && progress < .805) {
        const q = stars[(cycle * 941 + 613) % stars.length];
        const t = (progress - .77) / .035;
        const p = projected(q.x + t * .18, q.y + t * .04, q.z);
        const tail = projected(q.x + t * .18 - .09, q.y + t * .04 - .02, q.z);
        if (p && tail) {
          ctx.globalAlpha = Math.sin(t * Math.PI) * strength * maskAt(p.x, p.y) * .25;
          ctx.strokeStyle = '#c7e8e1'; ctx.lineWidth = .75;
          ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }
      ctx.restore();
    }
    return {
      draw,
      destroy() {
        disposed = true;
        stars.length = mist.length = sparkles.length = 0;
        buckets.forEach(bucket => { bucket.length = 0; });
        sprites.concat(fogSprites).forEach(canvas => { canvas.width = canvas.height = 1; });
      }
    };
  }
  window.ParticleAtmosphere = { create };
})();
