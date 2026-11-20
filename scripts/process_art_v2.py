#!/usr/bin/env python3
"""Crop and clean Unwept art_source/v2 into public/art/v2 production sheets."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "art_source" / "v2"
OUT = ROOT / "public" / "art" / "v2"
MANIFEST: list[dict] = []

FOOT_CANVAS = (300, 500)
FOOT_Y = 492
ADULT_BODY = 430
CHILD_BODY = 300


def save(im: Image.Image, rel: str, meta: dict | None = None) -> None:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    entry = {"out": f"public/art/v2/{rel}", "size": list(im.size), **(meta or {})}
    MANIFEST.append(entry)
    print(f"wrote {rel} {im.size}")


def clean_halo(im: Image.Image, threshold: int = 18) -> Image.Image:
    """Remove soft dark/light fringe around opaque subjects on near-black or flat plates."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            # Near-black soft fringe from sheet background
            if a < 40 and r < 40 and g < 40 and b < 40:
                px[x, y] = (0, 0, 0, 0)
                continue
            if a < 210 and r < threshold and g < threshold and b < threshold:
                px[x, y] = (0, 0, 0, 0)
    return rgba


def opaque_bbox(im: Image.Image, alpha_min: int = 24) -> tuple[int, int, int, int] | None:
    a = im.getchannel("A")
    mask = a.point(lambda v: 255 if v >= alpha_min else 0)
    return mask.getbbox()


def place_feet(
    subject: Image.Image,
    canvas_size: tuple[int, int] = FOOT_CANVAS,
    foot_y: int = FOOT_Y,
    body_h: int = ADULT_BODY,
) -> Image.Image:
    """Scale by body height, put feet on shared baseline, center horizontally."""
    sub = clean_halo(subject)
    box = opaque_bbox(sub)
    if not box:
        return Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    cropped = sub.crop(box)
    cw, ch = cropped.size
    scale = body_h / ch
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = (canvas_size[0] - nw) // 2
    y = foot_y - nh
    canvas.alpha_composite(resized, (x, max(0, y)))
    return canvas


def grid_cells(im: Image.Image, cols: int, rows: int) -> list[Image.Image]:
    w, h = im.size
    cw, ch = w // cols, h // rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cells.append(im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)))
    return cells


def process_xiaoman_motion() -> None:
    sheet = Image.open(SRC / "02_characters/xiaoman_motion_4x3.png")
    cells = grid_cells(sheet, 4, 3)
    names = [
        "xiaoman-stand",
        "xiaoman-1",
        "xiaoman-2",
        "xiaoman-3",
        "xiaoman-bowl-stand",
        "xiaoman-bowl-1",
        "xiaoman-bowl-2",
        "xiaoman-bowl-3",
        "xiaoman-carry-stand",
        "xiaoman-carry-1",
        "xiaoman-carry-2",
        "xiaoman-carry-3",
    ]
    for name, cell in zip(names, cells):
        out = place_feet(cell, body_h=ADULT_BODY)
        save(out, f"characters/{name}.png", {"source": "xiaoman_motion_4x3", "role": name})


def process_cast() -> None:
    sheet = Image.open(SRC / "02_characters/cast_6.png")
    # six figures left→right: xiaoman, guifen, changgui, jianjun, guyu, yupo
    names = ["cast-xiaoman", "guifen", "changgui", "jianjun", "guyu", "yupo"]
    bodies = [ADULT_BODY, ADULT_BODY, ADULT_BODY, ADULT_BODY, CHILD_BODY, ADULT_BODY]
    w, h = sheet.size
    # split by finding vertical gutters of empty/near-black
    px = sheet.convert("RGBA").load()
    col_has = []
    for x in range(w):
        hit = False
        for y in range(h):
            r, g, b, a = px[x, y]
            if a > 40 and (r + g + b) > 40:
                hit = True
                break
        col_has.append(hit)
    ranges: list[tuple[int, int]] = []
    start = None
    for x, hit in enumerate(col_has):
        if hit and start is None:
            start = x
        elif not hit and start is not None:
            ranges.append((start, x))
            start = None
    if start is not None:
        ranges.append((start, w))
    # merge tiny fragments
    merged: list[tuple[int, int]] = []
    for a, b in ranges:
        if b - a < 20:
            continue
        if merged and a - merged[-1][1] < 12:
            merged[-1] = (merged[-1][0], b)
        else:
            merged.append((a, b))
    assert len(merged) >= 6, f"expected 6 cast columns, got {len(merged)}"
    # take six largest / evenly spaced if more
    if len(merged) > 6:
        merged = sorted(merged, key=lambda t: t[1] - t[0], reverse=True)[:6]
        merged.sort(key=lambda t: t[0])
    for name, body, (x0, x1) in zip(names, bodies, merged[:6]):
        pad = 8
        cell = sheet.crop((max(0, x0 - pad), 0, min(w, x1 + pad), h))
        out = place_feet(cell, body_h=body)
        save(out, f"characters/{name}.png", {"source": "cast_6", "role": name})


