/* Dados do jogo: classes, itens, monstros, locais e missões */
window.RPG = window.RPG || {};

(function (R) {
  const WEAPON_NAMES = {
    knight: ['Espada Enferrujada', 'Espada de Ferro', 'Lâmina de Aço', 'Espada Rúnica', 'Lâmina do Dragão'],
    mage: ['Cajado de Madeira', 'Cajado de Carvalho', 'Cajado Arcano', 'Cajado Estelar', 'Cajado do Arquimago'],
    archer: ['Arco Curto', 'Arco de Teixo', 'Arco Longo Élfico', 'Arco do Caçador', 'Arco da Tempestade'],
  };
  const WEAPON_ATK = [2, 5, 9, 15, 23];
  const WEAPON_PRICE = [0, 70, 200, 480, 950];
  const ARMOR_NAMES = ['Roupas de Viajante', 'Gibão de Couro', 'Cota de Malha', 'Armadura de Placas', 'Manto Dracônico'];
  const ARMOR_DEF = [0, 2, 5, 9, 15];
  const ARMOR_PRICE = [0, 60, 170, 420, 900];

  const ITEMS = {};
  Object.keys(WEAPON_NAMES).forEach((cls) => {
    WEAPON_NAMES[cls].forEach((name, i) => {
      ITEMS['w_' + cls + '_' + i] = { id: 'w_' + cls + '_' + i, type: 'weapon', cls, name, atk: WEAPON_ATK[i], price: WEAPON_PRICE[i], tier: i };
    });
  });
  ARMOR_NAMES.forEach((name, i) => {
    ITEMS['a_' + i] = { id: 'a_' + i, type: 'armor', name, def: ARMOR_DEF[i], price: ARMOR_PRICE[i], tier: i };
  });
  ITEMS.potion = { id: 'potion', type: 'consumable', name: 'Poção de Vida', icon: '🧪', heal: 50, price: 25, desc: 'Restaura 50 HP.' };
  ITEMS.potionG = { id: 'potionG', type: 'consumable', name: 'Poção Grande', icon: '⚗️', heal: 130, price: 65, desc: 'Restaura 130 HP.' };
  ITEMS.ether = { id: 'ether', type: 'consumable', name: 'Elixir de Mana', icon: '💧', mana: 35, price: 30, desc: 'Restaura 35 MP.' };

  const CLASSES = {
    knight: {
      id: 'knight', name: 'Cavaleiro', icon: '🛡️',
      desc: 'Resistente e confiável. Aguenta pancada e cobra caro por ela.',
      base: { hp: 100, mp: 20, atk: 10, def: 6 },
      grow: { hp: 11, mp: 3, atk: 2, def: 1.1 },
      crit: 0.1,
      skills: [
        { id: 'golpe', name: 'Golpe Poderoso', lvl: 1, mp: 8, type: 'dmg', mult: 1.9, fx: '💥', desc: 'Golpe pesado (190% de dano).' },
        { id: 'escudo', name: 'Escudo Divino', lvl: 4, mp: 10, type: 'heal', pct: 0.3, fx: '✨', desc: 'Cura 30% da vida máxima.' },
        { id: 'furia', name: 'Fúria do Rei', lvl: 8, mp: 20, type: 'dmg', mult: 3.0, fx: '⚔️', desc: 'Ataque devastador (300% de dano).' },
      ],
    },
    mage: {
      id: 'mage', name: 'Mago', icon: '🔮',
      desc: 'Frágil, mas a magia ignora quase toda a defesa inimiga.',
      base: { hp: 70, mp: 60, atk: 9, def: 3 },
      grow: { hp: 7, mp: 7, atk: 3, def: 0.6 },
      crit: 0.1,
      skills: [
        { id: 'fogo', name: 'Bola de Fogo', lvl: 1, mp: 10, type: 'dmg', mult: 2.2, magic: true, fx: '🔥', desc: 'Dano mágico (220%), ignora defesa.' },
        { id: 'cura', name: 'Luz Curativa', lvl: 3, mp: 12, type: 'heal', pct: 0.4, fx: '✨', desc: 'Cura 40% da vida máxima.' },
        { id: 'raio', name: 'Relâmpago', lvl: 8, mp: 22, type: 'dmg', mult: 3.3, magic: true, fx: '⚡', desc: 'Dano mágico (330%), ignora defesa.' },
      ],
    },
    archer: {
      id: 'archer', name: 'Arqueiro', icon: '🏹',
      desc: 'Ágil e mortal. Acerta golpes críticos com frequência.',
      base: { hp: 85, mp: 35, atk: 11, def: 4 },
      grow: { hp: 9, mp: 4, atk: 2.4, def: 0.8 },
      crit: 0.22,
      skills: [
        { id: 'tiro', name: 'Tiro Certeiro', lvl: 1, mp: 8, type: 'dmg', mult: 1.8, crit: 0.35, fx: '🎯', desc: 'Tiro preciso (180%, crítico alto).' },
        { id: 'chuva', name: 'Chuva de Flechas', lvl: 4, mp: 14, type: 'dmg', mult: 0.85, hits: 3, fx: '🏹', desc: 'Três disparos de 85% cada.' },
        { id: 'dragao', name: 'Flecha Dracônica', lvl: 8, mp: 20, type: 'dmg', mult: 3.1, crit: 0.3, fx: '🐉', desc: 'Flecha lendária (310%).' },
      ],
    },
  };

  const MONSTERS = {
    slime:        { name: 'Slime Verde', hp: 28, atk: 7, def: 1, xp: 12, gold: 7, size: 0.8 },
    goblin:       { name: 'Goblin Ladrão', hp: 40, atk: 10, def: 3, xp: 18, gold: 12, size: 0.9 },
    lobo:         { name: 'Lobo Cinzento', hp: 48, atk: 12, def: 3, xp: 22, gold: 14, size: 1 },
    rei_goblin:   { name: 'Rei Goblin', hp: 160, atk: 16, def: 6, xp: 120, gold: 150, size: 1.3, boss: true, heavyEvery: 3, heavyName: 'Golpe de Cetro' },
    sapo:         { name: 'Sapo Venenoso', hp: 70, atk: 16, def: 4, xp: 30, gold: 20, size: 0.9 },
    esqueleto:    { name: 'Esqueleto Guerreiro', hp: 80, atk: 18, def: 6, xp: 36, gold: 26, size: 1 },
    morcego:      { name: 'Morcego Sanguinário', hp: 60, atk: 20, def: 3, xp: 32, gold: 22, size: 0.85 },
    bruxa:        { name: 'Bruxa do Pântano', hp: 280, atk: 24, def: 8, xp: 260, gold: 300, size: 1.3, boss: true, heavyEvery: 3, heavyName: 'Maldição Pútrida' },
    aranha:       { name: 'Aranha Gigante', hp: 110, atk: 26, def: 6, xp: 55, gold: 40, size: 1.1 },
    orc:          { name: 'Orc Saqueador', hp: 150, atk: 30, def: 10, xp: 70, gold: 55, size: 1.15 },
    troll:        { name: 'Troll das Cavernas', hp: 175, atk: 32, def: 11, xp: 82, gold: 62, size: 1.2 },
    orc_chefe:    { name: 'Gorak, o Orc Chefe', hp: 480, atk: 36, def: 14, xp: 500, gold: 600, size: 1.4, boss: true, heavyEvery: 3, heavyName: 'Machadada Brutal' },
    lobo_gelo:    { name: 'Lobo de Gelo', hp: 190, atk: 38, def: 10, xp: 100, gold: 80, size: 1.05 },
    golem:        { name: 'Golem de Gelo', hp: 260, atk: 42, def: 18, xp: 130, gold: 100, size: 1.25 },
    dragao:       { name: 'Ignarax, o Dragão', hp: 800, atk: 52, def: 20, xp: 1000, gold: 1200, size: 1.5, boss: true, heavyEvery: 3, heavyName: 'Sopro de Fogo' },
    cavaleiro:    { name: 'Cavaleiro Negro', hp: 300, atk: 50, def: 22, xp: 180, gold: 150, size: 1.15 },
    gargula:      { name: 'Górgula de Pedra', hp: 340, atk: 48, def: 26, xp: 200, gold: 170, size: 1.15 },
    lorde:        { name: 'Malakar, o Lorde Sombrio', hp: 1400, atk: 62, def: 26, xp: 2500, gold: 3000, size: 1.5, boss: true, heavyEvery: 3, heavyName: 'Fúria das Trevas' },
  };

  const LOCATIONS = {
    vila: {
      id: 'vila', name: 'Vila de Ravenhold', icon: '🏘️', x: 120, y: 360, town: true, bg: 'town', minLevel: 1,
      desc: 'Seu lar. Aqui você encontra a loja do ferreiro, a estalagem e o quadro de missões.',
    },
    floresta: {
      id: 'floresta', name: 'Floresta Sombria', icon: '🌲', x: 260, y: 240, bg: 'forest', minLevel: 1, unlock: null,
      pool: ['slime', 'goblin', 'lobo'], boss: 'rei_goblin',
      desc: 'Árvores antigas escondem goblins, lobos e criaturas gosmentas. O Rei Goblin governa o covil no coração da mata.',
    },
    pantano: {
      id: 'pantano', name: 'Pântano Amaldiçoado', icon: '🌿', x: 410, y: 385, bg: 'swamp', minLevel: 4, unlock: 'rei_goblin',
      pool: ['sapo', 'esqueleto', 'morcego'], boss: 'bruxa',
      desc: 'Névoa densa e águas podres. Dizem que uma bruxa ressuscita os mortos para vigiar o caminho.',
    },
    cavernas: {
      id: 'cavernas', name: 'Cavernas de Gorak', icon: '🕳️', x: 530, y: 245, bg: 'cave', minLevel: 7, unlock: 'bruxa',
      pool: ['aranha', 'orc', 'troll'], boss: 'orc_chefe',
      desc: 'Túneis úmidos dominados por orcs e aranhas. Gorak, o Orc Chefe, reina sobre todos eles.',
    },
    montanha: {
      id: 'montanha', name: 'Montanha Gelada', icon: '🏔️', x: 660, y: 130, bg: 'ice', minLevel: 10, unlock: 'orc_chefe',
      pool: ['lobo_gelo', 'golem'], boss: 'dragao',
      desc: 'Picos cobertos de gelo eterno. No topo, o dragão Ignarax dorme sobre uma montanha de ouro.',
    },
    castelo: {
      id: 'castelo', name: 'Castelo das Trevas', icon: '🏰', x: 710, y: 330, bg: 'castle', minLevel: 13, unlock: 'dragao',
      pool: ['cavaleiro', 'gargula'], boss: 'lorde',
      desc: 'A fortaleza do Lorde Sombrio Malakar. Quem entra raramente volta.',
    },
  };

  const QUESTS = [
    { id: 'q1', name: 'Pragas da Floresta', giver: 'Mara, a Fazendeira',
      text: 'Slimes estão destruindo minha plantação! Elimine 4 deles, por favor.',
      req: { level: 1 }, goal: { monster: 'slime', count: 4 }, reward: { gold: 40, xp: 30, item: 'potion', qty: 2 } },
    { id: 'q2', name: 'O Rei Goblin', giver: 'Capitão Aldric',
      text: 'O Rei Goblin lidera os ataques às nossas caravanas. Derrote-o no covil da Floresta Sombria.',
      req: { level: 2, quest: 'q1' }, goal: { monster: 'rei_goblin', count: 1 }, reward: { gold: 120, xp: 100, item: 'potionG', qty: 1 } },
    { id: 'q3', name: 'Lobos Famintos', giver: 'Caçador Teo',
      text: 'Os lobos andam atacando rebanhos. Abata 5 deles.',
      req: { level: 2 }, goal: { monster: 'lobo', count: 5 }, reward: { gold: 70, xp: 60 } },
    { id: 'q4', name: 'A Bruxa do Pântano', giver: 'Irmã Elora',
      text: 'Uma bruxa corrompe os mortos no pântano. Acabe com ela antes que seu poder cresça.',
      req: { level: 4, quest: 'q2' }, goal: { monster: 'bruxa', count: 1 }, reward: { gold: 300, xp: 260, item: 'ether', qty: 3 } },
    { id: 'q5', name: 'Ossos Inquietos', giver: 'Irmã Elora',
      text: 'Mortos-vivos vagam pelo pântano. Destrua 5 esqueletos guerreiros.',
      req: { level: 4 }, goal: { monster: 'esqueleto', count: 5 }, reward: { gold: 110, xp: 120 } },
    { id: 'q6', name: 'Teias Perigosas', giver: 'Mineiro Borin',
      text: 'Aranhas gigantes tomaram minha mina. Mate 6 delas e eu te recompenso.',
      req: { level: 7 }, goal: { monster: 'aranha', count: 6 }, reward: { gold: 200, xp: 240, item: 'potionG', qty: 2 } },
    { id: 'q7', name: 'A Ameaça Orc', giver: 'Capitão Aldric',
      text: 'Gorak, o Orc Chefe, reúne um exército nas cavernas. Derrube-o.',
      req: { level: 7, quest: 'q4' }, goal: { monster: 'orc_chefe', count: 1 }, reward: { gold: 600, xp: 500, item: 'potionG', qty: 3 } },
    { id: 'q8', name: 'O Despertar do Dragão', giver: 'Mestre Alquimista',
      text: 'Ignarax acordou e queima vilarejos ao norte. Só um herói pode detê-lo.',
      req: { level: 10, quest: 'q7' }, goal: { monster: 'dragao', count: 1 }, reward: { gold: 1200, xp: 1000, item: 'potionG', qty: 4 } },
    { id: 'q9', name: 'Gelo Vivo', giver: 'Mestre Alquimista',
      text: 'Golens de gelo bloqueiam a passagem para o castelo. Quebre 4 deles.',
      req: { level: 10 }, goal: { monster: 'golem', count: 4 }, reward: { gold: 450, xp: 400 } },
    { id: 'q10', name: 'O Lorde Sombrio', giver: 'Rei Edmundo',
      text: 'Malakar precisa cair. Invada o Castelo das Trevas e restaure a paz ao reino.',
      req: { level: 13, quest: 'q8' }, goal: { monster: 'lorde', count: 1 }, reward: { gold: 3000, xp: 2500 } },
  ];

  const STORY = 'Há muito tempo, o reino de Ravenhold vivia em paz. Então o Lorde Sombrio Malakar despertou, e monstros passaram a tomar as florestas, pântanos e montanhas. Você é o último a atender o chamado do Capitão Aldric. Pegue sua arma, aceite missões no quadro da vila, fortaleça-se e derrote os cinco guardiões que protegem o caminho até o castelo.';

  Object.assign(R, { CLASSES, ITEMS, MONSTERS, LOCATIONS, QUESTS, STORY });
})(window.RPG);
