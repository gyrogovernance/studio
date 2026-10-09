# AI Inspector Studio

AI Inspector Studio is a self-hosted workspace for research, policy analysis, and document review, built on [Open WebUI](https://github.com/open-webui/open-webui).

Bring sources into Knowledge, develop drafts in Notes, and work with a local or hosted language model. Five tools adapted from the AI Inspector Chrome extension support policy auditing, attributed reporting, three-pass meta-evaluation, text cleanup, and quality improvement. Chats, search, conversation references, and native exports keep the work accessible.

## Included in the MVP

| Capability | Use |
| --- | --- |
| Policy Auditing | Extract claims, evidence, source locations, and their relationships. |
| Policy Reporting | Produce an attributed executive synthesis with recommendations and limitations. |
| Meta-Evaluation | Apply the three Human Mark passes to examine classifications, governance flows, and proposed revisions. |
| Text Sanitization | Propose text and formatting cleanup with an explanation of changes. |
| Quality Improvement | Revise content using the extension's structure and behavior criteria. |
| Framework Knowledge | Retrieve passages from the EU AI Act, NIST AI RMF, NIST Generative AI Profile, OECD AI Principles, and The Human Mark. |
| Workspace defaults | Four model presets, nine prompts, and four skills for research and review. |
| Glossary | Search workspace concepts and attributed Human Mark terminology and grammar. |

Framework libraries are dated source snapshots. Model responses and suggested revisions remain subject to review.

## Desktop app

Studio can run in its own desktop window with its local backend managed automatically.
The first launch downloads Python and installs backend dependencies; subsequent launches
reuse that setup. Chats and settings are stored in the operating system's application data folder.

Build a Windows installer with `npm run desktop:win`, or build a macOS DMG on a Mac
with `npm run desktop:mac`. Build requirements and distribution instructions are in
the [desktop guide](desktop/README.md). Generated installers are placed in `desktop/dist/`.

## Run locally on Windows

Requirements: Node.js 22, Python 3.12, and `uv`. Run the following from the repository root in PowerShell:

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item .env.example .env
}
npm ci
uv sync --python 3.12 --no-dev --no-install-project
npm run start:dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The launcher starts the frontend and backend together; the backend runs in a hidden child window. Stop the launcher with Ctrl+C.

For a local server using a production frontend build:

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=8192'
npm run start:prod
```

Open [http://127.0.0.1:8081](http://127.0.0.1:8081). This command builds the frontend before starting the server. The heap setting applies to the Node build process.

Both launchers bind to the local machine and disable account sign-in. They are intended for local use. Shared deployments require a separate authentication and hosting configuration.

## Use the workspace

1. Configure an OpenAI-compatible provider or a local Ollama connection under Admin Settings → Connections.
2. Select an inference model in chat. For a bundled model preset, open its editor and assign a base model.
3. Attach relevant documents or Knowledge collections. Enable the desired gadget in the chat tool selector, or attach it to a model preset.
4. Request the task, inspect the result, and continue editing or discussing it. Use native chat and Note exports to retain or share the work.

No inference credentials or model weights are bundled. Hosted providers require their own credentials; local inference requires a running local model. Tools require a model capable of calling them.

Workspace defaults install automatically. Framework indexing runs in the background and may download the local embedding model on first setup. Later starts preserve installed entries, edits, and intentional deletions.

## Attribution and licenses

AI Inspector Studio is developed by Gyro Governance from Open WebUI v0.11.4. Open WebUI was created by Timothy Jaeryang Baek and is maintained by Open WebUI Inc. Its code remains subject to the [Open WebUI License](LICENSE), [license history](LICENSE_HISTORY), and [multi-license notice](LICENSE_NOTICE).

Original Studio software and documentation identified as Studio-authored are covered by the [Studio MIT notice](LICENSES/AI-INSPECTOR-STUDIO-MIT.txt). Ported AI Inspector material retains its [MIT notice](backend/open_webui/studio/data/gadgets/LICENSE). Human Mark documents retain their [CC BY-SA 4.0 notice](backend/open_webui/studio/data/THM-LICENSE.txt). Framework editions, sources, and reuse notices are recorded in the [framework manifest](backend/open_webui/studio/data/frameworks-v1.json).

Desktop packaging is adapted from [Open WebUI Desktop](https://github.com/open-webui/desktop)
and retains its [AGPL-3.0 license](desktop/LICENSE). Desktop source attribution and changes
are recorded in the [desktop upstream notice](desktop/UPSTREAM.md).

The upstream Open WebUI README and documentation remain available in the [upstream repository](https://github.com/open-webui/open-webui/tree/v0.11.4). Upstream distribution images install Open WebUI; they do not include this checkout's Studio additions.
