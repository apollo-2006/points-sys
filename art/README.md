# art

Two kinds of thing live here, and they are not under the same terms.

## Warner Bros. property

| file | what | where from |
| --- | --- | --- |
| `gryffindor-ground.webp` | lion fur; no longer used by either house | harrypotter.com, house collection hero |
| `slytherin-ground.webp` | serpent scale; no longer used by either house | harrypotter.com, house collection hero |
| `great-hall-candles.webp` | the candle band; no longer used (the candles are drawn) | harrypotter.com, Great Hall fact file |
| `place-classrooms.webp` | greenhouse vaulting; only Origin still shows it | harrypotter.com, greenhouses fact file |
| `place-focus.webp` | a tower at night; only Origin still shows it | harrypotter.com, Astronomy Tower fact file |
| `place-hogsmeade.webp` | the village in snow; only Origin still shows it | harrypotter.com, Hogsmeade fact file |
| `place-quidditch.webp` | the pitch; only Origin still shows it | harrypotter.com, Quidditch pitch fact file |
| `gate-castle.webp` | arriving across the lake, behind the sign-in | harrypotter.com, Hogwarts fact file |

**This is why the repository is private.** Keep it that way. None of these are
ours and this is a two person scoreboard, not something to publish or hand on.

## Public domain, or drawn here

| file | what | where from |
| --- | --- | --- |
| `parchment.webp` | the sheet the log is written on | a 12th century parchment in the Ashmolean, via Wikimedia Commons |
| `gryffindor-crest.svg` | the house arms: a gold lion rampant on scarlet | shield and colouring drawn here; the lion is [Meuble héraldique Lion](https://commons.wikimedia.org/wiki/File:Meuble_h%C3%A9raldique_Lion.svg), public domain |
| `slytherin-crest.svg` | the house arms: a silver serpent on green | drawn here |

Those are fine anywhere. The crests replaced the harrypotter.com brand icons,
which are the 2018 coral-and-teal redesign rather than the arms in the films.

Everything else the two houses show (the floating candles, the hangings, the
stone, the lake light, and the castle over each screen) is drawn in code in
`themes/heraldry.js` and the theme files, and has no file here.

## Taking the licensed files back out

The code is built to manage without them, so this is small:

* **grounds, candles** - nothing to do; neither house uses them any more.
  Delete the files.
* **place bands** - empty the `PLACES` map in `index.html`. Only Origin reads
  it now (the houses draw their own scenes), and `placeBand()` returns
  nothing for a view it has no picture of.
* **the gate** - remove the `background` line from `#setupGate::before`. The
  panel keeps its own surface and sits on the page ground.

Then delete the files. Ten minutes, and no screen breaks.
