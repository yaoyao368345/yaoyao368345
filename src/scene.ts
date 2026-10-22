import { block, num, order } from "./iso.js";
import { C, labels, model } from "./model.js";
import { sceneOpacity, smooth, starts, state } from "./animation.js";
import { text } from "./type.js";
export const WIDTH = 900,
  HEIGHT = 360;
const sorted = order(model);
// A small original line illustration, avoiding platform-dependent emoji fonts.
const wave = `<g transform="translate(315 110) rotate(-12)" fill="none" stroke="#3d7fe5" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">
 <path d="M4 19L1 13Q0 10 2 10Q3 10 6 14L5 4Q5 1 7 2L9 12L10 1Q11 -1 12 2L13 12L15 3Q17 1 17 4L16 14L20 8Q22 7 22 10L19 22Q17 28 11 27Q7 26 4 19Z" fill="#e5eefc"/>
 <path d="M-4 5L-7 2M24 0L27 -3M27 15L30 14"/>
</g>`;
const typography =
  text("YAOYAO / ENGINEERING NOTES", 48, 60, 10, C.dark, "mono", 1.0) +
  `<path d="M48 82H80" stroke="${C.blue}" stroke-width="3"/>` +
  text("Hi, I'm Yaoyao", 48, 137, 36, C.dark, "bold") +
  wave +
  text("Embedded Systems · Linux · Open Source", 48, 174, 14, C.dark) +
  text(
    "ESP32-S3 / PCB / TinyML / C++ / Python",
    48,
    206,
    11,
    "#6c737a",
    "mono",
  ) +
  text("FROM CIRCUITS TO CODE.", 48, 307, 10, "#6c737a", "mono", 0.8) +
  `<circle cx="53" cy="278" r="3" fill="${C.blue}"/>` +
  `<path d="M66 278H110" stroke="#c4cdd0" stroke-width="1"/>`;
export function scene(t = 4.5): string {
  const blocks = sorted
    .map((i) => {
      const b = model[i],
        s = state(b.id, t);
      if (s.opacity === 0) return "";
      return `<g opacity="${num(s.opacity)}" transform="translate(0 ${num(-s.drop)})">${block(b)}</g>`;
    })
    .join("");
  const annotations = labels
    .map((l) => {
      const opacity = smooth((t - starts[l.part] - 0.6) / 0.3);
      return (
        `<g opacity="${num(opacity)}"><path d="M${l.px} ${l.py}L${l.x + 20} ${l.y + 7}" stroke="#b7c0c7" stroke-width=".7"/>` +
        `<rect x="${l.x - 5}" y="${l.y - 12}" width="${l.label.length * 5.6 + 10}" height="19" fill="${C.bg}"/>` +
        text(l.label, l.x, l.y, 9, "#737d85", "mono") +
        "</g>"
      );
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title description">
<title id="title">Hi, I'm Yaoyao 👋</title>
<desc id="description">Embedded Systems · Linux · Open Source. An isometric engineering workbench with an ESP32-S3, PCB traces, Linux terminal, TinyML chip and Git repository.</desc>
<rect width="900" height="360" rx="12" fill="${C.bg}"/>
${typography}
<g opacity="${num(sceneOpacity(t))}"><g transform="translate(652 112)">${blocks}</g>${annotations}</g>
</svg>`;
}
