# Media

Run media through `scripts/optimize-media` before committing. It replaces the
source and keeps the filename when the format does not change; git history
keeps the original. Size images for 2× their display width.

- Image: `./scripts/optimize-media photo.jpg` (JPEG, at most 1800 px wide;
  use `--width 900` for side-by-side).
- GIF: `./scripts/optimize-media clip.gif` → `clip.mp4` plus
  `clip_poster.jpg`; reference it with `{{< loopvideo ... />}}`.
- Video: `./scripts/optimize-media clip.mp4` (H.264, at most 1920 px wide,
  CRF 20).

Before committing, check for media that bypassed the helper:

```
find content -type f \( -name '*.gif' -o -size +2M \)
find content -type f \( -iname '*.jpg' -o -iname '*.png' \) -size +500k
```

Set `FFMPEG=/path/to/ffmpeg` when it is not on PATH.
