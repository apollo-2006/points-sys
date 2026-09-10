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

     PENNANT    a hanging banner — flat top, swallowtail cut — carrying a
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

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- the charges -----------------------------------------------------
     A beast per house, drawn as a single line on a 48-unit grid so it sits
     inside a pennant at any size. Line art, not silhouette: the pennant is
     already a solid field of colour and a solid beast on it goes to mud. */
  H.charges = {
    lion:
      '<path d="M24 9c-5.4 0-9.2 3.3-9.2 8 0 1.6.5 3 1.3 4.2-2.6 1.1-4.4 3.5-4.4 6.4 0 2.2 1 4.1 2.6 5.4' +
      '-.5 1-.8 2.1-.8 3.3 0 2.2 1.1 4 2.7 4.9M24 9c5.4 0 9.2 3.3 9.2 8 0 1.6-.5 3-1.3 4.2 2.6 1.1 4.4 3.5' +
      ' 4.4 6.4 0 2.2-1 4.1-2.6 5.4.5 1 .8 2.1.8 3.3 0 2.2-1.1 4-2.7 4.9" />' +
      '<path d="M18.6 21.6c1.6-1.2 3.4-1.9 5.4-1.9s3.8.7 5.4 1.9"/>' +
      '<path d="M20.4 26.2h.05M27.6 26.2h.05" stroke-linecap="round" stroke-width="2.6"/>' +
      '<path d="M24 28.4v2.6M20.8 33.2c1 1 2 1.5 3.2 1.5s2.2-.5 3.2-1.5"/>' +
      '<path d="M14.8 17c-2.2-.6-3.8-1.8-4.6-3.6M33.2 17c2.2-.6 3.8-1.8 4.6-3.6"/>',
    serpent:
      '<path d="M31.5 11.4c-3.6-1.9-7.6-1.4-9.9 1.2-2.5 2.8-1.9 6.7 1.2 8.6 3.4 2.1 4.1 5.2 2.2 7.6' +
      '-2.1 2.6-6.2 2.9-9.2 1M15.8 29.8c3.4 2.6 4.1 6.2 2 8.9"/>' +
      '<path d="M31.5 11.4c1.9 1 3.1 2.5 3.4 4.2.3 1.9-.7 3.6-2.4 4.2"/>' +
      '<path d="M34.4 13.1h.05" stroke-linecap="round" stroke-width="2.4"/>' +
      '<path d="M17.8 40.3c1.8.9 3.9.6 5.3-.8"/>',
    /* a fallback so a new house is never crestless */
    star:
      '<path d="M24 10.5 27.6 21h11l-8.9 6.5 3.4 10.6L24 31.6l-9.1 6.5 3.4-10.6L9.4 21h11z"/>'
  };

  /* ---- PENNANT ---------------------------------------------------------
     opts: { charge, field, fieldHi, ink, metal, legend, sub, w, h }
     `field` is the cloth, `metal` the house's gold or silver, `ink` the line
     the beast is drawn in. The swallowtail is cut, not drawn, so the banner
     reads as one piece of cloth rather than an outline with a notch in it. */
  H.pennant = function (o) {
    var w = o.w || 96, h = o.h || 128;
    var uid = 'pn' + Math.random().toString(36).slice(2, 8);
    var tail = h - w * 0.22;            /* where the V begins */
    var d = 'M0 0h' + w + 'v' + tail + 'l-' + (w / 2) + ' ' + (w * 0.22) +
            'L0 ' + tail + 'z';
    return '<svg class="hr-pennant" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '"' +
      ' role="img" aria-label="' + esc(o.legend || '') + '">' +
      '<defs>' +
        '<linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + esc(o.fieldHi || o.field) + '"/>' +
          '<stop offset="1" stop-color="' + esc(o.field) + '"/>' +
        '</linearGradient>' +
        '<clipPath id="' + uid + 'c"><path d="' + d + '"/></clipPath>' +
      '</defs>' +
      '<path d="' + d + '" fill="url(#' + uid + ')"/>' +
      /* a fold of light down the cloth */
      '<path d="' + d + '" fill="none" stroke="' + esc(o.metal) + '" stroke-width="1.6" opacity=".55"/>' +
      '<g clip-path="url(#' + uid + 'c)" opacity=".16">' +
        '<path d="M' + (w * 0.34) + ' 0v' + h + '" stroke="#fff" stroke-width="' + (w * 0.1) + '"/>' +
      '</g>' +
      '<g transform="translate(' + (w / 2) + ',' + (tail * 0.47) + ') scale(' + (w / 62) + ') translate(-24,-24)"' +
        ' fill="none" stroke="' + esc(o.ink) + '" stroke-width="1.7"' +
        ' stroke-linejoin="round" stroke-linecap="round" opacity=".92">' +
        (H.charges[o.charge] || H.charges.star) +
      '</g>' +
    '</svg>';
  };

  /* ---- the arms of each house ------------------------------------------
     Cross-house data, so an operator wearing another house's colours is drawn
     in THEIR arms on your screen — which is the whole point of a scoreboard
     between two houses. Field, the bright of the field, the metal, and the
     ink the beast is drawn in. */
  H.arms = {
    gryffindor: { charge: 'lion',    field: '#6E1019', fieldHi: '#B0202E', metal: '#E8C25A', ink: '#F8E7B0' },
    slytherin:  { charge: 'serpent', field: '#0E2C21', fieldHi: '#1E6A47', metal: '#C9D4CE', ink: '#E4EEE8' },
    origin:     { charge: 'star',    field: '#121726', fieldHi: '#2A3350', metal: '#8FA3C8', ink: '#DCE6F8' }
  };
  H.armsOf = function (ctx, p) {
    var id = ctx.houseOf && ctx.houseOf(p);
    return H.arms[id] || H.arms[ctx.themeId] || H.arms.origin;
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
          H.pennant({ charge: a.charge, field: a.field, fieldHi: a.fieldHi,
                      metal: a.metal, ink: a.ink, legend: o.name, w: 58, h: 78 }) +
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
          '<div class="hr-meter"><i style="width:' + pct + '%"></i></div>' +
        '</div>' +
      '</div>';
    }).join('');
  };

  /* ---- THE ROOM ---------------------------------------------------------
     A seat of the house, then everything owed in it.

     The old room screen buried the deeds behind a slide-out panel: to award
     something you opened the room, found a pin, opened the board, scrolled,
     and clicked. Here the seat is one compact rail across the top — arms, the
     name of the place, and every other place as a plate you can walk to — and
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
        '<div class="hr-seat-arms">' +
          H.pennant({ charge: a.charge, field: a.field, fieldHi: a.fieldHi,
                      metal: a.metal, ink: a.ink, legend: ctx.name(pl), w: 64, h: 86 }) +
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
    /* the inner hairline — the double rule that makes it read as engraved */
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

    /* ---------- PENNANT ------------------------------------------------- */
    '.hr-pennant{display:block;filter:drop-shadow(0 6px 14px var(--shadow));}',

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
    '.hr-meter{height:3px;margin-top:10px;background:var(--track);overflow:hidden;}',
    '.hr-meter i{display:block;height:100%;background:var(--metal,var(--gold));',
    '  transition:width .5s var(--ease);}',

    /* ---------- THE ROOM ------------------------------------------------ */
    '.hr-room{display:block;}',
    /* the seat: arms, where you are, and everywhere else — one rail */
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
    /* the claim buttons — the reason the screen exists */
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
       a surface — the header wordmark wears it, and so does a rank meter as it
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
