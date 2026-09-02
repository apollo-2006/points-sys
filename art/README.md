# Room art

A room is one big render and a set of coordinates. The app holds a camera over
the image, starts you zoomed in, and lets you drag along the wall; the doorways
and the noticeboard are anchored to points on the picture, so they stay on the
brick they belong to at any zoom.

No WebGL. Works from `file://`. Loads in one image fetch.

## Adding a room

1. Render it. Landscape (3:2 or 16:10) at **4000 px wide** or thereabouts —
   the camera zooms to about 4x, so the pixels get used.
2. Save it as `art/<house>-<room>-wide.webp` (quality 86 gives ~1 MB).
3. Add a block to `DIORAMA` in the theme file:

```js
mars: {
  src:  'art/gryffindor-library-wide.webp',
  home:  { u: 0.50, v: 0.52, z: 1.12 },   // where the camera starts
  board: { u: 0.82, v: 0.70, z: 3.4 },    // the wall the deeds hang on
  pins: {                                  // where each doorway stands
    saturn: { u: 0.56, v: 0.52 },
    earth:  { u: 0.06, v: 0.44 }
  },
  notes: [ { u: 0.30, v: 0.73, text: 'the hearth' } ]
}
```

`u` and `v` are fractions of the image — `u: 0` is the left edge, `v: 0` the
top. Any room without a block falls back to the flat view, so the set fills in
one room at a time.

## Finding the coordinates

Drop the render through this and read the numbers off the grid:

```bash
python3 -c "
from PIL import Image, ImageDraw
im = Image.open('room.png').convert('RGB').resize((1200,750)); d = ImageDraw.Draw(im)
for i in range(1,10):
    x, y = int(1200*i/10), int(750*i/10)
    d.line([(x,0),(x,750)], fill=(255,220,80)); d.line([(0,y),(1200,y)], fill=(255,220,80))
    d.text((x+3,4), f'.{i}', fill=(255,240,120)); d.text((4,y+3), f'.{i}', fill=(255,240,120))
im.save('grid.png')"
```

## Two things that will bite

**Keep the noticeboard away from the right edge.** The deed panel covers the
right of the frame, and the camera cannot centre on something closer to the
edge than half the visible width. If the board is at `u > 0.85` you will not be
able to travel to it. Frame the render so it sits around `u 0.75–0.85`.

**Leave the corners quiet.** Doorway labels sit on top of the picture; a corner
full of detail makes them hard to read.

## Rendering from the GLB

`gryffindor_common_room.glb` is the model the Gryffindor room came from. It is
57k triangles — nothing — but 23.5 MB, almost all of it uncompressed PNG
textures, which is why it ships as stills rather than as a model the browser
loads.

`tools/render_glb.mjs` drives a headless three.js scene over it and writes a
still from any camera. That is how `gryffindor-common-room-wide.webp` was made,
and it means new views of that room need no Blender at all:

```bash
node tools/render_glb.mjs --yaw 158 --fov 88 --w 4000 --h 2500 --out art/x.png
```

Blender is still the better tool where the scene lives there — this is just a
shortcut for reframing a room that is already modelled.
