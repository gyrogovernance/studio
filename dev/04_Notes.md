# Notes

Internal plan, log, open issues, and ideas for Studio. Public product facts live in [01_Product](01_Product.md). Code and Open WebUI integration live in [02_Development](02_Development.md). Schemas and pilot measures live in [03_Data](03_Data.md). How to run and what to tell another assistant: [05_Start](05_Start.md).

## Plan

| ID | Outcome |
| --- | --- |
| M1 | Workspace + EU audience pack: Knowledge (AI Act, THM), Prompts, Skills, two Model presets; one end-to-end session on a Note |
| M2 | Action button and JSON validation (Filter); findings rendered beside source passages |
| M3 | Adjudication UI with persistence per finding |
| M4 | Session export and consent preview; repository published (MIT, ports credited) |
| M5 | Pilot: five participants, two sessions each, public sources |
| M6 | Grant application for the pilot token budget |
| M7 | Dataset v0 from contributed records with complete consent fields |

## Log

| Date | Entry |
| --- | --- |
| 2026-10-09 | Direction set: chat workspace, structured review tasks, human adjudication, exportable session record. |
| 2026-10-09 | Inspected `gyrogovernance/apps` (MIT) and `gyrogovernance/tools` (CC BY-SA 4.0). Port candidates listed. |
| 2026-10-09 | Created `gyrogovernance/studio`. Docs in `dev/`, prompts in `prompts/`, five Open WebUI shallow clones in `external/`. |
| 2026-10-09 | Human Mark keeps its published AI Safety & Alignment identity. |
| 2026-10-09 | Read Open WebUI docs (Notes, Models, Knowledge, Prompts, Skills, Actions, Filters, Pipes, Channels). Rewrote product pitch as prose; rewrote development plan around Notes as the living deliverable, Model presets as personas, Prompts as slash commands, Skills for multi-step review, Actions as the review button. |
| 2026-10-09 | Mapped Arq Foundation agenda (five policy areas; full-stack / forward-deployed / AI-native ops; Builder in Residence) to an EU audience pack: EUR-Lex AI Act, GPAI Code, Draghi/Letta/Heitor stack, THM refs, consultation and metascience prompts. |
| 2026-10-09 | Added 05_Start.md: SvelteKit+FastAPI stack, Vite live reload, do not fork desktop first, hide features via RBAC, pasteable assistant brief. |

## Issues

| Issue | Status | Action |
| --- | --- | --- |
| Product name | Open | Candidates: Collective Superintelligence Studio, Gyro Governance Studio, Studio. Name collisions: Collate, EQTY Lab, and Rigour use "Governance Studio"; "Meta" reads as Meta Platforms. Confirm GitHub handle and domain before the public README. |
| Open WebUI install path | Open | Locate the install, record the release, verify Notes / Skills / Actions / Full Context Knowledge against that release. |
| Pass 1-2 prose output | Open | Convert to `studio-thm-assessment-0.1` JSON before M1. |
| Open WebUI mark retention | Solved | Keep branding; license file and README credits. |
| Assessment prompt headers | Decided | Keep framework wording; domain comes from task fields. |
| Pilot cold start | Open | Invite-only five; public sources; M5. |
| Sensitive drafts | Open | Consent at first use; name the three data destinations ([03_Data](03_Data.md)). |
| Token overrun | Open | Cap and allowance before invites ([03_Data](03_Data.md)). |
| AI Inspector relationship | Open | Extension remains the clipboard companion for external chats. Decide whether it links to Studio before M4. |
| Native function calling | Open | Required for model-attached Knowledge and Skills and for note tools. Document in install notes for review presets. |

## Ideas

| Idea | Note |
| --- | --- |
| Grant targets (M6) | [Sentient](https://sentient.foundation/grants); [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2); [NLnet](https://nlnet.nl/funding.html) |
| Access policy | Free tier on OpenRouter free endpoints; larger allowance when a session completes review |
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
