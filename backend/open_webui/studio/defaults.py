"""Install the bundled workspace pack through Open WebUI's native models."""

import asyncio
import json
import logging
import os
from pathlib import Path

from open_webui.models.config import Config
from open_webui.models.models import ModelForm, Models
from open_webui.models.prompts import PromptForm, Prompts
from open_webui.models.skills import SkillForm, Skills
from open_webui.models.users import Users

log = logging.getLogger(__name__)
_lock = asyncio.Lock()
PACK_PATH = Path(__file__).parent / 'data' / 'workspace-v1.json'


async def seed_workspace_defaults():
    """Add missing pack entries once; preserve edits and intentional deletions."""
    if os.getenv('STUDIO_WORKSPACE_DEFAULTS', 'true').lower() != 'true':
        return

    async with _lock:
        owner = await Users.get_first_user()
        if not owner or owner.role != 'admin':
            return  # First signup calls this again after creating the owner.

        pack = json.loads(PACK_PATH.read_text(encoding='utf-8'))
        ledger_key = f'studio.workspace_pack.{pack["version"]}'
        installed = set(await Config.get(ledger_key, []))
        added = 0

        for item in pack['models']:
            key = f'model:{item["id"]}'
            if key in installed:
                continue
            existing = await Models.get_model_by_id(item['id'])
            if not existing:
                result = await Models.insert_new_model(ModelForm(**item), owner.id)
                if result is None:
                    raise RuntimeError(f'Could not install Studio preset {item["id"]}')
                added += 1
            installed.add(key)
            await Config.upsert({ledger_key: sorted(installed)})

        for item in pack['prompts']:
            key = f'prompt:{item["command"]}'
            if key in installed:
                continue
            existing = await Prompts.get_prompt_by_command(item['command'])
            if not existing:
                result = await Prompts.insert_new_prompt(owner.id, PromptForm(**item))
                if result is None:
                    raise RuntimeError(f'Could not install Studio prompt {item["command"]}')
                added += 1
            installed.add(key)
            await Config.upsert({ledger_key: sorted(installed)})

        for item in pack['skills']:
            key = f'skill:{item["id"]}'
            if key in installed:
                continue
            existing = await Skills.get_skill_by_id(item['id'])
            if not existing:
                existing = await Skills.get_skill_by_name(item['name'])
            if not existing:
                result = await Skills.insert_new_skill(owner.id, SkillForm(**item))
                if result is None:
                    raise RuntimeError(f'Could not install Studio skill {item["id"]}')
                added += 1
            installed.add(key)
            await Config.upsert({ledger_key: sorted(installed)})

        if added:
            log.info('Installed %s Studio workspace defaults', added)

        from open_webui.studio.gadgets import seed_gadget_tools

        await seed_gadget_tools(owner)
