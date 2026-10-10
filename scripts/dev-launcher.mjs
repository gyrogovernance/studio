import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const mode = process.argv[2] === 'prod' ? 'prod' : 'dev';
const scriptPath = path.join(__dirname, 'start.ps1');
const ports = [8081, 5173];

const child = spawn(
	'powershell.exe',
	['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Mode', mode],
	{
		cwd: projectRoot,
		stdio: 'inherit',
		windowsHide: false
	}
);

let shuttingDown = false;

function killTree(pid) {
	if (!pid) {
		return;
	}
	try {
		execFileSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
			stdio: 'ignore',
			windowsHide: true
		});
	} catch {
		// Process may already be gone.
	}
}

function killPortListeners(port) {
	try {
		const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], {
			encoding: 'utf8',
			windowsHide: true
		});
		const pids = new Set();
		for (const line of output.split(/\r?\n/)) {
			if (!line.includes('LISTENING')) {
				continue;
			}
			if (!line.includes(`:${port} `) && !line.includes(`:${port}\t`)) {
				continue;
			}
			const parts = line.trim().split(/\s+/);
			const pid = Number(parts[parts.length - 1]);
			if (Number.isFinite(pid) && pid > 0) {
				pids.add(pid);
			}
		}
		for (const pid of pids) {
			killTree(pid);
		}
	} catch {
		// Best-effort cleanup only.
	}
}

function shutdown() {
	if (shuttingDown) {
		return;
	}
	shuttingDown = true;
	process.stdout.write('\nStopping Studio development processes...\n');
	killTree(child.pid);
	for (const port of ports) {
		killPortListeners(port);
	}
	process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

child.on('exit', (code, signal) => {
	if (shuttingDown) {
		process.exit(0);
		return;
	}
	if (signal) {
		process.exit(0);
		return;
	}
	process.exit(code ?? 0);
});
