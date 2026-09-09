/*
 * LABELS is the managed list of filter labels shown as pills on the
 * homepage, and offered as the "Tag" dropdown for each gadget in
 * admin.html — kept separately per category, so removing a label from
 * one category's page never touches any other category's list.
 *
 * Manage this from admin.html's "Filter labels" panel (add/remove there
 * publishes straight to this file), or edit the object by hand and push.
 */
const LABELS = {
  gadgets: []
};
