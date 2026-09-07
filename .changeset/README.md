# Changesets

`@sereno/ui` and `@sereno/tokens` are versioned here, **in lockstep** (one number,
always equal — `fixed` in `config.json`). That number is what publishes to npm
and what the showcase header displays (it reads `@sereno/ui/package.json`).

## The one rule

**A changeset is only for a change under `packages/**`.**

- Touched `apps/docs` (the showcase) or `apps/demo` only? → **no changeset.** They
  are `private` and in the `ignore` list, so they can't be versioned or published.
  Nothing bumps, nothing releases.
- Touched a component / token / the barrel? → add a changeset:

  ```
  npm run changeset
  ```

  Pick `@sereno/ui` (tokens comes along automatically), choose `patch` for a
  fix/tweak or `minor` for a feature/structure change, write one line for the
  consumer changelog. Commit the generated `.changeset/*.md` with your PR.

## Cutting a release

```
npm run version-packages   # consumes the changesets: bumps package.json + writes packages/ui/CHANGELOG.md
npm run release            # builds the packages, then `changeset publish` to npm (needs NPM_TOKEN)
```

Full docs: https://github.com/changesets/changesets
