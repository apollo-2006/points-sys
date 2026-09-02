# The theme contract

A theme here is a **whole design**, not a palette. It owns the colours, the typeface, the corner
language, the chrome, the vocabulary of every screen, the rank ladder, the names of every kind of
item, the icons, the sound, the motion curve, and its own drawn scene at the top of the hub.

The core app in `../index.html` knows no theme by name. It knows this contract.

## The rule

> Nothing outside a theme object may hardcode a look, a name, or a piece of art.

The core owns **structure** — grid, spacing, event wiring, state, the economy. A theme owns
**everything you can see**. If the core needs a colour it reads a token; if it needs a word it
calls `C(key)`; if it needs a mark it calls `ICON(key)`.

Enforced, not aspirational: `contract.js` validates every theme at registration and **refuses**
one that is incomplete. A missing token is a loud failure — console error always, and a red banner
under `?demo=1` or `?dev=1` — never a silent fall back to somebody else's blue.

## Files

One file per theme, named for its id, registered with `ORIGIN_THEMES.define({…})`. They are
**classic scripts on purpose**: they must finish before the deferred app module boots, and classic
scripts still load from a `file://` URL, which is how this app gets opened half the time.

## The shape

```js
ORIGIN_THEMES.define({
  id, name, tagline,
  tokens:   { …49 CSS custom properties, complete… },
  fonts:    { display, body, mono, googleHref },
  ops:      { a, b },        // operator identity colours, re-derived per theme
  copy:     { …46 keys… },   // every user-facing noun
  icons:    { …28 inline SVG strings… },
  ranks:    { span, tiers: [{n, c}], cycles },
  motion:   { ease, dur, enter, hover },
  sound:    { up, down, phase },   // {type, gain, seq:[[hz, offset]…]}
  confetti: [ …colours… ],
  favicon, themeColor,
  texture,                   // the #sky background layers
  css,                       // this theme's component chrome
  backdrop(ctx)              // the hub scene — returns SVG
});
```

### Tokens

All 49 or none. `contract.js` holds the canonical list; a theme that omits one is refused. There is
no inheritance and no partial override — the point is that a theme is a complete design, and that
switching cannot leave a stray value behind from the theme before.

Worth knowing about a few of them:

| Token | Why it exists |
| --- | --- |
| `accent-hi` | the bright end of an accent fill. Not "mix toward white" — Hufflepuff's amber goes to honey, not to paper. |
| `tt-label` / `ls-label` / `f-label` | the eyebrow treatment. The original app's `mono, .22em, uppercase` was the loudest tell that a house was a reskin; it is a token now, and Origin is the only theme that keeps it. |
| `panel-clip` / `card-clip` | the cut-corner language. `none` is a valid, common answer. |
| `shadow` | what this house's shadows are made of. A warm room does not cast a black shadow. |

### Copy

Every user-visible string resolves through `C(key)`. `scoreVerb` must be a verb that takes "-ed"
(the app builds the past tense). `{vars}` interpolate: `toastAwarded: '{what} — awarded to {who}'`.

`chartFn`…`logFn` are the plain-function tooltips on the nav, so a house's vocabulary can never cost
you the ability to find a screen.

### Icons

Inline SVG strings on a 24px grid, inheriting `currentColor`. **No emoji, ever** — the validator
rejects them. `ORIGIN_THEMES.util.baseIcons()` returns a line-drawn baseline set with `I()` and `F()`
helpers attached non-enumerably, so `Object.assign({}, B, { … })` copies the icons and not the
helpers. `markRitual` / `markMilestone` / `markPenalty` are the three node marks.

### The connector and the emblem

Both optional.

`connector({d, locked, cls, a, b})` returns SVG for the line between an item and
the item it is locked behind. Slytherin runs a serpent along it with its head at the
locked end; Hufflepuff runs a vine. Omit it and you get a dashed rule.

**Never set `stroke-dasharray` on `.focus-ring .fg`** — the app owns that property to
carry the timer's progress offset. Setting it in theme CSS silently freezes the dial
at 100%.

`emblem(ctx)` returns SVG for the header slot, and may show live state. `ctx` carries
`{lead, gap, progress, dayProgress, a, b, esc}`. Ravenclaw's orrery turns with the gap
between the two totals.

### The backdrop

`backdrop(ctx)` returns an SVG string. `ctx` gives you:

```js
ctx.places      // the groups, sorted: {id, name, color, sub, orbit, r}
ctx.active      // id of the selected group
ctx.name(pl)    // its display name
ctx.count(id)   // how many items are in it
ctx.earned(id)  // points earned there today
ctx.esc(s)      // escape — use it on every string you interpolate
ctx.hit(pl, inner, transform)   // wraps `inner` as the clickable group target
```

`ctx.hit` is the only wiring requirement: whatever is inside it becomes clickable, gains `.on` when
selected, and needs no event code. Everything else is the theme's business. It must survive 1, 2, 7
and 12 groups without overlapping or producing `NaN`.

## Adding a theme

1. `themes/<id>.js` — one `ORIGIN_THEMES.define({…})` call.
2. **One** `<script>` line in `index.html`'s head.

That is the entire integration surface. Verified empirically: a sixth theme was added, appeared in
the picker with no picker edit, applied cleanly, and drew its backdrop — for exactly **1 line added
to index.html** and 0 lines changed anywhere else.

## The five, and what each one actually is

