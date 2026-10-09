"""Validate desktop payload integrity and exclusion of private development files."""
from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parent.parent
resources = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'desktop/resources'
payload = resources / 'studio'
manifest = json.loads((payload / 'manifest.json').read_text(encoding='utf-8'))
wheel = payload / manifest['wheel']
for file, expected in ((wheel, manifest['wheelSha256']), (payload / 'requirements.txt', manifest['requirementsSha256'])):
    with file.open('rb') as stream:
        assert hashlib.file_digest(stream, 'sha256').hexdigest() == expected, f'Checksum mismatch: {file.name}'

secrets = []
if (ROOT / '.env').is_file():
    for line in (ROOT / '.env').read_text(encoding='utf-8').splitlines():
        key, separator, value = line.partition('=')
        value = value.strip().strip('\'"')
        if separator and not key.strip().startswith('#') and re.search('key|token|secret|password', key, re.I) and len(value) >= 16:
            secrets.append(value.encode())

for file in (wheel, resources / 'source/ai-inspector-studio-source.zip'):
    with zipfile.ZipFile(file) as archive:
        names = archive.namelist()
        for name in names:
            parts = PurePosixPath(name.replace('\\', '/')).parts
            assert not any(part in {'dev', '.git', '.venv', '.data', '.runtime', '__pycache__', 'node_modules'} or part.startswith('.env') for part in parts), f'Private path in {file.name}: {name}'
            assert not name.endswith(('.db', '.pyc')), f'Runtime file in {file.name}: {name}'
            if secrets:
                content = archive.read(name)
                assert not any(secret in content for secret in secrets), f'Local credential found in {file.name}; contents withheld.'
        print(f'PASS: {file.name}: {len(names)} entries, no private paths or local credentials.')

with zipfile.ZipFile(wheel) as archive:
    assert 'if user is None and WEBUI_AUTH:' in archive.read('open_webui/main.py').decode(), 'Accountless first launch fix is missing.'
    assert 'open_webui/frontend/index.html' in archive.namelist()
    assert len(json.loads(archive.read('open_webui/studio/data/gadgets-v1.json'))['gadgets']) == 5
print('PASS: Studio frontend, first launch fix, and five gadgets are bundled.')
