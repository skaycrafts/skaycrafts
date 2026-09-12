/* ============================================================
   REVEAL — split-text preparation + scroll-triggered entrances
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {

    /* ── 1. Prepare split headlines (structure first, always) ── */
    SK.$$('[data-split]').forEach(function (el) {
      var mode = el.getAttribute('data-split');
      if (mode === 'lines') splitLines(el);
      else splitWords(el);
    });

    /* ── 2. Apply authored stagger offsets ────────────────────── */
    SK.$$('[data-reveal-delay]').forEach(function (el) {
      el.style.setProperty('--d', el.getAttribute('data-reveal-delay'));
    });

    /* ── 3. Observe ─────────────────────────────────────────────
       Hero targets are already in view, so they fire on the first
       observer callback — that is the page's entrance animation. */
    var targets = SK.$$('[data-reveal], [data-split]');

    if (!('IntersectionObserver' in window) || SK.reduced) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);     // one-shot: never replay on scroll-up
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12
    });

    targets.forEach(function (el) { io.observe(el); });
  });


  /* ── Split a heading into masked words ──────────────────────
     Preserves <br> and any inline markup that isn't a text node. */
  function splitWords(el) {
    if (el.dataset.split1 === '1') return;
    el.dataset.split1 = '1';

    var frag = document.createDocumentFragment();
    var index = 0;

    Array.prototype.slice.call(el.childNodes).forEach(function (node) {

      if (node.nodeType === 3) {                       // text
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (!part.trim()) { frag.appendChild(document.createTextNode(' ')); return; }

          var mask  = document.createElement('span');
          var inner = document.createElement('span');
          mask.className  = 'sw';
          inner.className = 'sw__i';
          inner.textContent = part;
          inner.style.setProperty('--d', index++);
          mask.appendChild(inner);
          frag.appendChild(mask);
        });

      } else if (node.nodeName === 'BR') {
        frag.appendChild(document.createElement('br'));

      } else {
        /* Inline elements (the italic accent word) get masked too, so
           they rise with the rest of the line instead of popping in. */
        var wrap  = document.createElement('span');
        var clone = node.cloneNode(true);
        wrap.className = 'sw';
        clone.classList.add('sw__i');
        clone.style.setProperty('--d', index++);
        wrap.appendChild(clone);
        frag.appendChild(wrap);
      }
    });

    el.innerHTML = '';
    el.appendChild(frag);
    el.classList.add('split');
  }

  /* ── Wrap each direct child element as a masked line ──────── */
  function splitLines(el) {
    if (el.dataset.split1 === '1') return;
    el.dataset.split1 = '1';

    Array.prototype.slice.call(el.children).forEach(function (child, i) {
      var mask = document.createElement('span');
      mask.className = 'sl';
      el.insertBefore(mask, child);
      mask.appendChild(child);
      child.classList.add('sl__i');
      child.style.setProperty('--d', i);
    });

    el.classList.add('split');
  }

})(window.SK);
