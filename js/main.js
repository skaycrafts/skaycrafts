/* ============================================================
   MAIN — boot tasks that don't warrant a module of their own
   Runs last: every other module has registered by this point.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    logoFallback();
    scrollProgress();
    year();
    anchors();
  });


  /* ── Brand lockup fallback ──────────────────────────────────
     If assets/logo-full.png hasn't been added yet, swap in the
     CSS wordmark so the header and footer never look broken.   */
  function logoFallback() {
    SK.$$('[data-logo]').forEach(function (img) {
      function fail() {
        var host = img.closest('.brand-lockup') || img.closest('.mark');
        if (host) host.classList.add('is-missing');
      }
      if (img.complete && img.naturalWidth === 0) fail();
      img.addEventListener('error', fail);
    });
  }


  /* ── Scroll progress bar ────────────────────────────────── */
  function scrollProgress() {
    var bar = SK.$('[data-scroll-progress]');
    if (!bar) return;

    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + SK.clamp(p, 0, 1).toFixed(4) + ')';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    window.addEventListener('resize', SK.debounce(update, 150));
    update();
  }


  function year() {
    var el = SK.$('[data-year]');
    if (el) el.textContent = String(new Date().getFullYear());
  }


  /* ── Anchors ────────────────────────────────────────────────
     Native smooth scrolling handles the motion (scroll-padding-top
     clears the fixed header); this only keeps focus correct for
     keyboard users, which the browser otherwise drops.          */
  function anchors() {
    SK.$$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;

        /* Same guard as nav.js: "../#work" is a real link but not a
           selector, so let the browser navigate instead of throwing. */
        if (id.charAt(0) !== '#' || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: SK.reduced ? 'auto' : 'smooth',
          block: 'start'
        });

        // Move focus without a second scroll jump.
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });

        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

})(window.SK);
