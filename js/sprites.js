/* Sprites em SVG desenhados à mão (sem imagens externas) */
(function (R) {
  const wrap = (body) =>
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="94" rx="28" ry="5" fill="rgba(0,0,0,.4)"/>' + body + '</svg>';
  const eyes = (x1, x2, y, r = 3.2, c = '#fff') =>
    `<circle cx="${x1}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${c}"/>` +
    `<circle cx="${x1}" cy="${y}" r="${r / 2}" fill="#111"/><circle cx="${x2}" cy="${y}" r="${r / 2}" fill="#111"/>`;

  const wolf = (c, c2, eye) => wrap(`
    <path d="M12 52 Q4 40 10 30 Q16 40 20 46Z" fill="${c}"/>
    <ellipse cx="54" cy="58" rx="32" ry="17" fill="${c}"/>
    <rect x="26" y="66" width="7" height="24" rx="3" fill="${c2}"/><rect x="40" y="68" width="7" height="22" rx="3" fill="${c2}"/>
    <rect x="62" y="68" width="7" height="22" rx="3" fill="${c2}"/><rect x="74" y="66" width="7" height="24" rx="3" fill="${c2}"/>
    <path d="M70 46 L80 22 L90 44 L98 50 L96 62 L76 64Z" fill="${c}"/>
    <path d="M76 26 L80 14 L86 28Z" fill="${c2}"/>
    <path d="M96 56 L90 62 L96 62Z" fill="#fff"/>
    <circle cx="86" cy="46" r="3" fill="${eye}"/><circle cx="86" cy="46" r="1.2" fill="#111"/>
    <path d="M40 46 Q54 40 66 46" stroke="${c2}" stroke-width="3" fill="none"/>`);

  const orc = (skin, armor, horns) => wrap(`
    <rect x="30" y="68" width="14" height="24" rx="4" fill="#4a3b2a"/><rect x="56" y="68" width="14" height="24" rx="4" fill="#4a3b2a"/>
    <path d="M22 44 Q50 36 78 44 L74 74 L26 74Z" fill="${skin}"/>
    <path d="M30 46 Q50 40 70 46 L66 62 L34 62Z" fill="${armor}"/>
    <rect x="12" y="46" width="14" height="26" rx="6" fill="${skin}"/><rect x="74" y="46" width="14" height="26" rx="6" fill="${skin}"/>
    <circle cx="50" cy="30" r="14" fill="${skin}"/>
    ${horns ? '<path d="M38 22 L26 6 L42 18Z M62 22 L74 6 L58 18Z" fill="#e8e0c8"/><path d="M36 22 Q50 12 64 22 L64 24 L36 24Z" fill="#555"/>' : ''}
    <circle cx="44" cy="29" r="2.6" fill="#ffdf40"/><circle cx="56" cy="29" r="2.6" fill="#ffdf40"/>
    <path d="M42 38 L40 31 L46 37Z M58 38 L60 31 L54 37Z" fill="#fff"/>
    <rect x="80" y="14" width="4" height="52" fill="#5a3b1e"/><path d="M84 14 Q100 20 84 36Z" fill="#b9c0c8"/>`);

  const goblin = (crown) => wrap(`
    <rect x="38" y="70" width="8" height="20" fill="#4d7a2a"/><rect x="54" y="70" width="8" height="20" fill="#4d7a2a"/>
    <rect x="34" y="46" width="32" height="28" rx="7" fill="#7a4d27"/>
    <path d="M14 34 L34 38 L34 46Z M86 34 L66 38 L66 46Z" fill="#6fae3a"/>
    <circle cx="50" cy="34" r="16" fill="#6fae3a"/>
    ${eyes(43, 57, 32, 3.6, '#ffe45a')}
    <path d="M42 42 Q50 48 58 42" stroke="#243a10" stroke-width="2" fill="none"/>
    <path d="M45 43 L46 47 L48 43Z M52 43 L54 47 L55 43Z" fill="#fff"/>
    ${crown ? '<path d="M36 22 L40 8 L46 18 L50 6 L54 18 L60 8 L64 22Z" fill="#e6b422" stroke="#8a6a10" stroke-width="1.5"/>' : ''}
    <rect x="70" y="42" width="4" height="22" fill="#cfd6de"/><rect x="68" y="62" width="8" height="3" fill="#5a3b1e"/>`);

  const S = {};

  S.knight = wrap(`
    <rect x="38" y="68" width="10" height="22" fill="#4a4a55"/><rect x="52" y="68" width="10" height="22" fill="#4a4a55"/>
    <rect x="34" y="40" width="32" height="32" rx="6" fill="#8d96a3"/><rect x="34" y="40" width="32" height="8" rx="3" fill="#b4bcc8"/>
    <path d="M44 48h12v24h-12z" fill="#a31f2a"/>
    <circle cx="50" cy="30" r="12" fill="#aab2bf"/><rect x="40" y="28" width="20" height="4" fill="#1b1b22"/>
    <path d="M50 12 Q60 12 58 20 H42 Q40 12 50 12Z" fill="#a31f2a"/>
    <path d="M18 46h18v18q0 10-9 14q-9-4-9-14z" fill="#a31f2a" stroke="#d4a84b" stroke-width="2"/>
    <path d="M27 50v22M20 58h14" stroke="#d4a84b" stroke-width="2"/>
    <rect x="70" y="16" width="5" height="46" fill="#dfe6ee"/><rect x="65" y="58" width="15" height="4" fill="#d4a84b"/><rect x="70" y="62" width="5" height="10" fill="#5a3b1e"/>`);

  S.mage = wrap(`
    <path d="M32 90 L40 46 h20 L68 90z" fill="#3b4aa8"/><path d="M45 46h10v44H45z" fill="#6677dd"/>
    <rect x="38" y="62" width="24" height="4" fill="#d4a84b"/>
    <circle cx="50" cy="35" r="10" fill="#f0c9a0"/>
    <path d="M41 39 Q50 62 59 39Z" fill="#ececec"/>
    <path d="M30 32 Q50 22 70 32 L58 28 L54 4 Q46 14 42 28Z" fill="#2c3586"/>
    <rect x="30" y="30" width="40" height="4" rx="2" fill="#d4a84b"/>
    ${eyes(46, 54, 34, 1.8)}
    <rect x="74" y="22" width="4" height="68" fill="#6b4423"/>
    <circle cx="76" cy="18" r="8" fill="#7fe3ff" opacity=".35"/><circle cx="76" cy="18" r="5" fill="#9ff0ff"/>`);

  S.archer = wrap(`
    <rect x="38" y="68" width="9" height="22" fill="#5a3b1e"/><rect x="53" y="68" width="9" height="22" fill="#5a3b1e"/>
    <rect x="28" y="38" width="7" height="24" rx="2" fill="#5a3b1e"/><path d="M29 36l2-5 2 5 2-5 2 5z" fill="#ddd"/>
    <rect x="36" y="42" width="28" height="30" rx="5" fill="#3f7d3a"/><rect x="36" y="58" width="28" height="4" fill="#d4a84b"/>
    <circle cx="50" cy="31" r="10" fill="#f0c9a0"/>
    <path d="M37 36 Q50 8 63 36 Q50 24 37 36Z" fill="#2c5a28"/>
    ${eyes(46, 54, 32, 1.8)}
    <path d="M74 16 Q96 50 74 84" stroke="#6b4423" stroke-width="4" fill="none"/>
    <line x1="74" y1="16" x2="74" y2="84" stroke="#e8e8e8" stroke-width="1"/>
    <rect x="62" y="48" width="28" height="2" fill="#cfd6de"/>`);

  S.slime = wrap(`
    <path d="M14 90 Q10 46 50 42 Q90 46 86 90Z" fill="#59c95a"/>
    <path d="M24 60 Q30 48 44 48" stroke="#a8f0a8" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${eyes(38, 62, 66, 5)}<path d="M42 78 Q50 84 58 78" stroke="#1f5a22" stroke-width="2.5" fill="none"/>`);

  S.goblin = goblin(false);
  S.rei_goblin = goblin(true);
  S.lobo = wolf('#8a8f98', '#5d626b', '#ffd23f');
  S.lobo_gelo = wolf('#cfe9ff', '#8cb8e0', '#3fb8ff');

  S.sapo = wrap(`
    <ellipse cx="50" cy="66" rx="34" ry="24" fill="#6e5aa8"/>
    <ellipse cx="50" cy="74" rx="22" ry="12" fill="#b3d46a"/>
    <circle cx="34" cy="42" r="10" fill="#6e5aa8"/><circle cx="66" cy="42" r="10" fill="#6e5aa8"/>
    ${eyes(34, 66, 41, 6, '#ffe45a')}
    <path d="M30 62 Q50 74 70 62" stroke="#2a1f4d" stroke-width="2.5" fill="none"/>
    <circle cx="28" cy="62" r="3" fill="#9be15d"/><circle cx="72" cy="60" r="3" fill="#9be15d"/><circle cx="46" cy="52" r="2.5" fill="#9be15d"/>`);

  S.esqueleto = wrap(`
    <rect x="40" y="70" width="6" height="20" fill="#e8e2cf"/><rect x="54" y="70" width="6" height="20" fill="#e8e2cf"/>
    <rect x="46" y="42" width="8" height="30" fill="#e8e2cf"/>
    <path d="M36 46h28M37 54h26M38 62h24" stroke="#e8e2cf" stroke-width="4" stroke-linecap="round"/>
    <rect x="26" y="46" width="6" height="24" fill="#e8e2cf"/><rect x="68" y="46" width="6" height="24" fill="#e8e2cf"/>
    <circle cx="50" cy="28" r="14" fill="#f1ecd8"/><rect x="42" y="38" width="16" height="8" fill="#f1ecd8"/>
    <circle cx="44" cy="28" r="4" fill="#111"/><circle cx="56" cy="28" r="4" fill="#111"/>
    <circle cx="44" cy="28" r="1.4" fill="#f55"/><circle cx="56" cy="28" r="1.4" fill="#f55"/>
    <path d="M44 42v5M50 42v5M56 42v5" stroke="#111" stroke-width="1.5"/>
    <rect x="76" y="20" width="4" height="46" fill="#aab2bb"/><rect x="72" y="62" width="12" height="3" fill="#5a3b1e"/>`);

  S.morcego = wrap(`
    <path d="M50 44 Q30 18 4 30 Q16 36 14 52 Q26 44 34 58 Q42 50 50 62Z" fill="#4a2a5e"/>
    <path d="M50 44 Q70 18 96 30 Q84 36 86 52 Q74 44 66 58 Q58 50 50 62Z" fill="#4a2a5e"/>
    <ellipse cx="50" cy="54" rx="13" ry="16" fill="#2d1840"/>
    <path d="M40 40 L38 26 L48 36Z M60 40 L62 26 L52 36Z" fill="#2d1840"/>
    ${eyes(45, 55, 48, 3, '#ff4a4a')}
    <path d="M46 58 L47 64 L50 58 L53 64 L54 58Z" fill="#fff"/>`);

  S.bruxa = wrap(`
    <path d="M24 92 L36 46 h28 L76 92z" fill="#35205a"/><path d="M44 50h12v42H44z" fill="#52358a"/>
    <circle cx="50" cy="38" r="11" fill="#8fd16a"/>
    <path d="M44 48 Q50 56 56 48" stroke="#243a10" stroke-width="2" fill="none"/>
    <path d="M26 32 H74 L58 28 L54 6 Q44 16 42 28Z" fill="#1f1238"/><rect x="26" y="30" width="48" height="5" rx="2" fill="#6a3fb0"/>
    ${eyes(46, 54, 38, 2.2, '#ffe45a')}
    <path d="M47 44 q3 5 6 0" fill="#fff"/><path d="M50 40 l-3 -2 M50 40 l3 -2" stroke="#4a8a2a" stroke-width="1.5"/>
    <rect x="78" y="14" width="4" height="76" fill="#4b3322"/><circle cx="80" cy="12" r="7" fill="#8bff6a" opacity=".6"/><circle cx="80" cy="12" r="4" fill="#c8ffb0"/>`);

  S.aranha = wrap(`
    <g stroke="#1b1b22" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M38 56 Q18 40 8 56 M38 62 Q14 62 6 76 M40 68 Q22 80 18 94 M42 50 Q26 32 16 40"/>
      <path d="M62 56 Q82 40 92 56 M62 62 Q86 62 94 76 M60 68 Q78 80 82 94 M58 50 Q74 32 84 40"/>
    </g>
    <ellipse cx="50" cy="64" rx="18" ry="20" fill="#2b2b36"/><circle cx="50" cy="42" r="12" fill="#3a3a48"/>
    <path d="M44 58 L50 72 L56 58Z" fill="#c22"/>
    ${eyes(44, 56, 40, 2.4, '#ff3a3a')}<circle cx="50" cy="35" r="2" fill="#ff3a3a"/>
    <path d="M45 50 L43 56 M55 50 L57 56" stroke="#ddd" stroke-width="2"/>`);

  S.orc = orc('#5f8f3a', '#6b4a2a', false);
  S.troll = orc('#7a8a8f', '#4a4a52', false);
  S.orc_chefe = orc('#4a7a2a', '#8b1a1a', true);

  S.golem = wrap(`
    <rect x="28" y="70" width="18" height="22" rx="3" fill="#7fa0be"/><rect x="54" y="70" width="18" height="22" rx="3" fill="#7fa0be"/>
    <rect x="24" y="40" width="52" height="34" rx="5" fill="#9fc2de"/>
    <path d="M30 46 L40 56 L34 66M64 46 L58 58 L68 68" stroke="#e9f6ff" stroke-width="2" fill="none"/>
    <rect x="6" y="44" width="18" height="28" rx="4" fill="#8fb4d2"/><rect x="76" y="44" width="18" height="28" rx="4" fill="#8fb4d2"/>
    <rect x="34" y="16" width="32" height="26" rx="5" fill="#b0d2ec"/>
    <path d="M36 16 L40 6 L46 16 M54 16 L60 6 L64 16" fill="#e9f6ff"/>
    <rect x="40" y="26" width="7" height="5" fill="#3fd0ff"/><rect x="54" y="26" width="7" height="5" fill="#3fd0ff"/>`);

  S.dragao = wrap(`
    <path d="M30 48 Q4 10 14 6 Q30 24 42 40Z" fill="#a31f2a"/><path d="M70 48 Q96 10 86 6 Q70 24 58 40Z" fill="#a31f2a"/>
    <path d="M22 20 L30 36 M80 20 L72 36" stroke="#6a1119" stroke-width="2"/>
    <ellipse cx="50" cy="66" rx="26" ry="24" fill="#c42b36"/><ellipse cx="50" cy="74" rx="14" ry="16" fill="#f1c36b"/>
    <path d="M68 78 Q96 80 96 62 Q88 70 74 66Z" fill="#c42b36"/>
    <rect x="30" y="80" width="10" height="12" rx="3" fill="#a31f2a"/><rect x="60" y="80" width="10" height="12" rx="3" fill="#a31f2a"/>
    <path d="M36 30 Q50 20 64 30 L66 46 Q50 56 34 46Z" fill="#c42b36"/>
    <path d="M38 26 L34 10 L46 24Z M62 26 L66 10 L54 24Z" fill="#f1e6c8"/>
    ${eyes(43, 57, 36, 3, '#ffd23f')}
    <circle cx="46" cy="47" r="1.6" fill="#400"/><circle cx="54" cy="47" r="1.6" fill="#400"/>
    <path d="M42 50 L44 55 L47 50 M53 50 L56 55 L58 50" fill="#fff"/>`);

  S.cavaleiro = wrap(`
    <rect x="38" y="68" width="10" height="22" fill="#1b1b26"/><rect x="52" y="68" width="10" height="22" fill="#1b1b26"/>
    <rect x="32" y="40" width="36" height="32" rx="6" fill="#2a2a3a"/><rect x="32" y="40" width="36" height="8" rx="3" fill="#3d3d52"/>
    <path d="M24 42 L36 44 L34 54Z M76 42 L64 44 L66 54Z" fill="#3d3d52"/>
    <circle cx="50" cy="30" r="13" fill="#2a2a3a"/><rect x="40" y="28" width="20" height="5" fill="#000"/>
    <rect x="42" y="29" width="5" height="2.5" fill="#ff2a2a"/><rect x="53" y="29" width="5" height="2.5" fill="#ff2a2a"/>
    <path d="M50 8 L46 20 L54 20Z" fill="#8b1a1a"/>
    <path d="M20 48h16v16q0 10-8 14q-8-4-8-14z" fill="#1b1b26" stroke="#8b1a1a" stroke-width="2"/>
    <rect x="70" y="10" width="6" height="56" fill="#9aa0b5"/><rect x="64" y="60" width="18" height="4" fill="#8b1a1a"/>`);

  S.gargula = wrap(`
    <path d="M30 56 Q2 30 8 8 Q26 22 40 40Z" fill="#6a6f78"/><path d="M70 56 Q98 30 92 8 Q74 22 60 40Z" fill="#6a6f78"/>
    <ellipse cx="50" cy="64" rx="22" ry="24" fill="#8a8f98"/>
    <rect x="34" y="80" width="10" height="12" rx="3" fill="#6a6f78"/><rect x="56" y="80" width="10" height="12" rx="3" fill="#6a6f78"/>
    <circle cx="50" cy="34" r="14" fill="#9aa0a8"/>
    <path d="M38 26 L32 10 L46 22Z M62 26 L68 10 L54 22Z" fill="#6a6f78"/>
    ${eyes(44, 56, 33, 3, '#ff5a2a')}
    <path d="M42 42 Q50 48 58 42" stroke="#333" stroke-width="2.5" fill="none"/>
    <path d="M44 43 L46 47 L48 43 M52 43 L54 47 L56 43" fill="#fff"/>`);

  S.lorde = wrap(`
    <path d="M18 92 L32 44 h36 L82 92z" fill="#1a0d2e"/><path d="M42 48h16v44H42z" fill="#3a1a66"/>
    <path d="M18 92 Q50 80 82 92" stroke="#6a2fb0" stroke-width="2" fill="none"/>
    <circle cx="50" cy="32" r="13" fill="#1d1230"/>
    <path d="M36 24 L28 6 L44 18 L50 2 L56 18 L72 6 L64 24Z" fill="#2a1a40" stroke="#8b4fe0" stroke-width="1.5"/>
    <path d="M44 33 l8 -3 l-8 6Z" fill="none"/>
    <circle cx="44" cy="32" r="3" fill="#c46bff"/><circle cx="56" cy="32" r="3" fill="#c46bff"/>
    <circle cx="44" cy="32" r="6" fill="#c46bff" opacity=".3"/><circle cx="56" cy="32" r="6" fill="#c46bff" opacity=".3"/>
    <rect x="78" y="12" width="4" height="80" fill="#3a2a50"/><circle cx="80" cy="12" r="9" fill="#8b2fe0" opacity=".4"/><circle cx="80" cy="12" r="5" fill="#d8a0ff"/>
    <path d="M30 56 Q12 60 8 78 Q22 70 34 70Z" fill="#2a1a40"/>`);

  R.SPRITES = S;
})(window.RPG);
