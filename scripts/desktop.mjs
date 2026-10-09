import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktop = path.join(root, 'desktop');
const mode = process.argv[2] || 'build';
const args = process.argv.slice(3);
if (!['build', 'dev', 'prepare'].includes(mode)) throw new Error('Use desktop.mjs build, dev, or prepare.');
const platform = args.includes('--mac') ? 'darwin' : args.includes('--win') ? 'win32' : process.platform;
const arch = args.includes('--arm64') ? 'arm64' : args.includes('--x64') ? 'x64' : platform === 'darwin' ? 'arm64' : process.arch;
if (!['win32', 'darwin'].includes(platform) || !['x64', 'arm64'].includes(arch)) throw new Error('Supported targets: Windows and macOS, x64 or arm64.');
if (platform === 'win32' && arch !== 'x64') throw new Error('The current Studio backend dependency lock supports Windows x64. Use --x64 to build the x64 installer.');
if (platform !== process.platform && mode !== 'prepare') throw new Error('Build the Windows installer on Windows and the macOS app on macOS.');
if (platform === 'darwin' && arch !== 'arm64') throw new Error('The current Studio backend dependency lock supports Apple Silicon macOS. An Intel Mac can build the arm64 installer with desktop:mac.');
if (mode === 'dev' && arch !== process.arch) throw new Error('Desktop development must run on the target architecture. Use desktop:mac to build the Apple Silicon app from an Intel Mac.');
const localNode = path.join(root, '.runtime/node_modules/node/bin', process.platform === 'win32' ? 'node.exe' : 'node');
const node = fs.existsSync(localNode) ? localNode : process.execPath;
const localNpm = path.join(root, '.runtime/node_modules/npm/bin/npm-cli.js');
const globalNpm = process.env.npm_execpath;
const npmCli = fs.existsSync(localNpm) ? localNpm : globalNpm;
function run(executable, argv, cwd = root, env = {}) {
  const result = spawnSync(executable, argv, { cwd, stdio: 'inherit', env: { ...process.env, ...env }, windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${path.basename(executable)} failed (exit ${result.status}).`);
}
function npm(argv, cwd, env = {}) {
  if (!npmCli) throw new Error('Run this command through npm run desktop:build (or desktop:mac / desktop:win).');
  run(node, [npmCli, ...argv], cwd, env);
}

// Installer contents are built from explicit source paths; dev/ is never copied.
if (!fs.existsSync(path.join(desktop, 'node_modules/electron-builder'))) npm(['ci'], desktop);
if (!args.includes('--skip-frontend')) {
  const options = process.env.NODE_OPTIONS || '';
  npm(['run', 'build'], root, { NODE_OPTIONS: options.includes('--max-old-space-size') ? options : `${options} --max-old-space-size=8192`.trim() });
}
else if (!fs.existsSync(path.join(root, 'build/index.html'))) throw new Error('No frontend build exists. Omit --skip-frontend.');
run('uv', ['run', '--no-project', '--python', '3.12', path.join(root, 'scripts/prepare-desktop.py')]);
const requireDesktop = createRequire(path.join(desktop, 'package.json'));
const sharp = requireDesktop('sharp');
const buildDir = path.join(desktop, 'build');
fs.mkdirSync(buildDir, { recursive: true });
const svg = fs.readFileSync(path.join(root, 'static/favicon.svg'));
await sharp(svg).resize(1024, 1024).png().toFile(path.join(buildDir, 'icon.png'));

const iconSizes = [16, 32, 48, 64, 128, 256];
const pngs = await Promise.all(iconSizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()));
const icoHeader = Buffer.alloc(6 + 16 * pngs.length);
icoHeader.writeUInt16LE(1, 2); icoHeader.writeUInt16LE(pngs.length, 4);
let offset = icoHeader.length;
pngs.forEach((png, i) => {
  const pos = 6 + i * 16, size = iconSizes[i];
  icoHeader[pos] = size === 256 ? 0 : size; icoHeader[pos + 1] = icoHeader[pos];
  icoHeader.writeUInt16LE(1, pos + 4); icoHeader.writeUInt16LE(32, pos + 6);
  icoHeader.writeUInt32LE(png.length, pos + 8); icoHeader.writeUInt32LE(offset, pos + 12);
  offset += png.length;
});
fs.writeFileSync(path.join(buildDir, 'icon.ico'), Buffer.concat([icoHeader, ...pngs]));
const icnsParts = await Promise.all([[16, 'icp4'], [32, 'icp5'], [64, 'icp6'], [128, 'ic07'], [256, 'ic08'], [512, 'ic09'], [1024, 'ic10']].map(async ([size, type]) => {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  const header = Buffer.alloc(8); header.write(type); header.writeUInt32BE(8 + png.length, 4);
  return Buffer.concat([header, png]);
}));
const icnsHeader = Buffer.alloc(8); icnsHeader.write('icns'); icnsHeader.writeUInt32BE(8 + icnsParts.reduce((sum, part) => sum + part.length, 0), 4);
fs.writeFileSync(path.join(buildDir, 'icon.icns'), Buffer.concat([icnsHeader, ...icnsParts]));

// Pin the uv bootstrapper and verify its archive against the published checksum.
const uvVersion = '0.11.2';
const triple = `${arch === 'arm64' ? 'aarch64' : 'x86_64'}-${platform === 'win32' ? 'pc-windows-msvc' : 'apple-darwin'}`;
const asset = `uv-${triple}.${platform === 'win32' ? 'zip' : 'tar.gz'}`;
const assetURL = `https://releases.astral.sh/github/uv/releases/download/${uvVersion}/${asset}`;
const runtimeDir = path.join(desktop, 'resources/runtime');
fs.mkdirSync(runtimeDir, { recursive: true });
const stamp = path.join(runtimeDir, 'target.json');
const targetIdentity = JSON.stringify({ version: uvVersion, platform, arch });
let cached = '';
try { cached = fs.readFileSync(stamp, 'utf8'); } catch {}
const binary = path.join(runtimeDir, platform === 'win32' ? 'uv.exe' : 'uv');
if (cached !== targetIdentity || !fs.existsSync(binary)) {
  console.log(`Preparing uv ${uvVersion} for ${platform}/${arch}…`);
  const responses = await Promise.all([fetch(assetURL), fetch(`${assetURL}.sha256`)]);
  if (responses.some((r) => !r.ok)) throw new Error('Could not download the uv runtime or its checksum.');
  const archiveBytes = Buffer.from(await responses[0].arrayBuffer());
  const expected = (await responses[1].text()).trim().split(/\s+/)[0];
  const actual = crypto.createHash('sha256').update(archiveBytes).digest('hex');
  if (actual !== expected) throw new Error('uv archive checksum mismatch.');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-uv-'));
  try {
    const archive = path.join(tempDir, asset);
    fs.writeFileSync(archive, archiveBytes);
    run('uv', ['run', '--no-project', '--python', '3.12', path.join(root, 'scripts/extract-desktop-runtime.py'), archive,
      platform === 'win32' ? 'uv.exe' : `uv-${triple}/uv`, binary]);
    if (platform !== 'win32') fs.chmodSync(binary, 0o755);
    fs.writeFileSync(stamp, targetIdentity);
  } finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
}

for (const license of ['LICENSE-MIT', 'LICENSE-APACHE']) {
  const file = path.join(desktop, 'resources/licenses', `UV-${license}.txt`);
  if (!fs.existsSync(file)) {
    const response = await fetch(`https://raw.githubusercontent.com/astral-sh/uv/${uvVersion}/${license}`);
    if (!response.ok) throw new Error(`Could not download uv ${license}.`);
    fs.writeFileSync(file, await response.text());
  }
}

// A target switch must not accidentally include the other platform's executable.
const obsolete = path.join(runtimeDir, platform === 'win32' ? 'uv' : 'uv.exe');
fs.rmSync(obsolete, { force: true });
if (mode === 'prepare') console.log('Desktop payload prepared.');
else if (mode === 'dev') npm(['run', 'start'], desktop);
else {
  const builder = path.join(desktop, 'node_modules/electron-builder/cli.js');
  // Use Electron's current downloader/extractor rather than the builder's older
  // downloader. A separate directory per target also supports arm64 Mac builds
  // from an Intel build machine.
  const electronVersion = requireDesktop('./package.json').devDependencies.electron;
  const electronDist = path.join(root, '.runtime', 'electron-dist', `${platform}-${arch}-${electronVersion}`);
  const executable = path.join(electronDist, platform === 'win32' ? 'electron.exe' : 'Electron.app/Contents/MacOS/Electron');
  if (!fs.existsSync(executable)) {
    const { downloadArtifact } = requireDesktop('@electron/get');
    const archive = await downloadArtifact({ version: electronVersion, artifactName: 'electron', platform, arch,
      cacheRoot: path.join(root, '.runtime', 'electron-cache'), checksums: requireDesktop('electron/checksums.json') });
    fs.mkdirSync(electronDist, { recursive: true });
    await requireDesktop('@electron-internal/extract-zip').extract(archive, { dir: electronDist });
  }
  run(node, [builder, platform === 'win32' ? '--win' : '--mac', `--${arch}`, `--config.electronDist=${electronDist}`,
    ...(args.includes('--dir') ? ['--dir'] : []), '--publish', 'never'], desktop,
    { ELECTRON_BUILDER_CACHE: path.join(root, '.runtime', 'electron-builder-cache') });
}
