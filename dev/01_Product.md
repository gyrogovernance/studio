# Product

Repository: [gyrogovernance/studio](https://github.com/gyrogovernance/studio). Working name pending; candidates and collisions are tracked in [04_Notes](04_Notes.md).

## Pitch

Governance work already happens with AI: people draft policy, map evidence, write briefs, and review evaluations in chat tools. What those tools usually drop is the durable record of the work. The sources, the model used, the review decisions, and the final text end up scattered across chats that nobody can audit later.

Studio is a self-hosted workspace for that work. It is built on [Open WebUI](https://github.com/open-webui/open-webui), keeps Open WebUI branding visible, and adds structured review and an exportable session record on top of the platform.

An operator attaches source material, works in chat or in a Note against a chosen model, runs review tasks that return structured findings with evidence locations, adjudicates each finding, and exports a versioned JSON record with provenance and consent metadata. The same workspace serves policy research, institutional procedures, and AI safety documentation.

## What ships

**Research surface.** Chat with attached files and Notes; Knowledge Bases for document collections; web search where configured. Notes hold the living draft: full-fidelity context when attached to chat, AI rewrite in place, export to Markdown or PDF.

**Task library.** Reusable prompts and skills for claim and evidence mapping, attributed synthesis, and The Human Mark review. Operators can add their own templates.

**The Human Mark.** A classification framework from [Gyro Governance](https://github.com/gyrogovernance/tools) (CC BY-SA 4.0). It identifies passages where secondhand or model-processed information is treated as first-hand authority, using four categories (GTD, IVD, IAD, IID). Each finding carries an exact quote, a locator, and a suggested revision. The Studio ships this as one review task among others; the interface explains categories in plain language when findings appear.

**Human adjudication.** Accept, amend, reject, defer, or add findings. Machine proposals and human decisions are stored as separate versions.

**Export and contribution.** Sessions export as versioned JSON. Contribution (private, named project, or public release) is an explicit choice with a preview of the exact content.

## Audience

**Primary users: governance practitioners.** Policy researchers, think tanks, and institutional staff who produce document-heavy work with AI assistance and need an inspectable trail of sources and decisions. The first audience pack targets European AI policy shops of the kind Arq Foundation describes: full-stack researchers, forward-deployed policy roles, and AI-native internal tooling ([arq.foundation](https://arq.foundation/); agenda in [Preparing Europe for Transformative AI](https://arq.foundation/research/preparing-europe-for-transformative-ai)).

**Downstream buyers: AI safety researchers and open-weight producers.** They use reviewed session datasets for evaluation, training, and safeguards.

Studio ships with preloadable **audience packs**: Knowledge Bases of public law and reports (for example the EU AI Act from EUR-Lex and the GPAI Code of Practice), Skills and Prompts for briefing and consultation work, and Model presets bound to those libraries. Pack contents are listed in [02_Development](02_Development.md).

## Market

The AI training dataset market is reported at USD 7.55 billion in 2025 with a forecast of USD 30.9 billion by 2034 ([Growth Market Reports](https://growthmarketreports.com/blog/top-ai-training-data-companies-2026)), and at USD 8.74 billion in 2025 with a forecast of USD 49.8 billion by 2031 ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/ai-training-dataset-market)). Human-annotated and expert data services account for about 74 percent of 2025 spend ([Dataintelo](https://dataintelo.com/report/global-ai-training-dataset-market)). Surge AI is reported near USD 1 billion ARR with roughly 50,000 expert contractors; Mercor passed a USD 1 billion run rate in early 2026; about half of Scale AI's new data projects involve RL environments ([SONNET CODE](https://sonnetcode.com/blog/ai-data-labeling-market-tops-2-3b-as-surge-ai-passes)).

Adjacent open-source software covers pieces of the stack: Label Studio for general annotation (~27k GitHub stars), Open WebUI and similar projects for chat, OpenCut for video editing (~92k stars), ArtCraft for creative suites ([getartcraft.com](https://getartcraft.com/)). A workspace that combines research chat, structured review, and consented export for governance work is still thin.

## Licensing

| Component | License |
| --- | --- |
| Studio code | MIT on publication |
| AI Inspector (`gyrogovernance/apps`) | MIT, (c) 2025 Gyro Governance |
| Human Mark documents (`gyrogovernance/tools`) | [CC BY-SA 4.0](https://github.com/gyrogovernance/tools/blob/main/LICENSE) |
| Open WebUI | Upstream license; marks must remain visible ([LICENSE](https://raw.githubusercontent.com/open-webui/open-webui/main/LICENSE)) |

A per-component license file ships with the repository.

## Business model

**Phase 1.** Free application. Token budget from grants: [Sentient Foundation](https://sentient.foundation/grants) (rolling open-source AGI grants, USD 42 million commitment, non-dilutive) and [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2) (USD 10,000 to 100,000). Launch inference on OpenRouter free endpoints while measuring usage.

**Phase 2.** Packaged datasets from contributed, consented session records. Sale requires separate permission and compensation with each contributor.

**Phase 3.** Paid specialist review workplace funded by dataset revenue.

## Status

Product, development, data, and notes documents are in `dev/`. Prompt drafts are in `prompts/`. Read-only Open WebUI checkouts are in `external/`. First release target: one end-to-end session on the installed Open WebUI instance. Integration detail is in [02_Development](02_Development.md).
