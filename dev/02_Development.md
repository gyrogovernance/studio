# Development

## Repository

| Item | Value |
| --- | --- |
| Remote | `gyrogovernance/studio` |
| Local | `F:\Development\studio` |
| Documents | `dev/` |
| Prompt drafts | `prompts/` |
| Upstream checkouts | `external/` (gitignored) |
| License (Studio code) | MIT on publication |

Installed Open WebUI release, install path, and enabled modules: to be recorded on first setup.

## Upstream checkouts

| Path | Contents |
| --- | --- |
| `external/open-webui` | Platform source |
| `external/open-webui-docs` | Documentation source (docs.openwebui.com) |
| `external/open-webui-desktop` | Desktop app (Electron, AGPL-3.0) |
| `external/open-webui-oikb` | Knowledge Base sync, 46 connectors (MIT; Open WebUI 0.9.6+) |
| `external/open-webui-mcpo` | MCP-to-OpenAPI proxy (MIT) |

## Interface objects

| Open WebUI section | Studio use |
| --- | --- |
| Chat | Working conversation, attached material |
| Search | Retrieval across notes and records |
| Notes | Project drafts, durable working record |
| Models | Task presets (system prompt, domain, knowledge binding) |
| Knowledge | Versioned Human Mark Grammar, core, and Terms documents |
| Prompts | Claim map, synthesis, review-pass templates |
| Skills | Multi-step review workflows |
| Tools | Record create, findings fetch, export |

## Port from AI Inspector

Source: `gyrogovernance/apps` (MIT).

| Component | Path | Destination |
| --- | --- | --- |
| Three-pass review prompts | `src/lib/prompts.ts` (`generateMetaEvaluationPass1/2/3`) | Skill |
| Document loader pattern | `src/lib/thm-docs-loader.ts` | Knowledge binding |
| Task prompts | `POLICY_AUDIT_TASK`, `POLICY_REPORT_TASK`, `SANITIZE_TASK`, `IMMUNITY_BOOST_TASK` | Prompts |
| Domain types | `ChallengeType` in `src/types/index.ts` | Preset domain field |
| Session / insight types, contribution block | `Session`, `GovernanceInsight` | Session record base |
| Import / export | `src/lib/export.ts`, `src/lib/import.ts` | JSON / ZIP exchange |

Retained in the extension only: clipboard transcript parsing (`src/lib/parsing.ts`); GyroDiagnostics suite (later module).

## Output format

All review passes return JSON (`schema_version: studio-thm-assessment-0.1`, see `prompts/thm-reviewer-v0.1.txt`). Fields: category statuses, findings with quotes and locators, coverage, task-quality notes.

| Step | Work |
| --- | --- |
| 1 | Convert pass 1 and pass 2 drafts to the same JSON schema |
| 2 | Validate responses; on failure, record error and retry once |
| 3 | Render JSON in UI; generate prose reports from stored JSON at export |

## Stages

| Stage | Deliverable |
| --- | --- |
| 1 | One complete session: chat, three review passes, adjudication, export. Second domain document run. Destinations recorded (instance DB, inference provider, export file). |
| 2 | Map session fields ([03_Data](03_Data.md)) onto Notes, Knowledge, Prompts, Skills, Tools, artifact storage. Add a separate service only for state those objects omit. |
| 3 | Versioned task definitions: name, purpose, material, instructions, output schema, source refs. Domain and activity as separate fields. |
| 4 | Immutable material snapshot per run; pass outputs and human edits persisted; accepted treatments applied by operator to the draft. |

## Verification

- Release number and feature list checked against installed Open WebUI
- Configuration backed up before edits
- Provider connected; model list restricted; spending cap set
- Export / re-import round-trip preserves all fields
- Open WebUI branding visible; per-component license file present
- Port list credited in repository README

## Layout

```
studio/
  dev/
  prompts/
  external/      # gitignored
  skills/        # planned
  tools/         # planned
  tests/         # planned
```