def process_portraits() -> None:
    sheet = Image.open(SRC / "02_characters/portraits_4x2.png")
    cells = grid_cells(sheet, 4, 2)
    names = [
        "xiaoman",
        "xiaoman-look",
        "xiaoman-cry",
        "xiaoman-grief",
        "guifen",
        "changgui",
        "jianjun",
        "guyu",
    ]
    for name, cell in zip(names, cells):
        sub = clean_halo(cell)
        box = opaque_bbox(sub)
        if not box:
            continue
        cropped = sub.crop(box)
        # portrait canvas 360×420, subject bottom-aligned
        canvas = Image.new("RGBA", (360, 420), (0, 0, 0, 0))
        target_h = 400
        scale = target_h / cropped.size[1]
        nw = max(1, int(cropped.size[0] * scale))
        nh = max(1, int(cropped.size[1] * scale))
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        x = (360 - nw) // 2
        y = 420 - nh
        canvas.alpha_composite(resized, (x, max(0, y)))
        save(canvas, f"characters/portrait-{name}.png", {"source": "portraits_4x2"})


def process_special() -> None:
    sheet = Image.open(SRC / "02_characters/special_actions_4x2.png")
    cells = grid_cells(sheet, 4, 2)
    names = [
        "xiaoman-lamp",
        "xiaoman-throat",
        "xiaoman-place-bowl",
        "xiaoman-pack-lamp",
        "guifen-cloth",
        "changgui-work",
        "jianjun-keys",  # keys visible — keep file but do not wire as default stand
        "guyu-squat",
    ]
    bodies = [ADULT_BODY, ADULT_BODY, ADULT_BODY, ADULT_BODY, ADULT_BODY, ADULT_BODY, ADULT_BODY, CHILD_BODY]
    for name, cell, body in zip(names, cells, bodies):
        out = place_feet(cell, body_h=body)
        save(out, f"characters/{name}.png", {"source": "special_actions_4x2", "role": name})


def process_props() -> None:
    sheet = Image.open(SRC / "03_props/props_5x4.png")
    cells = grid_cells(sheet, 5, 4)
    names = [
        "chest-closed",
        "chest-open",
        "bowl",
        "sock-cover",
        "lamp",
        "stool",
        "cloth-long",
        "cloth-needle",
        "cloth-fold",
        "needle",
        "book-closed",
        "book-open",
        "chalk",
        "wood-tag",
        "key",
        "gong",
        "wood-post",
        "boat",
        "footprints",
        "reeds",
    ]
    for name, cell in zip(names, cells):
        sub = clean_halo(cell)
        box = opaque_bbox(sub)
        if not box:
            continue
        cropped = sub.crop(box)
        # pad 8px
        pad = 8
        canvas = Image.new("RGBA", (cropped.size[0] + pad * 2, cropped.size[1] + pad * 2), (0, 0, 0, 0))
        canvas.alpha_composite(cropped, (pad, pad))
        save(canvas, f"props/{name}.png", {"source": "props_5x4"})


def process_closeups() -> None:
    for src_name, out_prefix, cols, rows, labels in [
        (
            "04_closeups/street_observations_2x2.png",
            "closeups",
            2,
            2,
            ["stove", "window-lamp", "window-bed", "bowl-bed"],
        ),
        (
            "04_closeups/memorial_cloths_lamp_2x2.png",
            "closeups",
            2,
            2,
            ["portrait-elder", "cloths-hanging", "lamp-split", "lamp-steady"],
        ),
    ]:
        sheet = Image.open(SRC / src_name)
        cells = grid_cells(sheet, cols, rows)
        for label, cell in zip(labels, cells):
            # RGB plates: keep as opaque closeup cards
            rgb = cell.convert("RGB")
            save(rgb, f"{out_prefix}/{label}.png", {"source": src_name})


