import { readdirSync, readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import test from "node:test";

const read = (name) => readFileSync(new URL(name, import.meta.url), "utf8");

/* Collapse whitespace so the assertions below pin declarations, not formatting. */
const squish = (css) => css.replace(/\s+/g, " ");
const tokensCss = read("./tokens.css");
const themeCss = squish(read("./theme.css"));

const tokens = Object.fromEntries(
  [...tokensCss.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6});/g)].map(([, name, hex]) => [name, hex]),
);

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(fg, bg) {
  assert.ok(tokens[fg], `--${fg} missing from tokens.css`);
  assert.ok(tokens[bg], `--${bg} missing from tokens.css`);
  const [light, dark] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

/* Every pair this theme puts text on, and where it puts it. All of them carry
   text below 24px, so all of them need 4.5:1. */
const pairs = [
  ["ink", "stock", "prose on the page"],
  ["ink-soft", "stock", "footer credit, edit link, last-updated"],
  ["ink", "stock-tint", "code block ground (--sl-color-gray-7)"],
  ["ink", "stock-deep", "inline code chip (--sl-color-bg-inline-code)"],
  ["shoal-ink", "stock", "accents: current sidebar item, note and tip aside titles"],
  ["caution-deep", "stock", "caution and danger aside titles"],
  ["stock", "shoal-ink", "inverted fill (--sl-color-bg-accent)"],
];

for (const [fg, bg, where] of pairs) {
  test(`--${fg} on --${bg} clears 4.5:1 — ${where}`, () => {
    const measured = ratio(fg, bg);
    assert.ok(measured >= 4.5, `measured ${measured.toFixed(2)}:1`);
  });
}

test("asides sit on --stock because --shoal-ink does not clear 4.5:1 on a tint", () => {
  const measured = ratio("shoal-ink", "stock-tint");
  assert.ok(measured < 4.5, `${measured.toFixed(2)}:1 — if this passes, aside fills may be tinted again`);
  assert.match(themeCss, /--sl-color-blue-low: var\(--stock\);/);
  assert.match(themeCss, /--sl-color-orange-low: var\(--stock\);/);
});

test("an inked fill needs the stock back, not --ink, for the link on top of it", () => {
  const onFill = ratio("ink", "shoal-ink");
  assert.ok(onFill < 4.5, `--ink on --shoal-ink measures ${onFill.toFixed(2)}:1`);
  assert.ok(ratio("stock", "shoal-ink") >= 4.5);
  assert.match(themeCss, /a\.sl-skip-link:focus \{ color: var\(--sl-color-text-invert\);/);
});

test("--caution is 3.92:1 on buff: large text only, never a link colour", () => {
  const measured = ratio("caution", "stock");
  assert.ok(measured < 4.5, `${measured.toFixed(2)}:1 — under the small-text threshold`);
  assert.ok(measured >= 3, `${measured.toFixed(2)}:1 — still clears large text`);
});

test("--caution reaches only Starlight slots that draw a rule, never one that renders type", () => {
  const slots = [...themeCss.matchAll(/(--sl-color-[a-z0-9-]+): var\(--caution\);/g)].map((m) => m[1]);
  assert.deepEqual(slots, ["--sl-color-orange", "--sl-color-red"]);
});

test("no token is restated as a literal colour outside tokens.css", () => {
  assert.doesNotMatch(themeCss, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(themeCss, /\brgba?\(/);
});

test("links are --ink underlined in --rule, with --caution arriving on hover", () => {
  const squished = squish(tokensCss);
  assert.match(squished, /a \{ color: var\(--ink\); text-decoration-thickness/);
  assert.match(squished, /text-decoration-color: var\(--rule\);/);
  assert.match(squished, /a:hover, a:focus-visible \{ text-decoration-color: var\(--caution\);/);
});

test("the paper grid is gone, and nothing else in tokens.css paints the body", () => {
  assert.doesNotMatch(tokensCss, /background-image/);
});

const fontsCss = squish(read("./fonts.css"));
const faces = [...fontsCss.matchAll(/@font-face \{([^}]*)\}/g)].map(([, body]) => ({
  family: body.match(/font-family: "([^"]+)"/)[1],
  weight: body.match(/font-weight: (\d+)/)[1],
  src: body.match(/url\("([^"]+)"\)/)[1],
}));

test("every @font-face points at a woff2 in src/fonts, and every woff2 there is declared", () => {
  const shipped = readdirSync(new URL("../fonts/", import.meta.url)).sort();
  const declared = faces.map((face) => face.src.replace("../fonts/", "")).sort();
  assert.deepEqual(declared, shipped);
  assert.doesNotMatch(fontsCss, /url\("?https?:/);
});

test("each face ships 400 and 600 only, so Starlight's 700 resolves to 600", () => {
  for (const family of new Set(faces.map((face) => face.family))) {
    const weights = [...new Set(faces.filter((face) => face.family === family).map((face) => face.weight))].sort();
    assert.deepEqual(weights, ["400", "600"], family);
  }
});

test("Starlight reads the grotesk for prose and chrome, Martian Mono for code", () => {
  assert.match(themeCss, /--sl-font: var\(--face-text\);/);
  assert.match(themeCss, /--sl-font-mono: var\(--face-data\);/);
});
