"""Build the distributable Studio wheel and source bundle from an explicit allowlist."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
import tomllib
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DESKTOP = ROOT / 'desktop'
PAYLOAD = DESKTOP / 'resources' / 'studio'


def digest(file: Path) -> str:
    with file.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def main() -> None:
    PAYLOAD.mkdir(parents=True, exist_ok=True)
    app = json.loads((DESKTOP / 'package.json').read_text(encoding='utf-8'))
    upstream = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
    project = tomllib.loads((ROOT / 'pyproject.toml').read_text(encoding='utf-8'))['project']
    version = f'{upstream["version"]}+studio.{app["version"]}'
    requirements = PAYLOAD / 'requirements.txt'
    subprocess.run(['uv', 'export', '--frozen', '--no-dev', '--no-emit-project', '--no-header', '--output-file', str(requirements)], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    # A separate wheel project avoids the upstream hook and cannot traverse dev/.
    with tempfile.TemporaryDirectory(prefix='studio-wheel-') as temporary:
        stage = Path(temporary)
        # Map individual source files into the wheel. This avoids duplicating the
        # full frontend tree into a temporary directory before compressing it.
        (stage / 'open_webui').mkdir()
        included = {}
        source = ROOT / 'backend' / 'open_webui'
        for file in sorted(source.rglob('*')):
            relative = file.relative_to(source)
            if not file.is_file() or '__pycache__' in relative.parts or relative.parts[0] == 'data' or file.suffix in {'.pyc', '.db'}:
                continue
            included[str(file)] = f'open_webui/{relative.as_posix()}'
        for file in sorted((ROOT / 'build').rglob('*')):
            if file.is_file() and file.suffix != '.map':
                included[str(file)] = f'open_webui/frontend/{file.relative_to(ROOT / "build").as_posix()}'
        included[str(ROOT / 'CHANGELOG.md')] = 'open_webui/CHANGELOG.md'
        shutil.copy2(ROOT / 'LICENSE', stage / 'LICENSE')
        metadata = '\n'.join([
            '[project]', 'name = "open-webui"', f'version = {json.dumps(version)}',
            'description = "AI Inspector Studio backend, built on Open WebUI"',
            'requires-python = ">=3.12,<3.13"', 'license = { file = "LICENSE" }',
            f'dependencies = {json.dumps(project["dependencies"])}',
            '[build-system]', 'requires = ["hatchling"]', 'build-backend = "hatchling.build"',
            '[tool.hatch.build.targets.wheel]', 'packages = ["open_webui"]',
            '[tool.hatch.build.targets.wheel.force-include]',
            *[f'{json.dumps(source_file)} = {json.dumps(destination)}' for source_file, destination in included.items()],
        ])
        (stage / 'pyproject.toml').write_text(metadata, encoding='utf-8')
        subprocess.run(['uv', 'build', str(stage), '--wheel', '--out-dir', str(PAYLOAD)], cwd=ROOT, check=True)

    wheels = sorted(PAYLOAD.glob(f'open_webui-{version}-*.whl'))
    if len(wheels) != 1:
        raise RuntimeError('Expected one Studio backend wheel.')
    wheel = wheels[0]
    with zipfile.ZipFile(wheel) as archive:
        names = archive.namelist()
        if any(part in {'dev', '.env', '__pycache__', 'node_modules', '.venv'} for name in names for part in Path(name).parts):
            raise RuntimeError('Private or runtime files found in the backend wheel.')
        for required in ('open_webui/frontend/index.html', 'open_webui/studio/data/gadgets-v1.json', 'open_webui/studio/data/frameworks-v1.json'):
            if required not in names:
                raise RuntimeError(f'Missing bundled file: {required}')
    for old_wheel in PAYLOAD.glob('open_webui-*.whl'):
        if old_wheel != wheel:
            old_wheel.unlink()
    (PAYLOAD / 'manifest.json').write_text(json.dumps({
        'version': app['version'], 'backendVersion': version, 'wheel': wheel.name,
        'wheelSha256': digest(wheel), 'requirementsSha256': digest(requirements),
    }, indent=2) + '\n', encoding='utf-8')

    notices = DESKTOP / 'resources' / 'licenses'
    notices.mkdir(parents=True, exist_ok=True)
    for name in ('LICENSE', 'LICENSE_HISTORY', 'LICENSE_NOTICE'):
        shutil.copy2(ROOT / name, notices / name)
    shutil.copy2(DESKTOP / 'LICENSE', notices / 'DESKTOP-AGPL-3.0.txt')
    shutil.copy2(DESKTOP / 'UPSTREAM.md', notices / 'DESKTOP-UPSTREAM.md')
    shutil.copytree(ROOT / 'LICENSES', notices / 'Studio', dirs_exist_ok=True)
    shutil.copy2(ROOT / 'backend/open_webui/studio/data/gadgets/LICENSE', notices / 'AI-INSPECTOR-MIT.txt')
    shutil.copy2(ROOT / 'backend/open_webui/studio/data/THM-LICENSE.txt', notices / 'THM-CC-BY-SA.txt')

    source_dir = DESKTOP / 'resources' / 'source'
    source_dir.mkdir(parents=True, exist_ok=True)
    source_zip = source_dir / 'ai-inspector-studio-source.zip'
    directories = ('src', 'static', 'backend/open_webui', 'scripts', 'LICENSES')
    files = ('package.json', 'package-lock.json', 'pyproject.toml', 'uv.lock', 'hatch_build.py',
             'svelte.config.js', 'vite.config.ts', 'tailwind.config.js', 'postcss.config.js',
             'tsconfig.json', '.prettierrc', 'README.md', 'LICENSE', 'LICENSE_HISTORY', 'LICENSE_NOTICE',
             'desktop/main.cjs', 'desktop/runtime.cjs', 'desktop/loading.html', 'desktop/package.json',
             'desktop/package-lock.json', 'desktop/electron-builder.yml', 'desktop/build/entitlements.mac.plist',
             'desktop/README.md', 'desktop/UPSTREAM.md', 'desktop/LICENSE',
             'desktop/test/runtime.test.cjs', 'desktop/test/smoke.cjs', '.github/workflows/desktop.yml')
    with zipfile.ZipFile(source_zip, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for directory in directories:
            for file in sorted((ROOT / directory).rglob('*')):
                relative = file.relative_to(ROOT)
                if not file.is_file() or '__pycache__' in relative.parts or file.suffix in {'.pyc', '.db'}:
                    continue
                if relative.is_relative_to('backend/open_webui/data'):
                    continue
                archive.write(file, str(relative))
        for name in files:
            file = ROOT / name
            if file.is_file():
                archive.write(file, name)
    print(f'Prepared {wheel.name} and source bundle; dev/ is excluded.')


if __name__ == '__main__':
    main()
