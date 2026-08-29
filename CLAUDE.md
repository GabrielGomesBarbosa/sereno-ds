@AGENTS.md

# Sereno DS — notas para o Claude

Contexto e escopo completos: card Jira **SS-39** (projeto SS). Leia antes de mudanças grandes.

## Regras deste repo

- **Next.js 16 App Router + TypeScript**, `output: 'export'` (estático, deploy Netlify). Sem SSR/servidor Node.
- **Sem lib de UI base.** Os 25 componentes em `src/components/` são portados 1:1 do Design System aprovado — token-driven, estilo inline lendo CSS custom properties. Ao editá-los, preserve o comportamento; não introduza Radix/MUI/Tailwind.
- **Tokens** em `app/styles/tokens/*.css`. Ajustes feitos e documentados no próprio arquivo:
  - `typography.css` aponta as famílias para as variáveis do `next/font`.
  - `colors.css`: seletor `:root` ampliado para `:root, [data-theme="light"]` (theme islands da página de tokens).
  - `colors.css`: **escala de backgrounds do tema claro revisada** (decisão do dono do produto, 2026-08-29) — o canvas antigo (`#F5F7FA`) era colado demais no surface branco e no brand-soft; agora `--bg-canvas:#E8ECF3`, `--bg-subtle:#DFE4EC`, `--bg-sunken:#D9DFE9`, `--bg-brand-soft:brand-100`, `--bg-accent-soft:accent-100`, e os fills de baixa ênfase (`--interactive-secondary-hover/active`, `--interactive-ghost-hover`, `--interactive-disabled-bg`) subiram um passo. Hues de texto/marca/status intactos. Dark mode intocado.
- **Ícones**: sempre `lucide-react` passado como prop (`iconLeft`, `icon`, `children`…). Nunca CDN nem `data-lucide`.
- **Fontes**: só `next/font/google`. Nunca CDN do Google Fonts.
- **Keyframes/estados globais** (`sereno-spin`, `sereno-pop`, `sereno-slide-up`, `sereno-pulse`, `.sereno-check:checked`, `.sereno-radio:checked`) vivem em `app/globals.css` — os componentes dependem deles.
- Rotas dinâmicas precisam de `generateStaticParams` (export estático). `robots.ts`/`sitemap.ts` precisam de `export const dynamic = 'force-static'`.
- `/design-system/**` é `noindex` e fica fora do sitemap.

## Verificação antes de commit

```bash
npm run lint && npm run build
```

`npm run build` tem que gerar `out/` sem erro, com as 25 páginas de componente + as 3 telas.
