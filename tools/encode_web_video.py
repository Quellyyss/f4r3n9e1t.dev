"""Re-encode a finished animation into a light web MP4 (H.264 + AAC) with Blender's bundled FFmpeg.

    blender -b --factory-startup --python tools/encode_web_video.py -- <src.mp4> <dst.mp4> [height]

The source file is only read. Default output height is 1280 (keeps the source aspect ratio).
"""
import sys
import bpy

argv = sys.argv[sys.argv.index("--") + 1:]
src, dst = argv[0], argv[1]
height = int(argv[2]) if len(argv) > 2 else 1280

scene = bpy.context.scene
ed = scene.sequence_editor_create()
strips = ed.strips if hasattr(ed, "strips") else ed.sequences  # Blender 5.x / 4.x
movie = strips.new_movie("clip", src, 1, 1)


def has_audio(path):
    """True when the MP4 declares a sound track (hdlr 'soun')."""
    import re
    data = open(path, "rb").read()
    return any(data[m.start() + 12:m.start() + 16] == b"soun" for m in re.finditer(rb"hdlr", data))


audio = has_audio(src)
if audio:
    strips.new_sound("audio", src, 2, 1)
else:
    print("source has no audio track - encoding video only")

clip = bpy.data.movieclips.load(src)  # reliable source size + fps
w, h = clip.size
fps = clip.fps or movie.fps
scene.render.fps = round(fps)
scene.render.fps_base = round(fps) / fps
scene.frame_start = 1
scene.frame_end = movie.frame_final_duration
scene.render.resolution_y = height
scene.render.resolution_x = round(w * height / h / 2) * 2
scene.render.resolution_percentage = 100

r = scene.render
if hasattr(r.image_settings, "media_type"):  # Blender 5.x
    r.image_settings.media_type = "VIDEO"
r.image_settings.file_format = "FFMPEG"
r.ffmpeg.format = "MPEG4"
r.ffmpeg.codec = "H264"
r.ffmpeg.constant_rate_factor = "MEDIUM"
r.ffmpeg.ffmpeg_preset = "GOOD"
r.ffmpeg.gopsize = round(fps)
r.ffmpeg.audio_codec = "AAC" if audio else "NONE"
if audio:
    r.ffmpeg.audio_bitrate = 160
r.filepath = dst
r.use_file_extension = False
bpy.ops.render.render(animation=True)
print("encoded", dst, r.resolution_x, "x", r.resolution_y, scene.frame_end, "frames")
