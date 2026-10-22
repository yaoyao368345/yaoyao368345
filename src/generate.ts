import { mkdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { scene } from "./scene.js";
import { FPS, FRAMES } from "./animation.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const out = resolve(root, "assets"),
  frames = resolve(root, ".build/frames");
await mkdir(out, { recursive: true });
await rm(frames, { recursive: true, force: true });
await mkdir(frames, { recursive: true });
const render = (svg: string) =>
  new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
const still = scene();
await writeFile(resolve(out, "profile-banner.svg"), still);
await writeFile(resolve(out, "profile-banner.png"), render(still));
for (let i = 0; i < FRAMES; i++)
  await writeFile(
    resolve(frames, `frame-${String(i).padStart(3, "0")}.png`),
    render(scene(i / FPS)),
  );
const ffmpeg = spawnSync(
  "ffmpeg",
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-threads",
    "1",
    "-framerate",
    String(FPS),
    "-i",
    resolve(frames, "frame-%03d.png"),
    "-filter_complex_threads",
    "1",
    "-filter_complex",
    "[0:v]split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
    "-loop",
    "0",
    "-final_delay",
    "7",
    resolve(out, "profile-banner.gif"),
  ],
  { stdio: "inherit" },
);
if (ffmpeg.error) throw ffmpeg.error;
if (ffmpeg.status !== 0) throw new Error(`FFmpeg exited ${ffmpeg.status}`);
console.log(
  `Rendered ${FRAMES} frames at ${FPS} FPS; assets/profile-banner.{svg,png,gif}`,
);
