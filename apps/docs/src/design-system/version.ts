import pkg from '@sereno-ds/ui/package.json';

/**
 * The one Sereno DS version — the published `@sereno-ds/ui` / `@sereno-ds/tokens`
 * number (they move in lockstep). Shown in the `/design-system` header.
 *
 * Do NOT hand-edit a version anywhere: `npm run version-packages` (Changesets)
 * bumps `packages/ui/package.json` and this reads it back. Editing only the
 * showcase or the demo never changes this.
 */
export const DS_VERSION: string = pkg.version;
