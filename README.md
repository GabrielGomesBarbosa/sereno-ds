# Sereno — Design System + vitrine (Next.js)

Camada visual/front-end da plataforma de agendamento **Sereno** (SaaS para profissionais
autônomos de saúde e beleza no Brasil). Este repositório entrega duas coisas:

1. **Design System** — as 25 primitivas React aprovadas, portadas para TypeScript em
   `src/components/`, token-driven (CSS custom properties), com dark mode nativo.
2. **Vitrine navegável** (`/design-system`) — uma página por componente com prévia ao
   vivo, tabela de props e exemplo de uso, mais uma página de tokens (claro × escuro).
3. **3 telas reais do produto**, com dados mockados:
   - `/agendar/[slug]` — fluxo público de agendamento (mobile-first)
   - `/dashboard` — dashboard do profissional
   - `/onboarding` — wizard de 3 passos

> Referência: card Jira **SS-39**. Sem backend nesta fase — tudo estático.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Saída | `output: 'export'` (estático) → deploy no Netlify (`out/`) |
| Fontes | Inter + Manrope via `next/font/google` (auto-hospedadas, sem CDN) |
| Ícones | `lucide-react` (passados como prop aos componentes) |
| Tema | `next-themes` escrevendo `data-theme` no `<html>` |
| Base de UI | nenhuma — os componentes são do zero, sem Radix/MUI/etc. |

## Scripts

```bash
npm run dev      # servidor de desenvolvimento (localhost:3000)
npm run build    # build de produção + export estático em out/
npm run lint     # ESLint
```

## Estrutura

```
app/                        rotas (App Router)
  layout.tsx                fontes, ThemeProvider, metadata/OG base
  globals.css               importa os tokens + keyframes + regras .sereno-check/.sereno-radio
  styles/tokens/*.css        tokens do Design System (valores intactos)
  design-system/            vitrine (layout com sidebar, [category]/[slug], tokens) — noindex
  agendar/[slug]/           fluxo público (generateStaticParams a partir dos mocks)
  dashboard/  onboarding/   telas do produto
  robots.ts  sitemap.ts     SEO básico (design-system fica de fora)
src/
  components/               25 primitivas .tsx + index.ts (barrel) + _internal/ (helpers)
  screens/                  BookingFlow, Dashboard, Onboarding (client components)
  design-system/            catálogo, demos, ComponentView, Sidebar, CodeBlock
  theme/                    ThemeProvider + ThemeToggle
  lib/mock.ts               dados mockados das 3 telas
```

## Deploy (Netlify)

`netlify.toml` já configura `command = "npm run build"` e `publish = "out"`. Basta
conectar o repositório no Netlify (plano free) — o deploy roda automático a cada push.
