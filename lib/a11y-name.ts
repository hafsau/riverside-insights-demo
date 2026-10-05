/*
 * A small, honest approximation of what a screen reader announces for a
 * focused element: role, accessible name, state, and position in a group.
 * It follows the accname order that matters in practice (aria-labelledby,
 * aria-label, <label>, alt/title, text content) and is labelled as an
 * approximation wherever it's shown. Real testing uses VoiceOver and NVDA.
 */

const IMPLICIT_ROLE: Record<string, string> = {
  A: "link",
  BUTTON: "button",
  SELECT: "combo box",
  TEXTAREA: "text field",
  SUMMARY: "disclosure",
  H1: "heading",
  H2: "heading",
  H3: "heading",
  H4: "heading",
  NAV: "navigation",
  MAIN: "main",
  HEADER: "banner",
  FOOTER: "content info",
  ASIDE: "complementary",
  TABLE: "table",
  TH: "column header",
};

const INPUT_ROLE: Record<string, string> = {
  checkbox: "checkbox",
  radio: "radio button",
  range: "slider",
  search: "search field",
  email: "text field",
  text: "text field",
  number: "stepper",
  date: "date field",
};

function textOf(el: Element): string {
  if (el instanceof HTMLElement && (el.hidden || el.getAttribute("aria-hidden") === "true")) return "";
  let out = "";
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) out += node.textContent ?? "";
    else if (node instanceof Element) {
      if (node.getAttribute("aria-hidden") === "true") continue;
      if (node.classList.contains("sr-only")) out += " " + (node.textContent ?? "") + " ";
      else if (node.getAttribute("aria-label")) out += " " + node.getAttribute("aria-label") + " ";
      else if (node instanceof HTMLImageElement) out += node.alt;
      else out += " " + textOf(node) + " ";
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

export function accessibleName(el: Element): string {
  const labelledby = el.getAttribute("aria-labelledby");
  if (labelledby) {
    const t = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((n) => textOf(n!))
      .join(" ")
      .trim();
    if (t) return t;
  }
  const label = el.getAttribute("aria-label");
  if (label) return label.trim();
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    const labels = el.labels ? [...el.labels].map((l) => textOf(l)).join(" ") : "";
    if (labels.trim()) return labels.trim();
  }
  if (el instanceof HTMLImageElement) return el.alt;
  const own = textOf(el);
  if (own) return own;
  return el.getAttribute("title") ?? "";
}

export function roleOf(el: Element): string {
  const explicit = el.getAttribute("role");
  if (explicit) {
    const map: Record<string, string> = { radio: "radio button", switch: "switch", tab: "tab", img: "image", radiogroup: "radio group", region: "region", dialog: "dialog" };
    return map[explicit] ?? explicit;
  }
  if (el instanceof HTMLInputElement) return INPUT_ROLE[el.type] ?? "text field";
  if (el.tagName === "A" && !el.hasAttribute("href")) return "text";
  return IMPLICIT_ROLE[el.tagName] ?? el.tagName.toLowerCase();
}

export function stateOf(el: Element): string[] {
  const s: string[] = [];
  const checked = el.getAttribute("aria-checked") ?? (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio") ? String(el.checked) : null);
  if (checked === "true") s.push(el.getAttribute("role") === "switch" ? "on" : "checked");
  else if (checked === "false") s.push(el.getAttribute("role") === "switch" ? "off" : "not checked");
  if (el.getAttribute("aria-pressed") === "true") s.push("selected");
  const expanded = el.getAttribute("aria-expanded");
  if (expanded) s.push(expanded === "true" ? "expanded" : "collapsed");
  if (el.getAttribute("aria-current")) s.push("current page");
  const sort = el.closest("th")?.getAttribute("aria-sort");
  if (sort && sort !== "none") s.push(`sorted ${sort}`);
  if (el.getAttribute("aria-disabled") === "true" || (el as HTMLButtonElement).disabled) s.push("dimmed");
  if (el instanceof HTMLInputElement && el.type === "range") s.push(el.getAttribute("aria-valuetext") ?? el.value);
  if (el.tagName.match(/^H[1-6]$/)) s.push(`level ${el.tagName[1]}`);
  return s;
}

export function positionOf(el: Element): string | null {
  if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
    const group = [...document.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${CSS.escape(el.name)}"]`)];
    return `${group.indexOf(el) + 1} of ${group.length}`;
  }
  const role = el.getAttribute("role");
  if (role === "radio" || role === "tab" || role === "option") {
    const parent = el.closest('[role="radiogroup"], [role="tablist"], [role="listbox"]');
    if (parent) {
      const items = [...parent.querySelectorAll(`[role="${role}"]`)];
      return `${items.indexOf(el) + 1} of ${items.length}`;
    }
  }
  return null;
}

export function describeDescription(el: Element): string {
  const ids = el.getAttribute("aria-describedby");
  if (!ids) return "";
  return ids
    .split(/\s+/)
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .map((n) => textOf(n!))
    .join(" ")
    .trim();
}

export function announce(el: Element): string {
  const parts = [accessibleName(el) || "unlabelled", roleOf(el), ...stateOf(el)];
  const pos = positionOf(el);
  if (pos) parts.push(pos);
  const desc = describeDescription(el);
  if (desc) parts.push(desc);
  return parts.filter(Boolean).join(", ");
}

const LANDMARK_ROLE: Record<string, string> = { HEADER: "banner", NAV: "navigation", MAIN: "main", ASIDE: "complementary", FOOTER: "contentinfo", SECTION: "region", FORM: "form" };

export function landmarkLabel(el: Element): string {
  const role = el.getAttribute("role") ?? LANDMARK_ROLE[el.tagName] ?? el.tagName.toLowerCase();
  const name = el.getAttribute("aria-label") ?? (el.getAttribute("aria-labelledby") ? accessibleName(el) : "");
  return name ? `${role} · ${name.slice(0, 40)}` : role;
}

export const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export function tabbables(root: ParentNode = document): HTMLElement[] {
  const all = [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter((el) => {
    if (el.closest("[inert], [data-lens-ui]")) return false;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    // Unchecked radios in a checked group are skipped by Tab.
    if (el instanceof HTMLInputElement && el.type === "radio" && el.name) {
      const group = [...document.querySelectorAll<HTMLInputElement>(`input[type=radio][name="${CSS.escape(el.name)}"]`)];
      const checked = group.find((r) => r.checked);
      if (checked ? checked !== el : group[0] !== el) return false;
    }
    return true;
  });
  const positive = all.filter((el) => el.tabIndex > 0).sort((a, b) => a.tabIndex - b.tabIndex);
  return [...positive, ...all.filter((el) => el.tabIndex <= 0)];
}
