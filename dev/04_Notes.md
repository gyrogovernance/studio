# Notes

Plan, log, open issues, and ideas for `gyrogovernance/studio`. Companion documents: [01_Product](01_Product.md), [02_Development](02_Development.md), [03_Data](03_Data.md).

## Plan

| Milestone | Outcome |
| --- | --- |
| M1 | First complete session on the installed Open WebUI: chat, three-pass assessment, human review, export |
| M2 | JSON output pipeline for all three passes with schema validation and one recorded retry |
| M3 | Review surface: accept, amend, reject, defer, add, with persistence beside each finding |
| M4 | `gyrogovernance/studio` published: MIT license, ported components credited, prompts versioned |
| M5 | Pilot: five invited participants, two sessions each, public-source material |
| M6 | Grant application covering the pilot token budget |
| M7 | Dataset v0 assembled from contributed records, with consent fields complete |

## Log

- 2026-10-09: Direction fixed. Chat workspace with The Human Mark assessment as automated first pass and human review on top. Arena and blind-ranking mechanics sit outside the design; model choice follows the user's task.
- 2026-10-09: Repositories inspected locally: `gyrogovernance/apps` (AI Inspector, MIT) and `gyrogovernance/tools` (THM documents, CC BY-SA 4.0). Three-pass prompts, THM document loader, session and insight types, and the existing contribution block identified for porting.
- 2026-10-09: Open WebUI structure confirmed from upstream README and documentation: Chat, Search, Notes, Workspace with Models, Knowledge, Prompts, Skills, Tools, plus artifact storage, channels, and automations in current releases.
- 2026-10-09: Documentation set rewritten as these four documents; the first draft set was replaced.
- 2026-10-09: THM framing decision: the framework keeps its AI Safety & Alignment identity, header, and verification label as published.
- 2026-10-09: Repository `gyrogovernance/studio` created at `F:\Development\studio`. Documents moved here from `basil/OSS/notes` into `dev/`, prompt drafts into `prompts/`, and shallow checkouts of the five Open WebUI repositories cloned into `external/` for documentation reading and porting. Product brief rewritten to lead with the workspace and introduce The Human Mark at first use.

## Issues and solutions

| Issue | Status | Action |
| --- | --- | --- |
| Product name | Open | Candidates: Collective Superintelligence Studio, Gyro Governance Studio, Studio. Governance Studio appears in search results for three enterprise products (Collate, EQTY Lab, Rigour); names starting with Open Meta-science read as Facebook's Meta. Check GitHub org and domain availability for the final candidate before the README ships. |
| Open WebUI install location unknown on the build machine | Open | Find the install path, record the release number, and re-check the section list in [02_Development](02_Development.md) against that release. |
| Pass 1 and pass 2 drafts return prose | Open | Convert to JSON in the `studio-thm-assessment-0.1` schema family before M1, per [02_Development](02_Development.md). |
| Open WebUI license requires its marks to stay visible | Solved | Interface keeps Open WebUI branding; README carries upstream credits and the per-component license file. |
| Assessment prompts carry AI Safety & Alignment wording in headers | Decided | Headers stay with the framework's own identity; the session supplies the material domain through the task fields. |
| Pilot cold start | Open | Invite-only first five participants, public-source tasks, M5. |
| Policy drafts are sensitive material | Open | Consent notice at first use, three destinations named before work starts, per [03_Data](03_Data.md). |
| Token budget overrun | Open | Spending cap and review allowance set before invitations, per [03_Data](03_Data.md). |
| AI Inspector relationship | Open | The extension stays as the clipboard companion for chats hosted elsewhere; the Studio is the home for in-house work. Decide whether the extension links to the Studio before M4. |

## Ideas

- **Grant targets for M6:** [Sentient Foundation open-source AGI grants](https://sentient.foundation/grants) (rolling, USD 42 million commitment, no equity), [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2) (USD 10,000 to USD 100,000), [NLnet programs](https://nlnet.nl/funding.html) (EUR 5,000 to 50,000, AI scope varies by program).
- **Access policy:** free tier at launch on OpenRouter free endpoints; a larger allowance attaches to sessions that complete review, which keeps token spend proportional to record value.
- **Review queue:** the artifact storage API holds assessment records with personal and shared scopes, which gives the review surface a backend inside the platform.
- **Team review:** Channels carry shared sessions with multiple models; Automations schedule re-assessments on a fixed interval for documents under revision.
- **Dataset packaging:** export from the session record into JSONL with consent fields intact; packaging script and data card live in the studio repo before the first sale conversation.
- **Specialist workplace:** review tasks drawn from assessments awaiting expert sign-off, with rewards funded by dataset revenue, built after M5.
- **Policy audience hook:** a session type for research-funding and metascience work, which matches the Brussels policy audience and the grant programs above.

## Files

- `prompts/` at the repository root holds the working prompt drafts at v0.1: the governance research preset, the structured reviewer JSON, and the three pass prompts. The reviewer draft carries the reference schema.
- The archived founding discussion stays at `f:\Development\basil\OSS\notes\1`.
