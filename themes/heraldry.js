/* ==========================================================================
   THE HERALDIC KIT
   --------------------------------------------------------------------------
   A shared vocabulary of *surfaces*, so a house is made of materials rather
   than of tinted rectangles.

   The room used to be a photograph you flew a camera over. It is now a
   standard: a pennant bearing the house beast, hung on a rule, with the
   places of the house cut into cartouches around it. Nothing to load, nothing
   to pan, and every one of them is drawn from the theme's own tokens.

   Four pieces, and every screen is built from them:

     PENNANT    a hanging banner - flat top, swallowtail cut - carrying a
                charge (the beast) and a legend. This is what an operator is.
     FRAME      a double hairline with bracketed corners and a chevron notched
                into the top rail. This is what a panel is.
     CARTOUCHE  a chamfered plate for a label, sitting ON a rule rather than
                floating above one. This is what an eyebrow is.
     RULE       a hairline with a lozenge at its centre. This is a divider.

   Everything here inherits `currentColor` and reads its colour from tokens,
   so the same markup is scarlet-and-gilt in one house and slate-and-silver in
   the next without a branch.
   ========================================================================== */
(function () {
  'use strict';

  var H = {};
  window.ORIGIN_HERALDRY = H;

  /* ES5 on purpose, like the rest of these files */
  function assign(t) {
    for (var i = 1; i < arguments.length; i++) {
      var o = arguments[i];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) t[k] = o[k];
    }
    return t;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- THE ARMS -------------------------------------------------------
     A heater shield: flat top with turned corners, straight flanks, and a
     sweep to the point. The geometry is the same for every house, and only
     the tinctures and the charge change, which is how arms actually work.

     The charges are silhouettes rather than line drawings. The reference
     draws them as a single hairline at 170px; this mark also has to hold at
     40px in a header, where a 2px line is noise. Detail is cut OUT of the
     silhouette in the field colour, so it thins gracefully instead of
     vanishing. */
  var SHIELD = 'M13 4 H87 A7 7 0 0 1 94 11 V54 C94 82 76 102 50 116 C24 102 6 82 6 54 V11 A7 7 0 0 1 13 4 Z';
  H.SHIELD = SHIELD;   /* the silhouette, for masking a shine onto the arms */

  function mane(cx, cy, rLong, rShort, rIn, n) {
    var d = '', i, a, r;
    for (i = 0; i < n * 2; i++) {
      a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      r = i % 2 ? rIn : (i % 4 ? rShort : rLong);
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' +
           (cy + Math.sin(a) * r).toFixed(2);
    }
    return d + 'Z';
  }
  var CHARGES = {
    lion: function (m, f) {
      return '<path d="' + mane(50, 60, 27, 24, 21, 13) + '" fill="' + m + '"' +
          ' stroke="' + m + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<ellipse cx="50" cy="62" rx="14.5" ry="15.5" fill="' + f + '"/>' +
        /* ears */
        '<path d="M37.5 50.5c-1.4-3.6-.6-6.6 1.4-7.6 1.8 2 2.6 4.8 2.4 7.6z" fill="' + m + '"/>' +
        '<path d="M62.5 50.5c1.4-3.6.6-6.6-1.4-7.6-1.8 2-2.6 4.8-2.4 7.6z" fill="' + m + '"/>' +
        /* eyes: almonds, angled inward, not circles */
        '<path d="M40.4 62.4c1.4-2.6 4.2-3.4 6.4-1.8-1.2 2.8-4.2 3.6-6.4 1.8z" fill="' + m + '"/>' +
        '<path d="M59.6 62.4c-1.4-2.6-4.2-3.4-6.4-1.8 1.2 2.8 4.2 3.6 6.4 1.8z" fill="' + m + '"/>' +
        /* brow, muzzle, jaw */
        '<path d="M41.8 57.2c1.8-1.4 4-1.6 6 -.6M58.2 57.2c-1.8-1.4-4-1.6-6-.6"' +
          ' fill="none" stroke="' + m + '" stroke-width="1.7" stroke-linecap="round"/>' +
        '<path d="M45.6 68.2h8.8l-2.2 3.2h-4.4z" fill="' + m + '"/>' +
        '<path d="M50 71.4v2.6m0 0c0 2.2-1.8 3.6-4 3.6m4-3.6c0 2.2 1.8 3.6 4 3.6"' +
          ' fill="none" stroke="' + m + '" stroke-width="1.9" stroke-linecap="round"/>';
    },
    serpent: function (m, f) {
      return '<g fill="none" stroke="' + m + '" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M41 43c11 1 17 6 17 12s-7 9-14 11-11 5-11 10 6 9 15 9" stroke-width="7.2"/>' +
        '</g>' +
        /* the head, a wedge with an eye and a forked tongue */
        '<path d="M45 34l-14 4c-2 .6-2.6 3-1 4.6l7 6.6c1.8 1.6 4.6.6 5-1.8z" fill="' + m + '"/>' +
        '<circle cx="39.5" cy="40.5" r="1.9" fill="' + f + '"/>' +
        '<path d="M31 38l-8-2.4m8 2.4l-7.4 2.6" fill="none" stroke="' + m + '"' +
          ' stroke-width="2.2" stroke-linecap="round"/>' +
        /* the tail, tapered off the last coil */
        '<path d="M48 85c5 0 8 1.6 9.6 4.2" fill="none" stroke="' + m + '"' +
          ' stroke-width="4" stroke-linecap="round"/>';
    },

    /* a mullet, for a house with no beast */
    star: function (m) {
      return '<path d="M50 36l5.2 15.6H72l-13.4 9.8 5.2 15.8L50 67.4 36.2 77.2l5.2-15.8L28 51.6h16.8z"' +
        ' fill="' + m + '" stroke="' + m + '" stroke-width="2" stroke-linejoin="round"/>';
    }
  };

  /* opts: { charge, field, fieldHi, metal, label, w, crest }

     A house that has its own arms on file wears them. The drawn shield below
     is the fallback, and it is what Origin and any new house get: the geometry
     and the charges are still here so a house is never crestless. */
  H.crest = function (o) {
    var w = o.w || 100, h = Math.round(w * 1.2);
    if (o.crest) {
      return '<img class="hr-crest" src="' + esc(o.crest) + '" width="' + w + '" height="' + h +
        '" alt="' + esc(o.label || '') + '" draggable="false">';
    }
    var id = 'c' + Math.random().toString(36).slice(2, 7);
    var charge = CHARGES[o.charge] || CHARGES.star;
    return '<svg class="hr-crest" viewBox="0 0 100 120" width="' + w + '" height="' + h + '"' +
      ' role="img" aria-label="' + esc(o.label || '') + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + esc(o.fieldHi) + '"/>' +
        '<stop offset="1" stop-color="' + esc(o.field) + '"/></linearGradient></defs>' +
      '<path d="' + SHIELD + '" fill="url(#' + id + ')"/>' +
      '<path d="' + SHIELD + '" fill="none" stroke="' + esc(o.metal) + '" stroke-width="6"' +
        ' transform="translate(8 9.6) scale(.84)"/>' +
      charge(esc(o.metal), esc(o.field)) +
    '</svg>';
  };

  /* ---- the arms of each house ------------------------------------------
     Cross-house data, so an operator wearing another house's colours is drawn
     in THEIR arms on your screen - which is the whole point of a scoreboard
     between two houses. Field, the bright of the field, the metal, and the
     ink the beast is drawn in. */
  H.arms = {
    gryffindor: { charge: 'lion',    field: '#8E1217', fieldHi: '#B81E24', metal: '#E6B64E', gem: '#D11F2E',
                  crest: 'art/gryffindor-crest.svg' },
    slytherin:  { charge: 'serpent', field: '#0E4A2C', fieldHi: '#1F7A4E', metal: '#D4DDDA', gem: '#17A35C',
                  crest: 'art/slytherin-crest.svg' },
    origin:     { charge: 'star',    field: '#1A2036', fieldHi: '#333F63', metal: '#9FB2D8',
                  gem: '#5B78C8' }
  };
  H.armsOf = function (ctx, p) {
    var id = ctx.houseOf && ctx.houseOf(p);
    return H.arms[id] || H.arms[ctx.themeId] || H.arms.origin;
  };

  /* The arms at any size, for anywhere in the app that wants to say which
     house something belongs to: the header button, a name in the log, a card
     in the sorting screen. Falls back to the drawn shield exactly as crest()
     does, so a house without art on file is still marked. */
  H.mark = function (themeId, px) {
    var a = H.arms[themeId];
    if (!a) return '';
    return H.crest(assign({}, a, { label: themeId, w: px || 16 }));
  };

  /* ---- THE HOURGLASS ---------------------------------------------------
     The Great Hall counts house points in four of these, and the gems run from
     the upper globe to the lower one as points are awarded. This app IS that
     object, so the rank meter is one.

     Built off the prop rather than off the idea of an hourglass: it is tall and
     narrow, roughly one to two and a half, with a hard pinch at the waist and
     full round globes above and below it. Brass collars top and bottom, two
     slender posts down the sides, a knop on top and a plinth under it. The
     gems are lit, because in the hall they are.

     `p` is 0..1. `gem` is the stone: rubies for Gryffindor, emeralds for
     Slytherin. */
  H.hourglass = function (o) {
    var p = Math.max(0, Math.min(1, o.p || 0)), m = o.metal, g = o.gem;
    var id = 'h' + Math.random().toString(36).slice(2, 7);
    var w = o.w || 32, h = Math.round(w * 104 / 44);

    /* rim y15, waist y52, foot y89, so the two globes are 37 apart each */
    var GLASS = 'M9 15C4 27 6 41 20 52 6 63 4 77 9 89L35 89C40 77 38 63 24 52 38 41 40 27 35 15Z';
    var upTop = 52 - (1 - p) * 37;    /* what has not fallen, on the upper floor */
    var loTop = 89 - p * 37;          /* what has, heaped in the lower globe */

    return '<svg class="hr-glass" viewBox="0 0 44 104" width="' + w + '" height="' + h + '"' +
      ' role="img" aria-label="' + esc(o.label || '') + '">' +
      '<defs>' +
        '<clipPath id="' + id + '"><path d="' + GLASS + '"/></clipPath>' +
        /* the stones: a close heap of faceted gems, each with its own glint */
        '<pattern id="' + id + 'g" width="4.4" height="3.8" patternUnits="userSpaceOnUse">' +
          '<rect width="4.4" height="3.8" fill="' + g + '"/>' +
          '<circle cx="1.1" cy="1" r="1.55" fill="#000" opacity=".28"/>' +
          '<circle cx="3.3" cy="2.9" r="1.55" fill="#000" opacity=".28"/>' +
          '<circle cx="1.1" cy="1" r="1.25" fill="' + g + '"/>' +
          '<circle cx="3.3" cy="2.9" r="1.25" fill="' + g + '"/>' +
          '<circle cx=".7" cy=".6" r=".42" fill="#fff" opacity=".75"/>' +
          '<circle cx="2.9" cy="2.5" r=".42" fill="#fff" opacity=".75"/>' +
        '</pattern>' +
        '<linearGradient id="' + id + 'v" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#fff" stop-opacity=".22"/>' +
          '<stop offset=".3" stop-color="#fff" stop-opacity="0"/>' +
          '<stop offset=".78" stop-color="#fff" stop-opacity="0"/>' +
          '<stop offset="1" stop-color="#fff" stop-opacity=".12"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + m + '" stop-opacity=".55"/>' +
          '<stop offset=".38" stop-color="' + m + '"/>' +
          '<stop offset="1" stop-color="' + m + '" stop-opacity=".5"/>' +
        '</linearGradient>' +
      '</defs>' +
      /* the glass */
      '<path d="' + GLASS + '" fill="rgba(255,255,255,.05)"/>' +
      '<g clip-path="url(#' + id + ')">' +
        '<rect x="2" y="' + upTop.toFixed(1) + '" width="40" height="' +
          (52 - upTop).toFixed(1) + '" fill="url(#' + id + 'g)" opacity=".62"/>' +
        '<rect x="2" y="' + loTop.toFixed(1) + '" width="40" height="' +
          (89 - loTop).toFixed(1) + '" fill="url(#' + id + 'g)"/>' +
        /* the heap is domed, not a level fill */
        '<ellipse cx="22" cy="' + loTop.toFixed(1) + '" rx="15" ry="2.4" fill="url(#' + id + 'g)"/>' +
        (p > 0.015 && p < 0.985
          ? '<rect x="21.1" y="46" width="1.8" height="14" fill="' + g + '" opacity=".9"/>' : '') +
        /* the light the gems throw inside the glass */
        '<ellipse cx="22" cy="' + (89 - (89 - loTop) / 2).toFixed(1) + '" rx="17" ry="9" fill="' + g +
          '" opacity=".35"/>' +
      '</g>' +
      '<path d="' + GLASS + '" fill="url(#' + id + 'v)"/>' +
      '<path d="' + GLASS + '" fill="none" stroke="' + m + '" stroke-width="1.8"' +
        ' stroke-linejoin="round" opacity=".8"/>' +
      /* the posts, then the collars over them */
      '<rect x="5.4" y="14" width="2.4" height="76" rx="1" fill="' + m + '" opacity=".62"/>' +
      '<rect x="36.2" y="14" width="2.4" height="76" rx="1" fill="' + m + '" opacity=".62"/>' +
      '<rect x="3" y="9.5" width="38" height="6.5" rx="2" fill="url(#' + id + 'm)"/>' +
      '<rect x="3" y="88" width="38" height="6.5" rx="2" fill="url(#' + id + 'm)"/>' +
      /* knop above, plinth below */
      '<path d="M18 9.5c0-3 1.8-5 4-5s4 2 4 5z" fill="' + m + '"/>' +
      '<rect x="20.6" y="1.5" width="2.8" height="4" rx="1.4" fill="' + m + '"/>' +
      '<rect x="1" y="94.5" width="42" height="5" rx="2" fill="' + m + '" opacity=".9"/>' +
      '<rect x="6" y="99.5" width="32" height="3" rx="1.5" fill="' + m + '" opacity=".6"/>' +
    '</svg>';
  };

  /* ---- THE CEILING -----------------------------------------------------
     The Great Hall's floating candles, drawn rather than photographed so they
     are sharp at any size. Returned as a data URI for a background layer. Each
     candle flickers and drifts on its own period (CSS inside the SVG runs even
     when it is used as an image), and positions come off a seeded sequence so
     the ceiling is the same on every load. Farther candles are smaller, higher
     and dimmer, which is all the depth the eye needs. */
  function seeded(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }
  H.candleSky = function (o) {
    o = o || {};
    var W = 1600, Hh = o.h || 360, n = o.n || 34, rnd = seeded(o.seed || 7), out = '';
    var wax = o.wax || '#F1E4C2', waxLo = o.waxLo || '#BFA877', flame = o.flame || '#FFD58A';
    for (var i = 0; i < n; i++) {
      var depth = rnd();                       /* 0 far .. 1 near */
      var x = (i + .15 + rnd() * .7) / n * W;
      var y = 26 + (1 - depth) * (Hh * .12) + rnd() * Hh * .42;
      var s = .45 + depth * .75, h = (20 + rnd() * 18) * s, w = 6.2 * s;
      var op = (.35 + depth * .65).toFixed(2);
      var dur = (4.5 + rnd() * 4).toFixed(2), del = (-rnd() * 8).toFixed(2);
      var fd = (.9 + rnd() * .9).toFixed(2), fdel = (-rnd() * 2).toFixed(2);
      out += '<g opacity="' + op + '"><g class="b" style="animation-duration:' + dur + 's;animation-delay:' + del + 's">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + (y - 3 * s).toFixed(1) + '" r="' + (26 * s).toFixed(1) + '" fill="url(#halo)"/>' +
        '<rect x="' + (x - w / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) +
          '" rx="' + (w * .3).toFixed(1) + '" fill="url(#wax)"/>' +
        '<path class="f" style="animation-duration:' + fd + 's;animation-delay:' + fdel + 's" d="M' + x.toFixed(1) + ' ' + (y - 11 * s).toFixed(1) +
          ' c' + (3.2 * s).toFixed(1) + ' ' + (4 * s).toFixed(1) + ' ' + (3.6 * s).toFixed(1) + ' ' + (7.4 * s).toFixed(1) + ' 0 ' + (10 * s).toFixed(1) +
          ' c-' + (3.6 * s).toFixed(1) + '-' + (2.6 * s).toFixed(1) + '-' + (3.2 * s).toFixed(1) + '-' + (6 * s).toFixed(1) + ' 0-' + (10 * s).toFixed(1) + 'z" fill="url(#flame)"/>' +
        '</g></g>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '">' +
      '<style>.b{animation:b ease-in-out infinite alternate}.f{transform-box:fill-box;transform-origin:50% 100%;' +
      'animation:f ease-in-out infinite alternate}@keyframes b{to{transform:translateY(7px)}}' +
      '@keyframes f{0%{transform:scale(1,1);opacity:1}50%{transform:scale(.86,1.14);opacity:.85}100%{transform:scale(1.06,.92);opacity:1}}' +
      '@media(prefers-reduced-motion:reduce){.b,.f{animation:none}}</style>' +
      '<defs><radialGradient id="halo"><stop offset="0" stop-color="' + flame + '" stop-opacity=".42"/>' +
        '<stop offset=".35" stop-color="' + flame + '" stop-opacity=".12"/><stop offset="1" stop-color="' + flame + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="flame" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#FFFBEA"/>' +
        '<stop offset=".45" stop-color="' + flame + '"/><stop offset="1" stop-color="#E0701C"/></radialGradient>' +
      '<linearGradient id="wax" x1="0" x2="1"><stop offset="0" stop-color="' + waxLo + '"/>' +
        '<stop offset=".4" stop-color="' + wax + '"/><stop offset="1" stop-color="' + waxLo + '"/></linearGradient></defs>' +
      out + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };

  /* ---- UNDER THE LAKE --------------------------------------------------
     The light that comes down through the Black Lake and moves on the walls
     of the Slytherin common room. A caustic net: turbulence is near zero along
     its ridges, so inverting and thresholding it leaves a net of bright lines. Two of these drift against each other in the
     theme's CSS, which is what makes it read as water rather than a pattern. */
  H.causticSky = function (o) {
    o = o || {};
    var col = o.color || '0.42 0.9 0.62';
    var c = col.split(' ');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">' +
      '<filter id="c" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="turbulence" baseFrequency="' + (o.freq || '.006 .009') + '" numOctaves="2" seed="' + (o.seed || 3) + '" stitchTiles="stitch"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 ' + c[0] + '  0 0 0 0 ' + c[1] + '  0 0 0 0 ' + c[2] + '  -16 0 0 0 1.5"/>' +
        '<feGaussianBlur stdDeviation="1.2"/>' +
      '</filter><rect width="900" height="900" filter="url(#c)"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  };

  /* ---- THE PLACES -------------------------------------------------------
     A band at the top of each screen showing where in the castle you are.
     These were 880px film stills stretched across the page, which is why the
     page read as blurred. They are drawn now: silhouettes against a night
     sky, sharp at any width, coloured entirely from --sc-* custom properties
     so each house lights the same castle its own way.

       --sc-sky1 / --sc-sky2   the sky, top to horizon
       --sc-far                the castle on the skyline
       --sc-near               whatever you are standing in front of
       --sc-lit                a lit window
       --sc-moon               the moon, stars and snow
       --sc-a / --sc-b         the two houses' banner colours */
  var SW = 1200, SH = 124;
  function towers(rnd, x0, x1, base, hMin, hMax, fill) {
    var o = '', x = x0;
    while (x < x1) {
      var w = 14 + rnd() * 26, h = hMin + rnd() * (hMax - hMin), top = base - h;
      o += '<rect x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (h + 2).toFixed(1) + '"/>';
      if (rnd() < .7) {             /* a conical spire, the castle's signature */
        var sp = w * (1.1 + rnd() * 1.1);
        o += '<path d="M' + (x - 2).toFixed(1) + ' ' + top.toFixed(1) + 'L' + (x + w / 2).toFixed(1) + ' ' + (top - sp).toFixed(1) +
             'L' + (x + w + 2).toFixed(1) + ' ' + top.toFixed(1) + 'Z"/>';
      } else {                      /* or battlements */
        for (var c = 0; c < w - 4; c += 6) o += '<rect x="' + (x + c).toFixed(1) + '" y="' + (top - 4).toFixed(1) + '" width="3.4" height="4"/>';
      }
      x += w + rnd() * 10 - 2;
      if (rnd() < .45) {            /* a long hall between towers */
        var hw = 30 + rnd() * 60, hh = hMin * (.45 + rnd() * .3);
        o += '<rect x="' + x.toFixed(1) + '" y="' + (base - hh).toFixed(1) + '" width="' + hw.toFixed(1) + '" height="' + (hh + 2).toFixed(1) + '"/>';
        o += '<path d="M' + x.toFixed(1) + ' ' + (base - hh).toFixed(1) + 'L' + (x + hw / 2).toFixed(1) + ' ' + (base - hh - 10).toFixed(1) +
             'L' + (x + hw).toFixed(1) + ' ' + (base - hh).toFixed(1) + 'Z"/>';
        x += hw;
      }
    }
    return '<g fill="' + fill + '">' + o + '</g>';
  }
  function windows(rnd, x0, x1, y0, y1, n) {
    var o = '';
    for (var i = 0; i < n; i++) {
      var x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
      o += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="2.2" height="3.4" rx=".8"/>';
    }
    return '<g fill="var(--sc-lit)" opacity=".85">' + o + '</g>';
  }
  function stars(rnd, n) {
    var o = '';
    for (var i = 0; i < n; i++) {
      o += '<circle cx="' + (rnd() * SW).toFixed(1) + '" cy="' + (rnd() * SH * .6).toFixed(1) + '" r="' + (.4 + rnd() * .8).toFixed(2) +
           '" opacity="' + (.3 + rnd() * .6).toFixed(2) + '"/>';
    }
    return '<g fill="var(--sc-moon)">' + o + '</g>';
  }
  var SCENES = {
    /* the greenhouses, glass lit from inside, the castle behind */
    foundry: function (rnd) {
      var o = stars(rnd, 50) + towers(rnd, -20, SW + 20, 96, 26, 54, 'var(--sc-far)') + windows(rnd, 0, SW, 60, 90, 40);
      var x = 40;
      while (x < SW) {
        var w = 150 + rnd() * 70, h = 34 + rnd() * 10, y = SH - h, g = '';
        g += '<path d="M' + x.toFixed(1) + ' ' + SH + 'V' + (y + 14).toFixed(1) + 'Q' + (x + w / 2).toFixed(1) + ' ' + (y - 16).toFixed(1) + ' ' +
             (x + w).toFixed(1) + ' ' + (y + 14).toFixed(1) + 'V' + SH + 'Z" fill="var(--sc-lit)" fill-opacity=".16" stroke="var(--sc-near)" stroke-width="3"/>';
        for (var p = x + 16; p < x + w - 4; p += 16) g += '<path d="M' + p.toFixed(1) + ' ' + SH + 'V' + (y + 4).toFixed(1) + '"/>';
        g += '<path d="M' + x.toFixed(1) + ' ' + (y + 26).toFixed(1) + 'H' + (x + w).toFixed(1) + '"/>';
        o += '<g stroke="var(--sc-near)" stroke-width="1.6" fill="none">' + g + '</g>';
        x += w + 30 + rnd() * 40;
      }
      return o;
    },
    /* the Astronomy Tower at night, under a full moon */
    focus: function (rnd) {
      var o = stars(rnd, 110) +
        '<circle cx="880" cy="34" r="17" fill="var(--sc-moon)" opacity=".9"/>' +
        '<circle cx="880" cy="34" r="40" fill="var(--sc-moon)" opacity=".08"/>' +
        towers(rnd, -20, SW + 20, 116, 22, 46, 'var(--sc-far)') + windows(rnd, 0, SW, 88, 112, 30);
      /* the tower itself: tall, a gallery near the top, a steep cone */
      o += '<g fill="var(--sc-near)"><rect x="700" y="50" width="36" height="76"/>' +
        '<rect x="694" y="62" width="48" height="5"/><rect x="696" y="67" width="44" height="2" opacity=".6"/>' +
        '<path d="M692 52L718 12L744 52Z"/><rect x="716.6" y="4" width="2.8" height="10"/>' +
        '<rect x="626" y="82" width="28" height="44"/><path d="M622 84L640 56L658 84Z"/>' +
        '<rect x="770" y="88" width="24" height="38"/><path d="M766 90L782 66L798 90Z"/></g>' +
        '<g fill="var(--sc-lit)"><rect x="713" y="78" width="3" height="6" rx="1"/><rect x="721" y="98" width="3" height="6" rx="1"/>' +
        '<rect x="638" y="100" width="3" height="5" rx="1"/></g>';
      return o;
    },
    /* Hogsmeade in snow: crooked roofs, chimneys, every window lit */
    market: function (rnd) {
      var o = stars(rnd, 40) + towers(rnd, 640, SW + 20, 74, 16, 34, 'var(--sc-far)');
      /* a far row of roofs up the hill, dimmer */
      var fx = -10, far = '';
      while (fx < SW) {
        var fw = 30 + rnd() * 40, fh = 44 + rnd() * 22, fy = SH - fh, fp = 10 + rnd() * 12;
        far += '<rect x="' + fx.toFixed(1) + '" y="' + fy.toFixed(1) + '" width="' + fw.toFixed(1) + '" height="' + fh.toFixed(1) + '"/>' +
          '<path d="M' + (fx - 3).toFixed(1) + ' ' + fy.toFixed(1) + 'L' + (fx + fw / 2).toFixed(1) + ' ' + (fy - fp).toFixed(1) + 'L' + (fx + fw + 3).toFixed(1) + ' ' + fy.toFixed(1) + 'Z"/>';
        fx += fw + rnd() * 14;
      }
      o += '<g fill="var(--sc-far)">' + far + '</g>' + windows(rnd, 0, SW, 64, 90, 26);
      var x = -10, roofs = '', lit = '', snow = '';
      while (x < SW) {
        var w = 34 + rnd() * 70, h = 22 + rnd() * 40, y = SH - h, pk = 12 + rnd() * 26, lean = (rnd() - .5) * 12;
        roofs += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (h + 2).toFixed(1) + '"/>' +
          '<path d="M' + (x - 4).toFixed(1) + ' ' + (y + 1).toFixed(1) + 'L' + (x + w / 2 + lean).toFixed(1) + ' ' + (y - pk).toFixed(1) + 'L' + (x + w + 4).toFixed(1) + ' ' + (y + 1).toFixed(1) + 'Z"/>';
        if (rnd() < .7) roofs += '<rect x="' + (x + w * .7).toFixed(1) + '" y="' + (y - pk * .8).toFixed(1) + '" width="7" height="' + (pk * .7).toFixed(1) + '"/>';
        snow += '<path d="M' + (x - 5).toFixed(1) + ' ' + (y + 1).toFixed(1) + 'L' + (x + w / 2 + lean).toFixed(1) + ' ' + (y - pk - 1.5).toFixed(1) +
          'L' + (x + w + 5).toFixed(1) + ' ' + (y + 1).toFixed(1) + 'L' + (x + w + 1).toFixed(1) + ' ' + (y + 4).toFixed(1) +
          'L' + (x + w / 2 + lean).toFixed(1) + ' ' + (y - pk + 4).toFixed(1) + 'L' + (x - 1).toFixed(1) + ' ' + (y + 4).toFixed(1) + 'Z"/>';
        for (var k = 0; k < 3; k++) {
          if (rnd() < .75) lit += '<rect x="' + (x + 8 + k * (w - 22) / 2).toFixed(1) + '" y="' + (y + 8 + rnd() * 10).toFixed(1) +
            '" width="6" height="8" rx="1"/>';
        }
        x += w + (rnd() < .3 ? 14 + rnd() * 20 : rnd() * 5);
      }
      o += '<g fill="var(--sc-near)">' + roofs + '</g><g fill="var(--sc-moon)" opacity=".8">' + snow + '</g>' +
        '<g fill="var(--sc-lit)">' + lit + '</g>';
      /* falling snow, drifting on two periods */
      var flakes = '';
      for (var f = 0; f < 90; f++) {
        flakes += '<circle cx="' + (rnd() * SW).toFixed(1) + '" cy="' + (rnd() * SH).toFixed(1) + '" r="' + (.6 + rnd() * 1.1).toFixed(2) + '"/>';
      }
      o += '<g class="hr-snow" fill="var(--sc-moon)" opacity=".7">' + flakes + '</g>' +
           '<g class="hr-snow b" fill="var(--sc-moon)" opacity=".7">' + flakes + '</g>';
      return o;
    },
    /* the pitch: the house stands with their banners, the hoops on their poles */
    conclave: function (rnd) {
      var o = stars(rnd, 50) + towers(rnd, -20, SW + 20, 84, 14, 34, 'var(--sc-far)') +
        '<rect x="0" y="112" width="' + SW + '" height="12" fill="var(--sc-near)" opacity=".7"/>';
      var cols = ['var(--sc-a)', 'var(--sc-b)'], st = '', ban = '';
      /* the stands: a long low tier of seating ... */
      st += '<rect x="130" y="' + (SH - 30) + '" width="' + (SW - 260) + '" height="30"/>';
      /* ... broken by tall towers, each draped in one house's colours */
      for (var i = 0, x = 150; x < SW - 170; i++, x += 92) {
        var h = 70 + (i % 3) * 8, y = SH - h, tw = 30;
        st += '<rect x="' + x + '" y="' + y + '" width="' + tw + '" height="' + h + '"/>' +
              '<path d="M' + (x - 4) + ' ' + y + 'L' + (x + tw / 2) + ' ' + (y - 30) + 'L' + (x + tw + 4) + ' ' + y + 'Z"/>' +
              '<rect x="' + (x + tw / 2 - .8) + '" y="' + (y - 40) + '" width="1.6" height="11"/>';
        ban += '<path d="M' + (x + 4) + ' ' + (y + 3) + 'h22v34l-11 -6l-11 6Z" fill="' + cols[i % 2] + '"/>' +
               '<path d="M' + (x + tw / 2 + .8) + ' ' + (y - 38) + 'l12 3l-12 3Z" fill="' + cols[i % 2] + '"/>';
      }
      o += '<g fill="var(--sc-near)">' + st + '</g>' + ban;
      /* three hoops a side, on poles of three heights */
      function hoops(cx, dir) {
        var g = '', hs = [80, 104, 90];
        for (var k = 0; k < 3; k++) {
          var x = cx + dir * k * 26, top = SH - hs[k];
          g += '<path d="M' + x + ' ' + SH + 'V' + (top + 10) + '"/><circle cx="' + x + '" cy="' + top + '" r="10"/>';
        }
        return '<g fill="none" stroke="var(--sc-near)" stroke-width="3">' + g + '</g>';
      }
      return o + hoops(46, 1) + hoops(SW - 46, -1);
    }
  };
  H.scene = function (view) {
    var f = SCENES[view];
    if (!f) return '';
    var rnd = seeded(view.length * 131 + view.charCodeAt(0));
    return '<svg class="hr-scene" viewBox="0 0 ' + SW + ' ' + SH + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs><linearGradient id="hrSky' + view + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="var(--sc-sky1)"/><stop offset="1" stop-color="var(--sc-sky2)"/></linearGradient></defs>' +
      '<rect width="' + SW + '" height="' + SH + '" fill="url(#hrSky' + view + ')"/>' + f(rnd) + '</svg>';
  };

  /* ---- THE STANDARD ----------------------------------------------------
     What an operator is. A pennant in their own house's arms, hung beside a
     framed plate carrying the count. Replaces a gradient slab the size of a
     cereal box: same information, a quarter of the ink. */
  H.standard = function (ctx) {
    return ctx.parties.map(function (p) {
      var o = ctx.of(p), a = H.armsOf(ctx, p);
      var pct = (o.rank.progress * 100).toFixed(1);
      return '<div class="hr-frame hr-std' + (o.lead ? ' lead' : '') + '"' +
        ' style="--metal:' + a.metal + ';--field:' + a.fieldHi + '">' +
        '<span class="hr-c tl"></span><span class="hr-c tr"></span>' +
        '<span class="hr-c bl"></span><span class="hr-c br"></span>' +
        '<span class="hr-notch"></span>' +
        '<div class="hr-std-arms">' +
          H.crest(assign({}, a, { label: o.name, w: 54 })) +
        '</div>' +
        '<div class="hr-std-body">' +
          '<div class="hr-std-top">' +
            '<button class="hr-std-who" data-act="rename" data-p="' + p + '" title="Rename">' +
              (o.lead ? ctx.ICON('lead', 14) : '') + esc(o.name) + '</button>' +
            '<span class="hr-std-rank">' + esc(o.rank.name) +
              '<i>' + esc(ctx.C('rank')) + ' ' + o.rank.level + '</i></span>' +
          '</div>' +
          '<div class="hr-std-val">' + ctx.num(o.points) + '</div>' +
          '<div class="hr-std-sub">' +
            '<span>' + ctx.fmt(o.today) + ' today</span>' +
            (o.streak > 1 ? '<span>' + o.streak + '-day streak</span>' : '') +
            '<span>' + ctx.num(o.rank.toNext) + ' to ' +
              esc(ctx.C('rank').toLowerCase()) + ' ' + (o.rank.level + 1) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="hr-std-glass" title="' + esc(o.rank.name) + ' &middot; ' + pct + '%">' +
          H.hourglass({ p: o.rank.progress, metal: a.metal, gem: a.gem || a.metal,
                        label: pct + ' per cent of the way to ' +
                               ctx.C('rank').toLowerCase() + ' ' + (o.rank.level + 1),
                        w: 44 }) +
        '</div>' +
      '</div>';
    }).join('');
  };

  /* ---- THE ROOM ---------------------------------------------------------
     A seat of the house, then everything owed in it.

     The old room screen buried the deeds behind a slide-out panel: to award
     something you opened the room, found a pin, opened the board, scrolled,
     and clicked. Here the seat is one compact rail across the top - arms, the
     name of the place, and every other place as a plate you can walk to - and
     the rest of the screen is the board itself, every deed claimable in one
     click without opening anything. */
  H.roomStandard = function (ctx, cfg) {
    var pl = ctx.active, a = cfg.arms;

    var doors = ctx.places.filter(function (q) { return q.id !== pl.id; })
      .map(function (q) {
        return '<button class="hr-door" data-act="planet" data-p="' + esc(q.id) + '"' +
          ' title="Go to ' + esc(ctx.name(q)) + '">' +
          '<span class="hr-cart">' + esc(ctx.name(q)) +
            '<em>' + ctx.count(q.id) + '</em></span></button>';
      }).join('');

    var tools = ['all'].concat(ctx.parties).map(function (w) {
      return '<button class="hr-tool' + (ctx.who === w ? ' on' : '') + '" data-act="who" data-w="' + w + '">' +
        (w === 'all' ? 'Everyone' : esc(ctx.nameOf(w))) + '</button>';
    }).join('') +
      '<button class="hr-tool" data-act="node-new">+ ' + esc(ctx.C('item')) + '</button>' +
      '<button class="hr-tool" data-act="planet-edit">Edit room</button>';

    return '<div class="hr-room" style="--metal:' + a.metal + ';">' +
      '<div class="hr-frame hr-seat">' +
        '<span class="hr-c tl"></span><span class="hr-c tr"></span>' +
        '<span class="hr-c bl"></span><span class="hr-c br"></span>' +
        '<span class="hr-notch"></span>' +
        H.candles() +
        '<div class="hr-seat-arms">' +
          H.crest(assign({}, a, { label: ctx.name(pl), w: 58 })) +
        '</div>' +
        '<div class="hr-seat-id">' +
          '<span class="hr-cart">' + esc(cfg.board.title) + '</span>' +
          '<h2 class="hr-seat-name">' + esc(ctx.name(pl)) + '</h2>' +
          '<div class="hr-seat-tally">' + ctx.nodes.length + ' ' +
            esc((ctx.nodes.length === 1 ? ctx.C('item') : ctx.C('items')).toLowerCase()) +
            ' &middot; ' + ctx.fmt(ctx.earned(pl.id)) + ' today</div>' +
        '</div>' +
        '<div class="hr-doors">' + doors + '</div>' +
      '</div>' +
      '<div class="hr-tools">' + tools + '</div>' +
      '<div class="hr-board">' + H.deeds(ctx) + '</div>' +
    '</div>';
  };

  /* ---- CANDLES ---------------------------------------------------------
     The Great Hall is lit by candles that hang in the air with nothing holding
     them up. A row of them drifts above the seat of the house, each on its own
     rhythm so they never bob in unison, which is the thing that would give the
     game away. Positions and timings come off an index rather than a random,
     so a re-render does not make the whole row jump. */
  H.candles = function () {
    return '<span class="hr-candles" aria-hidden="true"></span>';
  };

  /* ---- THE DEEDS -------------------------------------------------------
     One plate each. The claim buttons are the point of the screen, so they
     are the biggest thing on the plate and they are never more than one click
     from wherever you are. */
  H.deeds = function (ctx) {
    if (!ctx.nodes.length) {
      return '<div class="hr-empty">' + esc(ctx.C('emptyGroup')) + '</div>';
    }
    return ctx.nodes.map(function (d) {
      var locked = d.claims.every(function (c) { return c.locked; });
      var acts = d.claims.map(function (c) {
        var lbl = d.owner === 'both' ? c.name
                : (c.n ? ctx.C('scoreVerbPast') : ctx.C('scoreVerb'));
        return '<button class="hr-claim" style="--oc:' + c.color + '" data-act="claim"' +
          ' data-id="' + esc(d.id) + '" data-p="' + c.party + '"' +
          (c.locked ? ' disabled title="' + esc(ctx.C('toastLocked', { item: d.req.name })) + '"' : '') + '>' +
          esc(lbl) + (c.n ? '<em>&times;' + c.n + '</em>' : '') + '</button>' +
          (c.n ? '<button class="hr-mini" data-act="undo" data-id="' + esc(d.id) +
                 '" data-p="' + c.party + '" title="Take it back">' + ctx.ICON('undo', 12) + '</button>' : '');
      }).join('');

      return '<div class="hr-deed' + (d.isPen ? ' pen' : '') +
        (d.kind === 'milestone' ? ' big' : '') + (locked ? ' locked' : '') + '">' +
        '<div class="hr-deed-h">' +
          '<span class="hr-deed-n">' + esc(d.name) + '</span>' +
          '<span class="hr-deed-p">' + ctx.fmt(d.pts) + '</span>' +
        '</div>' +
        '<div class="hr-deed-m">' + esc(d.typeName) + ' &middot; ' + esc(d.cad) +
          (d.ownerName ? ' &middot; ' + esc(d.ownerName) : '') + '</div>' +
        (d.req ? '<div class="hr-deed-req">' +
                   esc(ctx.C('toastLocked', { item: d.req.name })) + '</div>' : '') +
        '<div class="hr-deed-a">' + acts +
          '<button class="hr-mini more" data-act="node-edit" data-id="' + esc(d.id) +
          '" title="Edit">' + ctx.ICON('more', 12) + '</button></div>' +
      '</div>';
    }).join('');
  };

  /* ---- the CSS every house shares -------------------------------------
     Shape and structure only. Not one colour that is not a token. */
  H.css = [
    /* ---------- FRAME: the panel, as a plate with bracketed corners ------ */
    '.hr-frame{position:relative;background:var(--surface);',
    '  border:1px solid var(--line);padding:15px 17px 16px;}',
    /* the inner hairline - the double rule that makes it read as engraved */
    '.hr-frame::before{content:"";position:absolute;inset:4px;pointer-events:none;',
    '  border:1px solid var(--line-soft);}',
    /* corner brackets, drawn once as a background and pinned to all four */
    '.hr-frame > .hr-c{position:absolute;width:13px;height:13px;pointer-events:none;',
    '  border:1px solid var(--metal,var(--gold));opacity:.85;}',
    '.hr-frame > .hr-c.tl{top:-1px;left:-1px;border-width:1px 0 0 1px;}',
    '.hr-frame > .hr-c.tr{top:-1px;right:-1px;border-width:1px 1px 0 0;}',
    '.hr-frame > .hr-c.bl{bottom:-1px;left:-1px;border-width:0 0 1px 1px;}',
    '.hr-frame > .hr-c.br{bottom:-1px;right:-1px;border-width:0 1px 1px 0;}',
    /* the chevron notched into the top rail */
    '.hr-frame > .hr-notch{position:absolute;top:-5px;left:50%;width:14px;height:9px;',
    '  margin-left:-7px;pointer-events:none;background:var(--deep);',
    '  clip-path:polygon(0 0,100% 0,50% 100%);}',
    '.hr-frame > .hr-notch::after{content:"";position:absolute;inset:0;',
    '  border-bottom:1px solid var(--metal,var(--gold));',
    '  clip-path:polygon(0 0,100% 0,50% 100%);opacity:.85;}',

    /* ---------- RULE: a hairline with a lozenge at its middle ------------ */
    '.hr-rule{position:relative;height:1px;background:linear-gradient(90deg,',
    '  transparent,var(--line) 12%,var(--line) 88%,transparent);margin:16px 0;}',
    '.hr-rule::after{content:"";position:absolute;top:-3px;left:50%;width:7px;height:7px;',
    '  margin-left:-3.5px;transform:rotate(45deg);',
    '  background:var(--deep);border:1px solid var(--metal,var(--gold));opacity:.9;}',

    /* ---------- CARTOUCHE: a label cut into a plate ---------------------- */
    '.hr-cart{display:inline-flex;align-items:center;gap:7px;',
    '  padding:4px 14px;background:var(--raised);',
    '  border:1px solid var(--metal,var(--gold));',
    '  clip-path:polygon(9px 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,9px 100%,0 50%);',
    '  font-family:var(--f-label);font-size:10.5px;letter-spacing:var(--ls-label);',
    '  text-transform:var(--tt-label);color:var(--txt-2);white-space:nowrap;}',
    /* a cartouche sitting ON a rule, the way the source material does it */
    '.hr-banded{position:relative;display:flex;align-items:center;justify-content:center;}',
    '.hr-banded::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;',
    '  background:linear-gradient(90deg,transparent,var(--line) 10%,var(--line) 90%,transparent);}',
    '.hr-banded .hr-cart{position:relative;}',

    /* ---------- THE ARMS ------------------------------------------------ */
    '.hr-crest{display:block;filter:drop-shadow(0 5px 12px var(--shadow));}',

    /* ---------- THE STANDARD: an operator ------------------------------- */
    '.hr-std{display:flex;gap:15px;align-items:flex-start;padding:14px 17px 15px;}',
    '.hr-std.lead{border-color:var(--metal,var(--gold));}',
    '.hr-std-arms{flex:none;margin-top:-22px;}',
    '.hr-std-body{flex:1;min-width:0;}',
    '.hr-std-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}',
    '.hr-std-who{display:flex;align-items:center;gap:6px;background:none;border:0;padding:0;',
    '  font-family:var(--f-display);font-size:1.5em;line-height:1;color:var(--txt);',
    '  letter-spacing:var(--ls-display);text-transform:var(--tt-display);cursor:pointer;}',
    '.hr-std-who:hover{color:var(--metal,var(--gold));}',
    '.hr-std-rank{font-family:var(--f-label);font-size:10.5px;letter-spacing:var(--ls-label);',
    '  text-transform:var(--tt-label);color:var(--txt-2);text-align:right;line-height:1.25;flex:none;}',
    '.hr-std-rank i{display:block;font-style:normal;color:var(--txt-3);font-size:.86em;}',
    /* the count. Tabular figures so a rising score does not jitter. */
    '.hr-std-val{font-family:var(--f-display);font-size:2.6em;line-height:1;margin:4px 0 2px;',
    '  color:var(--txt);font-variant-numeric:tabular-nums;letter-spacing:-.01em;}',
    '.hr-std-sub{display:flex;gap:13px;flex-wrap:wrap;font-family:var(--f-body);',
    '  font-size:11.5px;color:var(--txt-3);}',
    '.hr-std-glass{flex:none;align-self:center;line-height:0;}',
    '.hr-glass{display:block;filter:drop-shadow(0 3px 8px var(--shadow));}',

    /* ---------- THE ROOM ------------------------------------------------ */
    '.hr-room{display:block;}',
    /* the seat: arms, where you are, and everywhere else - one rail */
    '.hr-seat{display:flex;align-items:center;gap:16px;padding:12px 18px 13px;}',
    '.hr-seat-arms{flex:none;margin-top:-26px;margin-bottom:-6px;}',
    '.hr-seat-id{flex:none;}',
    '.hr-seat-name{font-family:var(--f-display);font-size:1.9em;line-height:1.05;margin:5px 0 2px;',
    '  color:var(--txt);letter-spacing:var(--ls-display);text-transform:var(--tt-display);}',
    '.hr-seat-tally{font-family:var(--f-body);font-size:11.5px;color:var(--txt-3);}',
    '.hr-doors{display:flex;flex-wrap:wrap;gap:7px;justify-content:flex-end;flex:1;}',
    '.hr-door{background:none;border:0;padding:0;cursor:pointer;',
    '  transition:transform var(--dur) var(--ease);}',
    '.hr-door .hr-cart{color:var(--txt-2);',
    '  transition:color var(--dur) var(--ease),background var(--dur) var(--ease);}',
    '.hr-door em{font-style:normal;color:var(--metal,var(--gold));font-size:.92em;}',
    '.hr-door:hover{transform:translateY(-1px);}',
    '.hr-door:hover .hr-cart,.hr-door:focus-visible .hr-cart{color:var(--txt);background:var(--surface-hover);}',
    '.hr-door:focus-visible{outline:none;}',

    /* ---------- CANDLES -------------------------------------------------- */
    /* The Great Hall's own candles, hanging over the seat of the house. This
       was eleven drawn tapers, which was a decent stand-in for a photograph
       until there was a photograph. It keeps a slow brightness pulse so the
       hall is not a still. */
    '.hr-candles{position:absolute;left:0;right:0;top:0;height:66px;pointer-events:none;',
    '  z-index:0;background:url(art/great-hall-candles.webp) center top/cover no-repeat;',
    '  opacity:.5;mix-blend-mode:screen;',
    '  -webkit-mask-image:linear-gradient(#000 52%,transparent 100%);',
    '          mask-image:linear-gradient(#000 52%,transparent 100%);',
    '  animation:hr-hall 7s ease-in-out infinite alternate;}',
    '@keyframes hr-hall{from{opacity:.42;}to{opacity:.58;}}',
    '.hr-seat{padding-top:40px;}',
    /* only the CONTENT is lifted over the candles. The corner brackets and the
       notch are already absolute and positioned against the frame, so a blanket
       `position:relative` on every child tears them off it. */
    '.hr-seat-arms,.hr-seat-id,.hr-doors{position:relative;z-index:1;}',
    '@media(prefers-reduced-motion:reduce){.hr-candles{animation:none;}}',

    /* ---------- the tools rail ------------------------------------------ */
    '.hr-tools{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0 12px;}',
    '.hr-tool{font-family:var(--f-label);font-size:10.5px;letter-spacing:var(--ls-label);',
    '  text-transform:var(--tt-label);color:var(--txt-2);background:var(--surface-2);',
    '  border:1px solid var(--line-soft);padding:5px 12px;cursor:pointer;',
    '  transition:color var(--dur) var(--ease),background var(--dur) var(--ease),',
    '   border-color var(--dur) var(--ease);}',
    '.hr-tool:hover{color:var(--txt);background:var(--surface-hover);}',
    '.hr-tool.on{color:var(--on-accent);background:var(--accent);border-color:var(--accent);}',

    /* ---------- THE BOARD ----------------------------------------------- */
    '.hr-board{display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:10px;}',
    '.hr-deed{position:relative;background:var(--surface);border:1px solid var(--line-soft);',
    '  padding:11px 13px 10px;display:flex;flex-direction:column;gap:5px;',
    '  transition:border-color var(--dur) var(--ease),background var(--dur) var(--ease);}',
    '.hr-deed:hover{border-color:var(--line);background:var(--surface-hover);}',
    '.hr-deed.big{border-color:var(--milestone);}',
    '.hr-deed.pen{border-color:var(--penalty);}',
    '.hr-deed.locked{opacity:.55;}',
    '.hr-deed-h{display:flex;align-items:baseline;justify-content:space-between;gap:9px;}',
    '.hr-deed-n{font-family:var(--f-display);font-size:1.16em;line-height:1.15;color:var(--txt);',
    '  letter-spacing:var(--ls-display);text-transform:var(--tt-display);}',
    '.hr-deed-p{font-family:var(--f-body);font-size:12px;font-weight:600;flex:none;',
    '  color:var(--metal,var(--gold));font-variant-numeric:tabular-nums;}',
    '.hr-deed.pen .hr-deed-p{color:var(--penalty);}',
    '.hr-deed-m{font-family:var(--f-label);font-size:9.5px;letter-spacing:var(--ls-label);',
    '  text-transform:var(--tt-label);color:var(--txt-3);}',
    '.hr-deed-req{font-family:var(--f-body);font-size:10.5px;color:var(--warn);opacity:.9;}',
    /* the claim buttons - the reason the screen exists */
    '.hr-deed-a{display:flex;align-items:center;gap:5px;margin-top:auto;padding-top:4px;}',
    '.hr-claim{flex:1;min-width:0;font-family:var(--f-body);font-size:12px;font-weight:600;',
    '  color:var(--txt);background:var(--surface-2);border:1px solid var(--oc,var(--line));',
    '  border-left-width:2px;padding:6px 9px;cursor:pointer;white-space:nowrap;',
    '  overflow:hidden;text-overflow:ellipsis;',
    '  transition:background var(--dur) var(--ease),color var(--dur) var(--ease);}',
    '.hr-claim:hover:not(:disabled){background:var(--oc,var(--accent));color:var(--on-accent);}',
    '.hr-claim:disabled{cursor:not-allowed;opacity:.5;}',
    '.hr-claim em{font-style:normal;opacity:.75;font-size:.9em;margin-left:3px;}',
    '.hr-mini{flex:none;background:none;border:0;padding:3px 4px;color:var(--txt-3);cursor:pointer;',
    '  display:flex;transition:color var(--dur) var(--ease);}',
    '.hr-mini:hover{color:var(--txt);}',
    '.hr-mini.more{margin-left:auto;}',
    '.hr-empty{grid-column:1/-1;font-family:var(--f-body);font-size:12.5px;',
    '  color:var(--txt-3);padding:18px 2px;}',

    /* ---------- THE STANDARD, in its bearer's own cloth ---------------
       --field and --metal are set inline from the student's house, so on
       either house's screen Abir's standard is scarlet and gold and Jade's is
       green and silver. That is what makes it a contest between two houses
       rather than two rows in one house's colours. */
    '.hr-std{background:',
    '  radial-gradient(ellipse 60% 120% at 0% 0%,color-mix(in srgb,var(--field) 34%,transparent),transparent 70%),',
    '  linear-gradient(165deg,color-mix(in srgb,var(--field) 30%,var(--deep)),color-mix(in srgb,var(--field) 10%,var(--deep)));',
    '  border-color:color-mix(in srgb,var(--metal) 42%,transparent);',
    '  box-shadow:0 18px 40px -18px var(--shadow),inset 0 1px 0 color-mix(in srgb,var(--metal) 22%,transparent);}',
    '.hr-std::before{border-color:color-mix(in srgb,var(--metal) 20%,transparent);}',
    '.hr-std.lead{box-shadow:0 18px 40px -18px var(--shadow),0 0 0 1px var(--metal),',
    '  0 0 34px -10px color-mix(in srgb,var(--metal) 55%,transparent);}',
    '.hr-std-arms .hr-crest{width:62px;height:auto;}',
    '.hr-std-who{color:var(--metal);}',
    '.hr-std-val{font-size:2.9em;font-weight:700;}',
    '@supports ((-webkit-background-clip:text) or (background-clip:text)){',
    '  .hr-std-val{background:linear-gradient(180deg,color-mix(in srgb,var(--metal) 45%,#fff) 8%,',
    '    var(--metal) 52%,color-mix(in srgb,var(--metal) 62%,#000) 96%);',
    '    -webkit-background-clip:text;background-clip:text;color:transparent;',
    '    filter:drop-shadow(0 2px 3px rgba(0,0,0,.55));}}',
    '.hr-std-glass .hr-glass{filter:drop-shadow(0 0 12px color-mix(in srgb,var(--metal) 26%,transparent))',
    '  drop-shadow(0 4px 8px var(--shadow));}',

    /* ---------- THE PLACES: drawn scenes over each screen ---------------- */
    '.place.drawn{height:124px;border-bottom:1px solid var(--line);',
    '  box-shadow:inset 0 -1px 0 var(--line-soft);}',
    '.place.drawn::before{display:none;}',
    '.place.drawn::after{background:linear-gradient(180deg,rgba(0,0,0,.2),transparent 30%,',
    '  transparent 62%,color-mix(in srgb,var(--void) 80%,transparent) 100%);}',
    '.hr-scene{position:absolute;inset:0;width:100%;height:100%;display:block;}',
    '.hr-snow{animation:hr-snow 14s linear infinite;}',
    '.hr-snow.b{animation-delay:-7s;}',
    '@keyframes hr-snow{from{transform:translate(0,-124px);}to{transform:translate(-30px,124px);}}',
    '.place.drawn .place-name{bottom:10px;}',
    '@media(max-width:620px){.place.drawn{height:92px;}}',
    '@media(prefers-reduced-motion:reduce){.hr-snow{animation:none;}}',

    /* Roman capitals are wide: on the phone's bottom bar a label drops to
       Cinzel's narrower small capitals and wraps at its spaces, rather than
       being cut to 'COMMO...' */
    '@media(max-width:760px){',
    '  :root[data-theme] .nav-btn{font-size:7.9px;letter-spacing:-.01em;line-height:1.1;text-transform:none;padding:6px 0;}',
    '  :root[data-theme] .nav-btn .lbl{white-space:normal;text-overflow:clip;text-align:center;',
    '    min-height:2.2em;display:flex;align-items:center;justify-content:center;}',
    '}',

    /* the photographed candle band is retired: the ceiling is drawn now */
    '.hr-candles{display:none;}',
    '.hr-seat{padding-top:16px;}',
    '.hr-seat-arms{margin-top:-8px;}',

    '@media(max-width:760px){',
    '  .hr-std{gap:11px;padding:12px 13px 13px;}',
    '  .hr-std-arms{margin-top:-16px;transform:scale(.84);transform-origin:top left;}',
    '  .hr-std-val{font-size:2.1em;}',
    '  .hr-seat{flex-wrap:wrap;gap:11px;padding:11px 13px 12px;}',
    '  .hr-seat-name{font-size:1.6em;}',
    '  .hr-doors{justify-content:flex-start;flex-basis:100%;}',
    '  .hr-board{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));}',
    '}',

    /* ---------- the gilt sweep ------------------------------------------
       One animation, shared. A slow band of the house metal travelling across
       a surface - the header wordmark wears it, and so does a rank meter as it
       fills. It is the only ambient motion in the app. */
    '@property --hr-sweep{syntax:"<percentage>";inherits:false;initial-value:-40%;}',
    '.hr-gilt{background-image:linear-gradient(100deg,',
    '  transparent calc(var(--hr-sweep) - 14%),',
    '  var(--metal,var(--gold)) var(--hr-sweep),',
    '  transparent calc(var(--hr-sweep) + 14%));',
    '  background-repeat:no-repeat;-webkit-background-clip:text;background-clip:text;',
    '  animation:hr-sweep 7s var(--ease) infinite;}',
    '@keyframes hr-sweep{0%,64%{--hr-sweep:-40%;}100%{--hr-sweep:140%;}}',

    '@media(prefers-reduced-motion:reduce){',
    '  .hr-gilt{animation:none;}',
    '}'
  ].join('\n');
})();
