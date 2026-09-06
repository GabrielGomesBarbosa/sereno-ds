# Guidelines — rascunho (lições da revisão do DS)

> Rascunho vivo. Quando as páginas de componente forem para o formato MUI, isto
> vira o bloco **Uso / Evite** de cada componente.

## Composição em superfícies tingidas

Vários componentes assumem que estão sobre uma **superfície neutra** (surface/canvas).
Sobre uma superfície **tingida** (`--bg-brand-soft` etc.) os preenchimentos neutros
somem. Regra geral: em superfície tingida, prefira variantes que se autodefinem.

| Componente | Evite sobre superfície tingida | Faça |
|---|---|---|
| `IconButton` / `Button` `ghost` | hover cinza (`--interactive-ghost-hover`) fica sujo sobre brand-soft | use `variant="secondary"` (branco + borda) |
| `Badge` `neutral` | fundo `--bg-subtle` some sobre brand-soft | já ajustado: neutral virou chip **outline** (surface + borda), lê em qualquer fundo |
| `Avatar` (fallback) | preenchimento era `--bg-brand-soft` = igual ao header | já ajustado: tom de marca próprio (`color-mix`) + anel |

## Hairlines / divisórias — nunca `--border-subtle` sobre o canvas

**Antipadrão.** `--border-subtle` é *mais claro* que `--bg-canvas`. Uma hairline
desse token direto sobre o canvas (lista, tabela, borda de índice) não lê como
divisória — lê como **um risco branco solto** sobre o fundo, e fica estranho.
`--border-subtle` só funciona sobre `--bg-surface` (branco / elevado): cartão,
painel, cabeçalho de tabela com `--bg-subtle`.

| Onde | Evite | Faça |
|---|---|---|
| Divisória de linha em lista/tabela **sobre o canvas** (ex.: type scale, tabela de contraste, índice "On this page") | `1px solid var(--border-subtle)` | `1px solid var(--border-default)` — cinza real, sempre mais escuro que o canvas |
| Hairline **dentro de um cartão** (`--bg-surface`) | — | `--border-subtle` está ok aqui |
| Divisória que precisa saltar (separar dois blocos densos) | `--border-subtle` / `--border-default` somem | `--border-strong` |

Regra rápida: **a divisória tem que ser mais escura que a superfície atrás dela.**
Sobre o canvas isso já exclui `--border-subtle`.

## Vocabulário de tons (0.6.0)

- **Cinco tons semânticos, mesma palavra em todo lugar** (`Badge`, `Alert`, `Toast`):
  `success` · `warning` · `error` · `info` · `neutral`.
- Tokens: `--status-{success,warning,error,neutral,info}-{bg,fg,dot}`.
- `Badge` não aceita mais `confirmed`/`pending`/etc. — `AppointmentCard` e `Avatar`
  mantêm o `status` de domínio e mapeiam por dentro (confirmed→success, pending→warning,
  cancelled→error, completed→neutral).
- `Button` / `IconButton` (0.7.0): ganham `success` · `warning` · `error` como
  preenchimentos sólidos (tokens `--interactive-{success,warning,error}`), para o caso
  em que a cor É a mensagem (confirmar destrutivo, aprovar). Sem `info` no botão — no
  Sereno `info` = índigo da marca = `primary`. `destructive` foi removido → use `error`.
- Tensão conhecida `accent × success`: o `accent` do Sereno é verde-teal e `success` é
  verde. São eixos diferentes (papel vs. valência) e a decisão foi **manter os dois**.
  Regra: nunca `accent` + `success` na mesma tela; `success` fill fica para pares
  aprovar/rejeitar (ex.: ações do card de agendamento), onde não há `accent` competindo.

## Select — listbox à mão (0.8.0)

- Nativo estilizado vazava: o menu era do SO (feio, cobria o trigger). Trocado por
  listbox próprio, sem lib, seguindo o padrão do `DateTimePicker`.
