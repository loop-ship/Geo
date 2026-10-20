// Builds www/ — the web bundle that Capacitor copies into the iOS and Android apps.
//
// The public site (GitHub Pages / poleshift.app) loads three + lil-gui from a pinned CDN via the
// importmap in geo.html. A store app must not: Apple rejects apps that are a thin shell around a
// website (Guideline 4.2), and the app has to open offline, on first launch. So this copies geo.html
// and its runtime assets into www/, vendors the exact same pinned library versions from node_modules,
// and rewrites the importmap to point at the local copies. geo.html itself stays the single source.
//
// Run: npm run build:web   (npm run sync also runs `cap sync` afterwards)
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');
const nm = join(root, 'node_modules');

// Only what geo.html actually loads at runtime. No sw.js / manifest.json: the native shell has no
// use for them, and geo.html skips service-worker registration when NATIVE.
const ASSETS = [
  'earth_terrainrgb.png',
  'earth_day.jpg',
  'earth_night.jpg',
  'earth_specular_clouds.jpg',
  'plate_boundaries.json',
];
// three/addons is a module graph; these folders cover every addon geo.html imports and their
// transitive imports (postprocessing passes pull from shaders/). Copying all of examples/jsm would add ~30MB.
const THREE_ADDON_DIRS = ['controls', 'postprocessing', 'shaders'];

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'vendor'), { recursive: true });

for (const f of ASSETS) cpSync(join(root, f), join(out, f));

const html = readFileSync(join(root, 'geo.html'), 'utf8');
const pin = (pkg) => JSON.parse(readFileSync(join(nm, pkg, 'package.json'), 'utf8')).version;

// The importmap pins exact versions; refuse to build if node_modules disagrees, so the app and the
// website can never silently run different library versions.
for (const [pkg, re] of [['three', /three@([\d.]+)\//], ['lil-gui', /lil-gui@([\d.]+)\//]]) {
  const want = (html.match(re) || [])[1];
  if (!want) throw new Error(`importmap entry for ${pkg} not found in geo.html`);
  if (pin(pkg) !== want) throw new Error(`geo.html pins ${pkg}@${want} but node_modules has ${pin(pkg)} — update package.json`);
}

cpSync(join(nm, 'three/build/three.module.js'), join(out, 'vendor/three/build/three.module.js'));
for (const d of THREE_ADDON_DIRS) {
  cpSync(join(nm, 'three/examples/jsm', d), join(out, 'vendor/three/examples/jsm', d), { recursive: true });
}
cpSync(join(nm, 'lil-gui/dist/lil-gui.esm.js'), join(out, 'vendor/lil-gui.esm.js'));
// Capacitor's JS runtime (registerPlugin, isNativePlatform). Loaded as a classic script before the
// module so window.Capacitor is complete by the time geo.html's NATIVE check runs.
cpSync(join(nm, '@capacitor/core/dist/capacitor.js'), join(out, 'vendor/capacitor.js'));

let page = html
  .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/build\/three\.module\.js/, './vendor/three/build/three.module.js')
  .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/three@[\d.]+\/examples\/jsm\//, './vendor/three/examples/jsm/')
  .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/lil-gui@[\d.]+\/dist\/lil-gui\.esm\.js/, './vendor/lil-gui.esm.js')
  // Web-only head tags: the PWA manifest and the iOS "web app" metas mean nothing inside the app.
  .replace(/^.*<link rel="manifest".*\n/m, '')
  .replace(/^.*<meta name="apple-mobile-web-app-[^>]*>\n/gm, '')
  .replace('<script type="importmap">', '<script src="./vendor/capacitor.js"></script>\n<script type="importmap">');

if (/cdn\.jsdelivr\.net/.test(page)) throw new Error('a CDN URL survived the importmap rewrite — the app would need the network');

// Every addon import must resolve inside the vendored folders, or the module graph fails to load.
for (const [, rel] of page.matchAll(/from 'three\/addons\/([^']+)'/g)) {
  if (!existsSync(join(out, 'vendor/three/examples/jsm', rel))) throw new Error(`three/addons/${rel} is not vendored — add its folder to THREE_ADDON_DIRS`);
}

writeFileSync(join(out, 'index.html'), page);
console.log('www/ built: index.html + %d assets + vendored three@%s, lil-gui@%s', ASSETS.length, pin('three'), pin('lil-gui'));
