/* ============================================================
   PROCESS — scroll-driven horizontal timeline
   Wide + motion-friendly viewports get the pinned version.
   Everything else keeps a native swipeable, snap-scrolling row,
   which is the better interaction on touch anyway.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    var section = SK.$('[data-process]');
    if (!section) return;

    var viewport = SK.$('.process__viewport', section);
    var track    = SK.$('[data-process-track]', section);
    var bar      = SK.$('[data-process-bar]', section);
    if (!viewport || !track) return;

    /* ── Fallback: native horizontal scroll ────────────────── */
    if (!SK.wide || SK.reduced) {
      if (bar) {
        viewport.addEventListener('scroll', function () {
          var max = viewport.scrollWidth - viewport.clientWidth;
          var p = max > 0 ? viewport.scrollLeft / max : 0;
          bar.style.transform = 'scaleX(' + Math.max(p, 0.05).toFixed(3) + ')';
        }, { passive: true });
      }
      return;
    }

    /* ── Pinned mode ───────────────────────────────────────── */
    section.classList.add('is-pinned');

    var distance = 0;
    var current = 0;
    var target = 0;

    function measure() {
      // How far the track must travel for its last card to sit flush right.
      distance = Math.max(track.scrollWidth - viewport.clientWidth, 0);

      // Section height = one pinned screen + the horizontal travel.
      section.style.height = (window.innerHeight + distance) + 'px';
    }

    function progress() {
      var rect = section.getBoundingClientRect();
      if (distance <= 0) return 0;
      return SK.clamp(-rect.top / distance, 0, 1);
    }

    measure();
    var lastW = window.innerWidth;
    window.addEventListener('resize', SK.debounce(function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      measure();
      current = target = progress() * distance;
      paint();
    }, 180));

    // Fonts settle after first paint and change the track width.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener('load', measure);

    function paint() {
      track.style.transform = 'translate3d(' + (-current).toFixed(2) + 'px,0,0)';
      if (bar) {
        var p = distance > 0 ? current / distance : 0;
        bar.style.transform = 'scaleX(' + Math.max(p, 0.05).toFixed(3) + ')';
      }
    }

    SK.tick(function () {
      var rect = section.getBoundingClientRect();

      // Skip the maths entirely when the section is nowhere near view.
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      target = progress() * distance;
      current = SK.lerp(current, target, 0.11);

      if (Math.abs(current - target) < 0.05) current = target;
      paint();
    });
  });

})(window.SK);
