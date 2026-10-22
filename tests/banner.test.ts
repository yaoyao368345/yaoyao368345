import test from "node:test";
import assert from "node:assert/strict";
import { Resvg } from "@resvg/resvg-js";
import { text } from "../src/type.js";
import { project, order, behind, overlap, type Block } from "../src/iso.js";
import { model, parts } from "../src/model.js";
import { state, starts, sceneOpacity } from "../src/animation.js";
import { scene } from "../src/scene.js";
test("true isometric axes have equal scale and 30° ground edges", () => {
  const a = project(1, 0),
    b = project(0, 1),
    c = project(0, 0, 1);
  for (const p of [a, b, c]) assert(Math.abs(Math.hypot(...p) - 20) < 1e-8);
  assert(Math.abs(a[1] / a[0] - Math.tan(Math.PI / 6)) < 1e-8);
  assert(Math.hypot(...project(2, 2, 2)) < 1e-8);
});
test("occlusion order respects every overlapping pair in the complete model", () => {
  const sorted = order(model),
    pos = new Map(sorted.map((v, i) => [v, i]));
  assert.equal(sorted.length, model.length);
  model.forEach((a, i) =>
    model.forEach((b, j) => {
      if (i !== j && overlap(a, b) && behind(a, b))
        assert(pos.get(i)! < pos.get(j)!, `${a.id} must precede ${b.id}`);
    }),
  );
});
test("intersecting solids fail rather than silently producing a broken drawing", () => {
  const a: Block = {
    id: "a",
    part: "desk",
    x: 0,
    y: 0,
    z: 0,
    w: 1,
    d: 1,
    h: 1,
    tone: "#eeeeee",
  };
  assert.throws(() => order([a, { ...a, id: "b", x: 0.2 }]), /Intersecting/);
});
test("all models grow in the requested order and settle before the hold", () => {
  assert.deepEqual(parts, [
    "desk",
    "pcb",
    "esp32",
    "linux",
    "tinyml",
    "git",
    "signal",
  ]);
  for (const b of model) {
    assert.equal(state(b.id, starts[b.part as keyof typeof starts]).opacity, 0);
    assert.deepEqual(state(b.id, 4), { opacity: 1, drop: 0 });
  }
  assert.equal(sceneOpacity(4.5), 1);
  assert.equal(sceneOpacity(6), 0);
});
test("scene is deterministic, accessible, and static export contains all objects", () => {
  assert.equal(scene(), scene(4.5));
  assert(scene().includes("<title"));
  assert(scene().includes("<desc"));
  assert(scene().includes('aria-label="ESP32-S3"'));
  assert.notEqual(scene(0.8), scene(2));
});

test("miniature terminal glyphs survive SVG rasterization", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><g transform="translate(8 15) scale(20)">${text("$ idf.py", 0, 0, 0.24, "#ffffff", "mono")}</g></svg>`;
  const pixels = new Resvg(svg, { font: { loadSystemFonts: false } }).render()
    .pixels;
  let visible = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) visible++;
  assert(
    visible > 40,
    "Terminal text must render visible pixels, not vanish in a tiny transform",
  );
});
