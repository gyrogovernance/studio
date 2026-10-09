# Product

Repository: `gyrogovernance/studio`. Working name pending ([04_Notes](04_Notes.md)).

## Product

Self-hosted workspace for governance research with AI. Operators attach source material, work in chat with a selected model, run structured review tasks, adjudicate findings, and export a session record with provenance and consent metadata.

Platform base: Open WebUI. Open WebUI branding remains visible. Studio branding appears alongside it.

## Capabilities

| Capability | Description |
| --- | --- |
| Chat research | Model selection, attached sources, working conversation |
| Claim and evidence map | Structured extraction of claims and supporting passages with locators |
| Attributed synthesis | Brief with each statement attributed to a source passage |
| Human Mark review | Classification of Direct/Indirect Authority and Agency crossings (GTD, IVD, IAD, IID), with quote, locator, and suggested revision |
| Custom tasks | Operator-defined prompts and skills |
| Human adjudication | Accept, amend, reject, defer, or add findings; machine proposal and human decision stored as separate versions |
| Session export | Versioned JSON: material snapshot, task outputs, review decisions, model and prompt versions, coverage, contribution fields |

Interface mapping: Chat for conversation; Notes for drafts; Knowledge for reference documents; Prompts and Skills for task templates; Search for retrieval across records.

## Audience

| Segment | Role |
| --- | --- |
| Governance practitioners | Primary users. Policy researchers, think tanks, institutional staff producing document-heavy work with AI assistance. |
| AI safety researchers and open-weight producers | Downstream buyers of reviewed session datasets for evaluation, training, and safeguards. |

## Market

| Source | Figure |
| --- | --- |
| AI training dataset market, 2025 | USD 7.55B ([Growth Market Reports](https://growthmarketreports.com/blog/top-ai-training-data-companies-2026)); USD 8.74B ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/ai-training-dataset-market)) |
| Forecast | USD 30.9B by 2034 (GMR); USD 49.8B by 2031 (Mordor) |
| Expert / human-annotated share of 2025 spend | 74% ([Dataintelo](https://dataintelo.com/report/global-ai-training-dataset-market)) |
| Surge AI | ~USD 1B ARR; ~50,000 expert contractors ([SONNET CODE](https://sonnetcode.com/blog/ai-data-labeling-market-tops-2-3b-as-surge-ai-passes)) |
| Mercor | USD 1B run rate, early 2026 |
| Scale AI | ~50% of new data projects are RL environments |

Adjacent open-source software: Label Studio (~27k stars, general annotation); Open WebUI / LibreChat / LobeChat (chat with ratings and leaderboards); OpenCut (~92k stars, CapCut alternative); ArtCraft ([getartcraft.com](https://getartcraft.com/), open creative suites).

## Licensing

| Component | License |
| --- | --- |
| Studio code | MIT (on publication) |
| AI Inspector (`gyrogovernance/apps`) | MIT, (c) 2025 Gyro Governance |
| Human Mark documents (`gyrogovernance/tools`) | [CC BY-SA 4.0](https://github.com/gyrogovernance/tools/blob/main/LICENSE) |
| Open WebUI | Upstream license; marks must remain visible ([LICENSE](https://raw.githubusercontent.com/open-webui/open-webui/main/LICENSE)) |

Per-component license file ships with the repository.

## Business model

| Phase | Model |
| --- | --- |
| 1 | Free app. Token budget from grants: [Sentient Foundation](https://sentient.foundation/grants) (rolling, USD 42M commitment, non-dilutive); [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2) (USD 10k–100k). Launch inference on OpenRouter free endpoints. |
| 2 | Packaged datasets from contributed, consented session records. Sale requires separate permission and compensation per contributor. |
| 3 | Paid specialist review workplace funded by dataset revenue. |

## Status

Documents, prompt drafts, and Open WebUI reference checkouts are in the repository. First release target: one end-to-end session (chat, review task, adjudication, export). See [02_Development](02_Development.md).
