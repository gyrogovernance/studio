# Product

## Working name

The product ships under a name fixed before launch. The repository is `gyrogovernance/studio`. Candidate names and availability checks live in [04_Notes](04_Notes.md).

## Pitch

Policy researchers, evaluators, and institutional staff draft their work inside chat windows today. The sources, the reasoning, and the draft all live in that chat, and closing the tab ends the record: which model produced which claim, what evidence backed it, and what anyone reviewed afterward go with it.

The Studio is a self-hosted workspace built for that gap. You bring a document and its sources, work with a chosen model in chat, then run review tasks that return structured findings next to the passages they refer to. You accept, amend, reject, defer, or add findings yourself, and the session keeps the machine proposal and your decision side by side. Every session exports as versioned JSON carrying model, prompt, source, and consent metadata, ready to hand to a colleague or publish.

The Studio runs on Open WebUI with the Open WebUI branding visible alongside its own.

## How a session works

1. Pick a model and a task, then attach material: a policy draft, an evaluation report, an organizational procedure, a community decision.
2. Work in Chat against the attached material, then run a review task from Workspace:
   - **Claim and evidence mapping**, which extracts the claims and the support offered for them with locations back into the source.
   - **Attributed synthesis**, which drafts a brief that attributes each statement to the passage behind it.
   - **The Human Mark review**, the structured classification described in the next section.
   - **Your own task templates**, saved as prompts and skills.
3. Findings appear beside their source passages. Accept, amend, reject, defer, or add, with a short rationale on every change.
4. The session record persists with review outputs, decisions, model and prompt versions, and coverage notes.
5. Export the record, or offer it for contribution after previewing the exact content.

Notes holds the working draft, Knowledge holds reference documents, Prompts and Skills hold the task templates and review workflows, and Search retrieves across records.

## The Human Mark

The Human Mark (THM) is a classification framework published by Gyro Governance in the [tools repository](https://github.com/gyrogovernance/tools). It names one recurring pattern in governance material: passages where information that passed through a secondhand or model-processed source gets treated as first-hand authority. Each finding lands in one of four categories, arrives with the exact quote and its location, and carries a suggested revision at passage level. The Studio ships the THM review as one task among the mapping and synthesis tasks, the interface introduces each category in plain language at the point the finding appears, and the same task runs on a funding policy, an organizational procedure, or an AI safety report.

## Audience

**Governance practitioners.** Policy researchers, think tanks, and institutional staff who draft and review consequential documents with AI support. Their work is document-heavy, carries real stakes on the output, and produces the kind of review the record needs. The Arq Foundation profile of a Brussels policy organization, hiring for internal tooling and metascience research, describes this user.

**AI safety researchers and organizations producing open weights.** They consume the output: reviewed sessions with provenance, disagreement traces, and classification labels, which serve evaluations, training, and safeguards.

The first group uses the product and generates the record. The second group funds the data business. The two groups meet through the pipeline and stay separate inside the app.

## Market

Reports size the AI training dataset market at USD 7.55 billion in 2025 with a forecast of USD 30.9 billion by 2034 ([Growth Market Reports](https://growthmarketreports.com/blog/top-ai-training-data-companies-2026)), and at USD 8.74 billion in 2025 with a forecast of USD 49.8 billion by 2031 ([Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/ai-training-dataset-market)). Human-annotated and expert data services account for 74 percent of 2025 spend ([Dataintelo](https://dataintelo.com/report/global-ai-training-dataset-market)). Surge AI passed USD 1 billion in annual revenue with about 50,000 expert contractors, Mercor passed a USD 1 billion run rate in early 2026, and roughly half of Scale AI's new data projects involve RL environments ([SONNET CODE](https://sonnetcode.com/blog/ai-data-labeling-market-tops-2-3b-as-surge-ai-passes)).

The software layer around that spending is thin. [Label Studio](https://github.com/HumanSignal/label-studio/) at about 27,000 stars carries general annotation, academic platforms such as [Potato](https://github.com/davidjurgens/potato) stay under a few hundred stars, and chat workspaces such as [Open WebUI](https://github.com/open-webui/open-webui), LibreChat, and LobeChat cover conversation with feedback features limited to ratings and leaderboards. Review of the automated assessment itself stays a manual step in every tool in this list.

Open-source rebuilds of familiar products draw attention quickly. [OpenCut](https://www.opensourcealternatives.to/item/opencut), the open CapCut, reached about 92,000 GitHub stars in its first 14 months, and [ArtCraft](https://getartcraft.com/) built its audience on free open-source alternatives to paid creative suites. The Studio follows the same pattern against tools governance professionals already pay for.

## Licensing

| Component | License | Terms that apply |
| --- | --- | --- |
| Studio code | MIT on publication | Matches AI Inspector |
| AI Inspector (`gyrogovernance/apps`) | MIT, (c) 2025 Gyro Governance | Permissive reuse |
| THM reference documents (`gyrogovernance/tools`) | [CC BY-SA 4.0](https://github.com/gyrogovernance/tools/blob/main/LICENSE) | Attribution required, adaptations share under the same license |
| Open WebUI | Own license, see [upstream license](https://raw.githubusercontent.com/open-webui/open-webui/main/LICENSE) | Open WebUI marks remain visible in the interface and documentation |

The Studio preserves Open WebUI branding in the interface, credits upstream in its README, and keeps a per-component license file.

## Business model

**Phase 1, adoption.** The app is free. Chat access at launch runs on free OpenRouter model endpoints, and grant programs fund the token budget: [Sentient Foundation](https://sentient.foundation/grants) runs a rolling open-source AGI grant program from a USD 42 million commitment with no equity taken, and [Mozilla MOSS](https://grantedai.com/grants/mozilla-open-source-support-moss-program-foundational-technology-track-mozilla-foundation-e6353bf2) funds open-source projects with awards from USD 10,000 to USD 100,000.

**Phase 2, data.** Reviewed sessions with provenance and consent fields are packaged into datasets for labs and open-weight producers. Sale happens under separate permission and compensation arranged with each contributor, on top of the public-release choice every contributor already makes.

**Phase 3, workplace.** A specialist review surface where experts take paid review tasks on assessments and records, with rewards funded by dataset revenue.

## Stage

The documents in `dev/` cover the product, the port plan, the data schema, and the pilot design. The repository holds the prompt drafts in `prompts/` and read-only checkouts of the Open WebUI repositories in `external/`. The first release goal is one complete session running end to end: chat, review task, human review, export.
