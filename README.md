# Crônicas de Vallen

Jogo de ação 2D feito com HTML, CSS e JavaScript puro, sem etapa de build. Basta abrir o `index.html` no navegador (ou publicar a pasta, como no GitHub Pages).

## Modos

- **História**: no mapa-múndi você escolhe um continente e, dentro dele, a fase. O primeiro continente, o **Reino de Vallen**, tem quatro fases: Bosque de Vallen (Gorgo, o Rei Orc), Caverna de Cristal (Golem de Cristal), Deserto Escaldante (Rei Escorpião) e Castelo Sombrio (Lorde Sombrio). Vencer uma fase libera a próxima, e terminar um continente libera o seguinte.
  O segundo continente, **Terra Brasilis**, acompanha as festas do ano: Carnaval (Bonecão Desgovernado), Páscoa (Coelho Colossal), Festa Junina (Boitatá), Noite do Saci (Mula-sem-cabeça) e Natal (Ladrão de Presentes).
- **Co-op Online**: a história em dupla, cada jogador no seu navegador. Os inimigos ficam mais fortes, e quem cai volta depois de 10 segundos se o parceiro continuar de pé.
- **PvP Online**: luta numa das quatro arenas, com melhor de 1, 3 ou 5 rounds e tempo configurável.

Cada fase tem seu tamanho e seu jeito: buracos (cair custa um pedaço da vida e você volta ao último chão firme), armadilhas (espinhos, pêndulos, estalactites, vento, lama e areia que deixam lento, veneno), plataformas que desmoronam, trampolins e elevadores, emboscadas dos dois lados, salas onde é preciso sobreviver por um tempo, perseguições, mini-chefes e vidas escondidas. Cada inimigo tem um truque próprio (escudo, veneno, roubar ouro ou MP, agarrar, cegar, se remontar…) e cada chefe tem fases com mecânicas só dele.

Você começa cada fase com 3 vidas (até 5); às vezes um inimigo deixa cair uma vida extra.

Nos modos online, um jogador cria a sala e o outro entra com o código de 4 letras. Precisa de internet.

## Progressão

Derrotar inimigos dá XP (até o nível 40, cada nível aumenta vida e ataque) e ouro. No mapa do continente, desça até **LOJA** para comprar armas e armaduras melhores no ferreiro; as armas mudam de cor a cada nível. Tudo fica salvo no navegador e pode ser apagado em **Opções → Apagar progresso**. No PvP todos lutam com os atributos base.

## Personagens

| Herói | Estilo | Especiais (1, 2 e 3 barras de MP) |
|---|---|---|
| Kaira, cavaleira | combos de espada | Onda de Espada, Giga Slash, Corte Relâmpago |
| Sylvie, arqueira | ataques de longe; segure ↑ ou ↓ enquanto atira para levantar ou abaixar o arco | Leque de Flechas, Chuva de Flechas, Flecha Estelar |
| Mirela, maga | magia e teleporte | Bola de Fogo, Nevasca, Meteoro |
| Dario, lanceiro | alcance longo e mergulho | Investida, Redemoinho, Lança Celestial |

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
| `js/stages.js` | registro de continentes e fases, dificuldade automática |
| `js/themes.js` | cenários: fundo, plataformas, iluminação e atmosfera |
| `js/mechanics.js` | buracos, armadilhas, efeitos de status, tipos de encontro e fases de chefe |
| `js/tricks.js` | o truque próprio de cada inimigo |
| `js/stages/vallen.js` | continente 1, Reino de Vallen, e suas 4 fases |
| `js/stages/brasilis.js` | continente 2, Terra Brasilis, e suas 5 fases |
| `js/admin.js` | modo administrador para testes (`?admin`) |
| `js/progress.js` | fases liberadas, níveis, ouro e equipamentos (salvos no navegador) |
| `js/render.js` | desenho do mundo e do HUD |
| `js/net.js` | conexão online (PeerJS) |
| `js/pvp.js` | regras do PvP |
| `js/coop.js` | modo cooperativo (sincronização do mundo) |
| `js/menus.js` | menus, opções e pausa |
| `js/game.js` | fluxo do jogo e loop principal |
| `js/bosses.js` | mecânicas próprias de cada chefe (golpes, fases e mudanças na arena) |

## Como criar um continente novo

1. Crie `js/stages/<nome>.js` copiando a estrutura de `js/stages/vallen.js` e chame `registerContinent({...})` com:
   - `id`, `name`, `sub` (por exemplo "Continente 2"), `map` (posição da ilha no mapa-múndi) e `colors` da ilha;
   - `stages`: a lista de fases. Cada fase tem `id`, `name`, `map` (posição e ícone no mapa do continente), `theme`, `music`, `worldW` (comprimento), `platforms`, `zones` (a última com `boss:true`) e, se quiser uma arena de PvP, `arena`.
   - Opcionais: `pits` (buracos), `hazards` (armadilhas: `spikes`, `pendulum`, `stalactite`, `wind`, `slow`, `poison`, `fire`, `gift`), `lifeItems` (vidas escondidas) e plataformas especiais (`crumble`, `bounce`, `move` com `axis:'y'` para elevadores).
   - Tipos de zona (`type`): ondas (padrão), `ambush` (inimigos entram por `'L'`/`'R'`), `survive` (`secs`, `spawn`, `every`, `max`) e `chase` (`to`, sem travar a câmera). Um inimigo da onda vira mini-chefe com `['orc',x,{mini:true,name:'…'}]`.
2. Adicione o arquivo no `index.html`, depois de `js/stages/vallen.js` (a ordem dos arquivos é a ordem dos continentes).
3. Se o continente tiver um cenário novo, crie o tema em `js/themes.js`. Inimigos e chefes novos ficam em `js/enemies.js`; chefes têm um ajuste próprio de dificuldade (`tune`). O truque de um inimigo vai em `js/tricks.js` e as fases e golpes próprios de um chefe em `js/bosses.js`.
4. Aumente o número `?v=` dos arquivos no `index.html` para os navegadores baixarem a versão nova.

A dificuldade dos inimigos comuns é calculada sozinha pela posição da fase na campanha, as fases liberam em sequência entre continentes, e as arenas de PvP entram na lista automaticamente. O progresso salvo dos jogadores continua valendo.

## Modo administrador (para testes)

Funciona só quando o jogo roda no seu computador ou na sua rede local (por exemplo `http://localhost:8765/?admin`); no site publicado o `?admin` é ignorado. Abra o jogo com `?admin` no fim do endereço. Todas as fases ficam liberadas (sem alterar o progresso salvo) e, dentro de uma fase, estas teclas funcionam:

| Tecla | Ação |
|---|---|
| B | pula direto para o chefe |
| K | derrota todos os inimigos da tela |
| I | liga/desliga invencibilidade |
| N | enche o MP |
| L | sobe um nível |
| O | ganha 5000 de ouro |

Nível e ouro ganhos com L e O ficam salvos; para voltar ao normal, use **Opções → Apagar progresso**.
