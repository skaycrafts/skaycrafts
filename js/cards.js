/* ============================================================
   CARDS — 3D tilt on the work mockups, magnetic buttons
   Both are pointer-only enhancements: touch devices and
   reduced-motion users get the clean static layout instead.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    if (!SK.fine || SK.reduced) return;

    tilt();
    magnetic();
  });


  /* ── 1. Tilt ────────────────────────────────────────────────
     Subtle — 5 degrees maximum. Anything more reads as a gimmick. */
  function tilt() {
    var MAX = 5;

    SK.$$('[data-tilt]').forEach(function (el) {
      var raf = null;
      var tX = 0, tY = 0;

      /* Listen on the whole row, not the mockup: work rows carry a
         stretched link overlay that would otherwise swallow every
         pointer event before it reached the visual. */
      var surface = el.closest('.case') || el;

      surface.addEventListener('pointerenter', function () {
        el.style.transition = 'transform .18s var(--ease-out), border-color .55s, box-shadow .55s';
      });

      surface.addEventListener('pointermove', function (e) {
        var r = surface.getBoundingClientRect();
        tY = ((e.clientX - r.left) / r.width  - 0.5) *  2 * MAX;
        tX = ((e.clientY - r.top)  / r.height - 0.5) * -2 * MAX;

        if (raf) return;
        raf = requestAnimationFrame(function () {
          el.style.transform =
            'perspective(1000px) rotateX(' + tX.toFixed(2) + 'deg) rotateY(' + tY.toFixed(2) + 'deg)';
          raf = null;
        });
      }, { passive: true });

      surface.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transition = '';        // hand easing back to the stylesheet
        el.style.transform = '';
      });
    });
  }


  /* ── 2. Magnetic buttons ────────────────────────────────────
     Uses the standalone `translate` property so it never clobbers
     the :active scale() living on `transform`.                   */
  function magnetic() {
    var PULL = 0.32;     // fraction of the pointer's offset the button follows

    SK.$$('[data-magnetic]').forEach(function (el) {
      var raf = null;
      var x = 0, y = 0, tx = 0, ty = 0;
      var running = false;

      function loop() {
        x = SK.lerp(x, tx, 0.18);
        y = SK.lerp(y, ty, 0.18);
        el.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px';

        if (Math.abs(x - tx) > 0.1 || Math.abs(y - ty) > 0.1) {
          raf = requestAnimationFrame(loop);
        } else {
          running = false;
          if (tx === 0 && ty === 0) el.style.translate = '';
        }
      }

      function start() {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(loop);
      }

      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        tx = (e.clientX - cx) * PULL;
        ty = (e.clientY - cy) * PULL;
        start();
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        start();
      });

      el.addEventListener('blur', function () {
        tx = 0; ty = 0; start();
      });
    });
  }

})(window.SK);
