"""Serve workspace definitions and attributed canonical framework references."""

import re
from pathlib import Path

from fastapi import APIRouter, Depends

from open_webui.utils.auth import get_verified_user

router = APIRouter()
DATA = Path(__file__).parent / 'data'


@router.get('/glossary')
async def get_glossary(user=Depends(get_verified_user)):
    workspace = [
        (
            'Knowledge',
            'A collection of reference documents. Studio retrieves relevant passages to provide context for a model response.',
        ),
        (
            'Tool',
            'A callable operation available to a chat model. Enable a tool in chat or attach it to a model preset.',
        ),
        ('Skill', 'Reusable instructions and reference material for a task or workflow.'),
        ('Prompt', 'Reusable task instructions that can be inserted into a conversation.'),
        (
            'Model preset',
            'A saved configuration that combines an inference model with instructions and optional Knowledge, Skills and Tools.',
        ),
        ('Note', 'An editable working document, such as a draft, brief or report.'),
        (
            'Claim and evidence map',
            'A record of what a document asserts, the evidence it presents, and the relationships and gaps between them.',
        ),
        (
            'Attributed synthesis',
            'A summary or report that identifies its sources and distinguishes source statements from generated interpretation.',
        ),
        (
            'Meta-evaluation',
            'Review of an evaluation document and its reasoning, classifications and governance framing. The bundled tool follows three Human Mark passes and requires human verification.',
        ),
    ]
    entries = [
        {
            'id': f'workspace-{i}',
            'title': title,
            'content': body,
            'collection': 'Workspace',
            'source': 'AI Inspector Studio',
            'license': None,
        }
        for i, (title, body) in enumerate(workspace)
    ]
    for filename, collection in [('THM_Terms.md', 'Human Mark terminology'), ('THM_Grammar.md', 'Human Mark grammar')]:
        text = (DATA / 'frameworks' / filename).read_text(encoding='utf-8')
        sections = re.split(r'(?m)(?=^#{1,3} )', text)
        for index, section in enumerate(sections):
            if not section.strip():
                continue
            title = section.splitlines()[0].lstrip('# ').strip()
            entries.append(
                {
                    'id': f'{filename}-{index}',
                    'title': title,
                    'content': section,
                    'collection': collection,
                    'source': filename,
                    'url': 'https://github.com/gyrogovernance/tools',
                    'author': 'Basil Korompilias / Gyro Governance',
                    'license': 'CC BY-SA 4.0',
                }
            )
    return {'entries': entries}
