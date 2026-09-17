/* ============================================================
   NAV — fixed bar, held away over the hero, active link,
         fullscreen menu with focus trap
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    var nav = SK.$('#nav');
    if (!nav) return;

    /* ── Condense / hero visibility ───────────────────────── */
    var ticking = false;

    /* The hero is a full-screen portal; a bar across it would only get in
       the way, so the nav stays away until the hero is behind us. After
       that it is simply fixed — no hide-on-scroll-down. */
    var portal = SK.$('[data-portal]');

    function onScroll() {
      var y = window.scrollY;

      nav.classList.toggle('is-stuck', y > 24);

      if (portal) {
        var r = portal.getBoundingClientRect();
        var inHero = r.bottom > nav.offsetHeight + 8;
        nav.classList.toggle('is-away', inHero && !document.body.classList.contains('is-locked'));
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* ── Active section highlight ─────────────────────────── */
    var links = SK.$$('[data-nav-link]');
    var sections = links
      /* Only same-page hashes are section targets. On a subpage the nav
         points at "../#work", which is a valid URL but NOT a valid CSS
         selector - passing it to querySelector throws a SyntaxError and
         takes the rest of this module down with it. */
      .map(function (a) {
        var href = a.getAttribute('href') || '';
        return href.charAt(0) === '#' && href.length > 1
          ? document.querySelector(href)
          : null;
      })
      .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          links.forEach(function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

      sections.forEach(function (s) { spy.observe(s); });
    }

    /* ── Fullscreen menu ──────────────────────────────────── */
    var toggle = SK.$('[data-menu-toggle]');
    var menu   = SK.$('#menu');
    if (!toggle || !menu) return;

    SK.$$('[data-menu-link]', menu).forEach(function (a, i) {
      a.style.setProperty('--i', i);
    });

    var open = false;
    var lastFocus = null;

    function setOpen(next) {
      if (next === open) return;
      open = next;

      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', open);

      if (open) {
        lastFocus = document.activeElement;
        menu.hidden = false;
        // next frame so the clip-path transition actually runs
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
        nav.classList.remove('is-away');
      } else {
        menu.classList.remove('is-open');
        var delay = SK.reduced ? 0 : 700;
        setTimeout(function () { if (!open) menu.hidden = true; }, delay);
        if (lastFocus) lastFocus.focus();
      }
    }

    toggle.addEventListener('click', function () { setOpen(!open); });

    /* The burger is buried under the overlay once the menu is open, so
       the overlay carries its own close control. Without it the only
       ways out are Escape — no such key on a phone — or following a
       link, which forces you to navigate somewhere to dismiss it. */
    var closeBtn = SK.$('[data-menu-close]', menu);
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { setOpen(false); });
    }

    SK.$$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (!open) return;

      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;

      // Keep focus inside the overlay while it is open.
      var focusables = SK.$$('a, button', menu).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;

      var first = focusables[0];
      var lastEl = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault(); first.focus();
      }
    });

    // Close if the viewport grows back to desktop width.
    window.addEventListener('resize', SK.debounce(function () {
      if (open && window.innerWidth > 900) setOpen(false);
    }, 200));
  });

})(window.SK);
