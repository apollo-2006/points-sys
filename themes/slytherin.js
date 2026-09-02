/* ==========================================================================
   SLYTHERIN — the common room, under the Black Lake.
   --------------------------------------------------------------------------
   Old money. Grey stone, green glass, tarnished silver, taupe and tan. Every
   light source is either the green fire or the water overhead; there is no
   warmth anywhere. Where Gryffindor is crooked and handwritten, this house is
   level, exact and engraved. Nothing bounces. Things glide.
   ========================================================================== */
(function () {
  var U = ORIGIN_THEMES.util;
  var B = U.baseIcons({ weight: 1.25, cap: 'butt', join: 'miter' });
  var I = B.I, F = B.F;
  /* ======================================================================
     THE ISOMETRIC ROOM
     A cutaway diorama: two back walls meeting at a corner, a floor diamond
     below them, and furniture standing on it. Everything is authored in room
     coordinates — x runs down-right, y runs down-left, z is up — and
     projected once, so a chair placed at (6,2) is where you expect it.
     ====================================================================== */
  var TW = 44, TH = 22, TZ = 27, N = 10, CX = 452, CY = 250, WALLH = 9;

  function P2(x, y, z) { return [CX + (x - y) * TW, CY + (x + y) * TH - (z || 0) * TZ]; }
  function pt(x, y, z) { var p = P2(x, y, z); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }
  function poly(pts, fill, extra) {
    return '<polygon points="' + pts.map(function (p) { return pt(p[0], p[1], p[2]); }).join(' ') +
           '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  /* shade a hex by a factor — one material, three faces, no hand-mixed colours */
  function sh(hex, f) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!m) return hex;
    var c = [1, 2, 3].map(function (i) {
      return Math.max(0, Math.min(255, Math.round(parseInt(m[i], 16) * f)));
    });
    return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
  }
  /* a solid block: top, then the two faces the camera can see */
  function box(x, y, z, w, d, h, col, o) {
    o = o || '';
    return poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], sh(col, 1.12), o) +
           poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], sh(col, 0.74), o) +
           poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], sh(col, 0.92), o);
  }
  /* a panel lying in one of the two wall planes.
     side 'r' = the wall at y=0 (runs down-right); 'l' = the wall at x=0 */
  function wall(side, u0, u1, z0, z1, fill, o) {
    var q = side === 'r'
      ? [[u0, 0, z0], [u1, 0, z0], [u1, 0, z1], [u0, 0, z1]]
      : [[0, u0, z0], [0, u1, z0], [0, u1, z1], [0, u0, z1]];
    return poly(q, fill, o);
  }
  /* an arched opening in a wall — the shape gothic windows and fireplaces share */
  function archOnWall(side, uc, uw, zBase, zTop, fill, stroke, sw) {
    var a = uc - uw / 2, b = uc + uw / 2, zSpring = zTop - uw * (TW / TZ) * 0.5;
    function p(u, z) { return side === 'r' ? pt(u, 0, z) : pt(0, u, z); }
    var rx = Math.abs(P2(uw / 2, 0, 0)[0] - P2(0, 0, 0)[0]);
    var ry = Math.abs(P2(0, 0, zTop)[1] - P2(0, 0, zSpring)[1]);
    if (side === 'l') rx = Math.abs(P2(0, uw / 2, 0)[0] - P2(0, 0, 0)[0]);
    var d = 'M' + p(a, zBase) + ' L' + p(a, zSpring) +
            ' A' + rx.toFixed(1) + ' ' + ry.toFixed(1) + ' 0 0 1 ' + p(b, zSpring) +
            ' L' + p(b, zBase) + ' Z';
    return '<path d="' + d + '" fill="' + fill + '"' +
      (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 3) + '"' : '') + '/>';
  }
  /* the flames, three layers on three periods, drawn flat facing the camera */
  function flames(x, y, z, s, lo, mid, hi) {
    var p = P2(x, y, z);
    return '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ') scale(' + s + ')">' +
      '<g class="gr-glow"><ellipse rx="86" ry="34" fill="url(#roomGlow)"/></g>' +
      '<g class="gr-f1"><path d="M0 2 q-26 -32 -8 -60 q5 20 17 25 q-9 -30 10 -46 q-3 27 17 41 ' +
        'q12 -9 10 -25 q20 30 -5 65 z" fill="' + lo + '" opacity=".95"/></g>' +
      '<g class="gr-f2"><path d="M0 2 q-19 -25 -6 -45 q4 14 12 18 q-7 -22 8 -34 q-2 20 12 30 ' +
        'q9 -8 8 -18 q15 22 -4 49 z" fill="' + mid + '" opacity=".95"/></g>' +
      '<g class="gr-f3"><path d="M0 2 q-10 -14 -3 -26 q3 9 7 11 q-4 -12 4 -19 q-1 11 7 17 ' +
        'q5 -4 4 -10 q9 12 -2 27 z" fill="' + hi + '"/></g></g>';
  }
  /* a hanging lantern on a wall bracket */
  function lantern(side, u, z, metal, glow) {
    var p = side === 'r' ? P2(u, 0, z) : P2(0, u, z);
    return '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ')">' +
      '<circle r="30" fill="' + glow + '" opacity=".16"/>' +
      '<path d="M0 -26 v10" stroke="' + metal + '" stroke-width="2.4"/>' +
      '<path d="M-9 -16 h18 l3 22 h-24 z" fill="' + sh(metal, .8) + '"/>' +
      '<path d="M-6 -13 h12 l2 16 h-16 z" fill="' + glow + '" opacity=".9"/>' +
      '<g class="gr-candle"><ellipse cy="-4" rx="3" ry="5" fill="#FFF3CC"/></g>' +
      '<path d="M-11 6 h22" stroke="' + metal + '" stroke-width="2.4"/></g>';
  }
  /* a framed picture flat on a wall */
  function frame(side, u, z, w, h, frameCol, canvas, art) {
    var p = side === 'r' ? P2(u, 0, z) : P2(0, u, z);
    var skew = side === 'r' ? 'matrix(1,0.5,0,1,0,0)' : 'matrix(1,-0.5,0,1,0,0)';
    return '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ') ' + skew + '">' +
      '<rect x="' + (-w / 2 - 4) + '" y="' + (-h / 2 - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) +
        '" rx="2" fill="' + frameCol + '"/>' +
      '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" fill="' + canvas + '"/>' +
      (art || '') + '</g>';
  }
  /* the room shell: two walls, a floor, and the seam where they meet */
  function shell(m) {
    var o = '';
    /* left-facing wall (x = 0) */
    o += wall('l', 0, N, 0, WALLH, m.wallL);
    /* right-facing wall (y = 0) */
    o += wall('r', 0, N, 0, WALLH, m.wallR);
    /* courses of brick or stone, drawn in the wall planes */
    var cs = m.course || 'rgba(0,0,0,.18)';
    for (var z = 1; z < WALLH; z++) {
      o += '<path d="M' + pt(0, N, z) + ' L' + pt(0, 0, z) + ' L' + pt(N, 0, z) +
           '" fill="none" stroke="' + cs + '" stroke-width="1.4"/>';
    }
    for (var u = 1; u < N; u++) {
      var off = (u % 2) ? 0 : 0;
      o += '<path d="M' + pt(0, u, 0 + off) + ' L' + pt(0, u, WALLH) + '" stroke="' + cs +
           '" stroke-width="1" opacity=".7"/>';
      o += '<path d="M' + pt(u, 0, 0 + off) + ' L' + pt(u, 0, WALLH) + '" stroke="' + cs +
           '" stroke-width="1" opacity=".7"/>';
    }
    /* the corner seam and the top edge, so the cutaway reads as a solid model */
    o += '<path d="M' + pt(0, 0, 0) + ' L' + pt(0, 0, WALLH) + '" stroke="' + sh(m.wallR, .6) + '" stroke-width="2.5"/>';
    o += '<path d="M' + pt(0, N, WALLH) + ' L' + pt(0, 0, WALLH) + ' L' + pt(N, 0, WALLH) +
         '" fill="none" stroke="' + m.cap + '" stroke-width="7" stroke-linejoin="round"/>';
    /* floor */
    o += poly([[0, 0, 0], [N, 0, 0], [N, N, 0], [0, N, 0]], m.floor);
    var fl = m.floorLine || 'rgba(0,0,0,.22)';
    for (var t = 1; t < N; t++) {
      o += '<path d="M' + pt(t, 0, 0) + ' L' + pt(t, N, 0) + '" stroke="' + fl + '" stroke-width="1.2"/>';
      o += '<path d="M' + pt(0, t, 0) + ' L' + pt(N, t, 0) + '" stroke="' + fl + '" stroke-width="1.2"/>';
    }
    /* the front lip of the cutaway — the model sits on a plinth */
    o += poly([[N, 0, 0], [N, N, 0], [0, N, 0]], 'none');
    o += '<path d="M' + pt(N, 0, 0) + ' L' + pt(N, N, 0) + ' L' + pt(0, N, 0) +
         '" fill="none" stroke="' + m.cap + '" stroke-width="5" stroke-linejoin="round" opacity=".85"/>';
    return o;
  }

  /* ---- shared pieces ---------------------------------------------------- */
  function rug(x, y, w, d, col, ring) {
    var o = poly([[x, y, .02], [x + w, y, .02], [x + w, y + d, .02], [x, y + d, .02]], col, ' opacity=".8"');
    if (ring) o += '<path d="M' + pt(x + .8, y + .8, .03) + ' L' + pt(x + w - .8, y + .8, .03) +
      ' L' + pt(x + w - .8, y + d - .8, .03) + ' L' + pt(x + .8, y + d - .8, .03) +
      ' Z" fill="none" stroke="' + ring + '" stroke-width="2" opacity=".65"/>';
    return o;
  }
  function seat(x, y, w, d, col) {
    return box(x, y, 0, w, d, .5, col) + box(x, y, .5, w, d, .3, sh(col, 1.2)) +
           box(x, y, .5, w, .3, 1.15, sh(col, .88)) +
           box(x, y, .5, .28, d, .68, sh(col, 1.06)) +
           box(x + w - .28, y, .5, .28, d, .68, sh(col, 1.06));
  }
  function table(x, y, w, d, h, top, leg) {
    return box(x + .12, y + .12, 0, .18, .18, h, leg) + box(x + w - .3, y + .12, 0, .18, .18, h, leg) +
           box(x + .12, y + d - .3, 0, .18, .18, h, leg) + box(x + w - .3, y + d - .3, 0, .18, .18, h, leg) +
           box(x, y, h, w, d, .16, top);
  }
  function shelfUnit(x, y, w, d, h, stone, jars) {
    var o = box(x, y, 0, w, d, h, stone);
    for (var s = 1; s <= 3; s++) {
      var z = h * s / 4;
      o += poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], sh(stone, .55));
      var bx = x + .16;
      for (var k = 0; k < 7 && bx < x + w - .3; k++) {
        var bw = .16 + ((k * 5 + s * 3) % 3) * .06;
        o += box(bx, y + d - .38, z, bw, .32, h / 4 * (.42 + ((k + s) % 3) * .12), jars[(k + s) % jars.length]);
        bx += bw + .08;
      }
    }
    return o;
  }
  /* a gothic rose window onto the lake */
  function rose(side, u, z, r, stone, water) {
    var p = side === 'r' ? P2(u, 0, z) : P2(0, u, z);
    var skew = side === 'r' ? 'matrix(1,0.5,0,1,0,0)' : 'matrix(1,-0.5,0,1,0,0)';
    var o = '<g transform="translate(' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + ') ' + skew + '">' +
      '<circle r="' + (r + 6) + '" fill="' + stone + '"/>' +
      '<circle r="' + r + '" fill="' + water + '"/>';
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      o += '<circle cx="' + (Math.cos(a) * r * .52).toFixed(1) + '" cy="' + (Math.sin(a) * r * .52).toFixed(1) +
           '" r="' + (r * .3).toFixed(1) + '" fill="none" stroke="' + stone + '" stroke-width="2.6"/>';
    }
    return o + '<circle r="' + (r * .26) + '" fill="none" stroke="' + stone + '" stroke-width="2.6"/>' +
      '<circle r="' + r + '" fill="none" stroke="' + stone + '" stroke-width="3.4"/></g>';
  }

  var SM = { wallL: '#6E6A60', wallR: '#5C594F', course: 'rgba(24,28,24,.34)',
             floor: '#4E4E46', floorLine: 'rgba(16,20,16,.5)', cap: '#8A8678' };

  var ROOMS = {
    /* ---------------- THE COMMON ROOM, UNDER THE LAKE ---------------- */
    saturn: function () {
      var o = shell(SM);
      /* the great mantelled fireplace, dead centre of the right wall */
      o += archOnWall('r', 5, 3.8, 0, 5.6, '#141A16', '#8A8678', 5);
      o += wall('r', 2.6, 7.4, 5.6, 6.4, '#7A776C');
      o += wall('r', 2.4, 7.6, 6.4, 6.9, '#8A8678');
      /* the house crest over the mantel */
      var cp = P2(5, 0, 7.6);
      o += '<g transform="translate(' + cp[0].toFixed(1) + ',' + cp[1].toFixed(1) + ') matrix(1,0.5,0,1,0,0)">' +
        '<path d="M-19 -22h38v26l-19 20-19-20z" fill="#1E4A32" stroke="#C3D2CC" stroke-width="2.4"/>' +
        '<path d="M-7 -6q10-8 14 2t-12 8q-6 3-4 8" fill="none" stroke="#C3D2CC" stroke-width="2.6" stroke-linecap="round"/></g>';
      /* green fire in a black grate */
      o += flames(5, .45, .1, 1.0, '#1E7A4A', '#3FC98A', '#D6F7E4');
      o += '<path d="M' + pt(3.6, .34, 0) + ' L' + pt(6.4, .34, 0) + ' L' + pt(6.4, .34, 1.6) +
           ' L' + pt(3.6, .34, 1.6) + ' Z" fill="none" stroke="#0E1512" stroke-width="2.8"/>';
      for (var g = 1; g < 8; g++)
        o += '<path d="M' + pt(3.6 + g * .35, .34, 0) + ' L' + pt(3.6 + g * .35, .34, 1.5) +
             '" stroke="#0E1512" stroke-width="2.2"/>';
      /* two gothic arches onto the lake, one per wall, with rose windows above */
      o += archOnWall('l', 3.0, 3.0, 0, 6.0, 'url(#slLake)', '#8A8678', 5);
      o += archOnWall('l', 7.6, 2.4, 0, 5.2, 'url(#slLake)', '#8A8678', 4.5);
      o += rose('l', 3.0, 7.2, 27, '#8A8678', 'url(#slLakePane)');
      o += rose('r', 8.4, 6.6, 22, '#8A8678', 'url(#slLakePane)');
      /* columns flanking the hearth */
      o += box(3.0, .1, 0, .5, .5, 6.2, '#7E7A6E');
      o += box(6.5, .1, 0, .5, .5, 6.2, '#7E7A6E');
      o += box(2.85, -.05, 6.2, .8, .8, .4, '#8E8A7C');
      o += box(6.35, -.05, 6.2, .8, .8, .4, '#8E8A7C');
      /* green velvet seating around a low table */
      o += rug(2.4, 2.6, 5.2, 4.2, '#25342A', '#6E8A7C');
      o += seat(2.6, 4.6, 1.5, 2.4, '#2E5A40');
      o += seat(6.0, 4.6, 1.5, 2.4, '#2E5A40');
      o += table(4.1, 5.0, 1.7, 1.6, .6, '#3A4A42', '#26302A');
      o += box(4.5, 5.4, .77, .5, .4, .1, '#D8CBA8');
      /* a silver-footed serving table with a lamp */
      o += table(1.2, 1.6, 1.5, 1.5, .9, '#B8BEB6', '#7E867E');
      o += box(1.6, 2.0, 1.06, .3, .3, .5, '#C3D2CC');
      var lp = P2(1.75, 2.15, 1.7);
      o += '<circle cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" r="24" fill="#9CF0CC" opacity=".2"/>' +
           '<circle cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" r="8" fill="#DCF6EA"/>';
      /* the alchemy desk, front right */
      o += table(7.4, 6.2, 2.0, 1.5, 1.0, '#3E4A42', '#26302A');
      o += box(7.7, 6.5, 1.16, .28, .28, .5, '#7ED0A8');
      o += box(8.2, 6.6, 1.16, .22, .22, .38, '#C3D2CC');
      o += box(8.6, 6.4, 1.16, .5, .4, .1, '#D8CBA8');
      return o;
    },

    /* ---------------- DORMITORIES ---------------- */
    earth: function () {
      var m = { wallL: '#5E5B52', wallR: '#4E4C44', course: 'rgba(20,24,20,.34)',
                floor: '#43433C', floorLine: 'rgba(12,16,12,.5)', cap: '#7A7770' };
      var o = shell(m);
      o += archOnWall('l', 3.2, 2.6, 0, 5.6, 'url(#slLake)', '#7A7770', 4.5);
      o += rose('l', 3.2, 7.0, 24, '#7A7770', 'url(#slLakePane)');
      var bx = 5.2, by = .4;
      [[0, 0], [3.4, 0], [0, 2.6], [3.4, 2.6]].forEach(function (c) {
        o += box(bx + c[0], by + c[1], 0, .3, .3, 6.0, '#2A322C');
      });
      o += box(bx, by, 0, 3.7, 2.9, 1.0, '#3A423A');
      o += box(bx + .1, by + .1, 1.0, 3.5, 2.7, .34, '#CFD6CC');
      o += box(bx + .1, by + .9, 1.34, 3.5, 1.9, .16, '#1E4A32');
      o += box(bx + .25, by + .2, 1.34, 1.2, .6, .22, '#E4EAE0');
      o += box(bx, by, 6.0, 3.7, 2.9, .28, '#2A322C');
      o += poly([[bx, by, 0], [bx, by, 6.0], [bx + .1, by + 2.9, 6.0], [bx + .1, by + 2.9, 0]], '#1E4A32', ' opacity=".92"');
      o += poly([[bx + 3.6, by, 0], [bx + 3.6, by, 6.0], [bx + 3.7, by + 2.9, 6.0], [bx + 3.7, by + 2.9, 0]], '#173A28', ' opacity=".88"');
      o += box(2.8, 5.8, 0, 1.9, 1.0, .9, '#3A423A');
      o += box(2.8, 5.8, .9, 1.9, 1.0, .18, '#4E5A4E');
      o += table(1.2, 2.4, 1.2, 1.1, 1.0, '#B8BEB6', '#7E867E');
      o += rug(2.2, 3.4, 2.4, 2.2, '#25342A', '#6E8A7C');
      return o;
    },

    /* ---------------- LIBRARY ---------------- */
    mars: function () {
      var m = { wallL: '#5A584E', wallR: '#4A4840', course: 'rgba(18,22,18,.34)',
                floor: '#42423A', floorLine: 'rgba(12,16,12,.5)', cap: '#78766A' };
      var o = shell(m);
      var jars = ['#2E5A40', '#3E4A6A', '#5A4A2E', '#4A2E3E', '#2E4A4A'];
      for (var i = 0; i < 3; i++) o += shelfUnit(.3 + i * 3.1, .15, 2.6, .85, 6.2, '#3A3A32', jars);
      for (var j = 0; j < 3; j++) o += shelfUnit(.15, .4 + j * 3.1, .85, 2.6, 6.2, '#34342E', jars);
      var l0 = P2(6.6, .95, 0), l1 = P2(5.4, .95, 6.0);
      o += '<g stroke="#7E867E" stroke-width="5" stroke-linecap="round">' +
        '<path d="M' + l0[0].toFixed(1) + ' ' + l0[1].toFixed(1) + ' L' + l1[0].toFixed(1) + ' ' + l1[1].toFixed(1) + '"/>' +
        '<path d="M' + (l0[0] + 22).toFixed(1) + ' ' + (l0[1] + 11).toFixed(1) + ' L' +
          (l1[0] + 22).toFixed(1) + ' ' + (l1[1] + 11).toFixed(1) + '"/></g>';
      for (var r = 1; r < 6; r++) {
        var t = r / 6, ax = l0[0] + (l1[0] - l0[0]) * t, ay = l0[1] + (l1[1] - l0[1]) * t;
        o += '<path d="M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' l22 11" stroke="#6E766E" stroke-width="3.4"/>';
      }
      o += table(4.2, 5.2, 3.0, 1.8, 1.0, '#3E4A42', '#26302A');
      o += box(4.6, 5.6, 1.16, .9, .7, .1, '#D8CBA8');
      o += box(6.2, 5.5, 1.16, .3, .3, .5, '#C3D2CC');
      var lp = P2(6.35, 5.65, 1.72);
      o += '<circle cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" r="30" fill="#9CF0CC" opacity=".18"/>' +
           '<circle cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" r="7" fill="#DCF6EA"/>';
      o += seat(4.8, 7.0, 1.3, 1.2, '#2E5A40');
      o += rug(3.6, 4.8, 4, 3.4, '#25342A', '#6E8A7C');
      return o;
    },

    /* ---------------- GREAT HALL ---------------- */
    ceres: function () {
      var m = { wallL: '#66625A', wallR: '#56534B', course: 'rgba(20,24,20,.3)',
                floor: '#5A5A50', floorLine: 'rgba(18,22,16,.46)', cap: '#8E8A7C' };
      var o = shell(m);
      o += archOnWall('r', 2.6, 2.4, 3.0, 8.0, 'url(#slLake)', '#8E8A7C', 4);
      o += archOnWall('r', 7.4, 2.4, 3.0, 8.0, 'url(#slLake)', '#8E8A7C', 4);
      o += archOnWall('l', 5, 2.4, 3.0, 8.0, 'url(#slLake)', '#8E8A7C', 4);
      o += rose('l', 2.0, 6.6, 20, '#8E8A7C', 'url(#slLakePane)');
      o += rose('l', 8.2, 6.6, 20, '#8E8A7C', 'url(#slLakePane)');
      for (var c = 0; c < 7; c++) {
        var cp = P2(1.4 + c * 1.2, 1.2 + (c % 3) * 2.6, 7.0 + (c % 4) * .5);
        o += '<g transform="translate(' + cp[0].toFixed(1) + ',' + cp[1].toFixed(1) + ')">' +
          '<circle r="16" fill="#7ED0A8" opacity=".16"/>' +
          '<rect x="-2.4" y="-10" width="4.8" height="14" rx="1.6" fill="#D6DED4"/>' +
          '<g class="sl-candle"><ellipse cy="-13" rx="2.4" ry="4.4" fill="#CFF6E2"/></g></g>';
      }
      for (var t = 0; t < 2; t++) {
        var ty = 2.6 + t * 3.2;
        o += table(1.2, ty, 7.4, 1.5, 1.0, '#3E4A42', '#26302A');
        o += box(1.2, ty - .8, 0, 7.4, .55, .55, '#36423A');
        o += box(1.2, ty + 1.6, 0, 7.4, .55, .55, '#36423A');
        for (var gg = 0; gg < 5; gg++) {
          o += box(1.9 + gg * 1.4, ty + .5, 1.16, .22, .22, .4, '#C3D2CC');
          o += box(2.5 + gg * 1.4, ty + .8, 1.16, .34, .34, .12, '#D8CBA8');
        }
      }
      return o;
    },

    /* ---------------- QUIDDITCH PRACTICE ---------------- */
    venus: function () {
      var m = { wallL: '#4E4C44', wallR: '#42403A', course: 'rgba(16,20,16,.32)',
                floor: '#43433C', floorLine: 'rgba(12,16,12,.48)', cap: '#78766A' };
      var o = shell(m);
      o += archOnWall('r', 6.4, 5.2, 0, 7.4, 'url(#slPitch)', '#78766A', 5);
      var gp = P2(6.4, 0, 3.4);
      o += '<g transform="translate(' + gp[0].toFixed(1) + ',' + gp[1].toFixed(1) + ')" ' +
        'stroke="#C3D2CC" stroke-width="4" fill="none" opacity=".9">' +
        '<path d="M-56 34V6"/><circle cx="-56" cy="-6" r="13"/>' +
        '<path d="M0 38V-4"/><circle cy="-18" r="17"/>' +
        '<path d="M54 34V10"/><circle cx="54" cy="0" r="11"/></g>';
      for (var i = 0; i < 4; i++) {
        o += box(.2, .5 + i * 2.2, 0, 1.1, 2.0, 5.0, '#36423A');
        o += poly([[1.3, .6 + i * 2.2, .4], [1.3, 2.4 + i * 2.2, .4], [1.3, 2.4 + i * 2.2, 4.6], [1.3, .6 + i * 2.2, 4.6]], '#1A231D');
        var hp = P2(1.3, 2.2 + i * 2.2, 2.4);
        o += '<circle cx="' + hp[0].toFixed(1) + '" cy="' + hp[1].toFixed(1) + '" r="3.4" fill="#C3D2CC"/>';
      }
      o += box(3.4, .3, 0, .26, 1.8, 4.4, '#2A322C');
      for (var b = 0; b < 2; b++) {
        var s0 = P2(3.7 + b * .5, 1.0, 0), s1 = P2(3.4 + b * .5, .5, 4.2);
        o += '<path d="M' + s0[0].toFixed(1) + ' ' + s0[1].toFixed(1) + ' L' + s1[0].toFixed(1) + ' ' + s1[1].toFixed(1) +
             '" stroke="#6E766E" stroke-width="6" stroke-linecap="round"/>';
        o += '<path d="M' + (s0[0] - 8).toFixed(1) + ' ' + (s0[1] - 4).toFixed(1) +
             ' q9 22 18 0 q-3 20 -9 24 q-6 -4 -9 -24z" fill="#9EA89E" opacity=".9"/>';
      }
      o += box(2.2, 5.4, 0, 4.4, .9, .55, '#36423A');
      o += box(2.2, 5.4, .55, 4.4, .9, .14, '#4A564A');
      o += box(3.0, 6.8, 0, .5, .8, .5, '#26302A');
      o += box(5.6, 6.6, 0, .8, .8, .5, '#1E4A32');
      return o;
    },

    /* ---------------- SNAPE'S OFFICE ---------------- */
    deimos: function () {
      var m = { wallL: '#44443E', wallR: '#3A3A34', course: 'rgba(12,16,12,.4)',
                floor: '#3A3A34', floorLine: 'rgba(8,12,8,.55)', cap: '#6A6A60' };
      var o = shell(m);
      /* walls of specimen jars — the coldest room in the castle */
      var jars = ['#3E5A4A', '#4A4A3E', '#3A4A5A', '#5A4A4A', '#2E4A42'];
      for (var i = 0; i < 3; i++) o += shelfUnit(.25 + i * 3.2, .12, 2.8, .8, 6.6, '#2E322C', jars);
      o += shelfUnit(.12, 3.4, .8, 3.0, 6.6, '#2E322C', jars);
      /* the cauldron, with something green in it */
      o += box(2.6, 4.6, 0, 1.5, 1.5, .3, '#22261F');
      o += box(2.75, 4.75, .3, 1.2, 1.2, .95, '#1C201A');
      o += poly([[2.85, 4.85, 1.25], [3.85, 4.85, 1.25], [3.85, 5.85, 1.25], [2.85, 5.85, 1.25]], '#4FE0A0', ' opacity=".85"');
      var vp = P2(3.35, 5.35, 1.3);
      o += '<ellipse cx="' + vp[0].toFixed(1) + '" cy="' + vp[1].toFixed(1) + '" rx="44" ry="20" fill="#4FE0A0" opacity=".2"/>';
      o += '<g class="sl-candle" opacity=".8"><path d="M' + vp[0].toFixed(1) + ' ' + (vp[1] - 8).toFixed(1) +
           ' q-12 -22 2 -34 q10 16 -2 34z" fill="#7EECBE" opacity=".55"/></g>';
      /* the desk, a hard chair, a ledger of deductions */
      o += table(5.6, 4.4, 3.0, 1.9, 1.15, '#2E322C', '#1E221C');
      o += box(6.0, 4.8, 1.31, 1.2, .9, .12, '#D8CBA8');
      o += box(7.6, 4.8, 1.31, .4, .4, .2, '#141814');
      o += seat(6.2, 2.8, 1.4, 1.2, '#22322A');
      o += box(6.2, 2.8, .5, 1.4, .24, 2.6, '#1C281F');
      o += rug(5.0, 5.0, 3.2, 2.8, '#20302A', '#5E7A6E');
      return o;
    },

    /* ---------------- ASTRONOMY TOWER ---------------- */
    europa: function () {
      var m = { wallL: '#4A5058', wallR: '#3E444C', course: 'rgba(10,14,20,.42)',
                floor: '#454B50', floorLine: 'rgba(8,12,18,.52)', cap: '#7A8290' };
      var o = shell(m);
      o += archOnWall('r', 5, 5.4, 1.4, 8.2, 'url(#slNight)', '#7A8290', 5);
      o += archOnWall('l', 5, 5.4, 1.4, 8.2, 'url(#slNight)', '#7A8290', 5);
      for (var s = 0; s < 22; s++) {
        var u = 2.6 + (s % 11) * .44, z = 2.2 + ((s * 7) % 11) * .5;
        var sp = (s % 2) ? P2(u, 0, z) : P2(0, u, z);
        o += '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="' +
             (0.9 + (s % 3) * .5).toFixed(1) + '" fill="#DCEAF2" opacity="' + (.35 + (s % 4) * .15).toFixed(2) + '"/>';
      }
      var mp = P2(3.2, 0, 6.2);
      o += '<circle cx="' + mp[0].toFixed(1) + '" cy="' + mp[1].toFixed(1) + '" r="20" fill="#DCE8EE" opacity=".9"/>';
      var tb = P2(3.0, 3.0, 0), tt = P2(3.0, 3.0, 2.0);
      o += '<g stroke="#7E867E" stroke-width="5.5" stroke-linecap="round">' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + (tb[0] - 26).toFixed(1) + ' ' + (tb[1] + 6).toFixed(1) + '"/>' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + (tb[0] + 26).toFixed(1) + ' ' + (tb[1] + 6).toFixed(1) + '"/>' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + tb[0].toFixed(1) + ' ' + (tb[1] + 12).toFixed(1) + '"/></g>';
      o += '<g transform="translate(' + tt[0].toFixed(1) + ',' + tt[1].toFixed(1) + ') rotate(-32)">' +
        '<rect x="-13" y="-92" width="27" height="104" rx="11" fill="#AEB8B2"/>' +
        '<rect x="-17" y="-104" width="35" height="22" rx="6" fill="#DCE4DE"/></g>';
      o += table(6.0, 5.2, 2.6, 1.8, 1.0, '#3E4A46', '#26302A');
      o += box(6.3, 5.5, 1.16, 1.9, 1.2, .06, '#D8CBA8');
      o += box(7.9, 5.4, 1.16, .3, .3, .34, '#C3D2CC');
      o += rug(4.4, 5.0, 3.0, 2.6, '#22303A', '#6E8A96');
      return o;
    }
  };

  /* ---- the other rooms, as archways standing around this one ----------- */
  var DOOR_ART = {
    saturn: '<svg viewBox="0 0 40 46"><path d="M8 44V20a12 12 0 0 1 24 0v24z" fill="#1E4A32" stroke="#C3D2CC" stroke-width="2"/>' +
            '<path d="M14 30q8-7 12 2t-9 6" fill="none" stroke="#C3D2CC" stroke-width="2"/></svg>',
    earth:  '<svg viewBox="0 0 40 46"><path d="M5 44V14h30v30" fill="#2A322C" stroke="#C3D2CC" stroke-width="2"/>' +
            '<rect x="9" y="26" width="22" height="18" rx="2" fill="#1E4A32"/>' +
            '<rect x="11" y="20" width="11" height="6" rx="3" fill="#D6DED4"/></svg>',
    mars:   '<svg viewBox="0 0 40 46"><rect x="5" y="7" width="30" height="37" rx="2" fill="#22261F" stroke="#7E867E" stroke-width="2"/>' +
            '<g fill="#3E5A4A"><rect x="8" y="11" width="5" height="12"/><rect x="14" y="10" width="4" height="13"/></g>' +
            '<g fill="#3A4A5A"><rect x="19" y="12" width="5" height="11"/><rect x="25" y="10" width="6" height="13"/></g>' +
            '<path d="M6 24h28" stroke="#7E867E" stroke-width="2.4"/>' +
            '<g fill="#5A4A4A"><rect x="9" y="28" width="5" height="11"/><rect x="15" y="27" width="4" height="12"/></g></svg>',
    ceres:  '<svg viewBox="0 0 40 46"><path d="M8 44V18a12 12 0 0 1 24 0v26z" fill="#1A3A4A" stroke="#C3D2CC" stroke-width="2"/>' +
            '<path d="M20 8v36M8 30h24" stroke="#C3D2CC" stroke-width="1.6"/></svg>',
    venus:  '<svg viewBox="0 0 40 46"><path d="M23 6 27 36" stroke="#6E766E" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M21 34q8 14 16 2-4 8-8 8t-8-10z" fill="#9EA89E"/>' +
            '<circle cx="11" cy="18" r="7" fill="none" stroke="#C3D2CC" stroke-width="2"/>' +
            '<path d="M11 25v10" stroke="#C3D2CC" stroke-width="2"/></svg>',
    deimos: '<svg viewBox="0 0 40 46"><path d="M12 20h16v6l4 12H8l4-12z" fill="#1C201A" stroke="#C3D2CC" stroke-width="2"/>' +
            '<path d="M13 24h14" stroke="#4FE0A0" stroke-width="3"/>' +
            '<path d="M20 18q-5-7 1-12" fill="none" stroke="#7EECBE" stroke-width="2"/></svg>',
    europa: '<svg viewBox="0 0 40 46"><path d="M10 42 30 14" stroke="#AEB8B2" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M28 8 36 16 32 20 24 12z" fill="#DCE4DE"/>' +
            '<circle cx="12" cy="14" r="1.6" fill="#DCEAF2"/><circle cx="21" cy="8" r="1.2" fill="#DCEAF2"/></svg>'
  };

  var RIM = [[13, 8], [87, 8], [11, 27], [89, 27], [20, 89], [80, 89]];
  var ORDER = ['saturn', 'earth', 'mars', 'ceres', 'venus', 'deimos', 'europa'];
  var DOOR_SPOTS = {};
  ORDER.forEach(function (here) {
    var o = {};
    ORDER.filter(function (x) { return x !== here; }).forEach(function (id, i) { o[id] = RIM[i % 6]; });
    DOOR_SPOTS[here] = o;
  });

  /* what the plaques are fixed to, room by room */
  var BOARDS = {
    saturn: { surface: 'stone', title: 'Struck into the wall' },
    earth:  { surface: 'velvet', title: 'Above the beds' },
    mars:   { surface: 'ledger', title: 'The register' },
    ceres:  { surface: 'marble', title: 'Along the table' },
    venus:  { surface: 'stone',  title: 'The team sheet' },
    deimos: { surface: 'pitch',  title: "Entered in Snape's ledger" },
    europa: { surface: 'chart',  title: 'On the chart table' }
  };

  /* ----------------------------------------------------------------------
     RENDERED ART
     A room can be a real render instead of drawn vectors. Put a square image
     in art/ and name it here; the SVG below stays as the fallback for rooms
     that have not been rendered yet, so the two can coexist while the set is
     filled in one room at a time.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     PANORAMAS — the rooms you stand inside.
     One equirectangular render per room. `start` is where you are facing when
     you arrive, `board` is the bearing of the wall the deeds hang on, and the
     doorways spread themselves around unless a room names bearings for them.
     ---------------------------------------------------------------------- */
  /* ----------------------------------------------------------------------
     THE ROOM, AS A RENDER
     Jade's diorama at full resolution. u/v are fractions of the image, so a
     pin stays on the same flagstone however far in the camera is.
     ---------------------------------------------------------------------- */
  var DIORAMA = {
    saturn: {
      src: 'art/slytherin-common-room-wide.webp',
      home:  { u: 0.500, v: 0.455, z: 1.06 },
      board: { u: 0.756, v: 0.615, z: 3.0 },
      pins: {
        earth:  { u: 0.235, v: 0.500 },   /* the left arch onto the lake  */
        mars:   { u: 0.766, v: 0.500 },   /* the right arch               */
        ceres:  { u: 0.500, v: 0.432 },   /* the crest above the hearth   */
        venus:  { u: 0.232, v: 0.300 },   /* the left rose window         */
        deimos: { u: 0.500, v: 0.688 },   /* the lectern, and the skull   */
        europa: { u: 0.766, v: 0.296 }    /* the right rose window        */
      },
      notes: [
        { u: 0.492, v: 0.556, text: 'the green fire' },
        { u: 0.235, v: 0.632, text: 'the good table' }
      ]
    }
  };

  var PANORAMA = {
    saturn: {
      src: 'art/slytherin-common-room-pano.webp',
      start: { yaw: 0, pitch: -4 },
      board: { yaw: 0, pitch: -3 }
    }
  };

  var BOARD_ART = '<svg viewBox="0 0 40 44"><rect x="5" y="8" width="30" height="24" rx="1" fill="#B8C0BC" stroke="#5A6460" stroke-width="2.5"/>' + '<rect x="9" y="12" width="22" height="2.4" fill="#4A5450"/><rect x="9" y="18" width="16" height="2.4" fill="#4A5450"/>' + '<rect x="9" y="24" width="19" height="2.4" fill="#4A5450"/>' + '<circle cx="8" cy="11" r="1.5" fill="#EDF2EF"/><circle cx="32" cy="11" r="1.5" fill="#EDF2EF"/></svg>';

  var ART = {
    saturn: 'art/slytherin-common-room.webp'
  };

  ORIGIN_THEMES.define({
    id: 'slytherin',
    name: 'Slytherin',
    tagline: 'Cunning · Ambition · Pride',

    tokens: {
      void: '#0B120F', deep: '#121A16',
      surface: 'rgba(24,36,30,0.86)', 'surface-2': 'rgba(216,203,168,0.06)',
      'surface-hover': 'rgba(216,203,168,0.10)', raised: '#16211C', toast: '#16211C',
      overlay: 'rgba(4,9,7,.86)', track: 'rgba(0,0,0,.5)', input: 'rgba(6,12,10,0.66)',
      scroll: '#2A4237', shadow: 'rgba(2,8,6,.8)',
      line: 'rgba(195,210,204,0.26)', 'line-soft': 'rgba(195,210,204,0.13)',
      'line-hard': 'rgba(230,240,235,0.52)',
      txt: '#EAF0EC', 'txt-2': '#B8C6BE', 'txt-3': '#8FA096', 'on-accent': '#0A1410',
      accent: '#1B6B45', 'accent-hi': '#4FE0A0', 'accent-dim': '#0F3D28',
      'accent-wash': 'rgba(27,107,69,0.26)',
      gold: '#C9AF8E', warn: '#C9AF8E', danger: '#E0616F', ok: '#4FE0A0', info: '#7ED0A8',
      milestone: '#D9C3A2', penalty: '#E0616F',
      'focus-work': '#1B6B45', 'focus-break': '#7ED0A8', 'focus-long': '#C9AF8E',

      'f-display': "'Great Vibes',cursive", 'f-body': "'Cormorant Garamond',Georgia,serif",
      'f-mono': "'Cormorant Garamond',Georgia,serif",
      'f-display-scale': '1.62', 'f-ui-scale': '1.1',
      'tt-display': 'none', 'ls-display': '.005em',
      'f-label': "'Cormorant Garamond',Georgia,serif", 'tt-label': 'uppercase', 'ls-label': '.14em',

      radius: '2px', 'radius-lg': '3px', 'chip-radius': '2px', 'border-w': '1px',
      'panel-clip': 'none', 'card-clip': 'none'
    },

    fonts: {
      display: 'Great Vibes', body: 'Cormorant Garamond', mono: 'Cormorant Garamond',
      googleHref: 'https://fonts.googleapis.com/css2?family=Great+Vibes' +
                  '&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
    },

    /* Scarlet is the room and gold is the metal, so neither operator may be
       either. Copper and verdigris — the two things on the mantelpiece that
       tarnish. */
    ops: { a: '#E8A0B4', b: '#D9C3A2' },

    copy: {
      places: { deimos: "Snape's Office" },
      chart: 'Common Room', tasks: 'Classrooms', focus: 'Time-Turner',
      market: 'Hogsmeade', wagers: 'Quidditch Pitch', log: "Headmaster's Office",
      chartFn: 'Where house points come from', tasksFn: 'To-do list & assignments',
      focusFn: 'Focus timers', marketFn: 'Rewards', wagersFn: 'Wagers',
      logFn: 'Logs & transcripts',
      score: 'House Points', scoreVerb: 'Record', scoreVerbPast: 'Recorded', scored: 'recorded',
      item: 'Ambition', items: 'Ambitions', group: 'Room', groups: 'Rooms',
      person: 'Student', people: 'Students',
      typeRitual: 'Discipline', typeGoal: 'Design', typeMilestone: 'Ascent', typePenalty: 'Censure',
      typeRitualHint: 'kept every day', typeGoalHint: 'a challenge you return to',
      typeMilestoneHint: 'a great deed, once', typePenaltyHint: 'points docked',
      cadDaily: 'every day', cadWeekly: 'every week', cadOnce: 'once only',
      brand: 'Slytherin House', season: 'Term', rank: 'Standing',
      emptyGroup: 'This room holds nothing. Set an ambition in it.',
      emptyTasks: 'Nothing entered. One writes it down or one forgets it.',
      emptyLog: 'The record is empty.',
      emptyMarket: 'Nothing is currently on offer.',
      emptyWagers: 'No wagers standing. Predictable.',
      emptyFeed: 'Nothing recorded today.',
      toastAwarded: '{what} — recorded to {who}',
      toastReverted: 'Struck from the record · {what}',
      toastNothingToUndo: 'There is nothing there to strike.',
      toastLocked: 'requires {item}'
    },

    icons: Object.assign({}, B, {
      chart:  I('<path d="M3.4 9.6 12 4.2l8.6 5.4"/><path d="M5.4 11v8.4h13.2V11"/><path d="M9.6 19.4v-5.2h4.8v5.2"/>'),
      tasks:  I('<path d="M6.4 3.8h11.2v16.4H6.4Z"/><path d="M9.2 8h5.6M9.2 11.6h5.6M9.2 15.2h3.4"/>'),
      focus:  I('<path d="M8.4 3.6h7.2M8.4 20.4h7.2"/><path d="M15.6 3.6c0 3.6-3.6 5.2-3.6 8.4s3.6 4.8 3.6 8.4"/>' +
                '<path d="M8.4 3.6c0 3.6 3.6 5.2 3.6 8.4s-3.6 4.8-3.6 8.4"/>'),
      market: I('<path d="M4.6 8.8h14.8l-1 9.4a1.6 1.6 0 0 1-1.6 1.4H7.2a1.6 1.6 0 0 1-1.6-1.4Z"/>' +
                '<path d="M8.8 8.8V7a3.2 3.2 0 0 1 6.4 0v1.8"/><path d="M4.6 8.8 12 4.4l7.4 4.4"/>'),
      wagers: I('<path d="M4.4 4.4h3.2l9 11.2h3M20 4.4h-3.2l-9 11.2h-3"/><path d="M17.6 13.6 20 16l-2.4 2.4M6.4 13.6 4 16l2.4 2.4"/>'),
      log:    I('<path d="M5.6 4.4h9.2l4 4v11.2H5.6Z"/><path d="M14.8 4.4v4h4"/><path d="M8.6 12.4h6.8M8.6 15.8h4.4"/>'),
      claim:  I('<path d="M4.8 12.4 9.6 17.2 19.2 6.8"/>'),
      lock:   I('<path d="M5.6 10.6h12.8v9H5.6Z"/><path d="M8.4 10.6V7.8a3.6 3.6 0 0 1 7.2 0v2.8"/><path d="M12 14v2.4"/>'),
      streak: F('<path d="M13.2 3.2c.5 3.1-1.1 4.8-2.7 6.2-1.7 1.5-3.1 2.9-3.1 5.3A5.6 5.6 0 0 0 13 20.4' +
                'c3.1 0 5.6-2.4 5.6-5.6 0-4.8-3.7-6.7-5.4-11.6Z"/>'),
      crest:  I('<path d="M12 3.4c3.5 0 6.2 2.3 6.2 5.4 0 1.7-.8 2.9-1.7 3.8 1 1 1.7 2.2 1.7 3.7 0 3.1-2.8 5.5-6.2 5.5' +
                's-6.2-2.4-6.2-5.5c0-1.5.7-2.7 1.7-3.7-.9-.9-1.7-2.1-1.7-3.8C5.8 5.7 8.5 3.4 12 3.4Z"/>' +
                '<path d="M9.4 9.4h.02M14.6 9.4h.02"/><path d="M10 15.4c.7.9 1.3 1.3 2 1.3s1.3-.4 2-1.3"/>' +
                '<path d="M5.8 8.2 3.2 6.4M18.2 8.2l2.6-1.8M6.4 13.4 3.6 13M17.6 13.4l2.8-.4"/>'),
      lead:   F('<path d="M12 2.8 14.3 9h6.5l-5.3 4 2 6.4L12 15.6l-5.5 3.8 2-6.4-5.3-4h6.5Z"/>'),
      score:  F('<path d="M12 3 15.6 8.4 21.6 10.2 17.6 15 18 21 12 18.6 6 21l.4-6L2.4 10.2 8.4 8.4Z"/>'),
      markRitual:    F('<circle cx="12" cy="12" r="5.8"/>'),
      markMilestone: F('<path d="M12 2.8 14.3 9h6.5l-5.3 4 2 6.4L12 15.6l-5.5 3.8 2-6.4-5.3-4h6.5Z"/>'),
      markPenalty:   F('<path d="M12 4.6c3.3 3.1 5 5.6 5 8.3a5 5 0 0 1-10 0c0-2.7 1.7-5.2 5-8.3Z"/>')
    }),

    ranks: {
      span: 15000,
      tiers: [{ n: 'First Year', c: '#8FA096' }, { n: 'Serpent', c: '#B8C6BE' },
              { n: 'Strategist', c: '#C9AF8E' }, { n: 'Duellist', c: '#4FE0A0' },
              { n: 'Ascendant', c: '#7ED0A8' }, { n: 'Prefect', c: '#D9C3A2' },
              { n: 'Heir', c: '#E6F0EB' }, { n: 'Head of House', c: '#FFFFFF' }],
      cycles: ['', ' the Second', ' the Third', ' the Fourth', ' the Fifth',
               ' the Sixth', ' the Seventh', ' the Eighth']
    },

    motion: { ease: 'cubic-bezier(.34,.68,.3,1)', dur: '.26s', enter: '.34s', hover: 'translateY(-2px)' },
    sound: {
      up:    { type: 'triangle', gain: 0.13, seq: [[392, 0], [523, .09], [659, .18]] },
      down:  { type: 'triangle', gain: 0.13, seq: [[349, 0], [262, .11]] },
      phase: { type: 'triangle', gain: 0.12, seq: [[440, 0], [523, .12], [659, .24]] }
    },
    confetti: ['#1B6B45', '#C9AF8E', '#E6F0EB'],
    themeColor: '#0B120F',
    favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230B120F'/%3E%3Cpath d='M18 20c0-6 5-10 11-10 8 0 13 6 13 13 0 9-13 11-13 19 0 4 4 6 8 6' stroke='%23C9AF8E' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E",

    texture:
      'radial-gradient(ellipse 120% 40% at 50% -10%, rgba(46,168,116,0.26), transparent 66%),' +
      'radial-gradient(ellipse 70% 40% at 12% 40%, rgba(16,60,46,0.4), transparent 66%),' +
      'radial-gradient(ellipse 76% 50% at 92% 84%, rgba(8,36,28,0.5), transparent 70%),' +
      'linear-gradient(#10201A,#0B120F 56%,#060C0A)',

    css: [
      /* ---------- no glass anywhere in this house ---------- */
      '.panel{backdrop-filter:none !important;-webkit-backdrop-filter:none !important;',
      '  background-image:linear-gradient(168deg,rgba(255,214,160,.07),transparent 62%);',
      '  box-shadow:0 12px 30px var(--shadow);border-color:var(--line);}',
      '.panel::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;pointer-events:none;',
      '  background:linear-gradient(90deg,transparent,var(--line-hard) 16%,var(--line-hard) 84%,transparent);}',
      '#nav,.pal,.modal,.toast{backdrop-filter:none !important;-webkit-backdrop-filter:none !important;}',
      '#nav{background:linear-gradient(180deg,#1E2C26,#101A16);border:1px solid var(--line);',
      '  box-shadow:0 6px 18px rgba(0,0,0,.45);}',
      'body{font-size:15px;}',
      '.brand-title{font-size:2.6em;line-height:1;}',
      '.creed{font-family:var(--f-body);font-size:.9em;color:var(--gold);opacity:.9;',
      '  text-transform:uppercase;letter-spacing:.2em;}',

      /* buttons: worn, rounded, warm on hover */
      '.btn{border-radius:var(--chip-radius);padding:7px 16px;font-weight:600;}',
      '.btn.sm{border-radius:14px;padding:4px 12px;}',
      '.btn.icon{border-radius:50%;}',
      '.btn:hover:not(:disabled){background:var(--accent-wash);border-color:var(--line-hard);color:var(--gold);}',
      '.nav-btn{border-radius:var(--chip-radius);font-weight:600;}',
      '.nav-btn.on,.btn.pri{background:var(--accent);color:#FFF3E0;}',
      '.nav-btn.on{box-shadow:0 2px 14px -5px var(--accent);}',
      '.btn.on{color:var(--gold);border-color:var(--gold);background:var(--accent-wash);}',
      '.brand-glyph{border-radius:50%;background:radial-gradient(circle at 34% 28%,#E8EEEB,#7E8E86);',
      '  color:#0A1410;box-shadow:0 2px 10px rgba(0,0,0,.6),inset 0 -2px 6px rgba(30,50,42,.6);}',
      '.gate-glyph{border-radius:50%;background:radial-gradient(circle at 34% 28%,#E8EEEB,#7E8E86);}',

      /* ================= THE ROOM ================= */
      '.sl-room{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.04fr);gap:18px;',
      '  align-items:start;}',
      '.sl-stage{position:sticky;top:14px;aspect-ratio:1/1;border-radius:8px;overflow:hidden;',
      '  background:radial-gradient(ellipse 74% 62% at 50% 44%,#1E2C26,#070D0B 78%);',
      '  box-shadow:0 26px 60px -22px rgba(0,0,0,.9),inset 0 0 80px rgba(0,0,0,.6);}',
      '.sl-stage svg{display:block;width:100%;height:100%;}',
      '.sl-doors{position:absolute;inset:0;}',
      '.sl-render{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.1);}',
      '.sl-stage.rendered::after{content:"";position:absolute;inset:0;pointer-events:none;',
      '  background:radial-gradient(ellipse 76% 76% at 50% 48%,transparent 52%,rgba(0,0,0,.55) 100%);}',

      '.sl-door{position:absolute;transform:translate(-50%,-50%);background:none;border:0;padding:4px;',
      '  display:flex;flex-direction:column;align-items:center;gap:1px;width:92px;',
      '  transition:transform .22s var(--ease),filter .22s var(--ease);}',
      '.sl-door svg{width:36px;height:41px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.85));}',
      '.sl-door .lbl{font-family:var(--f-body);font-size:12.5px;font-weight:600;line-height:1.15;',
      '  text-transform:uppercase;letter-spacing:.1em;color:#DCE8E2;',
      '  text-shadow:0 1px 3px #000,0 0 12px rgba(0,0,0,.95);}',
      '.sl-door .n{font-family:var(--f-body);font-size:11px;color:var(--gold);opacity:.9;',
      '  text-shadow:0 1px 3px #000;}',
      '.sl-door:hover,.sl-door:focus-visible{transform:translate(-50%,-50%) scale(1.14);',
      '  filter:brightness(1.35);outline:none;}',
      '.sl-door:focus-visible .lbl{text-decoration:underline;}',

      /* the board, mounted on the wall of the room */
      '.sl-board{position:relative;padding:15px 17px 17px;display:flex;flex-direction:column;',
      '  border:9px solid #4A5250;border-radius:3px;',
      '  box-shadow:0 18px 40px rgba(0,0,0,.62),inset 0 0 46px rgba(0,0,0,.42),',
      '   0 0 0 2px rgba(255,220,160,.2);}',
      '.sl-board.stone{background:#3A403A;background-image:',
      '  repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 34px),',
      '  repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 1px,transparent 1px 58px),',
      '  linear-gradient(160deg,#474E46,#282E29);}',
      '.sl-board.velvet{background:#16321F;background-image:',
      '  repeating-linear-gradient(42deg,rgba(180,220,200,.05) 0 2px,transparent 2px 5px),',
      '  linear-gradient(160deg,#1E4A2E,#0E2418);}',
      '.sl-board.ledger{background:#3E3A2E;background-image:',
      '  repeating-linear-gradient(0deg,rgba(216,203,168,.1) 0 1px,transparent 1px 20px),',
      '  linear-gradient(160deg,#4A4436,#252118);}',
      '.sl-board.marble{background:#4A4E48;background-image:',
      '  linear-gradient(122deg,rgba(255,255,255,.07) 0 2px,transparent 2px 22px),',
      '  linear-gradient(160deg,#565C54,#30352F);}',
      '.sl-board.pitch{background:#1A201B;background-image:',
      '  repeating-linear-gradient(24deg,rgba(79,224,160,.05) 0 1px,transparent 1px 9px),',
      '  linear-gradient(160deg,#232B23,#0E120F);}',
      '.sl-board.chart{background:#2E3A3E;background-image:',
      '  repeating-linear-gradient(0deg,rgba(216,232,238,.08) 0 1px,transparent 1px 18px),',
      '  repeating-linear-gradient(90deg,rgba(216,232,238,.08) 0 1px,transparent 1px 18px),',
      '  linear-gradient(160deg,#3A4A4E,#1E2628);}',
      '.sl-board::after{content:"";position:absolute;inset:0;pointer-events:none;',
      '  box-shadow:inset 0 0 55px rgba(0,0,0,.6);}',
      '.sl-board-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;',
      '  flex-wrap:wrap;margin-bottom:11px;position:relative;z-index:1;}',
      '.sl-board-head h2{font-family:var(--f-display);font-size:2.5em;line-height:.95;color:#FFF4DC;',
      '  text-shadow:0 2px 5px rgba(0,0,0,.75);text-transform:none;letter-spacing:0;}',
      '.sl-board-head .where{font-family:var(--f-body);font-size:.86em;color:#C9AF8E;opacity:.9;',
      '  text-transform:uppercase;letter-spacing:.16em;',
      '  text-shadow:0 1px 3px rgba(0,0,0,.7);}',
      '.sl-board-head .tally{font-family:var(--f-body);font-size:.94em;color:#D9C3A2;',
      '  text-shadow:0 1px 3px rgba(0,0,0,.7);}',
      '.sl-board-tools{display:flex;gap:6px;flex-wrap:wrap;position:relative;z-index:1;margin-bottom:12px;}',
      '.sl-board-tools .btn{background:rgba(20,8,4,.46);border-color:rgba(255,228,180,.36);color:#FFEBC8;}',
      '.sl-board-tools .btn.on{background:rgba(210,43,43,.55);border-color:#FFE9B4;color:#FFF4DC;}',
      '.sl-notes{display:grid;grid-template-columns:repeat(auto-fill,minmax(186px,1fr));gap:13px;',
      '  align-content:start;position:relative;z-index:1;padding:4px 2px 6px;}',
      /* ---- the deed: a silver plaque screwed into the stone ---- */
      '.sl-note{position:relative;padding:13px 13px 11px;color:#1E2622;border-radius:2px;',
      '  background:linear-gradient(157deg,#E4E9E6,#AFB8B3 48%,#8C9993);',
      '  box-shadow:0 6px 14px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.75),',
      '   inset 0 -2px 4px rgba(60,70,66,.5);',
      '  transition:transform .3s var(--ease),box-shadow .3s var(--ease);}',
      '.sl-note::before{content:"";position:absolute;inset:5px;border:1px solid rgba(60,74,68,.4);',
      '  pointer-events:none;}',
      '.sl-note:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(0,0,0,.65),',
      '  inset 0 1px 0 rgba(255,255,255,.8);}',
      '.sl-note .tack{position:absolute;top:7px;left:7px;width:7px;height:7px;border-radius:50%;',
      '  background:radial-gradient(circle at 35% 30%,#FDFEFE,#7A8480 70%,#4A5450);}',
      '.sl-note::after{content:"";position:absolute;top:7px;right:7px;width:7px;height:7px;',
      '  border-radius:50%;background:radial-gradient(circle at 35% 30%,#FDFEFE,#7A8480 70%,#4A5450);}',
      '.sl-note .head{display:flex;align-items:baseline;gap:8px;margin:4px 0 4px;}',
      '.sl-note .deed{font-family:var(--f-body);font-weight:600;font-size:1.06em;line-height:1.2;',
      '  color:#18201C;flex:1;min-width:0;word-break:break-word;letter-spacing:.005em;}',
      '.sl-note .meta{font-family:var(--f-body);font-size:10px;color:#5A6660;',
      '  text-transform:uppercase;letter-spacing:.13em;margin-bottom:9px;}',
      '.sl-note .pts{font-family:var(--f-body);font-weight:700;font-size:1.02em;color:#0F3D28;',
      '  flex:none;white-space:nowrap;}',
      '.sl-note.pen{background:linear-gradient(157deg,#4A4238,#332E27 52%,#221E19);color:#D9C3A2;}',
      '.sl-note.pen .deed{color:#E4D6BC;} .sl-note.pen .meta{color:#9A8E78;}',
      '.sl-note.pen .pts{color:#E0616F;}',
      '.sl-note.big{box-shadow:0 6px 14px rgba(0,0,0,.6),0 0 0 2px #C9AF8E,',
      '  inset 0 1px 0 rgba(255,255,255,.75);}',
      '.sl-note.locked{filter:grayscale(.5) brightness(.84);}',
      '.sl-note-acts{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}',
      '.sl-claim{font-family:var(--f-body);font-size:11.5px;font-weight:600;padding:4px 12px;',
      '  border-radius:2px;border:1px solid var(--oc);color:#1E2622;background:rgba(255,255,255,.4);',
      '  letter-spacing:.04em;transition:background .2s,color .2s;}',
      '.sl-claim:hover:not(:disabled){background:var(--oc);color:#0F1613;}',
      '.sl-claim:disabled{opacity:.45;cursor:not-allowed;}',
      '.sl-note.pen .sl-claim{color:#E4D6BC;background:rgba(0,0,0,.3);}',
      '.sl-note.pen .sl-claim:hover:not(:disabled){background:var(--oc);color:#141614;}',
      '.sl-mini{background:none;border:0;padding:3px 5px;color:#68746E;display:flex;}',
      '.sl-mini:hover{color:#0F3D28;}',
      '.sl-note.pen .sl-mini{color:#8A8070;}',
      '.sl-req{font-family:var(--f-body);font-size:10px;font-style:italic;color:#8A6A2E;',
      '  display:block;margin-bottom:6px;}',
      '.sl-empty{font-family:var(--f-body);font-style:italic;font-size:1.05em;color:#F6E3BC;opacity:.75;padding:20px 6px;',
      '  text-shadow:0 2px 4px rgba(0,0,0,.6);}',

      /* ---- the wall plate: cast gold, name and number struck in ---- */
      '.ops{gap:16px;}',
      '.sl-plate{position:relative;padding:16px 22px 18px;',
      '  background:linear-gradient(158deg,#F6DFA4,#C79A3E 46%,#8C6420);',
      '  border-radius:5px;color:#2E1C06;',
      '  box-shadow:0 10px 26px rgba(0,0,0,.6),inset 0 2px 0 rgba(255,246,214,.7),',
      '   inset 0 -3px 6px rgba(90,60,10,.5);}',
      '.sl-plate::before{content:"";position:absolute;inset:6px;border:1.5px solid rgba(80,52,10,.45);',
      '  border-radius:3px;pointer-events:none;}',
      '.sl-plate.silver{background:linear-gradient(158deg,#F2F4F2,#B8C0BC 46%,#78827E);color:#1E2422;}',
      '.sl-plate .corner{position:absolute;width:16px;height:16px;opacity:.55;}',
      '.sl-plate .corner svg{width:100%;height:100%;}',
      '.sl-plate .c1{top:9px;left:9px;} .sl-plate .c2{top:9px;right:9px;transform:scaleX(-1);}',
      '.sl-plate .c3{bottom:9px;left:9px;transform:scaleY(-1);} .sl-plate .c4{bottom:9px;right:9px;transform:scale(-1);}',
      '.sl-plate .who{display:flex;align-items:center;gap:7px;font-family:var(--f-display);',
      '  font-size:1.7em;line-height:1;color:#3A2408;cursor:pointer;}',
      '.sl-plate .who .house-mark{display:flex;}',
      '.sl-plate .val{font-family:var(--f-display);font-size:2.9em;line-height:.95;margin:2px 0 0;',
      '  text-shadow:0 1px 0 rgba(255,248,220,.6);}',
      '.sl-plate .sub{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--f-body);font-size:11px;',
      '  color:#5A4210;margin-top:4px;}',
      '.sl-plate.silver .sub{color:#3E4644;}',
      '.sl-plate .rank{font-family:var(--f-display);font-size:1.25em;text-align:right;line-height:1;}',
      '.sl-plate .bar{height:5px;margin-top:9px;border-radius:3px;background:rgba(70,44,6,.35);overflow:hidden;}',
      '.sl-plate .bar i{display:block;height:100%;background:linear-gradient(90deg,#8E1420,#D22B2B);}',
      '.sl-plate.silver .bar i{background:linear-gradient(90deg,#2E4A44,#5E8A7E);}',
      '.sl-plate.lead{box-shadow:0 10px 26px rgba(0,0,0,.6),0 0 0 2px #F2C230,',
      '  inset 0 2px 0 rgba(255,246,214,.7),inset 0 -3px 6px rgba(90,60,10,.5);}',
      '.sl-plate .top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}',

      /* ---- the fire ---- */
      '.sl-f1{animation:sl-f1 2.3s ease-in-out infinite;transform-origin:50% 100%;}',
      '.sl-f2{animation:sl-f2 1.7s ease-in-out infinite;transform-origin:50% 100%;}',
      '.sl-f3{animation:sl-f3 1.1s ease-in-out infinite;transform-origin:50% 100%;}',
      '.sl-glow{animation:sl-glow 3.1s ease-in-out infinite;transform-origin:50% 100%;}',
      '.sl-candle{animation:sl-f3 1.9s ease-in-out infinite;transform-origin:50% 100%;}',
      '@keyframes sl-f1{0%,100%{transform:scaleY(1) scaleX(1);opacity:.88;}',
      '  30%{transform:scaleY(1.1) scaleX(.94) translateX(-1px);opacity:1;}',
      '  62%{transform:scaleY(.94) scaleX(1.06) translateX(1.5px);opacity:.82;}}',
      '@keyframes sl-f2{0%,100%{transform:scaleY(.96) scaleX(1.04) translateX(1px);opacity:.8;}',
      '  44%{transform:scaleY(1.14) scaleX(.9) translateX(-1.5px);opacity:1;}}',
      '@keyframes sl-f3{0%,100%{transform:scaleY(1.06) scaleX(.96);opacity:.95;}',
      '  50%{transform:scaleY(.9) scaleX(1.08);opacity:.7;}}',
      '@keyframes sl-glow{0%,100%{opacity:.5;}40%{opacity:.72;}70%{opacity:.56;}}',

      /* other screens: paper, not glass */
      '.node{background:linear-gradient(168deg,rgba(255,222,176,.06),var(--surface));border-radius:4px;}',
      '.tk{border-radius:4px;}',
      '.mk{border-radius:4px;}',
      '.focus-ring .bg{stroke-width:9;stroke:rgba(0,0,0,.34);}',
      '.focus-ring .fg{stroke-width:9;stroke-linecap:round;',
      '  filter:drop-shadow(0 0 5px color-mix(in srgb,var(--fc) 55%,transparent));}',
      '.focus-ring::after{content:"";position:absolute;inset:6.5%;border-radius:50%;',
      '  border:1px solid var(--line-hard);pointer-events:none;}',
      '.focus-time{font-family:var(--f-display);font-size:1.25em;font-weight:700;}',
      '.sect-title::before{content:"";width:7px;height:7px;flex:none;transform:rotate(45deg);',
      '  background:var(--gold);opacity:.85;}',
      '.sect-title::after{background:linear-gradient(90deg,var(--line-hard),transparent);}',
      '.day-h,.eyebrow,.panel-h .t{font-family:var(--f-body);text-transform:uppercase;letter-spacing:.16em;}',

      /* ---------- phones: the room becomes a band, the board flows ---------- */
      '@media(max-width:880px){',
      '  .sl-room{grid-template-columns:minmax(0,1fr);gap:14px;}',
      '  .sl-stage{aspect-ratio:1/.86;}',
      '  .sl-board{border-width:8px;}',
      '  .sl-door{width:74px;padding:2px;}',
      '  .sl-door svg{width:27px;height:30px;}',
      '  .sl-door .lbl{font-size:12px;} .sl-door .n{font-size:10px;}',
      '  .ops{grid-template-columns:1fr;}',
      '}',
      '@media(max-width:520px){',
      '  .sl-notes{grid-template-columns:1fr;}',
      '  .sl-door{width:62px;} .sl-door .lbl{font-size:11px;}',
      '  .sl-board-head h2{font-size:1.7em;}',
      '}',
      '@media(prefers-reduced-motion:reduce){',
      '  .sl-f1,.sl-f2,.sl-f3,.sl-glow,.sl-candle{animation:none;}}'
    ].join('\n') + '\n' + window.ORIGIN_PANO.baseCss + '\n' + window.ORIGIN_DIO.baseCss + '\n' + [
      '.sl-panel{background:#3A403A;background-image:',
      '  repeating-linear-gradient(0deg,rgba(0,0,0,.24) 0 1px,transparent 1px 34px),',
      '  repeating-linear-gradient(90deg,rgba(0,0,0,.24) 0 1px,transparent 1px 58px),',
      '  linear-gradient(160deg,#474E46,#20261F);border-left:8px solid #4A5250;}',
      '@media(max-width:880px){.sl-panel{border-left:0;border-top:7px solid #4A5250;}}',
      '.sl-panel .pano-tools .btn,.sl-panel .dio-tools .btn{background:rgba(4,10,8,.5);border-color:rgba(195,210,204,.4);color:#DCE8E2;}',
      '.sl-panel .pano-tools .btn.on,.sl-panel .dio-tools .btn.on{background:rgba(27,107,69,.6);border-color:#4FE0A0;color:#EAF0EC;}',
    ].join('\n'),

    /* ======================================================================
       THE STANDINGS — a cast gold plate on the wall
       ====================================================================== */
    scoreboard: function (ctx) {
      var corner = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">' +
        '<path d="M1 15V6a5 5 0 0 1 5-5h9"/><path d="M4 15V8a4 4 0 0 1 4-4h7"/></svg>';
      return ctx.parties.map(function (p) {
        var o = ctx.of(p);
        var silver = (ctx.houseOf && ctx.houseOf(p)) === 'slytherin';
        return '<div class="sl-plate' + (o.lead ? ' lead' : '') + (silver ? ' silver' : '') + '">' +
          '<span class="corner c1">' + corner + '</span><span class="corner c2">' + corner + '</span>' +
          '<span class="corner c3">' + corner + '</span><span class="corner c4">' + corner + '</span>' +
          '<div class="top">' +
            '<div class="who" data-act="rename" data-p="' + p + '" title="Rename">' +
              (o.lead ? ctx.ICON('lead', 15) : '') + ctx.houseMark(p) +
              '<span>' + ctx.esc(o.name) + '</span></div>' +
            '<div class="rank">' + ctx.esc(o.rank.name) + '<br>' +
              '<span style="opacity:.7;font-size:.8em">' + ctx.esc(ctx.C('rank')) + ' ' + o.rank.level + '</span></div>' +
          '</div>' +
          '<div class="val">' + ctx.num(o.points) + '</div>' +
          '<div class="sub">' +
            '<span>' + ctx.fmt(o.today) + ' today</span>' +
            (o.streak > 1 ? '<span>' + o.streak + '-day streak</span>' : '') +
            '<span>' + ctx.num(o.rank.toNext) + ' to ' + ctx.esc(ctx.C('rank').toLowerCase()) + ' ' + (o.rank.level + 1) + '</span>' +
          '</div>' +
          '<div class="bar"><i style="width:' + (o.rank.progress * 100).toFixed(1) + '%"></i></div>' +
        '</div>';
      }).join('');
    },

    /* ======================================================================
       THE ROOM SCREEN
       ====================================================================== */
    diorama: DIORAMA,
    panorama: PANORAMA,

    /* the sphere goes up after the markup lands */
    afterRoom: function (ctx) {
      if (DIORAMA[ctx.active.id] && window.ORIGIN_DIO) {
        window.ORIGIN_DIO.wire(ctx, { pre: 'sl', rooms: DIORAMA });
        return;
      }
      if (!PANORAMA[ctx.active.id] || !window.ORIGIN_PANO || !window.ORIGIN_PANO.ready || window.ORIGIN_PANO.failed) return;
      window.ORIGIN_PANO.roomWire(ctx, { pre: 'sl', rooms: PANORAMA });
    },

    roomView: function (ctx) {
      var esc = ctx.esc;
      var pl = ctx.active;
      if (!pl) return '<div class="sl-empty">No rooms yet.</div>';
      var art = ART[pl.id] ? '' : (ROOMS[pl.id] || ROOMS.saturn)(ctx);
      var board = BOARDS[pl.id] || BOARDS.saturn;

      /* the other rooms, standing in this one */
      var spots = DOOR_SPOTS[pl.id] || DOOR_SPOTS.saturn;
      var doors = ctx.places.filter(function (q) { return q.id !== pl.id; }).map(function (q) {
        var s = spots[q.id] || [50, 50];
        return '<button class="sl-door" data-act="planet" data-p="' + esc(q.id) + '"' +
          ' style="left:' + s[0] + '%;top:' + s[1] + '%"' +
          ' title="Go to ' + esc(ctx.name(q)) + '">' +
          (DOOR_ART[q.id] || DOOR_ART.saturn) +
          '<span class="lbl">' + esc(ctx.name(q)) + '</span>' +
          '<span class="n">' + ctx.count(q.id) + '</span></button>';
      }).join('');

      /* the deeds, pinned up */
      var notes = ctx.nodes.map(function (d, i) {
        var tilt = (ctx.jit(d.id, 1) * 4 - 2).toFixed(2);
        var locked = d.claims.every(function (c) { return c.locked; });
        var acts = d.claims.map(function (c) {
          var lbl = d.owner === 'both' ? c.name : (c.n ? ctx.C('scoreVerbPast') : ctx.C('scoreVerb'));
          return '<button class="sl-claim" style="--oc:' + c.color + '" data-act="claim"' +
            ' data-id="' + esc(d.id) + '" data-p="' + c.party + '"' +
            (c.locked ? ' disabled title="' + esc(ctx.C('toastLocked', { item: d.req.name })) + '"' : '') + '>' +
            esc(lbl) + (c.n ? ' ×' + c.n : '') + '</button>' +
            (c.n ? '<button class="sl-mini" data-act="undo" data-id="' + esc(d.id) + '" data-p="' + c.party +
                   '" title="Take it back">' + ctx.ICON('undo', 13) + '</button>' : '');
        }).join('');
        return '<div class="sl-note' + (d.isPen ? ' pen' : '') + (d.kind === 'milestone' ? ' big' : '') +
          (locked ? ' locked' : '') + '" style="--tilt:' + tilt + 'deg">' +
          '<span class="tack"></span>' +
          '<div class="head"><div class="deed">' + esc(d.name) + '</div>' +
            '<span class="pts">' + ctx.fmt(d.pts) + '</span></div>' +
          '<div class="meta">' + esc(d.typeName) + ' · ' + esc(d.cad) +
            (d.ownerName ? ' · ' + esc(d.ownerName) : '') + '</div>' +
          (d.req ? '<span class="sl-req">' + esc(ctx.C('toastLocked', { item: d.req.name })) + '</span>' : '') +
          '<div class="sl-note-acts">' + acts +
            '<button class="sl-mini" style="margin-left:auto" data-act="node-edit" data-id="' + esc(d.id) +
            '" title="Edit">' + ctx.ICON('more', 13) + '</button></div>' +
        '</div>';
      }).join('');

      var shellCfg = {
        pre: 'sl', doorArt: DOOR_ART, boardArt: BOARD_ART,
        boardTitle: board.title, boardSurface: 'sl-panel',
        open: ctx.boardOpen(),
        fallbackPins: [{ u: .12, v: .3 }, { u: .3, v: .25 }, { u: .7, v: .25 },
                       { u: .88, v: .3 }, { u: .2, v: .8 }, { u: .8, v: .8 }],
        tools: ['all'].concat(ctx.parties).map(function (w) {
          return '<button class="btn sm' + (ctx.who === w ? ' on' : '') + '" data-act="who" data-w="' + w + '">' +
            (w === 'all' ? 'Everyone' : esc(ctx.nameOf(w))) + '</button>';
        }).join('') +
          '<button class="btn sm" data-act="node-new">+ ' + esc(ctx.C('item')) + '</button>' +
          '<button class="btn sm" data-act="planet-edit">Edit room</button>',
        deeds: notes || '<div class="sl-empty">' + esc(ctx.C('emptyGroup')) + '</div>'
      };

      if (DIORAMA[pl.id] && window.ORIGIN_DIO) {
        shellCfg.rooms = DIORAMA;
        return window.ORIGIN_DIO.shell(ctx, shellCfg);
      }

      /* if this room has been rendered as a panorama, you stand in it */
      if (PANORAMA[pl.id] && window.ORIGIN_PANO && window.ORIGIN_PANO.ready && !window.ORIGIN_PANO.failed) {
        shellCfg.rooms = PANORAMA;
        return window.ORIGIN_PANO.roomShell(ctx, shellCfg);
      }

      var earned = ctx.earned(pl.id);
      var filter = ['all'].concat(ctx.parties).map(function (w) {
        return '<button class="btn sm' + (ctx.who === w ? ' on' : '') + '" data-act="who" data-w="' + w + '">' +
          (w === 'all' ? 'Everyone' : esc(ctx.nameOf(w))) + '</button>';
      }).join('');

      return '<div class="sl-room">' +
        '<div class="sl-stage' + (ART[pl.id] ? ' rendered' : '') + '">' +
          (ART[pl.id]
            ? '<img class="sl-render" src="' + esc(ART[pl.id]) + '" alt="' + esc(ctx.name(pl)) + '" ' +
              'loading="lazy" decoding="async">'
            : '<svg viewBox="-26 -14 956 756" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
              esc(ctx.name(pl)) + '">' + grDefs() + art + '</svg>') +
          '<div class="sl-doors">' + doors + '</div>' +
        '</div>' +
        '<div class="sl-board ' + board.surface + '">' +
          '<div class="sl-board-head">' +
            '<div><div class="where">' + esc(board.title) + '</div>' +
              '<h2>' + esc(ctx.name(pl)) + '</h2></div>' +
            '<div class="tally">' + ctx.nodes.length + ' ' +
              esc((ctx.nodes.length === 1 ? ctx.C('item') : ctx.C('items')).toLowerCase()) +
              ' · ' + ctx.fmt(earned) + ' today</div>' +
          '</div>' +
          '<div class="sl-board-tools">' + filter +
            '<button class="btn sm" data-act="node-new">+ ' + esc(ctx.C('item')) + '</button>' +
            '<button class="btn sm" data-act="planet-edit">Edit room</button>' +
            '<button class="btn sm" data-act="planet-new">+ Room</button></div>' +
          '<div class="sl-notes">' + (notes || '<div class="sl-empty">' + esc(ctx.C('emptyGroup')) + '</div>') + '</div>' +
        '</div>' +
      '</div>';
    }
  });

  /* gradients shared by every room */
  function grDefs() {
    return '<defs>' +
      '<linearGradient id="slLake" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#4FD3B0"/><stop offset="52%" stop-color="#1E7A66"/>' +
        '<stop offset="100%" stop-color="#0A2A24"/></linearGradient>' +
      '<radialGradient id="slLakePane" cx="42%" cy="34%" r="70%">' +
        '<stop offset="0%" stop-color="#8FF0DC"/><stop offset="60%" stop-color="#3FBFA8"/>' +
        '<stop offset="100%" stop-color="#14554A"/></radialGradient>' +
      '<linearGradient id="slNight" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#101A2A"/><stop offset="100%" stop-color="#050A12"/></linearGradient>' +
      '<linearGradient id="slPitch" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#2A4A5E"/><stop offset="58%" stop-color="#2E5A3E"/>' +
        '<stop offset="100%" stop-color="#16301C"/></linearGradient>' +
      '<radialGradient id="roomGlow" cx="50%" cy="60%" r="60%">' +
        '<stop offset="0%" stop-color="#D6F7E4"/><stop offset="34%" stop-color="#3FC98A"/>' +
        '<stop offset="100%" stop-color="rgba(20,90,60,0)"/></radialGradient>' +
    '</defs>';
  }
})();
