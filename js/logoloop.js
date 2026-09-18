/* ============================================================
   LOGO LOOP — seamless client logo marquee
   Ported from the React Bits LogoLoop to plain JS so it matches
   the rest of the site: no build step, no framework.

   The markup holds one authored list of logos. This measures that
   list, clones it until the copies overflow the container, then
   translates the track by one sequence width and wraps — so the
   seam never lands inside the viewport.

   Configured off the container:
     data-logoloop           mark the element
     data-speed              px per second        (default 60)
     data-direction          left | right         (default left)
     data-hover-speed        px/s while hovered   (default 0, pause)
   ============================================================ */

(function (SK) {
  'use strict';

  /* Seconds for the velocity to close ~63% of the gap to its target.
     Low enough to feel responsive, high enough that pausing on hover
     reads as a glide rather than a hard stop. */
  var SMOOTH_TAU  = 0.25;
  var MIN_COPIES  = 2;
  var COPY_HEAD   = 2;   /* spare copies either side of the fold */

  SK.ready(function () {
    SK.$$('[data-logoloop]').forEach(setup);
  });

  function setup(root) {
    var track = SK.$('.logoloop__track', root);
    var seq   = SK.$('.logoloop__list', track);
    if (!track || !seq) return;

    var speed      = parseFloat(root.dataset.speed) || 60;
    var hoverSpeed = root.dataset.hoverSpeed === undefined
      ? 0 : parseFloat(root.dataset.hoverSpeed) || 0;
    var dirSign    = root.dataset.direction === 'right' ? -1 : 1;
    var target     = Math.abs(speed) * dirSign * (speed < 0 ? -1 : 1);

    var seqWidth = 0;
    var copies   = MIN_COPIES;
    var offset   = 0;
    var velocity = 0;
    var hovered  = false;
    var last     = 0;

    /* ── Measuring ──────────────────────────────────────────
       The sequence is only ever measured on the first copy; the
       clones are aria-hidden and carry no independent width. */
    function measure() {
      var w = seq.getBoundingClientRect().width;
      if (w <= 0) return;

      seqWidth = Math.ceil(w);
      var need = Math.ceil(root.clientWidth / seqWidth) + COPY_HEAD;
      var want = Math.max(MIN_COPIES, need);
      if (want !== copies) { copies = want; sync(); }

      offset = ((offset % seqWidth) + seqWidth) % seqWidth;
      paint();
    }

    /* Add or drop clones so the track always overflows the container. */
    function sync() {
      var have = track.children.length;
      for (var i = have; i < copies; i++) {
        var clone = seq.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        /* Cloned links would be extra tab stops for the same destinations. */
        SK.$$('a', clone).forEach(function (a) { a.setAttribute('tabindex', '-1'); });
        track.appendChild(clone);
      }
      for (var j = have - 1; j >= copies; j--) {
        track.removeChild(track.children[j]);
      }
    }

    function paint() {
      track.style.transform = 'translate3d(' + (-offset).toFixed(2) + 'px,0,0)';
    }

    sync();
    measure();

    /* Widths settle late: webfonts reflow the row, and the logos are
       lazy so their intrinsic size lands after first paint. */
    SK.$$('img', seq).forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load',  measure, { once: true });
      img.addEventListener('error', measure, { once: true });
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener('load', measure);

    if (window.ResizeObserver) {
      var ro = new ResizeObserver(SK.debounce(measure, 120));
      ro.observe(root);
      ro.observe(seq);
    } else {
      window.addEventListener('resize', SK.debounce(measure, 180));
    }

    /* A still marquee is the whole point of the reduced-motion opt-out,
       so the loop is never started rather than started and hidden. */
    if (SK.reduced) return;

    if (SK.fine) {
      track.addEventListener('mouseenter', function () { hovered = true; });
      track.addEventListener('mouseleave', function () { hovered = false; });
    }

    SK.tick(function () {
      var now = performance.now();
      var dt  = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      var rect = root.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      if (!seqWidth || !dt) return;

      var to = hovered ? hoverSpeed : target;
      velocity += (to - velocity) * (1 - Math.exp(-dt / SMOOTH_TAU));

      offset = (((offset + velocity * dt) % seqWidth) + seqWidth) % seqWidth;
      paint();
    });
  }

})(window.SK);
