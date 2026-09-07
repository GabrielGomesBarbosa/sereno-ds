# SS-157 — Auditoria "demo → DS"

**Subtask [SS-177](https://archtechsystems.atlassian.net/browse/SS-177).** Varredura de `apps/demo/src/screens/` atrás de todo elemento de UI **base** (botão / campo / menu / marca) que não vem de `@sereno/ui`. Composições de tela (`Stat`, `AppointmentRow`, `DayBlock`, `ComingSoon`, `Hero`, `Rail`, …) **não** entram — montar tela com primitivos é o padrão certo.

Telas varridas: `BookingFlow.tsx`, `Dashboard.tsx`, `Onboarding.tsx`. Também conferido `apps/docs/src/design-system/Sidebar.tsx` (citado no card).

## Resultado em uma linha

O grosso já usa o DS. Falta **um** primitivo de verdade — `Menu` / `Dropdown` — e uma leva de `<button>` crus + o toast montado à mão no Dashboard para trocar. **`Brand` já existe e já é usado** em todas as telas, então a subtask "novo primitivo Brand" está essencialmente pronta.

## Tabela de classificação

| # | Onde | O que é hoje | Classificação | Ação |
|---|------|--------------|---------------|------|
| 1 | `Dashboard.tsx:271` `NotificationsMenu` + `:370` `UserMenu` | popover montado à mão: `data-menu-root` + `useDismiss` (click-fora + Esc) + `panelStyle`/`mobilePanelStyle` + linhas `<button>`. Sem `role="menu"`, sem roving de teclado, sem focus trap. | **PROMOVER** | Novo primitivo **`Menu` / `Dropdown`** (SS-178): trigger + painel em portal, `role="menu"`/`menuitem`, setas + Home/End + Esc, click-fora, ancoragem com flip, item de risco (`tone="danger"`). Os dois menus do Dashboard passam a consumi-lo. |
| 2 | `Dashboard.tsx:220` `panelStyle` / `:234` `mobilePanelStyle` / `:242` `useDismiss` | posicionamento + dismiss do popover, colados na tela | **PROMOVER (junto do #1)** | Some quando o `Menu` existir — a lógica vira interna do primitivo. |
| 3 | `Dashboard.tsx:443` + `:452-456` + `:620-635` | **toast montado à mão**: `useState` + `setTimeout(3200)` + wrapper `position: fixed` + `<Toast>`. `onToast` é threadado por `NotificationsMenu`, `UserMenu`, `AppointmentRow`, `DayBlock`, todas as views. | **TROCAR por primitivo existente** | `ToastProvider` + `useToast()` (entregue em SS-61). Envolver o `Dashboard` no provider, trocar `onToast(msg)` → `toast(msg)`, apagar o estado/timer/wrapper. |
| 4 | `Onboarding.tsx:117` `<button className="onb-skip">` "Preencher depois" | `<button>` cru | **TROCAR** | `<Button variant="link">` (ou `ghost`). |
| 5 | `Dashboard.tsx:312` "Marcar todas como lidas" | `<button>` cru dentro do painel de notificações | **TROCAR** | `<Button variant="link" size="sm">`. |
| 6 | `Dashboard.tsx:342` "Ver todas" | `<button>` cru, rodapé do painel de notificações | **TROCAR** | Vira `Menu.Item` (#1) ou `<Button variant="ghost" fullWidth>`. |
| 7 | `Dashboard.tsx:422 / 427 / 430` `.dash-menu-btn` (linhas "Tema", "Configurações", "Sair") | `<button>` crus com `style={row}` | **TROCAR** | Viram `Menu.Item` do novo primitivo (#1); a linha "Sair" usa a variante de risco. |
| 8 | `Dashboard.tsx:395` trigger do `UserMenu` (`<button>` com `Avatar` + nome + chevron) | `<button>` cru | **TROCAR** | Vira o `trigger` do `Menu` (#1) — `Menu` aceita `trigger` arbitrário (`asChild`). |
| 9 | `Dashboard.tsx:795` `<button className="ds-affix-btn">` "Copiar link" | `<button>` cru como `suffix` de um `Input` | **TROCAR** | `<IconButton size="sm" variant="ghost">` — cabe no affix. Se o tamanho não fechar, documentar `ds-affix-btn` como padrão oficial de affix. |
| 10 | `BookingFlow.tsx:30-47` `Progress` (3 segmentos, sem label) | componente local, 3 `<span>` com bg condicional | **TROCAR (idealmente)** | `<Stepper variant="bar">` já é "a mesma linguagem visual" (diz o próprio doc do `Stepper`). Bloqueio: `Stepper` **sempre** renderiza a linha "Passo N de M". Depende de **SS-205** (tirar essa copy fixa) — aí `Stepper` ganha um modo só-track e o `Progress` some. Enquanto isso: manter como composição mínima. |
| 11 | `Onboarding.tsx:79` `<span>Sereno</span>` | wordmark em texto puro (`font-display`, 800, `text-brand`) | **TROCAR** | `<Brand variant="lockup" size={20} />`. (Único resquício de marca fora do `Brand` nas telas.) |
| 12 | `BookingFlow.tsx:267-280` **=** `Onboarding.tsx:269-282` | chip de ícone 64×64 (quadrado arredondado, `status-success`, `CheckCircle2`) **duplicado idêntico** nas 2 telas de sucesso | **PROMOVER (pequeno) — decisão do PO** | Um `StatusIcon` / `ResultIcon` (ícone num quadrado tonalizado, tons `success`/`warning`/`error`/`info`, tamanhos). ~15 linhas hoje, repetido 2×. Ou fica como composição consciente. Não bloqueia o resto. |
| 13 | `BookingFlow.tsx:22` `railLabel` · `Onboarding.tsx:236` · `Dashboard.tsx:761` | micro-label em CAIXA ALTA (`text-2xs`, 700, `tracking .07em`, `text-muted`) repetido 3× | **MANTER (por ora)** | Território de primitivo tipográfico (`Overline` / `Label`). Sem `Heading`/`Text` no DS ainda — abrir ticket próprio se quiser padronizar; fora do escopo de SS-157. |
| 14 | `Dashboard.tsx:175` `useMediaQuery` | hook local | **MANTER** | O DS quase não exporta hooks (só `useToast`). Fora de escopo. |
| 15 | `Dashboard.tsx:187` `cardTitle` · `:200` `bigNumber` · `Onboarding.tsx:17` `h1` · `BookingFlow.tsx:15` `display()` | estilos de heading inline, repetidos | **MANTER** | Mesmo caso do #13 — falta `Heading`/`Text` no DS; concern separado, não é "UI base". |
| 16 | `apps/docs/.../demos.tsx:1300` `Wordmark` local | helper de demo que desenha a marca | **TROCAR (trivial, fora das telas)** | `<Brand variant="lockup" />`. É demo da vitrine, não tela de produto — pode entrar junto de SS-181. |

### Confirmado OK (composição consciente — nenhuma ação)

`Stat`, `AppointmentRow`, `DayBlock`, `ViewHeader`, `ComingSoon`/`ComingSoonView`, `Hero`, `Rail`, `Progress`\* , `DoneScreen`, `PerfilStep`/`ServicoStep`/`GradeStep`, `FinanceiroView`/`RelatoriosView`/`ConfigView`, `AgendaView`/`ClientesView`/`ServicosView`. Todos montam primitivos do DS + cards de domínio (`ServiceCard`, `ProfessionalCard`, `AppointmentCard`, `WeeklyScheduleEditor`). 

\* `Progress` sai da lista se #10 for adiante.

## Impacto nas outras subtasks

| Subtask | Situação após a auditoria |
|---|---|
| **SS-178** Menu / Dropdown | **Confirmada e é o núcleo da story.** Escopo: itens #1, #2, #6, #7, #8. |
| **SS-179** Brand / Logo | **Já entregue.** `packages/ui/src/core/Brand.tsx` existe (`symbol` / `lockup` / `lockup-vertical`, `mono`, `size`) e é usado em `BookingFlow`, `Dashboard`, `DemoNav`, ambas as landings e `Sidebar` (docs). Resta só o item #11 (Onboarding) e #16 (demo). Sugestão: fechar SS-179 como done com uma nota, ou reaproveitá-la para "varrer resquícios de marca" (#11 + #16). |
| **SS-180** Refatorar buttons/menus crus | Itens #3, #4, #5, #6, #7, #8, #9, #11. O card menciona `.booking-backbtn` como `<button>` cru — **já é `<Button variant="ghost">`** (`BookingFlow.tsx:173`), a classe é só CSS de layout. Item obsoleto. |
| **SS-181** Catálogo + CHANGELOG + README | Página de vitrine + entrada de catálogo + CHANGELOG para o `Menu`; recontagem de componentes no README (+1: Menu). Item #16 pode entrar aqui. |
| **SS-205** Stepper: tirar "Passo N de M" fixo | Pré-requisito do item #10. Independente; pode rodar antes ou em paralelo. |

## Plano sugerido (ordem)

1. **SS-178** — `Menu` / `Dropdown` no DS (novo primitivo + testes + página de vitrine).
2. **SS-180** — refatorar as telas: `Menu` nos dois menus do Dashboard, `ToastProvider`/`useToast` no lugar do toast manual, `<button>` crus → `Button`/`IconButton`, `<span>Sereno</span>` → `Brand`.
3. **SS-205** — modo só-track no `Stepper`; então trocar o `Progress` do BookingFlow.
4. **SS-181** — catálogo + CHANGELOG + contagem no README.
5. **SS-179** — fechar (marca já pronta) ou usar para os resquícios #11/#16 se não entrarem no SS-180.
6. **#12** (`StatusIcon`) — decisão do PO: promover pequeno ou manter. Não bloqueia.
