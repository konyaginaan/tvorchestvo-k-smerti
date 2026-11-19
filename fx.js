// Живые кадры: воздух, свет, дым и запахи поверх акварели. Общий файл для всех страниц сайта.
(function () {
const style = document.createElement('style');
style.textContent = "/* живые кадры: слой эффектов, совпадающий с картинкой */\n.fx { position: absolute; pointer-events: none; opacity: 0; transform: scale(1.08); transition: opacity 2.5s ease-out .6s, transform 14s ease-out; }\n.on > .fx, .on .half > .fx { opacity: 1; transform: scale(1); }\n.fx > * { position: absolute; }\n.fx * { animation-play-state: paused !important; }\n.live .fx * { animation-play-state: running !important; }\n.fx canvas { inset: 0; width: 100%; height: 100%; }\n.glow { aspect-ratio: 1; border-radius: 50%; mix-blend-mode: screen; transform: translate(-50%, -50%); will-change: opacity, transform; }\n.glow.flicker { animation: flicker 3.4s ease-in-out infinite; }\n.glow.breathe { animation: breathe 6.5s ease-in-out infinite; }\n.glow.glint { animation: glint 5.5s ease-in-out infinite; }\n.glow.firework { animation: firework 4.8s ease-out infinite; }\n@keyframes flicker { 0% { opacity: .82; transform: translate(-50%,-50%) scale(1); } 14% { opacity: 1; transform: translate(-50%,-52%) scale(1.05); } 27% { opacity: .78; transform: translate(-50%,-49%) scale(.97); } 41% { opacity: .95; transform: translate(-50%,-51%) scale(1.03); } 55% { opacity: .8; transform: translate(-50%,-50%) scale(.98); } 70% { opacity: 1; transform: translate(-50%,-52%) scale(1.06); } 85% { opacity: .86; transform: translate(-50%,-50%) scale(1); } 100% { opacity: .82; transform: translate(-50%,-50%) scale(1); } }\n@keyframes breathe { 0%, 100% { opacity: .5; transform: translate(-50%,-50%) scale(.93); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.07); } }\n@keyframes glint { 0%, 62%, 100% { opacity: .15; transform: translate(-50%,-50%) scale(.8); } 76% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); } }\n@keyframes firework { 0% { opacity: 0; transform: translate(-50%,-50%) scale(.3); } 12% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 55% { opacity: .35; transform: translate(-50%,-50%) scale(1.25); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1.35); } }\n.fog { inset: 0; overflow: hidden; mix-blend-mode: screen; }\n.fog i { position: absolute; top: 0; left: -50%; width: 200%; height: 100%; filter: blur(18px); animation: drift 26s ease-in-out infinite alternate; }\n.fog i:nth-child(2) { animation-duration: 37s; animation-direction: alternate-reverse; opacity: .8; }\n.fog.bottom { -webkit-mask-image: linear-gradient(to top, #000 0%, #000 30%, transparent 78%); mask-image: linear-gradient(to top, #000 0%, #000 30%, transparent 78%); }\n.fog.top { -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 20%, transparent 55%); mask-image: linear-gradient(to bottom, #000 0%, #000 20%, transparent 55%); }\n.fog.middle { -webkit-mask-image: radial-gradient(ellipse 70% 60% at 60% 55%, #000 30%, transparent 75%); mask-image: radial-gradient(ellipse 70% 60% at 60% 55%, #000 30%, transparent 75%); }\n@keyframes drift { from { transform: translateX(0); } to { transform: translateX(22%); } }\n.rays { inset: 0; mix-blend-mode: screen; background: repeating-linear-gradient(118deg, rgba(255,232,195,0) 0 4%, rgba(255,232,195,.13) 5% 8%, rgba(255,232,195,0) 9% 14%); -webkit-mask-image: radial-gradient(ellipse 60% 70% at 70% 15%, #000 20%, transparent 75%); mask-image: radial-gradient(ellipse 60% 70% at 70% 15%, #000 20%, transparent 75%); animation: rays 9s ease-in-out infinite; }\n@keyframes rays { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }\n.ribbons { inset: 0; width: 100%; height: 100%; overflow: visible; mix-blend-mode: screen; filter: blur(2.5px) drop-shadow(0 0 10px rgba(255,220,170,.35)); }\n.ribbons path { fill: none; stroke-linecap: round; animation: flow linear infinite; }\n@keyframes flow { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }\n.silence.on img { animation: silence 7s ease-in-out infinite; }\n@keyframes silence { 0%, 100% { filter: brightness(.5) saturate(.8); } 50% { filter: brightness(.75) saturate(.9); } }\n\n";
document.head.appendChild(style);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
// ── живые кадры: воздух, свет, дым и запахи поверх акварели ──
// координаты — в процентах от картинки (x — по ширине, y — по высоте)
const W = (c, a) => 'rgba(' + c + ',' + a + ')';
const FX = {
  '01-cover': {
    ribbons: [
      { pts: [[102,40],[80,46],[62,52],[46,57],[38,60]], c: '227,167,129', w: 10, dur: 9 },
      { pts: [[100,62],[84,58],[66,62],[50,64],[40,62]], c: '201,138,132', w: 8, dur: 11, delay: 2 },
      { pts: [[96,28],[78,34],[60,42],[46,50],[39,56]], c: '138,160,200', w: 7, dur: 13, delay: 4 },
      { pts: [[-2,50],[10,54],[22,58],[29,60]], c: '210,190,120', w: 7, dur: 10, delay: 1 }
    ],
    dust: { n: 26, r: [58,48,100,95], c: '255,236,210' }
  },
  '02-market': { dust: { n: 30, r: [0,0,100,100], c: '255,232,195', size: [1,2.2] } },
  '03-fire': {
    glows: [{ x: 50, y: 70, s: 80, c: '255,160,70', a: .32, k: 'flicker' }],
    smoke: { x: 50, y: 96, sp: 14, rate: .5, c: '230,215,200', R: 120 },
    embers: { x: 50, y: 96, sp: 16, rate: .35, c: '255,190,110' }
  },
  '04-flask': {
    glows: [{ x: 80, y: 44, s: 16, c: '255,205,130', a: .6, k: 'flicker' }, { x: 61, y: 24, s: 15, c: '255,175,80', a: .45, k: 'breathe' }],
    ribbons: [
      { pts: [[61,22],[66,12],[76,6],[90,2],[104,0]], c: '227,167,129', w: 8, dur: 10 },
      { pts: [[60,26],[50,30],[38,26],[26,30],[12,24]], c: '190,130,170', w: 6, dur: 12, delay: 3 }
    ]
  },
  '05-baldini': {
    glows: [{ x: 61, y: 90, s: 14, c: '255,190,120', a: .35, k: 'breathe' }],
    ribbons: [
      { pts: [[61,86],[58,60],[55,38],[48,18],[40,0]], c: '220,150,180', w: 10, dur: 11 },
      { pts: [[62,86],[66,62],[70,40],[76,20],[84,0]], c: '150,190,150', w: 8, dur: 13, delay: 3 },
      { pts: [[60,88],[62,64],[60,42],[64,22],[62,0]], c: '230,190,130', w: 7, dur: 9, delay: 6 }
    ]
  },
  '06-bourgeois': { rays: true, dust: { n: 70, r: [28,0,92,75], c: '255,234,200', size: [1,2.6] } },
  '07-nurse': { dust: { n: 24, r: [0,0,100,60], c: '255,240,215' } },
  '09-plums': {
    ribbons: [
      { pts: [[67,24],[58,30],[48,36],[38,40],[28,44]], c: '255,190,90', w: 12, dur: 7 },
      { pts: [[68,28],[60,26],[50,30],[40,36],[29,46]], c: '255,150,110', w: 8, dur: 9, delay: 2 },
      { pts: [[66,20],[60,14],[52,18],[44,28],[30,42]], c: '255,215,140', w: 6, dur: 11, delay: 4 }
    ],
    glows: [{ x: 37, y: 11, s: 11, c: '255,170,200', a: .5, k: 'firework' }],
    dust: { n: 20, r: [30,15,75,55], c: '255,215,150', size: [1,2] }
  },
  '10-bridge': {
    glows: [{ x: 89, y: 7, s: 12, c: '230,235,255', a: .35, k: 'breathe' }, { x: 75, y: 38, s: 10, c: '255,190,110', a: .4, k: 'flicker' }],
    glints: { n: 34, r: [40,58,100,100], c: '255,235,200' },
    fall: { x: 72, y: 62, sp: 7, rate: .4, c: '200,190,180' }
  },
  '11-boy': {
    ribbons: [
      { pts: [[46,32],[36,24],[26,30],[20,18],[10,10]], c: '230,170,90', w: 10, dur: 12 },
      { pts: [[47,30],[56,20],[66,26],[74,14],[86,8]], c: '210,140,170', w: 9, dur: 10, delay: 2 },
      { pts: [[46,34],[58,38],[70,34],[82,40],[96,32]], c: '140,180,140', w: 8, dur: 14, delay: 4 },
      { pts: [[45,30],[42,18],[50,10],[60,4],[70,0]], c: '150,165,210', w: 7, dur: 11, delay: 6 }
    ],
    dust: { n: 22, r: [10,0,90,60], c: '255,232,200' }
  },
  '12-cave': {
    fog: { c: '214,214,232', a: .2, m: 'middle' },
    glows: [{ x: 66, y: 52, s: 40, c: '200,205,240', a: .08, k: 'breathe' }]
  },
  '13-workshop': {
    glows: [{ x: 95, y: 36, s: 14, c: '255,205,130', a: .55, k: 'flicker' }, { x: 50, y: 77, s: 9, c: '255,170,70', a: .7, k: 'breathe' }],
    dust: { n: 18, r: [40,10,100,70], c: '255,225,180', size: [1,1.8] }
  },
  '14-morning': { fog: { c: '238,214,222', a: .5, m: 'bottom' } },
  '15-mountain': {
    glows: [{ x: 54, y: 63, s: 38, c: '255,175,85', a: .42, k: 'breathe' }],
    fog: { c: '210,205,205', a: .4, m: 'top' }
  },
  '16-scaffold': {
    glows: [{ x: 68, y: 30, s: 42, c: '255,205,120', a: .32, k: 'breathe' }],
    ribbons: [
      { pts: [[68,30],[56,26],[44,30],[30,24],[14,28],[-2,22]], c: '255,205,120', w: 12, dur: 9 },
      { pts: [[68,34],[58,40],[46,36],[32,44],[18,40],[2,46]], c: '255,180,100', w: 9, dur: 11, delay: 3 },
      { pts: [[69,28],[74,18],[66,10],[56,6],[44,2]], c: '255,220,150', w: 7, dur: 13, delay: 5 }
    ],
    dust: { n: 30, r: [20,0,95,60], c: '255,220,160', size: [1,2.2] }
  },
  '17-office': {
    glows: [{ x: 12, y: 19, s: 16, c: '255,200,130', a: .4, k: 'flicker' }],
    ribbons: [
      { pts: [[32,52],[40,44],[50,46],[58,38],[66,36]], c: '220,215,235', w: 14, dur: 14 },
      { pts: [[34,48],[44,50],[52,42],[62,42],[70,34]], c: '200,195,220', w: 9, dur: 18, delay: 5 }
    ]
  },
  '18-dawn': {
    smoke: { x: 46, y: 74, sp: 2, rate: .22, c: '225,215,215', R: 70, thin: true },
    glows: [{ x: 68, y: 45, s: 30, c: '255,190,140', a: .35, k: 'breathe' }, { x: 61, y: 85, s: 6, c: '255,232,180', a: .6, k: 'glint' }]
  }
};

function smoothPath(pts) {
  let d = 'M' + pts[0][0] + ' ' + pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + c1.join(' ') + ' ' + c2.join(' ') + ' ' + p2.join(' ');
  }
  return d;
}

const stages = [];
function buildFx() {
  document.querySelectorAll('.scene .bg').forEach(bg => {
    if (bg.closest('.chapter-title')) return;
    const m = (bg.getAttribute('src') || '').match(/(\d\d-[\w-]+)\.(webp|mp4)/);
    const cfg = m && (FX[m[1]] || FX[m[1].replace(/-bg$/, '')]); if (!cfg) return;
    const st = document.createElement('div'); st.className = 'fx';
    (cfg.glows || []).forEach(g => {
      const el = document.createElement('i'); el.className = 'glow ' + g.k;
      const ga = Math.min(1, g.a * 1.6); el.style.cssText = 'left:' + g.x + '%;top:' + g.y + '%;width:' + g.s + '%;background:radial-gradient(circle,' + W(g.c, ga) + ' 0%,' + W(g.c, ga * .5) + ' 32%,' + W(g.c, 0) + ' 70%)';
      el.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
      st.appendChild(el);
    });
    if (cfg.fog) {
      const f = document.createElement('div'); f.className = 'fog ' + cfg.fog.m;
      const c = cfg.fog.c, a = cfg.fog.a;
      const layer = pos => 'radial-gradient(ellipse 26% 20% at ' + pos[0] + ' ' + pos[1] + ',' + W(c, a) + ',' + W(c, 0) + ' 70%),radial-gradient(ellipse 30% 24% at ' + pos[2] + ' ' + pos[3] + ',' + W(c, a * .8) + ',' + W(c, 0) + ' 70%),radial-gradient(ellipse 22% 18% at ' + pos[4] + ' ' + pos[5] + ',' + W(c, a * .9) + ',' + W(c, 0) + ' 70%)';
      f.innerHTML = '<i style="background:' + layer(['15%','62%','45%','48%','78%','66%']) + '"></i><i style="background:' + layer(['30%','40%','62%','70%','90%','45%']) + '"></i>';
      st.appendChild(f);
    }
    if (cfg.rays) { const r = document.createElement('div'); r.className = 'rays'; st.appendChild(r); }
    if (cfg.ribbons) {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'ribbons');
      svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
      cfg.ribbons.forEach(rb => {
        [0, 1].forEach(k => {
          const p = document.createElementNS(ns, 'path');
          p.setAttribute('d', smoothPath(rb.pts.map(([x, y]) => [x, y + k * 1.4])));
          p.setAttribute('pathLength', '100');
          p.setAttribute('vector-effect', 'non-scaling-stroke');
          p.setAttribute('stroke', W(rb.c, k ? .45 : .85));
          p.setAttribute('stroke-width', rb.w * (k ? 2.2 : 1.3));
          p.setAttribute('stroke-dasharray', k ? '30 70' : '26 74');
          p.style.animationDuration = (rb.dur * (k ? 1.3 : 1)) + 's';
          p.style.animationDelay = (-(rb.delay || 0) - k * 2) + 's';
          svg.appendChild(p);
        });
      });
      st.appendChild(svg);
    }
    let canvas = null;
    if (cfg.dust || cfg.smoke || cfg.embers || cfg.fall || cfg.glints) { canvas = document.createElement('canvas'); st.appendChild(canvas); }
    bg.after(st);
    stages.push({ bg, st, cfg, canvas, scene: bg.closest('.scene'), parts: [] });
  });
  layoutFx();
}

