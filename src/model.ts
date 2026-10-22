import { plane, type Block } from "./iso.js";
import { text } from "./type.js";
export const C = {
  bg: "#fbfbfa",
  paper: "#f4f4f2",
  desk: "#e6e6e2",
  blue: "#3d7fe5",
  dark: "#3a3a3c",
  pcb: "#dce5e9",
  metal: "#b8c2c9",
  line: "#a6b7c4",
};
export const TOP = 0.45;
export const parts = [
  "desk",
  "pcb",
  "esp32",
  "linux",
  "tinyml",
  "git",
  "signal",
] as const;
export type Part = (typeof parts)[number];
const boxes: Block[] = [];
function add(
  part: Part,
  id: string,
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  tone = C.paper,
  detail?: string,
): Block {
  const b = { part, id, x, y, z, w, d, h, tone, detail };
  boxes.push(b);
  return b;
}
const trace = (d: string, color = C.line, width = 0.035) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x: number, y: number, r: number, color: string) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
// One common grid. All face art uses the very same projection as the boxes.
const roads = trace(
  "M2.2 3.25V3.8H6.6V5.7 M3.2 5.7H9.5V3.8H7.3",
  "#c4cdd0",
  0.065,
);
add(
  "desk",
  "workbench",
  0,
  0,
  0,
  11,
  8,
  0.45,
  C.desk,
  plane(0, 0, TOP, "top", roads),
);

// PCB layout: etched tracks, exposed pads, IC, passive components.
const pcbArt =
  trace(
    "M.3 .45H1.1V.95H2.5 M.3 1.05H.7V1.65H2.5 M1.45 .3V.7H2.5 M1.55 1.2V1.95",
  ) +
  [0.45, 1.05, 1.65]
    .flatMap((y) => [0.3, 2.5].map((x) => dot(x, y, 0.075, C.metal)))
    .join("") +
  text("PCB", 0.2, 2.15, 0.24, C.dark, "mono");
add(
  "pcb",
  "pcb",
  0.9,
  0.8,
  TOP,
  2.9,
  2.4,
  0.13,
  C.pcb,
  plane(0.9, 0.8, TOP + 0.13, "top", pcbArt),
);
add("pcb", "pcb-ic", 1.8, 1.65, 0.58, 0.8, 0.65, 0.25, C.dark);
for (let i = 0; i < 3; i++)
  add(
    "pcb",
    `resistor-${i}`,
    3.1,
    1.2 + i * 0.45,
    0.58,
    0.38,
    0.15,
    0.12,
    C.paper,
  );

// ESP32-S3: pale PCB, metal RF shield, antenna, USB and two pin headers.
const espArt =
  text("ESP32-S3", 0.38, 2.4, 0.25, C.dark, "mono") +
  trace("M.65 .22H1.95V.38H.75V.54H1.95V.7H.75", C.dark, 0.045);
add(
  "esp32",
  "esp-board",
  0.7,
  4.4,
  TOP,
  2.5,
  2.8,
  0.16,
  C.pcb,
  plane(0.7, 4.4, 0.61, "top", espArt),
);
add(
  "esp32",
  "rf-shield",
  1.25,
  5.25,
  0.61,
  1.4,
  1.15,
  0.25,
  "#d1d6d8",
  plane(1.25, 5.25, 0.86, "top", text("S3", 0.44, 0.69, 0.37, C.dark, "mono")),
);
add("esp32", "usb-c", 1.55, 7.04, 0.61, 0.8, 0.3, 0.21, C.metal);
for (let i = 0; i < 7; i++)
  for (const x of [0.77, 2.93])
    add(
      "esp32",
      `pin-${x}-${i}`,
      x,
      4.64 + i * 0.32,
      0.61,
      0.17,
      0.16,
      0.18,
      C.dark,
    );
add("esp32", "regulator", 1.6, 6.6, 0.61, 0.55, 0.25, 0.12, C.dark);

// Terminal on a pedestal; the face is an affine x/z plane (tour.ts idea).
add("linux", "monitor-foot", 5.9, 1.8, TOP, 1.7, 1.1, 0.16, C.paper);
add("linux", "monitor-post", 6.55, 2, 0.61, 0.28, 0.27, 0.65, C.metal);
const terminal =
  `<rect x=".12" y=".14" width="3.56" height="1.98" rx=".06" fill="${C.dark}"/>` +
  trace("M.28 .5H3.48", "#65676b", 0.018) +
  dot(0.32, 0.32, 0.045, C.blue) +
  dot(0.5, 0.32, 0.045, "#90959c") +
  dot(0.68, 0.32, 0.045, "#90959c") +
  text("yaoyao@linux", 0.28, 0.85, 0.3, "#e5e7eb", "mono") +
  text("$ idf.py build", 0.28, 1.26, 0.3, "#e5e7eb", "mono") +
  text("build complete", 0.28, 1.68, 0.27, "#91b9f5", "mono") +
  text("> _", 0.28, 1.98, 0.27, "#91b9f5", "mono");
