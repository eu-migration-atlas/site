# AI Agent Instructions (Non-Negotiable)

These rules apply to all AI-assisted changes in this repository.

## Scope control
- Modify ONLY the files explicitly listed in the task.
- Do NOT touch any other files.

## Structure & layout
- Do NOT change HTML structure unless explicitly instructed.
- Do NOT rename, remove, or reorganize classes or IDs.
- Header and navigation are LOCKED and must never be modified.

## Styling rules
- No refactoring, cleanup, or reformatting.
- No whitespace-only changes.
- Use existing CSS variables and the current theme system.

## Map styling constraints
- The EU map borders on the homepage must use stroke-width: 0.8, the EU map borders on the country pages must use stroke-width: 0.6 (via CSS variable preferred).
- EU hover behavior is mandatory: EU regions must turn yellow on hover.
- Mini-maps on country pages must be interactive (inline/embedded SVG that supports hover/click).
Every map container must have a constant ombre/glow:
- Light mode: blue ombre/glow (subtle blue-tinted gradient around the map).
- Dark mode: white glow accents on a DARK base (do not switch the map container background to white/purple; only the glow/overlay is white-tinted).
- No frames/borders around map containers.

## Map rendering constraints
- SVG country borders must use a stroke-width of 0.8 or 0.6.
- Border thickness may not be altered without explicit instruction.
- Stroke-width consistency across EU and non-EU countries is mandatory.

## Visual stability
- Avoid layout shifts.
- Do not alter spacing, typography scale, or colors outside the target component.

## Diff discipline
- Make the smallest possible change to achieve the task.
- If requirements cannot be met without broader changes: STOP and explain.

## Priority
- Consistency and existing design decisions override best practices or optimizations.
