# Gadget Weekly

A tiny, no-backend blog for posting a "Top 10 fun & handy gadgets" list every week.

## Files

- `index.html` — homepage: hero for the latest post + grid of all posts.
- `post.html` — internal preview page for **drafts only** (`post.html?id=...`); noindexed.
- `admin.html` — the tool you use to write a new post (password-protected, see below).
- `posts.js` — the actual content. One JS object per week, in the `POSTS` array.
- `labels.js` — the managed list of filter labels shown on the homepage.
- `build.js` — generates static, SEO-friendly pages from `posts.js` (see SEO section).
- `app.js` / `style.css` — shared rendering logic and the visual design.
- `disclosure.html` — the affiliate disclosure page, linked from every page's footer.
- `posts/` and `sitemap.xml` — **generated automatically**, not committed to git.
- `../cloudflare-worker/worker.js` — the server-side proxy that holds the real
  secrets (see "Real security" below).

Everything the browser loads is static HTML/CSS/JS — no server, no database.
`build.js` needs Node.js, but only in CI. Publishing a post additionally
needs the Cloudflare Worker described below.

## Writing a new weekly post

1. Open `admin.html` and enter the admin password (see "Real security" below
   for where that password actually lives).
2. Fill in the week label, title, date, cover image and the 10 gadgets
   (name, image URL, a sentence on why it's worth it, price, optional tag,
   affiliate/buy link). The live preview on the right updates as you type.
3. Click **Publish to website**. The page sends the post to the Worker,
   which commits it to `posts.js` for you — no copy-pasting, no editing
   files by hand. GitHub Actions then builds a real static page for it and
   deploys, usually live within a minute or two.
4. To fix or update a post later: pick it from the "Pick a post" dropdown at
   the top, change what you need, and click **Publish to website** again —
   it updates that same post in place instead of creating a new one.

Two extra tools if you want them:
- **Save draft (preview only)** saves to your browser's local storage so you
  can preview a post on `index.html` before publishing it for real — nothing
  is public until you click "Publish to website".
- **Advanced: copy the code manually** (collapsed section) is the offline
  fallback: it gives you the post as code to paste into `posts.js` yourself,
  in case the Worker is ever down.

You can also skip `admin.html` entirely and just duplicate one of the objects
in `posts.js` by hand — the comments at the top of that file explain the
format.

## Real security: the Cloudflare Worker proxy

The two things worth actually protecting are the **admin password** and the
**GitHub token** that lets something publish to this repo. Neither one lives
in `admin.html`, or anywhere else a website visitor's browser can read.
Instead, both are stored as secrets on a small [Cloudflare
Worker](https://workers.cloudflare.com/) that sits between `admin.html` and
GitHub: the browser sends the password you type + what you want to publish,
the Worker checks the password against its own secret, and only if it
matches does it use its own (separately secret) GitHub token to make the
change. If someone reads every line of `admin.html`'s source, there is
nothing there to steal.

### Deploying it (one-time, ~10 minutes)

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
   (no credit card required for the free plan).
2. In the dashboard, go to **Workers & Pages** → **Create** → **Create Worker**.
   Give it any name (e.g. `gadget-weekly-admin`) and deploy the default template.
3. Click **Edit code** (the "Quick Edit" button). Delete everything in the
   editor and paste in the full contents of `cloudflare-worker/worker.js`
   from this repo. Click **Deploy**.
4. Go to the worker's **Settings → Variables and Secrets**. Add two secrets
   (use "Secret" type for both, not "Text", so they're encrypted):
   - `ADMIN_PASSWORD` — a real passphrase (three or four random words work
     well — long enough that it can't be guessed or brute-forced).
   - `GITHUB_TOKEN` — a **fine-grained** personal access token:
     1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new).
     2. Under "Repository access" choose "Only select repositories" → pick `Thomzzen/visitcounter`.
     3. Under "Permissions" → "Repository permissions", set **Contents** to **Read and write**. Leave everything else alone.
     4. Give it an expiration date (so a leaked token stops working on its own).
     5. Generate it and paste the value in as the `GITHUB_TOKEN` secret.
5. Copy the worker's URL (shown at the top of its dashboard page, looks like
   `https://gadget-weekly-admin.<your-subdomain>.workers.dev`).
6. In `blog/admin.html`, find the line near the top:
   ```js
   const WORKER_URL = "https://REPLACE-ME.workers.dev";
   ```
   and replace it with your actual Worker URL. Commit and push.

That's it — `admin.html` will now unlock and publish through the Worker.

### Rotating the password or token later

No hash to regenerate, no file to edit — just go back to the Worker's
**Settings → Variables and Secrets** and update `ADMIN_PASSWORD` or
`GITHUB_TOKEN`. Takes effect immediately, nothing to redeploy.

### What this does and doesn't protect against

- The password is checked on the Worker, so reading `admin.html`'s source
  gives someone nothing — there's no hash to crack offline anymore.
- The GitHub token never reaches any browser, ever — so there's nothing for
  an injected script, a browser extension, or someone else using your
  computer to find.
- The password itself is held only in a page-scoped JavaScript variable
  while `admin.html` is open (not `localStorage`, not `sessionStorage`), so
  it disappears the moment you reload or close the tab — you'll type it
  again next time, which is the trade-off for it not sitting in browser
  storage indefinitely.
- What's **not** included yet: server-side rate limiting on wrong password
  attempts (the Worker has no persistent storage wired up for that). The
  real defense against guessing is picking a long passphrase rather than a
  short word. `admin.html` still throttles repeated wrong attempts for
  30 seconds client-side, which stops casual retries but not a determined
  script hitting the Worker directly.

## SEO — how people find it

- `build.js` generates one real, static HTML page per post at
  `blog/posts/<id>.html`, each with its own `<title>`, meta description,
  canonical URL, Open Graph + Twitter Card tags (for link previews on
  social/chat apps), and `ItemList`/`Product` structured data (JSON-LD) so
  search engines understand it's a ranked list of products.
- `sitemap.xml` is regenerated on every deploy and listed in `/robots.txt`
  at the repo root.
- Once it's live, submit the sitemap to
  [Google Search Console](https://search.google.com/search-console) and
  [Bing Webmaster Tools](https://www.bing.com/webmasters) — that's a
  one-time manual step tied to your own accounts, so it isn't something
  that can be automated here.
- The homepage (`index.html`) is still rendered with JavaScript, so most of
  your search visibility will come in through individual post pages rather
  than the homepage — that's normal for this kind of "latest list" site.
- Write real, specific titles and excerpts for each post (avoid duplicate
  wording between weeks) — that matters more for ranking than anything
  technical here.

## Affiliate links

- Every "View deal" button is generated with `rel="sponsored"`, which is
  what Google asks for on paid/affiliate links.
- `disclosure.html` holds a generic affiliate disclosure, linked from the
  footer of every page and from the top of every post. Edit its wording to
  match whichever program(s) you actually join (e.g. the exact required
  phrasing for Amazon Associates, or your local rules if you're not
  targeting a US audience).
- There's no image upload — every image (cover + each gadget) is just a
  URL. Use a direct link to a product photo, or your own hosted image.

## Local preview

```
python3 -m http.server 8000   # from inside blog/
node build.js                  # optional: generate posts/ + sitemap.xml locally
```
