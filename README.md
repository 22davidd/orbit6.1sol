# Orbital Atlas

**A little perspective.** An interactive 3D solar system with ten destinations, cinematic camera travel, and a complete dependency-free renderer.

The opening view features Saturn. Take the grand tour, tap a world, or pull back to the entire solar system. Everything needed to run the site is included.

## Run it locally

Python 3 is enough. From this project folder:

```bash
python3 -m http.server 8080 --directory dist
```

Open **http://localhost:8080**. Keep the terminal open while exploring. JavaScript modules need HTTP; opening `index.html` directly with `file://` does not work.

To view it on an iPhone, put the phone and computer on the same Wi-Fi and open `http://YOUR_COMPUTER_LAN_IP:8080` in Safari. Allow port 8080 in your computer's firewall if necessary. Stop the server with Ctrl+C.

## Deploy to GitHub Pages

The supplied `.github/workflows/pages.yml` publishes `dist/` without an installation or build step.

1. Create a GitHub repository and upload this complete project, including `dist/` and `.github/workflows/pages.yml`. The default workflow expects a branch named `main`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main`, or run **Actions → Deploy Orbital Atlas to GitHub Pages → Run workflow**.
4. Open the URL shown by the successful deployment. Project repositories work at `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`; all app paths are relative.

For example, your repository could be `22davidd/orbital-atlas`, with the site at `https://22davidd.github.io/orbital-atlas/` once you enable Pages and deploy.

