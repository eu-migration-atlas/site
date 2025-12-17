# AI Agent Instructions (Non-Negotiable)

These rules apply to ALL AI-assisted changes in this repository.

## 1) Scope control
- Modify ONLY the files explicitly listed in the task.
- Do NOT touch any other files, including shared CSS/JS, unless the task explicitly lists them.

## 2) Structure & layout (LOCKED)
- Do NOT change HTML structure unless explicitly instructed.
- Do NOT rename, remove, or reorganize classes/IDs.
- Header and navigation are LOCKED: never modify them.

## 3) Styling rules (surgical changes only)
- No refactoring, cleanup, or reformatting.
- No whitespace-only changes.
- Use existing CSS variables and the current theme system.
- Make the smallest possible diff that solves the task.

## 4) Map styling constraints (stroke & interaction)
- Main/hero maps: stroke-width MUST be 0.8.
- Mini-maps on country pages: stroke-width MUST be 0.6.
- Border thickness may not be altered without explicit instruction.
- Switzerland MUST use the same stroke treatment as EU member states.
- EU hover behavior is mandatory: EU regions turn yellow on hover.
- Mini-maps must be interactive (inline/embedded SVG supporting hover/click).

## 5) Map container glow rules (NO BORDERS, NO FRAMES)
- There must be a constant ombre/glow around map containers.
- Light mode: subtle blue-tinted glow.
- Dark mode: subtle white-tinted glow ONLY; the map surface/background remains DARK.
- Never switch the map container background to white/purple in dark mode.

### Implementation rule (prevents the recurring bug)
- The glow MUST be applied to the OUTER map card/container using ::before or ::after.
- The glow MUST NOT be applied to the SVG or the interactive map element itself.
- The OUTER container MUST allow the glow to extend outward:
  - outer container: overflow: visible
  - inner surface wrapper (rounded card): overflow: hidden + border-radius
- No borders/frames around map containers. If a border appears: remove it, do not recolor it.

## 6) Visual stability
- Avoid layout shifts.
- Do not alter spacing, typography scale, or colors outside the target component.

## 7) If blocked
- If requirements cannot be met without broader changes: STOP and explain exactly why.
