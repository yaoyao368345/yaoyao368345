import { createRequire } from "node:module";
import { openSync, type Font } from "fontkit";
import { num } from "./iso.js";
const require = createRequire(import.meta.url);
const fonts = {
  regular: openSync(
    require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff2"),
  ) as Font,
  bold: openSync(
    require.resolve("@fontsource/inter/files/inter-latin-600-normal.woff2"),
  ) as Font,
  mono: openSync(
    require.resolve(
      "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2",
    ),
  ) as Font,
};
export const escape = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
/** Outline bundled fonts so SVG, PNG and GIF render identically offline. */
export function text(
  value: string,
  x: number,
  y: number,
  size: number,
  fill = "#3a3a3c",
  face: keyof typeof fonts = "regular",
  spacing = 0,
): string {
  const font = fonts[face],
    run = font.layout(value),
    scale = size / font.unitsPerEm;
  let cursor = 0;
  const paths = run.glyphs
    .map((g, i) => {
      const p = run.positions[i];
      // Normalize glyph coordinates first: extremely small transform determinants
      // can be treated as singular by SVG renderers on miniature screen labels.
      const path = `<path transform="translate(${num(cursor + p.xOffset * scale)} ${num(-p.yOffset * scale)}) scale(${(scale * 100).toFixed(8)} ${(-scale * 100).toFixed(8)})" d="${g.path.scale(0.01).toSVG()}"/>`;
      cursor += p.xAdvance * scale + spacing;
      return path;
    })
    .join("");
  return `<g aria-label="${escape(value)}" fill="${fill}" transform="translate(${num(x)} ${num(y)})">${paths}</g>`;
}
