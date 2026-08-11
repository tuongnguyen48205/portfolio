#!/usr/bin/env python3
"""
Generates thumbnails for every image sitting next to this script.

No index.html, no HTML parsing required - it just looks at its own folder.

Requires Pillow:  pip install Pillow

For every image file in this script's folder (jpg, jpeg, png, webp, gif,
bmp, tiff), creates a resized WebP thumbnail in the SAME folder, named:

  photo.jpg   ->  photo_thumb.webp

Your original files are never modified. Existing *_thumb.webp files are
skipped so re-running the script won't try to thumbnail its own output.
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: pip install Pillow")
    sys.exit(1)

THUMB_MAX_WIDTH = 640   # px - matches typical grid slot size
THUMB_QUALITY = 78      # WebP quality (0-100)
THUMB_SUFFIX = "_thumb"

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"}

ROOT = Path(__file__).parent


def find_source_images():
    images = []
    for path in ROOT.iterdir():
        if not path.is_file():
            continue
        if path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        if path.stem.endswith(THUMB_SUFFIX):
            continue  # skip thumbnails from a previous run
        images.append(path)
    return sorted(images)


def make_thumbnail(src_path: Path, out_path: Path):
    with Image.open(src_path) as img:
        img = img.convert("RGB") if img.mode in ("P", "RGBA") else img
        w, h = img.size
        if w > THUMB_MAX_WIDTH:
            new_h = int(h * (THUMB_MAX_WIDTH / w))
            img = img.resize((THUMB_MAX_WIDTH, new_h), Image.LANCZOS)
        img.save(out_path, "WEBP", quality=THUMB_QUALITY, method=6)


def main():
    images = find_source_images()
    print(f"Found {len(images)} image(s) in {ROOT}\n")

    made, skipped = 0, 0
    for src_path in images:
        out_path = src_path.with_name(f"{src_path.stem}{THUMB_SUFFIX}.webp")
        if out_path.exists():
            print(f"{src_path.name}  ->  {out_path.name}  (already exists, skipped)")
            skipped += 1
            continue
        print(f"{src_path.name}  ->  {out_path.name}")
        make_thumbnail(src_path, out_path)
        made += 1

    print(f"\nDone. {made} thumbnails created, {skipped} skipped (already existed).")


if __name__ == "__main__":
    main()