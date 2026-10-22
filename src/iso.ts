// Projection, box faces and occlusion ordering adapted from ElyOffice.
// Copyright (c) 2026 Yang Zhang — MIT; see THIRD_PARTY_NOTICES.md.
export type Point = [number, number];
export interface Block {
  id: string;
  part: string;
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  tone: string;
  detail?: string;
}
export const UNIT = 20;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
export const project = (x: number, y: number, z = 0): Point => [
  (x - y) * COS * UNIT,
  ((x + y) * SIN - z) * UNIT,
];
export const num = (n: number) => Number(n.toFixed(4));
export const polygon = (points: Point[], fill: string) =>
  `<polygon points="${points.map((p) => p.map(num).join(",")).join(" ")}" fill="${fill}"/>`;
export function shade(hex: string, factor: number): string {
  return (
    "#" +
    hex
      .slice(1)
      .match(/../g)!
      .map((c) =>
        Math.round(parseInt(c, 16) * factor)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function block(b: Block): string {
  const p = (x: number, y: number, z: number) =>
    project(b.x + x, b.y + y, b.z + z);
  const { w, d, h } = b;
  return (
    polygon(
      [p(0, d, 0), p(w, d, 0), p(w, 0, 0), p(w, 0, h), p(0, 0, h), p(0, d, h)],
      shade(b.tone, 0.9),
    ) +
    polygon(
      [p(0, d, 0), p(w, d, 0), p(w, d, h), p(0, d, h)],
      shade(b.tone, 0.91),
    ) +
    polygon(
      [p(w, d, 0), p(w, 0, 0), p(w, 0, h), p(w, d, h)],
      shade(b.tone, 0.8),
    ) +
    polygon([p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)], b.tone) +
    (b.detail ?? "")
  );
}
/** Map local grid coordinates onto a top or front face, without perspective. */
export function plane(
  x: number,
  y: number,
  z: number,
  face: "top" | "front",
  svg: string,
): string {
  const [a, b] = project(1, 0, 0);
  const [c, d] = face === "top" ? project(0, 1, 0) : project(0, 0, -1);
  const [e, f] = project(x, y, z);
  return `<g transform="matrix(${[a, b, c, d, e, f].map(num).join(" ")})">${svg}</g>`;
}
function spans(b: Block): [number, number][] {
  return [
    [b.x - b.z - b.h, b.x + b.w - b.z],
    [b.y - b.z - b.h, b.y + b.d - b.z],
    [b.x - b.y - b.d, b.x + b.w - b.y],
  ];
}
export function overlap(a: Block, b: Block): boolean {
  const sa = spans(a),
    sb = spans(b);
  return sa.every(
    ([lo, hi], i) => lo < sb[i][1] - 1e-8 && sb[i][0] < hi - 1e-8,
  );
}
export function behind(a: Block, b: Block): boolean {
  const eps = 1e-8;
  if (a.x + a.w <= b.x + eps) return true;
  if (b.x + b.w <= a.x + eps) return false;
  if (a.y + a.d <= b.y + eps) return true;
  if (b.y + b.d <= a.y + eps) return false;
  if (a.z + a.h <= b.z + eps) return true;
  if (b.z + b.h <= a.z + eps) return false;
  throw new Error(`Intersecting blocks: ${a.id}, ${b.id}`);
}
export function order(list: Block[]): number[] {
  const before = list.map((b, i) =>
    list.flatMap((a, j) =>
      j !== i && overlap(a, b) && behind(a, b) ? [j] : [],
    ),
  );
  const done = new Set<number>(),
    out: number[] = [];
  while (out.length < list.length) {
    const next = list.findIndex(
      (_, i) => !done.has(i) && before[i].every((j) => done.has(j)),
    );
    if (next < 0) throw new Error("Cyclic block occlusion");
    done.add(next);
    out.push(next);
  }
  return out;
}
