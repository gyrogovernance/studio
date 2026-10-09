# Notes

Internal decisions, audit evidence, issues, and ideas. The stakeholder brief is [Product](01_Product.md), operating instructions and architecture are in [Development](02_Development.md), and current records and port provenance are in [Data](03_Data.md).

## Current decisions

- The MVP uses native chats, Notes, Knowledge, search, conversation references, and exports for persistence and continuity. A separate finding-decision database and custom session export are not needed.
- Five gadgets are ported as native Tools. Their task text comes from the extension, with documented execution adaptations. GyroDiagnostics, Rapid Test, fixed comparison suites, and diagnostic imports are excluded.
- Evaluations is a separate deferred feature. Arena model comparison is excluded.
- Local launchers run without account sign-in, on the loopback interface. Shared hosting is a separate configuration.
- Public and formal documents contain current product or technical facts. Internal reasoning, unimplemented ideas, audit history, and assistant handoff material belong here.
- Product, Development, Data, and Notes are the maintained documents. Startup instructions are part of Development; gadget provenance is part of Data.

## Audit evidence and limits

### Desktop packaging, 2026-10-09

- Added tracked `desktop/` packaging adapted from Open WebUI Desktop v0.0.20. The private reference checkout remains under `dev/external/`.
- Built Windows x64 NSIS installer `ai-inspector-studio-0.1.0-x64-setup.exe`. The installer is unsigned; no release was published.
- Verified managed Python setup, hashed dependency installation, the bundled Studio wheel, accountless first startup, five native gadget Tools, rendered workspace, and backend shutdown in an isolated `.runtime/desktop-smoke/` profile.
- Fresh installation exposed an inherited onboarding gate when no internal profile existed. `/api/config` now offers onboarding only when authentication is enabled. Authenticated deployments retain their setup path.
- Verified the assembled package contains the tested launcher files. Backend wheel and source archive checks exclude private `dev/` files, local environment files, existing databases, and local credential values.
- macOS packaging targets Apple Silicon, with an arm64 runtime and macOS 14 minimum. An Intel Mac is a possible cross-build host; it does not set the end-product runtime target. The macOS build and notarization have not been executed here. A manual macOS Actions job is included.
- First launch requires network access to install Python and backend dependencies. Model weights and inference credentials remain separate. Later starts reuse the runtime, and installer upgrades preserve application data.
- Desktop builds apply an 8 GB Node heap to the frontend build automatically. The standard 4 GB attempt exhausted memory. This is a build setting, not a desktop runtime reservation.
- Dependency auditing reported eight moderate advisories in the desktop build-tool dependency tree. The packaged Electron application archive has no installed Node runtime dependencies. Build tools still need review before a public release.
- Automatic update feeds and platform signing credentials are not configured. Backend updates are carried in Studio installers rather than upstream PyPI updates.

The 2026-10-09 frontend build completed with an 8 GB Node heap after the default-heap attempt exhausted memory during chunk rendering. Studio backend Python compilation and the Git whitespace check passed. The full Svelte check reported 6,999 errors and 198 warnings across 344 files. A clean run against the same upstream baseline was not recorded, so the entire diagnostic count cannot be attributed to upstream with certainty.

The later attempted targeted check filtered on the word `studio`, which also appears in every workspace path, and stopped after the first 80 matches. The subsequent path filter used slash-separated paths while the emitted diagnostics used Windows backslashes. Those checks do not establish that every modified Studio file is free of type diagnostics.

One development snapshot showed Vite at approximately 824 MB working set and 1.2 GB private memory, and a Python worker at approximately 763 MB working set and 1.5 GB private memory. The Python worker was an Uvicorn child; attributing all of its memory to indexing was not established. A production runtime comparison, browser memory profile, and repeated measurements were not completed. These snapshots do not establish or exclude a memory leak.

The five gadget adapters were installed locally. An end-to-end inference run for each tool has not been recorded. Reference retrieval verification was recorded separately in `.data/studio-framework-verification.json`. A successful frontend build does not verify provider behavior, source locator accuracy, or every export format's handling of tool results.

## Earlier milestone plan

This plan predates the current decision to rely on native persistence and exports. It is retained as history, not as an MVP completion checklist.

| ID | Outcome |
| --- | --- |
| M0 | Root source checkout from Open WebUI v0.11.4; local frontend and backend running |
| M1 | Studio title and source libraries configured; complete one research task using a Note and Knowledge |
| M2 | Port one AI Inspector review workflow and present evidence-linked findings |
| M3 | Record human decisions and export a review session |
| M4 | Pilot readiness, access controls, retention, and sharing terms |
| M5 | Pilot and evaluation with participating specialists |