def process_ui() -> None:
    sheet = Image.open(SRC / "05_ui/ui_components.png").convert("RGBA")
    # Extract large header bar (top), journal (mid-left), frames, slots by content bbox heuristics
    w, h = sheet.size
    # top bar: scan first 20% height for longest opaque row cluster
    cells_guess = [
        ("ui-header", (40, 20, w - 40, 120)),
        ("ui-btn-dark", (40, 140, 420, 220)),
        ("ui-btn-mid", (460, 140, 900, 220)),
        ("ui-btn-mute", (940, 140, 1380, 220)),
        ("ui-journal", (40, 250, 780, 780)),
        ("ui-frame-a", (820, 260, 1120, 700)),
        ("ui-frame-b", (1160, 260, 1460, 700)),
    ]
    for name, box in cells_guess:
        cell = sheet.crop(box)
        sub = clean_halo(cell)
        bb = opaque_bbox(sub)
        if not bb:
            continue
        save(sub.crop(bb), f"ui/{name}.png", {"source": "ui_components", "crop": list(box)})
    # inventory slots row ~ y 820-980
    slots = sheet.crop((40, 800, 1100, 980))
    sub = clean_halo(slots)
    bb = opaque_bbox(sub)
    if bb:
        save(sub.crop(bb), "ui/ui-slots.png", {"source": "ui_components"})
    arrow = sheet.crop((1200, 850, 1500, 1000))
    sub = clean_halo(arrow)
    bb = opaque_bbox(sub)
    if bb:
        save(sub.crop(bb), "ui/ui-arrow.png", {"source": "ui_components"})


