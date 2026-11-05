/* Articulação dos personagens: separa braço, arma, cabeça, cauda etc. em peças
 * que se mexem de verdade durante o ataque. Cada peça é o próprio desenho,
 * recortado por um polígono e girado em torno de uma articulação. */
(function (R) {
  'use strict';

  // poly: recorte da peça (coordenadas do viewBox) · pivot: articulação
  // wind: pose de preparação · hit: pose do golpe (r = graus, x/y = deslocamento)
  // mode: melee (avança) · ranged (fica no lugar) · hop (pula) · dive (mergulha)
  const CFG = {
    // ---------- heróis ----------
    knight: { mode: 'melee', parts: { arm: { poly: [[120, 86], [150, 84], [163, 160], [166, 178], [158, 330], [144, 330], [141, 184], [128, 178], [118, 130]], pivot: [140, 92], wind: { r: -150 }, hit: { r: -52 } } } },
    mage: { mode: 'ranged', parts: {
      staff: { poly: [[10, 18], [62, 18], [62, 110], [50, 178], [44, 324], [24, 324], [30, 110], [10, 70]], pivot: [47, 150], wind: { r: -22 }, hit: { r: 32 } },
      hand: { poly: [[120, 100], [142, 78], [172, 74], [178, 108], [150, 132], [124, 130]], pivot: [120, 112], wind: { r: -30 }, hit: { r: 14, x: 10 } } } },
    archer: { mode: 'ranged', parts: {
      arm: { poly: [[116, 95], [152, 95], [160, 178], [152, 198], [122, 190], [110, 150]], pivot: [120, 100], wind: { r: 8, x: -24 }, hit: { r: -4, x: 8 } },
      bow: { poly: [[6, 6], [54, 6], [58, 326], [6, 326]], pivot: [40, 170], wind: { r: -5 }, hit: { r: 4, x: 4 } } } },

    // ---------- chefes ----------
    rei_goblin: { mode: 'melee', parts: { arm: { poly: [[140, -4], [194, -4], [194, 196], [148, 196]], pivot: [166, 202], wind: { r: -35 }, hit: { r: 78 } } } },
    bruxa: { mode: 'ranged', parts: {
      head: { keep: true, poly: [[68, 0], [174, 0], [174, 96], [150, 116], [95, 116], [68, 96]], pivot: [115, 112], wind: { r: -6, x: -6 }, hit: { r: 8, x: 12, y: 6 } } } },
    orc_chefe: { mode: 'melee', parts: { arm: { poly: [[140, 24], [208, 24], [208, 112], [163, 112], [163, 176], [148, 176]], pivot: [156, 180], wind: { r: -40 }, hit: { r: 82 } } } },
    dragao: { mode: 'melee', parts: {
      head: { keep: true, poly: [[50, 0], [152, 0], [152, 132], [100, 144], [50, 128]], pivot: [100, 125], wind: { r: -4, y: -4 }, hit: { r: 6, x: 8, y: 10 } },
      tail: { keep: true, poly: [[150, 236], [200, 236], [200, 288], [140, 292], [140, 256]], pivot: [140, 256], wind: { r: 10 }, hit: { r: -25 } } } },
    lorde: { mode: 'melee', parts: { arm: { poly: [[150, 14], [196, 14], [198, 290], [165, 290], [150, 215], [150, 170], [155, 100]], pivot: [172, 195], wind: { r: -30 }, hit: { r: 72 } } } },

    // ---------- monstros ----------
    slime: { mode: 'hop', parts: {} },
    goblin: { mode: 'melee', flip: true, parts: { arm: { poly: [[10, 62], [48, 62], [62, 95], [70, 110], [45, 126], [28, 108], [12, 88]], pivot: [62, 100], wind: { r: 50 }, hit: { r: -45 } } } },
    lobo: { mode: 'melee', flip: true, parts: {
      head: { keep: true, poly: [[4, 56], [62, 56], [66, 100], [40, 110], [10, 106]], pivot: [62, 90], wind: { r: 10, x: 6 }, hit: { r: -10, x: -9, y: 6 } },
      tail: { keep: true, poly: [[128, 52], [160, 52], [160, 106], [134, 96]], pivot: [130, 95], wind: { r: -8 }, hit: { r: 14 } } } },
    sapo: { mode: 'hop', parts: {} },
    esqueleto: { mode: 'melee', parts: { arm: { poly: [[80, 50], [105, 52], [155, 10], [160, 28], [112, 102], [95, 104], [88, 85]], pivot: [88, 58], wind: { r: -35 }, hit: { r: 85 } } } },
    morcego: { mode: 'dive', parts: {} },
    aranha: { mode: 'hop', parts: {
      legsR: { keep: true, poly: [[104, 38], [158, 38], [158, 128], [120, 128], [100, 80]], pivot: [100, 80], wind: { r: -20 }, hit: { r: 26 } },
      legsL: { keep: true, poly: [[2, 38], [56, 38], [40, 128], [2, 128]], pivot: [58, 80], wind: { r: 20 }, hit: { r: -26 } } } },
    orc: { mode: 'melee', parts: { arm: { poly: [[112, 4], [160, 4], [160, 68], [134, 74], [128, 62], [118, 62], [112, 40]], pivot: [124, 66], wind: { r: -35 }, hit: { r: 82 } } } },
    troll: { mode: 'melee', parts: { arm: { poly: [[112, -4], [164, -4], [164, 75], [152, 114], [130, 114], [122, 90], [108, 50]], pivot: [135, 100], wind: { r: -30 }, hit: { r: 82 } } } },
    lobo_gelo: { mode: 'melee', flip: true, parts: {
      head: { keep: true, poly: [[6, 60], [64, 60], [68, 104], [40, 114], [10, 108]], pivot: [64, 92], wind: { r: 10, x: 6 }, hit: { r: -10, x: -9, y: 6 } },
      tail: { keep: true, poly: [[130, 54], [160, 54], [160, 108], [136, 98]], pivot: [132, 96], wind: { r: -8 }, hit: { r: 14 } } } },
    golem: { mode: 'melee', parts: { arm: { poly: [[125, 60], [158, 60], [158, 126], [138, 136], [122, 112]], pivot: [130, 72], wind: { r: -35 }, hit: { r: 55 } } } },
    cavaleiro: { mode: 'melee', parts: { arm: { poly: [[128, 4], [154, 4], [156, 126], [135, 130], [127, 82]], pivot: [140, 100], wind: { r: -30 }, hit: { r: 75 } } } },
    gargula: { mode: 'hop', parts: {
      wingR: { keep: true, poly: [[118, 36], [158, 36], [158, 112], [118, 114], [108, 70]], pivot: [112, 82], wind: { r: -14 }, hit: { r: 24 } },
      wingL: { keep: true, poly: [[2, 36], [42, 36], [52, 70], [42, 114], [2, 112]], pivot: [48, 82], wind: { r: 14 }, hit: { r: -24 } } } },
  };

  const NS = 'http://www.w3.org/2000/svg';
  const poly = (p) => 'M' + p.map((q) => q.join(' ')).join(' L') + ' Z';

  // devolve o svg do sprite já dividido em peças (ou null se não houver ficha)
  function make(id) {
    const cfg = CFG[id], base = R.SPRITES[id];
    if (!cfg || !base) return null;
    const open = base.indexOf('>') + 1, close = base.lastIndexOf('</svg>');
    const head = base.slice(0, open), inner = base.slice(open, close);
    const names = Object.keys(cfg.parts);
    let defs = `<clipPath id="rc-${id}-body" clip-rule="evenodd"><path clip-rule="evenodd" d="M-80 -80 H320 V420 H-80 Z ${names.filter((n) => !cfg.parts[n].keep).map((n) => poly(cfg.parts[n].poly)).join(' ')}"/></clipPath>`;
    names.forEach((n) => { defs += `<clipPath id="rc-${id}-${n}"><path d="${poly(cfg.parts[n].poly)}"/></clipPath>`; });
    let out = head + `<defs>${defs}</defs><g class="rg-body">${inner}</g>`;
    names.forEach((n) => {
      const c = cfg.parts[n];
      out += `<g class="rg-part" data-part="${n}" style="display:none;transform-box:view-box;transform-origin:${c.pivot[0]}px ${c.pivot[1]}px"><g clip-path="url(#rc-${id}-${n})">${inner}</g></g>`;
    });
    return out + '</svg>';
  }

  const pose = (p) => (p ? `translate(${p.x || 0}px, ${p.y || 0}px) rotate(${p.r || 0}deg)` : 'none');

  // controla um sprite já inserido na página
  function control(spr, id) {
    const cfg = CFG[id];
    if (!cfg) return null;
    const svg = spr.querySelector('svg'), body = svg && svg.querySelector('.rg-body');
    if (!body) return null;
    const parts = {};
    svg.querySelectorAll('.rg-part').forEach((g) => { parts[g.dataset.part] = g; });
    const T = 900, CONTACT = 0.5;
    const cut = (on) => {
      if (on) body.setAttribute('clip-path', `url(#rc-${id}-body)`); else body.removeAttribute('clip-path');
      Object.values(parts).forEach((g) => { g.style.display = on ? '' : 'none'; });
    };
    return {
      cfg,
      // dx: distância até o alvo (px de tela, com sinal) · sx: lado para onde ele olha
      // resolve no instante do contato; o resto do movimento continua sozinho
      attack({ dx = 0, sx = 1, mode, speed = 1 }) {
        mode = mode || cfg.mode;
        const dur = T / speed;
        cut(true);
        const run = [];
        Object.keys(parts).forEach((n) => {
          const c = cfg.parts[n];
          run.push(parts[n].animate([
            { transform: 'none', easing: 'ease-out' },
            { transform: pose(c.wind), offset: 0.3, easing: 'cubic-bezier(.5,0,.9,.4)' },
            { transform: pose(c.hit), offset: CONTACT },
            { transform: pose(c.hit), offset: 0.64, easing: 'ease-in-out' },
            { transform: 'none' }], { duration: dur }));
        });
        let go = dx;
        if (mode === 'ranged') go = dx * 0.16;
        const lift = mode === 'hop' ? -46 : mode === 'dive' ? -20 : 0;
        const tilt = mode === 'dive' ? 24 * sx : 5 * sx;
        run.push(spr.animate([
          { translate: '0 0', rotate: '0deg', easing: 'ease-out' },
          { translate: `${-14 * sx}px ${mode === 'hop' ? 6 : 0}px`, rotate: `${-4 * sx}deg`, offset: 0.3, easing: 'cubic-bezier(.4,0,.8,.5)' },
          { translate: `${go * 0.55}px ${lift}px`, rotate: `${tilt * 0.4}deg`, offset: 0.42 },
          { translate: `${go}px ${mode === 'hop' ? 0 : 0}px`, rotate: `${tilt}deg`, offset: CONTACT },
          { translate: `${go}px 0`, rotate: `${tilt}deg`, offset: 0.64, easing: 'ease-in-out' },
          { translate: '0 0', rotate: '0deg' }], { duration: dur }));
        Promise.all(run.map((a) => a.finished.catch(() => null))).then(() => cut(false));
        return new Promise((res) => setTimeout(res, dur * CONTACT));
      },
    };
  }

  R.rig = { CFG, make, control };
})(window.RPG);