add(
  "linux",
  "monitor",
  5.1,
  1.75,
  1.26,
  3.8,
  0.3,
  2.3,
  C.paper,
  plane(5.1, 2.05, 3.56, "front", terminal),
);
const keys = Array.from({ length: 3 }, (_, r) =>
  Array.from(
    { length: 9 },
    (_, c) =>
      `<rect x="${0.12 + c * 0.22}" y="${0.12 + r * 0.2}" width=".15" height=".10" fill="#b6bdc2"/>`,
  ).join(""),
).join("");
add(
  "linux",
  "keyboard",
  5.5,
  3.0,
  TOP,
  2.3,
  0.72,
  0.12,
  C.paper,
  plane(5.5, 3.0, 0.57, "top", keys),
);

// TinyML package, three network layers and small edge-processing modules.
add("tinyml", "ml-carrier", 5.45, 4.75, TOP, 2.3, 2.1, 0.14, C.pcb);
const nodes = [
  [0.27, 0.45],
  [0.27, 1.0],
  [0.82, 0.25],
  [0.82, 0.72],
  [0.82, 1.2],
  [1.35, 0.45],
  [1.35, 1.0],
];
let network = "";
for (const a of nodes.slice(0, 2))
  for (const b of nodes.slice(2, 5))
    network += trace(`M${a.join(" ")}L${b.join(" ")}`, "#91b9f5", 0.025);
for (const a of nodes.slice(2, 5))
  for (const b of nodes.slice(5))
    network += trace(`M${a.join(" ")}L${b.join(" ")}`, "#91b9f5", 0.025);
network += nodes.map(([x, y]) => dot(x, y, 0.075, "#d8e7fc")).join("");
add(
  "tinyml",
  "neural-chip",
  5.8,
  5.1,
  0.59,
  1.6,
  1.45,
  0.36,
  C.dark,
  plane(5.8, 5.1, 0.95, "top", network),
);
for (let i = 0; i < 5; i++)
  for (const y of [4.94, 6.57])
    add(
      "tinyml",
      `ml-pin-${y}-${i}`,
      5.92 + i * 0.28,
      y,
      0.59,
      0.13,
      0.16,
      0.1,
      C.metal,
    );

// Open-source repository stack and a physical branch/merge graph.
add("git", "repo-bottom", 8.6, 4.8, TOP, 1.6, 1.7, 0.16, C.paper);
add("git", "repo-middle", 8.6, 4.8, 0.61, 1.6, 1.7, 0.16, C.paper);
add(
  "git",
  "repo-top",
  8.6,
  4.8,
  0.77,
  1.6,
  1.7,
  0.16,
  C.paper,
  plane(8.6, 4.8, 0.93, "top", text("</>", 0.33, 1.25, 0.42, C.dark, "mono")),
);
const branch =
  trace("M.35 1.3V.25M.35 .95C.35 .65 1.2 .8 1.2 .45V.25", C.blue, 0.075) +
  [
    [0.35, 1.3],
    [0.35, 0.25],
    [1.2, 0.25],
  ]
    .map(([x, y]) => dot(x, y, 0.13, C.blue))
    .join("");
add(
  "git",
  "branch-sign",
  8.75,
  4.82,
  0.93,
  1.3,
  0.13,
  1.5,
  C.paper,
  plane(8.75, 4.95, 2.43, "front", branch),
);

// These late landing tiles light the signal route, with no pulsing/flashing.
for (const [i, x, y] of [
  [0, 3.8, 3.7],
  [1, 4.6, 3.7],
  [2, 5.4, 3.85],
  [3, 6.45, 4.15],
  [4, 8.05, 5.6],
])
  add("signal", `signal-${i}`, x, y, TOP, 0.22, 0.22, 0.055, C.blue);
export const model = boxes;
export const labels = [
  { part: "pcb", x: 593, y: 98, label: "01 / PCB", px: 642, py: 125 },
  { part: "esp32", x: 472, y: 219, label: "02 / ESP32-S3", px: 555, py: 195 },
  { part: "linux", x: 745, y: 60, label: "03 / LINUX", px: 744, py: 132 },
  { part: "tinyml", x: 612, y: 307, label: "04 / TINYML", px: 659, py: 232 },
  { part: "git", x: 783, y: 273, label: "05 / GIT", px: 746, py: 247 },
] as const;
