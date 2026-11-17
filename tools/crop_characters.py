"""Cut individual figures out of the character sheets.

The sheets stay reference boards. This writes one person per file, with feet
aligned on the scene sprites so a walk cycle does not slide.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = Path("/Users/huanganqi/.cursor/projects/Users-huanganqi-Desktop-Unwept-Cursor-Start/assets")
SHEET = {
    "guyu": SRC / "___________-39f7ccb1-c94d-4efa-b212-f0be1f654d31.png",
    "lineup": SRC / "_________-2c2d8e9c-76dc-4f4e-97f0-4843cb5597e4.png",
    "turn": SRC / "___________-34788ed9-f869-4f7a-8069-8e0a1d9c2df8.png",
    "act": SRC / "_______-374bcf2a-2681-4693-9da9-7f1a95c91669.png",
}
REF = ROOT / "02_美术参考" / "人物" / "设定参考"
SCENE = ROOT / "public" / "characters" / "scene"
PORTRAIT = ROOT / "public" / "characters" / "portrait"
HELD = ROOT / "02_美术参考" / "人物" / "可裁切暂缓"


def crop(sheet: str, box: tuple[int, int, int, int]) -> Image.Image:
    image = Image.open(SHEET[sheet]).convert("RGBA")
    x0, y0, x1, y1 = box
    return image.crop((x0, y0, x1 + 1, y1 + 1))


def opaque_bounds(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.array(image)[:, :, 3] > 24
    ys, xs = np.where(alpha)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def trim(image: Image.Image) -> Image.Image:
    x0, y0, x1, y1 = opaque_bounds(image)
    return image.crop((x0, y0, x1 + 1, y1 + 1))


def foot_x(image: Image.Image) -> float:
    alpha = np.array(image)[:, :, 3] > 24
    ys = np.where(alpha)[0]
    bottom = int(ys.max())
    band = alpha[max(0, bottom - 10) : bottom + 1]
    cols = np.where(band.any(axis=0))[0]
    return float(cols.min() + cols.max()) / 2


def place_feet(image: Image.Image, height: int, canvas: tuple[int, int], foot: tuple[int, int]) -> Image.Image:
    trimmed = trim(image)
    scale = height / trimmed.height
    resized = trimmed.resize((max(1, round(trimmed.width * scale)), height), Image.Resampling.LANCZOS)
    board = Image.new("RGBA", canvas, (0, 0, 0, 0))
    fx = foot_x(resized)
    left = round(foot[0] - fx)
    top = foot[1] - resized.height
    board.paste(resized, (left, top), resized)
    return board


def bust(image: Image.Image, fraction: float = 0.52) -> Image.Image:
    trimmed = trim(image)
    height = max(1, round(trimmed.height * fraction))
    return trim(trimmed.crop((0, 0, trimmed.width, height)))


def save(image: Image.Image, path: Path) -> None:
    array = np.array(image)
    red = array[:, :, 0].astype(np.int16)
    green = array[:, :, 1].astype(np.int16)
    blue = array[:, :, 2].astype(np.int16)
    alpha = array[:, :, 3]
    fringe = (alpha < 24) | ((alpha < 48) & (red > 150) & (red > green + 50) & (red > blue + 50) & (green < 110))
    array[fringe, 3] = 0
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(array).save(path)


def main() -> None:
    REF.mkdir(parents=True, exist_ok=True)
    names = {
        "guyu": "谷雨_多视图_设定参考.png",
        "turn": "余小满_转面与表情_设定参考.png",
        "act": "余小满_动作板_设定参考.png",
        "lineup": "正面阵容_设定参考.png",
    }
    for key, filename in names.items():
        Image.open(SHEET[key]).save(REF / filename)

    walk_canvas = (300, 500)
    walk_foot = (150, 492)
    walk_height = 470
    walks = [
        ("xiaoman-1.png", (321, 5, 443, 250)),
        ("xiaoman-2.png", (568, 5, 699, 250)),
        ("xiaoman-3.png", (836, 5, 959, 250)),
    ]
    for filename, box in walks:
        save(place_feet(crop("act", box), walk_height, walk_canvas, walk_foot), SCENE / filename)
    save(place_feet(crop("act", (333, 258, 431, 505)), walk_height, walk_canvas, walk_foot), SCENE / "xiaoman-bowl.png")

    save(place_feet(crop("guyu", (230, 15, 338, 651)), 360, (140, 380), (70, 372)), SCENE / "guyu.png")

    adult_canvas = (220, 500)
    adult_foot = (110, 492)
    lineup_scene = {
        "guifen.png": (229, 16, 333, 336),
        "changgui.png": (530, 6, 643, 336),
        "jianjun.png": (683, 5, 797, 337),
    }
    for filename, box in lineup_scene.items():
        save(place_feet(crop("lineup", box), walk_height, adult_canvas, adult_foot), SCENE / filename)

    portraits = {
        "xiaoman.png": bust(crop("turn", (6, 25, 192, 639))),
        "guyu.png": bust(crop("guyu", (8, 15, 189, 654))),
        "guifen.png": bust(crop("lineup", (229, 16, 333, 336))),
        "changgui.png": bust(crop("lineup", (530, 6, 643, 336))),
        "jianjun.png": bust(crop("lineup", (683, 5, 797, 337))),
    }
    for filename, image in portraits.items():
        save(image, PORTRAIT / filename)

    held = {
        "余小满_正面站立.png": crop("act", (97, 4, 174, 251)),
        "余小满_提箱.png": crop("act", (71, 266, 187, 508)),
        "余小满_侧面提箱.png": crop("turn", (199, 25, 316, 634)),
        "余小满_表情_平视.png": crop("turn", (670, 54, 837, 283)),
        "余小满_表情_侧脸.png": crop("turn", (843, 54, 1015, 284)),
        "余小满_表情_含泪.png": crop("turn", (670, 334, 844, 573)),
        "余小满_表情_闭眼.png": crop("turn", (848, 332, 1021, 574)),
        "谷雨_蹲听_含木柱.png": crop("guyu", (581, 315, 797, 658)),
        "谷雨_坐地.png": crop("guyu", (796, 312, 1017, 657)),
        "谷雨_抱作业本.png": crop("guyu", (682, 11, 869, 318)),
        "周启明_正面.png": crop("lineup", (65, 3, 192, 337)),
        "年长女性_正面.png": crop("lineup", (374, 15, 496, 336)),
        "白褂记录者_正面.png": crop("lineup", (836, 5, 960, 337)),
    }
    for filename, image in held.items():
        save(trim(image), HELD / filename)

    print("scene", sorted(p.name for p in SCENE.glob("*.png")))
    print("portrait", sorted(p.name for p in PORTRAIT.glob("*.png")))
    print("held", sorted(p.name for p in HELD.glob("*.png")))


if __name__ == "__main__":
    main()