def extend_background(plate: Image.Image, world_w: int, world_h: int = 1080) -> tuple[Image.Image, dict]:
    """Keep aspect ratio: scale to world_h, soft-fill left/right gaps; never non-uniform stretch."""
    src = plate.convert("RGB")
    scale = world_h / src.size[1]
    dw = int(round(src.size[0] * scale))
    dh = world_h
    scaled = src.resize((dw, dh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (world_w, world_h))
    # sample edge colors
    left_col = scaled.crop((0, 0, 1, dh)).resize((1, dh))
    right_col = scaled.crop((dw - 1, 0, dw, dh)).resize((1, dh))
    # place plate so walkable path (lower third) is covered; prefer left-align for wet→exit narrative
    # shore: leave a little left margin for wet mud off-plate feel, but keep plate covering minX..maxX as much as possible
    x0 = max(0, (world_w - dw) // 2) if world_w - dw < 400 else 0
    if x0 == 0 and dw < world_w:
        # left-align, fill right
        pass
    else:
        x0 = max(0, (world_w - dw) // 2)

    # fill
    for x in range(0, x0):
        canvas.paste(left_col, (x, 0))
    canvas.paste(scaled, (x0, 0))
    for x in range(x0 + dw, world_w):
        canvas.paste(right_col, (x, 0))

    # mild blur only on fill strips to hide hard edge
    if x0 > 0:
        strip = canvas.crop((0, 0, x0 + 24, dh)).filter(ImageFilter.GaussianBlur(8))
        canvas.paste(strip, (0, 0))
        canvas.paste(scaled, (x0, 0))
    if x0 + dw < world_w:
        left = max(0, x0 + dw - 24)
        strip = canvas.crop((left, 0, world_w, dh)).filter(ImageFilter.GaussianBlur(8))
        canvas.paste(strip, (left, 0))
        canvas.paste(scaled, (x0, 0))

    meta = {
        "source_size": list(src.size),
        "scaled_size": [dw, dh],
        "placed_x": x0,
        "world": [world_w, world_h],
        "fill_left": x0,
        "fill_right": max(0, world_w - (x0 + dw)),
        "note": "edge soft-fill only; needs painted extension if fill > 0",
    }
    return canvas, meta


def process_backgrounds() -> None:
    mapping = [
        ("01_backgrounds/shore.png", "backgrounds/shore.png", 5200),
        ("01_backgrounds/village_gate.png", "backgrounds/village_gate.png", 4000),
        ("01_backgrounds/mourning_hall.png", "backgrounds/mourning_hall.png", 3600),
        ("01_backgrounds/village_street.png", "backgrounds/village_street.png", 4600),
        ("01_backgrounds/opening_room.png", "backgrounds/opening_room.png", 1920),
        ("01_backgrounds/title.png", "backgrounds/title.png", 1920),
    ]
    for src, out, world_w in mapping:
        plate = Image.open(SRC / src)
        if world_w == 1920:
            # title / opening: fit 1920×1080 with letterbox or cover height, keep ratio
            src_im = plate.convert("RGB")
            # cover height 1080, center crop/pad width to 1920
            scale = 1080 / src_im.size[1]
            dw = int(src_im.size[0] * scale)
            dh = 1080
            scaled = src_im.resize((dw, dh), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (1920, 1080))
            if dw >= 1920:
                x0 = (dw - 1920) // 2
                canvas = scaled.crop((x0, 0, x0 + 1920, 1080))
                meta = {"scaled_size": [dw, dh], "crop_x": x0, "world": [1920, 1080]}
            else:
                x0 = (1920 - dw) // 2
                left = scaled.crop((0, 0, 1, dh)).resize((1, dh))
                right = scaled.crop((dw - 1, 0, dw, dh)).resize((1, dh))
                for x in range(0, x0):
                    canvas.paste(left, (x, 0))
                canvas.paste(scaled, (x0, 0))
                for x in range(x0 + dw, 1920):
                    canvas.paste(right, (x, 0))
                meta = {"scaled_size": [dw, dh], "placed_x": x0, "fill": 1920 - dw, "world": [1920, 1080]}
            save(canvas, out, {"source": src, **meta})
        else:
            canvas, meta = extend_background(plate, world_w)
            save(canvas, out, {"source": src, **meta})


def count_cloth_strips() -> None:
    im = Image.open(OUT / "closeups/cloths-hanging.png").convert("RGB")
    # rough vertical strip count for ART_REPLACEMENT note
    w, h = im.size
    gray = ImageOps.grayscale(im)
    px = gray.load()
    # sample mid band
    hits = []
    y0, y1 = int(h * 0.25), int(h * 0.75)
    for x in range(w):
        bright = sum(1 for y in range(y0, y1, 4) if px[x, y] > 160)
        hits.append(bright > (y1 - y0) // 16)
    runs = 0
    on = False
    for hflag in hits:
        if hflag and not on:
            runs += 1
            on = True
        elif not hflag:
            on = False
    MANIFEST.append({"note": "cloths-hanging rough vertical run count", "approx_strips": runs})


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    process_xiaoman_motion()
    process_cast()
    process_portraits()
    process_special()
    process_props()
    process_closeups()
    process_ui()
    process_backgrounds()
    count_cloth_strips()
    # also mirror key character sheets into public/characters for BootScene path compatibility
    char_dir = ROOT / "public" / "characters"
    scene_dir = char_dir / "scene"
    port_dir = char_dir / "portrait"
    scene_dir.mkdir(parents=True, exist_ok=True)
    port_dir.mkdir(parents=True, exist_ok=True)
    copies = {
        "xiaoman-stand.png": "scene/xiaoman-stand.png",
        "xiaoman-1.png": "scene/xiaoman-1.png",
        "xiaoman-2.png": "scene/xiaoman-2.png",
        "xiaoman-3.png": "scene/xiaoman-3.png",
        "xiaoman-bowl-stand.png": "scene/xiaoman-bowl.png",
        "xiaoman-bowl-1.png": "scene/xiaoman-bowl-1.png",
        "xiaoman-bowl-2.png": "scene/xiaoman-bowl-2.png",
        "xiaoman-bowl-3.png": "scene/xiaoman-bowl-3.png",
        "xiaoman-carry-stand.png": "scene/xiaoman-carry.png",
        "xiaoman-carry-1.png": "scene/xiaoman-carry-1.png",
        "xiaoman-carry-2.png": "scene/xiaoman-carry-2.png",
        "xiaoman-carry-3.png": "scene/xiaoman-carry-3.png",
        "xiaoman-lamp.png": "scene/xiaoman-lamp.png",
        "xiaoman-throat.png": "scene/xiaoman-throat.png",
        "guifen.png": "scene/guifen.png",
        "changgui.png": "scene/changgui.png",
        "jianjun.png": "scene/jianjun.png",
        "guyu.png": "scene/guyu.png",
    }
    for src, dst in copies.items():
        im = Image.open(OUT / "characters" / src)
        path = char_dir / dst
        path.parent.mkdir(parents=True, exist_ok=True)
        # keep previous as .bak once
        if path.exists() and not path.with_suffix(path.suffix + ".bak").exists():
            path.rename(path.with_suffix(path.suffix + ".bak"))
        im.save(path)
        print(f"mirrored {dst}")
    for name in ["xiaoman", "guifen", "changgui", "jianjun", "guyu"]:
        src = OUT / "characters" / f"portrait-{name}.png"
        dst = port_dir / f"{name}.png"
        if dst.exists() and not dst.with_suffix(dst.suffix + ".bak").exists():
            dst.rename(dst.with_suffix(dst.suffix + ".bak"))
        Image.open(src).save(dst)
        print(f"mirrored portrait/{name}.png")

    (OUT / "process_manifest.json").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"done, {len(MANIFEST)} entries")


if __name__ == "__main__":
    main()
