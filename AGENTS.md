# AI Agent Instructions (Non-Negotiable)

These rules apply to all AI-assisted changes in this repository.

## 0) Theme system (DO NOT INVENT A NEW ONE)
- This repo uses `body.theme-dark` / `body.theme-light` as the theme switch.
- Do NOT introduce or rely on `html[data-theme]` or `:root[data-theme]` unless it already exists for that exact component.
- Never mix theme mechanisms in the same change.

## 1) Scope control
- Modify ONLY the files explicitly listed in the task.
- Do NOT touch any other files.

## 2) Structure & layout
- Do NOT change HTML structure unless explicitly instructed.
- Do NOT rename, remove, or reorganize classes or IDs.
- Header and navigation are LOCKED and must never be modified.

## 3) Styling rules
- No refactoring, cleanup, or reformatting.
- No whitespace-only changes.
- Do NOT duplicate CSS custom properties (no repeated `--map-...` names).
- Prefer CSS variables over hardcoded values.

## 4) Map design rules (single source of truth)
### 4.1 Map strokes
- Hero maps: `--map-stroke-width: 0.8`
- Mini maps (country pages): `--map-stroke-width-mini: 0.6`
- Never hardcode `stroke-width` on elements; always use the variables.

### 4.2 EU vs non-EU styling
- Non-EU: transparent fill.
- EU: filled.
- Borders:
  - Light mode: EU borders = black, non-EU borders = black
  - Dark mode: EU borders = white, non-EU borders = white
- Hover: EU regions must turn EU-gold (`--eu-gold`) on hover.

### 4.3 Click behavior
- Clicking an EU member state opens its country page (countries/<slug>.html).

### 4.4 Glow/ombré (IMPORTANT)
- The glow belongs on the OUTER CARD/CONTAINER around the map (e.g. `.hero-map-card` / `.home-hero-map`), NOT on `.interactive-map`.
- `.interactive-map` is the map surface and must stay theme-correct:
  - Light mode surface: `var(--bg-page)` (white)
  - Dark mode surface: `var(--bg-surface-dark)` (dark)
- No frames/borders around map containers or the map surface.

## 5) Visual stability
- Avoid layout shifts.
- Do not alter spacing, typography scale, or colors outside the target component.

## 6) Diff discipline
- Make the smallest possible change to achieve the task.
- If requirements cannot be met without broader changes: STOP and explain.

## 7) Priority
- Consistency and existing design decisions override best practices or optimizations.
