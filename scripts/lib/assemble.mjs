// ============================================================================
//  scripts/lib/assemble.mjs — the governed role→slot JOIN
// ============================================================================
//  Replaces the hardcoded tag heuristic (static) and the regex guess (motion)
//  with ONE rule: match a copy's ROLE to a slot's role. Precedence:
//    1. explicit planner target (templateData keyed by slot id/tag) — always wins
//    2. slot whose DEFAULT role matches an available copy (reading order)
//    3. first slot whose `accepts` list includes the role (fallback)
//  Locked slots (e.g. guarantee) are never auto-filled. maxChars overflow is
//  WARNED, never silently truncated. Returns an id→text map so two slots that
//  once shared a tag (`headline` ×2) can now hold different copy.
// ============================================================================

import { LOCKED_ROLES } from "./roles.mjs";

const isLocked = (s) => !!s.locked || LOCKED_ROLES.includes(s.role);
const clean = (v) => typeof v === "string" && v.trim();

// slots:      [{ id, role, accepts?, locked?, maxChars?, tag? }] in document order
// copyByRole: { role: [value, ...] }   — pools consumed left-to-right
// explicit:   { slotId: value }        — planner targets (win outright)
export function assemble({ slots = [], copyByRole = {}, explicit = {} }) {
  const bySlotId = {};
  const warnings = [];

  // pools as consumable queues (drop empties)
  const pools = {};
  for (const [role, vals] of Object.entries(copyByRole)) {
    const q = (vals || []).filter(clean);
    if (q.length) pools[role] = q;
  }

  // 1. explicit targets win
  for (const s of slots) {
    if (clean(explicit[s.id])) bySlotId[s.id] = explicit[s.id];
  }
  // 2. default-role match, reading order
  for (const s of slots) {
    if (s.id in bySlotId || isLocked(s) || !s.role) continue;
    const q = pools[s.role];
    if (q && q.length) bySlotId[s.id] = q.shift();
  }
  // 3. accepts fallback
  for (const s of slots) {
    if (s.id in bySlotId || isLocked(s)) continue;
    for (const role of s.accepts || []) {
      const q = pools[role];
      if (q && q.length) { bySlotId[s.id] = q.shift(); break; }
    }
  }
  // 4. maxChars overflow → warn (never truncate)
  for (const s of slots) {
    const v = bySlotId[s.id];
    if (clean(v) && s.maxChars && String(v).length > s.maxChars) {
      warnings.push({ id: s.id, role: s.role, len: String(v).length, maxChars: s.maxChars });
    }
  }
  return { bySlotId, warnings };
}