| | Ground | Type | Backdrop | Signature | Focus dial |
| --- | --- | --- | --- | --- | --- |
| **Gryffindor** | oxblood | Cormorant Garamond + its SC cut | gilt frames on visible chains, seven different sitters, candle sconces, a drawn hearth | three flame layers on three periods; firelight spills onto the frames by distance | wide candlelit ring, gilt hairlines |
| **Slytherin** | near-black slate | Bodoni Moda + Cormorant | a receding stone corridor, serpent-carved arches in perspective | drifting water caustics on the page *and* every panel; silver filigree along panel tops; blackletter on the crest only | engraved hairlines, no bloom |
| **Ravenclaw** | midnight blue | EB Garamond + IBM Plex Mono | ink asterisms on parchment, marginalia, brass corner fittings | a brass orrery in the header that turns with the score gap; **zero** glow or shadow anywhere; tabular figures throughout | astrolabe graduation dial |
| **Hufflepuff** | warm loam | Fraunces + Nunito | the sett in cross-section: round doors, engraved copper nameplates, root runs | honeycomb geometry — the rank meter fills cell by cell; hex-chamfered cards; roundest geometry of the five | comb ring of cells |
| **Origin System** | void | Chakra Petch + Share Tech Mono | the star chart | **the control**, lifted verbatim | the original neon arc |

Each house also owns its own connector, node marks, rank ladder, node-type names,
cadence wording, voice, sound and confetti. No two share a layout.

## The sorting screen

`openCeremony(first)` renders every registered house as a card painted entirely from that
house's own tokens, set inline. There is not one house colour in the ceremony's stylesheet.
A card reads:

| From the theme | Shown as |
| --- | --- |
| `tokens.void`, `texture` | the card's ground |
| `tokens.line`, `radius-lg` | its border and corner |
| `icons.crest` | the crest, in `tokens.accent` |
| `name`, `tagline` | the heading and creed, in `f-display` / `f-body` |
| `copy.group` | the mini panel's label |
| `copy.typeMilestone`, `icons.markMilestone` | the mini node row |
| `copy.scoreVerb`, `copy.score` | the mini button and its caption |
| `tokens.panel-clip` | the mini panel's chamfer |

So a new theme appears in the sorting screen fully dressed, with no edit to the ceremony.

Two things to know if you touch it:

* **`HOUSES` decides which themes get a card.** Anything not in that list is offered as a text
  link in the footer instead — that is how Origin stays selectable without becoming a fifth card
  and forcing a scroll on a phone.
* **Never reuse a core class name.** The mini node mark was originally `.mk`, which is already
  the market-card class in the core stylesheet; it silently inherited the market card's padding
  and collapsed the icon to zero. It is `.cer-mk` now.

## Contrast

Two instruments, because a ratio and a hue distance answer different questions.

* **WCAG 2.1 contrast** for text on its background — measured twice: once from the
  tokens, and once on the **real painted page** in headless Chromium, walking each
  element's ancestors and compositing every background layer (a translucent panel over
  a textured `#sky` is not its literal token value, and gradient fills report
  `backgroundColor: transparent`).
* **CIEDE2000** for "can you tell these two operators apart" — a luminance ratio says
  nothing about hue, and that question is entirely about hue.

Operator colours, re-derived per house so that neither collides with the house metal
or with each other:

| Theme | Abir | Jade | A on ground | B on ground | A on panel | B on panel | ΔE A/B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gryffindor | `#E28A4C` copper | `#78BBA6` verdigris | 7.23 | 8.57 | 6.63 | 7.86 | 69.2 |
| Slytherin | `#E893A4` cold rose | `#D8C173` pale gold | 8.60 | 11.09 | 7.91 | 10.21 | 52.9 |
| Ravenclaw | `#E0736B` sanguine ink | `#7FA8DE` indigo ink | 6.29 | 7.88 | 5.89 | 7.38 | 69.8 |
| Hufflepuff | `#EC8098` beetroot | `#7CC08A` garden green | 7.05 | 8.49 | 5.75 | 6.93 | 78.4 |
| Origin | `#FF6B5B` | `#4FE0A0` | 7.21 | 12.01 | 6.71 | 11.18 | 111.3 |

All four houses clear 4.5:1 for body copy and 3:1 for large text and meaningful edges
on every measured element. **Origin does not**, and is left that way on purpose — see
below.

## Origin and the legibility bar

Origin is the control: its values are lifted verbatim so that a pixel-identical render
proves the abstraction is sound. But the pre-refactor app's `--txt-3` (`#5E7183`) does
not clear 4.5:1 at small sizes, so preserving it exactly and passing the legibility bar
are mutually exclusive.

Origin is preserved. Its six shortfalls, measured on the painted page:

| Element | Size | Ratio | Needs |
| --- | --- | --- | --- |
| node meta | 10.5px | 3.73 | 4.5 |
| operator rank | 10px | 3.73 | 4.5 |
| eyebrow label | 10px | 4.00 | 4.5 |
| nav (inactive) | 12px | 3.73 | 4.5 |
| group chip | 11.5px | 3.79 | 4.5 |
| group subtitle | 11px | 4.00 | 4.5 |

One token fixes all six: `'txt-3': '#6E8497'` in `origin.js` takes them to 4.84–5.20 and
is a barely perceptible lift. It is not applied, because "pixel-identical" was the
explicit brief for this theme. Say the word and it is a one-line change.