## Log

| Date | Entry |
| --- | --- |
| 2026-10-09 | Consolidated README and the four maintained development documents. Product now describes implemented capabilities without custom finding-decision controls. Development contains setup and launch commands; Data contains the actual gadget result format and port provenance. Removed the separate startup and port-inventory documents after consolidation. |
| 2026-10-09 | Audited the MVP scope and disabled Open WebUI Arena Models. Startup clears inherited arena configuration; model comparison and public leaderboards remain outside the Studio MVP. |
| 2026-10-09 | Added five source-derived AI Inspector gadget Tools with native model execution, sequential three-pass meta-evaluation, completion metadata, and an installer that preserves edits and deletions. Added Workspace Glossary using attributed bundled references. GyroDiagnostics is excluded; Evaluations remains a separate deferred feature. Provider inference has not been exercised for this implementation. |
| 2026-10-09 | Inspected AI Inspector 1.2.0 source workflows, persistence, parsing, reporting, and exports. The initial inventory recommended policy tasks first. The later scope included all five non-diagnostic gadgets; maintained source mapping is now in Data. |
| 2026-10-09 | Bundled five framework Knowledge collections with eight source documents and a resumable native RAG importer. Added administrator install/status endpoints. Upstream documentation marks the separate Pipelines service as legacy and recommends Functions and Tools for new integrations. |
| 2026-10-09 | Added automatic workspace starter pack: four review and research model presets, nine prompts, and four skills. Presets require an inference model assignment. Native chats, Notes, Knowledge, search, references, and exports provide the MVP persistence and traceability layer. |
| 2026-10-09 | Imported Open WebUI v0.11.4 source into the repository root with upstream Git history and remote. This is the editable application checkout. |
| 2026-10-09 | Product scope set to a self-hosted research and document-review workspace. The user's work item is the primary unit of use; review records preserve evidence and human decisions. |
| 2026-10-09 | Replaced the installed-instance-first startup plan with a local SvelteKit and FastAPI development loop. |
| 2026-10-09 | Direction set: chat workspace, structured review tasks, human adjudication, exportable session record. |
| 2026-10-09 | Inspected `gyrogovernance/apps` (MIT) and `gyrogovernance/tools` (CC BY-SA 4.0). Port candidates listed. |
| 2026-10-09 | Created `gyrogovernance/studio`. Docs in `dev/`, prompts in `prompts/`, five Open WebUI shallow clones in `external/`. |
| 2026-10-09 | Human Mark keeps its published AI Safety & Alignment identity. |
| 2026-10-09 | Read Open WebUI docs (Notes, Models, Knowledge, Prompts, Skills, Actions, Filters, Pipes, Channels). Rewrote product pitch as prose; rewrote development plan around Notes as the living deliverable, Model presets as personas, Prompts as slash commands, Skills for multi-step review, Actions as the review button. |
| 2026-10-09 | Mapped Arq Foundation agenda (five policy areas; full-stack / forward-deployed / AI-native ops; Builder in Residence) to an EU audience pack: EUR-Lex AI Act, GPAI Code, Draghi/Letta/Heitor stack, THM refs, consultation and metascience prompts. |
| 2026-10-09 | Added a separate startup guide, subsequently consolidated into Development. |

## Issues

Status values: **Open** means not done or not established. **Solved** means closed. **Decided** means a scope choice was recorded. These issues are internal follow-up items, not additional MVP features.

| Issue | Status | Action |
| --- | --- | --- |
| Product name | Decided | AI Inspector Studio is the working name. Confirm namespace and domain before publication. |
| Local server startup | Solved | Combined development and local production commands are documented in Development. |
| Separate review schema | Decided | Native records and gadget execution results are sufficient for the MVP. |
| Open WebUI attribution | Open | Source notices and README attribution are retained. Assess applicable interface branding requirements before broader distribution; attribution alone does not establish compliance. |
| Assessment prompt headers | Decided | Keep framework wording; domain comes from task fields. |
| Pilot cold start | Open | Invite-only five; public sources; M5. |
| Sensitive drafts | Open | Consent at first use; name the three data destinations ([03_Data](03_Data.md)). |
| Token overrun | Open | Cap and allowance before invites ([03_Data](03_Data.md)). |
| AI Inspector gadget ports | Solved | Five native Tool adapters are bundled; source mapping is in Data. Provider inference verification remains an independent open item. |
| Native tool behavior | Open | Exercise each gadget with a configured model, including multi-pass completion and provider/context errors. |
| Provider setup guidance | Open | Add a clear in-app and onboarding path for entering a provider API key, keeping credentials local and out of project files. |
| Frontend diagnostics | Open | Establish a clean upstream comparison and identify errors introduced in modified files. |
| Runtime memory | Open | Measure the same workload in development and production, including browser memory. |
| Production launcher | Open | Confirm failed frontend builds stop startup; the current script does not explicitly check the build exit code before invoking Uvicorn. |
| Arena controls | Open | Startup disables and clears Arena configuration, but inherited administrator controls and config endpoints remain. Confirm product exposure if further removal is requested. |
| Community LLM Council | Open | Obtain the existing third-party implementation, inspect configuration, and retain its license before bundling. It is not currently shipped. |

