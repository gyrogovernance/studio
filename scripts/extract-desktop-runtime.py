"""Copy only the named uv executable from its verified archive, without extracting paths."""
import shutil
import sys
import tarfile
import zipfile
from pathlib import Path

archive, member, target = sys.argv[1:]
if archive.endswith('.zip'):
    with zipfile.ZipFile(archive) as source:
        with source.open(member) as binary, Path(target).open('wb') as output:
            shutil.copyfileobj(binary, output)
else:
    with tarfile.open(archive, 'r:gz') as source:
        entry = source.getmember(member)
        if not entry.isfile():
            raise ValueError('The uv executable must be a regular file.')
        with source.extractfile(entry) as binary, Path(target).open('wb') as output:
            shutil.copyfileobj(binary, output)
