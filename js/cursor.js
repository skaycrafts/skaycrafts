/* ============================================================
   CURSOR — trailing ring + dot, desktop only
   Skipped entirely on touch, coarse pointers and reduced motion.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    if (!SK.fine || SK.reduced) return;

    var cursor = SK.$('#cursor');
    if (!cursor) return;

    var dot   = SK.$('.cursor__dot', cursor);
    var ring  = SK.$('.cursor__ring', cursor);
    var label = SK.$('.cursor__label', cursor);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var dx = mx, dy = my;   // dot   (fast)
    var rx = mx, ry = my;   // ring  (lagging)
    var visible = false;

    document.body.classList.add('has-cursor');

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) { visible = true; cursor.style.opacity = '1'; }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      visible = false;
      cursor.style.opacity = '0';
    });

    window.addEventListener('mousedown', function () { cursor.classList.add('is-down'); });
    window.addEventListener('mouseup',   function () { cursor.classList.remove('is-down'); });

    SK.tick(function () {
      dx = SK.lerp(dx, mx, 0.42);
      dy = SK.lerp(dy, my, 0.42);
      rx = SK.lerp(rx, mx, 0.16);
      ry = SK.lerp(ry, my, 0.16);

      dot.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'
        + (cursor.classList.contains('is-down') ? ' scale(.82)' : '');
    });

    /* ── Contextual states ────────────────────────────────────
       [data-cursor="view"] enlarges the ring and prints a label. */
    var HOVER = 'a, button, .qa__q, input, select, textarea, [data-magnetic]';
    var VIEW  = '[data-cursor="view"]';

    document.addEventListener('mouseover', function (e) {
      var view = e.target.closest && e.target.closest(VIEW);
      if (view) {
        cursor.classList.add('is-view');
        cursor.classList.remove('is-hover');
        if (label) label.textContent = view.getAttribute('data-cursor-label') || 'View';
        return;
      }
      if (e.target.closest && e.target.closest(HOVER)) {
        cursor.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', function (e) {
      var to = e.relatedTarget;
      if (to && to.closest && (to.closest(VIEW) || to.closest(HOVER))) return;
      cursor.classList.remove('is-hover', 'is-view');
    });
  });

})(window.SK);
