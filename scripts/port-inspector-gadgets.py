"""Refresh bundled instructions and tool adapters from the AI Inspector source."""

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('F:/Development/apps')
DATA = ROOT / 'backend/open_webui/studio/data'
text = (SOURCE / 'src/lib/prompts.ts').read_text(encoding='utf-8')


def constant(name):
    match = re.search(r'export const ' + name + r' = `([\s\S]*?)`;', text)
    if not match:
        raise ValueError(f'Missing source prompt: {name}')
    # These source templates contain escaped LaTeX backslashes, but no JS interpolation.
    return match[1].replace('\\\\', '\\')


def stage(name):
    match = re.search(r'export function ' + name + r'\([^)]*\)[^{]*\{\s*const basePrompt = `([\s\S]*?)`;', text)
    if not match:
        raise ValueError(f'Missing source prompt: {name}')
    return match[1]


gadgets = [
    ('policy-audit', 'Policy Auditing', 'extract_claims_and_evidence',
     'Extract exact claims, evidence and their relationships from supplied policy or document text.',
     [constant('POLICY_AUDIT_TASK')]),
    ('policy-report', 'Policy Reporting', 'write_attributed_report',
     'Create an attributed executive report with recommendations, rationale and limitations.',
     [constant('POLICY_REPORT_TASK')]),
    ('meta-evaluation', 'Meta-Evaluation', 'review_governance_document',
     'Run the three-pass Human Mark workflow on a supplied evaluation or governance document.',
     [stage('generateMetaEvaluationPass1'), stage('generateMetaEvaluationPass2'), stage('generateMetaEvaluationPass3')]),
    ('sanitize', 'Text Sanitization', 'clean_text',
     'Propose Unicode, whitespace and formatting cleanup and explain the changes.',
     [constant('SANITIZE_TASK')]),
    ('immunity-boost', 'Quality Improvement', 'improve_content',
     'Revise supplied content using the extension structure and behavior criteria, without diagnostic scoring.',
     [constant('IMMUNITY_BOOST_TASK')]),
]

pack = {
    'version': 'v1',
    'source': {
        'repository': 'https://github.com/gyrogovernance/apps',
        'path': 'src/lib/prompts.ts',
        'sha256': hashlib.sha256(text.encode()).hexdigest(),
        'license': 'MIT',
        'copyright': 'Copyright (c) 2025 Gyro Governance',
    },
    'gadgets': [],
}
tool_dir = DATA / 'gadgets'
tool_dir.mkdir(parents=True, exist_ok=True)
for key, name, method, description, prompts in gadgets:
    item = {'id': key, 'name': name, 'method': method, 'description': description, 'prompts': prompts}
    pack['gadgets'].append(item)
    content = f'''"""
title: {name}
author: Gyro Governance
version: 1.0.0
license: MIT
description: {description}
"""
# Copyright (c) 2025 Gyro Governance. See bundled AI Inspector MIT license.
from pydantic import BaseModel, Field
from open_webui.studio.gadgets import run_gadget


class Tools:
    class Valves(BaseModel):
        MODEL: str = Field(default="", description="Optional inference model ID. Empty uses the current chat model.")

    def __init__(self):
        self.valves = self.Valves()

    async def {method}(self, text: str, instructions: str = "", __request__=None,
                        __user__=None, __model__=None, __metadata__=None,
                        __event_emitter__=None) -> str:
        """{description}
        :param text: Complete source text to process, retaining section or page labels when available.
        :param instructions: Optional scope, audience, or revision constraints supplied by the person requesting the task.
        """
        return await run_gadget("{key}", text, instructions, self.valves.MODEL,
                                __request__, __user__, __model__, __metadata__, __event_emitter__)
'''
    (tool_dir / f'{key}.py').write_text(content, encoding='utf-8')

(DATA / 'gadgets-v1.json').write_text(json.dumps(pack, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(tool_dir / 'LICENSE').write_text((SOURCE / 'LICENSE').read_text(encoding='utf-8'), encoding='utf-8')
