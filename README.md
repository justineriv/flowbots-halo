# FlowBots — Light

A homepage design direction for flowbots.ai. Review prototype, not production.

**Live:** https://justineriv.github.io/flowbots-halo/

## What this build fixed

The previous version was rejected for empty space. Two causes, both measured:

1. **Nine section headers had an empty second column** — 500px wide, 6px tall,
   reserving 42% of the page width and inflating every row it sat in. The
   heading is now a single column with the supporting line beneath it.
2. **Section padding was 128-174px.** It is now 72px, and the top of the
   spacing scale came down with it.

Measured before and after, same content:

| | Before | After |
|---|---|---|
| Underfilled rows | 10 (at 44% fill) | **0** |
| Empty grid tracks | 8 | **0** |
| Largest vertical gap | 32px | **0px** |
| Ink ratio | 30.4% | **38.8% desktop, 46.9% mobile** |
| Page height | 19,396px | **11,785px** |

## The design

Built to the Infintech Designs homepage as the density reference: standard
sticky top navigation, full-bleed sections edge to edge, high information per
screen, tight vertical rhythm. This skin runs pale grounds with one dark band for rhythm, rounded cards lifted on soft shadow, centred section heads and pill buttons.

Four section tones alternate down the page with no two neighbours alike, and
**the accent is blue on every tone** — there is no warm or gold accent anywhere.

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
   standing decision. `?motion=off` gives a fully visible static page.

## Verification

Contrast walks the real ancestor chain to the first opaque background, tests
gradient grounds against every opaque stop, and composites both alpha and
element opacity. Layout density is measured too — empty grid tracks, row fill
ratio, largest vertical gap and ink ratio — because none of the other checks
can see empty space, which is exactly how the previous build shipped.

- **385 at 1440px, 372 at 390px text nodes — one exemption, no failures. The only reported item is the cyan `.ai` in the FlowBots logotype on white (2.27:1), which is the client's real brand mark and is exempt under WCAG 1.4.3**
- No horizontal overflow at 1440, 1100, 860, 390 or 320
- 0 empty grid tracks, 0 underfilled rows, 0px largest vertical gap
- The console entrance **moves but never fades**: opacity stays 1 throughout
- No heading level skipped, alt text on every image, no tap target under 44px
- `integrity.py` clean

**This was a self-check.** No independent reviewer, and the browser pane cannot
composite frames, so no visual claim is made.

## Asset versioning

GitHub Pages caches for 600s. `style.css` and `app.js` carry `?v=N` and both
must be bumped together on every push.
