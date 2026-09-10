# The theme contract

A theme here is a **whole design**, not a palette. It owns the colours, the typeface, the corner
language, the chrome, the vocabulary of every screen, the rank ladder, the names of every kind of
item, the icons, the sound, the motion curve, and its own drawn scene at the top of the hub.

The core app in `../index.html` knows no theme by name. It knows this contract.

## The rule

> Nothing outside a theme object may hardcode a look, a name, or a piece of art.

The core owns **structure** - grid, spacing, event wiring, state, the economy. A theme owns
**everything you can see**. If the core needs a colour it reads a token; if it needs a word it
calls `C(key)`; if it needs a mark it calls `ICON(key)`.

Enforced, not aspirational: `contract.js` validates every theme at registration and **refuses**
one that is incomplete. A missing token is a loud failure - console error always, and a red banner
under `?demo=1` or `?dev=1` - never a silent fall back to somebody else's blue.

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
  backdrop(ctx)              // the hub scene - returns SVG
});
```

### Tokens

All 49 or none. `contract.js` holds the canonical list; a theme that omits one is refused. There is
no inheritance and no partial override - the point is that a theme is a complete design, and that
switching cannot leave a stray value behind from the theme before.

Worth knowing about a few of them:

| Token | Why it exists |
| --- | --- |
| `accent-hi` | the bright end of an accent fill. Not "mix toward white" - an amber goes to honey, not to paper. |
| `tt-label` / `ls-label` / `f-label` | the eyebrow treatment. The original app's `mono, .22em, uppercase` was the loudest tell that a house was a reskin; it is a token now, and Origin is the only theme that keeps it. |
| `panel-clip` / `card-clip` | the cut-corner language. `none` is a valid, common answer. |
| `shadow` | what this house's shadows are made of. A warm room does not cast a black shadow. |

### Copy

Every user-visible string resolves through `C(key)`. `scoreVerb` must be a verb that takes "-ed"
(the app builds the past tense). `{vars}` interpolate: `toastAwarded: '{what} - awarded to {who}'`.

`chartFn`…`logFn` are the plain-function tooltips on the nav, so a house's vocabulary can never cost
you the ability to find a screen.

### Icons

Inline SVG strings on a 24px grid, inheriting `currentColor`. **No emoji, ever** - the validator
rejects them. `ORIGIN_THEMES.util.baseIcons()` returns a line-drawn baseline set with `I()` and `F()`
helpers attached non-enumerably, so `Object.assign({}, B, { … })` copies the icons and not the
helpers. `markRitual` / `markMilestone` / `markPenalty` are the three node marks.

### The connector and the emblem

Both optional.

`connector({d, locked, cls, a, b})` returns SVG for the line between an item and
the item it is locked behind. Slytherin runs a serpent along it with its head at the
locked end. Omit it and you get a dashed rule.

**Never set `stroke-dasharray` on `.focus-ring .fg`** - the app owns that property to
carry the timer's progress offset. Setting it in theme CSS silently freezes the dial
at 100%.

`emblem(ctx)` returns SVG for the header slot, and may show live state. `ctx` carries
`{lead, gap, progress, dayProgress, a, b, esc}` - so an emblem may turn with the gap
between the two totals.

### The room, and the heraldic kit

`themes/heraldry.js` holds the shared material vocabulary - the thing a house is
*made of*, as opposed to the colour it is painted. Four pieces:

| | |
| --- | --- |
| **pennant** | a hanging banner, flat top and swallowtail cut, bearing a charge. This is what an operator is, and what a room is. |
| **frame** | a double hairline with bracketed corners and a chevron notched into the top rail. This is what a panel is. |
| **cartouche** | a chamfered plate for a label, sitting *on* a rule rather than floating above one. This is what an eyebrow is. |
| **rule** | a hairline with a lozenge at its centre. This is a divider. |

`H.arms` carries each house's field, metal, ink and charge, so an operator wearing
another house's colours is drawn in **their** arms on your screen - which is the
whole point of a scoreboard between two houses. A theme calls
`ORIGIN_HERALDRY.standard(ctx)` for the scoreboard and `roomStandard(ctx, cfg)` for
the room, and gets both without writing markup.

**What this replaced.** The room used to be a 4000px photograph under a pan-and-zoom
camera (`diorama.js`), with a 360° sphere renderer behind it (`pano.js` + 670 KB of
three.js) and a drawn isometric scene behind *that*. Three room systems, and the one
that won the branch was a borrowed game render. Awarding a point meant: open the room,
find a pin, open the deed panel, scroll, click. It is one click now, and the whole app
is 392 KB.

Two things worth knowing if you touch it:

* **Theme CSS is concatenated *after* `ORIGIN_HERALDRY.css`**, so a house can override
  any of it. The old room lost that fight: a flat-view rule set
  `text-transform:uppercase` and `letter-spacing:.1em`, the camera's own rule set
  `font-family:var(--f-display)`, neither overrode the other completely, and the pins
  came out as Great Vibes - a connecting script - in spaced capitals over stone.
  Nobody wrote that; the cascade did.
* **A label is never `--f-display`.** A house's display face is chosen to carry a
  heading. At 10px it has to carry legibility instead, and a script cannot.

## Adding a theme

1. `themes/<id>.js` - one `ORIGIN_THEMES.define({…})` call.
2. **One** `<script>` line in `index.html`'s head.

That is the entire integration surface. Verified empirically: a sixth theme was added, appeared in
the picker with no picker edit, applied cleanly, and drew its backdrop - for exactly **1 line added
to index.html** and 0 lines changed anywhere else.

## The three, and what each one actually is

| | Ground | Type | Backdrop | Signature | Focus dial |
| --- | --- | --- | --- | --- | --- |
| **Gryffindor** | oxblood | Cormorant Garamond + Cormorant SC + Lora | a lion pennant in scarlet and gilt | warm gilt hairlines; the wordmark carries a travelling gold sweep | wide candlelit ring |
| **Slytherin** | near-black slate | Bodoni Moda + Cormorant SC + Spectral | a serpent pennant in green and silver | cold high-contrast type; engraved hairlines, no bloom | engraved dial |
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
  link in the footer instead - that is how Origin stays selectable without becoming a fifth card
  and forcing a scroll on a phone.
* **Never reuse a core class name.** The mini node mark was originally `.mk`, which is already
  the market-card class in the core stylesheet; it silently inherited the market card's padding
  and collapsed the icon to zero. It is `.cer-mk` now.

## Contrast

Two instruments, because a ratio and a hue distance answer different questions.

* **WCAG 2.1 contrast** for text on its background - measured twice: once from the
  tokens, and once on the **real painted page** in headless Chromium, walking each
  element's ancestors and compositing every background layer (a translucent panel over
  a textured `#sky` is not its literal token value, and gradient fills report
  `backgroundColor: transparent`).
* **CIEDE2000** for "can you tell these two operators apart" - a luminance ratio says
  nothing about hue, and that question is entirely about hue.

Operator colours, re-derived per house so that neither collides with the house metal
or with each other:

| Theme | Abir | Jade | A on ground | B on ground | A on panel | B on panel | ΔE A/B |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gryffindor | `#E28A4C` copper | `#78BBA6` verdigris | 7.23 | 8.57 | 6.63 | 7.86 | 69.2 |
| Slytherin | `#E893A4` cold rose | `#D8C173` pale gold | 8.60 | 11.09 | 7.91 | 10.21 | 52.9 |
| Origin | `#FF6B5B` | `#4FE0A0` | 7.21 | 12.01 | 6.71 | 11.18 | 111.3 |

All four houses clear 4.5:1 for body copy and 3:1 for large text and meaningful edges
on every measured element. **Origin does not**, and is left that way on purpose - see
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
