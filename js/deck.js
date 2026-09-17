/* ============================================================
   DECK — a throwable stack of project cards
   ------------------------------------------------------------
   Drag the top card past a threshold and it flies out across
   the deck's own width, then re-stacks at the back.

   Keyboard: the deck is focusable and left/right arrows throw
   the top card, so it is fully usable without a pointer.
   ============================================================ */

(function (SK) {
  'use strict';

  var THROW_RATIO = 0.1;    // fraction of deck width that counts as a throw
  var ROT_PER_PX  = 0.075;  // degrees of roll per pixel dragged

  SK.ready(function () {
    SK.$$('[data-deck]').forEach(function (deck) {
      var cards = SK.$$('.deckcard', deck);
      if (cards.length < 2) return;

      var dots = SK.$$('i', SK.$('[data-deck-dots]', deck.parentNode) || deck);
      var order = cards.map(function (_, i) { return i; });
      var busy = false;

      /* Reduced motion gets the static list the stylesheet renders. */
      if (SK.reduced) {
        cards.forEach(function (c) { c.style.setProperty('--i', 0); });
        return;
      }

      function render() {
        order.forEach(function (cardIndex, depth) {
          var card = cards[cardIndex];
          card.style.setProperty('--i', depth);
          card.style.zIndex = String(cards.length - depth);
          card.setAttribute('data-top', depth === 0 ? 'true' : 'false');
          card.setAttribute('aria-hidden', depth === 0 ? 'false' : 'true');
          // Only the visible card's link should be tabbable.
          var link = SK.$('.deckcard__link', card);
          if (link) link.tabIndex = depth === 0 ? 0 : -1;
        });

        dots.forEach(function (d, i) {
          d.classList.toggle('is-on', i === order[0]);
        });
      }

      function top() { return cards[order[0]]; }

      /* Send the top card out, then move it to the back. */
      function throwOut(dir) {
        if (busy) return;
        busy = true;

        var card = top();
        var w = deck.offsetWidth;

        card.classList.remove('is-dragging');
        card.style.transition = 'transform .5s cubic-bezier(.32,.72,.35,1), opacity .5s linear';
        card.style.transform =
          'translate3d(' + (dir * w * 1.15) + 'px, -8%, 0) rotate(' + (dir * 22) + 'deg) scale(.96)';
        card.style.opacity = '0';

        setTimeout(function () {
          order.push(order.shift());
          card.style.transition = 'none';
          card.style.transform = '';
          card.style.opacity = '';
          render();

          /* Release the lock on a timer, NOT inside rAF: browsers
             throttle rAF in background tabs, and gating `busy` on a
             frame that may never arrive would wedge the deck shut. */
          busy = false;

          // Restore easing once the reset has painted. Belt and braces,
          // for the same reason — whichever fires first wins, harmlessly.
          var restore = function () { card.style.transition = ''; };
          requestAnimationFrame(function () { requestAnimationFrame(restore); });
          setTimeout(restore, 80);
        }, 480);
      }

      /* ── Drag ─────────────────────────────────────────────── */
      var startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;

      deck.addEventListener('pointerdown', function (e) {
        if (busy) return;
        // Let people click the live link instead of dragging it.
        if (e.target.closest('.deckcard__link')) return;

        var card = top();
        if (!card.contains(e.target)) return;

        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        dx = dy = 0;

        card.classList.add('is-dragging');
        if (e.pointerType === 'mouse') card.setPointerCapture(e.pointerId);
      });

      deck.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        dx = e.clientX - startX;
        dy = e.clientY - startY;

        /* On touch the page owns vertical movement (touch-action: pan-y).
           Only follow sideways, or the card bobs up and down while the
           reader is simply scrolling past it. */
        if (e.pointerType !== 'mouse') dy = 0;

        top().style.transform =
          'translate3d(' + dx + 'px,' + dy + 'px,0) rotate(' + (dx * ROT_PER_PX) + 'deg) scale(1.02)';
      });

      function endDrag(e) {
        if (!dragging) return;
        dragging = false;

        var card = top();
        card.classList.remove('is-dragging');
        try { card.releasePointerCapture(e.pointerId); } catch (err) { /* already gone */ }

        if (Math.abs(dx) > deck.offsetWidth * THROW_RATIO) {
          throwOut(dx > 0 ? 1 : -1);
        } else {
          card.style.transform = '';   // snap back
        }
      }

      deck.addEventListener('pointerup', endDrag);
      deck.addEventListener('pointercancel', endDrag);

      /* ── Keyboard ─────────────────────────────────────────── */
      deck.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); throwOut(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); throwOut(-1); }
      });

      render();
    });
  });

})(window.SK);
