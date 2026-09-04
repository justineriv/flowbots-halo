# FlowBots — Halo

A homepage design direction for flowbots.ai. Review prototype, not production.

**Live:** https://justineriv.github.io/flowbots-halo/

## The direction

A pale, contained page with one dark hero panel inset on it. The panel is the
only place anything moves; everything below it is light, airy and completely
static, separated by whitespace and hairlines rather than alternating bands.

- **Ground** — soft cool gradient, solid stops only
- **Hero** — dark navy panel, copy left, the live console right
- **Accent** — FlowBots cyan `#38BADF` as a mark and a button ground. On light
  grounds it is never a text colour: it measures 2.27:1 on white. Text uses
  `#06596E`, which clears AA everywhere on this page.
- **Motion** — the drifting background inside the hero panel and the console.
  **Nothing outside the hero panel animates**, measured: 8 animations on the
  page, all of them inside `.hero`. The integration strip is a static wrapped
  row, not a marquee, because a marquee is neither the background nor static.

## Relationship to the other directions

| Direction | Its axis |
|---|---|
| Kinetic (approved) | Light ground, brand blue, photography-led, strict light/dark band alternation |
| **Halo** | Pale ground, one contained dark hero panel, static below the fold, no bands |
| Obsidian | Full dark, spotlit glass throughout, centred hero |

## Copy

Every word is carried verbatim from the approved Kinetic homepage (v91), so the
three directions are compared on design rather than on writing. No new copy was
written for this build.

## Structure

Homepage only. The other templates are not built for this direction, so links to
them are inert — every `href` is intact, and deleting the `data-inert` block at
the end of `app.js` turns them all back on.

## Known limits, stated rather than hidden

1. **The assessment form has no backend.** It validates and shows the designed
   confirmation state, and that state says plainly that nothing was sent and no
   one has been contacted. It must not be wired to look like a working form
   until a real endpoint exists behind it.
2. **No analytics ID.** CTA and lead events fire through `dataLayer`/`gtag` the
   moment GA4 or GTM is added.
3. **The O'Leary photograph shows shirts reading "RoboTeams.ai".** Carried from
   Kinetic, logged there, unresolved.
4. **Integration logos are unlicensed approximations.**
5. **`prefers-reduced-motion` is deliberately overridden.** Correct for a review
   prototype, wrong for a live site. Restore it before production. `?motion=off`
   disables motion, and that state is fully visible.

## Verification

Measured, never assumed. Contrast walks the real ancestor chain to the first
opaque background and tests gradient grounds against every opaque stop.

- 377 text nodes at 1440px, 370 at 390px — **zero contrast failures**
- No horizontal overflow at 1440, 1100, 860, 390 or 320
- No element can end invisible: every animation is additive over a visible base
- No heading level skipped, every image has alt text, no tap target under 44px

**This was a self-check.** No independent reviewer saw it, and the browser pane
could not composite frames, so no visual claim is made — see the handover notes.

## Asset versioning

GitHub Pages caches for 600 seconds. `style.css` and `app.js` carry `?v=N` and
**both must be bumped together on every push**; a drift between them once served
script that predated the feature it was supposed to support.
