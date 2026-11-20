#!/usr/bin/env python3
"""Process Unwept_Art_Supplement_20261120 into public/art/v2_supplement."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "art_source" / "v2_supplement"
OUT = ROOT / "public" / "art" / "v2_supplement"
CHAR = ROOT / "public" / "characters"
MANIFEST: list[dict] = []

FOOT_CANVAS = (300, 500)
FOOT_Y = 492
ADULT_BODY = 430
PORTRAIT_CANVAS = (360, 420)


def save(im: Image.Image, rel: str, meta: dict | None = None) -> None:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    MANIFEST.append({"out": f"public/art/v2_supplement/{rel}", "size": list(im.size), **(meta or {})})
    print("wrote", rel, im.size)


def black_to_alpha(im: Image.Image, threshold: int = 28) -> Image.Image:
    rgba = im.convert("RGBA")
    arr = np.array(rgba)
    rgb = arr[:, :, :3].astype(np.int16)
    a = arr[:, :, 3].astype(np.int16)
    lum = rgb.max(axis=2)
    # near-black opaque pixels from sheet bg → transparent
    mask = (lum <= threshold) & (a > 0)
    arr[mask, 3] = 0
    # soft fringe: darken alpha on very dark leftover
    soft = (lum <= threshold + 18) & (a > 0) & ~mask
    arr[soft, 3] = (arr[soft, 3] * (lum[soft] - threshold) / 18).clip(0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def opaque_bbox(im: Image.Image, alpha_min: int = 20):
    a = im.getchannel("A")
    return a.point(lambda v: 255 if v >= alpha_min else 0).getbbox()


def place_feet(subject: Image.Image, body_h: int = ADULT_BODY) -> Image.Image:
    sub = subject.convert("RGBA")
    box = opaque_bbox(sub)
    if not box:
        return Image.new("RGBA", FOOT_CANVAS, (0, 0, 0, 0))
    cropped = sub.crop(box)
    scale = body_h / cropped.size[1]
    nw = max(1, int(round(cropped.size[0] * scale)))
    nh = max(1, int(round(cropped.size[1] * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", FOOT_CANVAS, (0, 0, 0, 0))
    x = (FOOT_CANVAS[0] - nw) // 2
    y = FOOT_Y - nh
    canvas.alpha_composite(resized, (x, max(0, y)))
    return canvas


def column_runs(alpha: np.ndarray, min_hit: int = 8, merge_gap: int = 14):
    col = (alpha > 20).sum(axis=0)
    runs = []
    on = False
    start = 0
    for x, v in enumerate(col):
        if v > min_hit and not on:
            on = True
            start = x
        elif v <= min_hit and on:
            on = False
            runs.append([start, x - 1])
    if on:
        runs.append([start, alpha.shape[1] - 1])
    merged = []
    for a, b in runs:
        if b - a < 8:
            continue
        if merged and a - merged[-1][1] < merge_gap:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return merged


def process_backgrounds() -> None:
    """Scale to height 1080 keeping aspect; NO soft-fill / blur padding."""
    mapping = [
        ("backgrounds/reservoir_panorama.png", "backgrounds/shore.png"),
        ("backgrounds/village_entrance_panorama.png", "backgrounds/village_gate.png"),
        ("backgrounds/street_panorama.png", "backgrounds/village_street.png"),
    ]
    for src, dst in mapping:
        im = Image.open(SRC / src).convert("RGB")
        scale = 1080 / im.size[1]
        dw = int(round(im.size[0] * scale))
        dh = 1080
        scaled = im.resize((dw, dh), Image.Resampling.LANCZOS)
        # exact plate — world width must match dw (3240)
        assert dw == 3240, f"unexpected width {dw}"
        save(scaled, dst, {"source": src, "note": "exact scale; no soft fill", "world": [dw, dh]})
        # 1920 opening crop from center-left narrative band
        x0 = max(0, (dw - 1920) // 3)
        save(scaled.crop((x0, 0, x0 + 1920, 1080)), dst.replace(".png", "_opening.png"), {"crop_x": x0})


def process_lantern_walk() -> None:
    raw = Image.open(SRC / "sheets/xiaoman_lantern_walk_8poses.png")
    sheet = black_to_alpha(raw, threshold=24)
    arr = np.array(sheet)
    # Content-bounded runs (not equal eighths). Keep merge_gap tight so stride poses stay separate.
    runs = column_runs(arr[:, :, 3], min_hit=8, merge_gap=10)
    if len(runs) < 8:
        # fallback: luminance on original RGB (sheet painted on black)
        rgb = np.array(raw.convert("RGBA"))
        lum = rgb[:, :, :3].max(axis=2)
        content = (lum > 35).astype(np.uint8)
        col = content.sum(axis=0)
        runs = []
        on = False
        start = 0
        for x, v in enumerate(col):
            if v > 12 and not on:
                on = True
                start = x
            elif v <= 12 and on:
                on = False
                runs.append([start, x - 1])
        if on:
            runs.append([start, content.shape[1] - 1])
    assert len(runs) >= 8, f"expected 8 lantern poses, got {len(runs)}"
    runs = runs[:8]
    frames = []
    for i, (x0, x1) in enumerate(runs):
        pad = 6
        cell = sheet.crop((max(0, x0 - pad), 0, min(sheet.size[0], x1 + pad), sheet.size[1]))
        out = place_feet(cell)
        frames.append(out)
        save(out, f"characters/xiaoman-lamp-{i + 1}.png", {"source": "xiaoman_lantern_walk_8poses", "bounds": [x0, x1]})
    # also mirror into public/characters/scene
    scene = CHAR / "scene"
    scene.mkdir(parents=True, exist_ok=True)
    for i, fr in enumerate(frames):
        fr.save(scene / f"xiaoman-lamp-{i + 1}.png")
    # stand = mid stride with both feet relatively planted: prefer frame 1 or 5
    frames[0].save(scene / "xiaoman-lamp.png")
    MANIFEST.append(
        {
            "note": "lantern walk not validated as seamless; 8 content-bounded frames",
            "frame_bounds": runs,
        }
    )


def process_dialogue() -> None:
    raw = Image.open(SRC / "sheets/xiaoman_dialogue_4expressions.png")
    sheet = black_to_alpha(raw, threshold=22)
    runs = column_runs(np.array(sheet)[:, :, 3], min_hit=10, merge_gap=24)
    assert len(runs) >= 4, f"expected 4 expressions, got {len(runs)}"
    names = ["calm", "speak", "alert", "low"]
    port = CHAR / "portrait"
    port.mkdir(parents=True, exist_ok=True)
    for name, (x0, x1) in zip(names, runs[:4]):
        cell = sheet.crop((max(0, x0 - 8), 0, min(sheet.size[0], x1 + 8), sheet.size[1]))
        box = opaque_bbox(cell)
        if not box:
            continue
        cropped = cell.crop(box)
        target_h = 400
        scale = target_h / cropped.size[1]
        nw = max(1, int(cropped.size[0] * scale))
        nh = max(1, int(cropped.size[1] * scale))
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", PORTRAIT_CANVAS, (0, 0, 0, 0))
        canvas.alpha_composite(resized, ((PORTRAIT_CANVAS[0] - nw) // 2, PORTRAIT_CANVAS[1] - nh))
        save(canvas, f"characters/portrait-xiaoman-{name}.png", {"source": "xiaoman_dialogue_4expressions", "expr": name})
        # wire defaults: calm → portrait-xiaoman.png
        if name == "calm":
            canvas.save(port / "xiaoman.png")
        canvas.save(port / f"xiaoman-{name}.png")


def process_effects() -> None:
    raw = Image.open(SRC / "sheets/effects_ripple_quilt_embers.png")
    sheet = black_to_alpha(raw, threshold=18)
    w, h = sheet.size
    # three content rows by vertical occupancy
    a = np.array(sheet)[:, :, 3]
    row = (a > 15).sum(axis=1)
    bands = []
    on = False
    start = 0
    for y, v in enumerate(row):
        if v > 40 and not on:
            on = True
            start = y
        elif v <= 40 and on:
            on = False
            if y - 1 - start > 40:
                bands.append((start, y - 1))
    if on and h - 1 - start > 40:
        bands.append((start, h - 1))
    # Fixed row bands from sheet layout (top ripples, mid quilt, bottom embers).
    bands = [(20, 310), (320, 640), (650, 1000)]
    labels = ["ripple", "quilt", "ember"]
    for label, (y0, y1) in zip(labels, bands):
        strip = sheet.crop((0, y0, w, y1 + 1))
        # Equal-ish columns only as starting guess; refine each cell by opaque bbox.
        for i in range(4):
            x0 = int(i * w / 4)
            x1 = int((i + 1) * w / 4)
            cell = strip.crop((x0, 0, x1, strip.size[1]))
            box = opaque_bbox(cell, 10)
            if not box:
                continue
            cropped = cell.crop(box)
            pad = 8
            canvas = Image.new("RGBA", (cropped.size[0] + pad * 2, cropped.size[1] + pad * 2), (0, 0, 0, 0))
            canvas.alpha_composite(cropped, (pad, pad))
            save(canvas, f"effects/{label}-{i + 1}.png", {"source": "effects_ripple_quilt_embers", "row": label, "cell": i})


def copy_jianjun_reference_only() -> None:
    """Do not replace full standing art; keep reference for artists."""
    src = SRC / "references/jianjun_hidden_key_gesture.png"
    dst_dir = OUT / "references"
    dst_dir.mkdir(parents=True, exist_ok=True)
    Image.open(src).convert("RGBA").save(dst_dir / "jianjun_hidden_key_gesture.png")
    MANIFEST.append(
        {
            "out": "public/art/v2_supplement/references/jianjun_hidden_key_gesture.png",
            "note": "pose reference only; NOT wired as scene-jianjun",
        }
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    process_backgrounds()
    process_lantern_walk()
    process_dialogue()
    process_effects()
    copy_jianjun_reference_only()
    (OUT / "process_manifest.json").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=2), encoding="utf-8")
    print("done", len(MANIFEST))


if __name__ == "__main__":
    main()
