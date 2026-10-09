# Development

## Architecture

AI Inspector Studio uses the Open WebUI v0.11.4 source in the repository root. The frontend is SvelteKit, Svelte 5, and Vite. The backend is FastAPI. Native Open WebUI chats, Notes, Knowledge, search, references, and exports provide the MVP's storage and working interface.

| Path | Purpose |
| --- | --- |
| `src/` | Frontend components, routes, and native workspace interface |
| `backend/open_webui/` | Backend application and native services |
| `backend/open_webui/studio/` | Studio default installers, gadget execution, framework import, and glossary endpoint |
| `backend/open_webui/studio/data/` | Versioned workspace, gadget, and framework packs, source files, and notices |
| `scripts/start.ps1` | Combined Windows development and local production launchers |
| `scripts/dev-backend.ps1` | Backend development command |
| `desktop/` | Electron launcher and Windows/macOS installer configuration |
| `scripts/desktop.mjs` | Desktop frontend build, payload preparation, and platform packaging |
| `scripts/prepare-desktop.py` | Studio backend wheel, locked dependency export, notices, and source bundle |
| `scripts/port-inspector-gadgets.py` | Source prompt extraction and gadget adapter generation |
| `prompts/` | Earlier prompt drafts; separate from the installed gadget pack |
| `static/` | Frontend assets |
| `dev/` | Product, development, data, and internal notes |

Local upstream reference checkouts are kept under the ignored `dev/external/` directory. They are not runtime dependencies. Private `dev/` files are excluded from desktop payloads, source bundles, and Docker build contexts.

## Desktop packaging

`desktop/README.md` describes Windows and macOS build commands and installation behavior.
The Electron installer configuration is adapted from `open-webui/desktop` v0.0.20;
the launcher opens Studio directly and manages a loopback backend process. First
launch installs managed Python 3.12 and hashed dependencies with a pinned,
checksum-verified uv executable. The bundled wheel contains this repository's
Studio backend, frontend, and workspace defaults.

Backend dependencies are exported from `uv.lock`. Updates are delivered through
Studio installers; upstream PyPI auto-updates are not used. Application data lives
outside the installer and survives application upgrades. Code signing and macOS
notarization require platform credentials before public distribution. The manual
desktop workflow builds installers and uploads artifacts without publishing a release.

## Local setup

Use Node.js 22, Python 3.12, and `uv`. The declared package ranges are Node.js 18.13 through 22.x and Python 3.11 through 3.12. Node.js 22 and Python 3.12 are the documented setup.

From PowerShell in the repository root:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item .env.example .env
}
npm ci
uv sync --python 3.12 --no-dev --no-install-project
```

`--no-install-project` prepares the backend dependencies without invoking the upstream package build hook.

Keep `.env` local. For the supplied launchers, which start Python from `backend/`, these relative paths place runtime data under the ignored repository-root `.data/` directory:

```dotenv
WEBUI_NAME='AI Inspector Studio'
SHOW_OPEN_WEBUI_BRANDING=true
DATA_DIR='../.data'
STATIC_DIR='../.data/static'
CORS_ALLOW_ORIGIN='http://127.0.0.1:5173;http://127.0.0.1:8081'
DEFAULT_INTERFACE_SETTINGS='{"showChangelog":false}'
```

Retain an existing instance's data path when changing configuration. Open WebUI repopulates its configured static directory at startup; use a runtime directory rather than a tracked asset directory.

The launcher uses `.venv/Scripts/python.exe`. If `.runtime/` contains a project-local Node/npm installation, it uses that installation; otherwise it uses npm from PATH.

## Run commands

| Command | Behavior | Default URL |
| --- | --- | --- |
| `npm run start:dev` | Starts Vite and a hidden backend process with Python reload | `http://127.0.0.1:5173` |
| `npm run start:prod` | Builds the frontend and serves it through FastAPI | `http://127.0.0.1:8081` |
| `npm run dev` | Starts only the Vite frontend | `http://127.0.0.1:5173` |
| `npm run dev:backend` | Starts only the backend with reload | `http://127.0.0.1:8081` |

