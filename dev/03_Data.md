# Data

## Unit of record

The unit of contribution is a reviewed governance-work session: the material, the task and domain, the three assessment passes with their exact prompt and model versions, and the human review with per-finding decisions. A record qualifies for packaging when material snapshot, pass outputs, and human review are all present.

## Schemas

### THM assessment JSON

Every pass returns one JSON object. The full field list lives in `prompts/thm-reviewer-v0.1.txt` (`schema_version: studio-thm-assessment-0.1`). The record carries:

| Field | Content |
| --- | --- |
| `schema_version` | Schema identity for the Studio assessment family |
| `target_message_id` | The message or document section under assessment |
| `coverage` | IDs actually inspected, source IDs, stated limitations |
| `categories` | Status per category: `finding`, `no_finding_in_scope`, or `insufficient_context`, with reason |
| `findings[]` | ID, category, status (`potential` or `explicit`), evidence quotes with locators, crossing description, explanation, suggested revision |
| `task_quality_notes` | Problems outside the THM boundary, each with its own evidence |
| `summary` | Short account of findings and coverage |

`no_finding_in_scope` records a result within the stated coverage. Coverage travels with every assessment.

### Human review record

The machine finding and the reviewer judgment are stored as separate rows that reference each other:

| Field | Content |
| --- | --- |
| Finding ID | The machine proposal under review |
| Decision | `accept`, `amend`, `reject`, `defer`, or `add` |
| Rationale | Short reason, required for amendments, rejections, and additions |
| Category change | Original and revised category with both rationales, kept together |
| Reviewer | Pseudonymous reviewer ID |
| Timestamp | Review time |
| Completeness | Review coverage for the whole assessment, recorded per pass |

Disagreement between reviewers persists as independent records until an adjudication record joins them.

### Session record

The session record extends the `GovernanceInsight` type from `gyrogovernance/apps` (`src/types/index.ts`), which already carries `schema_version`, model provenance, and the contribution block:

| Section | Content |
| --- | --- |
| Project and task | Domain, activity, objective, source list, task template ID and version |
| Material snapshot | Document version or message IDs, content hash, context omissions |
| Pass runs | Pass name, prompt version, model configuration, output, timestamps, usage data |
| Assessment and review | Findings with coverage, human decisions, completeness |
| Process | Models used, durations, created timestamp, schema version |
| Contribution | Public flag, license (CC0 default), contributor |

## Where data lives

| Store | Contents |
| --- | --- |
| Open WebUI database (SQLite or PostgreSQL) | Chats, notes, task and preset configuration, session records |
| Instance file storage | Attached material, exports |
| Artifact storage API | Record key-value data with personal and shared scopes |
| Inference provider | Prompts, attached material, and context sent for each call |

The interface names the three destinations for every session: the instance holding the record, the inference provider receiving the call, and the export or share channel the user opens. Provider identity comes from configuration and stays visible in the record.

## Contribution and consent

Every completed review offers three choices: keep the record private, share it with a named project, or release it publicly under stated terms with CC0 as the default. Dataset sale runs on separate permission and compensation arranged with the contributor. Consent decisions are explicit records with timestamps, and free or discounted token access alone records nothing.

Before sharing, the user previews the exact content: material, findings, review rationales, and provenance fields, with source documents, third-party quotes, and identifying details removable in the preview. Redaction that changes the evidence behind a finding sends that finding back for re-review, and the record notes the limitation.

Retention covers working chats, snapshots, review records, logs, and backups, with the schedule fixed before the pilot. Withdrawal removes a record from the Studio and from future releases; copies already downloaded remain with their holders, and the withdrawal process states that boundary.

## Quality rules

1. A finding carries category, exact quote with locator, the Direct and Indirect crossing, and the contextual reason for the classification.
2. Machine proposal and human decision persist as separate versions, and both survive export.
3. Coverage and completeness fields travel with the record, so a reader can see what was inspected and what was reviewed.
4. Task-quality issues outside the THM boundary stay in their own field with evidence.
5. The pilot includes a blinded subset: reviewers record judgments on some assessments before machine findings appear, and cases with zero machine findings stay in the sample. Recall against those cases is measured against an independent reference assessment.

## Pilot

Five invited participants complete two sessions each on public-source material, one policy document and one organizational or community governance document. Each session produces a usable deliverable, with the assessment offered at a natural stopping point.

| Measure | Calculation |
| --- | --- |
| Review uptake | Sessions with a requested review / eligible sessions |
| Review completion | Fully reviewed assessments / requested assessments |
| Decision split | Accepted, amended, rejected, deferred, and added findings by task and category |
| Domain breadth | Material types completed with a reviewable assessment |
| Review burden | Time spent reviewing, plus abandoned-review reasons |
| Cost per completed review | Attributable inference cost / completed reviews |
| Contribution uptake | Approved contributions / completed reviews offered contribution |

The write-up reports denominators, uncertainty, and the small sample size alongside the measures.

## Cost control

Inference cost per run: `cost = sum(input_tokens * input_price_per_million / 1,000,000 + output_tokens * output_price_per_million / 1,000,000)`, with unknown usage recorded separately from zero.

A spending cap and a review allowance are set before invitations go out. At the cap the Studio queues requests and shows the budget state in the interface. OpenRouter free endpoints carry rate limits and availability that change over time ([limits](https://openrouter.ai/docs/api_reference/limits)), which suits workflow testing; the pilot budget comes from measured usage on those endpoints at their actual account limits.
