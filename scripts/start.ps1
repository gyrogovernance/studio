param(
	[ValidateSet('dev', 'prod')]
	[string]$Mode = 'dev',
	[int]$Port = 8081,
	[int]$BackendReadySeconds = 90
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot '.venv\Scripts\python.exe'
$backendDir = Join-Path $projectRoot 'backend'
$envFile = Join-Path $projectRoot '.env'
$dataDir = Join-Path $projectRoot '.data'
$backendOutLog = Join-Path $dataDir 'backend-dev.out.log'
$backendErrLog = Join-Path $dataDir 'backend-dev.err.log'
$viteJs = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'
$preparePyodide = Join-Path $projectRoot 'scripts\prepare-pyodide.js'
$localNode = Join-Path $projectRoot '.runtime\node_modules\node\bin\node.exe'
$systemNode = Get-Command node.exe -ErrorAction SilentlyContinue
$script:backendProcess = $null
$script:frontendProcess = $null
$script:stopping = $false

if (-not (Test-Path -LiteralPath $python)) {
	throw 'Python environment not found. Run: uv sync --python 3.12 --no-dev --no-install-project'
}

if (-not (Test-Path -LiteralPath $envFile)) {
	Copy-Item (Join-Path $projectRoot '.env.example') $envFile
}

if (Test-Path -LiteralPath $localNode) {
	$node = $localNode
}
elseif ($systemNode) {
	$node = $systemNode.Source
}
else {
	throw 'node.exe was not found on PATH.'
}

function Get-ListeningPids {
	param([int]$ListenPort)

	$pids = @()
	$lines = & netstat.exe -ano -p tcp 2>$null
	foreach ($line in $lines) {
		if ($line -notmatch 'LISTENING') {
			continue
		}
		if ($line -notmatch ":$ListenPort\s+") {
			continue
		}
		$parts = ($line -split '\s+') | Where-Object { $_ }
		if ($parts.Count -ge 5) {
			$procId = 0
			if ([int]::TryParse($parts[-1], [ref]$procId) -and $procId -gt 0) {
				$pids += $procId
			}
		}
	}
	return ($pids | Select-Object -Unique)
}

function Stop-Tree {
	param([int]$ProcessId)

	if ($ProcessId -le 0) {
		return
	}
	& taskkill.exe /PID $ProcessId /T /F 2>$null | Out-Null
}

function Stop-StudioDev {
	param([switch]$Quiet)

	if ($script:stopping) {
		return
	}
	$script:stopping = $true

	if (-not $Quiet) {
		Write-Host 'Stopping Studio development processes...'
	}

	if ($script:frontendProcess -and -not $script:frontendProcess.HasExited) {
		Stop-Tree -ProcessId $script:frontendProcess.Id
	}
	if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
		Stop-Tree -ProcessId $script:backendProcess.Id
	}

	foreach ($listenPort in @($Port, 5173)) {
		foreach ($procId in (Get-ListeningPids -ListenPort $listenPort)) {
			Stop-Tree -ProcessId $procId
		}
	}
}

function Get-BackendLogTail {
	param([string[]]$LogPaths)

	$chunks = foreach ($path in $LogPaths) {
		if (Test-Path -LiteralPath $path) {
			Get-Content -LiteralPath $path -Tail 40 -ErrorAction SilentlyContinue
		}
	}
	return (($chunks | Where-Object { $_ }) -join [Environment]::NewLine)
}

function Wait-BackendReady {
	param(
		[int]$ListenPort,
		[int]$TimeoutSeconds,
		[System.Diagnostics.Process]$Process,
		[string[]]$LogPaths
	)

	$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
	$url = "http://127.0.0.1:$ListenPort/api/config"

	while ((Get-Date) -lt $deadline) {
		if ($script:stopping) {
			throw 'Startup cancelled.'
		}
		if ($Process.HasExited) {
			$tail = Get-BackendLogTail -LogPaths $LogPaths
			throw "Backend exited before becoming ready (exit code $($Process.ExitCode)). Log:$([Environment]::NewLine)$tail"
		}

		try {
			$response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
			if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
				return
			}
		}
		catch {
			Start-Sleep -Milliseconds 400
		}
	}

	$tail = Get-BackendLogTail -LogPaths $LogPaths
	throw "Backend did not become ready on port $ListenPort within $TimeoutSeconds seconds. Log:$([Environment]::NewLine)$tail"
}

if ($Mode -eq 'prod') {
	Push-Location $projectRoot
	try {
		& $node $preparePyodide
		if ($LASTEXITCODE -ne 0) {
			throw "Pyodide prepare failed with exit code $LASTEXITCODE"
		}
		& $node $viteJs build
		if ($LASTEXITCODE -ne 0) {
			throw "Frontend build failed with exit code $LASTEXITCODE"
		}
		$env:WEBUI_AUTH = 'False'
		Set-Location $backendDir
		& $python -m uvicorn open_webui.main:app --host 127.0.0.1 --port $Port --env-file $envFile
	}
	finally {
		Pop-Location
	}
	exit $LASTEXITCODE
}

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
Stop-StudioDev -Quiet
$script:stopping = $false
Remove-Item -LiteralPath $backendOutLog, $backendErrLog -Force -ErrorAction SilentlyContinue

# Must be set before Start-Process so the backend inherits auth-off for local dev.
$env:WEBUI_AUTH = 'False'

# File redirects via Start-Process (not PowerShell pipes / cmd /c quoting).
$backendArgs = @(
	'-m', 'uvicorn', 'open_webui.main:app',
	'--host', '127.0.0.1',
	'--port', "$Port",
	'--reload',
	'--env-file', $envFile
)
$script:backendProcess = Start-Process -FilePath $python `
	-ArgumentList $backendArgs `
	-WorkingDirectory $backendDir `
	-PassThru `
	-WindowStyle Hidden `
	-RedirectStandardOutput $backendOutLog `
	-RedirectStandardError $backendErrLog

$exitCode = 0

try {
	Write-Host "Starting backend on http://127.0.0.1:$Port"
	Write-Host "Backend logs: $backendOutLog ; $backendErrLog"
	Wait-BackendReady -ListenPort $Port -TimeoutSeconds $BackendReadySeconds -Process $script:backendProcess -LogPaths @($backendOutLog, $backendErrLog)
	Write-Host 'Backend is ready.'

	Write-Host 'Preparing Pyodide cache...'
	& $node $preparePyodide
	if ($LASTEXITCODE -ne 0) {
		throw "Pyodide prepare failed with exit code $LASTEXITCODE"
	}

	Write-Host 'Starting Vite on http://127.0.0.1:5173'
	Write-Host 'Press Ctrl+C to stop.'
	$script:frontendProcess = Start-Process -FilePath $node `
		-ArgumentList @($viteJs, 'dev', '--host', '127.0.0.1') `
		-WorkingDirectory $projectRoot `
		-PassThru `
		-NoNewWindow

	while (-not $script:stopping) {
		if ($script:frontendProcess.HasExited) {
			$exitCode = $script:frontendProcess.ExitCode
			break
		}
		if ($script:backendProcess.HasExited) {
			Write-Host 'Backend process exited unexpectedly.'
			$exitCode = 1
			break
		}
		Start-Sleep -Milliseconds 400
	}
}
catch {
	if ("$_" -ne 'Startup cancelled.') {
		Write-Host $_
	}
	$exitCode = 1
}
finally {
	Stop-StudioDev
}

exit $exitCode
