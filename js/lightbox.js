/* ============================================================
   LIGHTBOX — opens a project's artwork at full size
   ------------------------------------------------------------
   Driven entirely by the markup. A card opts in with

     <li class="workcard workcard--gallery" data-gallery="dawood">

   and the matching <div class="lightbox" data-lightbox="dawood">
   holds the images. No configuration lives in here.

   Behaviour is deliberately the same as the fullscreen menu in
   nav.js — Escape closes, focus is trapped, the page behind is
   locked with .is-locked — so the site has one overlay habit
   rather than two competing ones.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    SK.$$('[data-lightbox]').forEach(function (box) {
      setup(box, SK.$$('[data-gallery="' + box.dataset.lightbox + '"]'));
    });
  });

  function setup(box, openers) {
    var figure = SK.$('.lightbox__figure', box);
    var img    = SK.$('.lightbox__img', box);
    var count  = SK.$('[data-lb-count]', box);
    var prev   = SK.$('[data-lb-prev]', box);
    var next   = SK.$('[data-lb-next]', box);
    var thumbs = SK.$$('.lightbox__thumb', box);
    if (!img || !thumbs.length) return;

    var shots = thumbs.map(function (t) {
      return { src: t.dataset.full, alt: t.dataset.alt || '' };
    });

    var i = 0;
    var lastFocus = null;

    /* Decode the neighbours up front: stepping through posters should
       not show a blank frame while the next one arrives. */
    function preload(n) {
      [n - 1, n + 1].forEach(function (k) {
        if (k < 0 || k >= shots.length) return;
        var pre = new Image();
        pre.src = shots[k].src;
      });
    }

    function show(n) {
      i = (n + shots.length) % shots.length;
      img.src = shots[i].src;
      img.alt = shots[i].alt;
      if (count) count.textContent = pad(i + 1) + ' / ' + pad(shots.length);
      thumbs.forEach(function (t, k) {
        t.classList.toggle('is-on', k === i);
        t.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
      /* Retrigger the fade: assigning src alone does not restart a CSS
         animation on an element that is already in the document. */
      img.style.animation = 'none';
      void img.offsetWidth;
      img.style.animation = '';
      preload(i);
    }

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function open(n) {
      lastFocus = document.activeElement;
      box.hidden = false;
      void box.offsetWidth;
      box.classList.add('is-open');
      document.body.classList.add('is-locked');
      show(n || 0);
      var close = SK.$('.lightbox__close', box);
      if (close) close.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
      /* Wait out the fade before pulling it from the accessibility tree,
         otherwise it vanishes mid-transition. */
      window.setTimeout(function () {
        if (!box.classList.contains('is-open')) box.hidden = true;
      }, SK.reduced ? 0 : 500);
    }

    openers.forEach(function (card) {
      var hit = SK.$('.workcard__link', card) || card;
      hit.addEventListener('click', function (e) {
        e.preventDefault();
        open(0);
      });
    });

    thumbs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k); });
    });
    if (prev) prev.addEventListener('click', function () { show(i - 1); });
    if (next) next.addEventListener('click', function () { show(i + 1); });

    SK.$$('[data-lb-close]', box).forEach(function (el) {
      el.addEventListener('click', close);
    });

    /* Clicking the field around the artwork closes, the way a viewer
       expects. Clicking the artwork itself does not. */
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target === figure) close();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape')     { close(); return; }
      if (e.key === 'ArrowLeft')  { show(i - 1); return; }
      if (e.key === 'ArrowRight') { show(i + 1); return; }

      if (e.key !== 'Tab') return;
      var f = SK.$$('button, [href]', box).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* Swipe: on a phone this is the control, and the arrows are the
       fallback rather than the other way round. */
    var x0 = null;
    box.addEventListener('touchstart', function (e) {
      x0 = e.changedTouches[0].clientX;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 45) show(dx < 0 ? i + 1 : i - 1);
    }, { passive: true });
  }

})(window.SK);
