// Бумажный театр: фон, вырезанная фигура с белой каймой и тенью, бумажный передний план.
// При прокрутке (а в режиме показа — со временем) камера «въезжает» в сцену:
// дальний план почти неподвижен, фигура и передний план приближаются быстрее.
(function () {
  const css = `
.theatre { position: absolute; inset: 0; overflow: hidden; }
.t-stage { position: absolute; }
.t-stage > .t-bg { scale: calc(1 + var(--p, 0) * .06); }
.t-fig { position: absolute; height: auto; transform-origin: 50% 100%; opacity: 0; transform: translateY(46px);
  scale: calc(1 + var(--p, 0) * .34); translate: 0 calc(var(--p, 0) * 3%);
  filter: drop-shadow(1.6px 0 0 #F1E8D7) drop-shadow(-1.6px 0 0 #F1E8D7) drop-shadow(0 1.6px 0 #F1E8D7) drop-shadow(0 -1.6px 0 #F1E8D7) drop-shadow(12px 14px 10px rgba(0,0,0,.5));
  transition: opacity 1.2s ease-out .5s, transform 1.5s cubic-bezier(.2,.8,.25,1.12) .5s;
  animation: t-sway 7.5s ease-in-out infinite; }
.on .t-fig { opacity: 1; transform: none; }
@keyframes t-sway { 0%, 100% { rotate: -.9deg; } 50% { rotate: .9deg; } }
.t-front { position: absolute; inset: 0; pointer-events: none; transform-origin: 50% 100%;
  scale: calc(1 + var(--p, 0) * .5); translate: 0 calc(var(--p, 0) * 7%);
  filter: drop-shadow(0 -2px 0 #F1E8D7) drop-shadow(0 -12px 16px rgba(0,0,0,.5)); }
.t-front img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
  clip-path: polygon(0 100%, 0 79%, 5% 77%, 10% 80%, 16% 79%, 21% 83%, 25% 88%, 29% 92%, 34% 93.5%, 39% 92%, 44% 90%, 50% 91%, 57% 89%, 63% 92%, 70% 90%, 78% 93%, 86% 91%, 93% 94%, 100% 92%, 100% 100%); }
.on .t-stage > .fx { opacity: 1; transform: scale(1); }
@media (prefers-reduced-motion: reduce) { .t-fig { animation: none; transition: none; opacity: 1; transform: none; } }
`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = window.FX_MODE === 'show';
  const items = [...document.querySelectorAll('.theatre')].map(el => ({ el, stage: el.querySelector('.t-stage'), scene: el.closest('.scene'), t0: 0 }));
  if (!items.length) return;

  function layout() {
    items.forEach(it => {
      const W = it.el.clientWidth, H = it.el.clientHeight, ar = 2;
      const px = (W / H < 1) ? (parseFloat(it.el.dataset.x || '50') / 100) : .5;
      let w, h, l, t;
      if (W / H > ar) { w = W; h = W / ar; l = 0; t = (H - h) / 2; }
      else { h = H; w = H * ar; t = 0; l = (W - w) * px; }
      Object.assign(it.stage.style, { left: l + 'px', top: t + 'px', width: w + 'px', height: h + 'px' });
    });
    if (window.FXAPI) FXAPI.layoutFx();
  }
  layout();
  addEventListener('resize', layout);

  const ease = x => 1 - Math.pow(1 - x, 3);
  function frame(now) {
    items.forEach(it => {
      let p = 0;
      if (!calm) {
        if (show) {
          const live = it.scene && it.scene.classList.contains('current');
          if (live && !it.t0) it.t0 = now;
          if (!live) it.t0 = 0;
          p = it.t0 ? ease(Math.min(1, (now - it.t0) / 15000)) * .32 : 0;
        } else {
          const r = it.el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          const scroll = Math.max(0, Math.min(1, -r.top / r.height));
          if (!it.t0) it.t0 = now;
          const drift = ease(Math.min(1, (now - it.t0) / 12000)) * .12;
          p = Math.max(drift, scroll * .9);
        }
      }
      it.el.style.setProperty('--p', p.toFixed(4));
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
