/* Shared helpers used by index.html, post.html and admin.html */

const DRAFTS_KEY = "gadgetBlogDrafts";

function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveDraft(post) {
  const drafts = getDrafts().filter(p => p.id !== post.id);
  drafts.push(post);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function deleteDraft(id) {
  const drafts = getDrafts().filter(p => p.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/* Drafts saved in this browser override a published post with the same id,
   and any new draft simply appears alongside the published ones. This lets
   you preview a post instantly, before ever touching posts.js. */
function loadAllPosts() {
  const published = (typeof POSTS !== "undefined") ? POSTS : [];
  const drafts = getDrafts();
  const byId = new Map();
  published.forEach(p => byId.set(p.id, p));
  drafts.forEach(p => byId.set(p.id, Object.assign({}, p, { isDraft: true })));
  return Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getPostById(id) {
  return loadAllPosts().find(p => p.id === id);
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function postCardHtml(post) {
  return `
    <a class="card" href="post.html?id=${encodeURIComponent(post.id)}">
      <div class="thumb">
        <img src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.title)}" loading="lazy">
        <span class="badge">${escapeHtml(post.weekLabel)}${post.isDraft ? " · Draft" : ""}</span>
      </div>
      <div class="body">
        <div class="date">${formatDate(post.date)}</div>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="footer-row">
          <span class="read">Read the list</span>
          <span class="btn-circle">&rarr;</span>
        </div>
      </div>
    </a>
  `;
}

function itemCardHtml(item) {
  const rankStr = String(item.rank).padStart(2, "0");
  return `
    <div class="item-card">
      <div class="item-rank">${rankStr}</div>
      <div class="item-thumb"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>
      <div class="item-info">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.blurb)}</p>
        <div class="item-meta">
          ${item.price ? `<span class="item-price">${escapeHtml(item.price)}</span>` : ""}
          ${item.tag ? `<span class="pill-tag">${escapeHtml(item.tag)}</span>` : ""}
        </div>
      </div>
      <div class="item-action">
        <a class="btn btn-primary" href="${escapeHtml(item.link || "#")}" target="_blank" rel="noopener">View deal</a>
      </div>
    </div>
  `;
}
