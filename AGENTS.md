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
- Do NOT change the theme toggling mechanism, theme selectors, or how dark/light mode is applied.

## Theme-safe variable rules (critical)
- Theme-dependent styling MUST be defined via theme-scoped selectors:
  - Use `:root[data-theme="light"] { ... }` for light mode values.
  - Use `:root[data-theme="dark"] { ... }` for dark mode values.
- Do NOT merge light/dark variables into a single mixed value.
- If a shared variable name is needed (e.g., `--map-ombre`), it MUST be assigned separately per theme scope.

## Map styling constraints
- Main/hero maps use `stroke-width: 0.8`; mini-maps on country pages use `stroke-width: 0.6`.
- Switzerland must use the same stroke treatment as EU member states.
- EU hover behavior is mandatory: EU regions must turn yellow on hover.
- Mini-maps on country pages must be interactive (inline/embedded SVG that supports hover/click).

## Map container glow rules (constant ombre, no frames)
- Every map container must have a constant ombre/glow.
- Light mode: subtle blue-tinted ombre/glow.
- Dark mode: white-tinted glow accents on a DARK base.
  - Do NOT switch the map container background to white/purple in dark mode.
  - Only the surrounding glow/overlay is white-tinted; the map surface stays dark.
- No borders/frames/outlines around map containers.
- The ombre/glow belongs on the OUTER hero map card/container (e.g., `::before` on the card), NOT on the interactive map/SVG itself.

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
- Always verify light AND dark mode before concluding.

## Priority
- Consistency and existing design decisions override best practices or optimizations.
