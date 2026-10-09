<p align="center">
  <img src="static/favicon.svg" width="88" height="88" alt="AI Inspector Studio logo">
</p>

<h1 align="center">AI Inspector Studio</h1>

<p align="center">
  An AI-native workspace for agentic research, policy analysis, and knowledge management, focused on mitigating risks from transformative AI and advancing existential risk preparedness.<br>
  <strong>Alpha Release</strong>
</p>

<p align="center">
  <a href="#what-you-can-do">What you can do</a> ·
  <a href="#getting-started">Get started</a> ·
  <a href="#your-models-and-your-data">Your data</a>
</p>

AI Inspector Studio brings sources, AI conversations, and working documents into one workspace for people who prepare analysis on transformative AI and its consequences. It is built for researchers, policy analysts, and governance teams who need to examine evidence, develop a position, and carry their work from first reading through to a brief that can be shared with decision-makers.

Studio treats AI as part of the everyday method of research. Language models can read from your document libraries, call the built-in review tools, and work through multi-step tasks inside a conversation, while you keep the questions, the corrections, and the final judgement. Every exchange stays beside your notes and sources, so the reasoning behind a conclusion remains available when a colleague, a reviewer, or a policymaker asks how it was reached.

Studio is developed by [Gyro Governance Lab](http://gyrogovernance.com/) as part of its work on AI safety and existential risk preparedness. It builds on [Open WebUI](https://github.com/open-webui/open-webui) and brings selected tools from the [AI Inspector Chrome extension](https://github.com/gyrogovernance/apps) into a dedicated application.

## Who Studio is for

Studio serves people who carry research from analysis through to policy design and stakeholder engagement.

- Researchers who own a policy area end to end, from evidence review to the published brief and its dissemination.
- Policy advisers working with governments, public institutions, and international bodies on frontier AI, safety, and governance.
- Think tanks and independent foundations building AI-native practices for research and knowledge management.
- Technical and governance teams reviewing evaluation reports, risk assessments, and internal guidance.

Typical work includes the following.

- Briefings on AI safety, governance, and existential risk preparedness
- Consultation responses and comments on draft regulation and standards
- Comparisons between a proposal and established frameworks such as the EU AI Act or the NIST AI Risk Management Framework
- Research on competitiveness, industrial policy, metascience, and societal resilience as AI capabilities grow
- Reviews of model evaluation documentation and system prompts

## What you can do

### Research with your sources in one place

- **Knowledge** holds reports, papers, legislation, and standards in searchable collections that a model can draw on during a conversation.
- **Notes** give you an editable document for the brief, memo, or response you are developing.
- **Chat history and search** let you return to an earlier exchange and see how a conclusion was formed.

A typical session might begin with several reports on the same policy question. You ask for a synthesis that separates where the sources agree from where they diverge, question the points that seem weakly supported, and develop the result into a briefing note while the sources and the discussion remain open beside it.

### Review a draft with dedicated tools

Five review tools come from AI Inspector, the Gyro Governance Lab browser extension for evaluation and governance. You enable them from the chat tool selector, and a model that supports tool calling runs them on the material you provide.

- **Policy Auditing** separates a document's claims from the evidence offered for them, shows how the two relate, and flags claims that have no stated support.
- **Policy Reporting** prepares an executive report with source attribution, recommendations, the reasons behind them, and an honest account of limitations.
- **Meta-Evaluation** examines how a document handles the sources of its information and the responsibility for its decisions, using [The Human Mark](http://gyrogovernance.com/), and proposes targeted revisions wherever provenance or accountability becomes unclear.
- **Text Sanitization** removes hidden characters, irregular spacing, and formatting problems, and explains each change.
- **Quality Improvement** revises a draft for clearer structure, firmer grounding in evidence, fair treatment of alternatives, and open acknowledgement of uncertainty.

The final judgement stays with you. You can question a finding, ask for the passage that supports it, or request another revision in the same conversation, and conclusions and citations should still be checked against the original material before they are relied upon.

### Work from established frameworks

The Alpha Release ships with reference collections covering the main international frameworks for AI governance, and you can attach any of them to a conversation.

- EU AI Act (Regulation (EU) 2024/1689)
- NIST AI Risk Management Framework (AI RMF 1.0)
- NIST Generative AI Profile (NIST AI 600-1)
- OECD AI Principles (2024 revision)
- The Human Mark, the Gyro Governance taxonomy for AI safety risks

Each collection is a dated edition with a recorded source. You can add national strategies, institutional guidance, and your own research alongside them.

### Repeat good work without starting over

Several workspace features help a team apply the same methods across many documents.

- **Model presets** are ready-made assistants for claim and evidence review, research synthesis, policy and standards analysis, and Human Mark review. After connecting a model, you assign it to a preset in **Workspace → Models**.
- **Prompts** are saved instructions that you insert by typing `/` in the chat box, such as `/claim-evidence` or `/eu-ai-act-review`, so that a recurring task runs the same way each time.
- **Skills** are longer sets of guidance that a model follows for multi-step research and review work.
- **The glossary** explains workspace terms and the vocabulary of The Human Mark.

All of these can be edited, so a team can adapt them to its own subject, house style, and methods.

## Getting started

Studio runs as a desktop application on **Windows (x64)** and on **Apple Silicon Macs with macOS 14 or later**. It can also run in a browser from this repository.

1. Download the installer for your platform from the [Releases](https://github.com/gyrogovernance/studio/releases) page.
2. Install and open Studio. The first launch needs an internet connection and several gigabytes of free space while the application prepares itself, and later launches reuse that setup.
3. Open **Profile → Settings → Connections** and add a hosted provider with your API key, or connect a local model through Ollama.
4. Choose a model in chat, attach your documents or a Knowledge collection, and begin. The review tools appear in the chat tool selector and need a model that supports tool calling.

Studio does not include API keys or model weights, so you choose and supply the model connection that suits your work.

## Your models and your data

The desktop application runs on your own computer, and your chats, documents, and settings stay in its local application data. When you use a hosted model, the content needed for each request is sent to the provider you selected, and any external service you configure for document extraction or embeddings receives the material it processes. With a local model, the work can stay entirely on your machine, which matters for sensitive drafts and material not yet published.

The local application accepts connections only from the same computer and opens without account registration. A deployment shared across a team needs its own authentication and hosting setup. Conversations and Notes can be exported at any time.

## Run from source

To run the browser workspace yourself on Windows, install Node.js 22, Python 3.12, and `uv`, then run these commands from the repository root in PowerShell.

```powershell
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item .env.example .env
}
npm ci
uv sync --python 3.12 --no-dev --no-install-project
npm run start:dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser, and use Ctrl+C in the terminal to stop.

For a local server with a production frontend build, run the following and then open [http://127.0.0.1:8081](http://127.0.0.1:8081).

```powershell
$env:NODE_OPTIONS = '--max-old-space-size=8192'
npm run start:prod
```

Instructions for packaging the desktop installers are in [`desktop/README.md`](desktop/README.md).

## Alpha Release

This is an early release for use and feedback. Model behaviour and tool support vary between providers, and the bundled reference libraries are dated editions, so any requirement that may have changed should be checked against the original source.

When you report an issue, please describe the task, what you expected, and what happened, along with the application version, operating system, and model. Remove API keys and private document content before sharing.

## Acknowledgements and licenses

Studio is based on Open WebUI v0.11.4, created by Timothy Jaeryang Baek and maintained by Open WebUI Inc. Each component keeps its own license.

- Open WebUI code is covered by its [license](LICENSE), [license history](LICENSE_HISTORY), and [multi-license notice](LICENSE_NOTICE).
- Original Studio software and documentation are covered by the [Studio MIT notice](LICENSES/AI-INSPECTOR-STUDIO-MIT.txt).
- Tools ported from AI Inspector keep their [MIT notice](backend/open_webui/studio/data/gadgets/LICENSE).
- Desktop packaging is adapted from [Open WebUI Desktop](https://github.com/open-webui/desktop) and keeps its [AGPL-3.0 license](desktop/LICENSE) and [source attribution](desktop/UPSTREAM.md).
- The Human Mark reference material is published under [CC BY-SA 4.0](backend/open_webui/studio/data/THM-LICENSE.txt).
- Publisher, edition, source, and reuse details for the other framework documents are recorded in the [framework manifest](backend/open_webui/studio/data/frameworks-v1.json).

Including these references does not imply endorsement by their publishers.
