# Media

Optimize images and videos before committing a post. Use the helper so the
settings stay consistent:

- Full-width image: `./scripts/optimize-media photo.jpg` → `photo-web.jpg`
  (JPEG, at most 1800 px wide, high quality).
- Side-by-side image: `./scripts/optimize-media --width 900 photo.jpg`.
- GIF: `./scripts/optimize-media clip.gif` → `clip.mp4` plus
  `clip_poster.jpg`. Reference it with `{{< loopvideo ... />}}`.
- Video: `./scripts/optimize-media clip.mp4` → `clip-web.mp4` (H.264, at most
  1920 px wide, CRF 20).

The displayed JPEG is also the download, so size it for 2× the display width.
Point the post at the optimized file and remove the source from `content/`;
git history keeps it. There is no separate full-size link.

Before committing, check for leftover source media:
`find content/blog -type f \( -name '*.gif' -o -size +2M \)`.

The script needs `ffmpeg` and `ffprobe`. Set `FFMPEG=/path/to/ffmpeg` when they
are not on PATH.
