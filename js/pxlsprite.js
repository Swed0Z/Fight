/* Personagens em pixel art (quadros gerados com a ferramenta pxl, MIT: https://github.com/crsolver/claude-pxl).
 * Dados em js/pxldata.js. Cada personagem tem as animações: idle, attack, hurt, cast, guard, dead. */
(function (R) {
  'use strict';
  const D = R.PXL || {};
  const MODE = { mage: 'ranged', archer: 'ranged', bruxa: 'ranged', morcego: 'dive', slime: 'hop', sapo: 'hop', aranha: 'hop', gargula: 'hop' };
  const FRAME = 56;
  const imgs = {};

  function sheetOf(id) { for (const k in D) if (D[k].chars.indexOf(id) >= 0) return D[k]; return null; }
  function load(sh) {
    if (!imgs[sh.name]) { const im = new Image(); im.src = sh.img; imgs[sh.name] = im; }
    return imgs[sh.name];
  }
  const has = (id) => !!sheetOf(id);

  function control(spr, id) {
    const sh = sheetOf(id);
    if (!sh) return null;
    const img = load(sh);
    const canvas = document.createElement('canvas');
    canvas.className = 'pxs';
    canvas.width = canvas.height = FRAME;
    spr.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const anims = {};
    ['idle', 'attack', 'hurt', 'cast', 'guard', 'dead'].forEach((n) => {
      const t = sh.tags[id + '_' + n];
      anims[n] = t ? sh.frames.slice(t[0], t[1] + 1) : null;
    });
    const contact = sh.contact[id] != null ? sh.contact[id] : 3;
    let state = 'idle', fi = 0, timer = 0, token = 0, dead = false, curSpeed = 1, dissolving = false;

    const draw = (f) => { ctx.clearRect(0, 0, FRAME, FRAME); ctx.drawImage(img, f[0], f[1], FRAME, FRAME, 0, 0, FRAME, FRAME); };
    function size() {
      const w = spr.clientWidth || 160, k = Math.max(1, Math.floor(w / FRAME));
      canvas.style.width = canvas.style.height = FRAME * k + 'px';
    }
    if (window.ResizeObserver) new ResizeObserver(size).observe(spr);
    size();

    function step(speed) {
      curSpeed = speed;
      clearTimeout(timer);
      const my = token, a = anims[state];
      if (!a) return;
      const f = a[fi];
      draw(f);
      const hold = state === 'dead' && fi === a.length - 1;
      if (hold) return;
      timer = setTimeout(() => {
        if (my !== token) return;
        fi++;
        if (fi >= a.length) {
          if (state === 'idle') fi = 0; else { state = 'idle'; fi = 0; }
        }
        step(speed);
      }, f[4] / (state === 'idle' ? 1 : speed || 1));
    }
    function play(name, speed) {
      if (dead && name !== 'dead') return;
      if (!anims[name]) return;
      token++; state = name; fi = 0;
      step(speed || 1);
    }
    function whenImg(fn) { if (img.complete && img.naturalWidth) fn(); else img.addEventListener('load', fn, { once: true }); }
    whenImg(() => step(1));

    // reage às classes de animação que o jogo coloca no sprite
    const watch = () => {
      const c = spr.classList;
      if (c.contains('dead')) { play('dead'); dead = true; setTimeout(dissolve, 260); }
      else if (c.contains('hit')) play('hurt');
      else if (c.contains('cast')) play('cast');
      else if (c.contains('guard')) play('guard');
    };
    new MutationObserver(watch).observe(spr, { attributes: true, attributeFilter: ['class'] });

    // pausa no golpe: congela quadros e movimentos por alguns instantes
    let fz = 0;
    function freeze(ms) {
      if (!ms || dead) return;
      clearTimeout(timer); token++;
      const my = token, an = spr.getAnimations();
      an.forEach((a) => a.pause());
      clearTimeout(fz);
      fz = setTimeout(() => { an.forEach((a) => { try { a.play(); } catch (e) {} }); if (my === token) step(curSpeed); }, ms);
    }
    // flash branco e depois avermelhado ao tomar dano
    function flash(ms) {
      canvas.classList.remove('flash', 'flash2'); void canvas.offsetWidth;
      canvas.classList.add('flash');
      setTimeout(() => { canvas.classList.remove('flash'); canvas.classList.add('flash2'); }, ms || 90);
      setTimeout(() => canvas.classList.remove('flash2'), (ms || 90) + 140);
    }
    // morte: o sprite se desfaz em pixels que sobem
    function dissolve() {
      if (dissolving) return; dissolving = true;
      clearTimeout(timer);
      const a = anims.dead, f = a ? a[a.length - 1] : null; if (!f) return;
      draw(f);
      const id = ctx.getImageData(0, 0, FRAME, FRAME), px = [];
      for (let y = 0; y < FRAME; y++) for (let x = 0; x < FRAME; x++) {
        const i = (y * FRAME + x) * 4;
        if (id.data[i + 3] > 40) px.push({ x, y, c: `rgb(${id.data[i]},${id.data[i + 1]},${id.data[i + 2]})`, th: 0.15 + Math.random() * 0.85 - (FRAME - y) / FRAME * 0.0, v: 6 + Math.random() * 16, dx: (Math.random() - 0.5) * 6 });
      }
      px.forEach((p) => { p.th = Math.min(0.98, 0.1 + Math.random() * 0.9 + (p.y / FRAME) * 0.0); });
      const T = 620, t0 = performance.now();
      (function fr(now) {
        const t = Math.min(1, (now - t0) / T);
        ctx.clearRect(0, 0, FRAME, FRAME);
        for (const p of px) {
          if (t >= p.th) continue;
          ctx.fillStyle = t > p.th - 0.25 ? '#fff' : p.c;
          ctx.fillRect(Math.round(p.x + p.dx * t), Math.round(p.y - p.v * t * t * 3), 1, 1);
        }
        if (t < 1) requestAnimationFrame(fr); else ctx.clearRect(0, 0, FRAME, FRAME);
      })(t0);
    }

    return {
      px: true,
      play, freeze, flash,
      // dx: distância até o alvo (px de tela, com sinal) · sx: lado para onde ele olha
      // resolve no instante do contato; o resto continua sozinho
      attack({ dx = 0, sx = 1, mode, speed = 1 }) {
        mode = mode || MODE[id] || 'melee';
        const a = anims.attack;
        if (!a) return Promise.resolve();
        const tot = a.reduce((s, f) => s + f[4], 0) / speed;
        const tc = a.slice(0, contact).reduce((s, f) => s + f[4], 0) / speed;
        const hold = a[contact][4] / speed;
        play('attack', speed);
        let go = dx;
        if (mode === 'ranged') go = dx * 0.14;
        const lift = mode === 'hop' ? -40 : mode === 'dive' ? -18 : 0;
        const o1 = Math.max(0.05, (tc - 90 / speed) / tot), o2 = tc / tot, o3 = Math.min(0.97, (tc + hold) / tot);
        spr.animate([
          { translate: '0 0', easing: 'ease-in' },
          { translate: `${-8 * sx}px 0`, offset: Math.min(o1, 0.3), easing: 'ease-in' },
          { translate: `${go}px ${lift}px`, offset: o2, easing: 'ease-out' },
          { translate: `${go}px 0`, offset: o3, easing: 'ease-in-out' },
          { translate: '0 0' }], { duration: tot });
        return new Promise((res) => setTimeout(res, tc));
      },
    };
  }

  R.pxl = { has, control };
})(window.RPG);
