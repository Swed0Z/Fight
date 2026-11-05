# Briga de Rua — Crônicas de Ravenhold

RPG medieval de turnos que roda direto no navegador, feito em HTML, CSS e JavaScript puro (sem dependências).

## Como jogar
Abra `index.html` no navegador ou publique no GitHub Pages.

1. Escolha o nome e a classe: **Cavaleiro**, **Mago** ou **Arqueiro**.
2. Na **Vila de Ravenhold**, compre equipamentos, descanse na estalagem e aceite missões.
3. Use o mapa para explorar regiões, lutar contra monstros e desafiar os chefes.
4. Derrote cada chefe para liberar a próxima região, até chegar ao Lorde Sombrio.

## Recursos
- 3 classes com 3 habilidades cada (desbloqueadas por nível)
- 6 locais, 17 monstros e 5 chefes com ataques especiais
- Combate com animações, críticos, esquivas, defesa, itens e fuga
- Níveis até 20, loja de armas, armaduras e poções
- 10 missões encadeadas, com diário
- Salvamento automático no navegador (`localStorage`)
- Personagens e monstros desenhados em SVG, sem imagens externas
- Efeitos sonoros gerados por código, com botão para silenciar

## Estrutura
```
index.html
style.css
js/data.js     classes, itens, monstros, locais e missões
js/sprites.js  desenhos em SVG
js/audio.js    efeitos sonoros sintetizados (Web Audio)
js/pixelfx.js  efeitos visuais de combate (usa a biblioteca pixelfx)
js/game.js     estado, mapa, combate, loja, missões e save
```

## Créditos
Os efeitos visuais de combate usam a biblioteca [pixelfx](https://github.com/patch-gg/pixelfx), de Patch e Hugo Duprez, licença MIT.
