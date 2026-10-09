# AI Inspector Studio

## Product brief

Research and policy work increasingly combines source documents, AI-generated analysis, and repeated revision. The practical challenge is to keep the sources, draft, and review together so that a specialist can check the reasoning and produce a useful deliverable.

AI Inspector Studio is a self-hosted workspace for this work. It combines conversations with local or hosted language models, document libraries, editable Notes, and reusable analysis tools. A researcher or analyst can examine material, develop a brief, review its claims and governance framing, and retain the conversation and resulting documents in one workspace.

Studio builds on Open WebUI and adapts established workflows from the AI Inspector Chrome extension. The MVP brings those workflows into the application so they can run through the configured model connection.

## Research and review workflows

Policy Auditing extracts the claims a document makes, the evidence it presents, and the relationships between them. It preserves source locations and identifies missing support. Policy Reporting develops an executive synthesis with attributed sources, recommendations, rationale, limitations, and uncertainty.

Meta-Evaluation applies the three-pass Human Mark workflow: identify classifications and displacement patterns, examine governance and traceability flows, then propose revisions with references to the material under review. Human Mark supplies a published method for examining Authority, Agency, and their dependence relationships. Its findings support specialist judgment during review.

Text Sanitization proposes cleanup of text and formatting and explains the changes. Quality Improvement applies criteria for traceability, variety, accountability, integrity, accuracy, completeness, and clarity when revising content.

These tools can be used with reusable prompts, skills, and model presets. The model and the material supplied determine the scope of each run. Specialists can question an output, request corrections, and continue developing the document in the same conversation.

## Reference libraries

Studio includes Knowledge collections for the EU AI Act, NIST AI Risk Management Framework, NIST Generative AI Profile, OECD AI Principles, and The Human Mark. Documents are indexed for retrieval and can be attached to conversations and model presets. Each source carries edition, origin, and reuse information.

The collections provide dated reference material for analysis. A searchable glossary makes workspace concepts and Human Mark terminology available alongside the working tools.

## Intended applications

Researchers, policy analysts, governance specialists, and technical teams can use Studio to prepare literature and policy briefs, map claims to evidence, review evaluation documentation, develop consultation responses, and revise internal guidance.

For example, an analyst can bring a policy draft and its supporting sources into the workspace, extract its claims and evidence, request an attributed report, and examine its governance framing. The analyst can record corrections in the conversation, refine the working Note, and export the resulting work.

## Deployment and control

Studio supports a local server with a browser interface and desktop packaging for Windows and macOS. The desktop launcher manages the local backend automatically and opens the workspace in its own window. Studio supports configured hosted providers and local models through Open WebUI's connection options. Organizations can extend the workspace with compatible tools, skills, and reference collections.

Chats, Notes, Knowledge, search, conversation references, and native exports provide continuity between tasks. Material sent to a hosted model is processed by the selected provider; local inference uses the configured local service. Sharing is controlled through the application's access and export functions.

AI Inspector Studio is developed by Gyro Governance and built on Open WebUI. Source software and reference materials retain their respective attribution and license terms.