- **Desktop / ponteiro fino:** `<button role="combobox">` + painel `role="listbox"`
  em portal (`position:fixed`), abre abaixo, vira pra cima sem espaço. Teclado
  completo, `aria-activedescendant`, type-ahead.
- **Touch (`pointer: coarse`):** cai pro `<select>` nativo — picker do SO é melhor no
  dedo. Mesma API. Detecção via `useSyncExternalStore` (SSR-safe, sem hydration flash).
- **Trava o scroll da página enquanto aberto** (convenção de select nativo / Radix
  Select): `wheel`/`touchmove`/teclas de scroll fora do painel são engolidos; o
  overflow da própria lista ainda rola. Antes eu tinha feito "fechar no scroll", mas
  travar é o padrão pra select e mata na raiz o "samba" e o painel flutuando no header.
- API: `value`/`defaultValue` + `onValueChange(value)` — string, não evento.
  `SelectOption` ganhou `disabled?`; novos `placeholder` e `name` (hidden input).

## Cor / paleta (tema claro, revisão 2026-08-29)

- `--bg-canvas` era colado demais no `--bg-surface` branco → `secondary` e painéis
  tingidos não liam. Canvas agora é um cinza-frio nítido abaixo do surface; softs e
  fills de baixa ênfase subiram um passo. Hues de texto/marca/status intactos.
- Hover `ghost` cinza (`--bg-subtle`) **é o comportamento documentado** e correto em
  superfície neutra (barras, diálogos, cards). Só não use ghost sobre superfície tingida.

## Contraste WCAG 2.1 AA (0.9.0, SS-45)

- Auditoria de todos os pares texto/fundo e não-texto, light + dark. Ajustes só de
  lightness, hues intactos: `--text-muted` (escureceu no light, clareou no dark),
  `--text-accent` → `accent-700` no light, `--status-success/warning-fg` → novos
  `green-700`/`amber-700`, `--interactive-success/warning` (light) mais escuros.
- **`--interactive-accent-fg` no light virou texto escuro** (`#04231F`) — branco sobre
  o turquesa vivo dava 3.0:1. O CTA accent agra é escuro-sobre-claro nos dois temas.
- Dark `--interactive-primary` subiu um passo (`brand-400`) pro label quase-preto passar.
- **Isentos** (documentado na página de Tokens): texto disabled (WCAG 1.4.3), bordas
  de repouso `--border-default/strong` (decorativas, nunca a única pista). `--text-muted`
  sobre `--bg-subtle`/`--bg-sunken` fica ~4.2:1 → só texto grande; use `--text-secondary`.
- Nova seção **Contrast** na página `/design-system/tokens`.

## Responsividade — componentes precisam refluir

- `Tabs` `pill`: abraça o conteúdo (`inline-flex` + `align-self:flex-start`); nunca
  estica pra preencher um pai flex/grid. `fullWidth` opta por esticar.
- `Tabs` contador inativo: chip branco no `pill` (o trilho já é `--bg-subtle`),
  cinza no `underline` (está sobre a página).
- `AppointmentCard`: `flex-wrap` — badge de status + ações caem pra 2ª linha em
  largura estreita; o slot do cliente tem `min-width` pra não esmagar o nome.
- `WeeklyScheduleEditor`: linha de dia empilha (Switch acima, horários abaixo) em
  telas estreitas; Select de buffer usa `width:100%` com `max-width`.

## Layout das superfícies (app + DS)

- **`/design-system`**: app-shell fixo em todo tamanho — header não rola, sidebar e
  conteúdo são painéis independentes. ≤900px a sidebar vira **drawer** (hambúrguer no
  header + `MobileNav`). O conteúdo é o único scroll (`ScrollPanel` reseta no route change).
- **`/agendar`**: mobile full-bleed → tablet card contido (560px) → desktop card
  2-colunas (rail de identidade/resumo + passo). Tudo por CSS, markup mobile intacto.
- **`/dashboard`**: sidebar ≥900px → BottomNav <900px. Stats 4→2 em grid. Agenda 2-col
  → empilha <1080px.
