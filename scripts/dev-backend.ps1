$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$python = Join-Path $projectRoot '.venv\Scripts\python.exe'

if (-not (Test-Path -LiteralPath $python)) {
	throw 'Python environment not found. Run: uv sync --python 3.12 --no-dev --no-install-project'
}

$env:WEBUI_AUTH = 'False'
Set-Location (Join-Path $projectRoot 'backend')
& $python -m uvicorn open_webui.main:app --host 127.0.0.1 --port 8081 --reload --env-file ..\.env