```bash
git init
git add .
git commit -m "Build Orbital Atlas"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the repository already has a remote, use its existing clone and commit/push the files there instead of adding another remote. The workflow uses GitHub's documented Pages actions: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

**Simpler branch publishing:** copy the contents of `dist/` to the root of a repository, including `.nojekyll`, and choose **Deploy from a branch → main → / (root)** in Settings → Pages. Use this method *instead of* the included Actions workflow.

## Other static hosts

Upload the **contents of `dist/`**, with `index.html` at the site's root. It also works in a subdirectory. There is no server code, API key, database, npm installation, or build step. If a host asks for an output directory, choose `dist`; leave the build command empty. Serve `.js` files with a JavaScript MIME type.

A ready-to-upload `website/` copy is also included in the downloadable release. Its content is identical to `dist/`.

## Explore

| Action | Desktop | iPhone / touch |
| --- | --- | --- |
| Orbit camera | Drag | Swipe with one finger |
| Zoom | Wheel, + / −, or camera buttons | Pinch with two fingers |
| Follow a body | Click the body, its visible marker, or a destination | Tap a body, marker, or destination |
| Open information | Select a destination or body | Select a destination or body |
| Pause orbital motion | Pause button or Space | Pause button |
| Change orbital speed | Time-flow slider | Time-flow slider |
| Full overview | Entire solar system, reset button, or R | Entire solar system or reset button |
| Collapse interface | Top-right button or H | Top-right button |
| Close active panel | Escape or × | × |
| Rotate without a pointer | Arrow keys | — |

The speed slider ranges from **0.1 to 1,000 simulated orbital days per second**. The default is 12 d/s. Pause freezes the orbital and surface animation but leaves camera controls active. Tour timing is separate from orbital time; the tour has its own pause control.

The grand tour has ten stops and lasts about two minutes. Dragging, pinching, or zooming pauses the tour so you can look around. Resume with ▶, navigate with the arrows or stop dots, or end with ×. The renderer and tour stop advancing while the page is hidden.

## Read the scales

Size and distance are independent controls. The current mode is always labeled above the playback controls.

| Sizes | Distances | Meaning |
| --- | --- | --- |
| Illustrative | Compressed | Bodies enlarged and orbital gaps compressed; composed for visibility |
| True ratios | Compressed | Physical radius ratios preserved; orbital gaps and lunar separation compressed |
| Illustrative | True AU ratios | Planetary orbital separations preserved; bodies and lunar separation enlarged |
| True ratios | True AU ratios | One physical scale: **1 AU = 22 scene units** |

In the last mode, real planets become extremely small in the full-system overview. Select them from Destinations for a close-up. Persistent label markers are selection aids, **not** visible planet diameters. Earth, the Moon, the Sun, and all eight planets share the same kilometer-to-scene-unit conversion in the fully physical mode.

The Earth–Moon separation is 3.4 scene units when sizes are illustrative. With true sizes and compressed distances it is 0.025 units; with both true modes it uses the real mean lunar separation.

## What is modeled

- Eight planets, the Sun, and Earth's Moon, with independent orbital motion.
- Elliptical trajectories solved with Kepler's equation, approximate inclinations, and relative orbital periods from NASA values.
- Directional illumination from the Sun, dark nightsides, ocean highlights, atmosphere rims, and a solar corona glow.
- Saturn's layered ring disk, the planet's shadow on the rings, and an approximate ring shadow on Saturn.
- Original procedural surfaces, a generated Earth texture, cloud patterns, and crater-like textures. These are artistic interpretations, not satellite maps.
- A seeded starfield, an illustrative asteroid belt, orbit paths, and fading motion trails showing the previous 30° of each orbit.
- A floating camera origin that keeps physical-scale planetary close-ups numerically stable.

Starting orbital phases are composed for the experience; **this is not a live ephemeris or an N-body simulation**. Axial rotation uses the listed spin periods at **1/60 of orbital time** for visual readability. Venus's reversed spin and Uranus's extreme tilt are represented. Planetary facts are approximate and may be rounded. Additional moons, faint rings of the other giant planets, eclipse shadows, relativistic effects, and the Earth–Moon barycenter are outside the model.

Sources: [NASA planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) and [NASA Sun facts](https://science.nasa.gov/sun/facts/). Individual destination cards link to NASA's corresponding world pages.

## Responsive rendering

The interface adapts to portrait and landscape screens, safe-area insets, and desktop sizes. Mobile starts with the destination list collapsed; information cards use a scrollable lower panel. The entire interface can be hidden for an unobstructed view.

Adaptive quality starts balanced on mobile and high on desktop. It adjusts mesh density, point counts, atmospheres, and render pixel ratio based on measured frame timing. Explicit High, Balanced, and Low power options are available. Reduced-motion preferences shorten camera transitions. WebGL context interruptions attempt to restore the scene; if graphics are unavailable, the destination field guide remains usable.

No remote fonts, CDN scripts, paid services, or image files are needed at runtime. After the page is loaded, the app makes no further network requests. NASA links are optional outbound reading links.

## Project map

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Semantic interface and information/tour panels |
| `dist/style.css` | Responsive layout, glass panels, touch sizing, safe-area handling |
| `dist/app.js` | Controls, destination information, labels, tour sequencing |
| `dist/engine.js` | WebGL renderer, geometry, camera, picking, adaptive quality |
| `dist/materials.js` | GLSL materials and generated Earth texture |
| `dist/astronomy.js` | Body data, scale mapping, orbital calculations |
| `tests/` | Dependency-free Node checks of orbital math and UI interactions |
| `.github/workflows/pages.yml` | GitHub Pages deployment |
| `scripts/package.py` | Creates a clean downloadable release |

## Development checks

Node 18 or later is enough; there are no npm dependencies to install.

```bash
npm run check
npm test
```

The 20 checks cover Kepler solutions, orbit closure, physical units, Moon clearance, pause behavior, camera tracking, screen projection, sphere winding, ray selection, mobile menu behavior, scales, and tour/control interactions. UI interactions are checked with an in-process DOM/WebGL harness; this does not substitute for browser layout or real-device testing.

Before delivery, all six shader programs were compiled and linked with a native OpenGL ES context, and the actual renderer calls were replayed at desktop and phone viewport dimensions without GPU errors. Saturn, Earth, the overview, and a phone-sized opening view were visually inspected. **A real Safari/iPhone session and full browser layout verification were not available in the build environment.**

## Make a release

```bash
python3 scripts/package.py
```

The script creates `orbital-atlas.zip` outside the project directory. The release contains the source project and a `website/` directory ready for static hosting. Site hosting identity and Git internals are excluded from the portable download.

MIT licensed. Make it yours, and keep exploring.
# orbit6.1sol