For production frontend builds with additional Node heap capacity:

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=8192'
npm run start:prod
```

Both combined launchers bind to `127.0.0.1` and set `WEBUI_AUTH=False`. Open WebUI maintains an internal profile for its profile-scoped data. A shared deployment needs a separate authenticated server configuration, including its signing secret and access settings.

Vite proxies API, provider, OAuth, and WebSocket traffic to `http://127.0.0.1:8081`. `WEBUI_BACKEND_URL` overrides the frontend proxy target. The backend exposes its API documentation at `/docs`.

## Model connections

Configure provider connections under Admin Settings → Connections. OpenAI-compatible providers use their base URL and credentials; Ollama uses the address of its running local service. Inference credentials and model weights are not bundled.

The four starter model presets initially have no base model and remain disabled. Assign an inference model in the preset editor to enable a preset. Prompts and skills can also be used independently.

Enable a gadget in the chat tool selector or attach it to a model preset. The selected model must support tool use. Each gadget has an optional `MODEL` valve; an empty value uses the current chat model.

## Workspace packs

`studio/defaults.py` installs four model presets, nine prompts, and four skills from `workspace-v1.json`. It also invokes the native gadget installer. Startup and first-profile creation provide installation entry points. Set `STUDIO_WORKSPACE_DEFAULTS=false` to disable automatic pack installation.

`studio/gadgets.py` installs five native Tools and runs their source-derived instructions through Open WebUI's completion dispatcher. Policy Auditing, Policy Reporting, Text Sanitization, and Quality Improvement each run one task. Meta-Evaluation runs three sequential tasks with the corresponding Human Mark references and previous pass outputs.

`studio/knowledge.py` imports five collections containing eight source documents through the native file upload, extraction, embedding, and Knowledge linking path. Indexing runs in the background. The configured embedding model must be available; the default local embedding model may download on first setup. The importer attaches relevant libraries once to untouched policy and Human Mark presets.

| Pack state | Configuration key |
| --- | --- |
| Workspace entries | `studio.workspace_pack.v1` |
| Gadget entries | `studio.gadgets.v1` |
| Framework collections and files | `studio.framework_pack.v1` |
| Initial preset-library links | `studio.framework_pack.v1.preset_links` |

Installers preserve subsequent edits and intentional deletions. Framework installation records progress per file and can resume interrupted work. New bundled content needs explicit versioning and migration rules.

Administrator endpoints:

- `GET /api/v1/studio/frameworks/status`: importer state and recorded progress.
- `POST /api/v1/studio/frameworks/install`: schedule a resumable import.

The authenticated endpoint `GET /api/v1/studio/glossary` supplies workspace definitions and attributed Human Mark reference sections to `/workspace/glossary`.

See [Data and provenance](03_Data.md) for the tool result format, source mapping, and reference metadata.

## Extension maintenance

Use native Prompts for reusable instructions, Skills for task guidance, Tools for callable operations, and model presets to combine them with inference and Knowledge. Action and Pipe Functions remain available when an integration specifically requires a message operation or a model-like endpoint. The existing gadget pack runs inside the backend and does not require a separate orchestration service.

GyroDiagnostics and Rapid Test are excluded. A separate Evaluations feature is deferred. Arena model comparison is disabled; startup clears inherited Arena configuration.

## Checks and upstream updates

For code changes, run the checks relevant to the affected component. The repository provides `npm run check` for Svelte/TypeScript diagnostics and `npm run build` for frontend compilation. Record results and unresolved diagnostics in [Notes](04_Notes.md). A successful build and a successful type check are separate outcomes.

The imported upstream baseline is v0.11.4, commit `8bd8b4fac5e059578ac0c74b3c18d11139f88b7d`. Git retains the shared upstream history, with the `upstream` remote pointing to `open-webui/open-webui`.

For an update, fetch upstream, review the selected release and migrations, then merge it into a working branch. Review `LICENSE`, `LICENSE_HISTORY`, and `LICENSE_NOTICE` at the target commit. Resolve changes in Studio-modified routes, startup hooks, assets, and native model interfaces, then exercise the affected workflows. Keep source and license notices with every port and reference document.
