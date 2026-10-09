// SPDX-License-Identifier: AGPL-3.0-only
// Studio runtime integration for the Open WebUI Desktop packaging pipeline.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { spawn, execFile } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pythonIn = (dir) => path.join(dir, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');

async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port;
      probe.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

class StudioRuntime {
  constructor({ resources, userData, onStatus, log, pythonOverride }) {
    this.resources = resources;
    this.userData = userData;
    this.onStatus = onStatus;
    this.log = log;
    this.pythonOverride = pythonOverride;
    this.children = new Set();
    this.controller = new AbortController();
    this.stopping = false;
    this.env = { ...process.env };
    for (const key of ['PYTHONHOME', 'PYTHONPATH', 'VIRTUAL_ENV', 'UV_PROJECT_ENVIRONMENT']) delete this.env[key];
    Object.assign(this.env, {
      UV_PYTHON_INSTALL_DIR: path.join(userData, 'runtime', 'python'),
      UV_CACHE_DIR: path.join(userData, 'runtime', 'cache'),
      UV_NO_PROGRESS: '1',
      UV_NO_CONFIG: '1',
      UV_PYTHON_PREFERENCE: 'only-managed',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUNBUFFERED: '1'
    });
    fs.mkdirSync(userData, { recursive: true });
  }

  launch(executable, args, extraEnv = {}) {
    if (this.stopping) throw new Error('Startup cancelled');
    const child = spawn(executable, args, {
      cwd: this.userData,
      env: { ...this.env, ...extraEnv },
      windowsHide: true,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    this.children.add(child);
    child.once('exit', () => this.children.delete(child));
    child.once('error', (error) => { this.children.delete(child); this.log(error.message); });
    for (const stream of [child.stdout, child.stderr]) stream.on('data', (data) => this.log(data.toString()));
    return child;
  }

  async command(executable, args) {
    const child = this.launch(executable, args);
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(
        this.stopping ? 'Startup cancelled' : `Workspace setup failed (${signal || code}). See the desktop log for details.`
      )));
    });
  }

  async prepare() {
    const payload = path.join(this.resources, 'studio');
    const manifest = JSON.parse(fs.readFileSync(path.join(payload, 'manifest.json'), 'utf8'));
    const wheel = path.join(payload, path.basename(manifest.wheel));
    const requirements = path.join(payload, 'requirements.txt');
    if (sha256(wheel) !== manifest.wheelSha256 || sha256(requirements) !== manifest.requirementsSha256) {
      throw new Error('The installed Studio files are incomplete or damaged. Reinstall AI Inspector Studio.');
    }
    this.manifest = manifest;
    if (this.pythonOverride) return this.pythonOverride;
    const uv = path.join(this.resources, 'runtime', process.platform === 'win32' ? 'uv.exe' : 'uv');
    const runtimeDir = path.join(this.userData, 'runtime');
    const venv = path.join(runtimeDir, 'backend');
    const python = pythonIn(venv);
    const marker = path.join(runtimeDir, 'installed.json');
    const identity = `${manifest.wheelSha256}:${manifest.requirementsSha256}:${process.platform}:${process.arch}`;
    let previous;
    try { previous = JSON.parse(fs.readFileSync(marker, 'utf8')); } catch {}
    if (previous?.identity === identity && fs.existsSync(python)) return python;

    this.onStatus('Setting up your workspace…', 'First setup downloads Python and backend dependencies. Keep an internet connection available. This can take several minutes.');
    fs.mkdirSync(runtimeDir, { recursive: true });
    // Removing the completion marker makes an interrupted update retryable.
    fs.rmSync(marker, { force: true });
    if (!fs.existsSync(python)) {
      await this.command(uv, ['python', 'install', '3.12', '--no-bin', ...(process.platform === 'win32' ? ['--no-registry'] : [])]);
      await this.command(uv, ['venv', '--python', '3.12', venv]);
    }
    this.onStatus('Installing workspace dependencies…', 'This step runs once and resumes after an interrupted setup.');
    await this.command(uv, ['pip', 'sync', '--python', python, '--require-hashes', requirements]);
    this.onStatus('Installing AI Inspector Studio…', 'Your chats and settings are stored separately from the application.');
    await this.command(uv, ['pip', 'install', '--python', python, '--no-deps', '--reinstall', wheel]);
    fs.writeFileSync(marker, JSON.stringify({ identity, version: manifest.version }));
    return python;
  }

  async start() {
    const python = await this.prepare();
    const data = path.join(this.userData, 'data');
    fs.mkdirSync(data, { recursive: true });
    const keyPath = path.join(data, '.key');
    if (!fs.existsSync(keyPath)) fs.writeFileSync(keyPath, crypto.randomBytes(48).toString('hex'), { mode: 0o600 });
    const port = await freePort();
    const url = `http://127.0.0.1:${port}`;
    this.onStatus('Opening your workspace…', '');
    // Call the existing CLI so its platform-specific Uvicorn loop settings are retained.
    this.backend = this.launch(python, ['-c', 'from open_webui import serve; import sys; serve(host="127.0.0.1", port=int(sys.argv[1]))', String(port)], {
      ENV: 'prod',
      WEBUI_NAME: 'AI Inspector Studio',
      SHOW_OPEN_WEBUI_BRANDING: 'true',
      WEBUI_AUTH: 'False',
      ENABLE_SIGNUP: 'False',
      ENABLE_MESSAGE_RATING: 'False',
      DEFAULT_INTERFACE_SETTINGS: JSON.stringify({ showChangelog: false }),
      DATA_DIR: data,
      STATIC_DIR: path.join(data, 'static'),
      WEBUI_SECRET_KEY: fs.readFileSync(keyPath, 'utf8'),
      CORS_ALLOW_ORIGIN: url,
      UVICORN_WORKERS: '1',
      SCARF_NO_ANALYTICS: 'true',
      DO_NOT_TRACK: 'true',
      ANONYMIZED_TELEMETRY: 'false'
    });
    let launchError;
    this.backend.once('error', (error) => { launchError = error; });
    const deadline = Date.now() + 5 * 60_000;
    while (Date.now() < deadline && !this.stopping) {
      if (launchError) throw launchError;
      if (this.backend.exitCode !== null || this.backend.signalCode !== null) throw new Error('The workspace backend stopped during startup. See the desktop log for details.');
      try {
        const response = await fetch(`${url}/health`, { signal: AbortSignal.any([AbortSignal.timeout(2000), this.controller.signal]) });
        if (response.ok) return url;
      } catch {}
      await delay(400, undefined, { signal: this.controller.signal });
    }
    throw new Error(this.stopping ? 'Startup cancelled' : 'The workspace did not finish starting. See the desktop log for details.');
  }

  async stop() {
    this.stopping = true;
    this.controller.abort();
    await Promise.all([...this.children].map(async (child) => {
      if (!child.pid) return;
      if (process.platform === 'win32') {
        await new Promise((resolve) => execFile('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, resolve));
      } else {
        try { process.kill(-child.pid, 'SIGTERM'); } catch {}
        await Promise.race([new Promise((resolve) => child.once('exit', resolve)), delay(3000)]);
        try { process.kill(-child.pid, 'SIGKILL'); } catch {}
      }
    }));
  }
}

module.exports = { StudioRuntime, sha256, pythonIn, freePort };
