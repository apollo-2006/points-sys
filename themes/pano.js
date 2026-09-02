/* ==========================================================================
   THE PANORAMIC SHELL
   --------------------------------------------------------------------------
   You stand inside the room. A 360° equirectangular render is mapped to the
   inside of a sphere and the camera sits at its centre; dragging turns your
   head. Fixtures — the noticeboard, the hearth, the doorway to the next room —
   are anchored to compass bearings in that sphere, projected to screen every
   frame, and are ordinary HTML buttons, so they stay clickable, focusable and
   readable at any angle.

   The renderer is Three.js, loaded from a CDN and used for exactly one thing:
   an inverted sphere with a texture on it. No models, no materials, no scene
   graph to speak of. If Three.js fails to load — offline, blocked, whatever —
   `PANO.ok` stays false and the app falls back to the flat room view without
   anyone noticing.

   The asset is the whole trick. An equirectangular render out of Blender keeps
   its own global illumination, its own shadows, its own props: nothing is being
   re-lit in the browser, so what you stand inside is the render itself.
   ========================================================================== */
(function () {
  'use strict';

  /* Local first — this app is opened straight off disk as often as it is
     served, and a file:// page cannot always reach a CDN. The CDN is the
     fallback, not the other way round. */
  var THREE_SRCS = ['vendor/three.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js'];

  var PANO = {
    ok: false,          /* the sphere is up and drawing */
    failed: false,      /* the texture could not be fetched; stand down */
    ready: false,       /* Three.js finished loading */
    yaw: 0, pitch: 0, fov: 74,
    _target: { yaw: 0, pitch: 0, fov: 74 },
    _hot: [],           /* fixtures anchored in the sphere */
    _src: null,
    _onMove: null
  };
  window.ORIGIN_PANO = PANO;

  var scene, camera, renderer, sphere, tex, loader, host, layer, raf = 0;
  var drag = null, moved = 0;

  /* ---- loading Three.js once, lazily ---------------------------------- */
  var loading = null;
  PANO.load = function () {
    if (loading) return loading;
    loading = new Promise(function (res) {
      if (window.THREE) { res(true); return; }
      var i = 0;
      (function attempt() {
        if (i >= THREE_SRCS.length) {
          console.warn('[pano] three.js unavailable — the flat room view stands in');
          res(false); return;
        }
        var el = document.createElement('script');
        el.src = THREE_SRCS[i++];
        el.onload = function () { window.THREE ? res(true) : attempt(); };
        el.onerror = attempt;
        document.head.appendChild(el);
      })();
    }).then(function (okay) { PANO.ready = okay; return okay; });
    return loading;
  };

  /* ---- mount / unmount ------------------------------------------------- */
  PANO.mount = function (hostEl, layerEl) {
    if (!window.THREE || !hostEl) return false;
    host = hostEl; layer = layerEl;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(PANO.fov, 1, 0.1, 1000);
      var geo = new THREE.SphereGeometry(500, 60, 40);
      geo.scale(-1, 1, 1);                       /* look at it from the inside */
      sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
      scene.add(sphere);
      loader = new THREE.TextureLoader();
      bindInput();
    }
    if (renderer.domElement.parentNode !== host) host.appendChild(renderer.domElement);
    renderer.domElement.className = 'pano-canvas';
    PANO.ok = true;
    PANO.resize();
    tick();
    return true;
  };
  PANO.unmount = function () {
    PANO.ok = false;
    cancelAnimationFrame(raf); raf = 0;
    if (renderer && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  };

  /* ---- the picture you are standing inside ----------------------------- */
  PANO.show = function (src, opts) {
    if (!PANO.ok || !src) return;
    opts = opts || {};
    if (src === PANO._src && !opts.force) return;
    PANO._src = src;
    loader.load(src, function (t) {
      if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      var old = sphere.material;
      sphere.material = new THREE.MeshBasicMaterial({ map: t });
      if (old) { if (old.map) old.map.dispose(); old.dispose(); }
      if (opts.yaw != null) { PANO.yaw = PANO._target.yaw = opts.yaw; }
      if (opts.pitch != null) { PANO.pitch = PANO._target.pitch = opts.pitch; }
      if (host) host.classList.add('lit');
    }, undefined, function () {
      console.warn('[pano] could not load ' + src +
        ' — if this is a file:// page, WebGL textures are blocked by the browser; serve the app over http(s).');
      PANO.failed = true;
      PANO._src = null;
      PANO.unmount();
      if (window.__origin && window.__origin.rerender) window.__origin.rerender();
    });
  };

  /* ---- fixtures anchored in the room ----------------------------------- */
  /* each: {el, yaw, pitch, scale} — yaw/pitch in degrees, 0 = straight ahead */
  PANO.setFixtures = function (list) { PANO._hot = list || []; };

  PANO.lookAt = function (yaw, pitch, fov) {
    PANO._target.yaw = yaw;
    if (pitch != null) PANO._target.pitch = pitch;
    if (fov != null) PANO._target.fov = fov;
  };
  PANO.nudgeFov = function (d) {
    PANO._target.fov = Math.max(38, Math.min(96, PANO._target.fov + d));
  };

  PANO.resize = function () {
    if (!renderer || !host) return;
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  };

  /* ---- input: drag to turn your head ----------------------------------- */
  function bindInput() {
    var el = renderer.domElement;
    el.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, y: e.clientY, yaw: PANO._target.yaw, pitch: PANO._target.pitch };
      moved = 0;
      el.setPointerCapture(e.pointerId);
      host.classList.add('grabbing');
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      var k = PANO.fov / 700;
      PANO._target.yaw = drag.yaw - dx * k * 1.6;
      PANO._target.pitch = Math.max(-58, Math.min(58, drag.pitch + dy * k * 1.6));
    });
    function end(e) {
      if (!drag) return;
      drag = null;
      host.classList.remove('grabbing');
      try { el.releasePointerCapture(e.pointerId); } catch (x) {}
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      PANO.nudgeFov(e.deltaY * 0.05);
    }, { passive: false });
    /* pinch */
    var pinch = null;
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) pinch = { d: tdist(e), fov: PANO._target.fov };
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        PANO._target.fov = Math.max(38, Math.min(96, pinch.fov * pinch.d / tdist(e)));
      }
    }, { passive: true });
    el.addEventListener('touchend', function () { pinch = null; });
    window.addEventListener('resize', PANO.resize);
  }
  function tdist(e) {
    var a = e.touches[0], b = e.touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
  }

  /* ---- the loop -------------------------------------------------------- */
  var V = null;
  function tick() {
    raf = requestAnimationFrame(tick);
    if (!PANO.ok || !renderer) return;

    /* ease toward the target so a room change swings rather than snaps */
    PANO.yaw += (PANO._target.yaw - PANO.yaw) * 0.12;
    PANO.pitch += (PANO._target.pitch - PANO.pitch) * 0.12;
    PANO.fov += (PANO._target.fov - PANO.fov) * 0.12;
    camera.fov = PANO.fov;
    camera.updateProjectionMatrix();

    var y = PANO.yaw * Math.PI / 180, p = PANO.pitch * Math.PI / 180;
    camera.lookAt(
      500 * Math.cos(p) * Math.sin(y),
      500 * Math.sin(p),
      500 * Math.cos(p) * Math.cos(y)
    );
    renderer.render(scene, camera);
    placeFixtures();
    if (PANO._onMove) PANO._onMove(PANO.yaw, PANO.pitch);
  }

  /* project each anchored fixture to the screen and park its element there */
  function placeFixtures() {
    if (!PANO._hot.length || !layer) return;
    if (!V) V = new THREE.Vector3();
    var r = host.getBoundingClientRect();
    for (var i = 0; i < PANO._hot.length; i++) {
      var h = PANO._hot[i];
      if (!h.el) continue;
      var yy = h.yaw * Math.PI / 180, pp = (h.pitch || 0) * Math.PI / 180;
      V.set(100 * Math.cos(pp) * Math.sin(yy), 100 * Math.sin(pp), 100 * Math.cos(pp) * Math.cos(yy));
      V.project(camera);
      var behind = V.z > 1;
      var x = (V.x * 0.5 + 0.5) * r.width;
      var yv = (-V.y * 0.5 + 0.5) * r.height;
      var out = behind || x < -80 || yv < -80 || x > r.width + 80 || yv > r.height + 80;
      h.el.style.visibility = out ? 'hidden' : 'visible';
      if (out) continue;
      /* things further from the centre of vision sit a touch smaller */
      var s = h.scale || 1;
      h.el.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
      h.el.style.left = x.toFixed(1) + 'px';
      h.el.style.top = yv.toFixed(1) + 'px';
    }
  }

  /* did the pointer travel far enough that this was a drag, not a click? */
  PANO.wasDrag = function () { return moved > 6; };
})();