## Ideas

These are unimplemented candidates. They do not define the current product or release requirements.

| Idea | Note |
| --- | --- |
| Grant targets (M6) | [Sentient](https://sentient.foundation/grants); [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2); [NLnet](https://nlnet.nl/funding.html) |
| oikb for source packs | Sync public policy corpora and Human Mark docs from GitHub into Knowledge |
| Review queue | Artifact storage API (personal and shared scopes) as the findings backend |
| Team review | Channels for shared sessions with `@model` tags |
| Dataset packaging | Session to JSONL with consent fields; packaging script and data card in-repo before sale talks |
| Specialist workplace | Paid review tasks after M5 |
| Metascience session type | Research-funding / science-policy workflow for the policy audience |
| EU audience pack (M1) | Preload AI Act + GPAI + competitiveness reports + THM; Skills for consultation, stakeholder memo, metascience experiment |
| Later jurisdiction packs | NIST AI RMF; Council of Europe AI Convention; OECD AI Principles as toggleable Knowledge Bases |
| Arq Builder pitch | Studio as the concrete deliverable for internal tooling / knowledge management / AI-native workflows |

## Paths

| Path | Contents |
| --- | --- |
| `prompts/` | v0.1 drafts: research preset, reviewer JSON schema, three pass prompts |
| `f:\Development\basil\OSS\notes\1` | Archived founding discussion |
| `external/open-webui-docs/docs/features/` | Local copy of Open WebUI feature documentation |

## Extension investigation reference

Maintained prompt and result provenance is in Data. The broader inventory is retained here for future source comparison:

| Source area in `F:\Development\apps` | Finding and disposition |
| --- | --- |
| `src/lib/gadgets.ts`, `src/components/apps/GadgetsApp/GadgetAccordion.tsx` | Original gadget definitions and copy/paste flow. Five non-diagnostic task prompts are now run through native Studio Tools. |
| `src/lib/storage.ts`, `src/types/index.ts`, `src/components/Notebook.tsx` | Chrome storage, sessions, drafts, and insight records. Studio uses native server records. |
| `src/components/shared/AnalystEvaluationForm.tsx`, `src/lib/parsing.ts`, `src/lib/validation.ts` | Pasted diagnostic JSON and fixed session validation. Not ported. |
| `src/lib/report-generator.ts` | Diagnostic metrics, empty gadget transcripts, and public/CC0 contribution metadata. Not used for Studio results. |
| `src/components/apps/InsightsApp/InsightsLibrary.tsx`, `src/lib/export.ts`, `src/lib/export-utils.ts` | Search, tags, favorites, notes, and export patterns. Native Studio features supply the current equivalents. |
| `src/components/apps/ChallengesApp/CustomBuilder.tsx`, `src/lib/challenges.ts` | Custom task fields and SDG templates are possible future content sources; fixed diagnostic tasks are excluded. |
| `src/components/apps/ChallengesApp/PromptWorkshop.tsx` | Local heuristic authoring scores and suggestions; not ported. |
| `src/lib/calculations.ts`, `src/lib/score-aggregator.ts`, `src/lib/metric-definitions.ts` | GyroDiagnostics calculations; excluded. |
| `src/components/SynthesisSection.tsx`, `src/components/AnalystSection.tsx`, `src/components/apps/JournalApp/` | Two-run, six-turn synthesis and analyst protocol; excluded. |
| `src/components/apps/InsightsApp/ModelTracker.tsx`, `SuiteReports.tsx` | Diagnostic suite aggregation and dashboards; excluded. |
| `src/lib/import.ts`, `src/lib/detector-export.ts` | Diagnostic-specific import/export adapters; excluded. |

The abandoned common review-envelope proposal used target, task, coverage, findings, decisions, and contribution sections, with accept/amend/reject/defer/add decisions. It has not been implemented and is not the current Studio result schema. The graphs and standalone decision controls that motivated it are not required by the MVP.
