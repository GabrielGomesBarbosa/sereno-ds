# Fonts

The three families the showcase (`apps/docs`) and the demo (`apps/demo`) use, as files, so their builds
never download a font (SS-570). Each app loads them with `next/font/local` in its `app/layout.tsx` and sets
the `--font-inter` / `--font-manrope` / `--font-jetbrains-mono` variables, which are the `@sereno-ds/ui`
font contract.

| File | Family | Weights | Subset |
|---|---|---|---|
| `Inter-latin.woff2` | Inter | 400-700 (variable) | latin |
| `Manrope-latin.woff2` | Manrope | 500-800 (variable) | latin |
| `JetBrainsMono-latin.woff2` | JetBrains Mono | 400-500 (variable) | latin |

Only the `latin` subset is here: it covers Portuguese and English text. (`next/font/google` also declared
the cyrillic, greek, vietnamese and latin-ext faces, which a browser only fetched if such a character
appeared; none of the apps shows one. If that changes, add that subset's file the same way.)

They are the files Google Fonts serves for those families (the same ones `next/font/google` used to
download), all under the SIL Open Font License 1.1: the license of each is next to it (`OFL-*.txt`) and has
to stay with the font files.

To update one, take the `latin` block of `https://fonts.googleapis.com/css2?family=<Family>:wght@<range>`
(ask for it with a current browser user agent to get `woff2`) and replace the file.
