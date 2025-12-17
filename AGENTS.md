# AGENTS.md — AI Change Rules (Non-Negotiable)

These rules apply to every AI-assisted change in this repository.

## 1) Scope control
- Modify ONLY the files explicitly listed in the task.
- Do NOT touch any other files (no drive-by edits).

## 2) Structure & layout are locked
- Do NOT change HTML structure unless explicitly instructed.
- Do NOT rename, remove, or reorganize classes or IDs.
- Header and navigation are LOCKED and must never be modified.

## 3) Styling rules (strict)
- No refactoring, cleanup, reformatting, or “best practices”.
- No whitespace-only changes.
- Use existing CSS variables and the current theme system.
- Make the smallest possible change to achieve the task.

## 4) Map system — hard constraints
### Stroke widths (never change unless explicitly instructed)
- Main/hero maps: `stroke-width: 0.8`
- Mini-maps on country pages: `stroke-width: 0.6`
- Stroke-width consistency across EU and non-EU countries is mandatory.

### Switzerland
- Switzerland must use the same stroke treatment as EU member states (visual consistency).

### Interactivity
- EU hover behavior is mandatory: EU regions must turn yellow on hover.
- Mini-maps on country pages must be interactive (inline/embedded SVG supporting hover/click).

## 5) Map containers — glow/ombre rules (no frames)
- No frames/borders/outlines around map containers (in any theme).
- The glow/ombre belongs on the MAP CONTAINER (card/wrapper), NOT on the SVG/map itself.
- Every map container must have a constant glow/ombre:
  - Light mode: subtle blue-tinted ombre/glow around the container.
  - Dark mode: dark surface stays dark; only the surrounding glow is white-tinted.
  - In dark mode: do NOT switch map container background to white/purple/lavender; only the glow overlay is white-tinted.
- Prefer implementation via a container pseudo-element (`::before`/`::after`) using existing CSS variables.

## 6) Visual stability
- Avoid layout shifts.
- Do not alter spacing, typography scale, or colors outside the target component.

## 7) Diff discipline
- Minimal diff only.
- If requirements cannot be met without broader changes: STOP and explain why before changing anything else.

## 8) Priority order
- Consistency and existing design decisions override optimizations or best practices.
