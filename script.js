/* ══════════════════════════════════════════
   script5.js — Sage Green Timeline
   2-column card grid + firefly animation
   Timeline: 12:00 AM → 11:30 PM
   ══════════════════════════════════════════ */

/* ── Build 2-column card grid ── */
(function buildTimeline() {
  const wrap = document.getElementById('cards-wrap');
  if (!wrap) return;

  for (let m = 0; m <= 23 * 60 + 30; m += 30) {
    const h    = Math.floor(m / 60);
    const min  = m % 60;
    const dh   = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';

    const card = document.createElement('div');
    card.className = 'time-card' + (min === 0 ? ' on-hour' : '');
    card.innerHTML = `
      <span class="card-time">${dh}:${min === 0 ? '00' : '30'} ${ampm}</span>
      <span class="card-event"></span>
    `;
    wrap.appendChild(card);
  }
})();


/* ── Floating leaves & fireflies animation ── */
(function setupAnimation() {
  const canvas = document.getElementById('leaf-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Firefly glowing dots */
  const flies = Array.from({ length: 55 }, () => ({
    x:     rnd(0, 1), y: rnd(0, 1),
    r:     rnd(1.5, 3.5),
    phase: rnd(0, Math.PI * 2),
    speed: rnd(0.012, 0.030),
    drift: rnd(-0.0003, 0.0003),
    rise:  rnd(-0.0004, -0.0001),
  }));

  /* Leaf/floral glyphs drifting down */
  const LEAFS = ['🍃', '✿', '·', '❀', '˖'];
  const leaves = Array.from({ length: 28 }, () => ({
    x:      rnd(0, 1), y: rnd(0, 1),
    g:      LEAFS[Math.floor(Math.random() * LEAFS.length)],
    size:   rnd(10, 18),
    speed:  rnd(0.0003, 0.0009),
    drift:  rnd(-0.0002, 0.0002),
    rot:    rnd(0, Math.PI * 2),
    rotSpd: rnd(-0.01, 0.01),
    alpha:  rnd(0.12, 0.32),
    age:    rnd(0, 999),
  }));

  /* Click burst particles */
  const bursts = [];
  document.addEventListener('click', e => {
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + rnd(-0.3, 0.3);
      bursts.push({
        x:    e.clientX, y: e.clientY,
        vx:   Math.cos(ang) * rnd(1.5, 4.5),
        vy:   Math.sin(ang) * rnd(1.5, 4.5),
        r:    rnd(2, 5),
        life: 0,
        max:  rnd(35, 65),
        hue:  rnd(110, 150),
      });
    }
    while (bursts.length > 200) bursts.shift();
  });

  let t = 0;
  function loop() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;

    /* Fireflies */
    for (const f of flies) {
      f.x += f.drift;
      f.y += f.rise;
      if (f.y < -0.02) { f.y = 1.02; f.x = rnd(0, 1); }

      const glow = 0.3 + 0.7 * Math.abs(Math.sin(f.phase + t * f.speed));
      ctx.save();
      ctx.globalAlpha = glow * 0.55;
      const g = ctx.createRadialGradient(f.x * W, f.y * H, 0, f.x * W, f.y * H, f.r * 3);
      g.addColorStop(0, `hsl(${rnd(100, 145)},70%,62%)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x * W, f.y * H, f.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* Leaf glyphs */
    for (const l of leaves) {
      l.age++;
      l.x += l.drift + Math.sin(l.age * 0.008) * 0.0003;
      l.y += l.speed;
      l.rot += l.rotSpd;
      if (l.y > 1.05) { l.y = -0.05; l.x = rnd(0, 1); }

      ctx.save();
      ctx.translate(l.x * W, l.y * H);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.alpha;
      ctx.font = `${l.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(l.g, 0, 0);
      ctx.restore();
    }

    /* Burst particles */
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.life++; b.x += b.vx; b.y += b.vy; b.vy += 0.06;
      const a = 1 - b.life / b.max;
      ctx.save();
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = `hsl(${b.hue},65%,55%)`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (b.life >= b.max) bursts.splice(i, 1);
    }

    requestAnimationFrame(loop);
  }
  loop();
})();