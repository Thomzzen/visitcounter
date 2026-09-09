# Gadget Weekly

A tiny, no-backend blog for posting a "Top 10 fun & handy gadgets" list every week.

## Files

- `index.html` — homepage: hero for the latest post + grid of posts in the
  current category (`?cat=<id>`; defaults to the first category).
- `about.html` — a short About page, linked from the nav.
- `post.html` — internal preview page for **drafts only** (`post.html?id=...`); noindexed.
- `admin.html` — the tool you use to write a new post (passcode-protected, see below).
- `posts.js` — the actual content. One JS object per week, in the `POSTS` array.
  Each post has a `category` field matching an id in `categories.js`.
- `categories.js` — the managed list of content categories/pages (e.g. "Gadgets",
  "Sport items"), shown as the "Categories" dropdown in the nav.
- `labels.js` — the managed list of filter labels shown on the homepage, kept
  as one array per category so labels never leak between categories.
- `build.js` — generates static, SEO-friendly pages from `posts.js` (see SEO section).
- `app.js` / `style.css` — shared rendering logic and the visual design.
- `disclosure.html` — the affiliate disclosure page, linked from every page's footer.
- `uploads/` — images uploaded from `admin.html`; committed to git like any other file.
- `posts/` and `sitemap.xml` — **generated automatically**, not committed to git.

Everything the browser loads is static HTML/CSS/JS — no server, no database.
`build.js` needs Node.js, but only in CI. Publishing from `admin.html` talks
directly to the GitHub API using a token you paste in once (see "Security" below).

## Writing a new weekly post

1. Open `admin.html` and enter the passcode (see "Security" below for how
   that's stored).
2. Pick a **Category** for the post (see "Categories & filter labels" below
   if you want to add a new one first), then fill in the week label, title,
   date, cover image and the 10 gadgets (name, image or upload, a sentence
   on why it's worth it, price, optional tag, affiliate/buy link). The live
   preview on the right updates as you type.
3. Click **Publish to website**. The page commits the post to `posts.js` for
   you directly via the GitHub API — no copy-pasting, no editing files by
   hand. GitHub Actions then builds a real static page for it and deploys,
   usually live within a minute or two.
4. To fix or update a post later: pick it from the "Pick a post" dropdown at
   the top, change what you need, and click **Publish to website** again —
   it updates that same post in place instead of creating a new one.
5. To remove a published post entirely: pick it from the dropdown and click
   **Delete from website** (it asks you to confirm first). It commits the
   removal straight to `posts.js`, live within a minute or two — there's no
   undo from here, so make sure you picked the right one.

Two extra tools if you want them:
- **Save draft (preview only)** saves to your browser's local storage so you
  can preview a post on `index.html` before publishing it for real — nothing
  is public until you click "Publish to website".
- **Advanced: copy the code manually** (collapsed section) is the offline
  fallback: it gives you the post as code to paste into `posts.js` yourself,
  in case you haven't connected GitHub or would rather push by hand.

You can also skip `admin.html` entirely and just duplicate one of the objects
in `posts.js` by hand — the comments at the top of that file explain the
format.

## Categories & filter labels

- **Categories** are the separate pages visitors reach from the "Categories"
  dropdown in the nav (e.g. "Gadgets", "Sport items"). Add or remove them
  from admin.html's **Categories** panel; a category can't be removed while
  any post still uses it (reassign or delete those posts first). The
  homepage shows the first category by default, or whichever one is in the
  URL (`index.html?cat=sport-items`).
- **Filter labels** (the pills visitors filter a category's grid by, e.g.
  "Budget Pick") are kept separately per category in `labels.js`. The
  "Filter labels" panel in admin.html has a "Managing labels for" dropdown —
  pick the category first, then add/remove labels just for that page.
  Deleting a label only ever affects the category you had selected, never
  any other page's list.
- Every post picks one category from the "Category" field in "Post details";
  that's also what determines which labels show up in each gadget's "Tag"
  dropdown.

## Security

The two things worth protecting are the **passcode** to reach `admin.html`
and the **GitHub token** that lets it publish to this repo.

- The passcode is checked against a SHA-256 hash baked into `admin.html`
  (`PASSCODE_HASH`), not stored as plain text, and the page locks out
  further attempts for 30 seconds after 5 wrong guesses. This only deters a
  casual visitor — anyone who reads the page source and copies the hash
  could still try to crack it offline — so use a real passphrase (a few
  random words), not a short word. Change it from the "Security" section
  near the bottom of admin.html: unlock the page, type a new passcode
  there, and paste the hash it gives you over `PASSCODE_HASH`.
- The GitHub token is a **fine-grained** personal access token you paste
  into the "GitHub connection" panel once; it's stored only in that
  browser's `localStorage` and sent only to `api.github.com`. Scope it to
  just this repo with **Contents: Read and write** and nothing else, and
  give it an expiration date, so a leaked token is limited in both what it
  can touch and how long it works. Click "Disconnect" if you're ever on a
  shared computer.
- What this doesn't protect against: anyone who gets hold of your saved
  token (from your own browser, a compromised extension, or a shared
  computer) can publish as you. There's no server in front of GitHub here —
  `cloudflare-worker/worker.js` in this repo is a more locked-down design
  that keeps the token server-side instead, if you ever want to set that up.

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
- Every image field (cover + each gadget) also has an **Upload** button next
  to it — pick a file from your device and it's committed straight into
  `blog/uploads/` and the URL field fills in automatically. Pasting a direct
  URL to a product photo still works too, if you'd rather not upload one.

## Local preview

```
python3 -m http.server 8000   # from inside blog/
node build.js                  # optional: generate posts/ + sitemap.xml locally
```
