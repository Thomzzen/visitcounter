# Gadget Weekly

A tiny, no-backend blog for posting a "Top 10 fun & handy gadgets" list every week.

## Files

- `index.html` — homepage: hero for the latest post + grid of all posts.
- `post.html` — internal preview page for **drafts only** (`post.html?id=...`); noindexed.
- `admin.html` — the tool you use to write a new post (passcode-protected, see below).
- `posts.js` — the actual content. One JS object per week, in the `POSTS` array.
- `build.js` — generates static, SEO-friendly pages from `posts.js` (see SEO section).
- `app.js` / `style.css` — shared rendering logic and the visual design.
- `disclosure.html` — the affiliate disclosure page, linked from every page's footer.
- `posts/` and `sitemap.xml` — **generated automatically**, not committed to git.

Everything is static HTML/CSS/JS — no server, no database. `build.js` needs
Node.js, but only in CI (see below); browsing the site needs nothing.

## Writing a new weekly post

1. Open `admin.html` and enter your passcode (see "Keeping it to just you" below).
2. Fill in the week label, title, date, cover image and the 10 gadgets
   (name, image URL, a sentence on why it's worth it, price, optional tag,
   affiliate/buy link).
3. Click **Save draft (this browser)** to preview it instantly on `index.html`
   — this only saves to your own browser's local storage, so it's safe to
   experiment and nobody else can see it.
4. When it looks right, click **Generate code to publish**, then **Copy code**.
5. Open `posts.js`, paste the copied object at the top of the `POSTS` array
   (keep the trailing comma), save, commit and push.
6. GitHub Actions takes it from there: it runs `build.js`, which turns your
   new post into a real static page at `blog/posts/<id>.html`, adds it to
   `sitemap.xml`, and deploys — usually live within a minute or two.
7. Optional: come back to `admin.html`, pick the draft from the dropdown and
   click **Delete this draft** now that it's published for real.

You can also skip `admin.html` entirely and just duplicate one of the objects
in `posts.js` by hand — the comments at the top of that file explain the
format.

## Keeping it to just you

Two separate layers:

- **The only way anything becomes visible to visitors is a `git push` to this
  repo.** `admin.html` never talks to a server — "Save draft" writes to your
  own browser's local storage, and "Generate code" just hands you text you'd
  still have to paste and push yourself. So even if a stranger found
  `admin.html`, they could not publish anything.
- Even so, `admin.html` is passcode-gated (`PASSCODE` near the top of the
  file, default `"changeme"` — **change it**) so casual visitors don't
  stumble into the tool, and it's excluded from search engines
  (`noindex`) and from `robots.txt`. This is a light deterrent, not real
  security — anyone who views the page source can read the passcode. Don't
  reuse a password you care about there.

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
