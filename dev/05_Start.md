# How to start

Practical order of work for `gyrogovernance/studio`. Product intent: [01_Product](01_Product.md). Integration map: [02_Development](02_Development.md). Data: [03_Data](03_Data.md).

## Stack (read this before forking)

| Piece | Technology | Role |
| --- | --- | --- |
| Open WebUI app | **SvelteKit (Svelte 5) + Vite** frontend; **Python FastAPI** backend | The product UI and API. Version in checkout: 0.11.4. |
| Desktop wrapper | **Electron + electron-vite + Svelte** ([open-webui/desktop](https://github.com/open-webui/desktop), AGPL-3.0) | Native shell that runs or connects to an Open WebUI server. Alpha. |
| Studio (this repo) | Config, prompts, skills, Knowledge packs, later Tools/Functions | Our layer on top of Open WebUI. |

Studio is **not** a React app. AI Inspector was React; Open WebUI is Svelte. Do not port UI patterns by assuming React components.

## What not to do first

Do **not** copy `external/open-webui-desktop` to the repository root and start editing it. Desktop is a packaging shell. Forking it early pulls AGPL surface area, Electron build pain, and none of the MVP value (Knowledge, Prompts, Skills, adjudication, export).

Do **not** vendor the full Open WebUI source into `studio/` as the first step. Upstream moves on `dev` daily. Prefer running Open WebUI as the platform and shipping Studio as configuration + plugins that can be re-applied after upgrades.

## Recommended path

### Phase A. Run Open WebUI with live reload (today)

Two terminals, from a clone of [open-webui/open-webui](https://github.com/open-webui/open-webui) on branch `dev` (not `main`). Official guide: [Developing Open WebUI](https://docs.openwebui.com/getting-started/advanced-topics/development).

Prerequisites: Python 3.11 or 3.12 (3.13 unsupported), Node.js 22.10+.

```bash
# Terminal 1: frontend (Vite HMR at http://localhost:5173)
git checkout dev
cp -RPp .env.example .env
npm install
npm run build
npm run dev

# Terminal 2: backend (http://localhost:8080, API docs at /docs)
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt -U
sh dev.sh
```

`npm run dev` is the live-edit loop (Vite), analogous to `bun dev` / `vite`. Backend changes need a restart of `dev.sh` unless that script already reloads.

Local reference checkout already exists at `external/open-webui` (shallow). For day-to-day development, prefer a full clone on `dev` with its own data directory, separate from any production install.

Faster alternative with no local build: Docker image `ghcr.io/open-webui/open-webui:dev` (no HMR for our own frontend edits; fine for configuring Knowledge / Prompts / Skills only).

### Phase B. Studio as configuration (MVP)

With a running instance (dev server or Docker):

1. Connect OpenRouter (or another provider); set a spending cap; restrict the model list.
2. Load the EU audience pack from [02_Development](02_Development.md): Knowledge Bases, Prompts, Skills, Model presets, Note templates.
3. Run one end-to-end session on a Note; export by hand; record data destinations.
4. Only then add an Action Function (review button) and an outlet Filter (JSON validation).

Studio repo work in this phase: Markdown skills, prompt text, Knowledge manifests, import scripts, and documentation under `dev/` and `prompts/`. No Electron packaging.

### Phase C. Custom code (only when config is insufficient)

| Need | Mechanism | When |
| --- | --- | --- |
| Review button on a message | Action Function (admin Python) | After Phase B works |
| Validate assessment JSON | Filter Function (outlet) | With the Action |
| Three passes as one selectable agent | Pipe Function | Optional |
| Desktop installers for non-technical users | Desktop later, pointed at a Studio-configured server | After web MVP |

If we eventually need a branded fork of the Svelte UI, treat that as a separate, expensive project. Prefer theme, banners, default models, and RBAC first.

## Hiding Open WebUI features

Prefer **configuration**, not forks:

- Admin permissions and group RBAC: turn off tools users should not see (image gen, arena, code execution, public note sharing, and so on).
- Default interface settings and banners: Studio naming and onboarding.
- Model list and provider allowlist: only the models you fund.
- Evaluation (thumbs / arena): leave available for admins; keep it separate from Human Mark adjudication in docs and UX copy.

Hide or disable for the policy audience: Arena leaderboard as a primary path, unscoped public sharing of Notes, and any tool that sends drafts to unexpected providers. Keep visible: Chat, Notes, Knowledge, Prompts, Skills, Search, and the review Action once it exists.

Desktop Spotlight / global hotkeys are optional later; they are not required for the MVP.

## Brief to paste to another assistant

Use the block below as the task prompt on the `gyrogovernance/studio` repo (or a sibling worktree). Adjust paths if their clone differs.

```
Repo: gyrogovernance/studio (local: F:\Development\studio).
Docs: read dev/01_Product.md, dev/02_Development.md, dev/03_Data.md, dev/05_Start.md first.

Goal for this session: Phase A + start of Phase B only.
1. Confirm Open WebUI stack: SvelteKit + Vite frontend, FastAPI backend. Not React. Not desktop-first.
2. Do not move open-webui-desktop to repo root. Do not vendor-fork Open WebUI yet.
3. Set up live development per upstream docs (branch `dev`, npm run dev + backend/dev.sh), or document Docker :dev if the machine cannot run both.
4. Record installed release, URL, and data directory in dev/02_Development.md.
5. Begin EU audience pack: create Knowledge / Prompts / Skills / Model presets listed in 02_Development (eu-ai-act, thm-reference first). Convert prompts in prompts/ to Open WebUI import format where needed.
6. Do not implement Action/Filter Functions until one manual Note session completes end to end.

Constraints: keep Open WebUI branding visible; MIT for Studio code; CC BY-SA attribution for Human Mark docs; separate consent from free tokens.
```
