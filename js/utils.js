/* ============================================================
   UTILS — shared namespace, helpers, single rAF ticker
   Every other module reads from window.SK.
   ============================================================ */

window.SK = (function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine    = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqWide    = window.matchMedia('(min-width: 900px)');

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* One rAF loop shared by cursor, parallax, scroll progress and the
     pinned timeline — cheaper and jitter-free versus a loop per module. */
  var tasks = [];
  var running = false;

  function frame() {
    running = false;

    /* Iterate backwards so a task removing itself mid-frame can't make
       the loop skip its neighbour. A throwing task is dropped rather
       than allowed to kill the loop for every other module. */
    for (var i = tasks.length - 1; i >= 0; i--) {
      try {
        tasks[i]();
      } catch (err) {
        tasks.splice(i, 1);
        if (window.console) console.error('[SK] tick task removed after error:', err);
      }
    }

    if (tasks.length) { running = true; requestAnimationFrame(frame); }
  }

  function tick(fn) {
    tasks.push(fn);
    if (!running) { running = true; requestAnimationFrame(frame); }
    return function off() {
      var i = tasks.indexOf(fn);
      if (i > -1) tasks.splice(i, 1);
    };
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 150);
    };
  }

  return {
    $: $, $$: $$,
    clamp: clamp, lerp: lerp,
    tick: tick, ready: ready, debounce: debounce,
    get reduced() { return mqReduced.matches; },
    get fine()    { return mqFine.matches; },
    get wide()    { return mqWide.matches; }
  };
})();
