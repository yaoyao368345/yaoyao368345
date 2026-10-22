import { model, type Part } from "./model.js";
export const FPS = 14;
export const DURATION = 6;
export const FRAMES = FPS * DURATION;
// Beat-spaced groups, tightly staggered blocks; inspired by ElyOffice beat.ts.
export const starts: Record<Part, number> = {
  desk: 0,
  pcb: 0.45,
  esp32: 0.85,
  linux: 1.45,
  tinyml: 2.05,
  git: 2.4,
  signal: 2.95,
};
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (t: number) => {
  const p = clamp(t);
  return p * p * (3 - 2 * p);
};
export function state(id: string, t: number) {
  const b = model.find((b) => b.id === id);
  if (!b) throw new Error(`Unknown block ${id}`);
  const peers = model.filter((p) => p.part === b.part),
    i = peers.findIndex((p) => p.id === id);
  const stagger = b.part === "signal" ? 0.09 : 0.018;
  const p = clamp((t - starts[b.part as Part] - i * stagger) / 0.3);
  return { opacity: smooth(p), drop: 18 * (1 - p) ** 3 };
}
// A quiet full-scene hold, then a soft reset. Text stays visible throughout.
export const sceneOpacity = (t: number) => 1 - smooth((t - 5.35) / 0.58);
