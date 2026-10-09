# Notes

Internal plan, log, issues, and ideas. Public product facts: [01_Product](01_Product.md). Code: [02_Development](02_Development.md). Data: [03_Data](03_Data.md).

## Plan

| ID | Outcome |
| --- | --- |
| M1 | End-to-end session: chat, three review passes, adjudication, export |
| M2 | JSON pipeline for all passes; schema validation; one recorded retry |
| M3 | Adjudication UI with persistence per finding |
| M4 | Repository published (MIT, ports credited, prompts versioned) |
| M5 | Pilot: five participants, two sessions each, public sources |
| M6 | Grant application for pilot token budget |
| M7 | Dataset v0 from contributed records with complete consent fields |

## Log

| Date | Entry |
| --- | --- |
| 2026-10-09 | Product direction: chat workspace; structured review tasks; human adjudication; exportable session record. Model choice by task. |
| 2026-10-09 | Inspected `gyrogovernance/apps` (MIT) and `gyrogovernance/tools` (CC BY-SA 4.0). Port candidates identified. |
| 2026-10-09 | Open WebUI sections confirmed: Chat, Search, Notes, Workspace (Models, Knowledge, Prompts, Skills, Tools). |
| 2026-10-09 | `gyrogovernance/studio` created. Docs in `dev/`, prompts in `prompts/`, five Open WebUI shallow clones in `external/`. |
| 2026-10-09 | Human Mark retains published AI Safety & Alignment identity. |
| 2026-10-09 | Docs rewritten as formal specs (product, development, data, notes). |

## Issues

| Issue | Status | Action |
| --- | --- | --- |
| Product name | Open | Candidates: Collective Superintelligence Studio, Gyro Governance Studio, Studio. Collisions: Collate / EQTY / Rigour "Governance Studio"; "Meta" reads as Meta Platforms. Confirm GitHub handle and domain before README. |
| Open WebUI install path | Open | Locate install; record release; verify feature list against [02_Development](02_Development.md). |
| Pass 1-2 prose output | Open | Convert to `studio-thm-assessment-0.1` JSON before M1. |
| Open WebUI mark retention | Solved | Branding kept; license file and README credits. |
| Assessment prompt headers | Decided | Keep framework wording; domain comes from task fields. |
| Pilot cold start | Open | Invite-only five; public sources; M5. |
| Sensitive drafts | Open | Consent at first use; three destinations named ([03_Data](03_Data.md)). |
| Token overrun | Open | Cap and allowance before invites ([03_Data](03_Data.md)). |
| AI Inspector relationship | Open | Extension remains clipboard companion for external chats. Link decision before M4. |

## Ideas

| Idea | Note |
| --- | --- |
| Grant targets (M6) | [Sentient](https://sentient.foundation/grants); [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2); [NLnet](https://nlnet.nl/funding.html) |
| Access policy | Free tier on OpenRouter free endpoints; larger allowance for completed reviews |
| Review queue | Artifact storage API (personal / shared scopes) as backend |
| Team review | Channels for shared sessions; Automations for scheduled re-review |
| Dataset packaging | Session → JSONL with consent; packaging script and data card in-repo before sale talks |
| Specialist workplace | Paid review tasks after M5 |
| Metascience session type | Research-funding / science-policy workflow for policy audience |

## Paths

| Path | Contents |
| --- | --- |
| `prompts/` | v0.1 drafts (research preset, reviewer JSON schema, three pass prompts) |
| `f:\Development\basil\OSS\notes\1` | Archived founding discussion |
