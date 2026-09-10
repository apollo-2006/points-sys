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
    gryffindor: { charge: 'lion',    field: '#8E1F1B', fieldHi: '#C4423A', metal: '#E9B44C', gem: '#C7343B',
                  crest: 'art/gryffindor-crest.svg' },
    slytherin:  { charge: 'serpent', field: '#09503C', fieldHi: '#12805F', metal: '#DCE7E0', gem: '#2E9E6B',
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
          (52 - upTop).toFixed(1) + '" fill="' + g + '" opacity=".4"/>' +
        '<rect x="2" y="' + loTop.toFixed(1) + '" width="40" height="' +
          (89 - loTop).toFixed(1) + '" fill="' + g + '"/>' +
        (p > 0.015 && p < 0.985
          ? '<rect x="21.1" y="46" width="1.8" height="14" fill="' + g + '" opacity=".9"/>' : '') +
        /* the light the gems throw inside the glass */
        '<ellipse cx="22" cy="' + (89 - (89 - loTop) / 2).toFixed(1) + '" rx="17" ry="9" fill="' + g +
          '" opacity=".35"/>' +
      '</g>' +
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
                        w: 33 }) +
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
        H.candles(11) +
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
  H.candles = function (n) {
    var out = '', i, left, h, dur, delay, scale;
    for (i = 0; i < n; i++) {
      left  = (100 / (n + 1)) * (i + 1);
      h     = 12 + ((i * 37) % 26);          /* how far it hangs down */
      scale = 0.78 + ((i * 53) % 45) / 100;
      dur   = 4.2 + ((i * 29) % 34) / 10;
      delay = -((i * 71) % 40) / 10;
      out += '<span class="hr-candle" style="left:' + left.toFixed(2) + '%;' +
        'top:' + h + 'px;transform:scale(' + scale.toFixed(2) + ');' +
        'animation-duration:' + dur.toFixed(1) + 's;animation-delay:' + delay.toFixed(1) + 's">' +
        '<i class="fl"></i><i class="wx"></i></span>';
    }
    return '<span class="hr-candles" aria-hidden="true">' + out + '</span>';
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
    '.hr-candles{position:absolute;left:0;right:0;top:0;height:74px;overflow:hidden;',
    '  pointer-events:none;z-index:0;}',
    '.hr-candle{position:absolute;width:5px;transform-origin:50% 100%;',
    '  animation-name:hr-float;animation-timing-function:ease-in-out;',
    '  animation-iteration-count:infinite;animation-direction:alternate;}',
    /* the taper */
    '.hr-candle .wx{position:absolute;top:6px;left:0;width:5px;height:26px;display:block;',
    '  background:linear-gradient(180deg,rgba(255,244,222,.5),rgba(255,244,222,.05));',
    '  border-radius:1px;}',
    /* and its flame, which does not sit still either */
    '.hr-candle .fl{position:absolute;top:0;left:1px;width:3px;height:7px;display:block;',
    /* a flame is warm in every house: Slytherin's metal is a cold near-white,
       and a silver flame reads as a spark rather than as a candle. Only the
       glow around it takes the house colour. */
    '  border-radius:60% 60% 42% 42%;background:#FFD98A;',
    '  box-shadow:0 0 7px 2px var(--accent-wash),0 0 16px 5px rgba(255,196,96,.20);',
    '  animation:hr-flicker 1.7s ease-in-out infinite alternate;}',
    '@keyframes hr-float{from{transform:translateY(0);}to{transform:translateY(9px);}}',
    '@keyframes hr-flicker{0%{opacity:.68;transform:scaleY(.9);}',
    '  55%{opacity:1;transform:scaleY(1.12);}100%{opacity:.82;transform:scaleY(.96);}}',
    /* the seat has to make room for them, and its own content sits in front */
    '.hr-seat{padding-top:44px;}',
    /* only the CONTENT is lifted over the candles. The corner brackets and the
       notch are already absolute and positioned against the frame, so a blanket
       `position:relative` on every child tears them off it. */
    '.hr-seat-arms,.hr-seat-id,.hr-doors{position:relative;z-index:1;}',
    '@media(prefers-reduced-motion:reduce){',
    '  .hr-candle,.hr-candle .fl{animation:none;}',
    '}',

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
