# Plan: migrate tool docs to Starlight

Throwaway. Delete once the last phase lands. Decisions live in
[ADR-0001](../../adr/0001-tool-docs-are-starlight-on-subdomains-themed-by-a-shared-package.md);
this file is only sequencing.

## Shape

Five repos. `docs-theme` blocks the three consumers; the consumers are independent of
each other. `espadat.com` is independent of all of them and lands last, because its copy
should describe sites that exist.

```
docs-theme  ──┬──>  auberge     (108 pages)
              ├──>  dublette    (14 pages)
              └──>  colporteur  (11 pages)

espadat.com  (independent, last)
```

## Phase 1 — the theme

Repo: `espadat-studio/docs-theme`. Nothing else can start. Issue not yet filed —
this repo is local-only until it is created on GitHub.

| Commit | Contents |
|---|---|
| `feat: tokens and font faces` | `tokens.css` copied from `espadat.com/src/styles/tokens.css`, minus the paper-grid `background-image` on `body`. Self-hosted Spectral + Archivo Narrow woff2 from `@fontsource`, `@font-face` declared here. **No Google Fonts CDN** — DSGVO. |
| `feat: Footer override` | Studio credit, mark, link to `espadat.com` root (never `/mallorca`), sibling-site links. Sibling list read from consumer config, not hardcoded. |
| `feat: suppress theme toggle` | Empty component for Starlight's `ThemeSelect`. |
| `docs: consumer README` | Install line, the three `components` overrides, `customCss` wiring. |
| `chore: tag v0.1.0` | Consumers pin this tag. |

Checks: build one throwaway consumer locally and confirm link contrast
(`--ink` links, `--rule` underline, `--caution` on hover only — never as link colour below 24px).

## Phase 2 — auberge — espadat-studio/auberge#860

The hard one. 108 pages. Everything that will go wrong surfaces here.

| Commit | Contents |
|---|---|
| `build: astro + starlight project under docs/` | `docs/package.json`, `docs/astro.config.mjs`, theme pinned at `#v0.1.0`. |
| `refactor: move docs to src/content/docs` | `git mv` the 108 pages. Paths preserved exactly — the route for every page must be unchanged. |
| `refactor: frontmatter and link extensions` | Scripted: first `# H1` becomes `title:`, H1 deleted (Starlight renders it). Internal links drop `.md`. Review the diff; the script will miss edge cases. |
| `feat: sidebar config` | Hand-translate `_sidebar.md` (123 lines). Preserve cross-directory grouping — `core-concepts/architecture.md` stays under *Getting Started*. |
| `refactor: mermaid diagram to committed SVG` | One diagram, `backup-restore/overview.md`. `currentColor` so it inherits `--ink`. Mermaid source kept as an HTML comment. |
| `ci: docs build and deploy workflow` | Triggered on `docs/**`. **Must not gate `release-plz`.** Flip Pages source `master:/docs` → workflow. Keep the CNAME. |
| `docs: rewrite README deep links` | 6 links, `/#/path` → `/path`. |
| `build: enable renovate npm manager` | `enabledManagers` is `["custom.regex"]` today; add `npm` so the theme tag and Starlight are tracked. |
| `chore: move plans to meta/` | `docs/` is now a build directory. |

Checks: every pre-migration URL resolves; sidebar order matches the old `_sidebar.md`;
Pagefind search returns results; no `docs/agents/` content reachable as a page.

## Phase 3 — dublette, colporteur

espadat-studio/dublette#67 · espadat-studio/colporteur#76

Same sequence, 14 and 11 pages. Independent of each other, parallelisable.
Both need a `renovate.json` created from scratch — neither has one.

## Phase 4 — espadat.com — espadat-studio/espadat.com#1

| Commit | Contents |
|---|---|
| `feat: reword sitesLede` | Claim becomes *one system, three sites* rather than "designed and built each one". Write it from the shipped result, not from intent. |
| `docs: refresh stale PRODUCT.md claims` | "Favicon is a rubber chicken" and "No logo, palette or typeface exists yet" are both superseded by `design/mark.md` and `tokens.css`. |

## Loose ends, unblocked, any time

- Stale `sripwoud/` org references — espadat-studio/auberge#861.
- Renovate on all three consumers is what keeps a pre-1.0 Starlight from rotting. Phase 2 and 3 carry it.

## Closing

- [ ] PR review of the full change set as if another engineer were reviewing it.
- [ ] Decide which review recommendations to take; apply them and iterate until green.
- [ ] Read the whole diff and remove unnecessary comments.
