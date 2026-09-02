/* ==========================================================================
   THE DIORAMA ROOM
   --------------------------------------------------------------------------
   A room is one big render. You are not looking at a thumbnail of it — the app
   holds a camera over it and starts you zoomed into a corner, so the render
   fills the screen at close to its native pixels and reads as a place rather
   than a picture. Drag to move along the wall, scroll to pull back, click a
   fixture to travel to it.

   Fixtures are anchored to points on the image in normalised coordinates, so
   they ride the camera exactly: the noticeboard pin stays on the noticeboard
   whatever the zoom. They are ordinary HTML buttons — focusable, readable,
   and counter-scaled so the label never balloons.

   No WebGL, no CORS restriction, no download beyond the image itself. It works
   from a file:// page, it works on a cold phone, and the fidelity is whatever
   the render's fidelity was, because it IS the render.
   ========================================================================== */
(function () {
  'use strict';

  var DIO = {
    u: 0.5, v: 0.5, z: 1,
    _t: { u: 0.5, v: 0.5, z: 1 },
    _cfg: null, _raf: 0, _drag: null, _moved: 0,
    _canvas: null, _host: null, _img: null
  };
  window.ORIGIN_DIO = DIO;

  var MINZ = 1, MAXZ = 5.2;   /* the render has the pixels for it */

  /* ---- markup ---------------------------------------------------------- */
  DIO.shell = function (ctx, cfg) {
    var esc = ctx.esc, pl = ctx.active, pre = cfg.pre;
    var conf = cfg.rooms[pl.id];

    var spots = conf.pins || {};
    var others = ctx.places.filter(function (q) { return q.id !== pl.id; });
    var doors = others.map(function (q, i) {
      var s = spots[q.id] || cfg.fallbackPins[i % cfg.fallbackPins.length];
      return '<button class="dio-pin dio-door ' + pre + '-door" data-act="planet" data-p="' + esc(q.id) + '"' +
        ' data-u="' + s.u + '" data-v="' + s.v + '"' +
        ' title="Go through to ' + esc(ctx.name(q)) + '">' +
        '<span class="ic">' + (cfg.doorArt[q.id] || '') + '</span>' +
        '<span class="lbl">' + esc(ctx.name(q)) + '</span>' +
        '<span class="n">' + ctx.count(q.id) + '</span></button>';
    }).join('');

    var b = conf.board || { u: 0.5, v: 0.5 };
    var boardPin = '<button class="dio-pin dio-boardpin ' + pre + '-pin" data-act="board-open"' +
      ' data-u="' + b.u + '" data-v="' + b.v + '" title="' + esc(cfg.boardTitle) + '">' +
      '<span class="ic">' + cfg.boardArt + '</span>' +
      '<span class="lbl">' + esc(cfg.boardTitle) + '</span>' +
      '<span class="n">' + ctx.nodes.length + '</span></button>';

    /* anything else worth pointing at in this particular room */
    var extras = (conf.notes || []).map(function (n) {
      return '<span class="dio-pin dio-note" data-u="' + n.u + '" data-v="' + n.v + '">' +
        '<span class="dot"></span><span class="cap">' + esc(n.text) + '</span></span>';
    }).join('');

    var earned = ctx.earned(pl.id);
    return '<div class="dio-room ' + pre + '-room' + (cfg.open ? ' open' : '') + '" id="dioRoom">' +
      '<div class="dio-view" id="dioView">' +
        '<div class="dio-canvas" id="dioCanvas">' +
          '<img class="dio-img" id="dioImg" src="' + esc(conf.src) + '" alt="' + esc(ctx.name(pl)) + '" draggable="false">' +
          '<div class="dio-pins" id="dioPins">' + doors + boardPin + extras + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dio-vig"></div>' +
      '<div class="dio-nameplate">' +
        '<div class="where">' + esc(cfg.boardTitle) + '</div>' +
        '<h2>' + esc(ctx.name(pl)) + '</h2>' +
        '<div class="tally">' + ctx.nodes.length + ' ' +
          esc((ctx.nodes.length === 1 ? ctx.C('item') : ctx.C('items')).toLowerCase()) +
          ' · ' + ctx.fmt(earned) + ' today</div>' +
      '</div>' +
      '<div class="dio-zoom">' +
        '<button data-act="dio-out" aria-label="Pull back">−</button>' +
        '<button data-act="dio-home" aria-label="Whole room">⤢</button>' +
        '<button data-act="dio-in" aria-label="Move closer">+</button>' +
      '</div>' +
      '<button class="dio-toggle" data-act="board-toggle">' + (cfg.open ? '✕' : '☰') + '</button>' +
      '<aside class="dio-panel ' + pre + '-panel ' + cfg.boardSurface + '" id="dioPanel">' +
        '<div class="dio-panel-h"><h3>' + esc(ctx.name(pl)) + '</h3>' +
          '<button class="dio-close" data-act="board-toggle" aria-label="Close">✕</button></div>' +
        '<div class="dio-tools">' + cfg.tools + '</div>' +
        '<div class="dio-deeds">' + cfg.deeds + '</div>' +
      '</aside>' +
    '</div>';
  };

  /* ---- camera ---------------------------------------------------------- */
  DIO.wire = function (ctx, cfg) {
    var host = document.getElementById('dioView');
    var canvas = document.getElementById('dioCanvas');
    var img = document.getElementById('dioImg');
    if (!host || !canvas || !img) return false;

    var conf = cfg.rooms[ctx.active.id];
    var fresh = DIO._cfg !== conf;
    DIO._cfg = conf; DIO._host = host; DIO._canvas = canvas; DIO._img = img;

    if (fresh) {
      var h = conf.home || { u: 0.5, v: 0.5, z: 1 };
      DIO.u = DIO._t.u = h.u; DIO.v = DIO._t.v = h.v; DIO.z = DIO._t.z = h.z || 1;
    }

    if (!host.__bound) { bind(host); host.__bound = true; }
    if (img.complete) layout(); else img.onload = layout;
    if (!DIO._raf) loop();
    return true;
  };

  DIO.goTo = function (u, v, z) {
    DIO._t.u = u; DIO._t.v = v;
    if (z != null) DIO._t.z = Math.max(MINZ, Math.min(MAXZ, z));
  };
  DIO.zoomBy = function (f) {
    DIO._t.z = Math.max(MINZ, Math.min(MAXZ, DIO._t.z * f));
  };
  DIO.home = function () {
    var h = (DIO._cfg && DIO._cfg.home) || { u: .5, v: .5, z: 1 };
    DIO.goTo(h.u, h.v, h.z || 1);
  };
  DIO.wasDrag = function () { return DIO._moved > 6; };

  var iw = 1, ih = 1;
  function layout() {
    if (!DIO._img) return;
    iw = DIO._img.naturalWidth || 1; ih = DIO._img.naturalHeight || 1;
    DIO._canvas.style.width = iw + 'px';
    DIO._canvas.style.height = ih + 'px';
  }

  function bind(host) {
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.dio-pin')) return;
      DIO._drag = { x: e.clientX, y: e.clientY, u: DIO._t.u, v: DIO._t.v };
      DIO._moved = 0;
      host.setPointerCapture(e.pointerId);
      host.classList.add('grabbing');
    });
    host.addEventListener('pointermove', function (e) {
      if (!DIO._drag) return;
      var r = host.getBoundingClientRect();
      var s = scale(r);
      var dx = e.clientX - DIO._drag.x, dy = e.clientY - DIO._drag.y;
      DIO._moved = Math.max(DIO._moved, Math.abs(dx) + Math.abs(dy));
      DIO._t.u = DIO._drag.u - dx / (iw * s);
      DIO._t.v = DIO._drag.v - dy / (ih * s);
    });
    function end(e) {
      if (!DIO._drag) return;
      DIO._drag = null;
      host.classList.remove('grabbing');
      try { host.releasePointerCapture(e.pointerId); } catch (x) {}
    }
    host.addEventListener('pointerup', end);
    host.addEventListener('pointercancel', end);
    host.addEventListener('wheel', function (e) {
      e.preventDefault();
      DIO.zoomBy(e.deltaY > 0 ? 0.92 : 1.087);
    }, { passive: false });
    var pinch = null;
    host.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) pinch = { d: tdist(e), z: DIO._t.z };
    }, { passive: true });
    host.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        DIO._t.z = Math.max(MINZ, Math.min(MAXZ, pinch.z * tdist(e) / pinch.d));
      }
    }, { passive: true });
    host.addEventListener('touchend', function () { pinch = null; });
    window.addEventListener('resize', layout);
  }
  function tdist(e) {
    var a = e.touches[0], b = e.touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
  }

  /* the scale that makes the image cover the viewport, times the zoom */
  function scale(r) {
    return Math.max(r.width / iw, r.height / ih) * DIO.z;
  }

  function loop() {
    DIO._raf = requestAnimationFrame(loop);
    var host = DIO._host, canvas = DIO._canvas;
    if (!host || !canvas || !document.body.contains(host)) { cancelAnimationFrame(DIO._raf); DIO._raf = 0; return; }
    var r = host.getBoundingClientRect();
    if (!r.width) return;

    /* the deed panel covers the right of the room, so the middle of the frame
       is not the middle of what you can see. Centre on the visible part. */
    var panel = document.getElementById('dioPanel');
    var room = document.getElementById('dioRoom');
    var hidden = 0;
    if (panel && room && room.classList.contains('open') && window.innerWidth > 880) {
      hidden = panel.getBoundingClientRect().width;
    }
    var cxPx = (r.width - hidden) / 2;

    DIO.z += (DIO._t.z - DIO.z) * 0.14;
    /* keep the camera inside the picture, so you never pan off into grey */
    var s = scale(r);
    /* keep the picture covering the frame: the camera may come as close to the
       edge as the visible half-width allows, and no closer */
    var leftHalf = cxPx / (iw * s), rightHalf = (r.width - cxPx) / (iw * s);
    var halfV = r.height / (2 * ih * s);
    DIO._t.u = Math.max(leftHalf, Math.min(1 - rightHalf, DIO._t.u));
    DIO._t.v = Math.max(halfV, Math.min(1 - halfV, DIO._t.v));
    DIO.u += (DIO._t.u - DIO.u) * 0.16;
    DIO.v += (DIO._t.v - DIO.v) * 0.16;

    canvas.style.transform =
      'translate(' + (cxPx - DIO.u * iw * s).toFixed(2) + 'px,' +
                     (r.height / 2 - DIO.v * ih * s).toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';

    /* pins ride the image but keep their own size */
    var pins = document.getElementById('dioPins');
    if (pins && pins.__s !== s) {
      pins.__s = s;
      for (var i = 0; i < pins.children.length; i++) {
        var el = pins.children[i];
        if (el.__u === undefined) { el.__u = +el.dataset.u; el.__v = +el.dataset.v; }
        el.style.left = (el.__u * iw) + 'px';
        el.style.top = (el.__v * ih) + 'px';
        el.style.transform = 'translate(-50%,-50%) scale(' + (1 / s).toFixed(5) + ')';
      }
    }
  }

  /* ---- chrome ---------------------------------------------------------- */
  DIO.baseCss = [
    '#main.in-room{grid-template-columns:minmax(0,1fr);}',
    '#main.in-room #aside{display:none;}',
    '.dio-room{position:relative;height:min(78vh,880px);min-height:460px;overflow:hidden;',
    '  border-radius:var(--radius-lg);border:1px solid var(--line);',
    '  box-shadow:0 30px 70px -26px var(--shadow);background:#0a0605;}',
    '.dio-view{position:absolute;inset:0;overflow:hidden;cursor:grab;touch-action:none;}',
    '.dio-view.grabbing{cursor:grabbing;}',
    '.dio-canvas{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;}',
    '.dio-img{display:block;width:100%;height:100%;user-select:none;-webkit-user-drag:none;}',
    '.dio-pins{position:absolute;inset:0;}',
    '.dio-pin{position:absolute;transform-origin:center;}',
    '.dio-vig{position:absolute;inset:0;pointer-events:none;',
    '  background:radial-gradient(ellipse 82% 78% at 50% 46%,transparent 54%,rgba(0,0,0,.62) 100%);}',

    /* a doorway, or the board, marked on the render */
    '.dio-door,.dio-boardpin{display:flex;flex-direction:column;align-items:center;gap:2px;',
    '  background:none;border:0;padding:6px 8px;width:126px;',
    '  transition:filter .18s var(--ease);}',
    '.dio-door .ic svg,.dio-boardpin .ic svg{width:42px;height:46px;',
    '  filter:drop-shadow(0 3px 9px rgba(0,0,0,1));}',
    '.dio-door .lbl,.dio-boardpin .lbl{font-family:var(--f-display);font-size:17px;line-height:1.05;',
    '  color:#fff;text-shadow:0 1px 3px #000,0 0 16px rgba(0,0,0,1);}',
    '.dio-door .n,.dio-boardpin .n{font-family:var(--f-display);font-size:13px;color:var(--gold);',
    '  text-shadow:0 1px 3px #000;}',
    '.dio-boardpin .lbl{color:var(--gold);}',
    /* while the panel is open the board pin is both redundant and behind it */
    '.dio-room.open .dio-boardpin{display:none;}',
    '.dio-door:hover,.dio-boardpin:hover,.dio-door:focus-visible,.dio-boardpin:focus-visible{',
    '  filter:brightness(1.45) drop-shadow(0 0 12px rgba(255,220,150,.6));outline:none;}',
    /* a quiet label on a piece of the room */
    '.dio-note{display:flex;align-items:center;gap:7px;pointer-events:none;}',
    '.dio-note .dot{width:9px;height:9px;border-radius:50%;background:var(--gold);',
    '  box-shadow:0 0 0 4px rgba(0,0,0,.35),0 0 14px var(--gold);}',
    '.dio-note .cap{font-family:var(--f-body);font-size:12px;color:rgba(255,255,255,.9);',
    '  text-shadow:0 1px 4px #000;white-space:nowrap;}',

    '.dio-nameplate{position:absolute;left:20px;bottom:18px;z-index:3;pointer-events:none;',
    '  text-shadow:0 2px 10px rgba(0,0,0,.95);max-width:50%;}',
    '.dio-nameplate h2{font-family:var(--f-display);font-size:2.2em;line-height:.98;color:#fff;',
    '  text-transform:none;letter-spacing:0;margin:1px 0 2px;}',
    '.dio-nameplate .where{font-family:var(--f-label);font-size:.8em;letter-spacing:var(--ls-label);',
    '  text-transform:var(--tt-label);color:var(--gold);opacity:.95;}',
    '.dio-nameplate .tally{font-family:var(--f-body);font-size:12.5px;color:rgba(255,255,255,.86);}',

    '.dio-zoom{position:absolute;left:20px;top:16px;z-index:5;display:flex;gap:5px;}',
    '.dio-zoom button{width:34px;height:34px;border-radius:var(--radius);color:#fff;font-size:15px;',
    '  border:1px solid var(--line);background:rgba(0,0,0,.45);line-height:1;}',
    '.dio-zoom button:hover{background:rgba(0,0,0,.72);}',
    '.dio-toggle{position:absolute;right:14px;top:16px;z-index:5;width:38px;height:38px;',
    '  border-radius:var(--radius);border:1px solid var(--line-hard);background:rgba(0,0,0,.55);',
    '  color:#fff;font-size:15px;line-height:1;}',
    '.dio-toggle:hover{background:rgba(0,0,0,.78);}',

    '.dio-panel{position:absolute;right:0;top:0;bottom:0;width:min(438px,88%);z-index:4;',
    '  display:flex;flex-direction:column;transform:translateX(101%);',
    '  transition:transform .38s cubic-bezier(.3,.8,.25,1);',
    '  box-shadow:-24px 0 60px -20px rgba(0,0,0,.9);}',
    '.dio-room.open .dio-panel{transform:none;}',
    '.dio-panel-h{display:flex;align-items:center;justify-content:space-between;gap:10px;',
    '  padding:15px 16px 11px;flex:none;}',
    '.dio-panel-h h3{font-family:var(--f-display);font-size:1.9em;line-height:1;text-transform:none;',
    '  letter-spacing:0;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.7);}',
    '.dio-close{background:none;border:0;color:rgba(255,255,255,.7);font-size:15px;padding:4px 6px;}',
    '.dio-close:hover{color:#fff;}',
    '.dio-tools{display:flex;gap:6px;flex-wrap:wrap;padding:0 16px 11px;flex:none;}',
    '.dio-deeds{display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:12px;',
    '  align-content:start;overflow:auto;padding:2px 16px 18px;flex:1;}',

    '@media(max-width:880px){',
    '  .dio-room{height:min(64vh,540px);min-height:360px;}',
    '  .dio-panel{left:0;right:0;top:auto;width:auto;height:76%;transform:translateY(101%);',
    '    box-shadow:0 -24px 60px -20px rgba(0,0,0,.9);}',
    '  .dio-room.open .dio-panel{transform:none;}',
    '  .dio-deeds{grid-template-columns:1fr;}',
    '  .dio-door,.dio-boardpin{width:96px;}',
    '  .dio-door .ic svg,.dio-boardpin .ic svg{width:30px;height:33px;}',
    '  .dio-door .lbl,.dio-boardpin .lbl{font-size:13px;}',
    '  .dio-nameplate h2{font-size:1.7em;} .dio-nameplate{max-width:58%;}',
    '  .dio-note .cap{display:none;}',
    '}'
  ].join('\n');
})();
