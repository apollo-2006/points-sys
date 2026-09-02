/* ==========================================================================
   GRYFFINDOR — you are standing in the common room.
   --------------------------------------------------------------------------
   Seven rooms, each drawn as an interior you are inside. The other rooms are
   objects in the room with you: a stair, a bookcase, a portrait, a broom on a
   rack. Deeds are pieces of parchment pinned to a board on the wall.
   Light comes from the hearth, at floor level, and warms everything above it.
   Nothing here is precisely aligned. The notes hang crooked. That is the point.
   ========================================================================== */
(function () {
  var U = ORIGIN_THEMES.util;
  var B = U.baseIcons({ weight: 1.5 });
  var I = B.I, F = B.F;

  /* ---- the room's own palette, used by the drawings ---------------------- */
  var P = {
    wall:  '#3A1A16', wallLo: '#24100E', wallHi: '#4E241D',
    stone: '#5A4638', stoneLo: '#3A2C22',
    oak:   '#5A3418', oakLo: '#2E1809', oakHi: '#7A4A22',
    brass: '#C79A3E', brassHi: '#F2DFA6',
    fire:  '#FF8A32', fireHi: '#FFE8B8', fireLo: '#BE3418',
    paper: '#EFE3C8', paperLo: '#D8C69E', paperEdge: '#B79E6E',
    ink:   '#3A2A18', inkLo: '#6E5A3C',
    cork:  '#B08048', corkLo: '#8A5E30',
    slate: '#2A2E2C', slateHi: '#4A524E',
    night: '#16233E', star: '#F2E6C4',
    green: '#5E7A3A', red: '#8E1420', gold: '#F2C230'
  };

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

  /* ---- small compound pieces, shared by the seven rooms ---------------- */
  function rug(x, y, w, d, col, ring) {
    var o = poly([[x, y, .02], [x + w, y, .02], [x + w, y + d, .02], [x, y + d, .02]], col, ' opacity=".85"');
    if (ring) {
      o += '<path d="M' + pt(x + .7, y + .7, .03) + ' L' + pt(x + w - .7, y + .7, .03) +
           ' L' + pt(x + w - .7, y + d - .7, .03) + ' L' + pt(x + .7, y + d - .7, .03) +
           ' Z" fill="none" stroke="' + ring + '" stroke-width="2.4" opacity=".75"/>';
      o += '<path d="M' + pt(x + 1.6, y + 1.6, .03) + ' L' + pt(x + w - 1.6, y + 1.6, .03) +
           ' L' + pt(x + w - 1.6, y + d - 1.6, .03) + ' L' + pt(x + 1.6, y + d - 1.6, .03) +
           ' Z" fill="none" stroke="' + ring + '" stroke-width="1.4" opacity=".5"/>';
    }
    return o;
  }
  /* a squat upholstered seat: base, back, two arms */
  function seat(x, y, w, d, col, backOn) {
    var o = box(x, y, 0, w, d, .5, col);
    o += box(x, y, .5, w, d, .28, sh(col, 1.18));
    if (backOn !== false) o += box(x, y, .5, w, .28, 1.1, sh(col, .9));
    o += box(x, y, .5, .26, d, .62, sh(col, 1.05));
    o += box(x + w - .26, y, .5, .26, d, .62, sh(col, 1.05));
    return o;
  }
  function table(x, y, w, d, h, top, leg) {
    var o = box(x + .12, y + .12, 0, .18, .18, h, leg) +
            box(x + w - .3, y + .12, 0, .18, .18, h, leg) +
            box(x + .12, y + d - .3, 0, .18, .18, h, leg) +
            box(x + w - .3, y + d - .3, 0, .18, .18, h, leg);
    return o + box(x, y, h, w, d, .16, top);
  }
  function shelfUnit(x, y, w, d, h, wood, books) {
    var o = box(x, y, 0, w, d, h, wood);
    for (var s = 1; s <= 3; s++) {
      var z = h * s / 4;
      o += poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], sh(wood, .5));
      var bx = x + .12;
      for (var k = 0; k < 9 && bx < x + w - .2; k++) {
        var bw = .12 + ((k * 7 + s * 3) % 4) * .05;
        var bh = h / 4 * (.5 + ((k * 5 + s) % 4) * .1);
        o += box(bx, y + d - .34, z, bw, .3, bh, books[(k + s) % books.length]);
        bx += bw + .04;
      }
    }
    return o;
  }
  function steps(x, y, n, w, col) {
    var o = '';
    for (var i = 0; i < n; i++) o += box(x, y + i * .8, 0, w, .8, .42 * (n - i), col);
    return o;
  }

  var GM = {   /* the common room's materials */
    wallL: '#6E2A22', wallR: '#5A2119', course: 'rgba(40,12,8,.34)',
    floor: '#4A2A14', floorLine: 'rgba(20,8,2,.4)', cap: '#7A5A46'
  };

  var ROOMS = {
    /* ---------------- COMMON ROOM ---------------- */
    saturn: function () {
      var o = shell(GM);
      /* the great arched fireplace, centred on the right-hand wall */
      o += archOnWall('r', 5, 3.6, 0, 6.4, '#2A0F0A', '#8A6A52', 5);
      o += wall('r', 3.0, 7.0, 6.4, 7.0, '#7A5A46');
      /* lion's head above the arch */
      var lh = P2(5, 0, 7.5);
      o += '<g transform="translate(' + lh[0].toFixed(1) + ',' + lh[1].toFixed(1) + ')">' +
        '<g fill="#A08A66">' +
          '<path d="M0 -30 6 -18 -6 -18Z"/><path d="M22 -20 20 -7 10 -14Z"/><path d="M-22 -20 -20 -7 -10 -14Z"/>' +
          '<path d="M29 2 20 11 24 -2Z"/><path d="M-29 2 -20 11 -24 -2Z"/>' +
          '<path d="M20 20 10 22 17 12Z"/><path d="M-20 20 -10 22 -17 12Z"/>' +
          '<path d="M0 32 -8 22 8 22Z"/></g>' +
        '<circle r="21" fill="#B9A382"/>' +
        '<path d="M-13 -4a5 4 0 0 1 10 0 5 4 0 0 1-10 0M3 -4a5 4 0 0 1 10 0 5 4 0 0 1-10 0" fill="#3A2C16"/>' +
        '<path d="M0 4 -5 9h10Z" fill="#5A3E22"/>' +
        '<path d="M0 9v4M-8 15q8 6 16 0" fill="none" stroke="#4A3620" stroke-width="2.2" stroke-linecap="round"/></g>';
      /* house banner hung between arch and mantel */
      var bn = P2(3.6, 0, 5.4);
      o += '<g transform="translate(' + bn[0].toFixed(1) + ',' + bn[1].toFixed(1) + ') matrix(1,0.5,0,1,0,0)">' +
        '<path d="M-26 0h52v58l-26-16-26 16z" fill="#8E1420"/>' +
        '<path d="M-26 0h52v58l-26-16-26 16z" fill="none" stroke="#F2C230" stroke-width="2.5"/>' +
        '<circle cy="24" r="12" fill="none" stroke="#F2C230" stroke-width="3"/></g>';
      /* the fire, and the grate in front of it */
      o += flames(5, .45, .1, 1.05, '#BE3418', '#FF8A32', '#FFE8B8');
      o += '<path d="M' + pt(3.7, .35, 0) + ' L' + pt(6.3, .35, 0) + ' L' + pt(6.3, .35, 1.5) +
           ' L' + pt(3.7, .35, 1.5) + ' Z" fill="none" stroke="#1A1210" stroke-width="2.6"/>';
      for (var g = 1; g < 7; g++) {
        o += '<path d="M' + pt(3.7 + g * .37, .35, 0) + ' L' + pt(3.7 + g * .37, .35, 1.4) +
             '" stroke="#1A1210" stroke-width="2"/>';
      }
      /* tall window and lanterns on the left-hand wall */
      o += archOnWall('l', 2.6, 2.2, 2.4, 7.2, 'url(#grPane)', '#8A6A52', 4);
      o += '<path d="M' + pt(0, 2.6, 2.4) + ' L' + pt(0, 2.6, 6.6) + '" stroke="#8A6A52" stroke-width="2.4"/>';
      o += '<path d="M' + pt(0, 1.5, 4.6) + ' L' + pt(0, 3.7, 4.6) + '" stroke="#8A6A52" stroke-width="2.4"/>';
      o += lantern('l', 4.4, 6.2, '#C79A3E', '#FFC46A');
      o += lantern('r', 2.2, 6.2, '#C79A3E', '#FFC46A');
      /* portraits on the left wall */
      o += frame('l', 6.4, 5.6, 52, 40, '#A8853A', '#5A6A4A',
        '<path d="M-18 12 -4 -6 6 6 18 -10 18 16 -18 16z" fill="#7E8A62"/>');
      o += frame('l', 8.2, 4.4, 34, 42, '#8A6A2E', '#4A3A2E',
        '<circle cy="-6" r="9" fill="#C8AA84"/><path d="M-11 18q11 -16 22 0z" fill="#7A5A3E"/>');
      /* bookcase against the right wall */
      o += shelfUnit(8.2, .15, 1.6, .8, 5.2, '#3E2410', ['#7A2A1E', '#3E5A34', '#2E3E5E', '#6A4A18', '#5A2440']);
      /* rug and the seating around the hearth */
      o += rug(2.6, 2.4, 5, 4.6, '#7E1A24', '#E0B34A');
      o += seat(3.4, 5.4, 3.2, 1.5, '#A8202E');
      o += seat(1.7, 3.0, 1.3, 1.4, '#8E1420');
      o += seat(6.6, 3.0, 1.3, 1.4, '#8E1420');
      /* low table with a book on it */
      o += table(4.3, 3.5, 1.5, 1.2, .55, '#6A4020', '#3E2410');
      o += box(4.7, 3.9, .71, .5, .4, .08, '#EFE3C8');
      /* chess table, front left */
      o += table(1.3, 6.4, 1.2, 1.2, .62, '#5A3418', '#3E2410');
      var ch = P2(1.9, 7, .78);
      o += '<g transform="translate(' + ch[0].toFixed(1) + ',' + ch[1].toFixed(1) + ')">';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        if ((r + c) % 2) continue;
        var q = P2(1.3 + c * .3, 6.4 + r * .3, .78), q0 = P2(1.9, 7, .78);
        o += '<rect x="' + (q[0] - q0[0]) + '" y="' + (q[1] - q0[1]) + '" width="9" height="5" fill="#EFE3C8" opacity=".6"/>';
      }
      o += '</g>';
      /* steps down into the room, front right */
      o += steps(7.4, 7.2, 3, 2.4, '#4A2A14');
      return o;
    },

    /* ---------------- DORMITORIES ---------------- */
    earth: function () {
      var m = { wallL: '#5A2A22', wallR: '#4A211A', course: 'rgba(30,10,6,.34)',
                floor: '#402412', floorLine: 'rgba(16,6,2,.4)', cap: '#6E5240' };
      var o = shell(m);
      o += archOnWall('l', 5, 2.4, 3.0, 7.4, 'url(#grPaneNight)', '#7A5C46', 4);
      o += '<path d="M' + pt(0, 5, 3.0) + ' L' + pt(0, 5, 6.8) + '" stroke="#7A5C46" stroke-width="2.2"/>';
      o += lantern('r', 3.2, 6.0, '#C79A3E', '#FFC46A');
      /* a four-poster against the right wall */
      var bx = 5.4, by = .4;
      o += box(bx, by, 0, .3, .3, 6.2, '#3E2410');
      o += box(bx + 3.2, by, 0, .3, .3, 6.2, '#3E2410');
      o += box(bx, by + 2.4, 0, .3, .3, 6.2, '#3E2410');
      o += box(bx + 3.2, by + 2.4, 0, .3, .3, 6.2, '#3E2410');
      o += box(bx, by, 0, 3.5, 2.7, 1.0, '#4A2A14');
      o += box(bx + .1, by + .1, 1.0, 3.3, 2.5, .34, '#EFE3C8');
      o += box(bx + .1, by + .9, 1.34, 3.3, 1.7, .16, '#A8202E');
      o += box(bx + .25, by + .2, 1.34, 1.1, .6, .22, '#F6EEDC');
      o += box(bx, by, 6.2, 3.5, 2.7, .28, '#3E2410');
      /* curtains */
      o += poly([[bx, by, 0], [bx, by, 6.2], [bx + .1, by + 2.7, 6.2], [bx + .1, by + 2.7, 0]], '#8E1420', ' opacity=".9"');
      o += poly([[bx + 3.4, by, 0], [bx + 3.4, by, 6.2], [bx + 3.5, by + 2.7, 6.2], [bx + 3.5, by + 2.7, 0]], '#7A121C', ' opacity=".85"');
      /* trunk at the foot, and a washstand */
      o += box(3.0, 5.6, 0, 1.8, 1.0, .9, '#5A3418');
      o += box(3.0, 5.6, .9, 1.8, 1.0, .18, '#7A4A22');
      o += table(1.2, 2.2, 1.2, 1.1, 1.0, '#6A4020', '#3E2410');
      o += box(1.5, 2.5, 1.16, .5, .5, .3, '#DCD2BC');
      o += rug(2.4, 3.2, 2.4, 2.4, '#6E1A22', '#D8A840');
      return o;
    },

    /* ---------------- LIBRARY ---------------- */
    mars: function () {
      var m = { wallL: '#4A3A26', wallR: '#3E301F', course: 'rgba(20,14,6,.3)',
                floor: '#3A2410', floorLine: 'rgba(14,6,2,.42)', cap: '#6E5A3E' };
      var o = shell(m);
      var books = ['#7A2A1E', '#3E5A34', '#2E3E5E', '#6A4A18', '#5A2440', '#2A4A46'];
      /* stacks along both walls */
      for (var i = 0; i < 3; i++) o += shelfUnit(.3 + i * 3.1, .15, 2.6, .85, 6.4, '#3E2410', books);
      for (var j = 0; j < 3; j++) o += shelfUnit(.15, .4 + j * 3.1, .85, 2.6, 6.4, '#38200E', books);
      /* a ladder leaning on the right stacks */
      var l0 = P2(6.6, .95, 0), l1 = P2(5.4, .95, 6.2);
      o += '<g stroke="#8A6A32" stroke-width="6" stroke-linecap="round">' +
        '<path d="M' + l0[0].toFixed(1) + ' ' + l0[1].toFixed(1) + ' L' + l1[0].toFixed(1) + ' ' + l1[1].toFixed(1) + '"/>' +
        '<path d="M' + (l0[0] + 22).toFixed(1) + ' ' + (l0[1] + 11).toFixed(1) + ' L' +
          (l1[0] + 22).toFixed(1) + ' ' + (l1[1] + 11).toFixed(1) + '"/></g>';
      for (var r = 1; r < 6; r++) {
        var t = r / 6;
        var ax = l0[0] + (l1[0] - l0[0]) * t, ay = l0[1] + (l1[1] - l0[1]) * t;
        o += '<path d="M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + ' l22 11" stroke="#7A5A28" stroke-width="4"/>';
      }
      /* reading desk with a green lamp */
      o += table(4.2, 5.2, 3.0, 1.8, 1.0, '#5A3418', '#3E2410');
      o += box(4.6, 5.6, 1.16, .9, .7, .1, '#EFE3C8');
      o += box(6.2, 5.5, 1.16, .3, .3, .5, '#B08030');
      var lp = P2(6.35, 5.65, 1.7);
      o += '<ellipse cx="' + lp[0].toFixed(1) + '" cy="' + lp[1].toFixed(1) + '" rx="46" ry="24" fill="#FFD07A" opacity=".2"/>';
      o += '<path d="M' + (lp[0] - 20) + ' ' + lp[1] + ' h40 l4 12 h-48 z" fill="#2E5A3A"/>';
      o += seat(4.8, 7.0, 1.3, 1.2, '#7A3A24');
      o += rug(3.6, 4.8, 4, 3.4, '#5A2A2A', '#C8A050');
      return o;
    },

    /* ---------------- GREAT HALL ---------------- */
    ceres: function () {
      var m = { wallL: '#4A4038', wallR: '#3E362E', course: 'rgba(16,12,8,.32)',
                floor: '#5A5044', floorLine: 'rgba(20,16,10,.45)', cap: '#8A7A62' };
      var o = shell(m);
      o += archOnWall('r', 2.6, 2.4, 3.2, 8.2, 'url(#grPaneNight)', '#8A7A62', 4);
      o += archOnWall('r', 7.4, 2.4, 3.2, 8.2, 'url(#grPaneNight)', '#8A7A62', 4);
      o += archOnWall('l', 5, 2.4, 3.2, 8.2, 'url(#grPaneNight)', '#8A7A62', 4);
      /* four house banners between the windows */
      var cols = ['#8E1420', '#1E4A2E', '#1E3A6A', '#B08018'];
      for (var b = 0; b < 2; b++) {
        var bp = P2(5, 0, 8.4 - b * 0);
        o += frame('r', 5, 6.2, 46, 84, '#6A5A42', cols[b],
          '<circle cy="-8" r="13" fill="none" stroke="#E0C070" stroke-width="3"/>');
      }
      o += frame('l', 2.2, 6.2, 46, 84, '#6A5A42', cols[2], '<circle cy="-8" r="13" fill="none" stroke="#E0C070" stroke-width="3"/>');
      o += frame('l', 8.0, 6.2, 46, 84, '#6A5A42', cols[3], '<circle cy="-8" r="13" fill="none" stroke="#E0C070" stroke-width="3"/>');
      /* floating candles */
      for (var c = 0; c < 7; c++) {
        var cp = P2(1.4 + c * 1.2, 1.2 + (c % 3) * 2.6, 7.2 + (c % 4) * .5);
        o += '<g transform="translate(' + cp[0].toFixed(1) + ',' + cp[1].toFixed(1) + ')">' +
          '<circle r="17" fill="#FFC46A" opacity=".14"/>' +
          '<rect x="-2.6" y="-10" width="5.2" height="14" rx="1.6" fill="#F2E4C4"/>' +
          '<g class="gr-candle"><ellipse cy="-13" rx="2.6" ry="4.6" fill="#FFE8B0"/></g></g>';
      }
      /* two long tables with benches */
      for (var t = 0; t < 2; t++) {
        var ty = 2.6 + t * 3.2;
        o += table(1.2, ty, 7.4, 1.5, 1.0, '#6A4020', '#3E2410');
        o += box(1.2, ty - .8, 0, 7.4, .55, .55, '#5A3418');
        o += box(1.2, ty + 1.6, 0, 7.4, .55, .55, '#5A3418');
        for (var gg = 0; gg < 5; gg++) {
          o += box(1.9 + gg * 1.4, ty + .5, 1.16, .22, .22, .38, '#C79A3E');
          o += box(2.5 + gg * 1.4, ty + .8, 1.16, .34, .34, .12, '#E8D8B4');
        }
      }
      return o;
    },

    /* ---------------- QUIDDITCH PRACTICE ---------------- */
    venus: function () {
      var m = { wallL: '#3E3A2E', wallR: '#342F26', course: 'rgba(14,12,6,.3)',
                floor: '#3A3226', floorLine: 'rgba(12,10,4,.42)', cap: '#6E6450' };
      var o = shell(m);
      /* the pitch through a big archway on the right wall */
      o += archOnWall('r', 6.4, 5.2, 0, 7.6, 'url(#grPitchSky)', '#6E6450', 5);
      var gp = P2(6.4, 0, 3.4);
      o += '<g transform="translate(' + gp[0].toFixed(1) + ',' + gp[1].toFixed(1) + ')" ' +
        'stroke="#D8B45A" stroke-width="4" fill="none" opacity=".9">' +
        '<path d="M-56 34V6"/><circle cx="-56" cy="-6" r="13"/>' +
        '<path d="M0 38V-4"/><circle cy="-18" r="17"/>' +
        '<path d="M54 34V10"/><circle cx="54" cy="0" r="11"/></g>';
      o += '<path d="M' + pt(4.0, .05, 0) + ' L' + pt(8.8, .05, 0) + '" stroke="#4A6A32" stroke-width="9" opacity=".8"/>';
      /* lockers along the left wall */
      for (var i = 0; i < 4; i++) {
        o += box(.2, .5 + i * 2.2, 0, 1.1, 2.0, 5.0, '#4A3418');
        o += poly([[1.3, .6 + i * 2.2, .4], [1.3, 2.4 + i * 2.2, .4], [1.3, 2.4 + i * 2.2, 4.6], [1.3, .6 + i * 2.2, 4.6]], '#241408');
        var hp = P2(1.3, 2.2 + i * 2.2, 2.4);
        o += '<circle cx="' + hp[0].toFixed(1) + '" cy="' + hp[1].toFixed(1) + '" r="3.4" fill="#C79A3E"/>';
      }
      /* broom rack and two brooms */
      o += box(3.4, .3, 0, .26, 1.8, 4.4, '#3E2410');
      for (var b = 0; b < 2; b++) {
        var s0 = P2(3.7 + b * .5, 1.0, 0), s1 = P2(3.4 + b * .5, .5, 4.2);
        o += '<path d="M' + s0[0].toFixed(1) + ' ' + s0[1].toFixed(1) + ' L' + s1[0].toFixed(1) + ' ' + s1[1].toFixed(1) +
             '" stroke="#8A5A22" stroke-width="6" stroke-linecap="round"/>';
        o += '<path d="M' + (s0[0] - 8).toFixed(1) + ' ' + (s0[1] - 4).toFixed(1) + ' q9 22 18 0 q-3 20 -9 24 q-6 -4 -9 -24z" fill="#C79A3E" opacity=".9"/>';
      }
      /* bench and kit */
      o += box(2.2, 5.4, 0, 4.4, .9, .55, '#5A3418');
      o += box(2.2, 5.4, .55, 4.4, .9, .14, '#7A4A22');
      o += box(3.0, 6.8, 0, .5, .8, .5, '#3E2410');
      o += box(3.8, 6.8, 0, .5, .8, .5, '#3E2410');
      o += box(5.6, 6.6, 0, .8, .8, .5, '#7A2A1E');
      return o;
    },

    /* ---------------- McGONAGALL'S OFFICE ---------------- */
    deimos: function () {
      var m = { wallL: '#3A2E2E', wallR: '#302626', course: 'rgba(12,8,8,.34)',
                floor: '#33241C', floorLine: 'rgba(10,6,2,.44)', cap: '#6A5A52' };
      var o = shell(m);
      o += archOnWall('l', 2.4, 1.6, 3.6, 7.6, 'url(#grPaneCold)', '#7A6A62', 3.5);
      o += lantern('r', 2.0, 6.2, '#9AA0A6', '#CFE0F0');
      /* filing cabinets on the right wall */
      for (var i = 0; i < 3; i++) {
        o += box(1.0 + i * 2.4, .2, 0, 2.0, 1.0, 4.2, '#3E2A16');
        for (var d = 0; d < 3; d++) {
          o += poly([[1.1 + i * 2.4, 1.2, .4 + d * 1.25], [2.9 + i * 2.4, 1.2, .4 + d * 1.25],
                     [2.9 + i * 2.4, 1.2, 1.45 + d * 1.25], [1.1 + i * 2.4, 1.2, 1.45 + d * 1.25]], '#26170A');
          var kp = P2(2.0 + i * 2.4, 1.2, .95 + d * 1.25);
          o += '<rect x="' + (kp[0] - 9) + '" y="' + (kp[1] - 2) + '" width="18" height="4" rx="1.6" fill="#C79A3E"/>';
        }
      }
      /* the desk, a high-backed chair, a ledger */
      o += table(4.0, 4.0, 3.4, 2.0, 1.15, '#5A3418', '#3E2410');
      o += box(4.4, 4.4, 1.31, 1.3, 1.0, .12, '#EFE3C8');
      o += box(6.2, 4.5, 1.31, .5, .5, .16, '#2A2A32');
      o += seat(4.9, 2.6, 1.5, 1.2, '#5A1620');
      o += box(4.9, 2.6, .5, 1.5, .24, 2.4, '#4A1218');
      /* a slate on an easel — where points come off */
      o += box(7.6, 6.0, 0, .2, .2, 2.6, '#3E2410');
      o += box(8.6, 6.0, 0, .2, .2, 2.6, '#3E2410');
      o += poly([[7.5, 6.1, 1.2], [8.8, 6.1, 1.2], [8.8, 6.1, 3.2], [7.5, 6.1, 3.2]], '#2A2E2C');
      o += poly([[7.5, 6.1, 1.2], [8.8, 6.1, 1.2], [8.8, 6.1, 3.2], [7.5, 6.1, 3.2]], 'none',
        ' stroke="#6A5A42" stroke-width="3"');
      o += rug(3.4, 4.6, 3.6, 3.0, '#4A2028', '#9A7A3A');
      return o;
    },

    /* ---------------- ASTRONOMY TOWER ---------------- */
    europa: function () {
      var m = { wallL: '#39404E', wallR: '#2F3542', course: 'rgba(10,14,22,.4)',
                floor: '#3A4048', floorLine: 'rgba(8,12,20,.5)', cap: '#6A7488' };
      var o = shell(m);
      /* two great openings onto the night */
      o += archOnWall('r', 5, 5.4, 1.4, 8.4, 'url(#grNightSky)', '#6A7488', 5);
      o += archOnWall('l', 5, 5.4, 1.4, 8.4, 'url(#grNightSky)', '#6A7488', 5);
      /* stars inside the openings */
      for (var s = 0; s < 22; s++) {
        var u = 2.6 + (s % 11) * .44, z = 2.2 + ((s * 7) % 11) * .5;
        var sp = (s % 2) ? P2(u, 0, z) : P2(0, u, z);
        o += '<circle cx="' + sp[0].toFixed(1) + '" cy="' + sp[1].toFixed(1) + '" r="' +
             (0.9 + (s % 3) * .5).toFixed(1) + '" fill="#F2E6C4" opacity="' + (.4 + (s % 4) * .15).toFixed(2) + '"/>';
      }
      var mp = P2(3.2, 0, 6.4);
      o += '<circle cx="' + mp[0].toFixed(1) + '" cy="' + mp[1].toFixed(1) + '" r="21" fill="#F6EFD6" opacity=".95"/>' +
           '<circle cx="' + (mp[0] - 6).toFixed(1) + '" cy="' + (mp[1] - 4).toFixed(1) + '" r="4.4" fill="#DED3B4" opacity=".7"/>';
      /* the telescope on its tripod */
      var tb = P2(3.0, 3.0, 0), tt = P2(3.0, 3.0, 2.0);
      o += '<g stroke="#7A5A28" stroke-width="6" stroke-linecap="round">' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + (tb[0] - 26).toFixed(1) + ' ' + (tb[1] + 6).toFixed(1) + '"/>' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + (tb[0] + 26).toFixed(1) + ' ' + (tb[1] + 6).toFixed(1) + '"/>' +
        '<path d="M' + tt[0].toFixed(1) + ' ' + tt[1].toFixed(1) + ' L' + tb[0].toFixed(1) + ' ' + (tb[1] + 12).toFixed(1) + '"/></g>';
      o += '<g transform="translate(' + tt[0].toFixed(1) + ',' + tt[1].toFixed(1) + ') rotate(-32)">' +
        '<rect x="-13" y="-92" width="27" height="104" rx="11" fill="#C79A3E"/>' +
        '<rect x="-17" y="-104" width="35" height="22" rx="6" fill="#F2DFA6"/>' +
        '<rect x="-10" y="-58" width="21" height="7" fill="#5A3E14"/></g>';
      /* chart table with a star map weighted down */
      o += table(6.0, 5.2, 2.6, 1.8, 1.0, '#5A4A32', '#3A2E18');
      o += box(6.3, 5.5, 1.16, 1.9, 1.2, .06, '#EFE3C8');
      var cp = P2(7.2, 6.1, 1.24);
      o += '<g transform="translate(' + cp[0].toFixed(1) + ',' + cp[1].toFixed(1) + ')" fill="#5A4C2E">' +
        '<circle cx="-16" cy="-4" r="1.8"/><circle cx="0" cy="2" r="1.4"/><circle cx="14" cy="-6" r="2"/>' +
        '<path d="M-16 -4 0 2 14 -6" fill="none" stroke="#5A4C2E" stroke-width="1.2"/></g>';
      o += box(7.9, 5.4, 1.16, .3, .3, .34, '#8A6A32');
      o += rug(4.4, 5.0, 3.0, 2.6, '#2E3A52', '#8A96B4');
      return o;
    }
  };

  /* ---- the other rooms, as doorways standing around this one ---------- */
  var DOOR_ART = {
    saturn: '<svg viewBox="0 0 40 46"><path d="M6 44V16L20 5l14 11v28z" fill="#5A3418" stroke="#C79A3E" stroke-width="2"/>' +
            '<path d="M20 5 34 16M20 5 6 16" stroke="#C79A3E" stroke-width="1.4" fill="none"/>' +
            '<circle cx="27" cy="30" r="2.2" fill="#F2DFA6"/></svg>',
    earth:  '<svg viewBox="0 0 40 46"><path d="M5 44V14h30v30" fill="#3E2410" stroke="#C79A3E" stroke-width="2"/>' +
            '<rect x="9" y="26" width="22" height="18" rx="2" fill="#8E1420"/>' +
            '<rect x="11" y="20" width="11" height="6" rx="3" fill="#EFE3C8"/></svg>',
    mars:   '<svg viewBox="0 0 40 46"><rect x="5" y="7" width="30" height="37" rx="2" fill="#2E1809" stroke="#5A3418" stroke-width="2"/>' +
            '<g fill="#7A2A1E"><rect x="8" y="11" width="5" height="12"/><rect x="14" y="10" width="4" height="13"/></g>' +
            '<g fill="#3E5A34"><rect x="19" y="12" width="5" height="11"/><rect x="25" y="10" width="6" height="13"/></g>' +
            '<path d="M6 24h28" stroke="#5A3418" stroke-width="2.5"/>' +
            '<g fill="#2E3E5E"><rect x="9" y="28" width="5" height="11"/><rect x="15" y="27" width="4" height="12"/></g>' +
            '<g fill="#6A4A18"><rect x="21" y="29" width="6" height="10"/><rect x="28" y="27" width="4" height="12"/></g></svg>',
    ceres:  '<svg viewBox="0 0 40 46"><path d="M8 44V18a12 12 0 0 1 24 0v26z" fill="#16233E" stroke="#C79A3E" stroke-width="2"/>' +
            '<path d="M20 8v36M8 30h24" stroke="#C79A3E" stroke-width="1.6"/>' +
            '<path d="M4 44h32" stroke="#5A3418" stroke-width="3"/></svg>',
    venus:  '<svg viewBox="0 0 40 46"><path d="M23 6 27 36" stroke="#7A4A22" stroke-width="4" stroke-linecap="round"/>' +
            '<path d="M21 34q8 14 16 2-4 8-8 8t-8-10z" fill="#C79A3E"/>' +
            '<circle cx="11" cy="18" r="7" fill="none" stroke="#C79A3E" stroke-width="2"/>' +
            '<path d="M11 25v10" stroke="#C79A3E" stroke-width="2"/></svg>',
    deimos: '<svg viewBox="0 0 40 46"><rect x="6" y="7" width="28" height="35" rx="3" fill="#4A1218" stroke="#C79A3E" stroke-width="2"/>' +
            '<circle cx="20" cy="19" r="6" fill="#EFE3C8" opacity=".65"/>' +
            '<path d="M12 35q8-9 16 0z" fill="#EFE3C8" opacity=".55"/></svg>',
    europa: '<svg viewBox="0 0 40 46"><path d="M10 42 30 14" stroke="#C79A3E" stroke-width="5" stroke-linecap="round"/>' +
            '<path d="M28 8 36 16 32 20 24 12z" fill="#F2DFA6"/>' +
            '<path d="M6 44l8-4" stroke="#7A4A22" stroke-width="3" stroke-linecap="round"/>' +
            '<circle cx="12" cy="14" r="1.6" fill="#F2E6C4"/><circle cx="21" cy="8" r="1.2" fill="#F2E6C4"/></svg>'
  };

  /* six doorways in the corners the model does not occupy */
  var RIM = [[13, 8], [87, 8], [11, 27], [89, 27], [20, 89], [80, 89]];
  var ORDER = ['saturn', 'earth', 'mars', 'ceres', 'venus', 'deimos', 'europa'];
  var DOOR_SPOTS = {};
  ORDER.forEach(function (here) {
    var o = {};
    ORDER.filter(function (x) { return x !== here; }).forEach(function (id, i) { o[id] = RIM[i % 6]; });
    DOOR_SPOTS[here] = o;
  });

  /* what the deeds are pinned to, room by room */
  var BOARDS = {
    saturn: { surface: 'cork',  title: 'The noticeboard' },
    earth:  { surface: 'cloth', title: 'Pinned above the beds' },
    mars:   { surface: 'baize', title: 'Slips in the ledger' },
    ceres:  { surface: 'oak',   title: 'Laid along the table' },
    venus:  { surface: 'cork',  title: 'The team sheet' },
    deimos: { surface: 'slate', title: 'Chalked on the slate' },
    europa: { surface: 'chart', title: 'Weighted on the chart table' }
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
     One image per room, and the coordinates of the things worth walking to.
     u/v are fractions of the image — u 0 is its left edge, v 0 its top — so a
     pin sits on the same brick no matter how far in you are zoomed.
     `home` is where the camera starts and how close.
     ---------------------------------------------------------------------- */
  var DIORAMA = {
    saturn: {
      src: 'art/gryffindor-common-room-wide.webp',
      home:  { u: 0.50, v: 0.52, z: 1.12 },
      board: { u: 0.820, v: 0.700, z: 3.4 },
      pins: {
        earth:  { u: 0.560, v: 0.520 },   /* the archway out to the stairs */
        mars:   { u: 0.062, v: 0.440 },   /* the arched door, far left     */
        ceres:  { u: 0.955, v: 0.415 },   /* the great tapestry            */
        venus:  { u: 0.790, v: 0.395 },   /* the right-hand arch           */
        deimos: { u: 0.288, v: 0.420 },   /* the crest above the hearth    */
        europa: { u: 0.505, v: 0.235 }    /* up past the chandelier        */
      },
      notes: [
        { u: 0.300, v: 0.730, text: 'the hearth' },
        { u: 0.430, v: 0.870, text: 'the good armchair' }
      ]
    }
  };

  var PANORAMA = {
    saturn: {
      src: 'art/gryffindor-common-room-pano.webp',
      start: { yaw: 0, pitch: -4 },
      board: { yaw: 0, pitch: -3 }
    }
  };

  var BOARD_ART = '<svg viewBox="0 0 40 44"><rect x="3" y="5" width="34" height="30" rx="2" fill="#A8783E" stroke="#6A3E1C" stroke-width="3"/>' + '<rect x="9" y="10" width="11" height="9" fill="#EFE3C8" transform="rotate(-4 14 14)"/>' + '<rect x="22" y="14" width="10" height="9" fill="#EFE3C8" transform="rotate(5 27 18)"/>' + '<rect x="12" y="22" width="12" height="8" fill="#F6EEDC" transform="rotate(2 18 26)"/></svg>';

  var ART = {
    saturn: 'art/gryffindor-common-room.webp'
  };

  ORIGIN_THEMES.define({
    id: 'gryffindor',
    name: 'Gryffindor',
    tagline: 'Brave · Daring · Courageous',

    tokens: {
      void: '#22100E', deep: '#2C1512',
      surface: 'rgba(58,26,22,0.86)', 'surface-2': 'rgba(239,227,200,0.06)',
      'surface-hover': 'rgba(239,227,200,0.10)', raised: '#331613', toast: '#331613',
      overlay: 'rgba(16,6,5,.84)', track: 'rgba(0,0,0,.45)', input: 'rgba(16,7,6,0.6)',
      scroll: '#6A3226', shadow: 'rgba(30,8,6,.7)',
      line: 'rgba(199,154,62,0.30)', 'line-soft': 'rgba(199,154,62,0.15)',
      'line-hard': 'rgba(242,223,166,0.55)',
      txt: '#F7EBD6', 'txt-2': '#D9BE99', 'txt-3': '#B29470', 'on-accent': '#2A0E0C',
      accent: '#D22B2B', 'accent-hi': '#F2C230', 'accent-dim': '#8E1420',
      'accent-wash': 'rgba(210,43,43,0.20)',
      gold: '#F2C230', warn: '#E0A24A', danger: '#EE7A62', ok: '#9EBF63', info: '#E0A24A',
      milestone: '#F2C230', penalty: '#EE7A62',
      'focus-work': '#D22B2B', 'focus-break': '#9EBF63', 'focus-long': '#F2C230',

      'f-display': "'Caveat',cursive", 'f-body': "'Lora',Georgia,serif",
      'f-mono': "'Lora',Georgia,serif",
      'f-display-scale': '1.5', 'f-ui-scale': '1.0',
      'tt-display': 'none', 'ls-display': '.01em',
      'f-label': "'Caveat',cursive", 'tt-label': 'none', 'ls-label': '.02em',

      radius: '4px', 'radius-lg': '7px', 'chip-radius': '20px', 'border-w': '1px',
      'panel-clip': 'none', 'card-clip': 'none'
    },

    fonts: {
      display: 'Caveat', body: 'Lora', mono: 'Lora',
      googleHref: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700' +
                  '&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap'
    },

    /* Scarlet is the room and gold is the metal, so neither operator may be
       either. Copper and verdigris — the two things on the mantelpiece that
       tarnish. */
    ops: { a: '#E28A4C', b: '#78BBA6' },

    copy: {
      chart: 'Common Room', tasks: 'Classrooms', focus: 'Time-Turner',
      market: 'Hogsmeade', wagers: 'Quidditch Pitch', log: "Headmaster's Office",
      chartFn: 'Where house points come from', tasksFn: 'To-do list & assignments',
      focusFn: 'Focus timers', marketFn: 'Rewards', wagersFn: 'Wagers',
      logFn: 'Logs & transcripts',
      score: 'House Points', scoreVerb: 'Award', scoreVerbPast: 'Awarded', scored: 'awarded',
      item: 'Deed', items: 'Deeds', group: 'Room', groups: 'Rooms',
      person: 'Student', people: 'Students',
      typeRitual: 'Charm', typeGoal: 'Lesson', typeMilestone: 'Trial', typePenalty: 'Detention',
      typeRitualHint: 'kept every day', typeGoalHint: 'a challenge you return to',
      typeMilestoneHint: 'a great deed, once', typePenaltyHint: 'points docked',
      cadDaily: 'every day', cadWeekly: 'every week', cadOnce: 'once only',
      brand: 'Gryffindor House', season: 'Term', rank: 'Year',
      emptyGroup: 'Nothing pinned up in here yet. Do something worth writing down.',
      emptyTasks: 'The board is clear. Set yourself something.',
      emptyLog: 'No points awarded yet this term.',
      emptyMarket: 'Nothing on offer in the village.',
      emptyWagers: 'No wagers standing. Someone start one.',
      emptyFeed: 'Nothing awarded today — the day is young.',
      toastAwarded: '{what} — awarded to {who}',
      toastReverted: 'Taken back · {what}',
      toastNothingToUndo: 'There is nothing left to take back.',
      toastLocked: 'needs {item} first'
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
      tiers: [{ n: 'First Year', c: '#B99A72' }, { n: 'Duellist', c: '#D89A5C' },
              { n: 'Chaser', c: '#E28A4C' }, { n: 'Beater', c: '#D9603C' },
              { n: 'Seeker', c: '#F2C230' }, { n: 'Lionheart', c: '#EE7A62' },
              { n: 'Prefect', c: '#E29A62' }, { n: 'Head of House', c: '#FFEBC8' }],
      cycles: ['', ' the Second', ' the Third', ' the Fourth', ' the Fifth',
               ' the Sixth', ' the Seventh', ' the Eighth']
    },

    motion: { ease: 'cubic-bezier(.34,.68,.3,1)', dur: '.26s', enter: '.34s', hover: 'translateY(-2px)' },
    sound: {
      up:    { type: 'triangle', gain: 0.13, seq: [[392, 0], [523, .09], [659, .18]] },
      down:  { type: 'triangle', gain: 0.13, seq: [[349, 0], [262, .11]] },
      phase: { type: 'triangle', gain: 0.12, seq: [[440, 0], [523, .12], [659, .24]] }
    },
    confetti: ['#D22B2B', '#F2C230', '#E28A4C'],
    themeColor: '#22100E',
    favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2322100E'/%3E%3Cpath d='M32 12c9.3 0 16.5 6.1 16.5 14.4 0 4.5-2.1 7.7-4.5 10.1 2.7 2.7 4.5 5.9 4.5 9.9C48.5 54.6 41.3 61 32 61s-16.5-6.4-16.5-14.6c0-4 1.8-7.2 4.5-9.9-2.4-2.4-4.5-5.6-4.5-10.1C15.5 18.1 22.7 12 32 12Z' fill='none' stroke='%23F2C230' stroke-width='4'/%3E%3C/svg%3E",

    texture:
      'radial-gradient(ellipse 58% 34% at 50% 104%, rgba(255,140,52,0.26), transparent 66%),' +
      'radial-gradient(ellipse 84% 50% at 14% 6%, rgba(110,22,20,0.44), transparent 64%),' +
      'radial-gradient(ellipse 80% 48% at 92% 88%, rgba(130,50,22,0.26), transparent 66%),' +
      'linear-gradient(#2A1310,#22100E 52%,#1A0B09)',

    css: [
      /* ---------- no glass anywhere in this house ---------- */
      '.panel{backdrop-filter:none !important;-webkit-backdrop-filter:none !important;',
      '  background-image:linear-gradient(168deg,rgba(255,214,160,.07),transparent 62%);',
      '  box-shadow:0 12px 30px var(--shadow);border-color:var(--line);}',
      '.panel::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;pointer-events:none;',
      '  background:linear-gradient(90deg,transparent,var(--line-hard) 16%,var(--line-hard) 84%,transparent);}',
      '#nav,.pal,.modal,.toast{backdrop-filter:none !important;-webkit-backdrop-filter:none !important;}',
      '#nav{background:linear-gradient(180deg,#4A2114,#331610);border:1px solid var(--line);',
      '  box-shadow:0 6px 18px rgba(0,0,0,.45);}',
      'body{font-size:15px;}',
      '.brand-title{font-size:2.1em;line-height:1;}',
      '.creed{font-family:var(--f-display);font-size:1.15em;color:var(--gold);opacity:.85;}',

      /* buttons: worn, rounded, warm on hover */
      '.btn{border-radius:var(--chip-radius);padding:7px 16px;font-weight:600;}',
      '.btn.sm{border-radius:14px;padding:4px 12px;}',
      '.btn.icon{border-radius:50%;}',
      '.btn:hover:not(:disabled){background:var(--accent-wash);border-color:var(--line-hard);color:var(--gold);}',
      '.nav-btn{border-radius:var(--chip-radius);font-weight:600;}',
      '.nav-btn.on,.btn.pri{background:var(--accent);color:#FFF3E0;}',
      '.nav-btn.on{box-shadow:0 2px 14px -5px var(--accent);}',
      '.btn.on{color:var(--gold);border-color:var(--gold);background:var(--accent-wash);}',
      '.brand-glyph{border-radius:50%;background:radial-gradient(circle at 34% 28%,#F6E0A8,#9C7734);',
      '  color:#2A0E0C;box-shadow:0 2px 10px rgba(0,0,0,.5),inset 0 -2px 6px rgba(80,50,10,.6);}',
      '.gate-glyph{border-radius:50%;background:radial-gradient(circle at 34% 28%,#F6E0A8,#9C7734);}',

      /* ================= THE ROOM ================= */
      '.gr-room{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.04fr);gap:18px;',
      '  align-items:start;}',
      '.gr-stage{position:sticky;top:14px;aspect-ratio:1/1;border-radius:8px;overflow:hidden;',
      '  background:radial-gradient(ellipse 74% 62% at 50% 46%,#3E2118,#150908 78%);',
      '  box-shadow:0 26px 60px -22px rgba(0,0,0,.9),inset 0 0 80px rgba(0,0,0,.6);}',
      '.gr-stage svg{display:block;width:100%;height:100%;}',
      '.gr-doors{position:absolute;inset:0;}',
      '.gr-render{display:block;width:100%;height:100%;object-fit:cover;transform:scale(1.1);}',
      '.gr-stage.rendered::after{content:"";position:absolute;inset:0;pointer-events:none;',
      '  background:radial-gradient(ellipse 76% 76% at 50% 48%,transparent 52%,rgba(0,0,0,.55) 100%);}',

      '.gr-door{position:absolute;transform:translate(-50%,-50%);background:none;border:0;padding:4px;',
      '  display:flex;flex-direction:column;align-items:center;gap:1px;width:92px;',
      '  transition:transform .22s var(--ease),filter .22s var(--ease);}',
      '.gr-door svg{width:36px;height:41px;filter:drop-shadow(0 3px 6px rgba(0,0,0,.85));}',
      '.gr-door .lbl{font-family:var(--f-display);font-size:16px;line-height:1.02;color:#FBEBC6;',
      '  text-shadow:0 1px 3px #000,0 0 12px rgba(0,0,0,.95);}',
      '.gr-door .n{font-family:var(--f-display);font-size:12.5px;color:var(--gold);opacity:.9;',
      '  text-shadow:0 1px 3px #000;}',
      '.gr-door:hover,.gr-door:focus-visible{transform:translate(-50%,-50%) scale(1.14);',
      '  filter:brightness(1.35);outline:none;}',
      '.gr-door:focus-visible .lbl{text-decoration:underline;}',

      /* the board, mounted on the wall of the room */
      '.gr-board{position:relative;padding:15px 17px 17px;display:flex;flex-direction:column;',
      '  border:10px solid #6A3E1C;border-radius:5px;',
      '  box-shadow:0 18px 40px rgba(0,0,0,.62),inset 0 0 46px rgba(0,0,0,.42),',
      '   0 0 0 2px rgba(255,220,160,.2);}',
      '.gr-board.cork{background:#A8783E;background-image:',
      '  radial-gradient(circle at 22% 32%,rgba(84,46,16,.45) 0 2px,transparent 3px),',
      '  radial-gradient(circle at 64% 68%,rgba(84,46,16,.4) 0 2px,transparent 3px),',
      '  radial-gradient(circle at 84% 16%,rgba(112,64,26,.45) 0 1.6px,transparent 3px),',
      '  radial-gradient(circle at 40% 86%,rgba(64,36,10,.36) 0 2px,transparent 3px),',
      '  linear-gradient(150deg,#B8864A,#8A5E28);',
      '  background-size:26px 26px,34px 34px,22px 22px,30px 30px,100% 100%;}',
      '.gr-board.cloth{background:#6A1220;background-image:',
      '  repeating-linear-gradient(38deg,rgba(255,220,180,.06) 0 2px,transparent 2px 5px),',
      '  linear-gradient(160deg,#7E1622,#4E0D14);}',
      '.gr-board.baize{background:#243A24;background-image:',
      '  repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px),',
      '  linear-gradient(160deg,#33512F,#182818);}',
      '.gr-board.oak{background:#4E2C14;background-image:',
      '  repeating-linear-gradient(6deg,rgba(0,0,0,.2) 0 2px,transparent 2px 9px),',
      '  linear-gradient(160deg,#6E4422,#36200E);}',
      '.gr-board.slate{background:#282C29;background-image:',
      '  repeating-linear-gradient(24deg,rgba(255,255,255,.03) 0 1px,transparent 1px 7px),',
      '  linear-gradient(160deg,#363C38,#1A1E1A);}',
      '.gr-board.chart{background:#443C30;background-image:',
      '  repeating-linear-gradient(0deg,rgba(242,230,196,.09) 0 1px,transparent 1px 18px),',
      '  repeating-linear-gradient(90deg,rgba(242,230,196,.09) 0 1px,transparent 1px 18px),',
      '  linear-gradient(160deg,#5C5242,#2C261E);}',
      '.gr-board::after{content:"";position:absolute;inset:0;pointer-events:none;',
      '  box-shadow:inset 0 0 55px rgba(0,0,0,.5);}',
      '.gr-board-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;',
      '  flex-wrap:wrap;margin-bottom:11px;position:relative;z-index:1;}',
      '.gr-board-head h2{font-family:var(--f-display);font-size:1.95em;line-height:.95;color:#FFF4DC;',
      '  text-shadow:0 2px 5px rgba(0,0,0,.75);text-transform:none;letter-spacing:0;}',
      '.gr-board-head .where{font-family:var(--f-display);font-size:1.15em;color:#F6DCA8;opacity:.85;',
      '  text-shadow:0 1px 3px rgba(0,0,0,.7);}',
      '.gr-board-head .tally{font-family:var(--f-display);font-size:1.25em;color:#FFE9B4;',
      '  text-shadow:0 1px 3px rgba(0,0,0,.7);}',
      '.gr-board-tools{display:flex;gap:6px;flex-wrap:wrap;position:relative;z-index:1;margin-bottom:12px;}',
      '.gr-board-tools .btn{background:rgba(20,8,4,.46);border-color:rgba(255,228,180,.36);color:#FFEBC8;}',
      '.gr-board-tools .btn.on{background:rgba(210,43,43,.55);border-color:#FFE9B4;color:#FFF4DC;}',
      '.gr-notes{display:grid;grid-template-columns:repeat(auto-fill,minmax(186px,1fr));gap:13px;',
      '  align-content:start;position:relative;z-index:1;padding:4px 2px 6px;}',
      /* ---- the deed: a piece of parchment on a brass tack ---- */
      '.gr-note{position:relative;background:#EFE3C8;color:#3A2A18;padding:12px 12px 10px;',
      '  border-radius:2px;transform:rotate(var(--tilt,0deg));',
      '  box-shadow:0 5px 12px rgba(0,0,0,.5),0 1px 0 rgba(255,255,255,.4) inset;',
      '  transition:transform .2s var(--ease),box-shadow .2s var(--ease);',
      '  background-image:radial-gradient(ellipse at 12% 8%,rgba(180,150,100,.28),transparent 60%),',
      '   radial-gradient(ellipse at 88% 92%,rgba(160,130,80,.24),transparent 62%);',
      '  clip-path:polygon(0 3px,3px 0,calc(100% - 4px) 2px,100% 5px,calc(100% - 2px) calc(100% - 3px),',
      '   calc(100% - 6px) 100%,4px calc(100% - 2px),0 calc(100% - 5px));}',
      '.gr-note:hover{transform:rotate(0deg) translateY(-3px);box-shadow:0 12px 22px rgba(0,0,0,.6);}',
      '.gr-note .tack{position:absolute;top:-7px;left:50%;transform:translateX(-50%);width:15px;height:15px;',
      '  border-radius:50%;background:radial-gradient(circle at 34% 30%,#F6E3AE,#9C7020 70%,#5E4210);',
      '  box-shadow:0 3px 5px rgba(0,0,0,.6);}',
      '.gr-note .head{display:flex;align-items:baseline;gap:8px;margin:3px 0 4px;}',
      '.gr-note .deed{font-family:var(--f-display);font-size:1.4em;line-height:1.06;',
      '  color:#2E2012;flex:1;min-width:0;word-break:break-word;}',
      '.gr-note .meta{font-family:var(--f-body);font-size:10.5px;color:#7A6440;',
      '  font-style:italic;margin-bottom:9px;}',
      '.gr-note .pts{font-family:var(--f-display);font-size:1.22em;color:#8E1420;',
      '  flex:none;white-space:nowrap;}',
      '.gr-note.pen .pts{color:#8E1420;}',
      '.gr-note.pen{background:#2E3330;color:#DCE4DA;',
      '  background-image:repeating-linear-gradient(28deg,rgba(255,255,255,.02) 0 1px,transparent 1px 6px);}',
      '.gr-note.pen .deed{color:#EFE8D6;}',
      '.gr-note.pen .meta{color:#9AA894;}',
      '.gr-note.pen .pts{color:#EE9A88;}',
      '.gr-note.pen .tack{background:radial-gradient(circle at 34% 30%,#E8E8E8,#8A8A8A 70%,#4A4A4A);}',
      '.gr-note.big{box-shadow:0 5px 12px rgba(0,0,0,.5),0 0 0 2px rgba(242,194,48,.55);}',
      '.gr-note.big .tack{background:radial-gradient(circle at 34% 30%,#FFF0BC,#F2C230 70%,#9C7020);}',
      '.gr-note.locked{filter:grayscale(.45) brightness(.82);}',
      '.gr-note-acts{display:flex;gap:5px;flex-wrap:wrap;align-items:center;}',
      '.gr-claim{font-family:var(--f-body);font-size:12px;font-weight:600;padding:4px 11px;',
      '  border-radius:14px;border:1.5px solid var(--oc);color:#3A2A18;background:rgba(255,255,255,.42);',
      '  transition:background .15s,transform .1s;}',
      '.gr-claim:hover:not(:disabled){background:var(--oc);color:#241206;}',
      '.gr-claim:active:not(:disabled){transform:scale(.94);}',
      '.gr-claim:disabled{opacity:.45;cursor:not-allowed;}',
      '.gr-note.pen .gr-claim{color:#E8EEE4;background:rgba(0,0,0,.28);}',
      '.gr-note.pen .gr-claim:hover:not(:disabled){background:var(--oc);color:#141614;}',
      '.gr-mini{background:none;border:0;padding:3px 5px;color:#8A7248;display:flex;}',
      '.gr-mini:hover{color:#8E1420;}',
      '.gr-note.pen .gr-mini{color:#8A9484;}',
      '.gr-req{font-family:var(--f-body);font-size:10px;font-style:italic;color:#8A6A2E;',
      '  display:block;margin-bottom:6px;}',
      '.gr-empty{font-family:var(--f-display);font-size:1.5em;color:#F6E3BC;opacity:.75;padding:20px 6px;',
      '  text-shadow:0 2px 4px rgba(0,0,0,.6);}',

      /* ---- the wall plate: cast gold, name and number struck in ---- */
      '.ops{gap:16px;}',
      '.gr-plate{position:relative;padding:16px 22px 18px;',
      '  background:linear-gradient(158deg,#F6DFA4,#C79A3E 46%,#8C6420);',
      '  border-radius:5px;color:#2E1C06;',
      '  box-shadow:0 10px 26px rgba(0,0,0,.6),inset 0 2px 0 rgba(255,246,214,.7),',
      '   inset 0 -3px 6px rgba(90,60,10,.5);}',
      '.gr-plate::before{content:"";position:absolute;inset:6px;border:1.5px solid rgba(80,52,10,.45);',
      '  border-radius:3px;pointer-events:none;}',
      '.gr-plate.silver{background:linear-gradient(158deg,#F2F4F2,#B8C0BC 46%,#78827E);color:#1E2422;}',
      '.gr-plate .corner{position:absolute;width:16px;height:16px;opacity:.55;}',
      '.gr-plate .corner svg{width:100%;height:100%;}',
      '.gr-plate .c1{top:9px;left:9px;} .gr-plate .c2{top:9px;right:9px;transform:scaleX(-1);}',
      '.gr-plate .c3{bottom:9px;left:9px;transform:scaleY(-1);} .gr-plate .c4{bottom:9px;right:9px;transform:scale(-1);}',
      '.gr-plate .who{display:flex;align-items:center;gap:7px;font-family:var(--f-display);',
      '  font-size:1.7em;line-height:1;color:#3A2408;cursor:pointer;}',
      '.gr-plate .who .house-mark{display:flex;}',
      '.gr-plate .val{font-family:var(--f-display);font-size:2.9em;line-height:.95;margin:2px 0 0;',
      '  text-shadow:0 1px 0 rgba(255,248,220,.6);}',
      '.gr-plate .sub{display:flex;gap:12px;flex-wrap:wrap;font-family:var(--f-body);font-size:11px;',
      '  color:#5A4210;margin-top:4px;}',
      '.gr-plate.silver .sub{color:#3E4644;}',
      '.gr-plate .rank{font-family:var(--f-display);font-size:1.25em;text-align:right;line-height:1;}',
      '.gr-plate .bar{height:5px;margin-top:9px;border-radius:3px;background:rgba(70,44,6,.35);overflow:hidden;}',
      '.gr-plate .bar i{display:block;height:100%;background:linear-gradient(90deg,#8E1420,#D22B2B);}',
      '.gr-plate.silver .bar i{background:linear-gradient(90deg,#2E4A44,#5E8A7E);}',
      '.gr-plate.lead{box-shadow:0 10px 26px rgba(0,0,0,.6),0 0 0 2px #F2C230,',
      '  inset 0 2px 0 rgba(255,246,214,.7),inset 0 -3px 6px rgba(90,60,10,.5);}',
      '.gr-plate .top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}',

      /* ---- the fire ---- */
      '.gr-f1{animation:gr-f1 2.3s ease-in-out infinite;transform-origin:50% 100%;}',
      '.gr-f2{animation:gr-f2 1.7s ease-in-out infinite;transform-origin:50% 100%;}',
      '.gr-f3{animation:gr-f3 1.1s ease-in-out infinite;transform-origin:50% 100%;}',
      '.gr-glow{animation:gr-glow 3.1s ease-in-out infinite;transform-origin:50% 100%;}',
      '.gr-candle{animation:gr-f3 1.9s ease-in-out infinite;transform-origin:50% 100%;}',
      '@keyframes gr-f1{0%,100%{transform:scaleY(1) scaleX(1);opacity:.88;}',
      '  30%{transform:scaleY(1.1) scaleX(.94) translateX(-1px);opacity:1;}',
      '  62%{transform:scaleY(.94) scaleX(1.06) translateX(1.5px);opacity:.82;}}',
      '@keyframes gr-f2{0%,100%{transform:scaleY(.96) scaleX(1.04) translateX(1px);opacity:.8;}',
      '  44%{transform:scaleY(1.14) scaleX(.9) translateX(-1.5px);opacity:1;}}',
      '@keyframes gr-f3{0%,100%{transform:scaleY(1.06) scaleX(.96);opacity:.95;}',
      '  50%{transform:scaleY(.9) scaleX(1.08);opacity:.7;}}',
      '@keyframes gr-glow{0%,100%{opacity:.5;}40%{opacity:.72;}70%{opacity:.56;}}',

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
      '.day-h,.eyebrow,.panel-h .t{font-family:var(--f-display);font-size:1.12em;letter-spacing:.01em;}',

      /* ---------- phones: the room becomes a band, the board flows ---------- */
      '@media(max-width:880px){',
      '  .gr-room{grid-template-columns:minmax(0,1fr);gap:14px;}',
      '  .gr-stage{aspect-ratio:1/.86;}',
      '  .gr-board{border-width:8px;}',
      '  .gr-door{width:74px;padding:2px;}',
      '  .gr-door svg{width:27px;height:30px;}',
      '  .gr-door .lbl{font-size:12px;} .gr-door .n{font-size:10px;}',
      '  .ops{grid-template-columns:1fr;}',
      '}',
      '@media(max-width:520px){',
      '  .gr-notes{grid-template-columns:1fr;}',
      '  .gr-door{width:62px;} .gr-door .lbl{font-size:11px;}',
      '  .gr-board-head h2{font-size:1.7em;}',
      '}',
      '@media(prefers-reduced-motion:reduce){',
      '  .gr-f1,.gr-f2,.gr-f3,.gr-glow,.gr-candle{animation:none;}}'
    ].join('\n') + '\n' + window.ORIGIN_PANO.baseCss + '\n' + window.ORIGIN_DIO.baseCss + '\n' + [
      '.gr-panel{background:#A8783E;background-image:',
      '  radial-gradient(circle at 22% 32%,rgba(84,46,16,.45) 0 2px,transparent 3px),',
      '  radial-gradient(circle at 64% 68%,rgba(84,46,16,.4) 0 2px,transparent 3px),',
      '  linear-gradient(150deg,#B8864A,#7E5422);background-size:26px 26px,34px 34px,100% 100%;',
      '  border-left:10px solid #6A3E1C;}',
      '@media(max-width:880px){.gr-panel{border-left:0;border-top:8px solid #6A3E1C;}}',
      '.gr-panel .pano-tools .btn,.gr-panel .dio-tools .btn{background:rgba(20,8,4,.46);border-color:rgba(255,228,180,.36);color:#FFEBC8;}',
      '.gr-panel .pano-tools .btn.on,.gr-panel .dio-tools .btn.on{background:rgba(210,43,43,.55);border-color:#FFE9B4;color:#FFF4DC;}',
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
        return '<div class="gr-plate' + (o.lead ? ' lead' : '') + (silver ? ' silver' : '') + '">' +
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
        window.ORIGIN_DIO.wire(ctx, { pre: 'gr', rooms: DIORAMA });
        return;
      }
      if (!PANORAMA[ctx.active.id] || !window.ORIGIN_PANO || !window.ORIGIN_PANO.ready || window.ORIGIN_PANO.failed) return;
      window.ORIGIN_PANO.roomWire(ctx, { pre: 'gr', rooms: PANORAMA });
    },

    roomView: function (ctx) {
      var esc = ctx.esc;
      var pl = ctx.active;
      if (!pl) return '<div class="gr-empty">No rooms yet.</div>';
      var art = ART[pl.id] ? '' : (ROOMS[pl.id] || ROOMS.saturn)(ctx);
      var board = BOARDS[pl.id] || BOARDS.saturn;

      /* the other rooms, standing in this one */
      var spots = DOOR_SPOTS[pl.id] || DOOR_SPOTS.saturn;
      var doors = ctx.places.filter(function (q) { return q.id !== pl.id; }).map(function (q) {
        var s = spots[q.id] || [50, 50];
        return '<button class="gr-door" data-act="planet" data-p="' + esc(q.id) + '"' +
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
          return '<button class="gr-claim" style="--oc:' + c.color + '" data-act="claim"' +
            ' data-id="' + esc(d.id) + '" data-p="' + c.party + '"' +
            (c.locked ? ' disabled title="' + esc(ctx.C('toastLocked', { item: d.req.name })) + '"' : '') + '>' +
            esc(lbl) + (c.n ? ' ×' + c.n : '') + '</button>' +
            (c.n ? '<button class="gr-mini" data-act="undo" data-id="' + esc(d.id) + '" data-p="' + c.party +
                   '" title="Take it back">' + ctx.ICON('undo', 13) + '</button>' : '');
        }).join('');
        return '<div class="gr-note' + (d.isPen ? ' pen' : '') + (d.kind === 'milestone' ? ' big' : '') +
          (locked ? ' locked' : '') + '" style="--tilt:' + tilt + 'deg">' +
          '<span class="tack"></span>' +
          '<div class="head"><div class="deed">' + esc(d.name) + '</div>' +
            '<span class="pts">' + ctx.fmt(d.pts) + '</span></div>' +
          '<div class="meta">' + esc(d.typeName) + ' · ' + esc(d.cad) +
            (d.ownerName ? ' · ' + esc(d.ownerName) : '') + '</div>' +
          (d.req ? '<span class="gr-req">' + esc(ctx.C('toastLocked', { item: d.req.name })) + '</span>' : '') +
          '<div class="gr-note-acts">' + acts +
            '<button class="gr-mini" style="margin-left:auto" data-act="node-edit" data-id="' + esc(d.id) +
            '" title="Edit">' + ctx.ICON('more', 13) + '</button></div>' +
        '</div>';
      }).join('');

      var shellCfg = {
        pre: 'gr', doorArt: DOOR_ART, boardArt: BOARD_ART,
        boardTitle: board.title, boardSurface: 'gr-panel',
        open: ctx.boardOpen(),
        fallbackPins: [{ u: .12, v: .3 }, { u: .3, v: .25 }, { u: .7, v: .25 },
                       { u: .88, v: .3 }, { u: .2, v: .8 }, { u: .8, v: .8 }],
        tools: ['all'].concat(ctx.parties).map(function (w) {
          return '<button class="btn sm' + (ctx.who === w ? ' on' : '') + '" data-act="who" data-w="' + w + '">' +
            (w === 'all' ? 'Everyone' : esc(ctx.nameOf(w))) + '</button>';
        }).join('') +
          '<button class="btn sm" data-act="node-new">+ ' + esc(ctx.C('item')) + '</button>' +
          '<button class="btn sm" data-act="planet-edit">Edit room</button>',
        deeds: notes || '<div class="gr-empty">' + esc(ctx.C('emptyGroup')) + '</div>'
      };

      /* the room has been rendered: hold a camera over it */
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

      return '<div class="gr-room">' +
        '<div class="gr-stage' + (ART[pl.id] ? ' rendered' : '') + '">' +
          (ART[pl.id]
            ? '<img class="gr-render" src="' + esc(ART[pl.id]) + '" alt="' + esc(ctx.name(pl)) + '" ' +
              'loading="lazy" decoding="async">'
            : '<svg viewBox="-26 -14 956 756" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
              esc(ctx.name(pl)) + '">' + grDefs() + art + '</svg>') +
          '<div class="gr-doors">' + doors + '</div>' +
        '</div>' +
        '<div class="gr-board ' + board.surface + '">' +
          '<div class="gr-board-head">' +
            '<div><div class="where">' + esc(board.title) + '</div>' +
              '<h2>' + esc(ctx.name(pl)) + '</h2></div>' +
            '<div class="tally">' + ctx.nodes.length + ' ' +
              esc((ctx.nodes.length === 1 ? ctx.C('item') : ctx.C('items')).toLowerCase()) +
              ' · ' + ctx.fmt(earned) + ' today</div>' +
          '</div>' +
          '<div class="gr-board-tools">' + filter +
            '<button class="btn sm" data-act="node-new">+ ' + esc(ctx.C('item')) + '</button>' +
            '<button class="btn sm" data-act="planet-edit">Edit room</button>' +
            '<button class="btn sm" data-act="planet-new">+ Room</button></div>' +
          '<div class="gr-notes">' + (notes || '<div class="gr-empty">' + esc(ctx.C('emptyGroup')) + '</div>') + '</div>' +
        '</div>' +
      '</div>';
    }
  });

  /* gradients shared by every room */
  function grDefs() {
    return '<defs>' +
      '<linearGradient id="grPane" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#B8CBE0"/><stop offset="100%" stop-color="#5E7490"/></linearGradient>' +
      '<linearGradient id="grPaneNight" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#2E4468"/><stop offset="100%" stop-color="#101A2E"/></linearGradient>' +
      '<linearGradient id="grPaneCold" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#8FA2B8"/><stop offset="100%" stop-color="#3E4A5C"/></linearGradient>' +
      '<linearGradient id="grNightSky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#101A34"/><stop offset="100%" stop-color="#050A16"/></linearGradient>' +
      '<linearGradient id="grPitchSky" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#33628E"/><stop offset="58%" stop-color="#4A7A44"/>' +
        '<stop offset="100%" stop-color="#2A4A22"/></linearGradient>' +
      '<radialGradient id="roomGlow" cx="50%" cy="60%" r="60%">' +
        '<stop offset="0%" stop-color="#FFE8B8"/><stop offset="34%" stop-color="#FF8A32"/>' +
        '<stop offset="100%" stop-color="rgba(190,40,20,0)"/></radialGradient>' +
    '</defs>';
  }
})();
