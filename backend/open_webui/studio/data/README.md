# Workspace starter pack

`workspace-v1.json` ships four model presets, nine slash-command prompts, and four skills for claim and evidence review, attributed synthesis, policy and standards analysis, and The Human Mark assessment.

The native model presets start disabled with no inference model assigned. In Workspace > Models, choose a model for a preset and save it to enable it. Prompts can be used with any connected model. Skills require a model supporting the native skill tools.

The pack installs for the first administrator on startup or first signup. Each successfully installed entry is recorded under `studio.workspace_pack.v1` in the configuration database. Startup preserves edits and deletions. Existing entries with matching identifiers are preserved. Additional defaults can be introduced with new identifiers. Set `STUDIO_WORKSPACE_DEFAULTS=false` to disable automatic installation.

These are instructions and templates. The accompanying `frameworks-v1.json` manifest and `frameworks/` directory bundle five Knowledge collections with eight complete source documents. The background importer uses native content extraction, embeddings, vector storage, and Knowledge file linking. The MVP uses native chats, Notes, search, references, and exports for persistence and continuity. The gadget result format and source provenance are documented in [Data](../../../../dev/03_Data.md).

## Framework libraries

| Collection | Sources |
| --- | --- |
| EU AI Act | Regulation (EU) 2024/1689, original Official Journal PDF, 12 July 2024 |
| NIST AI Risk Management Framework | AI RMF 1.0, NIST AI 100-1, January 2023 |
| NIST Generative AI Profile | NIST AI 600-1, July 2024 |
| OECD AI Principles | OECD/LEGAL/0449, official English Recommendation, amended 2024 |
| The Human Mark | Framework, Grammar, specifications, and terms from the canonical source repository |

The manifest records publisher, source URL, edition, retrieval date, SHA-256, and reuse terms for each source. Original source files are retained unchanged. Libraries are dated snapshots; updates require reviewing the source and introducing a new version rather than replacing a user's collection silently.

On first startup or signup, `studio/knowledge.py` installs and indexes the bundled files in the background. Progress is recorded per collection and file in `studio.framework_pack.v1`. Completed entries are preserved, including intentional deletions. Failed or interrupted entries can resume at startup or through the administrator endpoint `POST /api/v1/studio/frameworks/install`; `GET /api/v1/studio/frameworks/status` reports progress and errors. The importer uses the instance's configured extraction and embedding providers. With the default SentenceTransformers configuration, embeddings run locally; the embedding model must be available or downloadable on first setup.

Collections can be attached to a conversation with `#` or to a model preset through its Knowledge selection. On initial installation, the policy preset receives the EU, NIST, and OECD libraries; The Human Mark preset receives its matching library. This assignment applies once to untouched starter presets and preserves later changes. Native function calling requires a model capable of using the built-in Knowledge tools. Chat still requires an inference model; document indexing does not require an inference-provider key.

NIST sources retain the [NIST Technical Series reuse terms](https://www.nist.gov/open/copyright-fair-use-and-licensing-statements-srd-data-software-and-technical-series-publications). The EU source retains the [EUR-Lex reuse notice](https://eur-lex.europa.eu/content/legal-notice/legal-notice.html). The OECD instrument is reproduced unchanged and distributed free of charge under [OECD Legal Instruments terms](https://www.oecd.org/en/about/terms-conditions.html); the instrument itself may not be sold. Inclusion does not imply endorsement by any publisher.

## Attribution

Studio-authored instructions use the Studio MIT license. Human Mark instructions in the workspace pack adapt the drafts in the repository's `prompts/` directory. The separate gadget pack extracts its task text from `gyrogovernance/apps`, `src/lib/prompts.ts`, and includes the source MIT notice in `gadgets/LICENSE`. Framework documents are reproduced from `gyrogovernance/tools`, `docs/the_human_mark`, copied on 2026-10-09.

The Human Mark framework and Grammar are by Basil Korompilias / Gyro Governance, licensed under [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The embedded Human Mark text and adaptations retain those terms. Source: [The Human Mark documentation](https://github.com/gyrogovernance/tools/tree/main/docs/the_human_mark). A copy of the source license is included in `THM-LICENSE.txt` beside the pack.
