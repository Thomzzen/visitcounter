/*
 * POSTS is the database for the whole site.
 * Each object below is one weekly "Top 10" post. Its `category` field must
 * match one of the ids in categories.js — that's what puts it on the right
 * page and gives it the right set of filter labels.
 *
 * TO ADD A NEW WEEK BY HAND:
 *   1. Copy one of the objects below (the { ... } block) including the comma after it.
 *   2. Paste it at the TOP of the POSTS array (so it shows up as the newest).
 *   3. Edit the fields with your new week's content.
 *   4. Save the file and push — the site updates automatically.
 *
 * EASIER WAY: open admin.html, fill in the form, click "Generate code",
 * then paste the object it gives you right here instead of typing it by hand.
 */
const POSTS = [];
