const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { StudioRuntime, sha256 } = require('../runtime.cjs');

test('a damaged bundled wheel is rejected before running setup', async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-integrity-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const payload = path.join(temp, 'studio');
  fs.mkdirSync(payload);
  fs.writeFileSync(path.join(payload, 'test.whl'), 'wheel');
  fs.writeFileSync(path.join(payload, 'requirements.txt'), '');
  fs.writeFileSync(path.join(payload, 'manifest.json'), JSON.stringify({
    wheel: 'test.whl', wheelSha256: 'incorrect', requirementsSha256: sha256(path.join(payload, 'requirements.txt'))
  }));
  const runtime = new StudioRuntime({ resources: temp, userData: path.join(temp, 'profile'), onStatus() {}, log() {} });
  await assert.rejects(runtime.prepare(), /incomplete or damaged/);
  assert.equal(runtime.children.size, 0);
});

test('quitting terminates a running managed process and its child', async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-shutdown-'));
  const runtime = new StudioRuntime({ resources: temp, userData: temp, onStatus() {}, log() {} });
  t.after(async () => { await runtime.stop(); fs.rmSync(temp, { recursive: true, force: true }); });
  const marker = path.join(temp, 'child.pid');
  const program = `const {spawn}=require('node:child_process'); const fs=require('node:fs'); const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore',windowsHide:true}); fs.writeFileSync(process.argv[1],String(child.pid)); setInterval(()=>{},1000);`;
  runtime.launch(process.execPath, ['-e', program, marker]);
  for (let i = 0; i < 100 && !fs.existsSync(marker); i++) await delay(50);
  assert.ok(fs.existsSync(marker), 'child process started');
  const pid = Number(fs.readFileSync(marker, 'utf8'));
  await runtime.stop();
  let alive = true;
  for (let i = 0; i < 40; i++) {
    try { process.kill(pid, 0); } catch { alive = false; break; }
    await delay(50);
  }
  assert.equal(alive, false, 'descendant terminated with the managed process');
  assert.throws(() => runtime.launch(process.execPath, ['--version']), /cancelled/);
});