/* ==========================================================================
   THE ROOM SCREEN, IN PANORAMA
   Shared by both houses: the shell and the wiring are identical, the
   materials and the deed markup are not. A house passes what it looks like;
   this passes back a room you are standing in.
   ========================================================================== */
(function () {
  var PANO = window.ORIGIN_PANO;

  /* the six other rooms, spread across the walls either side of you, and the
     board on the wall you start out facing */
  var DOOR_BEARINGS = [
    { yaw: -62, pitch: -9 }, { yaw: -100, pitch: -6 }, { yaw: -142, pitch: -9 },
    { yaw: 62, pitch: -9 }, { yaw: 100, pitch: -6 }, { yaw: 142, pitch: -9 }
  ];

  PANO.roomShell = function (ctx, cfg) {
    var esc = ctx.esc, pl = ctx.active, pre = cfg.pre;
    var conf = cfg.rooms[pl.id];
    var doors = ctx.places.filter(function (q) { return q.id !== pl.id; }).map(function (q, i) {
      var b = (conf && conf.doors && conf.doors[q.id]) || DOOR_BEARINGS[i % 6];
      return '<button class="pano-door ' + pre + '-door" data-act="planet" data-p="' + esc(q.id) + '"' +
        ' data-yaw="' + b.yaw + '" data-pitch="' + (b.pitch || 0) + '"' +
        ' title="Go through to ' + esc(ctx.name(q)) + '">' +
        '<span class="ic">' + (cfg.doorArt[q.id] || '') + '</span>' +
        '<span class="lbl">' + esc(ctx.name(q)) + '</span>' +
        '<span class="n">' + ctx.count(q.id) + '</span></button>';
    }).join('');

    var bb = (conf && conf.board) || { yaw: 0, pitch: -2 };
    var marker = '<button class="pano-board-pin ' + pre + '-pin" data-act="board-open"' +
      ' data-yaw="' + bb.yaw + '" data-pitch="' + bb.pitch + '"' +
      ' title="' + esc(cfg.boardTitle) + '">' +
      '<span class="ic">' + cfg.boardArt + '</span>' +
      '<span class="lbl">' + esc(cfg.boardTitle) + '</span>' +
      '<span class="n">' + ctx.nodes.length + '</span></button>';

    var earned = ctx.earned(pl.id);
    return '<div class="pano-room ' + pre + '-room' + (cfg.open ? ' open' : '') + '" id="panoRoom">' +
      '<div class="pano-sky" id="panoSky"></div>' +
      '<div class="pano-fx" id="panoFx">' + doors + marker + '</div>' +
      '<div class="pano-nameplate">' +
        '<div class="where">' + esc(cfg.boardTitle) + '</div>' +
        '<h2>' + esc(ctx.name(pl)) + '</h2>' +
        '<div class="tally">' + ctx.nodes.length + ' ' +
          esc((ctx.nodes.length === 1 ? ctx.C('item') : ctx.C('items')).toLowerCase()) +
          ' · ' + ctx.fmt(earned) + ' today</div>' +
      '</div>' +
      '<button class="pano-turn l" data-act="look-left" aria-label="Turn left">‹</button>' +
      '<button class="pano-turn r" data-act="look-right" aria-label="Turn right">›</button>' +
      '<div class="pano-hint">drag to look around</div>' +
      '<button class="pano-toggle" data-act="board-toggle">' + (cfg.open ? '✕' : '☰') + '</button>' +
      '<aside class="pano-panel ' + pre + '-panel ' + cfg.boardSurface + '" id="panoPanel">' +
        '<div class="pano-panel-h">' +
          '<h3>' + esc(ctx.name(pl)) + '</h3>' +
          '<button class="pano-close" data-act="board-toggle" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="pano-tools">' + cfg.tools + '</div>' +
        '<div class="pano-deeds">' + cfg.deeds + '</div>' +
      '</aside>' +
    '</div>';
  };

  /* mount the sphere, hang the fixtures on it, point the camera */
  PANO.roomWire = function (ctx, cfg) {
    var host = document.getElementById('panoSky');
    var layer = document.getElementById('panoFx');
    if (!host || !layer) return false;
    if (!PANO.mount(host, layer)) return false;

    var conf = cfg.rooms[ctx.active.id];
    if (!conf) { PANO.unmount(); return false; }

    var changed = conf.src !== PANO._src;
    PANO.show(conf.src, changed ? { yaw: (conf.start && conf.start.yaw) || 0,
                                    pitch: (conf.start && conf.start.pitch) || 0 } : {});
    if (changed) PANO.lookAt((conf.start && conf.start.yaw) || 0, (conf.start && conf.start.pitch) || 0);

    var fx = [];
    Array.prototype.forEach.call(layer.children, function (el) {
      fx.push({ el: el, yaw: +el.dataset.yaw || 0, pitch: +el.dataset.pitch || 0, scale: 1 });
    });
    PANO.setFixtures(fx);
    PANO.resize();
    return true;
  };
})();

