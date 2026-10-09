"""Bundled framework documents installed through the native RAG ingestion path."""

import asyncio
import hashlib
import json
import logging
import mimetypes
import os
from pathlib import Path

from fastapi import APIRouter, Depends, Request, UploadFile
from starlette.datastructures import Headers

from open_webui.models.config import Config
from open_webui.models.files import Files
from open_webui.models.knowledge import KnowledgeForm, Knowledges
from open_webui.models.models import ModelForm, Models
from open_webui.models.users import Users
from open_webui.routers.files import process_uploaded_file, upload_file_handler
from open_webui.routers.knowledge import create_new_knowledge
from open_webui.utils.auth import get_admin_user

log = logging.getLogger(__name__)
router = APIRouter()
DATA_DIR = Path(__file__).parent / 'data'
LEDGER_KEY = 'studio.framework_pack.v1'
_lock = asyncio.Lock()


async def install_framework_defaults(request: Request):
    if os.getenv('STUDIO_WORKSPACE_DEFAULTS', 'true').lower() != 'true':
        return
    async with _lock:
        owner = await Users.get_first_user()
        if not owner or owner.role != 'admin':
            return
        manifest = json.loads((DATA_DIR / 'frameworks-v1.json').read_text(encoding='utf-8'))
        state = await Config.get(LEDGER_KEY, {})
        for collection in manifest['collections']:
            entry = state.get(collection['id'])
            if entry and entry.get('complete'):
                continue  # Preserve later edits and deletions.
            try:
                if entry is None:
                    knowledge = await create_new_knowledge(
                        request,
                        KnowledgeForm(name=collection['name'], description=collection['description'], access_grants=[]),
                        user=owner,
                    )
                    entry = {'knowledge_id': knowledge.id, 'files': {}, 'complete': False}
                    state[collection['id']] = entry
                    await Config.upsert({LEDGER_KEY: state})
                elif not await Knowledges.get_knowledge_by_id(entry['knowledge_id']):
                    continue  # The owner removed an incomplete collection.

                for source in collection['files']:
                    filename = source['filename']
                    record = entry['files'].get(filename)
                    if record and record.get('complete'):
                        continue
                    path = DATA_DIR / 'frameworks' / filename
                    if hashlib.sha256(path.read_bytes()).hexdigest() != source['sha256']:
                        raise ValueError(f'Bundled source checksum mismatch: {filename}')
                    with path.open('rb') as stream:
                        upload = UploadFile(
                            file=stream,
                            filename=filename,
                            headers=Headers({'content-type': mimetypes.guess_type(filename)[0] or 'text/plain'}),
                        )
                        metadata = {**source, 'studio_pack': 'frameworks-v1', 'knowledge_id': entry['knowledge_id']}
                        if record is None:
                            file = await upload_file_handler(
                                request, upload, metadata=metadata, process=False,
                                process_in_background=False, user=owner,
                            )
                            record = {'file_id': file.id, 'complete': False}
                            entry['files'][filename] = record
                            await Config.upsert({LEDGER_KEY: state})
                        else:
                            file = await Files.get_file_by_id(record['file_id'])
                            if file is None:
                                raise ValueError(f'Pending framework file was removed: {filename}')
                        await process_uploaded_file(request, upload, file.path, file, metadata, owner)
                    processed = await Files.get_file_by_id(record['file_id'])
                    linked = await Knowledges.get_files_by_id(entry['knowledge_id'])
                    if (processed.data or {}).get('status') != 'completed' or not any(
                        item.id == record['file_id'] for item in linked
                    ):
                        raise RuntimeError(f'Framework indexing failed: {filename}: {(processed.data or {}).get("error")}')
                    record['complete'] = True
                    await Config.upsert({LEDGER_KEY: state})
                entry['complete'] = True
                entry.pop('error', None)
                await Config.upsert({LEDGER_KEY: state})
                log.info('Installed framework Knowledge collection: %s', collection['name'])
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                if entry is not None:
                    entry['error'] = str(exc)
                    await Config.upsert({LEDGER_KEY: state})
                log.exception('Could not index framework collection %s', collection['name'])

        # Attach libraries only to untouched starter presets, once per preset.
        attachment_key = 'studio.framework_pack.v1.preset_links'
        attached = set(await Config.get(attachment_key, []))
        for model_id, source_ids in {
            'studio-policy-standards': ['eu-ai-act', 'nist-ai-rmf', 'nist-genai', 'oecd-ai'],
            'studio-human-mark': ['human-mark'],
        }.items():
            if model_id in attached or not all(state.get(key, {}).get('complete') for key in source_ids):
                continue
            model = await Models.get_model_by_id(model_id)
            if model and model.user_id == owner.id and model.updated_at == model.created_at and not model.meta.knowledge:
                references = []
                for key in source_ids:
                    knowledge = await Knowledges.get_knowledge_by_id(state[key]['knowledge_id'])
                    if knowledge:
                        references.append({'id': knowledge.id, 'name': knowledge.name, 'type': 'collection'})
                if len(references) == len(source_ids):
                    data = model.model_dump(exclude={'access_grants'})
                    data['meta']['knowledge'] = references
                    if await Models.update_model_by_id(model_id, ModelForm(**data)) is None:
                        raise RuntimeError(f'Could not attach framework libraries to {model_id}')
            attached.add(model_id)
            await Config.upsert({attachment_key: sorted(attached)})


def schedule_framework_defaults(app):
    task = getattr(app.state, 'studio_framework_task', None)
    if task is not None and not task.done():
        return task
    request = Request({'type': 'http', 'app': app, 'headers': [], 'method': 'POST', 'path': '/internal/studio/frameworks'})
    app.state.studio_framework_task = asyncio.create_task(install_framework_defaults(request))
    return app.state.studio_framework_task


@router.get('/frameworks/status')
async def framework_status(request: Request, user=Depends(get_admin_user)):
    task = getattr(request.app.state, 'studio_framework_task', None)
    return {'running': bool(task and not task.done()), 'collections': await Config.get(LEDGER_KEY, {})}


@router.post('/frameworks/install')
async def install_frameworks(request: Request, user=Depends(get_admin_user)):
    schedule_framework_defaults(request.app)
    return {'status': 'scheduled'}
