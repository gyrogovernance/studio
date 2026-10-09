# Data

## Unit of record

Reviewed governance session: material snapshot, task and domain, review-pass outputs (prompt and model versions), human adjudication per finding. Packaging requires all four present.

## Schemas

### Review-pass JSON

Reference: `prompts/thm-reviewer-v0.1.txt` (`schema_version: studio-thm-assessment-0.1`).

| Field | Content |
| --- | --- |
| `schema_version` | Schema identity |
| `target_message_id` | Message or section under review |
| `coverage` | Inspected IDs, source IDs, limitations |
| `categories` | Per category: `finding`, `no_finding_in_scope`, or `insufficient_context`, with reason |
| `findings[]` | ID, category, status (`potential` \| `explicit`), evidence (quote, locator), crossing, explanation, suggested revision |
| `task_quality_notes` | Issues outside Human Mark scope, each with evidence |
| `summary` | Findings and coverage |

Coverage is mandatory on every assessment.

### Human review row

Machine finding and reviewer decision are separate linked rows.

| Field | Content |
| --- | --- |
| Finding ID | Machine proposal |
| Decision | `accept` \| `amend` \| `reject` \| `defer` \| `add` |
| Rationale | Required for amend, reject, add |
| Category change | Original and revised category with both rationales |
| Reviewer | Pseudonymous ID |
| Timestamp | Review time |
| Completeness | Coverage of the assessment, per pass |

Independent reviewer rows persist until an adjudication record joins them.

### Session record

Extends `GovernanceInsight` from `gyrogovernance/apps` (`src/types/index.ts`): `schema_version`, model provenance, contribution block.

| Section | Content |
| --- | --- |
| Project and task | Domain, activity, objective, sources, template ID and version |
| Material snapshot | Document version or message IDs, content hash, omissions |
| Pass runs | Pass name, prompt version, model config, output, timestamps, usage |
| Assessment and review | Findings, coverage, decisions, completeness |
| Process | Models, durations, created_at, schema_version |
| Contribution | Public flag, license (CC0 default), contributor |

## Storage locations

| Store | Contents |
| --- | --- |
| Open WebUI DB (SQLite or PostgreSQL) | Chats, notes, presets, session records |
| Instance file storage | Attachments, exports |
| Artifact storage API | Key-value records, personal and shared scopes |
| Inference provider | Prompts, attachments, and context for each call |

Session UI lists three destinations: instance, inference provider, export or share channel. Provider identity is taken from configuration and written into the record.

## Consent

| Choice | Effect |
| --- | --- |
| Private | Record stays on the instance |
| Named project | Shared with a stated project under stated terms |
| Public release | Published under stated terms; CC0 default |
| Dataset sale | Separate permission and compensation |

Consent is an explicit timestamped record. Token subsidy alone creates no contribution.

Preview before share shows exact material, findings, rationales, and provenance. Operators may remove sources, third-party quotes, and identifiers in the preview. Evidence change after redaction triggers re-review of affected findings; the limitation is recorded.

Retention schedule (chats, snapshots, reviews, logs, backups) is fixed before pilot. Withdrawal removes the record from the Studio and from future releases; already-downloaded copies remain with holders.

## Quality rules

1. Finding fields: category, exact quote with locator, Direct/Indirect crossing, contextual reason.
2. Machine proposal and human decision stored as separate versions; both included in export.
3. Coverage and completeness travel with the record.
4. Non-THM task-quality issues use their own field with evidence.
5. Pilot includes a blinded subset (judgments recorded before machine findings are shown) and cases with zero machine findings. Recall is measured against an independent reference assessment.

## Pilot

Five invited participants; two sessions each; public-source material (one policy document, one organizational or community governance document). Each session produces a usable deliverable; review is offered at a natural stopping point.

| Measure | Formula |
| --- | --- |
| Review uptake | Requested reviews / eligible sessions |
| Review completion | Fully reviewed assessments / requested assessments |
| Decision split | Accept / amend / reject / defer / add, by task and category |
| Domain breadth | Material types with reviewable assessments |
| Review burden | Review time; abandoned-review reasons |
| Cost per completed review | Attributable inference cost / completed reviews |
| Contribution uptake | Approved contributions / reviews offered contribution |

Write-up reports denominators, uncertainty, and sample size.

## Cost

```
cost = sum(input_tokens * input_price_per_million / 1e6
         + output_tokens * output_price_per_million / 1e6)
```

Unknown usage is recorded separately from zero. Spending cap and review allowance are set before invitations. At the cap, requests queue and the UI shows budget state. OpenRouter free endpoints: rate limits and changing availability ([limits](https://openrouter.ai/docs/api_reference/limits)). Pilot budget uses measured usage at actual account limits.
