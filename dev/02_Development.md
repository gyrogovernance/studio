# Development

Repository: [gyrogovernance/studio](https://github.com/gyrogovernance/studio). Local path: `F:\Development\studio`. Documents in `dev/`, prompt drafts in `prompts/`, upstream checkouts in `external/` (gitignored).

Installed Open WebUI release, install path, and enabled modules are recorded here on first setup:

- Release: (to be recorded)
- Install path: (to be recorded)
- Enabled modules: (to be recorded)

Documentation read for this plan: Open WebUI feature docs under `external/open-webui-docs/docs/features/` (Notes, Models, Knowledge, Prompts, Skills, Functions, Channels, Administration), dated against the shallow checkout of 2026-10-09.

## Upstream checkouts

| Path | Contents |
| --- | --- |
| `external/open-webui` | Platform source |
| `external/open-webui-docs` | Documentation source for [docs.openwebui.com](https://docs.openwebui.com) |
| `external/open-webui-desktop` | Desktop app (Electron, AGPL-3.0) |
| `external/open-webui-oikb` | Knowledge Base sync from 46 connectors (MIT; requires Open WebUI 0.9.6+) |
| `external/open-webui-mcpo` | MCP-to-OpenAPI proxy (MIT) |

## How Studio sits on Open WebUI

Open WebUI is already a research workspace: Chat, Notes, Knowledge, Models, Prompts, Skills, Tools, plus Functions (Actions, Filters, Pipes), Channels, Automations, and evaluation. Studio's job is to configure that surface for governance work and to add what the platform does not provide: structured review output, human adjudication of findings, and an exportable session record with consent fields.

### Recommended object map

| Studio need | Open WebUI object | Why this fit |
| --- | --- | --- |
| Living deliverable (policy draft, brief, procedure) | **Notes** | Persistent document outside a single chat; full content injected when attached; chat sidebar with rewrite in place (`view_note` / `replace_note_content`); export to `.md` / `.pdf`; undo/redo. Prefer Notes over chat history as the primary artifact. |
| Source corpora (large sets) | **Knowledge** (Focused Retrieval) | RAG over collections that would overflow context. Attach with `#` or bind to a model. |
| Short framework references (Human Mark Grammar, core, Terms) | **Knowledge** (Full Context) or Notes | Short docs that must appear word-for-word. Full Context on a Knowledge item, or a pinned Note attached to the review chat. |
| Sync from GitHub / Confluence / drives | **oikb** | Incremental sync into a Knowledge Base; keep THM docs and public policy packs current. |
| Research persona (policy analyst) | **Model preset** | Base model + system prompt + bound Knowledge + Skills. One selectable agent in the model picker. |
| Review persona (Human Mark reviewer) | **Model preset** | Separate preset with review system prompt and Human Mark Knowledge bound. |
| One-shot tasks (claim map, synthesis, single pass) | **Prompts** (`/` commands) | Slash commands with typed input variables (domain, activity, material type) and version history. |
| Multi-step review procedure | **Skills** (`$` mention or model-bound) | Markdown instruction set; lazy-loaded via `view_skill` under native function calling. Three-pass Human Mark workflow lives here. |
| Button on a message: run review / open findings | **Action Function** | Admin-managed toolbar button under a message; receives message and chat context; can emit events and update message content. Entry point for "Review with Human Mark". |
| Validate or reshape model JSON on the way out | **Filter Function** (outlet) | Parse assessment JSON, record parse failures, optionally retry. Admin-only Python on the server. |
| Orchestrate three passes as one selectable "model" | **Pipe Function** (optional) | Custom pathway that runs Detection → Processing → Treatment and returns the combined record. Use when slash prompts plus a Skill feel too loose. |
| Team deliberation | **Channels** (later) | Shared timeline with `@model` tags; access control by group. |
| Usage and cost | **Admin analytics** | Message volume, tokens, cost. |
| Thumbs / arena | **Admin evaluation** | Keep separate from Human Mark adjudication. Ratings and Elo leaderboards are optional product features, not the Studio review model. |

### Notes versus Knowledge

Notes inject full text and suit the draft the operator is writing. Knowledge retrieves passages and suits large source libraries. Governance sessions typically need both: a Note for the working product, a Knowledge Base for background material, and Full Context (or a Note) for the Human Mark reference documents.

### Native function calling

Model-attached Knowledge and Skills work cleanly when native function calling and builtin tools are enabled. Note-attached chats force note tools even when a model is otherwise locked down. Record this requirement in the install notes for the review presets.

## Port from AI Inspector

Source: `gyrogovernance/apps` (MIT).

| Component | Path | Destination in Studio |
| --- | --- | --- |
| Three-pass review prompts | `src/lib/prompts.ts` (`generateMetaEvaluationPass1/2/3`) | Skill content + optional Pipe |
| Document loader pattern | `src/lib/thm-docs-loader.ts` | Knowledge Base (Full Context) or pinned Notes |
| Task prompts | `POLICY_AUDIT_TASK`, `POLICY_REPORT_TASK`, and related | Workspace Prompts with `/` commands |
| Domain types | `ChallengeType` in `src/types/index.ts` | Prompt input variables and Model tags |
| Session / insight types, contribution block | `Session`, `GovernanceInsight` | Session export schema ([03_Data](03_Data.md)) |
| Import / export | `src/lib/export.ts`, `src/lib/import.ts` | Export Tool or Action; JSON / ZIP |

Keep in the extension for now: clipboard transcript parsing (the extension still serves chats hosted elsewhere); GyroDiagnostics suite (later module once the session model is stable).

## Output format

Review passes return JSON (`schema_version: studio-thm-assessment-0.1`; see `prompts/thm-reviewer-v0.1.txt`): category statuses, findings with quotes and locators, coverage, task-quality notes.

Work still required: convert pass 1 and pass 2 drafts to the same schema; validate responses (Filter or Tool); retry once on parse failure; render findings in the UI; generate prose reports from stored JSON at export time.

## Implementation stages

**Stage 1. Configure the workspace.** Record the Open WebUI release. Create Knowledge Bases for Human Mark documents (Full Context). Create Prompt slash commands for claim map, synthesis, and each review pass. Create a Skill for the three-pass procedure. Create two Model presets (research and review) with Knowledge and Skills bound. Run one public governance document through Note + chat + review prompts + manual adjudication recorded in the Note or a second Note. Export by hand. Confirm destinations: instance database, inference provider, export file.

**Stage 2. Interactive review.** Add an Action Function button on assistant messages to run the review Skill or Pipe and attach structured findings. Add an outlet Filter to validate JSON. Persist machine finding and human decision as linked records (artifact storage or Notes + export schema).

**Stage 3. Session record and consent.** Implement the session schema from [03_Data](03_Data.md), including contribution choices and preview-before-share. Prefer built-in objects; add a small Tool or service only where Notes, Knowledge, and artifact storage omit required fields.

**Stage 4. Pilot readiness.** Spending cap, model list restriction, consent notice, oikb sync for public source packs if useful. Invite five participants per the pilot plan in [03_Data](03_Data.md).

## Verification

- Feature list checked against the installed release (Notes chat sidebar, Skills, Actions, Full Context Knowledge)
- Configuration backed up before edits
- Provider connected; model list restricted; spending cap set
- Native function calling enabled for review presets
- One full session exported and re-imported with fields intact
- Open WebUI branding visible; per-component license file present
- Port list credited in the repository README

## Layout

```
studio/
  dev/
  prompts/
  external/      # gitignored
  skills/        # planned: Markdown skills for import
  tools/         # planned: Tools / Functions source
  tests/         # planned: schema and export tests
```
