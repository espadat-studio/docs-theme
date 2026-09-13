export interface Site {
  host: string;
  name: string;
}

/* The roster ADR-0001 freezes at three. It lives here once, for the reason
   tokens.css does: three hand-maintained copies drift. A consumer says which
   one it is by setting `site` in its Astro config, which it must set anyway. */
export const SITES: Site[] = [
  { host: "auberge.espadat.com", name: "auberge" },
  { host: "dublette.espadat.com", name: "dublette" },
  { host: "colporteur.espadat.com", name: "colporteur" },
];

export function siblingsOf(site: URL | undefined): Site[] {
  if (!site) {
    throw new Error(
      "@espadat/docs-theme: set `site` in astro.config.mjs. The footer reads it to work out which documentation site this is.",
    );
  }

  const self = SITES.find((candidate) => candidate.host === site.hostname);
  if (!self) {
    throw new Error(
      `@espadat/docs-theme: \`site\` is ${site.hostname}, which is not one of ${SITES
        .map((candidate) => candidate.host)
        .join(", ")}. Add it to src/data/sites.ts or correct the config.`,
    );
  }

  return SITES.filter((candidate) => candidate !== self);
}