/* ==========================================================================
   Shell chrome. Structure only — every colour is a theme token, so the two
   houses furnish the same room differently.
   ========================================================================== */
window.ORIGIN_PANO.baseCss = [
  '#main.in-room{grid-template-columns:minmax(0,1fr);}',
  '#main.in-room #aside{display:none;}',
  '.pano-room{position:relative;height:min(78vh,860px);min-height:460px;overflow:hidden;',
  '  border-radius:var(--radius-lg);border:1px solid var(--line);',
  '  box-shadow:0 30px 70px -26px var(--shadow);}',
  '.pano-sky{position:absolute;inset:0;background:#05070a;}',
  '.pano-sky::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;',
  '  transition:opacity .5s ease;background:radial-gradient(ellipse 80% 70% at 50% 50%,',
  '  transparent 55%,rgba(0,0,0,.5) 100%);}',
  '.pano-sky.lit::after{opacity:1;}',
  '.pano-canvas{display:block;width:100%;height:100%;cursor:grab;touch-action:none;}',
  '.pano-sky.grabbing .pano-canvas{cursor:grabbing;}',
  '.pano-fx{position:absolute;inset:0;pointer-events:none;}',
  '.pano-fx > *{position:absolute;pointer-events:auto;left:-999px;visibility:hidden;}',

  /* a doorway you can walk through */
  '.pano-door,.pano-board-pin{display:flex;flex-direction:column;align-items:center;gap:2px;',
  '  background:none;border:0;padding:6px 8px;width:118px;',
  '  transition:transform .18s var(--ease),filter .18s var(--ease);}',
  '.pano-door .ic svg,.pano-board-pin .ic svg{width:40px;height:44px;',
  '  filter:drop-shadow(0 3px 8px rgba(0,0,0,.95));}',
  '.pano-door .lbl,.pano-board-pin .lbl{font-family:var(--f-display);font-size:16px;line-height:1.05;',
  '  color:#fff;text-shadow:0 1px 3px #000,0 0 14px rgba(0,0,0,1);}',
  '.pano-door .n,.pano-board-pin .n{font-family:var(--f-display);font-size:12.5px;color:var(--gold);',
  '  text-shadow:0 1px 3px #000;}',
  '.pano-door:hover .ic,.pano-door:focus-visible .ic,',
  '.pano-board-pin:hover .ic,.pano-board-pin:focus-visible .ic{filter:brightness(1.4);}',
  '.pano-door:hover,.pano-board-pin:hover{transform:translate(-50%,-50%) scale(1.12) !important;}',
  '.pano-board-pin .lbl{color:var(--gold);}',

  /* where you are */
  '.pano-nameplate{position:absolute;left:20px;bottom:18px;z-index:3;pointer-events:none;',
  '  text-shadow:0 2px 10px rgba(0,0,0,.95);max-width:52%;}',
  '.pano-nameplate h2{font-family:var(--f-display);font-size:2.2em;line-height:.98;color:#fff;',
  '  text-transform:none;letter-spacing:0;margin:1px 0 2px;}',
  '.pano-nameplate .where{font-family:var(--f-label);font-size:.8em;letter-spacing:var(--ls-label);',
  '  text-transform:var(--tt-label);color:var(--gold);opacity:.95;}',
  '.pano-nameplate .tally{font-family:var(--f-body);font-size:12.5px;color:rgba(255,255,255,.86);}',
  '.pano-turn{position:absolute;top:50%;transform:translateY(-50%);z-index:5;width:42px;height:76px;',
  '  border:1px solid var(--line);background:rgba(0,0,0,.42);color:#fff;font-size:26px;line-height:1;',
  '  border-radius:var(--radius);opacity:.5;transition:opacity .2s,background .2s;}',
  '.pano-turn:hover{opacity:1;background:rgba(0,0,0,.68);}',
  '.pano-turn.l{left:12px;} .pano-turn.r{right:12px;}',
  '.pano-room.open .pano-turn.r{right:calc(min(438px,88%) + 12px);}',
  '@media(max-width:880px){.pano-room.open .pano-turn.r{right:12px;}}',
  '.pano-hint{position:absolute;right:18px;bottom:16px;z-index:3;pointer-events:none;',
  '  font-family:var(--f-body);font-size:11px;letter-spacing:.1em;text-transform:uppercase;',
  '  color:rgba(255,255,255,.42);text-shadow:0 1px 4px #000;}',
  '.pano-room.open .pano-hint{display:none;}',

  /* the board, hinged on the right wall */
  '.pano-toggle{position:absolute;right:14px;top:14px;z-index:5;width:40px;height:40px;',
  '  border-radius:var(--radius);border:1px solid var(--line-hard);background:rgba(0,0,0,.55);',
  '  color:#fff;font-size:15px;line-height:1;backdrop-filter:blur(3px);}',
  '.pano-toggle:hover{background:rgba(0,0,0,.75);}',
  '.pano-panel{position:absolute;right:0;top:0;bottom:0;width:min(438px,88%);z-index:4;',
  '  display:flex;flex-direction:column;transform:translateX(101%);',
  '  transition:transform .38s cubic-bezier(.3,.8,.25,1);',
  '  box-shadow:-24px 0 60px -20px rgba(0,0,0,.9);}',
  '.pano-room.open .pano-panel{transform:none;}',
  '.pano-panel-h{display:flex;align-items:center;justify-content:space-between;gap:10px;',
  '  padding:15px 16px 11px;flex:none;}',
  '.pano-panel-h h3{font-family:var(--f-display);font-size:1.9em;line-height:1;text-transform:none;',
  '  letter-spacing:0;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.7);}',
  '.pano-close{background:none;border:0;color:rgba(255,255,255,.7);font-size:15px;padding:4px 6px;}',
  '.pano-close:hover{color:#fff;}',
  '.pano-tools{display:flex;gap:6px;flex-wrap:wrap;padding:0 16px 11px;flex:none;}',
  '.pano-deeds{display:grid;grid-template-columns:repeat(auto-fill,minmax(178px,1fr));gap:12px;',
  '  align-content:start;overflow:auto;padding:2px 16px 18px;flex:1;}',

  '@media(max-width:880px){',
  '  .pano-room{height:min(66vh,560px);min-height:380px;}',
  '  .pano-panel{left:0;right:0;top:auto;width:auto;height:74%;transform:translateY(101%);',
  '    box-shadow:0 -24px 60px -20px rgba(0,0,0,.9);}',
  '  .pano-room.open .pano-panel{transform:none;}',
  '  .pano-deeds{grid-template-columns:1fr;}',
  '  .pano-door,.pano-board-pin{width:92px;}',
  '  .pano-door .ic svg,.pano-board-pin .ic svg{width:30px;height:33px;}',
  '  .pano-door .lbl,.pano-board-pin .lbl{font-size:13px;}',
  '  .pano-nameplate h2{font-size:1.7em;} .pano-nameplate{max-width:60%;}',
  '}'
].join('\n');
