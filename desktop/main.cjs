// SPDX-License-Identifier: AGPL-3.0-only
const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { StudioRuntime } = require('./runtime.cjs');

app.setName('AI Inspector Studio');
app.setPath('userData', path.join(app.getPath('appData'), 'AI Inspector Studio'));
const resources = app.isPackaged ? process.resourcesPath : path.join(__dirname, 'resources');
const loadingURL = pathToFileURL(path.join(__dirname, 'loading.html')).href;
let window;
let runtime;
let backendURL;
let quitting = false;
let logStream;
let logFile;

function log(message) {
  logStream?.write(`${new Date().toISOString()} ${String(message).trim()}\n`);
}

function onStatus(status, detail = '') {
  log(status);
  if (!window || window.isDestroyed() || window.webContents.getURL() !== loadingURL) return;
  window.webContents.executeJavaScript(
    `document.getElementById('status').textContent = ${JSON.stringify(status)}; document.getElementById('detail').textContent = ${JSON.stringify(detail)};`
  ).catch(() => {});
}

function external(url) {
  try {
    if (['https:', 'http:', 'mailto:'].includes(new URL(url).protocol)) shell.openExternal(url).catch(log);
  } catch {}
}

async function start() {
  window = new BrowserWindow({
    title: 'AI Inspector Studio', width: 1280, height: 860, minWidth: 700, minHeight: 500,
    backgroundColor: '#141414', icon: path.join(resources, 'icon.png'),
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  });
  window.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => {
    if (url === loadingURL || (backendURL && new URL(url).origin === backendURL)) return;
    event.preventDefault(); external(url);
  });
  window.webContents.session.setPermissionRequestHandler((contents, permission, callback, details) => {
    const local = contents === window?.webContents && backendURL && details.requestingUrl?.startsWith(`${backendURL}/`);
    callback(Boolean(local && ['media', 'clipboard-sanitized-write', 'fullscreen'].includes(permission)));
  });
  window.webContents.session.setPermissionCheckHandler((contents, permission, origin) =>
    Boolean(contents === window?.webContents && backendURL === origin && ['media', 'clipboard-sanitized-write', 'fullscreen'].includes(permission))
  );
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { label: 'File', submenu: [{ role: 'quit' }] },
    { role: 'editMenu' },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }, ...(!app.isPackaged ? [{ role: 'toggleDevTools' }] : [])] },
    { label: 'Help', submenu: [
      { label: 'Open Desktop Log', click: () => shell.openPath(logFile) },
      { label: 'Open Application Data', click: () => shell.openPath(app.getPath('userData')) },
      { label: 'Licenses and Notices', click: () => shell.openPath(path.join(resources, 'licenses')) },
      { label: 'Application Source', click: () => shell.openPath(path.join(resources, 'source')) },
      { label: 'About AI Inspector Studio', click: () => dialog.showMessageBox(window, {
        type: 'info', title: 'AI Inspector Studio', message: `AI Inspector Studio ${app.getVersion()}`,
        detail: 'Developed by Gyro Governance. Built on Open WebUI by Timothy Jaeryang Baek and Open WebUI Inc.\n\nDesktop packaging adapted from Open WebUI Desktop (AGPL-3.0). Licenses and application source are available from the Help menu.'
      }) }
    ] }
  ]));
  while (!quitting) {
    await window.loadURL(loadingURL);
    runtime = new StudioRuntime({ resources, userData: app.getPath('userData'), onStatus, log,
      pythonOverride: !app.isPackaged ? process.env.STUDIO_DESKTOP_PYTHON : undefined });
    try {
      backendURL = await runtime.start();
      await window.loadURL(backendURL);
      runtime.backend.once('exit', () => {
        if (!quitting) { dialog.showErrorBox('Workspace stopped', 'The local workspace stopped. Reopen AI Inspector Studio to restart it. Details are in Help → Open Desktop Log.'); app.quit(); }
      });
      return;
    } catch (error) {
      if (quitting) return;
      log(error.stack || error.message);
      onStatus('Workspace setup needs attention.', '');
      await runtime.stop();
      const { response } = await dialog.showMessageBox(window, { type: 'error', title: 'AI Inspector Studio',
        message: 'Could not open the workspace', detail: error.message,
        buttons: ['Retry', 'Open Log', 'Quit'], defaultId: 0, cancelId: 2 });
      if (response === 2) { app.quit(); return; }
      if (response === 1) await shell.openPath(logFile);
    }
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.show(); window.focus(); } });
  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', (event) => {
    if (quitting) return;
    event.preventDefault(); quitting = true;
    Promise.resolve(runtime?.stop()).finally(() => { logStream?.end(); app.quit(); });
  });
  app.whenReady().then(() => {
    app.setAppUserModelId('com.gyrogovernance.ai-inspector-studio');
    const logs = path.join(app.getPath('userData'), 'logs');
    fs.mkdirSync(logs, { recursive: true });
    logFile = path.join(logs, 'desktop.log');
    if (fs.existsSync(logFile) && fs.statSync(logFile).size > 10 * 1024 * 1024) fs.renameSync(logFile, `${logFile}.${Date.now()}.old`);
    logStream = fs.createWriteStream(logFile, { flags: 'a' });
    return start();
  }).catch((error) => { log(error.stack || error.message); dialog.showErrorBox('AI Inspector Studio', error.message); app.quit(); });
}
