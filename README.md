# ClubMode Reels

Paste a SwingVision link (or upload the match video), pick one player, and get a
vertical 1080×1920 highlight reel ready to post on Instagram Reels/Stories or Facebook.

## How it works

1. **Import.** `lib/ingest.js` reads the public SwingVision share page
   (`swing.vision/matches/…` or a highlight link) and looks for the embedded video:
   `og:video`, `<video>`/`<source>` tags, HLS/MP4 URLs in page JSON, and finally
   `yt-dlp` if it's installed. If the page carries point timestamps in JSON, those
   are used as clips. Direct `.mp4`/`.m3u8` links and file uploads also work.
2. **Find rallies.** `lib/detect.js` band-passes the court audio (1–6 kHz) and
   finds ball strikes as sharp energy spikes, then groups strikes into rallies
   (≥3 shots, a gap of more than 3.2 s ends a rally). Each rally becomes a clip
   with padding, capped at 16 s and keeping the ending.
3. **Track the player.** `lib/track.js` frame-differences a 160×90 copy of
   the video at 5 fps. The near player moves in the bottom band of the frame and
   the far player above the net. That gives a smoothed horizontal path used to
   aim the vertical crop and to rank clips by how active that player is.
4. **Review.** In the UI you choose the player's name and side and adjust the
   auto-picked clips (about 50 s). You can scrub the match and add any moment
   detection missed.
5. **Render.** `lib/render.js` uses ffmpeg to build an intro card, each rally
   with name/subtitle/shot-count overlays, a 0.5× slow-mo replay of the best
   point, and a branded outro, plus an optional music bed. Layouts:
   - **Focus** (default): a sharp band that follows the player over a blurred fill.
   - **Full court**: the whole landscape frame over a blurred fill.
   - **Tight**: a full-screen 9:16 crop that follows the player.
6. **Share.** On phones, **Share** uses the Web Share API to hand the MP4 to the
   share sheet (Instagram, Facebook, Messages…) and copies a ready-made caption.
   On desktop you download it.

## Run

Requires Node 20+ and ffmpeg (with libx264 and libfreetype).

```sh
npm install
npm start            # http://localhost:3000
npm test             # unit + end-to-end render tests (~1.5 min)
```

Or with Docker: `docker build -t clubmode-reels . && docker run -p 3000:3000 -v reels:/data clubmode-reels`.

| Env var | Default | |
|---|---|---|
| `PORT` | 3000 | |
| `DATA_DIR` | `./data` | uploads, sources, rendered reels |
| `RETENTION_HOURS` | 48 | files older than this are deleted |
| `MAX_UPLOAD_MB` | 4096 | |
| `JOB_CONCURRENCY` | 2 | parallel import/render jobs |
| `BRAND_NAME` | ClubMode | text on intro/outro and in the UI |
| `X264_PRESET` | veryfast | slower = smaller files |
| `YTDLP_PATH` | `yt-dlp` | optional fallback downloader |

## Known limits / next steps

- **SwingVision has no public API.** Link import reads the public share page.
  This hasn't been verified against a live page yet (the build sandbox couldn't
  reach swing.vision). If SwingVision loads the video only after sign-in, use the
  upload path or get partner/API access. Check SwingVision's terms before
  importing other people's matches at scale.
- **Detection is heuristic.** Audio works well for singles footage from the
  SwingVision mount. Noisy indoor courts can produce extra clips, which the user
  deselects. Who *won* each point isn't known without SwingVision's point data.
- **Doubles:** "near/far side" tracks the most active player on that side.
- **Direct posting** (no share sheet) needs the Meta Graph API: Instagram
  Business/Creator accounts only, plus Meta app review.
- State is in memory plus JSON on disk with a single process and no auth. Add
  accounts, object storage (S3/R2), and a real queue before a public launch.
