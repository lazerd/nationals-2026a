# ClubMode Reels

Paste a SwingVision or YouTube link (or upload the match video), pick one player,
and get a vertical 1080×1920 highlight reel ready to post on Instagram
Reels/Stories or Facebook. Choose **My winners** to get just the points you won,
including in doubles.

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
4. **My winners (doubles-aware), `lib/identify.js`:**
   - *Which end hit the last ball.* Shots alternate between the two ends, and
     near-end strikes are louder on the camera's mic. Comparing odd and even
     strikes in each exchange labels every strike near or far. The final,
     unreturned strike tells you which team ended the point.
   - *Which team is yours.* You pause the video, tap your shirt, then tap
     the top of the net. From the net tap and an empty-court image (per-pixel
     median of frames across the match) we find the net base and the near
     baseline from the white lines, which gives the playing area. Color
     doesn't work for this: in tree shade the apron matches the court. Only
     moving pixels inside that area count, so fences, trees, shade and
     neighbouring courts are ignored. Your look is sampled as head or cap,
     shirt, and shorts. That's needed because a muted shirt alone can match
     a partner's dark shorts. Your end of the court is decided by where your
     feet are relative to the net base, so changes of ends are handled. A
     short Viterbi pass picks a consistent track through each clip.
   - *You or your partner.* Your partner's shirt color is learned as the
     other common moving color at your end. At the final strike, the player
     whose arm and racket (non-shirt pixels around them) suddenly reach out
     is the hitter. Clips get YOU, YOU? or PARTNER? badges, and the ones that
     look like yours are pre-selected.
5. **Review.** In the UI you choose the player's name and side and adjust the
   auto-picked clips (about 50 s). You can scrub the match and add any moment
   detection missed.
6. **Render.** `lib/render.js` uses ffmpeg to build an intro card, each rally
   with name/subtitle/shot-count overlays, a 0.5× slow-mo replay of the best
   point, and a branded outro, plus an optional music bed. Layouts:
   - **Focus** (default): a sharp band that follows the player over a blurred fill.
   - **Full court**: the whole landscape frame over a blurred fill.
   - **Tight**: a full-screen 9:16 crop that follows the player.
7. **Share.** On phones, **Share** uses the Web Share API to hand the MP4 to the
   share sheet (Instagram, Facebook, Messages…) and copies a ready-made caption.
   On desktop you download it.

## Run

Requires Node 20+ and ffmpeg (with libx264 and libfreetype).

```sh
npm install
npm start            # http://localhost:3000
npm test             # unit + end-to-end render tests (~2 min)
# Optional: player finding on a real SwingVision court (frame not committed)
CLUBMODE_REAL_FRAME=/path/to/1920x1080-frame.png npm test
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
| `YTDLP_PATH` | `yt-dlp` | YouTube etc. and fallback downloader (`pip install yt-dlp`) |

## Known limits / next steps

- **SwingVision has no public API.** Link import reads the public share page.
  This hasn't been verified against a live page yet (the build sandbox couldn't
  reach swing.vision). If SwingVision loads the video only after sign-in, use the
  upload path or get partner/API access. Check SwingVision's terms before
  importing other people's matches at scale.
- **Winners vs. errors.** A point "ended by your team" can be a winner, an
  ace, or your team's ball going into the net or out. Audio can't tell them
  apart, so the user reviews the clips. The tests are synthetic; the
  thresholds still need tuning on real footage.
- **Doubles hitter.** Best when you and your partner wear clearly different
  colors. With matching kit, the YOU and PARTNER? badges are a coin flip.
- **Neighbouring courts.** Their ball strikes are audible too and can upset
  the shot-by-shot near/far labelling. This is untested on real audio so far.
- **Validated on:** synthetic matches, plus cut-outs of real players animated
  over a real SwingVision court (shade, fences, neighbouring court). Not yet
  on a full real match.
- **Detection is heuristic.** Audio works well for singles footage from the
  SwingVision mount. Noisy indoor courts can produce extra clips, which the user
  deselects. Who *won* each point isn't known without SwingVision's point data.
- In **Best rallies** mode, "near/far side" tracks the most active player on
  that side. **My winners** follows you by shirt color instead.
- **Direct posting** (no share sheet) needs the Meta Graph API: Instagram
  Business/Creator accounts only, plus Meta app review.
- State is in memory plus JSON on disk with a single process and no auth. Add
  accounts, object storage (S3/R2), and a real queue before a public launch.
