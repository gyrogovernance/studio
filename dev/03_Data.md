# Data

This document defines the session record, where it is stored, consent rules, quality checks, the pilot measures, and cost control. Schema details sit next to the product and development plans in [01_Product](01_Product.md) and [02_Development](02_Development.md).

## Unit of record

A packaging-ready record is a reviewed governance session: the material snapshot, the task and domain, the review-pass outputs (with prompt and model versions), and human adjudication per finding. All four parts must be present.

## Schemas

### Review-pass JSON

The reference schema is `prompts/thm-reviewer-v0.1.txt` (`schema_version: studio-thm-assessment-0.1`). Every pass returns one object with these fields:

| Field | Content |
| --- | --- |
| `schema_version` | Schema identity |
| `target_message_id` | Message or section under review |
| `coverage` | IDs inspected, source IDs, stated limitations |
| `categories` | Per category: `finding`, `no_finding_in_scope`, or `insufficient_context`, with reason |
| `findings[]` | ID, category, status (`potential` or `explicit`), evidence (quote and locator), crossing, explanation, suggested revision |
| `task_quality_notes` | Issues outside Human Mark scope, each with evidence |
| `summary` | Short account of findings and coverage |

Coverage is mandatory on every assessment. A `no_finding_in_scope` status is a result within that coverage, not a blank.

### Human review row

The machine finding and the reviewer decision are separate linked rows.

| Field | Content |
| --- | --- |
| Finding ID | Machine proposal under review |
| Decision | `accept`, `amend`, `reject`, `defer`, or `add` |
| Rationale | Required for amend, reject, and add |
| Category change | Original and revised category with both rationales |
| Reviewer | Pseudonymous ID |
| Timestamp | Review time |
| Completeness | How much of the assessment was reviewed, per pass |

When two reviewers disagree, both rows remain until an adjudication record joins them.

### Session record

The session extends `GovernanceInsight` from `gyrogovernance/apps` (`src/types/index.ts`), which already carries `schema_version`, model provenance, and a contribution block.

| Section | Content |
| --- | --- |
| Project and task | Domain, activity, objective, sources, template ID and version |
| Material snapshot | Document version or message IDs, content hash, omissions |
| Pass runs | Pass name, prompt version, model config, output, timestamps, usage |
| Assessment and review | Findings, coverage, decisions, completeness |
| Process | Models, durations, created_at, schema_version |
| Contribution | Public flag, license (CC0 default), contributor |

## Where data lives

| Store | Contents |
| --- | --- |
| Open WebUI database (SQLite or PostgreSQL) | Chats, notes, presets, session records |
| Instance file storage | Attachments and exports |
| Artifact storage API | Key-value records with personal and shared scopes |
| Inference provider | Prompts, attachments, and context for each call |

The interface should name three destinations for every session: the instance that holds the record, the inference provider that receives the call, and the export or share channel the operator opens. Provider identity comes from configuration and is written into the record.

## Consent

| Choice | Effect |
| --- | --- |
| Private | Record stays on the instance |
| Named project | Shared with a stated project under stated terms |
| Public release | Published under stated terms; CC0 is the default |
| Dataset sale | Separate permission and compensation |

Consent is an explicit timestamped record. Receiving free or discounted tokens does not imply contribution.

Before sharing, the operator previews the exact material, findings, rationales, and provenance fields, and may remove sources, third-party quotes, and identifiers in that preview. If redaction changes the evidence behind a finding, that finding goes back for re-review and the limitation is recorded.

Retention for chats, snapshots, reviews, logs, and backups is fixed before the pilot. Withdrawal removes the record from the Studio and from future releases; copies already downloaded remain with their holders, and the withdrawal notice states that boundary.

## Quality rules

1. A finding carries category, exact quote with locator, the Direct/Indirect crossing, and the contextual reason for the classification.
2. Machine proposal and human decision are stored as separate versions; both appear in the export.
3. Coverage and completeness travel with the record.
4. Issues outside Human Mark scope use `task_quality_notes` with their own evidence.
5. The pilot includes a blinded subset (judgments recorded before machine findings are shown) and cases with zero machine findings. Recall is measured against an independent reference assessment.

## Pilot

Five invited participants complete two sessions each on public-source material: one policy document and one organizational or community governance document. Each session produces a usable deliverable; review is offered when the draft reaches a natural stopping point.

| Measure | Formula |
| --- | --- |
| Review uptake | Requested reviews / eligible sessions |
| Review completion | Fully reviewed assessments / requested assessments |
| Decision split | Accept / amend / reject / defer / add, by task and category |
| Domain breadth | Material types completed with a reviewable assessment |
| Review burden | Time spent reviewing; abandoned-review reasons |
| Cost per completed review | Attributable inference cost / completed reviews |
| Contribution uptake | Approved contributions / reviews offered contribution |

The write-up reports denominators, uncertainty, and sample size with the measures.

## Cost

```
cost = sum(input_tokens * input_price_per_million / 1e6
         + output_tokens * output_price_per_million / 1e6)
```

Unknown usage is recorded separately from zero. A spending cap and a review allowance are set before invitations go out. At the cap, requests queue and the interface shows budget state. OpenRouter free endpoints have rate limits and changing availability ([limits](https://openrouter.ai/docs/api_reference/limits)); the pilot budget uses measured usage at the actual account limits.
