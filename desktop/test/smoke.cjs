// Run with desktop/node_modules/.bin/electron desktop/test/smoke.cjs [packaged-resources].
// Uses a separate ignored profile so verification cannot modify existing Studio data.
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { StudioRuntime } = require('../runtime.cjs');
const resources = process.argv[2] || path.resolve(__dirname, '../resources');
const userData = path.resolve(__dirname, '../../.runtime/desktop-smoke');
app.setPath('userData', path.join(userData, 'electron'));
let runtime;
let window;

app.whenReady().then(async () => {
  fs.mkdirSync(userData, { recursive: true });
  const log = fs.createWriteStream(path.join(userData, 'smoke.log'), { flags: 'a' });
  runtime = new StudioRuntime({ resources, userData, onStatus: (status) => console.log(status), log: (line) => log.write(line) });
  try {
    const url = await runtime.start();
    const config = await fetch(`${url}/api/config`).then((response) => response.json());
    assert.equal(config.features.auth, false, 'account registration disabled');
    assert.notEqual(config.onboarding, true, 'welcome screen bypassed on a new installation');
    window = new BrowserWindow({ show: false, width: 1280, height: 860, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, backgroundThrottling: false } });
    window.webContents.on('console-message', (event) => { if (event.level >= 2) log.write(`[renderer] ${event.message}\n`); });
    await window.loadURL(url);
    let state;
    for (let i = 0; i < 150; i++) {
      state = await window.webContents.executeJavaScript(`({ title: document.title, sidebar: document.getElementById('sidebar-webui-name')?.textContent, text: document.body.innerText, token: localStorage.getItem('token'), composer: !!document.getElementById('chat-input') })`);
      if (state.sidebar?.includes('AI Inspector Studio') && state.token && state.composer) break;
      await delay(400);
    }
    assert.ok(state.sidebar?.includes('AI Inspector Studio'), 'Studio workspace rendered');
    assert.ok(!state.text.includes('Create Admin Account'), 'no registration screen');
    assert.ok(state.token, 'local profile initialized');
    assert.ok(state.composer, 'chat composer ready');
    await window.webContents.executeJavaScript('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const screenshot = await window.webContents.capturePage();
    fs.writeFileSync(path.join(userData, 'workspace.png'), screenshot.toPNG());
    const headers = { Authorization: `Bearer ${state.token}` };
    const tools = await fetch(`${url}/api/v1/tools/`, { headers }).then((response) => response.json());
    assert.equal(tools.filter((tool) => tool.id.startsWith('studio-')).length, 5, 'all five gadgets installed');
    const pid = runtime.backend.pid;
    await runtime.stop();
    for (let i = 0; i < 40; i++) {
      try { process.kill(pid, 0); } catch { break; }
      await delay(50);
    }
    assert.throws(() => process.kill(pid, 0), 'backend exited');
    console.log('PASS: packaged backend, accountless startup, rendered Studio workspace, five tools, shutdown.');
    window.destroy(); log.end(); app.exit(0);
  } catch (error) {
    console.error(error);
    await runtime.stop(); window?.destroy(); log.end(); app.exit(1);
  }
}).catch((error) => { console.error(error); app.exit(1); });
