# AI Agent Instructions (Non-Negotiable)

These rules apply to all AI-assisted changes in this repository.
Deviation is not allowed unless explicitly instructed in the task.

---

## 1. Scope control
- Modify ONLY the files explicitly listed in the task.
- Do NOT touch any other files.
- If a requirement cannot be met within this scope: STOP and explain.

---

## 2. Structure & layout
- Do NOT change HTML structure unless explicitly instructed.
- Do NOT rename, remove, or reorganize classes or IDs.
- Header and navigation are LOCKED and must never be modified.

---

## 3. Styling discipline
- No refactoring, cleanup, or reformatting.
- No whitespace-only changes.
- Use existing CSS variables and the current theme system.
- Do NOT introduce global styling for component-specific issues.

---

## 4. Map rendering (SVG rules)
- Hero/main maps: `stroke-width: 0.8`
- Mini-maps on country pages: `stroke-width: 0.6`
- Border thickness may NOT be altered without explicit instruction.
- Stroke-width consistency across EU and non-EU countries is mandatory.
- Switzerland must use the same stroke treatment as EU member states.
- EU hover behavior is mandatory: EU regions must turn yellow on hover.
- Mini-maps on country pages must be interactive (inline/embedded SVG with hover/click support).

---

## 5. Map container styling (CRITICAL — READ CAREFULLY)

### 5.1 General principles
- No visible frames or borders around map containers.
- All glow/ombre effects are **container-level**, never applied to the SVG itself.
- Map surface colors must NEVER be replaced by glow colors.
- Glows must be implemented via overlays/pseudo-elements or variables, not hardcoded backgrounds.

---

### 5.2 Home page (hero map)

**Light mode**
- The home hero map must have **NO ombre, glow, halo, vignette, or visible edge**.
- The map container must visually blend into the page background.
- Any border-like or shaded edge in light mode is considered a bug.

**Dark mode**
- The home hero map may have a **subtle WHITE-tinted glow**.
- The glow must be soft and atmospheric, not a frame.
- The map surface itself remains dark; only the surrounding glow is white-tinted.
- Glow must be controlled via a dedicated variable (e.g. `--home-map-ombre`).

---

### 5.3 Country pages (hero + mini maps)

**Light mode**
- Country hero maps may use a **subtle BLUE-tinted ombre/glow**.
- The glow must be restrained and consistent with the homepage visual language.

**Dark mode**
- Country hero maps may use **white-tinted glow accents on a dark base**.
- The map surface stays dark; only the surrounding glow is white-tinted.
- Never introduce purple or lilac backgrounds or halos.

---

### 5.4 Variable usage
- Home and country map glows MUST NOT share the same variable.
- Do NOT reuse generic map ombre variables for the home page.
- Theme-specific behavior must be controlled via scoped variables, not conditional overrides.

---

## 6. Visual stability
- Avoid layout shifts.
- Do NOT alter spacing, typography scale, or colors outside the target component.
- Do NOT introduce visual differences between pages unless explicitly intended.

---

## 7. Diff discipline
- Make the smallest possible change to achieve the task.
- Do NOT “improve”, “simplify”, or “generalize”.
- If solving the task would affect other pages or themes: STOP and explain.

---

## 8. Priority order
1. Existing design decisions
2. Explicit instructions in the task
3. Visual consistency across the site

Best practices, refactors, or optimizations are irrelevant unless explicitly requested.
