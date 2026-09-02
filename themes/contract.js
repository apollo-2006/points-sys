/* ==========================================================================
   THEME CONTRACT
   --------------------------------------------------------------------------
   Loaded before every theme and before the app module. A theme file calls
   ORIGIN_THEMES.define({...}) at the top level; the app reads the registry.

   Classic script on purpose: it must finish before the deferred app module
   boots, and classic scripts still load from a file:// URL.

   THE RULE THIS FILE ENFORCES
   ---------------------------
   Nothing outside a theme object may hardcode a look, a name, or a piece of
   art. The core app owns structure — grid, spacing, event wiring, state.
   A theme owns everything you can see. TOKENS below is the full surface
   between them: if the core needs a colour, it reads a token, and every
   theme must declare every one. A theme missing a token fails loudly rather
   than silently inheriting somebody else's blue.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- the complete token surface -------------------------------------
     Grouped only for reading; the validator treats them as one flat set.
     Adding a token here is the one edit that touches all five themes.   */
  var TOKENS = [
    /* ground & surfaces */
    'void',          /* page ground */
    'deep',          /* fixed bottom nav on mobile */
    'surface',       /* panel fill */
    'surface-2',     /* subtle raised fill (stat blocks, ghost buttons) */
    'surface-hover', /* row hover */
    'raised',        /* modal, palette, quick-add preview — sits above the page */
    'toast',         /* toast fill */
    'overlay',       /* modal/palette scrim */
    'track',         /* the empty half of any progress bar */
    'input',         /* form field fill */
    'scroll',        /* scrollbar thumb */
    'shadow',        /* what this house's shadows are made of */

    /* lines */
    'line',          /* default border */
    'line-soft',     /* internal dividers */
    'line-hard',     /* emphasised edge, focus rings */

    /* type */
    'txt',           /* body */
    'txt-2',         /* secondary */
    'txt-3',         /* tertiary / labels */
    'on-accent',     /* text sitting on an accent fill */

    /* accents */
    'accent',        /* the house's primary — buttons, active nav */
    'accent-hi',     /* its bright end — the far stop of a fill */
    'accent-dim',    /* its muted form */
    'accent-wash',   /* its 8–12% wash, for hover fills */
    'gold',          /* the "valuable" accent: milestones, costs, pins */
    'warn',
    'danger',
    'ok',
    'info',

    /* semantic economy colours */
    'milestone',     /* a big one-off node */
    'penalty',       /* a node that subtracts */
    'focus-work',    /* timer phase colours */
    'focus-break',
    'focus-long',

    /* type system */
    'f-display', 'f-body', 'f-mono',
    'f-display-scale', 'f-ui-scale',
    'tt-display',    /* text-transform for display type */
    'ls-display',    /* letter-spacing for display type */
    'tt-label',      /* the eyebrow/label treatment — the .22em tell */
    'ls-label',
    'f-label',

    /* form */
    'radius',        /* the house's corner language */
    'radius-lg',
    'panel-clip',    /* clip-path for panels; 'none' is a valid answer */
    'card-clip',     /* clip-path for node cards */
    'chip-radius',
    'border-w'
  ];

  var REQUIRED_COPY = [
    /* the six screens, in nav order */
    'chart', 'tasks', 'focus', 'market', 'wagers', 'log',
    /* what each screen is for — tooltips, so vocabulary never hides function */
    'chartFn', 'tasksFn', 'focusFn', 'marketFn', 'wagersFn', 'logFn',
    /* the economy's nouns and verbs */
    'score', 'scoreVerb', 'scoreVerbPast', 'scored',
    'item', 'items', 'group', 'groups', 'person', 'people',
    /* the four node types */
    'typeRitual', 'typeGoal', 'typeMilestone', 'typePenalty',
    'typeRitualHint', 'typeGoalHint', 'typeMilestoneHint', 'typePenaltyHint',
    /* cadence */
    'cadDaily', 'cadWeekly', 'cadOnce',
    /* identity */
    'brand', 'season', 'rank',
    /* empty states */
    'emptyGroup', 'emptyTasks', 'emptyLog', 'emptyMarket', 'emptyWagers', 'emptyFeed',
    /* toasts */
    'toastAwarded', 'toastReverted', 'toastNothingToUndo', 'toastLocked'
  ];

  var REQUIRED_ICONS = [
    'chart', 'tasks', 'focus', 'market', 'wagers', 'log',
    'claim', 'undo', 'lock', 'streak', 'lead', 'more', 'close', 'add',
    'check', 'due', 'repeat', 'score', 'list', 'pin', 'pinned', 'settings',
    'search', 'signout', 'crest',
    /* the three node marks — what a habit, a great deed and a penalty each
       look like at a glance. Every house draws its own set. */
    'markRitual', 'markMilestone', 'markPenalty'
  ];

  var registry = {};
  var problems = [];

  /* Loud, not silent. In the sandbox (?demo=1) or with ?dev=1 this paints a
     banner; everywhere else it still fills the console. Either way the theme
     is refused registration, so no half-dressed theme can ever be applied. */
  function fail(id, what, detail) {
    var msg = 'THEME "' + id + '" — ' + what + ': ' + detail;
    problems.push(msg);
    console.error(msg);
  }

  function validate(def) {
    var id = def && def.id ? def.id : '(no id)';
    var before = problems.length;

    if (!def || !def.id) { fail(id, 'contract', 'missing id'); return false; }
    ['name', 'tagline'].forEach(function (k) {
      if (!def[k]) fail(id, 'contract', 'missing ' + k);
    });

    /* tokens: complete or not at all — no partial overrides, no inheritance */
    var tk = def.tokens || {};
    var missing = TOKENS.filter(function (t) { return tk[t] === undefined || tk[t] === null || tk[t] === ''; });
    if (missing.length) fail(id, 'incomplete tokens', missing.length + ' missing → ' + missing.join(', '));
    var extra = Object.keys(tk).filter(function (t) { return TOKENS.indexOf(t) < 0; });
    if (extra.length) fail(id, 'unknown tokens', extra.join(', '));

    /* fonts */
    var f = def.fonts || {};
    ['display', 'body', 'mono', 'googleHref'].forEach(function (k) {
      if (!f[k]) fail(id, 'fonts', 'missing ' + k);
    });

    /* operator identity colours, re-derived per theme */
    var ops = def.ops || {};
    if (!ops.a || !ops.b) fail(id, 'ops', 'both a and b must be declared');

    /* copy: every user-facing noun */
    var cp = def.copy || {};
    var mc = REQUIRED_COPY.filter(function (k) { return !cp[k]; });
    if (cp.places != null && typeof cp.places !== 'object')
      fail(id, 'copy', 'places must be a map of {groupId: name}');
    if (mc.length) fail(id, 'incomplete copy', mc.length + ' missing → ' + mc.join(', '));

    /* icons: inline SVG strings, never emoji */
    var ic = def.icons || {};
    var mi = REQUIRED_ICONS.filter(function (k) { return !ic[k]; });
    if (mi.length) fail(id, 'incomplete icons', mi.length + ' missing → ' + mi.join(', '));
    Object.keys(ic).forEach(function (k) {
      if (typeof ic[k] !== 'string') { fail(id, 'icons', k + ' is not a string'); return; }
      if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(ic[k]))
        fail(id, 'icons', k + ' contains an emoji — icons must be drawn SVG');
      if (ic[k] && ic[k].indexOf('<svg') !== 0)
        fail(id, 'icons', k + ' is not an <svg> string');
    });

    /* the centrepiece: a house draws the hub either as a backdrop inside the
       core's chart layout, or by taking the whole screen with roomView. One
       of the two is required; roomView wins where both exist. */
    if (typeof def.roomView !== 'function' && typeof def.backdrop !== 'function')
      fail(id, 'hub', 'needs either backdrop(ctx) or roomView(ctx)');
    if (def.backdrop != null && typeof def.backdrop !== 'function')
      fail(id, 'backdrop', 'must be a function if present');
    if (def.connector != null && typeof def.connector !== 'function')
      fail(id, 'connector', 'must be a function if present');
    if (def.emblem != null && typeof def.emblem !== 'function')
      fail(id, 'emblem', 'must be a function if present');
    /* A house may take the whole room screen and the whole standings block.
       Both optional: without them you get the core's default chart. */
    if (def.roomView != null && typeof def.roomView !== 'function')
      fail(id, 'roomView', 'must be a function if present');
    if (def.scoreboard != null && typeof def.scoreboard !== 'function')
      fail(id, 'scoreboard', 'must be a function if present');

    /* ranks, motion, sound, chrome */
    if (!def.ranks || !Array.isArray(def.ranks.tiers) || !def.ranks.tiers.length)
      fail(id, 'ranks', 'needs a tiers array');
    ['ease', 'dur', 'hover', 'enter'].forEach(function (k) {
      if (!def.motion || !def.motion[k]) fail(id, 'motion', 'missing ' + k);
    });
    ['up', 'down', 'phase'].forEach(function (k) {
      if (!def.sound || !def.sound[k]) fail(id, 'sound', 'missing ' + k);
    });
    if (!def.favicon) fail(id, 'contract', 'missing favicon');
    if (!def.themeColor) fail(id, 'contract', 'missing themeColor');
    if (!def.texture) fail(id, 'contract', 'missing texture (the #sky layers)');
    if (typeof def.css !== 'string') fail(id, 'contract', 'missing css (per-theme chrome)');
    if (!Array.isArray(def.confetti) || !def.confetti.length) fail(id, 'contract', 'missing confetti palette');

    return problems.length === before;
  }

  window.ORIGIN_THEMES = {
    list: registry,
    order: [],
    TOKENS: TOKENS,
    REQUIRED_COPY: REQUIRED_COPY,
    REQUIRED_ICONS: REQUIRED_ICONS,
    problems: problems,

    define: function (def) {
      if (!validate(def)) return;
      if (registry[def.id]) console.warn('theme "' + def.id + '" defined twice');
      else this.order.push(def.id);
      registry[def.id] = def;
    },

    /* ---- helpers, so five themes don't each reinvent them ---- */
    util: {
      /* NOTE: `span` (evenly spaced along a line) used to live here. It was
         removed on purpose — every house called it, and that is why every
         house drew the same row of things. Write the line you actually want. */
      span: function (from, to, i, n) {
        return n <= 1 ? (from + to) / 2 : from + (to - from) * (i / (n - 1));
      },
      /* points on a circle */
      ring: function (cx, cy, r, i, n, startDeg) {
        var a = ((startDeg == null ? -90 : startDeg) + (360 / n) * i) * Math.PI / 180;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), a: a };
      },
      round: function (n) { return Math.round(n * 10) / 10; },
      /* deterministic jitter — a wall of frames should not be a perfect grid,
         but it must look identical on every render or the page twitches */
      noise: function (seed, i) {
        var x = Math.sin((seed.charCodeAt(0) || 1) * 12.9898 + i * 78.233) * 43758.5453;
        return x - Math.floor(x);
      },
      /* an inline <svg> icon at a given pixel size */
      icon: function (body, size, extra) {
        return '<svg viewBox="0 0 24 24" width="' + (size || 16) + '" height="' + (size || 16) +
          '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"' +
          ' stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + body + '</svg>';
      },
      /* ---- baseline icon set ------------------------------------------
         Twenty-four line-drawn icons on a 24px grid. A theme spreads this
         and overrides whatever it wants to draw in its own hand; Phase 2
         is where the houses diverge. Nothing here is an emoji, and nothing
         here carries a colour — they all inherit currentColor.          */
      baseIcons: function (o) {
        var w = (o && o.weight) || 1.6;
        var cap = (o && o.cap) || 'round';
        var join = (o && o.join) || 'round';
        function I(body) {
          return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + w +
            '" stroke-linecap="' + cap + '" stroke-linejoin="' + join + '" aria-hidden="true">' + body + '</svg>';
        }
        function F(body) {
          return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + body + '</svg>';
        }
        /* I and F are the drawing helpers, not icons. Non-enumerable so a
           theme's Object.assign({}, B, {...}) copies the icons and not these. */
        var set = {
          chart:    I('<circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="9.5" ry="4.4"/>' +
                      '<ellipse cx="12" cy="12" rx="9.5" ry="4.4" transform="rotate(60 12 12)"/>'),
          tasks:    I('<path d="M4 6h10M4 12h10M4 18h7"/><path d="M17.5 16.5l1.8 1.8 3.2-3.6"/>'),
          focus:    I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3 2"/>'),
          market:   I('<path d="M4.5 8h15l-1.3 10.2a1.6 1.6 0 0 1-1.6 1.4H7.4a1.6 1.6 0 0 1-1.6-1.4Z"/>' +
                      '<path d="M9 8V6.4a3 3 0 0 1 6 0V8"/>'),
          wagers:   I('<path d="M12 3.6 14.2 9l5.8.5-4.4 3.9 1.3 5.7L12 16l-4.9 3.1 1.3-5.7L4 9.5 9.8 9Z"/>'),
          log:      I('<path d="M6 3.6h9.5L20 8v12.4H6Z"/><path d="M15.5 3.6V8H20"/><path d="M9 12h8M9 16h5"/>'),
          claim:    I('<path d="M5 12.8l4.6 4.4L19 7.4"/>'),
          undo:     I('<path d="M4.8 10.4h5.6V4.8"/><path d="M5.4 10.2a7.4 7.4 0 1 1 .6 6.6"/>'),
          lock:     I('<rect x="5.4" y="10.4" width="13.2" height="9.2" rx="1.8"/>' +
                      '<path d="M8.6 10.4V7.8a3.4 3.4 0 0 1 6.8 0v2.6"/>'),
          streak:   I('<path d="M12 4.6 19 17.4H5Z"/>'),
          lead:     F('<path d="M12 3.2 14.6 9.4 21 10l-4.8 4.3 1.4 6.5L12 17.4 6.4 20.8l1.4-6.5L3 10l6.4-.6Z"/>'),
          more:     F('<circle cx="5.6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.4" cy="12" r="1.7"/>'),
          close:    I('<path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6"/>'),
          add:      I('<path d="M12 5.4v13.2M5.4 12h13.2"/>'),
          check:    I('<path d="M5 12.6l4.4 4.2L19 7.6"/>'),
          due:      I('<rect x="4" y="5.6" width="16" height="14.4" rx="1.8"/><path d="M4 10h16M9 3.6v4M15 3.6v4"/>'),
          repeat:   I('<path d="M4.6 11a7.4 7.4 0 0 1 12.6-5.2l2.2 2.2"/><path d="M19.4 4.4V8h-3.6"/>' +
                      '<path d="M19.4 13a7.4 7.4 0 0 1-12.6 5.2l-2.2-2.2"/><path d="M4.6 19.6V16h3.6"/>'),
          score:    F('<path d="M12 3.4 20.6 12 12 20.6 3.4 12Z"/>'),
          list:     I('<rect x="4" y="4.6" width="16" height="14.8" rx="1.8"/><path d="M8 9h8M8 13h8M8 17h4"/>'),
          pin:      I('<path d="M9 3.6h6l-.8 6.2 3.4 3.4H6.4l3.4-3.4Z"/><path d="M12 13.2v7.2"/>'),
          pinned:   F('<path d="M9 3.6h6l-.8 6.2 3.4 3.4H6.4l3.4-3.4Z"/><path d="M11.2 13.2h1.6v7.2h-1.6Z"/>'),
          settings: I('<circle cx="12" cy="12" r="3.1"/>' +
                      '<path d="M19.2 14.6a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.3a1.8 1.8 0 1 1-3.6 0v-.2a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.3a1.8 1.8 0 1 1 0-3.6h.2a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.3a1.8 1.8 0 1 1 3.6 0v.2a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1.1 2.6h.3a1.8 1.8 0 1 1 0 3.6h-.2a1.5 1.5 0 0 0-1.4.9Z"/>'),
          search:   I('<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.6 15.6 20 20"/>'),
          signout:  I('<path d="M12 3.6v8.8"/><path d="M6.6 6.6a8 8 0 1 0 10.8 0"/>'),
          markRitual:    F('<circle cx="12" cy="12" r="6.4"/>'),
          markMilestone: F('<path d="M12 3.4 14.4 9.2 20.6 9.8 15.9 13.9 17.3 20 12 16.8 6.7 20 8.1 13.9 3.4 9.8 9.6 9.2Z"/>'),
          markPenalty:   F('<path d="M12 3.6 21.4 20H2.6Z" opacity=".9"/>')
        };
        Object.defineProperty(set, 'I', { value: I, enumerable: false });
        Object.defineProperty(set, 'F', { value: F, enumerable: false });
        return set;
      },

      solid: function (body, size, extra) {
        return '<svg viewBox="0 0 24 24" width="' + (size || 16) + '" height="' + (size || 16) +
          '" fill="currentColor" aria-hidden="true"' + (extra || '') + '>' + body + '</svg>';
      }
    }
  };
})();