function layoutFx() {
  stages.forEach(s => {
    const box = s.bg.parentElement, Wd = box.clientWidth, H = box.clientHeight;
    const ar = (s.bg.naturalWidth && s.bg.naturalHeight) ? s.bg.naturalWidth / s.bg.naturalHeight : (s.bg.videoWidth ? s.bg.videoWidth / s.bg.videoHeight : 2);
    const op = getComputedStyle(s.bg).objectPosition.split(' ').map(v => parseFloat(v) / 100);
    let w, h, l, t;
    if (Wd / H > ar) { w = Wd; h = Wd / ar; l = 0; t = (H - h) * (isNaN(op[1]) ? .5 : op[1]); }
    else { h = H; w = H * ar; t = 0; l = (Wd - w) * (isNaN(op[0]) ? .5 : op[0]); }
    Object.assign(s.st.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: h + 'px', transformOrigin: (Wd / 2 - l) + 'px ' + (H / 2 - t) + 'px' });
    if (s.canvas) {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      s.canvas.width = Math.round(w * dpr); s.canvas.height = Math.round(h * dpr);
      s.w = w; s.h = h; s.dpr = dpr; s.parts = []; s.seeded = false;
    }
  });
}

// частицы: пыль, дым, искры, падающая пыль, блики на воде
const rnd = (a, b) => a + Math.random() * (b - a);
function seed(s) {
  const c = s.cfg;
  if (c.dust) for (let i = 0; i < c.dust.n; i++) s.parts.push({ t: 'dust', x: rnd(c.dust.r[0], c.dust.r[2]), y: rnd(c.dust.r[1], c.dust.r[3]), vx: rnd(-.02, .03), vy: rnd(-.05, -.012), sz: rnd(...(c.dust.size || [1, 2.4])), ph: rnd(0, 6.28), sp: rnd(.6, 1.6) });
  if (c.glints) for (let i = 0; i < c.glints.n; i++) s.parts.push({ t: 'glint', x: rnd(c.glints.r[0], c.glints.r[2]), y: rnd(c.glints.r[1], c.glints.r[3]), len: rnd(.6, 2.4), ph: rnd(0, 6.28), sp: rnd(.5, 1.4) });
  s.seeded = true;
}
function spawn(s, kind, src) {
  if (kind === 'smoke') s.parts.push({ t: 'smoke', x: src.x + rnd(-src.sp, src.sp) / 2, y: src.y, vx: rnd(-.02, .02), vy: rnd(-.09, -.05) * (src.thin ? .7 : 1), r: rnd(4, 10), life: 0, max: rnd(260, 380) });
  if (kind === 'ember') s.parts.push({ t: 'ember', x: src.x + rnd(-src.sp, src.sp) / 2, y: src.y, vx: rnd(-.05, .05), vy: rnd(-.32, -.16), life: 0, max: rnd(70, 140), sz: rnd(1, 2.2) });
  if (kind === 'fall') s.parts.push({ t: 'fall', x: src.x + rnd(-src.sp, src.sp) / 2, y: src.y, vx: rnd(-.01, .01), vy: rnd(.08, .2), life: 0, max: rnd(120, 220), sz: rnd(.8, 1.8) });
}
function step(s, time) {
  const ctx = s.canvas.getContext('2d'), c = s.cfg, w = s.w, h = s.h, k = s.dpr;
  if (!s.seeded) seed(s);
  if (c.smoke && Math.random() < c.smoke.rate) spawn(s, 'smoke', c.smoke);
  if (c.embers && Math.random() < c.embers.rate) spawn(s, 'ember', c.embers);
  if (c.fall && Math.random() < c.fall.rate) spawn(s, 'fall', c.fall);
  ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, w, h);
  const keep = [];
  for (const p of s.parts) {
    const X = p.x / 100 * w, Y = p.y / 100 * h, u = w / 1000;
    if (p.t === 'dust') {
      p.x += p.vx; p.y += p.vy;
      const r = c.dust.r; if (p.y < r[1]) p.y = r[3]; if (p.x > r[2]) p.x = r[0]; if (p.x < r[0]) p.x = r[2];
      const a = .35 + .65 * (.5 + .5 * Math.sin(time / 1000 * p.sp + p.ph));
      ctx.fillStyle = W(c.dust.c, a); ctx.shadowColor = W(c.dust.c, a); ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(X, Y, p.sz * u * 2.1, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0; keep.push(p);
    } else if (p.t === 'glint') {
      const a = Math.max(0, Math.sin(time / 1000 * p.sp + p.ph)) ** 6 * .9;
      if (a > .02) { ctx.strokeStyle = W(c.glints.c, a); ctx.lineWidth = 2 * u + .8; ctx.beginPath(); ctx.moveTo(X - p.len * u * 6, Y); ctx.lineTo(X + p.len * u * 6, Y); ctx.stroke(); }
      keep.push(p);
    } else if (p.t === 'smoke') {
      p.life++; p.x += p.vx + Math.sin((p.life + p.r * 10) / 40) * .02; p.y += p.vy; p.r += .25;
      const f = p.life / p.max, a = (f < .2 ? f / .2 : 1 - (f - .2) / .8) * (c.smoke.thin ? .2 : .22);
      const R = Math.min(p.r, c.smoke.R) * u * 2.2;
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, R); g.addColorStop(0, W(c.smoke.c, a)); g.addColorStop(1, W(c.smoke.c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, R, 0, 6.283); ctx.fill();
      if (p.life < p.max) keep.push(p);
    } else if (p.t === 'ember' || p.t === 'fall') {
      p.life++; p.x += p.vx + (p.t === 'ember' ? Math.sin(p.life / 9) * .03 : 0); p.y += p.vy;
      const f = p.life / p.max, a = (1 - f) * (p.t === 'ember' ? (.6 + .4 * Math.sin(p.life / 3)) : .55);
      ctx.fillStyle = W(p.t === 'ember' ? c.embers.c : c.fall.c, Math.max(0, a)); ctx.beginPath(); ctx.arc(X, Y, p.sz * u * 2.2, 0, 6.283); ctx.fill();
      if (p.life < p.max) keep.push(p);
    }
  }
  s.parts = keep;
}
function loop(time) {
  stages.forEach(s => { if (s.canvas && s.scene.classList.contains('live')) step(s, time); });
  requestAnimationFrame(loop);
}

// сцена «живёт», только пока видна
const lio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('live', e.isIntersecting)), { threshold: 0 });

// глубина при прокрутке: кадр и его воздух чуть отстают от текста
function parallax() {
  stages.forEach(s => {
    const r = s.scene.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    const py = Math.max(-36, Math.min(36, ((r.top + r.height / 2) - innerHeight / 2) / innerHeight * -28));
    s.bg.style.translate = '0 ' + py.toFixed(1) + 'px'; s.st.style.translate = '0 ' + py.toFixed(1) + 'px';
  });
}

if (!calm) {
  buildFx();
  document.querySelectorAll('.scene img.bg').forEach(img => { if (!img.complete) img.addEventListener('load', layoutFx, { once: true }); });
  addEventListener('resize', () => { clearTimeout(window.__fxT); window.__fxT = setTimeout(layoutFx, 150); });
  if (window.FX_MODE !== 'show') {
    document.querySelectorAll('.scene').forEach(s => lio.observe(s));
    addEventListener('scroll', parallax, { passive: true });
    parallax();
  }
  requestAnimationFrame(loop);
}
window.FXAPI = { layoutFx, stages };
})();
