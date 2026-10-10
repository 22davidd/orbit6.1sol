"""Package original source and a ready-to-upload static website; no dependencies."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
output = root.parent / 'orbital-atlas.zip'
include = ['README.md', 'LICENSE', 'package.json', '.gitignore', '.github', 'dist', 'tests', 'scripts']
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for item in include:
        path = root / item
        files = sorted(path.rglob('*')) if path.is_dir() else [path]
        for file in files:
            if file.is_file() and '__pycache__' not in file.parts:
                archive.write(file, 'orbital-atlas/' + file.relative_to(root).as_posix())
    for file in sorted((root / 'dist').rglob('*')):
        if file.is_file():
            archive.write(file, 'orbital-atlas/website/' + file.relative_to(root / 'dist').as_posix())
print(output)
print(f'{output.stat().st_size:,} bytes')
