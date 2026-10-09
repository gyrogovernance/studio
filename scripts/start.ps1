param(
	[ValidateSet('dev', 'prod')]
	[string]$Mode = 'dev',
	[int]$Port = 8081
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot '.venv\Scripts\python.exe'
$localNode = Join-Path $projectRoot '.runtime\node_modules\node\bin\node.exe'
$localNpmCli = Join-Path $projectRoot '.runtime\node_modules\npm\bin\npm-cli.js'
$systemNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (-not (Test-Path -LiteralPath $python)) {
	throw 'Python environment not found. Run: uv sync --python 3.12 --no-dev --no-install-project'
}

if ((Test-Path -LiteralPath $localNode) -and (Test-Path -LiteralPath $localNpmCli)) {
	$node = $localNode
	$npmArguments = @($localNpmCli)
}
elseif ($systemNpm) {
	$node = $systemNpm.Source
	$npmArguments = @()
}
else {
	throw 'npm was not found on PATH.'
}

if ($Mode -eq 'prod') {
	Push-Location $projectRoot
	try {
		& $node @npmArguments run build
		$env:WEBUI_AUTH = 'False'
		Set-Location (Join-Path $projectRoot 'backend')
		& $python -m uvicorn open_webui.main:app --host 127.0.0.1 --port $Port --env-file ..\.env
	}
	finally {
		Pop-Location
	}
	exit $LASTEXITCODE
}

$backendCommand = "`$env:WEBUI_AUTH = 'False'; & '$PSScriptRoot\dev-backend.ps1'"
$backend = Start-Process -FilePath 'powershell.exe' `
	-ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $backendCommand) `
	-WorkingDirectory $projectRoot `
	-WindowStyle Hidden `
	-PassThru

try {
	Push-Location $projectRoot
	& $node @npmArguments run dev
}
finally {
	Pop-Location
	if ($backend -and (Get-Process -Id $backend.Id -ErrorAction SilentlyContinue)) {
		& taskkill.exe /PID $backend.Id /T /F | Out-Null
	}
}

exit $LASTEXITCODE
