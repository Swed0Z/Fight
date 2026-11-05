/* Lógica principal: estado, mapa, combate, loja, missões e salvamento */
(function () {
  'use strict';
  const { CLASSES, ITEMS, MONSTERS, LOCATIONS, QUESTS, SPRITES, STORY } = window.RPG;
  const sfx = (n) => window.RPG.sfx && window.RPG.sfx(n);

  const SAVE_KEY = 'briga-de-rua-save-v2';
  const MAX_LEVEL = 20;
  const LOC_ORDER = ['vila', 'floresta', 'pantano', 'cavernas', 'montanha', 'castelo'];

  let G = null;          // estado do jogador
  let battle = null;     // combate em andamento
  let ui = { sel: 'vila', shopTab: 'weapon' };

  /* ---------- utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'svg') e.innerHTML = v; // somente sprites internos (confiáveis)
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return e;
  }

  function show(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    const t = h('div', { class: 'toast' }, msg);
    $('#toasts').append(t);
    setTimeout(() => t.remove(), 3200);
  }

  function closeModal() { const o = $('#overlay'); if (o) o.remove(); }
  function modal(title, body, buttons) {
    closeModal();
    const btns = (buttons || [{ label: 'Fechar' }]).map((b) =>
      h('button', { class: 'btn ' + (b.cls || ''), disabled: b.disabled, onclick: () => { if (!b.keep) closeModal(); if (b.fn) b.fn(); } }, b.label));
    const panel = h('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' },
      h('h2', {}, title), h('div', { class: 'panel-body' }, body), h('div', { class: 'panel-actions' }, btns));
    document.body.append(h('div', { id: 'overlay', class: 'overlay' }, panel));
  }

  /* ---------- estatísticas ---------- */
  const lv = (k) => Math.round(CLASSES[G.cls].base[k] + CLASSES[G.cls].grow[k] * (G.level - 1));
  const maxHp = () => lv('hp');
  const maxMp = () => lv('mp');
  const atk = () => lv('atk') + ITEMS[G.weapon].atk;
  const def = () => lv('def') + ITEMS[G.armor].def;
  const xpNext = (L) => Math.round(30 * Math.pow(L, 1.5));
  const skills = () => CLASSES[G.cls].skills.filter((s) => s.lvl <= G.level);

  function newGame(name, cls) {
    G = {
      v: 2, name, cls, level: 1, xp: 0, gold: 30,
      weapon: 'w_' + cls + '_0', armor: 'a_0',
      owned: ['w_' + cls + '_0', 'a_0'],
      inv: { potion: 3, potionG: 0, ether: 1 },
      hp: 0, mp: 0, loc: 'vila', quests: {}, bosses: {}, kills: {}, won: false,
    };
    G.hp = maxHp(); G.mp = maxMp();
    ui.sel = 'vila';
    save();
  }

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* armazenamento indisponível */ }
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || d.v !== 2 || !CLASSES[d.cls] || !ITEMS[d.weapon] || !ITEMS[d.armor]) return null;
      return d;
    } catch (e) { return null; }
  }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignora */ } }

  function gainXp(n) {
    const msgs = [];
    if (G.level >= MAX_LEVEL) return msgs;
    G.xp += n;
    while (G.level < MAX_LEVEL && G.xp >= xpNext(G.level)) {
      G.xp -= xpNext(G.level);
      G.level++;
      const learned = CLASSES[G.cls].skills.filter((s) => s.lvl === G.level);
      msgs.push(`Nível ${G.level}! HP e MP restaurados.` + (learned.length ? ` Nova habilidade: ${learned.map((s) => s.name).join(', ')}.` : ''));
      G.hp = maxHp(); G.mp = maxMp();
    }
    if (G.level >= MAX_LEVEL) G.xp = 0;
    return msgs;
  }

  /* ---------- missões ---------- */
  const questById = (id) => QUESTS.find((q) => q.id === id);
  function questAvailable(q) {
    if (G.quests[q.id]) return false;
    if (G.level < q.req.level) return false;
    if (q.req.quest && !(G.quests[q.req.quest] && G.quests[q.req.quest].state === 'turned')) return false;
    return true;
  }
  function questKill(monId) {
    const done = [];
    for (const q of QUESTS) {
      const st = G.quests[q.id];
      if (st && st.state === 'active' && q.goal.monster === monId) {
        st.n = Math.min(q.goal.count, st.n + 1);
        if (st.n >= q.goal.count) { st.state = 'done'; done.push(q.name); }
      }
    }
    return done;
  }

  /* ---------- tela inicial e criação ---------- */
  function showTitle() {
    const has = !!loadSave();
    $('#btnContinue').disabled = !has;
    $('#titleStep1').classList.remove('hidden');
    $('#titleStep2').classList.add('hidden');
    show('title');
  }

  let createCls = 'knight';
  function buildCreate() {
    const box = $('#classCards');
    box.replaceChildren();
    Object.values(CLASSES).forEach((c) => {
      const card = h('button', { type: 'button', class: 'classCard' + (c.id === createCls ? ' sel' : ''), onclick: () => { createCls = c.id; buildCreate(); } },
        h('div', { class: 'portrait', svg: SPRITES[c.id] }),
        h('h3', {}, c.icon + ' ' + c.name),
        h('p', {}, c.desc),
        h('ul', { class: 'mini' },
          h('li', {}, `HP ${c.base.hp} · MP ${c.base.mp}`),
          h('li', {}, `Ataque ${c.base.atk} · Defesa ${c.base.def}`),
          h('li', {}, 'Habilidade: ' + c.skills[0].name)));
      box.append(card);
    });
  }

  /* ---------- hub (mapa) ---------- */
  const bar = (cur, max, cls) => h('div', { class: 'bar ' + cls }, h('i', { style: `width:${clamp((cur / max) * 100, 0, 100)}%` }));

  function isUnlocked(loc) { return !loc.unlock || !!G.bosses[loc.unlock]; }

  function renderHub() {
    show('hub');
    const root = $('#hub');
    root.replaceChildren();
    const c = CLASSES[G.cls];
    const needXp = G.level >= MAX_LEVEL ? 1 : xpNext(G.level);

    root.append(h('div', { class: 'hud' },
      h('div', { class: 'hud-id' }, h('div', { class: 'mini-portrait', svg: SPRITES[G.cls] }),
        h('div', {}, h('strong', {}, G.name), h('span', {}, `${c.name} · Nível ${G.level}`))),
      h('div', { class: 'hud-bars' },
        h('label', {}, `HP ${G.hp}/${maxHp()}`), bar(G.hp, maxHp(), 'hp'),
        h('label', {}, `MP ${G.mp}/${maxMp()}`), bar(G.mp, maxMp(), 'mp'),
        h('label', {}, G.level >= MAX_LEVEL ? 'XP máximo' : `XP ${G.xp}/${needXp}`), bar(G.xp, needXp, 'xp')),
      h('div', { class: 'hud-gold' }, '🪙 ' + G.gold),
      h('div', { class: 'hud-btns' },
        h('button', { class: 'btn small', onclick: openCharacter }, 'Personagem'),
        h('button', { class: 'btn small', onclick: () => openQuests(false) }, 'Diário'),
        h('button', { class: 'btn small', onclick: openMenu }, 'Menu'))));

    root.append(h('div', { class: 'hub-main' }, buildMap(), h('div', { id: 'locPanel', class: 'locPanel' })));
    renderLocPanel();
  }

  function buildMap() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 800 480');
    svg.setAttribute('class', 'worldmap');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Mapa do reino de Ravenhold');
    const add = (tag, attrs, parent) => {
      const e = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      (parent || svg).append(e);
      return e;
    };
    // fundo e decorações
    const defs = add('defs', {});
    const grad = add('radialGradient', { id: 'parch', cx: '50%', cy: '50%', r: '75%' }, defs);
    add('stop', { offset: '0%', 'stop-color': '#ecd9a6' }, grad);
    add('stop', { offset: '100%', 'stop-color': '#b98f55' }, grad);
    add('rect', { x: 0, y: 0, width: 800, height: 480, fill: 'url(#parch)' });
    add('path', { d: 'M0 90 Q120 60 200 120 T400 100 T620 70 T800 40 V0 H0Z', fill: '#9cb08a', opacity: '.35' });
    add('path', { d: 'M-10 440 Q150 400 300 450 T600 430 T820 460 V490 H-10Z', fill: '#7fa7c4', opacity: '.35' });
    [[60, 140], [90, 180], [180, 300], [210, 120], [340, 300], [470, 140], [610, 300], [760, 230], [600, 410], [330, 440], [150, 440]].forEach(([x, y]) => {
      add('path', { d: `M${x} ${y} l9 -22 l9 22z M${x + 10} ${y + 5} l8 -18 l8 18z`, fill: '#4d7a3a', opacity: '.55' });
    });
    [[560, 60], [610, 90], [740, 90], [470, 330], [450, 80]].forEach(([x, y]) => {
      add('path', { d: `M${x} ${y} l16 -34 l12 18 l10 -14 l16 30z`, fill: '#7d6a55', opacity: '.55' });
    });
    // estradas
    for (let i = 0; i < LOC_ORDER.length - 1; i++) {
      const a = LOCATIONS[LOC_ORDER[i]], b = LOCATIONS[LOC_ORDER[i + 1]];
      const open = i === 0 || isUnlocked(b);
      add('path', { d: `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 40} ${b.x} ${b.y}`, fill: 'none', stroke: open ? '#5a3b1e' : '#8a7a62', 'stroke-width': 3, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' });
    }
    // locais
    LOC_ORDER.forEach((id) => {
      const L = LOCATIONS[id];
      const locked = !L.town && !isUnlocked(L);
      const g = add('g', { class: 'node' + (ui.sel === id ? ' sel' : '') + (locked ? ' locked' : '') + (G.loc === id ? ' here' : ''), tabindex: 0, role: 'button', 'aria-label': L.name + (locked ? ' (bloqueado)' : '') });
      add('circle', { cx: L.x, cy: L.y, r: 30, class: 'ring' }, g);
      add('circle', { cx: L.x, cy: L.y, r: 24, class: 'disc' }, g);
      const t = add('text', { x: L.x, y: L.y + 9, 'text-anchor': 'middle', 'font-size': 26 }, g);
      t.textContent = locked ? '🔒' : L.icon;
      const lab = add('text', { x: L.x, y: L.y + 50, 'text-anchor': 'middle', class: 'lbl' }, g);
      lab.textContent = L.name;
      const choose = () => { ui.sel = id; renderHub(); };
      g.addEventListener('click', choose);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    });
    return h('div', { class: 'mapwrap' }, svg);
  }

  function renderLocPanel() {
    const L = LOCATIONS[ui.sel];
    const p = $('#locPanel');
    p.replaceChildren();
    const locked = !L.town && !isUnlocked(L);
    p.append(h('h2', {}, L.icon + ' ' + L.name), h('p', { class: 'desc' }, L.desc));
    if (L.town) {
      p.append(h('div', { class: 'acts' },
        h('button', { class: 'btn', onclick: () => { G.loc = 'vila'; openShop(); } }, '⚒️ Loja do Ferreiro'),
        h('button', { class: 'btn', onclick: openInn }, '🛏️ Estalagem'),
        h('button', { class: 'btn', onclick: () => openQuests(true) }, '📜 Quadro de Missões')));
      return;
    }
    if (locked) {
      const need = MONSTERS[L.unlock].name;
      p.append(h('p', { class: 'warn' }, `🔒 Bloqueado. Derrote ${need} para abrir o caminho.`));
      return;
    }
    const risk = G.level < L.minLevel ? `⚠️ Recomendado: nível ${L.minLevel}+. Você está abaixo.` : `Nível recomendado: ${L.minLevel}+`;
    p.append(h('p', { class: G.level < L.minLevel ? 'warn' : 'muted' }, risk),
      h('p', { class: 'muted' }, 'Inimigos: ' + L.pool.map((m) => MONSTERS[m].name).join(', ')));
    const boss = MONSTERS[L.boss];
    p.append(h('div', { class: 'acts' },
      h('button', { class: 'btn', onclick: () => explore(L.id) }, '🧭 Explorar'),
      h('button', { class: 'btn danger', onclick: () => confirmBoss(L) }, `☠️ Desafiar ${boss.name}` + (G.bosses[L.boss] ? ' (derrotado)' : ''))));
  }

  function confirmBoss(L) {
    modal('Desafiar o chefe?', h('p', {}, `${MONSTERS[L.boss].name} é um adversário perigoso. Recupere HP e MP antes da luta. Fugir não é possível.`),
      [{ label: 'Cancelar' }, { label: 'Lutar!', cls: 'danger', fn: () => { G.loc = L.id; startBattle(L.boss, L.id); } }]);
  }

  function explore(locId) {
    const L = LOCATIONS[locId];
    G.loc = locId;
    if (G.hp <= 0) G.hp = 1;
    if (Math.random() < 0.12) {
      const gold = ri(5, 15 + G.level * 4);
      G.gold += gold; save();
      modal('Descoberta!', h('p', {}, `Você encontrou um baú esquecido com ${gold} moedas de ouro.`), [{ label: 'Pegar', fn: renderHub }]);
      return;
    }
    startBattle(pick(L.pool), locId);
  }

  /* ---------- menu, estalagem, personagem ---------- */
  function openMenu() {
    modal('Menu', h('p', {}, 'O jogo salva automaticamente após cada ação.'), [
      { label: 'Voltar ao título', fn: () => { save(); showTitle(); } },
      { label: 'Apagar progresso', cls: 'danger', keep: true, fn: () => modal('Apagar progresso?', h('p', {}, 'Isso remove seu personagem e não pode ser desfeito.'),
        [{ label: 'Cancelar' }, { label: 'Apagar', cls: 'danger', fn: () => { clearSave(); G = null; showTitle(); } }]) },
      { label: 'Fechar' }]);
  }

  function openInn() {
    const cost = 10 + G.level * 4;
    const need = G.hp < maxHp() || G.mp < maxMp();
    modal('🛏️ Estalagem do Corvo', h('p', {}, `Uma noite de descanso restaura todo HP e MP por ${cost} moedas. Você tem ${G.gold}.`), [
      { label: 'Fechar' },
      { label: `Descansar (${cost}🪙)`, cls: 'gold', disabled: !need || G.gold < cost, fn: () => { G.gold -= cost; G.hp = maxHp(); G.mp = maxMp(); save(); toast('Você descansou e se sente renovado.'); renderHub(); } }]);
  }

  function usePotionOutside(id) {
    const it = ITEMS[id];
    if (!G.inv[id]) return;
    if (it.heal && G.hp >= maxHp()) return toast('Seu HP já está cheio.');
    if (it.mana && G.mp >= maxMp()) return toast('Seu MP já está cheio.');
    G.inv[id]--;
    if (it.heal) G.hp = Math.min(maxHp(), G.hp + it.heal);
    if (it.mana) G.mp = Math.min(maxMp(), G.mp + it.mana);
    save(); openCharacter(); renderHub();
  }

  function openCharacter() {
    const c = CLASSES[G.cls];
    const stats = h('ul', { class: 'stats' },
      h('li', {}, `Classe: ${c.name}`), h('li', {}, `Nível: ${G.level}`),
      h('li', {}, `HP: ${G.hp}/${maxHp()}`), h('li', {}, `MP: ${G.mp}/${maxMp()}`),
      h('li', {}, `Ataque: ${atk()}`), h('li', {}, `Defesa: ${def()}`),
      h('li', {}, `Ouro: ${G.gold}`), h('li', {}, `Chefes derrotados: ${Object.keys(G.bosses).length}/5`));
    const eq = (type) => G.owned.map((id) => ITEMS[id]).filter((i) => i.type === type && (type === 'armor' || i.cls === G.cls))
      .sort((a, b) => a.tier - b.tier).map((i) => {
        const on = (type === 'weapon' ? G.weapon : G.armor) === i.id;
        return h('div', { class: 'row' }, h('span', {}, `${i.name} (${type === 'weapon' ? '+' + i.atk + ' ATK' : '+' + i.def + ' DEF'})`),
          h('button', { class: 'btn small', disabled: on, onclick: () => { if (type === 'weapon') G.weapon = i.id; else G.armor = i.id; save(); openCharacter(); renderHub(); } }, on ? 'Equipado' : 'Equipar'));
      });
    const items = ['potion', 'potionG', 'ether'].map((id) =>
      h('div', { class: 'row' }, h('span', {}, `${ITEMS[id].icon} ${ITEMS[id].name} ×${G.inv[id] || 0}`),
        h('button', { class: 'btn small', disabled: !G.inv[id], onclick: () => usePotionOutside(id) }, 'Usar')));
    const sk = c.skills.map((s) => h('li', { class: s.lvl <= G.level ? '' : 'locked' }, `${s.name} — ${s.mp} MP — ${s.desc}` + (s.lvl > G.level ? ` (nível ${s.lvl})` : '')));
    modal(`${G.name}`, h('div', { class: 'charGrid' },
      h('div', { class: 'portrait big', svg: SPRITES[G.cls] }), stats,
      h('h3', {}, 'Armas'), eq('weapon'), h('h3', {}, 'Armaduras'), eq('armor'),
      h('h3', {}, 'Itens'), items, h('h3', {}, 'Habilidades'), h('ul', { class: 'skillList' }, sk)));
  }

  /* ---------- loja ---------- */
  function openShop() {
    const tabs = [['weapon', 'Armas'], ['armor', 'Armaduras'], ['consumable', 'Poções']];
    const list = Object.values(ITEMS).filter((i) => i.type === ui.shopTab && i.price > 0 && (i.type !== 'weapon' || i.cls === G.cls));
    const rows = list.map((i) => {
      const owned = G.owned.includes(i.id);
      const stat = i.type === 'weapon' ? `+${i.atk} ATK` : i.type === 'armor' ? `+${i.def} DEF` : i.desc;
      const cnt = i.type === 'consumable' ? ` (você tem ${G.inv[i.id] || 0})` : '';
      return h('div', { class: 'row' }, h('div', {}, h('strong', {}, (i.icon ? i.icon + ' ' : '') + i.name), h('small', {}, stat + cnt)),
        h('button', { class: 'btn small gold', disabled: owned || G.gold < i.price, onclick: () => buy(i) }, owned ? 'Comprado' : `${i.price}🪙`));
    });
    modal('⚒️ Loja do Ferreiro', h('div', {},
      h('p', { class: 'gold-line' }, `Seu ouro: 🪙 ${G.gold}`),
      h('div', { class: 'tabs' }, tabs.map(([k, n]) => h('button', { class: 'tab' + (ui.shopTab === k ? ' on' : ''), onclick: () => { ui.shopTab = k; openShop(); } }, n))),
      rows), [{ label: 'Sair', fn: renderHub }]);
  }
  function buy(i) {
    if (G.gold < i.price) return;
    G.gold -= i.price; sfx('coin');
    if (i.type === 'consumable') G.inv[i.id] = (G.inv[i.id] || 0) + 1;
    else {
      G.owned.push(i.id);
      if (i.type === 'weapon' && i.atk > ITEMS[G.weapon].atk) G.weapon = i.id;
      if (i.type === 'armor' && i.def > ITEMS[G.armor].def) G.armor = i.id;
    }
    save(); openShop();
  }

  /* ---------- missões (UI) ---------- */
  function giveReward(q) {
    const r = q.reward;
    G.gold += r.gold;
    const msgs = gainXp(r.xp);
    if (r.item) G.inv[r.item] = (G.inv[r.item] || 0) + (r.qty || 1);
    return msgs;
  }
  function openQuests(atBoard) {
    const active = QUESTS.filter((q) => G.quests[q.id] && G.quests[q.id].state !== 'turned');
    const avail = atBoard ? QUESTS.filter(questAvailable) : [];
    const turned = QUESTS.filter((q) => G.quests[q.id] && G.quests[q.id].state === 'turned');
    const rewardText = (q) => `Recompensa: ${q.reward.gold}🪙, ${q.reward.xp} XP` + (q.reward.item ? `, ${q.reward.qty}× ${ITEMS[q.reward.item].name}` : '');
    const card = (q, extra) => h('div', { class: 'quest' }, h('strong', {}, q.name), h('small', {}, 'Pedido por ' + q.giver), h('p', {}, q.text), h('small', {}, rewardText(q)), extra);
    const body = h('div', {},
      h('h3', {}, 'Em andamento'),
      active.length ? active.map((q) => {
        const st = G.quests[q.id];
        const done = st.state === 'done';
        return card(q, h('div', { class: 'qrow' }, h('span', {}, `${MONSTERS[q.goal.monster].name}: ${st.n}/${q.goal.count}`),
          done && atBoard ? h('button', { class: 'btn small gold', onclick: () => turnIn(q) }, 'Entregar') : done ? h('em', {}, 'Concluída — volte ao quadro na vila') : null));
      }) : h('p', { class: 'muted' }, 'Nenhuma missão ativa.'),
      atBoard ? [h('h3', {}, 'Disponíveis'), avail.length ? avail.map((q) => card(q, h('button', { class: 'btn small', onclick: () => { G.quests[q.id] = { state: 'active', n: 0 }; save(); openQuests(true); } }, 'Aceitar')))
        : h('p', { class: 'muted' }, 'Sem novas missões. Suba de nível ou conclua outras para liberar mais.')] : null,
      turned.length ? [h('h3', {}, 'Concluídas'), h('ul', { class: 'doneList' }, turned.map((q) => h('li', {}, '✔ ' + q.name)))] : null);
    modal(atBoard ? '📜 Quadro de Missões' : '📖 Diário de Missões', body, [{ label: 'Fechar', fn: renderHub }]);
  }
  function turnIn(q) {
    G.quests[q.id].state = 'turned';
    const msgs = giveReward(q);
    save();
    modal('Missão cumprida!', h('div', {}, h('p', {}, `${q.giver} agradece. Você recebeu ${q.reward.gold} moedas e ${q.reward.xp} XP.`), msgs.map((m) => h('p', { class: 'levelup' }, m))),
      [{ label: 'Continuar', fn: () => openQuests(true) }]);
  }

  /* ---------- combate ---------- */
  function startBattle(monId, locId) {
    const base = MONSTERS[monId];
    battle = { mon: Object.assign({ id: monId }, base, { maxHp: base.hp }), turn: 0, menu: 'main', defending: false, busy: false, loc: locId, over: false };
    closeModal();
    buildBattle();
    show('battle');
    if (base.boss) sfx('boss');
    log(`${base.boss ? '☠️ ' : ''}${base.name} apareceu!`, 'sys');
    renderActions();
  }

  function buildBattle() {
    const root = $('#battle');
    root.replaceChildren();
    const L = LOCATIONS[battle.loc];
    const mkFighter = (side, name, svg, size) => {
      const fid = side === 'foe' ? battle.mon.id : G.cls;
      const rc = RPG.rig && RPG.rig.CFG[fid];
      const facesLeft = side === 'foe' && !!(rc && rc.flip);
      const spr = h('div', { class: 'spr' + (facesLeft ? ' flip-fix' : ''), svg: (RPG.rig && RPG.rig.make(fid)) || svg, style: `--s:${size}` });
      const plate = h('div', { class: 'plate' }, h('div', { class: 'pname' }, name), h('div', { class: 'bar hp' }, h('i')),
        side === 'player' ? h('div', { class: 'bar mp' }, h('i')) : null, h('div', { class: 'bartext' }));
      const w = h('div', { class: 'fighter ' + side }, plate, spr);
      return { w, spr, plate, rig: RPG.rig ? RPG.rig.control(spr, fid) : null };
    };
    const p = mkFighter('player', G.name, SPRITES[G.cls], 1);
    const f = mkFighter('foe', battle.mon.name, SPRITES[battle.mon.id], battle.mon.boss ? Math.min(battle.mon.size, 1.12) : battle.mon.size);
    battle.els = { player: p, foe: f };
    root.append(h('div', { class: 'arena bg-' + L.bg }, p.w, f.w), h('div', { id: 'actions', class: 'actions' }), h('ul', { id: 'log', class: 'log', 'aria-live': 'polite' }));
    battle.arena = root.querySelector('.arena');
    if (window.PixelFX) PixelFX.attach(battle.arena);
    updateBars();
  }

  function updateBars() {
    const { player, foe } = battle.els;
    const set = (el, cur, max, txt) => {
      el.plate.querySelector('.hp i').style.width = clamp((cur / max) * 100, 0, 100) + '%';
      el.plate.querySelector('.bartext').textContent = txt;
    };
    set(player, G.hp, maxHp(), `HP ${G.hp}/${maxHp()}  ·  MP ${G.mp}/${maxMp()}`);
    player.plate.querySelector('.mp i').style.width = clamp((G.mp / maxMp()) * 100, 0, 100) + '%';
    set(foe, battle.mon.hp, battle.mon.maxHp, `HP ${Math.max(0, battle.mon.hp)}/${battle.mon.maxHp}`);
  }

  function log(msg, cls) {
    const ul = $('#log');
    if (!ul) return;
    ul.append(h('li', { class: cls || '' }, msg));
    while (ul.children.length > 80) ul.firstChild.remove();
    ul.scrollTop = ul.scrollHeight;
  }

  // ataque articulado: resolve no instante do contato
  function strike(side, o) {
    const e = battle.els[side], t = battle.els[side === 'player' ? 'foe' : 'player'];
    if (!e.rig || matchMedia('(prefers-reduced-motion: reduce)').matches) return anim(e.spr, side === 'player' ? 'lunge-r' : 'lunge-l', 380);
    const a = e.spr.getBoundingClientRect(), b = t.spr.getBoundingClientRect(), sx = side === 'player' ? 1 : -1;
    const gap = Math.abs((b.left + b.width / 2) - (a.left + a.width / 2)) - (a.width + b.width) * 0.5 * 0.74;
    return e.rig.attack(Object.assign({ dx: sx * Math.max(30, gap), sx }, o));
  }
  function anim(node, cls, ms) { node.classList.add(cls); return sleep(ms).then(() => node.classList.remove(cls)); }
  function floatText(side, text, cls) {
    const s = h('span', { class: 'float ' + cls }, text);
    battle.els[side].w.append(s);
    setTimeout(() => s.remove(), 1100);
  }
  /* efeitos de pixel art (biblioteca pixelfx) */
  const PAL = {
    arcane: ['#2a1450', '#5b2fa8', '#9a63ff', '#d3b0ff', '#ffffff'],
    gold: ['#4a2f0c', '#a8741f', '#e0b040', '#fff0a0', '#ffffff'],
    fire: ['#4a1208', '#b03a10', '#f07a1c', '#ffd25a', '#ffffff'],
    heal: ['#0f3d1c', '#1f8f43', '#57d977', '#b8ffc8', '#ffffff'],
    mana: ['#102a5a', '#2a62c8', '#5aa8ff', '#b8e0ff', '#ffffff'],
  };
  function vfx(name, side, o) {
    if (!window.PixelFX || !battle || !battle.arena) return;
    o = Object.assign({}, o);
    const a = battle.arena.getBoundingClientRect(), r = battle.els[side].spr.getBoundingClientRect();
    const x = r.left - a.left + r.width / 2 + (o.dx || 0), y = r.top - a.top + r.height * (o.fy == null ? 0.85 : o.fy) + (o.dy || 0);
    delete o.dx; delete o.dy; delete o.fy;
    PixelFX.play(name, Object.assign(o, { x, y }));
  }
  async function hitFx(skill) {
    const id = skill ? skill.id : 'basic', cls = G.cls;
    if (!window.PixelFX) return;
    if (cls === 'knight') {
      if (id === 'furia') { vfx('spinSlash', 'foe', { maxT: 0.8 }); vfx('critHit', 'foe', { delay: 0.18, maxT: 0.7 }); }
      else if (id === 'golpe') { vfx('swordSlash', 'foe', { dx: -25, maxT: 0.6 }); vfx('critHit', 'foe', { delay: 0.12, maxT: 0.6 }); }
      else { vfx('swordSlash', 'foe', { dx: -25, maxT: 0.6 }); vfx('hitSpark', 'foe', { fy: 0.6, dx: -20, delay: 0.12 }); }
      return;
    }
    if (id !== 'raio') {
      vfx('magicMissile', 'player', { fy: 0.6, dx: 40, dy: 40, palette: id === 'fogo' || id === 'dragao' ? PAL.fire : cls === 'mage' ? PAL.arcane : PAL.gold, maxT: 0.9 });
      await sleep(600);
    }
    if (id === 'fogo') vfx('smallExplosion', 'foe', { maxT: 0.9 });
    else if (id === 'raio') vfx('lightningStrike', 'foe', { fy: 0.92, maxT: 1 });
    else if (id === 'dragao') { vfx('smallExplosion', 'foe', { maxT: 0.9 }); vfx('critHit', 'foe', { delay: 0.1, maxT: 0.6 }); }
    else vfx('hitSpark', 'foe', { fy: 0.6, dx: -10 });
  }
  function fx(side, glyph) {
    if (window.PixelFX) return;
    const s = h('span', { class: 'fxglyph' }, glyph);
    battle.els[side].w.append(s);
    setTimeout(() => s.remove(), 700);
  }

  function renderActions() {
    const box = $('#actions');
    if (!box) return;
    box.replaceChildren();
    const dis = battle.busy || battle.over;
    const btn = (label, fn, extra) => h('button', Object.assign({ class: 'btn', disabled: dis || (extra && extra.disabled), onclick: fn }, {}), label);
    if (battle.menu === 'main') {
      box.append(btn('⚔️ Atacar', () => act(() => playerAttack(null))),
        btn('✨ Habilidades', () => { battle.menu = 'skills'; renderActions(); }),
        btn('🛡️ Defender', () => act(playerDefend)),
        btn('🎒 Itens', () => { battle.menu = 'items'; renderActions(); }),
        btn('🏃 Fugir', () => act(playerFlee), { disabled: battle.mon.boss }));
    } else if (battle.menu === 'skills') {
      skills().forEach((s) => box.append(h('button', { class: 'btn', title: s.desc, disabled: dis || G.mp < s.mp, onclick: () => { battle.menu = 'main'; act(() => playerSkill(s)); } }, `${s.name} (${s.mp} MP)`)));
      box.append(btn('↩ Voltar', () => { battle.menu = 'main'; renderActions(); }));
    } else {
      ['potion', 'potionG', 'ether'].forEach((id) => box.append(h('button', { class: 'btn', disabled: dis || !G.inv[id], onclick: () => { battle.menu = 'main'; act(() => playerItem(id)); } }, `${ITEMS[id].icon} ${ITEMS[id].name} ×${G.inv[id] || 0}`)));
      box.append(btn('↩ Voltar', () => { battle.menu = 'main'; renderActions(); }));
    }
  }

  async function act(fn) {
    if (battle.busy || battle.over) return;
    battle.busy = true; renderActions();
    const proceed = await fn();
    updateBars();
    if (battle.over) return;
    if (battle.mon.hp <= 0) { await victory(); return; }
    if (proceed !== false) {
      await sleep(350);
      await foeTurn();
    }
    if (!battle.over) { battle.busy = false; renderActions(); }
  }

  function calc(rawAtk, targetDef, o) {
    const crit = Math.random() < (o.crit || 0);
    let d = rawAtk * (o.mult || 1) * rnd(0.85, 1.15) - targetDef * (o.magic ? 0.25 : 0.5);
    if (crit) d *= 1.7;
    return { dmg: Math.max(1, Math.round(d)), crit };
  }

  async function playerAttack(skill) {
    const c = CLASSES[G.cls];
    const magic = !!(skill && skill.magic);
    const hits = (skill && skill.hits) || 1;
    const melee = G.cls === 'knight' && !magic;
    if (battle.els.player.rig) await strike('player', skill && skill.id === 'furia' ? { speed: 1.15 } : {});
    else if (melee) await anim(battle.els.player.spr, 'lunge-r', 380); else await anim(battle.els.player.spr, 'cast', 260);
    for (let i = 0; i < hits; i++) {
      if (skill) fx('foe', skill.fx); else fx('foe', G.cls === 'archer' ? '🏹' : G.cls === 'mage' ? '✨' : '💢');
      await hitFx(skill);
      if (Math.random() < 0.06 && !skill) {
        sfx('miss'); floatText('foe', 'Esquivou!', 'miss'); log(`${battle.mon.name} esquivou do ataque!`);
        continue;
      }
      const r = calc(atk(), battle.mon.def, { mult: skill ? skill.mult : 1, magic, crit: skill && skill.crit ? skill.crit : c.crit });
      battle.mon.hp -= r.dmg;
      sfx(magic ? 'magic' : r.crit ? 'crit' : 'hit');
      if (r.crit && !(skill && (skill.id === 'golpe' || skill.id === 'furia' || skill.id === 'dragao'))) vfx('critHit', 'foe', { maxT: 0.7 });
      floatText('foe', (r.crit ? '💥 ' : '') + r.dmg, r.crit ? 'crit' : 'dmg');
      log(`${G.name} ${skill ? 'usa ' + skill.name + ' e' : ''} causa ${r.dmg} de dano${r.crit ? ' (CRÍTICO!)' : ''}.`, r.crit ? 'crit' : '');
      updateBars();
      await anim(battle.els.foe.spr, 'hit', 260);
      if (battle.mon.hp <= 0) break;
    }
  }
  async function playerSkill(skill) {
    G.mp -= skill.mp;
    if (skill.type === 'heal') {
      const amt = Math.round(maxHp() * skill.pct);
      G.hp = Math.min(maxHp(), G.hp + amt);
      sfx('heal'); fx('player', skill.fx); vfx('collectBurst', 'player', { palette: PAL.heal, maxT: 1.1 }); floatText('player', '+' + amt, 'heal');
      log(`${G.name} usa ${skill.name} e recupera ${amt} HP.`, 'heal');
      await anim(battle.els.player.spr, 'cast', 400);
      return true;
    }
    log(`${G.name} usa ${skill.name}!`, 'sys');
    await playerAttack(skill);
    return true;
  }
  async function playerDefend() {
    battle.defending = true;
    vfx('shieldBlock', 'player', { dx: -10, maxT: 0.9 });
    G.mp = Math.min(maxMp(), G.mp + 4);
    log(`${G.name} se protege e recupera o fôlego (+4 MP).`, 'sys');
    await anim(battle.els.player.spr, 'guard', 350);
  }
  async function playerItem(id) {
    const it = ITEMS[id];
    G.inv[id]--;
    if (it.heal) { const a = Math.min(it.heal, maxHp() - G.hp); G.hp += a; floatText('player', '+' + a, 'heal'); log(`${G.name} bebe ${it.name} (+${a} HP).`, 'heal'); }
    if (it.mana) { const a = Math.min(it.mana, maxMp() - G.mp); G.mp += a; floatText('player', '+' + a + ' MP', 'mana'); log(`${G.name} bebe ${it.name} (+${a} MP).`, 'heal'); }
    sfx('heal');
    fx('player', '✨');
    vfx('collectBurst', 'player', { palette: it.mana ? PAL.mana : PAL.heal, maxT: 1.1 });
    await anim(battle.els.player.spr, 'cast', 350);
  }
  async function playerFlee() {
    log(`${G.name} tenta fugir...`, 'sys');
    await sleep(350);
    if (Math.random() < 0.6) {
      log('Conseguiu escapar!', 'sys');
      battle.over = true;
      await anim(battle.els.player.spr, 'flee', 500);
      save(); renderHub();
      return false;
    }
    log('A fuga falhou!', 'sys');
  }

  async function foeTurn() {
    const m = battle.mon;
    battle.turn++;
    const heavy = m.heavyEvery && battle.turn % m.heavyEvery === 0;
    await strike('foe', heavy ? { speed: 0.85 } : {});
    if (!heavy && Math.random() < 0.08) {
      sfx('miss'); floatText('player', 'Esquivou!', 'miss'); log(`${G.name} esquivou do ataque de ${m.name}!`);
    } else {
      let r = calc(m.atk, def(), { mult: heavy ? 1.8 : 1, crit: 0.05 });
      let d = r.dmg;
      if (battle.defending) d = Math.max(1, Math.ceil(d * 0.4));
      G.hp = Math.max(0, G.hp - d);
      sfx(heavy ? 'crit' : 'hurt');
      fx('player', heavy ? '🔥' : '💢');
      if (heavy) vfx('groundSlam', 'player', { fy: 0.92, maxT: 0.9 }); else vfx('clawSwipe', 'player', { dx: 25, flip: true, maxT: 0.8 });
      floatText('player', String(d), 'dmg');
      log(`${m.name} ${heavy ? 'usa ' + m.heavyName + ' e ' : ''}causa ${d} de dano${battle.defending ? ' (defendido)' : ''}.`, heavy ? 'crit' : '');
      updateBars();
      await anim(battle.els.player.spr, 'hit', 260);
    }
    battle.defending = false;
    if (G.hp <= 0) { await defeat(); return; }
    if (m.heavyEvery && battle.turn % m.heavyEvery === m.heavyEvery - 1) log(`⚠️ ${m.name} está reunindo energia para ${m.heavyName}!`, 'sys');
  }

  async function victory() {
    battle.over = true;
    const m = battle.mon;
    battle.els.foe.spr.classList.add('dead');
    vfx('poof', 'foe', { fy: 0.7, maxT: 1.2 });
    sfx('win');
    log(`${m.name} foi derrotado!`, 'sys');
    await sleep(700);
    const first = m.boss && !G.bosses[m.id];
    const mult = m.boss && !first ? 0.3 : 1;
    const gold = Math.round(m.gold * rnd(0.85, 1.2) * mult);
    const xp = Math.round(m.xp * mult);
    G.gold += gold;
    const lvMsgs = gainXp(xp);
    if (lvMsgs.length) setTimeout(() => sfx('levelup'), 600);
    let drop = null;
    if (!m.boss && Math.random() < 0.28) { drop = pick(['potion', 'potion', 'potionG', 'ether']); G.inv[drop] = (G.inv[drop] || 0) + 1; }
    if (m.boss) G.bosses[m.id] = true;
    G.kills[m.id] = (G.kills[m.id] || 0) + 1;
    const qDone = questKill(m.id);
    if (m.id === 'lorde') G.won = true;
    save();
    const body = h('div', {}, h('p', {}, `+${gold} 🪙  ·  +${xp} XP` + (drop ? `  ·  ${ITEMS[drop].icon} ${ITEMS[drop].name}` : '')),
      lvMsgs.map((x) => h('p', { class: 'levelup' }, x)), qDone.map((n) => h('p', { class: 'questdone' }, `📜 Missão pronta para entregar: ${n}`)),
      first && m.id !== 'lorde' ? h('p', { class: 'levelup' }, 'Um novo caminho foi aberto no mapa!') : null);
    modal('⚔️ Vitória!', body, [{ label: 'Continuar', fn: () => (m.id === 'lorde' && first ? showEnding() : renderHub()) }]);
  }

  async function defeat() {
    battle.over = true;
    battle.els.player.spr.classList.add('dead');
    sfx('lose');
    log(`${G.name} caiu em combate...`, 'sys');
    await sleep(900);
    const lost = Math.floor(G.gold / 2);
    G.gold -= lost; G.loc = 'vila'; ui.sel = 'vila';
    G.hp = Math.ceil(maxHp() / 2); G.mp = Math.ceil(maxMp() / 2);
    save();
    modal('💀 Derrota', h('p', {}, `Você desmaiou e foi levado de volta à vila. Perdeu ${lost} moedas no caminho.`), [{ label: 'Acordar na vila', fn: renderHub }]);
  }

  function showEnding() {
    $('#endText').textContent = `${G.name}, o ${CLASSES[G.cls].name}, derrotou Malakar e a luz voltou a Ravenhold. Os sinos tocam em todo o reino. Seu nome será cantado por gerações.`;
    show('ending');
  }

  /* ---------- eventos iniciais ---------- */
  function init() {
    $('#btnPlay').addEventListener('click', () => { $('#titleStep1').classList.add('hidden'); $('#titleStep2').classList.remove('hidden'); });
    $('#btnContinue').addEventListener('click', () => {
      const d = loadSave();
      if (!d) { toast('Nenhum jogo salvo encontrado.'); return; }
      G = d; ui.sel = G.loc; renderHub();
    });
    $('#btnNew').addEventListener('click', () => {
      if (loadSave()) {
        modal('Novo jogo?', h('p', {}, 'Seu progresso salvo será substituído.'), [{ label: 'Cancelar' }, { label: 'Continuar', cls: 'danger', fn: openCreate }]);
      } else openCreate();
    });
    $('#btnBack').addEventListener('click', showTitle);
    $('#createForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#nameInput').value.trim().replace(/\s+/g, ' ').slice(0, 16);
      if (name.length < 2) { toast('Escolha um nome com pelo menos 2 letras.'); $('#nameInput').focus(); return; }
      newGame(name, createCls);
      renderHub();
      modal('Sua jornada começa', h('p', {}, STORY), [{ label: 'Partir em aventura' }]);
    });
    $('#btnKeep').addEventListener('click', renderHub);
    $('#beginning').addEventListener('click', (e) => { e.preventDefault(); if (battle && !battle.over && $('#battle').classList.contains('active')) { toast('Termine a batalha primeiro.'); return; } closeModal(); showTitle(); });
    $('#skipLink') && $('#skipLink').addEventListener('click', () => {});
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn, .tab, .classCard')) sfx('click'); });
    const mute = $('#btnMute');
    const paint = () => { const m = window.RPG.isMuted(); mute.textContent = m ? '🔇 Som desligado' : '🔊 Som ligado'; mute.setAttribute('aria-pressed', String(!m)); };
    mute.addEventListener('click', (e) => { e.preventDefault(); window.RPG.toggleMute(); paint(); });
    paint();
    showTitle();
  }
  function openCreate() { show('create'); buildCreate(); $('#nameInput').focus(); }

  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $('#overlay') && !battle?.busy) { const o = $('#overlay'); if (o && !$('#battle.active')) o.remove(); } });
})();
