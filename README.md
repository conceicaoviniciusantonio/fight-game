# Crônicas de Vallen

Jogo de ação 2D feito com HTML, CSS e JavaScript puro, sem etapa de build. Basta abrir o `index.html` no navegador (ou publicar a pasta, como no GitHub Pages).

## Modos

- **História**: atravesse o Bosque de Vallen e derrote Gorgo, o Rei Orc.
- **Co-op Online**: a história em dupla, cada jogador no seu navegador. Os inimigos ficam mais fortes, e quem cai volta depois de 10 segundos se o parceiro continuar de pé.
- **PvP Online**: luta na arena, com melhor de 1, 3 ou 5 rounds e tempo configurável.

Nos modos online, um jogador cria a sala e o outro entra com o código de 4 letras. Precisa de internet.

## Controles

Teclado (as teclas podem ser trocadas em **Opções → Configurar teclas**):

| Tecla | Ação |
|---|---|
| ← → | andar (toque duas vezes para dash) |
| ↑ / Espaço | pular (pulo duplo no ar) |
| ↓ | descer da plataforma |
| Z | atacar |
| X | especial de 1 barra de MP |
| C | especial de 2 barras de MP |
| V | especial de 3 barras de MP |
| A | esquiva (rolamento) |
| S (segurar) | defesa; no instante certo vira defesa perfeita |
| P / Esc | pausar |
| M | ligar/desligar o som |
| 1 a 4 | emotes (GG!, Valeu!, Cuidado!, Haha!) |

Controle de Xbox ou PlayStation: analógico ou direcional para andar, A pula, X ataca, Y, B e RB são os especiais, LB defende, LT/RT esquivam, Start pausa.

No celular aparecem botões na tela (jogue com o aparelho na horizontal).

## Estrutura do código

| Arquivo | Conteúdo |
|---|---|
| `js/util.js` | canvas, constantes e funções de desenho |
| `js/settings.js` | opções e teclas salvas no navegador |
| `js/input.js` | teclado, controle e toque convertidos em ações |
| `js/audio.js` | efeitos sonoros e músicas geradas por código |
| `js/world.js` | estado do mundo, física e efeitos visuais |
| `js/heroes.js` | heróis: atributos, golpes, especiais e visual |
| `js/player.js` | lógica dos jogadores e dos acertos |
| `js/enemies.js` | inimigos, chefes e suas IAs |
| `js/stages.js` | fases e cenários |
| `js/render.js` | desenho do mundo e do HUD |
| `js/net.js` | conexão online (PeerJS) |
| `js/pvp.js` | regras do PvP |
| `js/coop.js` | modo cooperativo (sincronização do mundo) |
| `js/menus.js` | menus, opções e pausa |
| `js/game.js` | fluxo do jogo e loop principal |
