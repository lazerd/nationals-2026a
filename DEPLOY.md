# Deploying

Two things get deployed, independently:

| What | Where | Cost |
|---|---|---|
| The site (`out/`, 145 static pages) | Cloudflare Pages | free |
| The 5 AM sender (`worker/`) | Cloudflare Workers + KV | free |
| Email delivery | Resend | free (3,000/mo, 100/day — we send 1/day) |

Everything below needs your Cloudflare and Resend accounts, so it has to be run
by you. Each step ends with a command that proves it worked.

---

## 1. Resend: verify clubmode.ai

Do this **first**. It takes the longest to propagate and nothing else matters if
mail lands in spam.

1. Resend → **Domains** → **Add Domain** → `clubmode.ai`.
2. Resend shows a set of DNS records. Add all of them to wherever clubmode.ai's
   DNS lives. Expect three kinds:
   - **MX** on a bounce subdomain (usually `send.clubmode.ai`) pointing at an
     Amazon SES feedback host.
   - **TXT** SPF on that same subdomain, `v=spf1 include:amazonses.com ~all`.
   - **TXT** DKIM at `resend._domainkey`, a long public key.

   Copy the exact values from the Resend dashboard — do not type them from
   memory, and do not use the ones in any tutorial.
3. Add a DMARC record too. Without one, Gmail is markedly more suspicious of a
   new domain:

   ```
   _dmarc.clubmode.ai   TXT   "v=DMARC1; p=none; rua=mailto:darrinjco@gmail.com"
   ```

4. Wait for Resend to show **Verified**. Usually minutes, occasionally an hour.
5. Create an API key: Resend → **API Keys** → full access. Copy it once.

**Why this matters more than it sounds:** an unverified sender gets through for
the first few days and then Gmail starts filing it as spam. The failure mode is
silent — no bounce, no error, the worker logs a successful send, and the program
quietly stops arriving around day four.

---

## 2. Cloudflare Pages: the site

```bash
npm ci
npm run build          # writes out/ and out/sw.js
npx wrangler pages project create nationals --production-branch main
npx wrangler pages deploy out --project-name nationals
```

Or connect the GitHub repo in the Cloudflare dashboard with:

- **Build command:** `npm run build`
- **Output directory:** `out`
- **Node version:** 22

Then point the domain at it: Pages → the project → **Custom domains** → add
`nationals.clubmode.ai`.

If you use a different hostname, change `SITE_ORIGIN` in **both**
`src/config.ts` and `worker/wrangler.toml`, then rebuild. Day links in sent
emails are permanent and must keep resolving forever, so decide the hostname
before the first send.

Verify:

```bash
curl -sI https://nationals.clubmode.ai/day/2026-09-07 | head -1   # 200
curl -s  https://nationals.clubmode.ai/sw.js | head -3            # the generated worker
```

---

## 3. KV namespace for the send log

```bash
cd worker
npx wrangler kv namespace create LOG
```

Paste the returned `id` into `worker/wrangler.toml`, replacing
`REPLACE_WITH_KV_NAMESPACE_ID`.

The namespace holds three tiny keys per day and nothing else:

| Key | Meaning |
|---|---|
| `sent:YYYY-MM-DD` | written **only after** Resend confirms a send |
| `log:YYYY-MM-DD` | the outcome, for `/health` |
| `error:YYYY-MM-DD` | the last failure reason, if any |

---

## 4. Deploy the worker

```bash
cd worker
npm ci
npx wrangler secret put RESEND_API_KEY    # paste the key from step 1
npx wrangler deploy
```

The cron is `0 * * * *` — **hourly, not daily**. The worker decides for itself
whether it is 5 AM in `America/Los_Angeles`. This is deliberate; see
`worker/src/time.ts`. A fixed daily UTC cron would start sending at 4 AM local
the moment DST ends on Nov 1 2026 and keep doing it for the last four weeks of
the block.

---

## 5. Prove it before trusting it

**Dry run — sends nothing, exercises the whole decision path:**

```bash
W=https://nationals-email.<your-subdomain>.workers.dev

curl -s "$W/?dry=1" | jq                                   # right now
curl -s "$W/?dry=1&at=2026-10-31T12:00:00Z" | jq .decision  # 5 AM PDT  -> send
curl -s "$W/?dry=1&at=2026-11-01T12:00:00Z" | jq .decision  # 4 AM PST  -> wrong-hour
curl -s "$W/?dry=1&at=2026-11-01T13:00:00Z" | jq .decision  # 5 AM PST  -> send
curl -s "$W/?dry=1&at=2026-11-30T13:00:00Z" | jq .subject   # Nationals
curl -s "$W/?dry=1&at=2026-12-02T13:00:00Z" | jq .decision  # after-program
```

The middle three are the DST transition. `npm run dry` runs the same assertions
locally with no deploy needed.

**Send one for real, to yourself:**

```bash
curl -s -X POST "$W/send?date=2026-09-07&force=1" \
  -H "Authorization: Bearer $RESEND_API_KEY" | jq
```

Open it on your phone in Gmail. Check: the subject is readable on the lock
screen, the button is tappable one-handed, and it is **not** in spam or
Promotions. If it is in Promotions, mark it "Not promotions" once.

**Health:**

```bash
curl -s "$W/health" | jq
```

Returns the last seven days. `ok: false` and a populated `missed` array means a
morning was lost — that is the ten-second diagnosis.

---

## 6. The morning after the first real send

Check `/health` once. If day one shows `"status": "sent"`, the system is
running and needs no further attention until Dec 1, when it sends a
program-complete note and then goes quiet on its own.

---

## Rollback

```bash
npx wrangler deployments list          # in worker/
npx wrangler rollback [deployment-id]
```

Pages keeps every deployment; roll back from the dashboard. Old `/day/...` URLs
keep working across every deployment because they are static files with stable
paths.
