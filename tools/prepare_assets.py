"""Copy the author's finished renders into public/projects as web-sized WebP.

Sources are READ ONLY (never moved or modified). Re-run any time:
    python tools/prepare_assets.py
Prints width/height of every output so the numbers in site.config.ts stay correct.
"""
from pathlib import Path
import json
import cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent  # the outputs/ folder with the Blender projects
OUT = ROOT / "public" / "projects"

LARGE = 2000  # long side, px
SMALL = 960

IMAGES = {
    "molly-figure": {
        "cover": "PM_CHARACTER/renders/PM_Funko_ThreeQuarter.png",
        "front": "PM_CHARACTER/renders/PM_Funko_Front.png",
        "side": "PM_CHARACTER/renders/PM_Funko_Side.png",
        "back": "PM_CHARACTER/renders/PM_Funko_Back.png",
        "full-body": "PM_CHARACTER/renders/PM_Funko_FullBody.png",
        "face": "PM_CHARACTER/renders/PM_Funko_Face_Closeup.png",
        "face-sheet": "PM_CHARACTER/renders/PM_Funko_Face_Sheet.png",
        "sitting": "PM_CHARACTER/renders/PM_Funko_Sitting.png",
        "wireframe": "PM_CHARACTER/renders/PM_Funko_Wireframe.png",
        "rig": "PM_CHARACTER/renders/PM_Funko_Rig_Test.png",
    },
    "mollys-room": {
        "cover": "PM_BEDROOM/renders/PM_Bedroom_Hero_v01_1.png",
        "window": "PM_BEDROOM/renders/PM_Bedroom_Window_v01_1.png",
        "desk": "PM_BEDROOM/renders/PM_Bedroom_Desk_v01_1.png",
        "bed": "PM_BEDROOM/renders/PM_Bedroom_Bed_v01_1.png",
        "clay": "PM_BEDROOM/renders/PM_Bedroom_Clay_Overview.png",
    },
    "premium-3d-ad": {
        "cover": "PREMIUM_3D_AD/RENDERS/Main_Poster_1920x1080.png",
        "square": "PREMIUM_3D_AD/RENDERS/Square_Poster_1080x1080.png",
        "chat": "PREMIUM_3D_AD/RENDERS/Chat_Preview_1280x720.png",
        "scene": "PREMIUM_3D_AD/PREVIEWS/Final_Scene_Preview.png",
        "composition": "PREMIUM_3D_AD/PREVIEWS/Composition_Preview.png",
    },
}

# stills pulled from the final animation renders (frame numbers are 0-based)
STILLS = {
    "dream-sequence": ("PM_BEDROOM/STAGE04/renders/final/Stage04_Final_15s_30fps.mp4",
                       {"cover": 150, "still-01": 10, "still-02": 300, "still-03": 370}),
    "dusk-courtyard": ("PM_YARD/renders/Манюнька.mp4",
                       {"cover": 180, "still-01": 5, "still-02": 360}),
    "gothic-fairy": ("GOTHIC_FAIRY_CHAPMAN/RENDERS/final/GOTHIC_FAIRY_CHAPMAN_1080x1920_30fps.mp4",
                     {"cover": 449, "still-01": 0, "still-02": 119, "still-03": 584}),
}

COPY = {  # plain copies (already web-friendly)
    "premium-3d-ad/loop.mp4": "PREMIUM_3D_AD/RENDERS/Animated_Poster_1280x720.mp4",
}


def save(img: Image.Image, slug: str, name: str, report: dict):
    d = OUT / slug
    d.mkdir(parents=True, exist_ok=True)
    img = img.convert("RGB")
    for side, suffix, q in ((LARGE, "", 84), (SMALL, "-sm", 80)):
        im = img.copy()
        im.thumbnail((side, side), Image.LANCZOS)
        im.save(d / f"{name}{suffix}.webp", "WEBP", quality=q, method=6)
        if not suffix:
            report[f"{slug}/{name}"] = im.size


def main():
    report: dict = {}
    for slug, items in IMAGES.items():
        for name, rel in items.items():
            save(Image.open(SRC / rel), slug, name, report)
    for slug, (rel, frames) in STILLS.items():
        cap = cv2.VideoCapture(str(SRC / rel))
        for name, idx in frames.items():
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ok, frame = cap.read()
            if not ok:
                raise SystemExit(f"cannot read frame {idx} of {rel}")
            save(Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)), slug, name, report)
    for dst, rel in COPY.items():
        target = OUT / dst
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((SRC / rel).read_bytes())
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
