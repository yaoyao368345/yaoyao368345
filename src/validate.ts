import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { parseDocument } from "yaml";
import { WIDTH, HEIGHT } from "./scene.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const asset = (ext: string) => resolve(root, `assets/profile-banner.${ext}`);
function run(command: string, args: string[]): string {
  const r = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (r.error) throw r.error;
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}
for (const ext of ["svg", "png", "gif"]) {
  const size = (await stat(asset(ext))).size;
  assert(
    size > 0 && size < 5_000_000,
    `${ext} must be nonempty and below 5 MB`,
  );
  console.log(`${ext.toUpperCase()}: ${size.toLocaleString("en-US")} bytes`);
}
const svg = await readFile(asset("svg"), "utf8");
assert(
  !/<script|<foreignObject|<image|<style|https?:\/\//.test(
    svg.replace("http://www.w3.org/2000/svg", ""),
  ),
  "SVG must be self-contained",
);
const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render();
assert.equal(png.width, WIDTH);
assert.equal(png.height, HEIGHT);
assert.deepEqual(
  png.asPng(),
  await readFile(asset("png")),
  "Static SVG and PNG must agree",
);
const info = JSON.parse(
  run("ffprobe", [
    "-v",
    "error",
    "-count_frames",
    "-show_streams",
    "-show_format",
    "-of",
    "json",
    asset("gif"),
  ]),
);
const stream = info.streams[0],
  duration = Number(info.format.duration),
  count = Number(stream.nb_read_frames);
assert.equal(stream.codec_name, "gif");
assert.equal(stream.width, WIDTH);
assert.equal(stream.height, HEIGHT);
assert(duration >= 4 && duration <= 6.1, `Unexpected duration ${duration}`);
assert(count >= 48 && count <= 96);
assert(count / duration >= 12 && count / duration <= 16);
const decoded = run("ffmpeg", [
  "-v",
  "error",
  "-i",
  asset("gif"),
  "-f",
  "framemd5",
  "-",
]);
const hashes = decoded
  .split("\n")
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split(",").at(-1)!.trim());
assert(
  new Set(hashes).size >= 25,
  "Animation must contain meaningful distinct frames",
);
// Decode the actual delivered GIF: beginning/end match and full scene holds.
assert.equal(hashes[0], hashes.at(-1), "Loop must reset without a jump");
const longestHold = hashes.reduce(
  (s, h) => ({
    last: h,
    current: h === s.last ? s.current + 1 : 1,
    max: Math.max(s.max, h === s.last ? s.current + 1 : 1),
  }),
  { last: "", current: 0, max: 0 },
).max;
assert(longestHold >= 14, "Complete scene must hold for at least one second");
const gif = await readFile(asset("gif"));
const loop = gif.indexOf(Buffer.from("NETSCAPE2.0"));
assert(
  loop >= 0 && gif[loop + 13] === 0 && gif[loop + 14] === 0,
  "GIF must loop indefinitely",
);
const readme = await readFile(resolve(root, "README.md"), "utf8");
assert(readme.includes("](assets/profile-banner.gif)"));
assert(readme.includes("](assets/profile-banner.svg)"));
const doc = parseDocument(
  await readFile(resolve(root, ".github/workflows/profile-banner.yml"), "utf8"),
  { uniqueKeys: true },
);
assert.equal(doc.errors.length, 0, doc.errors.map((e) => e.message).join("\n"));
const workflow = doc.toJS();
assert(workflow.on.workflow_dispatch !== undefined);
assert(workflow.on.push.branches.includes("main"));
assert.equal(workflow.permissions.contents, "read");
assert.equal(workflow.jobs.publish.permissions.contents, "write");
assert(workflow.jobs.publish.if.includes("github.ref == 'refs/heads/main'"));
assert(
  workflow.jobs.publish.if.includes("github.event_name != 'pull_request'"),
);
assert(
  !workflow.on.push.paths.some((p: string) => p.startsWith("assets/")),
  "Generated assets must not retrigger the build",
);
console.log(
  `Validated ${WIDTH}×${HEIGHT}; ${count} frames, ${new Set(hashes).size} distinct, ${duration}s, longest hold ${longestHold} frames; SVG/PNG, GIF loop, README and workflow YAML passed.`,
);
