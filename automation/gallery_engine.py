#!/usr/bin/env python3
"""
gallery_engine.py — Moteur album photo Dinédit

Parcourt sites/dinedit-site/photos/ récursivement, compresse chaque image
(max 2400 px sur le long côté, JPEG quality 82), copie vers public/images/
gallery/ en préservant la structure, et génère public/gallery_data.json
avec les tags (thème + event_slug) pour chaque photo.

Conventions :
    photos/<theme>/**/*.{jpg,jpeg,png}         → themes=[<theme>], event_slug=None
    photos/events/<slug>/<prefix>-*.jpg        → themes=[<prefix>] si valide,
                                                  event_slug=<slug>
    Préfixes reconnus dans events/<slug>/ :
        ambiance-*, table-*, portrait-*, lieu-*

Usage :
    python3 automation/gallery_engine.py            # traite tout
    python3 automation/gallery_engine.py --dry-run  # liste sans écrire
"""

import argparse, json, sys
from datetime import datetime, timezone
from pathlib import Path

APP_ROOT     = Path(__file__).resolve().parent.parent
PHOTOS_SRC   = APP_ROOT / "photos"
GALLERY_OUT  = APP_ROOT / "public" / "images" / "gallery"
GALLERY_DATA = APP_ROOT / "public" / "gallery_data.json"

THEMES = ("ambiances", "table-scenographie", "portraits", "lieux")
EVENT_PREFIX_TO_THEME = {
    "ambiance": "ambiances",
    "table":    "table-scenographie",
    "portrait": "portraits",
    "lieu":     "lieux",
}

MAX_SIDE     = 2400
JPEG_QUALITY = 82
VALID_EXT    = {".jpg", ".jpeg", ".png"}


def _pillow():
    try:
        from PIL import Image
        return Image
    except ImportError:
        print("[ERROR] Pillow requis. `pip install Pillow`.")
        sys.exit(1)


def _tags_for(path_rel_photos):
    """Renvoie (themes:list, event_slug:str|None) depuis un chemin relatif à photos/."""
    parts = path_rel_photos.parts
    if not parts:
        return [], None
    # Case-insensitive : `Portraits/` == `portraits/`, `EVENTS/` == `events/`.
    # macOS/Windows sont case-insensitive côté FS mais Python compare des strings —
    # on normalise pour éviter les surprises quand un contributeur nomme un dossier
    # avec majuscule initiale.
    head_lc = parts[0].lower()
    if head_lc == "events" and len(parts) >= 3:
        event_slug = parts[1]
        filename = path_rel_photos.name.lower()
        # préfixe avant premier tiret ou premier chiffre
        prefix = filename.split("-", 1)[0].split(".", 1)[0]
        theme = EVENT_PREFIX_TO_THEME.get(prefix)
        return ([theme] if theme else []), event_slug
    if head_lc in THEMES:
        return [head_lc], None
    return [], None


def _resize_and_save(src, dst, Image):
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(src)
    # convertir RGBA -> RGB pour JPEG
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    w, h = img.size
    scale = min(1.0, MAX_SIDE / max(w, h))
    if scale < 1.0:
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    # toujours écrire en JPEG (uniformise le pipeline)
    dst_jpg = dst.with_suffix(".jpg")
    img.save(dst_jpg, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    return dst_jpg


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not PHOTOS_SRC.exists():
        print(f"[INFO] {PHOTOS_SRC} n'existe pas — rien à traiter.")
        return

    photos = []
    all_events = set()
    for src in sorted(PHOTOS_SRC.rglob("*")):
        if src.is_dir() or src.suffix.lower() not in VALID_EXT:
            continue
        rel = src.relative_to(PHOTOS_SRC)
        themes, event_slug = _tags_for(rel)
        if event_slug:
            all_events.add(event_slug)
        # chemin de sortie sous public/images/gallery/
        dst_rel = rel.with_suffix(".jpg")
        dst_public_path = "/images/gallery/" + str(dst_rel).replace("\\", "/")
        alt = src.stem.replace("-", " ").replace("_", " ").strip()

        if args.dry_run:
            print(f"  - {rel}  themes={themes}  event={event_slug or '-'}")
        else:
            Image = _pillow()
            dst = GALLERY_OUT / dst_rel
            _resize_and_save(src, dst, Image)

        photos.append({
            "src": dst_public_path,
            "alt": alt or "Dinédit",
            "themes": themes,
            "event_slug": event_slug,
        })

    if args.dry_run:
        print(f"\n[DRY-RUN] {len(photos)} photos vues.")
        return

    used_themes = sorted({th for p in photos for th in p["themes"]})
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "photos": photos,
        "themes": [t for t in THEMES if t in used_themes],
        "events": sorted(all_events),
    }
    GALLERY_DATA.parent.mkdir(parents=True, exist_ok=True)
    GALLERY_DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[GALLERY] {len(photos)} photos, {len(used_themes)} thèmes, {len(all_events)} events → {GALLERY_DATA.name}")


if __name__ == "__main__":
    main()
