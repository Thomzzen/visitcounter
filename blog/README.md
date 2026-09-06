# Gadget Weekly

A tiny, no-backend blog for posting a "Top 10 fun & handy gadgets" list every week.

## Files

- `index.html` — homepage: hero for the latest post + grid of all posts.
- `post.html` — a single week's Top 10, read via `post.html?id=...`.
- `admin.html` — the tool you use to write a new post.
- `posts.js` — the actual content. One JS object per week, in the `POSTS` array.
- `app.js` / `style.css` — shared rendering logic and the visual design.

Everything is static HTML/CSS/JS — no server, no build step, no database.
Open `index.html` in a browser (or host the folder anywhere, e.g. GitHub Pages)
and it works.

## Writing a new weekly post

1. Open `admin.html`.
2. Fill in the week label, title, date, cover image and the 10 gadgets
   (name, image URL, a sentence on why it's worth it, price, optional tag,
   buy link).
3. Click **Save draft (this browser)** to preview it instantly on `index.html`
   / `post.html` — this only saves to your own browser's local storage, so
   it's safe to experiment.
4. When it looks right, click **Generate code to publish**, then **Copy code**.
5. Open `posts.js`, paste the copied object at the top of the `POSTS` array
   (keep the trailing comma), save, commit and push. That's what makes the
   post visible to everyone else.
6. Optional: come back to `admin.html`, pick the draft from the dropdown and
   click **Delete this draft** now that it's published for real.

You can also skip `admin.html` entirely and just duplicate one of the objects
in `posts.js` by hand — the comments at the top of that file explain the
format.

## Image URLs

There's no image upload — every image (cover + each gadget) is just a URL.
Use a direct link to a product photo (e.g. from the retailer, or your own
hosted image). The seed posts use placeholder images from picsum.photos so
you can see the layout before adding real photos.
