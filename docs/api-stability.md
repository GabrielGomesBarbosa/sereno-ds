# API stability

What `@sereno-ds/ui` and `@sereno-ds/tokens` promise an app that depends on them, what they do not, how a change is
versioned, and what has to be true before 1.0. The checks that enforce it run in CI (see [How it is enforced](#how-it-is-enforced)).

The packages are at 0.x today. In 0.x a caret range does not accept the next minor (`^0.51.0` means `>=0.51.0 <0.52.0`), so an
app has to bump on every release; the policy below is what lets it stop doing that after 1.0.

## What is public

**`@sereno-ds/ui`**

- Every export of the package entry (`import { ... } from '@sereno-ds/ui'`): the components, their `*Props` types, their
  imperative handles (`DatePickerHandle`, ...), the compound parts (`Dialog.Header`, `SidebarNav.Item`, ...) and the helper types
  that come with them. `npm run api:update` writes the list to `packages/ui/etc/ui.api.md`.
- **A component's props and their defaults**, as the [component reference](../DESIGN_SYSTEM.md) documents them: their names, types,
  default values and what they do.
- **A component's documented behaviour**: the keyboard model, the roles and ARIA attributes, the events and what they carry (for
  example, `DateRangePicker`'s `onChange` fires only with a complete range or the empty one).
- **`@sereno-ds/ui/styles.css`**, which is required, and the hooks it defines: every `sereno-*` class and every `data-*` attribute
  the stylesheet reads in a selector. An app may write a rule against them (the README has the table). Written to
  `packages/ui/etc/ui.styles.txt`.
- `@sereno-ds/ui/package.json`.

**`@sereno-ds/tokens`**

- The **names** of the custom properties its CSS files declare (`--bg-surface`, `--space-3`, ...), written to
  `packages/tokens/etc/tokens.names.txt`; the CSS files themselves as entry points (`tokens.css`, `colors.css`, ...); and the
  `./breakpoints` module with its types (`packages/tokens/etc/tokens.api.md`).
- What a token **means** is public (`--text-muted` is the quiet text colour and passes 4.5:1 on the surface; `--interactive-primary`
  is the primary action). Its **value** is not (see below), except that the contrast the DS documents does not get worse.

## What is not public

Anything here can change in any release without a major:

- `_internal` and every file that is not reachable from the `exports` map of a package (a deep import such as
  `@sereno-ds/ui/dist/forms/DatePicker.js` is blocked by the map and is not supported).
- Inline style details and the DOM structure: which element wraps which, a `<span>` that becomes a `<div>`.
- The `--sd-*` custom properties. They are the private protocol between a component's inline styles and the stylesheet (so a
  forced-colors rule can replace a value an inline style would beat); an app that sets one is relying on how the component is built.
- A `data-*` attribute or a class the stylesheet does not read, and any class that does not start with `sereno-`.
- Token **values** (a colour tuned, a spacing adjusted).
- How a component **looks**, pixel by pixel. The pixel tests guard this repo against accidents, not an app against intent: a visible
  change is **announced** (a changeset says so), it is not **promised away**.
- The wording of the built-in copy (`pt-BR` and `en` strings), and of error and warning messages.
- The docs site, the demo app and the scripts of the repository.

## The policy

One table, used for the changeset level. It says what the level is **after 1.0**; the line under it says what it is today.

| Level | What it is | Examples |
|---|---|---|
| **major** | Something an app could be using stops working, or the app has to do more. | Removing or renaming an export, a prop, a token name, a `sereno-*` class or a documented `data-*` hook. Making an optional prop required, or narrowing what a prop accepts. Changing a default so valid code behaves differently. Changing documented behaviour: a key, an event or its payload, a role. Raising the floor of a peer dependency (`react`, `lucide-react`), a new required import or required prop. |
| **minor** | Something is new, or something looks different. | A new component, prop, token, class or export. Widening what a prop accepts. A deprecation. **A visible change**: a colour, a size, a spacing, a shape (an app's screenshot tests change). An accessibility fix that changes what is drawn. Moving a style between inline and the stylesheet when the stylesheet is already required. |
| **patch** | Nothing for an app to see or do. | A bug fix that restores documented behaviour with no other visible change; performance; an internal refactor; documentation; tooling. |

**Today, in 0.x**, a break and an addition are both `minor` (a caret cannot take a minor anyway), and `patch` is for a fix with nothing
for an app to do. A visible change is `minor`, as it will be after 1.0.

**Deprecation.** A deprecated thing stays for at least one minor release before it is removed, and is removed only in a major.
It is marked `@deprecated` in the types (editors show it, with what to use instead), the component reference says so, and the
changeset of the release that deprecates it has a "Deprecated" paragraph. Removing it is a `major` change like any other.

**Every changeset is written for the app** (see `AGENTS.md`): what changed, why, and what an app has to do about it. A change that
needs something from the app (a stylesheet import, a prop) says so under "What changes for an app".

## How it is enforced

Four snapshots of the public surface are committed, and CI judges a pull request by what it does to them.

| Snapshot | What it holds | Made by |
|---|---|---|
| `packages/ui/etc/ui.api.md` | every exported declaration of `@sereno-ds/ui`, with its props | `api-extractor`, from the built `.d.ts` |
| `packages/ui/etc/ui.styles.txt` | the `sereno-*` classes and the `data-*` attributes of `styles.css` | `scripts/api-surface.mjs` |
| `packages/tokens/etc/tokens.api.md` | the `./breakpoints` module | `api-extractor` |
| `packages/tokens/etc/tokens.names.txt` | the custom property names the token CSS declares | `scripts/api-surface.mjs` |

- **`npm run api:update`** regenerates all four. Run it when you change an export, a prop, a token or a class, and commit the result:
  its diff **is** the API change, in the review.
- **`npm run api:check`** (CI, the `public API surface` job) fails when a committed snapshot is not the one the code produces.
- **`node scripts/api-surface.mjs changeset --base origin/main`** (CI, on a pull request) compares the snapshots with the base and fails
  when a change has no changeset of the level it needs: a line removed or changed is a break, a line only added is an addition, a change
  that only touches comments is neither. Today both need `minor`; after 1.0 a break needs `major`. The logic is
  `scripts/api-surface-lib.mjs`, with its tests.
- **`publint` and `attw`** run on the packed tarballs (`npm run check:packages`, the `npm publish --dry-run` job): the `exports` map, and
  that the types resolve under `node16` and `bundler`.

**What CI cannot see**, and review has to: a prop's **default** (it is in the implementation, not in the types; the catalogue documents
it, and [#137](https://github.com/GabrielGomesBarbosa/sereno-ds/issues/137) is about keeping that in step), a behaviour that changes with
the same types, how a component looks (the pixel tests catch it, a person decides if it is on purpose), and what a token value means.

The classification is deliberately strict: a line that changes (an optional prop that becomes required, a union that loses a member) counts
as a break, and so does a union that gains one, because the old line is gone. If that is wrong for a case, say why in the changeset
and the reviewer decides; the check only asks for the level.

## The 1.0 checklist

1.0 is cut when the list below is all true, and the decision is made then, not before. It is also a task list on
[#136](https://github.com/GabrielGomesBarbosa/sereno-ds/issues/136).

- [ ] This contract is written and linked from `AGENTS.md`, the root README and the `@sereno-ds/ui` README.
- [ ] CI fails on an API change without a changeset of the right level, and on a broken tarball.
- [ ] Forced colors and accessibility are covered for every component, with no axe baseline entry
      ([#135](https://github.com/GabrielGomesBarbosa/sereno-ds/issues/135)).
- [ ] The docs cannot drift from the types: props tables generated or checked
      ([#137](https://github.com/GabrielGomesBarbosa/sereno-ds/issues/137)).
- [ ] No breaking change is planned for the near term: nothing listed in a component's page as "will change", no open decision on a
      public name.
- [ ] The app that consumes the DS has run on the release candidate and bumped without a change of its own code.

Cutting 1.0 itself is a separate decision.
