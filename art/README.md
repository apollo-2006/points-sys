# art

Two kinds of thing live here, and they are not under the same terms.

## Warner Bros. property

| file | what | where from |
| --- | --- | --- |
| `gryffindor-crest.svg` | the house arms | harrypotter.com, house collection page |
| `slytherin-crest.svg` | the house arms | harrypotter.com, house collection page |
| `gryffindor-ground.webp` | lion fur, the page ground | harrypotter.com, house collection hero |
| `slytherin-ground.webp` | serpent scale, the page ground | harrypotter.com, house collection hero |
| `great-hall-candles.webp` | the floating candles over the seat | harrypotter.com, Great Hall fact file |
| `place-classrooms.webp` | the greenhouse vaulting, over Classrooms | harrypotter.com, greenhouses fact file |
| `place-focus.webp` | a tower at night, over the Time-Turner | harrypotter.com, Astronomy Tower fact file |
| `place-hogsmeade.webp` | the village in snow, over Hogsmeade | harrypotter.com, Hogsmeade fact file |
| `place-quidditch.webp` | the pitch, over the wagers | harrypotter.com, Quidditch pitch fact file |
| `gate-castle.webp` | arriving across the lake, behind the sign-in | harrypotter.com, Hogwarts fact file |

**This is why the repository is private.** Keep it that way. None of these are
ours and this is a two person scoreboard, not something to publish or hand on.

## Public domain

| file | what | where from |
| --- | --- | --- |
| `parchment.webp` | the sheet the log is written on | a 12th century parchment in the Ashmolean, via Wikimedia Commons |

That one is fine anywhere.

## Taking the licensed files back out

The code is built to manage without them, so this is small:

* **crests** - drop the `crest:` line from an entry in `H.arms`
  (`themes/heraldry.js`) and it falls back to a drawn shield with a drawn
  charge, which is what Origin already uses. Nothing else changes.
* **grounds** - remove the `url(art/..-ground.webp)` layer from that theme's
  `texture`. The gradients under it stand on their own.
* **candles** - remove the `background` line from `.hr-candles`. The seat keeps
  its padding and simply has nothing hanging over it.
* **place bands** - empty the `PLACES` map in `index.html`. `placeBand()`
  returns nothing for a view it has no picture of, so every screen simply
  starts at its own content again.
* **the gate** - remove the `background` line from `#setupGate::before`. The
  panel keeps its own surface and sits on the page ground.

Then delete the files. Ten minutes, and no screen breaks.
