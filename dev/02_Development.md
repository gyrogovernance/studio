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

## Audience pack: European AI governance (v0)

Preload public materials and reusable workflows so a Brussels-style policy team can open Studio and work without assembling a library from scratch. The first pack is tuned to organisations like [Arq Foundation](https://arq.foundation/): philanthropically funded, AI-native, full-stack researchers who own a topic from analysis to stakeholder engagement, plus a Builder-in-Residence brief for internal tooling and knowledge management ([About](https://arq.foundation/about); [Preparing Europe for Transformative AI](https://arq.foundation/research/preparing-europe-for-transformative-ai)).

Arq's published agenda maps to five Knowledge collections and matching Skills:

| Arq focus | Knowledge collection (public sources) | Skill / Prompt set |
| --- | --- | --- |
| AI Infrastructure | Cloud and AI Development Act materials; AI Gigafactories / compute policy briefings; ASML and upstream supply-chain public reports | `/infra-brief`, skill: compute leverage memo |
| Middle-Power Coordination | Middle-power and alliance public briefings; OECD / G7 AI statements | `/coalition-memo`, skill: multi-capital talking points |
| AI Resilience R&D | Interpretability and defensive-tech public papers; AISI-style evaluation summaries where published | `/resilience-scan`, skill: differential-tech shortlist |
| Breakthrough Innovations / metascience | Heitor report; EU R&I programme docs; UK Metascience Unit materials; ARPA / FRO design notes in the public domain | `/metascience-note`, skill: funding-process experiment design |
| Statecraft | Beta.gouv and AISI public case notes; state-capacity reform literature that is free to redistribute | `/statecraft-brief`, skill: institutional design one-pager |

### Knowledge Bases to create first

Prefer official and clearly redistributable sources. Sync with [oikb](https://github.com/open-webui/oikb) where a stable URL or Git mirror exists; otherwise upload once and record the source URL and retrieval date in the Knowledge description.

| Knowledge Base | Mode | Sources (examples) |
| --- | --- | --- |
| `eu-ai-act` | Focused Retrieval (large) | Consolidated AI Act: [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng) (current consolidated text on EUR-Lex). Commission AI Act pages on [Shaping Europe's digital future](https://digital-strategy.ec.europa.eu/). |
| `gpai-code` | Full Context or Focused | [GPAI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai) chapters (Transparency, Copyright, Safety and Security) and Commission guidelines on GPAI concepts. |
| `eu-competitiveness-stack` | Focused Retrieval | Public Draghi, Letta, and Heitor report PDFs (Commission / Council publications). |
| `thm-reference` | Full Context | Human Mark Grammar, core, and Terms from `gyrogovernance/tools` (CC BY-SA 4.0; attribution required). |
| `arq-public` | Full Context | Arq essays that are free to mirror or link: flagship essay and consultation responses such as the Cloud and AI Development Act fixes. Prefer link + citation when mirroring is unclear. |

Add later packs (US NIST AI RMF, Council of Europe AI Convention, OECD AI Principles) as separate Knowledge Bases so European operators can toggle them without mixing jurisdictions.

### Skills and Prompts to ship with the pack

| Name | Type | Job |
| --- | --- | --- |
| `/claims-map` | Prompt | Claim and evidence extraction with locators (from AI Inspector Policy Auditing). |
| `/exec-synth` | Prompt | Attributed executive synthesis (from AI Inspector Policy Reporting). |
| `/thm-pass1` … `/thm-pass3` | Prompts | Human Mark detection, flow mapping, treatment (JSON). |
| `$thm-review` | Skill | Three-pass procedure with coverage and adjudication checklist. |
| `/consultation-response` | Prompt | Structured response to an EU public consultation (position, evidence, amendments, risks). |
| `/stakeholder-memo` | Prompt | One-page memo for a named institution (Commission DG, Member State, middle-power capital). |
| `/metascience-experiment` | Prompt | Design a funding-process experiment (peer review, randomisation, metrics) in Heitor / UK Metascience style. |
| `$policy-hygiene` | Skill | Source attribution, assumption surfacing, and Direct/Indirect authority checks before external send. |

### Model presets in the pack

| Preset | Bound Knowledge | Bound Skills / Prompts |
| --- | --- | --- |
| Policy Analyst (EU) | `eu-ai-act`, `eu-competitiveness-stack`, optional `gpai-code` | `/claims-map`, `/exec-synth`, `/consultation-response`, `$policy-hygiene` |
| Metascience Researcher | Heitor / R&I docs; UK Metascience materials | `/metascience-experiment`, `/claims-map` |
| Human Mark Reviewer | `thm-reference` | `$thm-review`, `/thm-pass1`–`3` |
| Forward-Deployed Brief | Light EU stack + current Note | `/stakeholder-memo`, `/exec-synth` |

### Note templates

Seed Notes (or `/notes/new` query params) for recurring deliverables: consultation response, stakeholder memo, metascience experiment design, infrastructure brief. Operators duplicate a template Note, attach the relevant Knowledge, and open the note's chat sidebar.

This pack is the concrete answer to Arq's Builder-in-Residence need: internal tooling, knowledge management, and AI-native workflows pre-wired for their five policy areas, with Human Mark review available on the same surface.

## Implementation stages

**Stage 1. Configure the workspace and load the EU pack.** Record the Open WebUI release. Create the Knowledge Bases above (start with `eu-ai-act`, `thm-reference`, and one competitiveness PDF). Create the Prompt slash commands and the `$thm-review` Skill. Create the Policy Analyst and Human Mark Reviewer Model presets. Run one public document (for example an Arq essay or a short AI Act article set) through a Note + chat + review + manual adjudication. Export by hand. Confirm destinations: instance database, inference provider, export file.

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
