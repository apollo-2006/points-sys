/* ==========================================================================
   ORIGIN SYSTEM — the control.
   Every value here is lifted from the pre-refactor stylesheet unchanged. If
   this theme does not render pixel-identical to the app before the theme
   layer existed, the abstraction is leaking and the leak is a bug.
   ========================================================================== */
(function () {
  var U = ORIGIN_THEMES.util;
  var B = U.baseIcons({ weight: 1.5, cap: 'butt', join: 'miter' });
  var I = B.I, F = B.F;

  ORIGIN_THEMES.define({
    id: 'origin',
    name: 'Origin System',
    tagline: 'Focus · Discipline · Momentum',

    /* ---- the original token values, verbatim ---- */
    tokens: {
      void: '#04070C', deep: '#070C14',
      surface: 'rgba(14,24,36,0.66)', 'surface-2': 'rgba(255,255,255,0.035)',
      'surface-hover': 'rgba(20,32,46,.7)', raised: '#0A121C', toast: '#0B1521',
      overlay: 'rgba(2,5,9,.76)', track: 'rgba(0,0,0,.55)', input: 'rgba(4,10,16,0.6)',
      scroll: '#1B2A38', shadow: '#000000',
      line: 'rgba(126,197,214,0.16)', 'line-soft': 'rgba(126,197,214,0.09)',
      'line-hard': 'rgba(126,197,214,0.34)',
      txt: '#E6EEF2', 'txt-2': '#93A6B4', 'txt-3': '#5E7183', 'on-accent': '#04121A',
      accent: '#6FD9E8', 'accent-hi': '#A6ECF4', 'accent-dim': '#2C7A8A',
      'accent-wash': 'rgba(111,217,232,0.12)',
      gold: '#E5C079', warn: '#E5C079', danger: '#FF5B5B', ok: '#4CD98B', info: '#6FD9E8',
      milestone: '#E5C079', penalty: '#E2564E',
      'focus-work': '#6FD9E8', 'focus-break': '#4FE0A0', 'focus-long': '#E5C079',
      'f-display': "'Chakra Petch',sans-serif",
      'f-body': "'Inter',system-ui,sans-serif",
      'f-mono': "'Share Tech Mono',monospace",
      'f-display-scale': '1', 'f-ui-scale': '1',
      'tt-display': 'uppercase', 'ls-display': '.1em',
      'f-label': "'Share Tech Mono',monospace", 'tt-label': 'uppercase', 'ls-label': '.22em',
      radius: '3px', 'radius-lg': '3px', 'chip-radius': '20px', 'border-w': '1px',
      'panel-clip': 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',
      'card-clip': 'polygon(0 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%)'
    },

    fonts: {
      display: 'Chakra Petch', body: 'Inter', mono: 'Share Tech Mono',
      googleHref: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700' +
                  '&family=Inter:wght@400;500;600&family=Share+Tech+Mono&display=swap'
    },

    /* the two identity colours the app shipped with */
    ops: { a: '#FF6B5B', b: '#4FE0A0' },

    copy: {
      chart: 'Star Chart', tasks: 'Foundry', focus: 'Focus',
      market: 'Market', wagers: 'Conclave', log: 'Codex',
      chartFn: 'Where standing comes from', tasksFn: 'To-do list & assignments',
      focusFn: 'Focus timers', marketFn: 'Rewards', wagersFn: 'Wagers',
      logFn: 'Logs & transcripts',
      score: 'Standing', scoreVerb: 'Claim', scoreVerbPast: 'Claimed', scored: 'claimed',
      item: 'Node', items: 'Nodes', group: 'Planet', groups: 'Planets',
      person: 'Operator', people: 'Operators',
      typeRitual: 'SURVIVAL', typeGoal: 'CAPTURE',
      typeMilestone: 'ASSASSINATION', typePenalty: 'OUTBREAK',
      typeRitualHint: 'daily habit', typeGoalHint: 'a goal you repeat',
      typeMilestoneHint: 'big one-off', typePenaltyHint: 'penalty',
      cadDaily: 'DAILY', cadWeekly: 'WEEKLY', cadOnce: 'ONE-OFF',
      brand: 'Origin System', season: 'Season', rank: 'RANK',
      emptyGroup: 'Nothing charted on this planet yet — add a node.',
      emptyTasks: 'Nothing queued. Type above and hit enter.',
      emptyLog: 'Nothing logged yet.', emptyMarket: 'Nothing listed.',
      emptyWagers: 'No live wagers.', emptyFeed: 'Nothing claimed yet today.',
      toastAwarded: '{who} · {what}', toastReverted: 'Reverted · {what}',
      toastNothingToUndo: 'Nothing left to undo for that.',
      toastLocked: '↳ needs {item}'
    },

    /* angular, machined — the same language as the old glyph set */
    icons: Object.assign({}, B, {
      chart: I('<path d="M12 3 21 12l-9 9-9-9Z"/><path d="M12 8.4 15.6 12 12 15.6 8.4 12Z"/>'),
      tasks: I('<rect x="3.6" y="4.4" width="16.8" height="15.2"/><path d="M3.6 9.4h16.8M3.6 14.6h16.8M9 4.4v15.2"/>'),
      focus: I('<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.4"/>'),
      market: I('<path d="M12 4.2 19.2 12 12 19.8 4.8 12Z"/>'),
      wagers: I('<path d="M5 19 15.6 8.4M9.4 4.6 19 14.2"/><path d="M3.6 17.4 6.6 20.4M17.4 3.6l3 3"/>'),
      log: I('<rect x="3.6" y="4.4" width="16.8" height="15.2"/><path d="M8.4 4.4v15.2M15.6 4.4v15.2M3.6 12h16.8"/>'),
      lead: F('<path d="M12 3 21 12l-9 9-9-9Z"/>'),
      score: F('<path d="M12 3.4 20.6 12 12 20.6 3.4 12Z"/>'),
      streak: F('<path d="M12 4.4 18.6 16.6H5.4Z"/>'),
      crest: I('<path d="M12 2.4 21.6 12 12 21.6 2.4 12Z"/><path d="M12 7.6 16.4 12 12 16.4 7.6 12Z"/>'),
      /* the exact three shapes the old clip-paths cut */
      markRitual:    F('<path d="M12 2.4 21.6 12 12 21.6 2.4 12Z"/>'),
      markMilestone: F('<path d="M12 2.4 21.6 7.2 24 16.8 12 21.6 0 16.8 2.4 7.2Z"/>'),
      markPenalty:   F('<path d="M12 2.4 21.6 12 12 21.6 2.4 12Z"/>')
    }),

    ranks: {
      span: 15000,
      tiers: [{ n: 'Initiate', c: '#9FB3C0' }, { n: 'Novice', c: '#6FD9E8' },
              { n: 'Disciple', c: '#7B9FE0' }, { n: 'Seeker', c: '#A98BE0' },
              { n: 'Hunter', c: '#8BD44F' }, { n: 'Eagle', c: '#E5C079' },
              { n: 'Tiger', c: '#FF9E4A' }, { n: 'Dragon', c: '#E2564E' }],
      cycles: ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII']
    },

    motion: { ease: 'cubic-bezier(.2,.8,.2,1)', dur: '.15s', enter: '.22s', hover: 'translateY(-2px)' },
    sound: {
      up:    { type: 'sine', gain: 0.16, seq: [[660, 0], [880, .07]] },
      down:  { type: 'sine', gain: 0.16, seq: [[420, 0], [300, .09]] },
      phase: { type: 'sine', gain: 0.16, seq: [[520, 0], [700, .1], [880, .2]] }
    },
    confetti: ['#6FD9E8', '#E5C079', '#FFFFFF'],
    themeColor: '#04070C',
    favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2304070C'/%3E%3Cpath d='M32 6 58 32 32 58 6 32Z' fill='%236FD9E8'/%3E%3Cpath d='M32 18 46 32 32 46 18 32Z' fill='%2304070C'/%3E%3C/svg%3E",

    /* the nebula, exactly as it was */
    texture:
      'radial-gradient(ellipse 90% 60% at 50% 42%, rgba(255,158,74,0.10), transparent 62%),' +
      'radial-gradient(ellipse 120% 80% at 12% 8%, rgba(50,132,150,0.20), transparent 60%),' +
      'radial-gradient(ellipse 110% 80% at 92% 96%, rgba(38,86,120,0.20), transparent 62%),' +
      'radial-gradient(ellipse 70% 50% at 78% 18%, rgba(20,60,80,0.28), transparent 70%),' +
      'linear-gradient(#04070C,#050A11 45%,#04070C)',

    /* the starfield and the chart's own chrome, lifted verbatim */
    css: [
      '#sky::after{content:"";position:absolute;inset:-50%;opacity:.5;',
      '  background-image:',
      '    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.7), transparent),',
      '    radial-gradient(1px 1px at 70% 12%, rgba(255,255,255,.5), transparent),',
      '    radial-gradient(1px 1px at 42% 78%, rgba(255,255,255,.55), transparent),',
      '    radial-gradient(1px 1px at 88% 62%, rgba(255,255,255,.45), transparent),',
      '    radial-gradient(1.6px 1.6px at 12% 62%, rgba(190,235,255,.55), transparent),',
      '    radial-gradient(1.4px 1.4px at 62% 44%, rgba(255,220,180,.4), transparent),',
      '    radial-gradient(1px 1px at 33% 18%, rgba(255,255,255,.35), transparent),',
      '    radial-gradient(1px 1px at 8% 88%, rgba(255,255,255,.4), transparent);',
      '  background-size:520px 520px,430px 430px,610px 610px,380px 380px,700px 700px,540px 540px,320px 320px,470px 470px;',
      '  animation:og-drift 220s linear infinite;}',
      '@keyframes og-drift{from{transform:translate3d(0,0,0);}to{transform:translate3d(-360px,-260px,0);}}',
      '.brand-glyph{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);',
      '  background:linear-gradient(150deg,var(--accent),var(--gold));',
      '  box-shadow:0 0 22px var(--accent-wash);color:var(--on-accent);}',
      '.gate-glyph{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);',
      '  background:linear-gradient(150deg,var(--accent),var(--gold));box-shadow:0 0 34px var(--accent-wash);}',
      '.brand-title{background:linear-gradient(100deg,#fff,var(--accent) 60%,var(--gold));',
      '  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}',
      '.tk-box{clip-path:polygon(24% 0,100% 0,100% 76%,76% 100%,0 100%,0 24%);}',
      '.op-fill{background:linear-gradient(90deg,var(--tier),#fff);box-shadow:0 0 10px var(--tier);}',
      '.node:hover{box-shadow:0 10px 26px -12px var(--shadow),0 0 22px -14px var(--nc);}',
      '.node-mark svg{filter:drop-shadow(0 0 6px currentColor);}',
      '.sysmap .orbit{fill:none;stroke:rgba(126,197,214,.13);stroke-width:.6;}',
      '.sysmap .orbit.on{stroke:rgba(229,192,121,.45);stroke-dasharray:3 3;}',
      '.hub-label{font-family:var(--f-display);text-transform:uppercase;letter-spacing:.16em;',
      '  font-size:8px;fill:var(--txt-3);}',
      '.hub-hit:hover .hub-label,.hub-hit.on .hub-label{fill:var(--txt);}',
      '.hub-count{font-family:var(--f-mono);font-size:7px;fill:var(--txt-3);}',
      '.pl-body{transition:r .2s,filter .2s;}',
      '.hub-hit:hover .pl-body{filter:brightness(1.35);}'
    ].join('\n'),

    /* concentric orbits, a sun, one body per group — unchanged */
    backdrop: function (ctx) {
      var W = 1000, H = 280, cx = 500, cy = 138;
      var n = ctx.places.length, orbits = [], bodies = [];
      ctx.places.forEach(function (p, i) {
        var rx = 80 + (i * (390 / Math.max(1, n - 1)));
        var ry = rx * 0.29;
        var ang = (-38 + i * 47) * Math.PI / 180;
        var x = cx + rx * Math.cos(ang), y = cy + ry * Math.sin(ang);
        var on = p.id === ctx.active, r = p.r || 7;
        orbits.push('<ellipse class="orbit' + (on ? ' on' : '') + '" cx="' + cx + '" cy="' + cy +
          '" rx="' + U.round(rx) + '" ry="' + U.round(ry) + '"/>');
        bodies.push(ctx.hit(p,
          '<circle r="' + (r + 12) + '" fill="transparent"/>' +
          (on ? '<circle r="' + (r + 6) + '" fill="none" stroke="' + ctx.esc(p.color) + '" stroke-width=".8" opacity=".8"/>' +
                '<circle r="' + (r + 10) + '" fill="none" stroke="' + ctx.esc(p.color) + '" stroke-width=".4" opacity=".4"/>' : '') +
          '<circle class="pl-body" r="' + r + '" fill="' + ctx.esc(p.color) + '" opacity="' + (on ? 1 : 0.8) +
            '" style="filter:drop-shadow(0 0 ' + (on ? 10 : 5) + 'px ' + ctx.esc(p.color) + ')"/>' +
          '<text class="hub-label" y="' + (r + 15) + '" text-anchor="middle">' + ctx.esc(ctx.name(p)) + '</text>' +
          '<text class="hub-count" y="' + (r + 25) + '" text-anchor="middle">' + ctx.count(p.id) + '</text>',
          'translate(' + U.round(x) + ',' + U.round(y) + ')'));
      });
      return '<svg class="sysmap" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Origin system map">' +
        '<defs><radialGradient id="ogSun">' +
          '<stop offset="0%" stop-color="#FFE8C4"/><stop offset="45%" stop-color="#FF9E4A"/>' +
          '<stop offset="100%" stop-color="rgba(255,120,40,0)"/></radialGradient></defs>' +
        orbits.join('') +
        '<circle cx="' + cx + '" cy="' + cy + '" r="34" fill="url(#ogSun)" opacity=".55"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#FFD9A0" style="filter:drop-shadow(0 0 14px #FF9E4A)"/>' +
        bodies.join('') +
      '</svg>';
    }
  });
})();
