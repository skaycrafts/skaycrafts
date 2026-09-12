/* ============================================================
   ACCORDION — FAQ
   Height animation is pure CSS (grid-template-rows 0fr -> 1fr);
   this only manages state and ARIA.
   ============================================================ */

(function (SK) {
  'use strict';

  SK.ready(function () {
    SK.$$('[data-accordion]').forEach(function (group) {
      var items = SK.$$('.qa', group);

      items.forEach(function (item, i) {
        var btn    = SK.$('.qa__q', item);
        var panel  = SK.$('.qa__a', item);
        if (!btn || !panel) return;

        // Wire up ids so screen readers can pair button and panel.
        var id = 'qa-' + i;
        panel.id = id + '-panel';
        btn.id = id + '-btn';
        btn.setAttribute('aria-controls', panel.id);
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-labelledby', btn.id);

        btn.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');

          // One panel at a time keeps the section from sprawling.
          items.forEach(function (other) {
            if (other === item) return;
            other.classList.remove('is-open');
            var ob = SK.$('.qa__q', other);
            if (ob) ob.setAttribute('aria-expanded', 'false');
          });

          item.classList.toggle('is-open', willOpen);
          btn.setAttribute('aria-expanded', String(willOpen));
        });
      });

      /* Arrow-key navigation between questions. */
      group.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

        var buttons = SK.$$('.qa__q', group);
        var at = buttons.indexOf(document.activeElement);
        if (at === -1) return;

        e.preventDefault();
        var next = e.key === 'ArrowDown'
          ? (at + 1) % buttons.length
          : (at - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
      });
    });
  });

})(window.SK);
