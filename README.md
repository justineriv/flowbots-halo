# FlowBots — Slab

A homepage design direction for flowbots.ai. Review prototype, not production.

**Live:** https://justineriv.github.io/flowbots-halo/

## What makes it a different design, not a reskin

Kinetic runs edge-to-edge full-width bands under a sticky top header, opens
nearly every section with a centred eyebrow / H2 / sub, and lays content out in
equal-box card grids at 2, 5, 3 and 4 columns.

Slab shares none of that structure.

| | Kinetic | Slab |
|---|---|---|
| Page | Edge-to-edge bands | **Inset rounded slabs**, page ground visible around and between them |
| Nav | Sticky top header bar | **Floating pill**, detached from the page |
| Section heads | Centred eyebrow / H2 / sub | **Left-hung, asymmetric** — heading hard left, support offset right |
| Content | Equal-box card grids | **Editorial**: staggered number blocks, offset problem rows, a hanging timeline, a dense two-column index |
| Order | Problems first, data seventh | **Data first**, form near the end |

Only the copy and the hero console are carried across.

## Alternating colour

Five slab tones — ink, deep, cream, white, mint — across thirteen slabs, and
**no two neighbouring slabs share a tone.** The slab edges make each change
visible; this is not a wash that has to be looked for.

Colour is keyed to the slab tone, never to a semantic modifier. Each tone sets
its own foreground, muted, faint, accent and line values, and every component
inherits from those. That is what stops a component appearing on two grounds
from going invisible on one of them.

## The hero animation

Layered conic-gradient glass, **rotating and morphing** — rotation and the
border-radius morph run on separate clocks so the silhouette never repeats at
the same angle. Built from the reference Justine supplied.

Motion is confined to the hero slab, the console and the logo strip. Nothing
else on the page animates.

## Known limits, stated rather than hidden

1. **The assessment form has no backend.** It validates and shows the designed
   confirmation, and that state says plainly that nothing was sent and no one
   has been contacted.
2. **No analytics ID.** Events fire through `dataLayer`/`gtag` once GA4 or GTM
   is added.
3. **The O'Leary photograph shows shirts reading "RoboTeams.ai".** Carried from
   Kinetic, logged there, unresolved.
4. **Integration logos are unlicensed approximations.**
5. **`prefers-reduced-motion` is deliberately overridden**, per Justine's
   standing decision. Correct for a review prototype, wrong for production.
   `?motion=off` gives a fully visible static page.

## Verification

Measured, never assumed. Contrast walks the real ancestor chain to the first
opaque background, tests gradient grounds against every opaque stop, and
composites both alpha and element opacity.

- **382 text nodes at 1440px, 372 at 390px — zero contrast failures**
- No horizontal overflow at 1440, 1100, 860, 390 or 320
- The console entrance **moves but never fades**: opacity stays 1 throughout,
  so a stalled animation clock cannot leave a line unreadable
- No heading level skipped, alt text on every image, no tap target under 44px
- `integrity.py` clean

**This was a self-check.** No independent reviewer, and the browser pane could
not composite frames, so no visual claim is made.

## Asset versioning

GitHub Pages caches for 600s. `style.css` and `app.js` carry `?v=N` and both
must be bumped together on every push.
