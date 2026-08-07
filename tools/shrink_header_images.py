#!/usr/bin/env python3
"""
Shrinks pfp.png and titleiconbar.png in place, keeping the same filenames
(they're both referenced elsewhere - og:image, preload links, favicon, etc.
so paths must stay identical).

Run from your project root (same folder as index.html).
Requires Pillow: pip install Pillow

Originals are backed up to MainImages/originals_backup/ before overwriting,
just in case you ever want the source files back.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).parent
IMAGES_DIR = ROOT / "MainImages"
BACKUP_DIR = IMAGES_DIR / "originals_backup"

# (filename, target max width in px)
TARGETS = [
    ("pfp.png", 560),          # avatar renders at 280px on-page -> 560px covers retina
    ("titleiconbar.png", 120), # nav logo renders at 53px on-page -> 120px covers retina
]


def shrink(path: Path, max_width: int):
    if not path.exists():
        print(f"  MISSING, skipped: {path}")
        return
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / path.name
    if not backup_path.exists():
        path.replace(backup_path)  # move original to backup
        src_for_resize = backup_path
    else:
        src_for_resize = backup_path  # already backed up from a prior run

    with Image.open(src_for_resize) as img:
        w, h = img.size
        if w > max_width:
            new_h = int(h * (max_width / w))
            img = img.resize((max_width, new_h), Image.LANCZOS)
        # keep PNG (transparency-safe, and og:image/favicon expect it)
        img.save(path, "PNG", optimize=True)

    before = src_for_resize.stat().st_size / 1024
    after = path.stat().st_size / 1024
    print(f"{path.name}: {before:.0f} kB -> {after:.0f} kB")


def main():
    for filename, max_width in TARGETS:
        shrink(IMAGES_DIR / filename, max_width)
    print("\nDone. Originals kept in MainImages/originals_backup/ if you need them.")


if __name__ == "__main__":
    main()
