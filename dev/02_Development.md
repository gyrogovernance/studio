# Development

## Repository and base

The code lives at `gyrogovernance/studio`, checked out locally at `F:\Development\studio`. Documents sit in `dev/`, prompt drafts in `prompts/`. The base is a self-hosted Open WebUI deployment, installed through pip or Docker, extended with the Studio's own prompts, skills, tools, and record handling. The installed release number, enabled modules, and configuration are recorded here on first setup:

- Release: (to be recorded)
- Install path on the build machine: (to be recorded)
- Enabled modules: (to be recorded)

## Reference checkouts

`external/` holds read-only shallow checkouts of the Open WebUI repositories, kept for reading documentation and porting code. The directory carries the upstream `.git` folders and stays out of this repository's version control through `.gitignore`.

| Checkout | What it holds |
| --- | --- |
| `external/open-webui` | The platform source, including backend, frontend, and bundled guides |
| `external/open-webui-docs` | The full documentation source behind docs.openwebui.com |
| `external/open-webui-desktop` | The native desktop application (Electron, AGPL-3.0) |
| `external/open-webui-oikb` | Knowledge Base sync for 46 source connectors (MIT, requires Open WebUI 0.9.6+) |
| `external/open-webui-mcpo` | MCP-to-OpenAPI proxy for external tool servers (MIT) |

## Studio sections and their jobs

The Open WebUI interface exposes Chat, Search, Notes, and Workspace (Models, Knowledge, Prompts, Skills, Tools). Each section carries a defined part of the workflow:

| Section | Studio role |
| --- | --- |
| Chat | Working conversation with a chosen model and attached material |
| Search | Retrieval across notes, records, and knowledge collections |
| Notes | Project drafts and the durable working record |
| Workspace > Models | Task presets: system prompt, domain, task, knowledge binding |
| Workspace > Knowledge | Versioned THM Grammar, THM, and Terms reference documents |
| Workspace > Prompts | Reusable task templates: claim map, synthesis, assessment passes |
| Workspace > Skills | Multi-step workflows, including the three-pass assessment |
| Workspace > Tools | Structured operations: create record, fetch findings, export |

## Components ported from AI Inspector

The extension source lives in `gyrogovernance/apps` (MIT). These components move into the Studio:

| Component | Source | Studio use |
| --- | --- | --- |
| Three-pass assessment prompts | `src/lib/prompts.ts` (`generateMetaEvaluationPass1/2/3`) | Skill workflow for the assessment |
| THM document loader | `src/lib/thm-docs-loader.ts` | Pattern for binding versioned THM documents to a call |
| Task prompts | `src/lib/prompts.ts` (`POLICY_AUDIT_TASK`, `POLICY_REPORT_TASK`, `SANITIZE_TASK`, `IMMUNITY_BOOST_TASK`) | Prompt templates |
| Domain and challenge types | `src/lib/challenges.ts`, `src/types/index.ts` (`ChallengeType`: formal, normative, procedural, strategic, epistemic, custom) | Domain field on presets |
| Session and insight types, including the contribution block | `src/types/index.ts` (`Session`, `GovernanceInsight`) | Base for the session record |
| Import and export | `src/lib/export.ts`, `src/lib/import.ts` | JSON and ZIP record exchange |

Two component groups stay in the extension. The clipboard transcript parsing (`src/lib/parsing.ts`) exists because the extension reads chats hosted elsewhere, and the Studio runs chat in-house. The GyroDiagnostics metric suite (RapidTest, analyst scoring, indices) enters as a later module once the assessment session model is stable.

## Structured output

The extension asks for prose because the user pastes prompts into an external chat and pastes answers back. The Studio calls models server-side, so every pass returns JSON in the schema family of `prompts/thm-reviewer-v0.1.txt` (`schema_version: studio-thm-assessment-0.1`), with category statuses, findings carrying evidence quotes and locators, coverage, and task-quality notes.

Work required:

1. Convert the pass 1 and pass 2 drafts (`prompts/thm-pass-1-detection-v0.1.txt`, `prompts/thm-pass-2-processing-v0.1.txt`) from prose output to JSON output matching the same schema family.
2. Validate each response against the schema, record parse failures in the session, and retry a failed parse once with the validation error attached.
3. Render the JSON in the interface; prose reports are generated from stored JSON at export time.

## Implementation stages

**Stage 1, one complete session.** Record the Open WebUI release and back up configuration. Connect one model provider with a spending cap. Run a real governance document through chat, the three assessment passes, human review, and export. Repeat with a second document from a different domain to confirm the workflow carries across material types. Record where the data sits: the instance database, the inference provider, the export file.

**Stage 2, object mapping.** Map the record needs from [03_Data](03_Data.md) onto built-in objects first: Notes, folders, Knowledge collections, Prompts, Skills, Tools, and the artifact storage API. A separate service enters only for state the built-ins fail to preserve, such as project access, source links, pass state, and human revisions.

**Stage 3, versioned task definitions.** Each task carries a name, purpose, applicable material, instructions, output schema, and source references, with domain and activity as separate fields (`normative` is a domain; `claim and evidence map` is an activity). Tasks save through the normal prompt and skill objects, with the THM core left intact.

**Stage 4, evidence and review persistence.** The material snapshot stays immutable per assessment run. Pass prompts, pass outputs, model configuration, coverage, and human edits persist beside each other. Accepting a suggested treatment shows the proposed change for the user to apply to the draft; the source conversation stays as it was.

## Verification checklist

- Installed Open WebUI release recorded, and the feature list checked against that release (Notes, Skills, artifact storage).
- Configuration backed up before edits.
- One provider connected, restricted model list, spending cap set.
- One full session exported and re-imported with every field intact.
- Open WebUI branding visible in the interface; per-component license file present.
- Repository published with MIT license and the port list above credited.

## Repository layout

```
studio/
  dev/           product, development, data, and notes documents
  prompts/       versioned task and assessment prompts (JSON schemas)
  external/      read-only Open WebUI checkouts, gitignored
  skills/        workflow definitions for the three-pass assessment
  tools/         record creation, findings retrieval, export
  tests/         schema validation and export round-trip tests
```
