/* ============================================================
   FORM — inline validation + submission
   ------------------------------------------------------------
   No backend ships with this site, so submissions open the
   visitor's mail client pre-filled (works on any host, including
   plain static hosting).

   To switch to a real endpoint later, set ENDPOINT below to your
   URL — e.g. a Formspree form or your own API. Nothing else in
   the file needs to change.
   ============================================================ */

(function (SK) {
  'use strict';

  var ENDPOINT = '';                              // '' = mailto fallback
  var INBOX    = 'skaycraftsmail@gmail.com';

  SK.ready(function () {
    var form = SK.$('[data-form]');
    if (!form) return;

    var status = SK.$('[data-form-status]', form);

    var RULES = {
      name:    { required: true,  min: 2,  msg: 'Please tell us your name.' },
      email:   { required: true,  email: true, msg: 'Enter a valid email address.' },
      need:    { required: true,  msg: 'Pick what you need.' },
      message: { required: true,  min: 10, msg: 'A sentence or two is plenty.' }
    };

    /* ── Validation ───────────────────────────────────────── */
    function validate(input) {
      var rule = RULES[input.name];
      if (!rule) return true;

      var value = (input.value || '').trim();
      var ok = true;

      if (rule.required && !value) ok = false;
      else if (rule.min && value.length < rule.min) ok = false;
      else if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) ok = false;

      var field = input.closest('.field');
      if (field) {
        field.classList.toggle('has-error', !ok);
        var slot = SK.$('[data-err]', field);
        if (slot) slot.textContent = ok ? '' : rule.msg;
      }
      return ok;
    }

    SK.$$('input, select, textarea', form).forEach(function (input) {
      // Validate on blur, then live-correct once it has been flagged.
      input.addEventListener('blur', function () { validate(input); });
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field && field.classList.contains('has-error')) validate(input);
      });
      input.addEventListener('change', function () { validate(input); });
    });

    /* ── Submit ───────────────────────────────────────────── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var inputs = SK.$$('input, select, textarea', form);
      var firstBad = null;

      inputs.forEach(function (input) {
        if (!validate(input) && !firstBad) firstBad = input;
      });

      if (firstBad) {
        say('Please check the highlighted fields.', false);
        firstBad.focus();
        return;
      }

      var data = {};
      inputs.forEach(function (input) {
        if (input.name) data[input.name] = (input.value || '').trim();
      });

      var btn = SK.$('button[type="submit"]', form);
      if (btn) btn.disabled = true;

      if (ENDPOINT) {
        send(data, btn);
      } else {
        window.location.href = compose(data);
        say('Opening your email app with the message ready to send.', true);
        form.reset();
        if (btn) btn.disabled = false;
      }
    });

    function send(data, btn) {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          say('Thanks — we\'ve got it. We\'ll be in touch shortly.', true);
          form.reset();
        })
        .catch(function () {
          say('Something went wrong. Email us directly at ' + INBOX + '.', false);
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    }

    /* Builds a readable mailto: body from the form values. */
    function compose(d) {
      var subject = 'New project enquiry' + (d.company ? ' — ' + d.company : '');
      var body = [
        'Name:    ' + (d.name || ''),
        'Company: ' + (d.company || '—'),
        'Email:   ' + (d.email || ''),
        'Phone:   ' + (d.phone || '—'),
        'Needs:   ' + (d.need || ''),
        '',
        d.message || ''
      ].join('\n');

      return 'mailto:' + INBOX +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    function say(text, ok) {
      if (!status) return;
      status.textContent = text;
      status.classList.remove('is-ok', 'is-bad');
      status.classList.add('is-shown', ok ? 'is-ok' : 'is-bad');
    }
  });

})(window.SK);
