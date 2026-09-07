#!/usr/bin/env node
/*
 * Turns posts.js into real, static, SEO-friendly HTML pages.
 *
 * Why this exists: index.html/post.html render everything with JavaScript,
 * which is fine for browsing but weak for search engines and for link
 * previews (Twitter/Facebook/Slack/WhatsApp don't run JavaScript when they
 * fetch a link). This script generates one plain HTML file per post, with
 * real <title>/description/Open Graph tags and the content already baked
 * in, so a post reads and previews correctly with zero JavaScript.
 *
 * Runs automatically in the GitHub Actions Pages workflow before deploy.
 * You can also run it locally to check the output: `node blog/build.js`
 * (writes into blog/posts/, which is gitignored — nothing to commit).
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const BLOG_DIR = __dirname;
const SITE_URL = "https://thomzzen.github.io/visitcounter/blog";

// Load posts.js + app.js in a sandbox so we reuse the exact same
// postCardHtml/itemCardHtml/disclosureHtml markup the browser uses,
// instead of maintaining a second copy of the templates here.
const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(BLOG_DIR, "posts.js"), "utf8"), sandbox, { filename: "posts.js" });
// `const POSTS` is a lexical binding, not a property of the sandbox's
// global object — copy it across explicitly so Node can read it below.
vm.runInContext("this.POSTS = POSTS;", sandbox);
vm.runInContext(fs.readFileSync(path.join(BLOG_DIR, "app.js"), "utf8"), sandbox, { filename: "app.js" });

const { POSTS, itemCardHtml, disclosureHtml, formatDate, escapeHtml } = sandbox;

const posts = POSTS.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

function jsonLdFor(post, url) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: post.title,
    description: post.excerpt,
    url,
    itemListElement: post.items.map(item => ({
      "@type": "ListItem",
      position: item.rank,
      item: {
        "@type": "Product",
        name: item.name,
        description: item.blurb,
        image: item.image,
        url: item.link
      }
    }))
  };
}

function pageHtml(post) {
  const url = `${SITE_URL}/posts/${post.id}.html`;
  const all = posts;
  const idx = all.findIndex(p => p.id === post.id);
  const prev = all[idx + 1]; // older
  const next = all[idx - 1]; // newer
  const title = `${post.title} — Gadget Weekly`;
  const jsonLd = JSON.stringify(jsonLdFor(post, url), null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none';">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(post.excerpt)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(post.title)}">
<meta property="og:description" content="${escapeHtml(post.excerpt)}">
<meta property="og:url" content="${url}">
${post.cover ? `<meta property="og:image" content="${escapeHtml(post.cover)}">` : ""}
<meta property="article:published_time" content="${post.date}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(post.title)}">
<meta name="twitter:description" content="${escapeHtml(post.excerpt)}">
${post.cover ? `<meta name="twitter:image" content="${escapeHtml(post.cover)}">` : ""}
<link rel="stylesheet" href="../style.css">
<script type="application/ld+json">
${jsonLd}
</script>
</head>
<body>

<div class="wrap">

  <nav class="nav">
    <div class="brand"><span class="dot"></span> gadgetweekly.</div>
    <div class="nav-links">
      <a href="../index.html">Home</a>
      <a href="../index.html#archive">Archive</a>
    </div>
  </nav>

  <div class="post-hero">
    <div class="badge-row">
      <span class="pill-tag">${escapeHtml(post.weekLabel)}</span>
      <span class="pill-tag">${formatDate(post.date)}</span>
    </div>
    <h1>${escapeHtml(post.title)}</h1>
    <p class="lede">${escapeHtml(post.excerpt)}</p>
    ${post.cover ? `<div class="post-cover"><img src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.title)}"></div>` : ""}
    ${disclosureHtml("../")}
  </div>

  <div class="item-list">
    ${post.items.map(itemCardHtml).join("\n")}
  </div>

  <div class="archive-nav">
    ${prev ? `<a class="btn btn-outline" href="${prev.id}.html">&larr; ${escapeHtml(prev.weekLabel)}</a>` : "<span></span>"}
    ${next ? `<a class="btn btn-outline" href="${next.id}.html">${escapeHtml(next.weekLabel)} &rarr;</a>` : "<span></span>"}
  </div>

  <footer>
    Handpicked every week. Nothing sponsored unless we say so. &copy; ${new Date().getFullYear()} gadgetweekly.
    &middot; <a href="../disclosure.html">Affiliate disclosure</a>
  </footer>
</div>

</body>
</html>
`;
}

function sitemapXml() {
  const urls = [
    { loc: `${SITE_URL}/`, changefreq: "weekly" },
    ...posts.map(p => ({ loc: `${SITE_URL}/posts/${p.id}.html`, lastmod: p.date, changefreq: "monthly" }))
  ];
  const body = urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>\n    ` : ""}<changefreq>${u.changefreq}</changefreq>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

const postsDir = path.join(BLOG_DIR, "posts");
fs.rmSync(postsDir, { recursive: true, force: true });
fs.mkdirSync(postsDir, { recursive: true });

posts.forEach(post => {
  fs.writeFileSync(path.join(postsDir, `${post.id}.html`), pageHtml(post));
});
fs.writeFileSync(path.join(BLOG_DIR, "sitemap.xml"), sitemapXml());

console.log(`Built ${posts.length} static post page(s) and sitemap.xml`);
