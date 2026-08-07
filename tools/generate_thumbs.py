#!/usr/bin/env python3
"""
Batch-generates lightbox thumbnails for the portfolio site.
Run this from your project root (same folder as index.html).

Requires Pillow:  pip install Pillow

For every image referenced in index.html's .img-slot elements, this creates
a resized WebP copy in a "thumbs" subfolder next to the original, e.g.:

  Projects/PersonalSoftware/ImageEditor/imageeditorscreen.jpg
    -> Projects/PersonalSoftware/ImageEditor/thumbs/imageeditorscreen.webp

Your original files are never modified.
"""

import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required: pip install Pillow")
    sys.exit(1)

THUMB_MAX_WIDTH = 640   # px - matches typical grid slot size
THUMB_QUALITY = 78      # WebP quality (0-100)

ROOT = Path(__file__).parent
HTML_FILE = ROOT / "index.html"


def find_image_pairs(html_text):
    """Extract (original_src, thumb_src) pairs from data-full attributes."""
    pattern = re.compile(r'src="([^"]+/thumbs/[^"]+\.webp)"\s+data-full="([^"]+)"')
    return [(full, thumb) for thumb, full in pattern.findall(html_text)]


def make_thumbnail(src_path: Path, out_path: Path):
    if not src_path.exists():
        print(f"  MISSING source, skipped: {src_path}")
        return False
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as img:
        img = img.convert("RGB") if img.mode in ("P", "RGBA") else img
        w, h = img.size
        if w > THUMB_MAX_WIDTH:
            new_h = int(h * (THUMB_MAX_WIDTH / w))
            img = img.resize((THUMB_MAX_WIDTH, new_h), Image.LANCZOS)
        img.save(out_path, "WEBP", quality=THUMB_QUALITY, method=6)
    return True


def main():
    if not HTML_FILE.exists():
        print("index.html not found next to this script. Run it from your project root.")
        sys.exit(1)

    html_text = HTML_FILE.read_text(encoding="utf-8")
    pairs = find_image_pairs(html_text)
    print(f"Found {len(pairs)} images to process.\n")

    made, skipped = 0, 0
    for orig_rel, thumb_rel in pairs:
        src_path = ROOT / orig_rel
        out_path = ROOT / thumb_rel
        print(f"{orig_rel}  ->  {thumb_rel}")
        if make_thumbnail(src_path, out_path):
            made += 1
        else:
            skipped += 1

    print(f"\nDone. {made} thumbnails created, {skipped} skipped (missing source).")


if __name__ == "__main__":
    main()
