# Building the isometric profile

The banner is an original embedded engineering workbench, inspired by ElyOffice's visual language. It is a **900 × 360** SVG scene sampled into an **84-frame, 14 FPS, six-second looping GIF**. The extra 40 pixels of height leave room for labels and the workbench. The static SVG and PNG show the completed scene.

## Build on Linux

Use Node.js 22 or newer, npm, and FFmpeg including ffprobe. On a fresh Ubuntu machine:

```sh
sudo apt-get update
sudo apt-get install --no-install-recommends -y ffmpeg
bash scripts/build-banner.sh
```

Run from this repository; the script also resolves its directory when invoked elsewhere. `npm ci` uses the committed lockfile and integrity hashes. It installs the open-source SVG renderer and fonts through npm. No browser, API key, GPU, remote assets or private packages are needed to build. On restricted cloud workspaces with an unwritable default npm cache, prefix the command with `npm_config_cache=/tmp/profile-npm-cache`.

For subsequent edits:

```sh
npm test
npm run build
npm run format:check
```

Outputs:

- `assets/profile-banner.svg`: accessible, standalone static SVG; font outlines ensure consistent rendering.
- `assets/profile-banner.png`: lossless static preview, rendered directly from that SVG.
- `assets/profile-banner.gif`: globally paletted, infinitely looping animation; validated below 5 MB.
- `.build/frames/`: temporary PNG frames, ignored by Git and replaced on each build.

No background server needs to stay running. Each cloud task is already isolated; use the existing checkout rather than creating a worktree unless explicitly requested.

## Model and rendering

| File               | Responsibility                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `src/iso.ts`       | True isometric projection, box faces, top/front affine planes and occlusion ordering.                               |
| `src/model.ts`     | Workbench, PCB tracks and pads, ESP32-S3 and headers, Linux terminal, neural chip, Git branch and repository stack. |
| `src/animation.ts` | Arrival schedule, easing, block stagger and quiet loop reset.                                                       |
| `src/type.ts`      | Outlines the bundled Inter and IBM Plex Mono glyphs.                                                                |
| `src/scene.ts`     | Typography, labels, layout, accessible SVG title/description.                                                       |
| `src/generate.ts`  | Renders SVG to PNG with resvg; creates GIF through FFmpeg.                                                          |
| `src/validate.ts`  | Checks the actual generated files, decoded GIF frames, README references and workflow YAML.                         |

Projection is `x' = (x − y) cos(30°) × unit`, `y' = ((x + y) sin(30°) − z) × unit`. The three world axes have equal scale. A topological painter order handles overlapping projected boxes; intersecting solids or cyclic occlusion fail the build instead of silently producing incorrect layering. Face decals use the same projection. Animation moves a block and its artwork together.

Palette: background `#fbfbfa`, paper `#f4f4f2`, desk `#e6e6e2`, blue `#3d7fe5`, dark `#3a3a3c`. Left/right faces use explicit 91%/80% RGB shades. There are no gradients, neon effects or external images.

At 0.00s the base starts arriving; PCB at 0.45s; ESP32-S3 at 0.85s; terminal at 1.45s; TinyML at 2.05s; Git at 2.40s; blue signal tiles at 2.95s. Blocks stagger within those groups. The complete scene holds before a 0.58s fade beginning at 5.35s. The first and final GIF frames match, while the greeting remains visible throughout. GIF timing uses alternating 70/80ms delays because GIF stores centiseconds.

GitHub does not execute arbitrary README JavaScript/CSS. The README therefore uses a standard Markdown GIF image and a static SVG link for readers who prefer no motion. A GIF cannot itself honor `prefers-reduced-motion`. At narrow widths the main greeting and silhouettes remain the primary content; micro-labels are decorative, and the actual profile interests remain available as README text.

## Validation

`npm test` exercises projection geometry, every occlusion constraint in the actual model, invalid intersections, animation stages and deterministic scene output. `npm run build` typechecks, regenerates all outputs and then validates:

- Nonempty SVG, PNG and GIF, each below 5,000,000 bytes.
- SVG parses and renders with system fonts disabled; the PNG matches that render exactly.
- GIF decodes at the expected dimensions, 12–16 FPS and 4–6.1s (centisecond rounding tolerance).
- At least 25 different decoded frames, at least a one-second stable hold, matching loop endpoints and an infinite-loop extension.
- README uses the actual GIF/static SVG paths.
- Workflow YAML parses with no duplicate keys; default permissions are read-only, publishing is restricted to trusted main events, and generated files cannot retrigger builds.

For reproducibility, run `sha256sum assets/profile-banner.{svg,png,gif}`, rebuild, and compare. Identical inputs on the same toolchain should produce identical bytes; different FFmpeg releases may change GIF encoding without changing the scene. CI performs this check on each run.

For visual inspection, open the SVG or GIF in a browser at full width and approximately 450px. Inspect terminal text, box overlaps, labels, silhouettes and several intermediate frames. Tests cannot substitute for this review.

## GitHub Actions

`.github/workflows/profile-banner.yml` runs on:

- Manual **Actions → Profile banner → Run workflow** (after the workflow is on the default branch).
- Changes to generator code, tests, build script, lockfile/config or the workflow on `main`.
- Relevant pull requests, including README and generated-asset changes, for read-only validation.

An Ubuntu 24.04 runner installs Node 22 and FFmpeg, runs a frozen dependency install, tests, renders twice, compares checksums and uploads the three outputs as `profile-banner` for 14 days. Third-party Actions are pinned to verified release commit SHAs.

Only a separate publish job has `contents: write`, only on `main`, and never on pull requests. It downloads the artifact from the same workflow run; it does not execute generator code with write credentials. It skips a stale build if `main` moved, commits only changed banner assets and uses a normal fast-forward push. A concurrent change causes the push to fail safely rather than overwriting work. Generated assets are excluded from push triggers, commits carry `[skip ci]`, and GITHUB_TOKEN pushes do not retrigger normal workflows. No PAT is required.

If existing branch protection or organization policy disallows the bot push, the build and downloadable artifact still complete; the publish job reports the rejection. Apply the artifact through a normal PR. This project does not alter repository security settings.

## Attribution

See [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) for the precise ElyOffice references, original MIT license, and font licenses. No ElyOffice branding or website assets are reused.
