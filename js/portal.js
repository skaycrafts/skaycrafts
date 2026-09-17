/* ============================================================
   PORTAL — scroll-driven hero
   ------------------------------------------------------------
   Sets exactly one thing: --p on the section, from 0 (closed)
   to 1 (open), derived from scroll POSITION. All the geometry
   lives in css/portal.css.

   Position-bound, never timed — so the portal closes again when
   the reader scrolls back up, with no extra code.

   Under prefers-reduced-motion this never binds, leaving --p at
   its CSS default of 1: the finished, open page.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    var portal = SK.$('[data-portal]');
    if (!portal) return;

    if (SK.reduced) {
      portal.style.setProperty('--p', '1');
      return;
    }

    // Start closed, then let scroll drive it.
    portal.style.setProperty('--p', '0');

    var travel = 0;
    var current = 0;
    var lastFrame = 0;

    /* ── Fit the wordmark to the frame ─────────────────────────
       Every typeface sets "SKAYCRAFTS" to a different width, so a
       hand-tuned font-size is wrong the moment the face changes.
       Measure the title's own layout width and solve for the size
       that spans TARGET of the viewport when closed. Font-agnostic,
       so swapping the display face needs no retuning here.
       offsetWidth is used deliberately: it is the untransformed
       layout width, so the scale() driven by --p does not skew it. */
    var title = SK.$('.portal__title', portal);
    var TARGET = 0.86;

    function fitTitle() {
      if (!title) return;
      title.style.fontSize = '100px';
      var natural = title.offsetWidth;
      if (!natural) { title.style.fontSize = ''; return; }
      var size = 100 * (window.innerWidth * TARGET) / natural;
      title.style.fontSize = SK.clamp(size, 18, 260).toFixed(2) + 'px';
    }

    function measure() {
      // Distance the reader scrolls between fully closed and fully open.
      travel = Math.max(portal.offsetHeight - window.innerHeight, 1);
    }

    fitTitle();
    measure();
    var lastW = window.innerWidth;
    window.addEventListener('resize', SK.debounce(function () {
      // Phones fire resize when the address bar slides; ignore height-only changes.
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      fitTitle();
      measure();
    }, 180));
    window.addEventListener('load', function () { fitTitle(); measure(); });

    // Re-fit once the real face has swapped in, or the size will be
    // solved against the fallback's metrics.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fitTitle(); measure(); });
    }

    /* Where the portal SHOULD be, purely as a function of scroll. */
    function targetP() {
      var rect = portal.getBoundingClientRect();
      if (rect.bottom < -100) return 1;
      if (rect.top > 100) return 0;
      return SK.clamp(-rect.top / travel, 0, 1);
    }

    var painted = '';
    function paint() {
      var v = current.toFixed(4);
      if (v === painted) return;       // unchanged: skip the style recalc
      painted = v;
      portal.style.setProperty('--p', v);
    }

    SK.tick(function () {
      lastFrame = performance.now();

      var target = targetP();

      // A touch of easing so the panels feel weighted rather than
      // welded to the scrollbar. Still position-bound: it always
      // settles on the scroll-derived target, in both directions.
      current = SK.lerp(current, target, 0.16);
      if (Math.abs(current - target) < 0.001) current = target;

      paint();
    });

    /* Correctness net. Browsers throttle rAF in background tabs, under
       low-power mode, and during momentum scrolling on some mobile
       browsers. If no frame has landed recently, track scroll directly:
       unsmoothed, but never stuck at a stale value. */
    window.addEventListener('scroll', function () {
      if (performance.now() - lastFrame < 250) return;   // rAF is healthy
      current = targetP();
      paint();
    }, { passive: true });
  });

})(window.SK);
