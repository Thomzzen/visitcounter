/*
 * Gadget Weekly admin proxy.
 *
 * This is the piece that actually keeps the GitHub token and the admin
 * password private: both live only as secrets on Cloudflare, never in
 * the browser, never in this repo. admin.html calls this Worker instead
 * of calling the GitHub API directly.
 *
 * Deployment: see ../blog/README.md, section "Real security: the
 * Cloudflare Worker proxy".
 *
 * Required secrets (set in the Cloudflare dashboard, not in this file):
 *   ADMIN_PASSWORD  - the real admin password, checked on every request
 *   GITHUB_TOKEN    - a fine-grained PAT scoped to just this one repo,
 *                     with Contents: Read and write
 *
 * Change ALLOWED_ORIGIN below if you ever move the site off
 * thomzzen.github.io.
 */

const ALLOWED_ORIGIN = "https://thomzzen.github.io";
const GITHUB_OWNER = "Thomzzen";
const GITHUB_REPO = "visitcounter";
const GITHUB_BRANCH = "main";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode("0x" + p1)));
}
function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
}

async function githubRequest(path, token, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "gadget-weekly-worker",
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error (${res.status})`);
  }
  return res.json();
}

function insertNewPost(fileText, post) {
  const marker = "const POSTS = [";
  const idx = fileText.indexOf(marker);
  if (idx === -1) throw new Error('Could not find "const POSTS = [" in posts.js');
  const insertAt = idx + marker.length;
  const objText = "\n  " + JSON.stringify(post, null, 2).replace(/\n/g, "\n  ") + ",";
  return fileText.slice(0, insertAt) + objText + fileText.slice(insertAt);
}

function replaceExistingPost(fileText, post) {
  const marker = `id: "${post.id}"`;
  const markerIdx = fileText.indexOf(marker);
  if (markerIdx === -1) throw new Error("Could not find that post in posts.js to update");
  const start = fileText.lastIndexOf("{", markerIdx);
  if (start === -1) throw new Error("Could not locate the start of the post block");
  let depth = 0, end = -1;
  for (let i = start; i < fileText.length; i++) {
    if (fileText[i] === "{") depth++;
    else if (fileText[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) throw new Error("Could not locate the end of the post block");
  const objText = JSON.stringify(post, null, 2).replace(/\n/g, "\n  ");
  return fileText.slice(0, start) + objText + fileText.slice(end + 1);
}

async function publishPost(token, post, isEdit) {
  const file = await githubRequest(`/contents/blog/posts.js?ref=${GITHUB_BRANCH}`, token);
  const text = b64DecodeUnicode(file.content);
  const updated = isEdit ? replaceExistingPost(text, post) : insertNewPost(text, post);
  await githubRequest(`/contents/blog/posts.js`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: isEdit ? `Update post: ${post.title}` : `Add post: ${post.title}`,
      content: b64EncodeUnicode(updated),
      sha: file.sha,
      branch: GITHUB_BRANCH
    })
  });
}

async function publishLabels(token, labels) {
  const file = await githubRequest(`/contents/blog/labels.js?ref=${GITHUB_BRANCH}`, token);
  const content = `/*\n * LABELS is the managed list of filter labels shown as pills on the\n * homepage, and offered as the "Tag" dropdown for each gadget in\n * admin.html.\n *\n * Manage this from admin.html's "Filter labels" panel (add/remove there\n * publishes straight to this file), or edit the array by hand and push.\n */\nconst LABELS = ${JSON.stringify(labels, null, 2)};\n`;
  await githubRequest(`/contents/blog/labels.js`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update filter labels",
      content: b64EncodeUnicode(content),
      sha: file.sha,
      branch: GITHUB_BRANCH
    })
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    // Constant-time-ish comparison isn't critical here -- this endpoint
    // has no attempt counter/rate limit yet (see the README), so the
    // real defense is a long passphrase, not timing resistance.
    if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) {
      return json({ error: "Wrong password" }, 401);
    }

    try {
      if (body.action === "checkPassword") {
        return json({ ok: true });
      }
      if (body.action === "publishPost") {
        await publishPost(env.GITHUB_TOKEN, body.post, !!body.isEdit);
        return json({ ok: true });
      }
      if (body.action === "publishLabels") {
        await publishLabels(env.GITHUB_TOKEN, body.labels);
        return json({ ok: true });
      }
      return json({ error: "Unknown action" }, 400);
    } catch (err) {
      return json({ error: err.message || "Server error" }, 500);
    }
  }
};
