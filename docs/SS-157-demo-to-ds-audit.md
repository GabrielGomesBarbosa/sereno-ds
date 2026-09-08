# SS-157 — Auditoria "demo → DS"

**Subtask [SS-177](https://archtechsystems.atlassian.net/browse/SS-177).** Varredura de `apps/demo/src/screens/` atrás de todo elemento de UI **base** (botão / campo / menu / marca) que não vem de `@sereno/ui`. Composições de tela (`Stat`, `AppointmentRow`, `DayBlock`, `ComingSoon`, `Hero`, `Rail`, …) **não** entram — montar tela com primitivos é o padrão certo.

Telas varridas: `BookingFlow.tsx`, `Dashboard.tsx`, `Onboarding.tsx`. Também conferido `apps/docs/src/design-system/Sidebar.tsx` (citado no card).

> **Estado — 2026-09-08.** [SS-178](https://archtechsystems.atlassian.net/browse/SS-178) (`Menu`) e [SS-180](https://archtechsystems.atlassian.net/browse/SS-180) (refatorar telas) **mergeados na PR #44**. Falta **SS-179** (resquícios de marca), **SS-181** (CHANGELOG + README), **SS-205** (Stepper só-track). Detalhe por item na coluna **Status**.

## Resultado em uma linha

O grosso já usa o DS. Faltava **um** primitivo de verdade — `Menu` / `Dropdown` — e uma leva de `<button>` crus + o toast montado à mão no Dashboard. **`Brand` já existe e já é usado** em todas as telas.

## Tabela de classificação

| # | Onde | O que é hoje | Classificação | Ação | Status |
|---|------|--------------|---------------|------|--------|
| 1 | `Dashboard.tsx` `NotificationsMenu` + `UserMenu` | popover montado à mão: `data-menu-root` + `useDismiss` + `panelStyle`/`mobilePanelStyle` + linhas `<button>`. Sem `role="menu"`, sem teclado, sem focus trap. | **PROMOVER** | Novo primitivo **`Menu`** (SS-178): trigger + painel em portal, `role="menu"`/`menuitem`, setas + Home/End + Esc, click-fora, flip, `tone="danger"`. | ✅ **#44** — `Menu` criado (SS-178); os dois menus migrados (SS-180) com `header` (nome/email; "marcar todas") + `adornment` (badge). |
| 2 | `Dashboard.tsx` `panelStyle` / `mobilePanelStyle` / `useDismiss` | posicionamento + dismiss do popover, colados na tela | **PROMOVER (junto do #1)** | Vira lógica interna do `Menu`. | ✅ **#44** — removidos. Full-width centrado ≤ 560px vive no primitivo. |
| 3 | `Dashboard.tsx` toast manual | `useState` + `setTimeout(3200)` + wrapper `position: fixed` + `<Toast>`; `onToast` threadado por menus / rows / views | **TROCAR por primitivo existente** | `ToastProvider` + `useToast()` (SS-61). | ✅ **#44** — `Dashboard` = `<ToastProvider position="top-right">` em volta de `DashboardShell`; `onToast` = `toast.success`. |
| 4 | `Onboarding.tsx` `.onb-skip` "Preencher depois" | `<button>` cru | **TROCAR** | `<Button variant="ghost">`. | ✅ **#44** — `<Button variant="ghost" size="sm">`; CSS morto removido. |
| 5 | `Dashboard.tsx` "Marcar todas como lidas" | `<button>` cru no painel de notificações | **TROCAR** | `<Button variant="link" size="sm">`. | ✅ **#44** — dentro do `header` do `Menu`. |
| 6 | `Dashboard.tsx` "Ver todas" | `<button>` cru, rodapé do painel | **TROCAR** | `Menu.Item` ou `<Button variant="ghost" fullWidth>`. | ✅ **#44** — `<Button variant="ghost" fullWidth>` no `children` do `Menu`. |
| 7 | `Dashboard.tsx` `.dash-menu-btn` (linhas "Tema", "Configurações", "Sair") | `<button>` crus | **TROCAR** | `Menu.Item`s; "Sair" com `tone="danger"`. | ✅ **#44** — `items` do `Menu` (tema toggle com `keepOpen` no narrow). |
| 8 | `Dashboard.tsx` trigger do `UserMenu` | `<button>` cru (Avatar + nome + chevron) | **TROCAR** | `trigger` do `Menu`. | ✅ **#44** — `trigger` do `Menu` (`.dash-user-trigger` + CSS `[data-menu-open]` pro estado aberto / chevron). |
| 9 | `Dashboard.tsx` `.ds-affix-btn` "Copiar link" | `<button>` como `suffix` de um `Input` | **TROCAR** | `IconButton size="sm"` — ou documentar `.ds-affix-btn` como padrão de affix. | ✅ **#44** — **mantido `.ds-affix-btn`**: é a própria classe de affix do DS (olho do `Input`, clear do `SearchInput`, ações do `FileUpload`/`AvatarUpload`). Só tiramos os styles inline redundantes. `IconButton` seria mais pesado e inconsistente. |
| 10 | `BookingFlow.tsx` `Progress` (3 segmentos, sem label) | componente local | **TROCAR (idealmente)** | `<Stepper variant="bar">` — mesma linguagem visual. Bloqueio: `Stepper` sempre renderiza "Passo N de M". | ⏳ **SS-205** — precisa do modo só-track no `Stepper` primeiro. Até lá, `Progress` fica como composição mínima. |
| 11 | `Onboarding.tsx` `<span>Sereno</span>` | wordmark em texto puro | **TROCAR** | `<Brand variant="lockup" size={20} />`. | ⏳ **SS-179** — único resquício de marca fora do `Brand` nas telas. |
| 12 | `BookingFlow.tsx` **=** `Onboarding.tsx` (chip de ícone 64×64) | quadrado arredondado `status-success` + `CheckCircle2`, **duplicado idêntico** nas 2 telas de sucesso | **PROMOVER (pequeno) — decisão do PO** | Um `StatusIcon` (ícone num quadrado tonalizado, tons + tamanhos). Ou fica composição. | 🅿️ **PO decidiu manter por ora** — 2 usos de ~8 linhas não pagam o custo de um componente novo; revisitar se surgir um 3º uso. Não bloqueia. |
| 13 | `railLabel` / overline em CAIXA ALTA, repetido 3× | micro-label (`text-2xs`, 700, uppercase, `text-muted`) | **MANTER (por ora)** | Território de primitivo tipográfico (`Overline`/`Label`). | — sem ação. Ticket próprio se quiser padronizar; fora do escopo de SS-157. |
| 14 | `Dashboard.tsx` `useMediaQuery` | hook local | **MANTER** | O DS quase não exporta hooks (só `useToast`). | — sem ação. |
| 15 | `cardTitle` / `bigNumber` / `h1` / `display()` (estilos de heading inline) | repetidos nas telas | **MANTER** | Falta `Heading`/`Text` no DS; concern separado. | — sem ação. |
| 16 | `apps/docs/.../demos.tsx` `Wordmark` local | helper de demo que desenha a marca | **TROCAR (trivial, fora das telas)** | `<Brand variant="lockup" />`. | ⏳ **SS-179** — entra junto do #11 (varredura de marca). |

### Confirmado OK (composição consciente — nenhuma ação)

`Stat`, `AppointmentRow`, `DayBlock`, `ViewHeader`, `ComingSoon`/`ComingSoonView`, `Hero`, `Rail`, `Progress`\* , `DoneScreen`, `PerfilStep`/`ServicoStep`/`GradeStep`, `FinanceiroView`/`RelatoriosView`/`ConfigView`, `AgendaView`/`ClientesView`/`ServicosView`. Todos montam primitivos do DS + cards de domínio (`ServiceCard`, `ProfessionalCard`, `AppointmentCard`, `WeeklyScheduleEditor`).

\* `Progress` sai da lista se #10 (SS-205) for adiante.

## Subtasks

| Subtask | Situação |
|---|---|
| **SS-178** `Menu` / `Dropdown` | ✅ **Done (#44).** Primitivo + `header` + `adornment` + full-width centrado ≤ 560px + página na vitrine + 16 testes. Itens #1, #2. |
| **SS-180** Refatorar buttons/menus crus | ✅ **Done (#44).** Itens #3–#9, #4, #11-parcial. `.booking-backbtn` era item obsoleto (já `<Button>`). |
| **SS-179** Varredura de marca | ⏳ **To Do.** `Brand` já existe; resta trocar o `<span>Sereno</span>` do Onboarding (#11) e o helper `Wordmark` da vitrine (#16). |
| **SS-181** Catálogo + CHANGELOG + README | ⏳ **To Do.** Página + entrada de catálogo do `Menu` **já feitos (#44)**. Falta: entrada no `apps/docs/src/design-system/CHANGELOG.md` + recontagem de componentes no README (+1 `Menu`). |
| **SS-205** Stepper: tirar "Passo N de M" fixo | ⏳ **To Do.** Pré-requisito do #10. Independente das outras. |

## Plano restante

1. **SS-179** — `<span>Sereno</span>` (#11) + `Wordmark` de demo (#16) → `<Brand>`.
2. **SS-205** — modo só-track no `Stepper`; então trocar o `Progress` do `BookingFlow` (#10).
3. **SS-181** — CHANGELOG do `Menu` + contagem no README.

`#12` (`StatusIcon`): decisão do PO tomada — **manter** como composição por ora.
