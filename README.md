# @espadat/docs-theme

The visual identity the Espadat tool documentation sites share. CSS and three
`.astro` component overrides; Astro compiles them in the consumer, so there is
no build step here and nothing is published to npm.

Consumers: [auberge](https://auberge.espadat.com),
[dublette](https://dublette.espadat.com),
[colporteur](https://colporteur.espadat.com),
[tagwerk](https://tagwerk.espadat.com),
[pi-memsearch](https://pi-memsearch.espadat.com).

## Install

```json
"@espadat/docs-theme": "github:espadat-studio/docs-theme#v0.2.0"
```

Peers `@astrojs/starlight@^0.42.0` and `astro@^7.2.10`.

## Wire it up

```js
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  // Required by Astro for canonicals and the sitemap. The footer does not
  // read it — nothing in this theme branches on which site it is.
  site: "https://auberge.espadat.com",
  integrations: [
    starlight({
      title: "auberge",
      customCss: ["@espadat/docs-theme/styles/theme.css"],
      components: {
        Footer: "@espadat/docs-theme/components/footer.astro",
        ThemeProvider: "@espadat/docs-theme/components/theme-provider.astro",
        ThemeSelect: "@espadat/docs-theme/components/theme-select.astro",
      },
    }),
  ],
});
```

`theme.css` pulls in `fonts.css` and `tokens.css`; it is the only entry a
consumer names.

### The three overrides

| Override | What it does |
|---|---|
| `Footer` | Keeps Starlight's own footer — edit link, last-updated, prev/next — then adds the mark, the studio credit linking to `espadat.com`, and one link to the Given away table there |
| `ThemeSelect` | Renders nothing. Removes the theme picker |
| `ThemeProvider` | Pins `data-theme="light"` |

`ThemeProvider` is the one that is easy to leave out and the one that matters.
Starlight server-renders `<html data-theme="dark">` and relies on its default
`ThemeProvider` to correct that from `localStorage` and `prefers-color-scheme`.
Override `ThemeSelect` alone and the control disappears while the dark palette
stays — including for anyone carrying a `starlight-theme: dark` value from
another Starlight site. Expressive Code picks its light style variant off the
same attribute, so code blocks depend on it too.

### The footer carries one outbound link

The credit links to `espadat.com` and one link beside it goes to the Given away
table there, which lists every tool with its licence. The theme holds no roster
and reads nothing off the Astro config, so adding a sixth tool needs no release
here.

This replaced an all-to-all sibling nav on 2026-09-17. Each site rendered the
other four, which is `N(N-1)` links across the roster — 20 at five tools, 56 at
eight — and gave four links nobody arrived for the same visual weight as the one
that sells. ADR-0001 records the reasoning and the trade.

## Constraints this package holds

**`--caution` (#d6008b) is never a link colour.** It measures 3.92:1 on buff —
fine for the 24px-and-up uses on `espadat.com`, not fine for anything smaller.
Links are `--ink` underlined in `--rule`, and `--caution` arrives only as the
hover underline. In Starlight terms `--caution` reaches two slots,
`--sl-color-orange` and `--sl-color-red`. Neither renders type: they draw aside
borders and a handful of icons. Caution and danger aside *titles* take
`--caution-deep` instead.

Links inside asides are ink like every other link, not the aside's accent
colour. `tokens.css` is unlayered and wins there too, which is the behaviour
the constraint wants.

Asides sit on `--stock` rather than a tint, because `--shoal-ink` does not
clear 4.5:1 on `--stock-tint` and aside titles are 18px.

`node --test` measures every one of these ratios from `tokens.css` and checks
that no literal colour has crept into `theme.css`. It runs in well under a
second and needs nothing installed — the numbers live there, not in this file,
so they cannot go stale.

## Editing the design system

`src/styles/tokens.css` is a copy of `espadat.com/src/styles/tokens.css` with
one deletion: the paper-grid `background-image` on `body`, whose hairlines fight
long-form prose and code blocks. A `git diff --no-index` against the original
should show that one hunk and nothing else. Changes belong in `espadat.com`
first, then get copied here.

`src/styles/theme.css` is the only file that knows Starlight exists. It maps
tokens onto `--sl-*` custom properties, unlayered — every Starlight rule sits in
an `@layer starlight.*`, and unlayered declarations beat layered ones whatever
their specificity, so nothing here needs `!important`. Keep it unlayered.

`src/fonts/` holds twelve woff2 files copied byte-for-byte from `@fontsource`:
Spectral 400/600 in roman and italic, Archivo Narrow 400/600 roman, each in
latin and latin-ext. Declared as `@font-face` in `fonts.css`. No request leaves
for the Google Fonts CDN.

The mark in `footer.astro` is transcribed from `espadat.com/design/mark.svg`,
which `design/mark.md` calls the only source. There is no build step here to
derive it, so re-sync by hand if that file changes.

## Not done here

- Code blocks keep Starlight's bundled Night Owl Light syntax colours on a buff
  ground. The frame follows the chart; the tokens inside it do not.
- Starlight's rounded corners are untouched. The chart has none.
- Three faces espadat.com loads are not shipped: Spectral 300, Archivo Narrow
  400-italic and 500. Nothing in Starlight's chrome asks for them. An italic in
  a sidebar label or a pagination title would synthesize an oblique.

AGPL-3.0-or-later.
