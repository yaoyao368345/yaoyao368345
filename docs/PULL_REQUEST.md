# feat: add animated isometric engineering profile

Replace the default profile placeholder with Yaoyao's embedded engineering introduction and a 900 × 360 animated workbench. The original scene includes an ESP32-S3, PCB routing, Linux terminal, TinyML chip and Git repository. Public links are limited to the supplied Proxy Search Switcher repository; the remaining areas are described without invented projects or contribution data.

The TypeScript generator uses true isometric SVG, outlined bundled fonts, resvg and FFmpeg. It produces a six-second, 14 FPS GIF plus static SVG/PNG without a browser or external API. The GIF is 2,162,798 bytes. ElyOffice's projection, box ordering and visual/animation concepts are attributed with the full original MIT license; font licenses are included.

GitHub Actions builds and uploads artifacts for relevant PRs, main pushes and manual runs. Only a separate trusted main job receives `contents: write`; it commits changed assets only, skips stale builds and avoids workflow loops. Action versions are pinned to verified release SHAs.

Validation completed locally on Linux:

- Node 22.23.4: clean `npm ci`, TypeScript, all 6 tests, formatting and asset validation passed.
- Decoded GIF: 84 frames, 57 distinct frames, six-second duration, 24-frame complete-scene hold, matching loop endpoints and infinite looping.
- Static SVG renders without system fonts and matches the generated PNG.
- Rebuild SHA-256 matches for all three assets, including across the tested Node 24 and Node 22 runs.
- Chromium 154: inspected 900px and 450px layouts; no horizontal overflow or page errors; GIF visibly changes frames.
- YAML parsing, actionlint 1.7.7, README asset references and `git diff --check` passed.

Hosted GitHub Actions execution and the bot's main-branch push are not yet verified. Existing branch protection may reject automatic publishing; downloadable build artifacts remain available without changing security settings. Micro-labels become decorative at narrow widths; the profile information remains readable as README text.
