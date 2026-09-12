# Skay Crafts — Portfolio

Building Beyond Limits.

A single-page portfolio site for Skay Crafts. Hand-built: no framework, no
build step, no dependencies. Open `index.html` and it runs.

---

## Run it locally

Any static server works. From this folder:

```bash
npx serve
```

Then open the URL it prints (usually <http://localhost:3000>).

> Opening `index.html` directly by double-clicking also works — the scripts are
> classic (not ES modules) specifically so the site survives the `file://`
> protocol. A server is only nicer for testing.

## Deploy it

Upload the whole folder. There is nothing to compile.

- **Netlify / Vercel** — drag the folder onto the dashboard, or point it at the
  repo with no build command and the root as the publish directory.
- **cPanel / shared hosting** — upload the contents into `public_html`.
- **GitHub Pages** — push and enable Pages on the branch root.

## Before going live

1. **Point the contact form somewhere** — see below.
2. **Set the real domain** — three URLs at the top of `index.html`, under the
   `BEFORE LAUNCH` comment. Link previews need absolute URLs to show a thumbnail.
3. **Swap the case-study mockups** for real screenshots when you have them.
   They are CSS recreations built to match each live site, not actual captures.

The logo and favicon are already in place — see [`assets/README.md`](assets/README.md).

---

## Structure

```
skaycrafts/
├── index.html          all markup, section by section
├── assets/             logo + favicon
├── css/
│   ├── tokens.css      colours, type scale, spacing, motion — the design system
│   ├── base.css        reset, document, typography primitives
│   ├── layout.css      shell, nav, menu, footer, cursor, grain
│   ├── components.css  buttons, rule-links, index, band, mockups, accordion, form
│   ├── portal.css      the scroll-driven hero
│   ├── deck.css        the throwable project deck
│   ├── sections.css    one block per numbered section
│   ├── animations.css  keyframes, reveal states, reduced-motion opt-out
│   └── responsive.css  breakpoints + print
└── js/
    ├── utils.js        shared helpers and the single shared rAF loop
    ├── nav.js          sticky nav, active link, fullscreen menu
    ├── cursor.js       custom cursor (desktop only)
    ├── portal.js       drives --p on the hero from scroll position
    ├── deck.js         drag/throw + keyboard for the project deck
    ├── reveal.js       split text + scroll-triggered entrances
    ├── cards.js        3D tilt on mockups, magnetic buttons
    ├── process.js      pinned horizontal timeline
    ├── accordion.js    FAQ
    ├── form.js         validation + submission
    └── main.js         boot tasks
```

Stylesheets load in that order and it matters — `tokens.css` first,
`responsive.css` last. Scripts are deferred and ordered; `main.js` runs last.

## Design language

The site is set as an editorial layout, not a SaaS landing page. Four rules
keep it coherent if you extend it:

1. **Three voices, one contrast.** Syne (wide geometric) carries the portal
   wordmark and every heading; Sora carries all small type, uppercase at wide
   tracking for labels; Instrument Serif italic (`.ital`) is the accent —
   **one phrase per heading, never more.** That last restraint is what stops
   the page reading as a stock template.
2. **Rules, not boxes.** Sections are separated by hairlines and a numbered
   header (`.sec`), not by cards with borders and glows. Form fields are
   underlines, not boxes. Hairlines are ink at low alpha, never grey — a
   neutral grey rule reads cold against Linen.
3. **Asymmetry on purpose.** Section numbers sit in a margin column
   (`--margin-col`), with an oversized ghost numeral bleeding off the section
   edge. Resist centring things.
4. **Near-square corners, no glow.** Radii top out at 8px and buttons fill
   from the left on hover. Rounded gradient pills are the single most
   template-looking element on the web.
5. **The accent is never a filled area behind text.** Amethyst cannot carry
   words. The one exception is the portal's own doors, where the colour *is*
   the thing opening.

## Changing things

**Colours.** Three brand colours, held exactly as supplied, in `css/tokens.css`:

| | Hex | Role |
|---|---|---|
| Linen | `#FDF1E2` | page ground |
| Dolphin | `#655A7C` | ink |
| Amethyst | `#AB92BF` | accent |

Everything else is a derived tint or shade of one of those three, so the whole
page resolves to the same three hues. Nothing is hard-coded outside the tokens
file.

**Contrast is the constraint that shapes the palette.** Measured on Linen:

| Colour | Ratio | Safe for |
|---|---|---|
| `--ink` `#3A3349` | 10.8:1 | headings, body copy |
| Dolphin | 5.7:1 | body, links, small labels |
| `--ink-3` `#6F6683` | 4.8:1 | muted 11px labels |
| `--accent-deep` `#8F76A6` | 3.6:1 | **large display type only** |
| Amethyst | 2.5:1 | **never text** — rules, dots, fills |

Amethyst is the brand accent but fails text contrast at every size, so it
appears as rules, dots and fills, never as words. Where an accent must be read
— the italic phrases, hover states — the deeper shade carries it. Do not
lighten `--ink-3`; the site sets a lot of 11px uppercase type that drops under
4.5:1 immediately.

**The page has two grounds.** The hero stage, the nav, the fullscreen menu and
the footer are black; the body is Linen. The dark parts are not decoration —
the logo is chrome-on-black artwork and its silver bevels disappear on cream,
so anywhere the lockup appears has to stay dark.

Anything placed on the dark field uses `--on-field` / `--on-field-2` for type
and `--rule-dark*` for hairlines. Anything on Linen uses the `--ink*` scale and
plain `--rule*`. Mixing the two is the easiest way to produce unreadable text
here, and it will not be obvious on a quick look — dark-plum ink on black still
*renders*, it just sits at about 1.7:1.

**Content.** All copy lives in `index.html`, in numbered sections that match the
comments (`01 · HERO`, `02 · ABOUT`, and so on).

**Adding a project.** Copy an `<article class="deckcard">` block inside the
deck in the Work section, renumber it, and add one more `<i>` to
`[data-deck-dots]` so the progress dots still match. The deck adapts to any
number of cards.

Six projects are in the deck; four link out to live sites:

| # | Project | Live at |
|---|---------|---------|
| 01 | PlayZoo | <https://playzoo.in/> |
| 02 | CornerStay | <https://cornerstay.vercel.app/> |
| 03 | The Roost | <https://theroost-production.up.railway.app/> |
| 04 | Farook J Basha | <https://farookjbashadop.com/> |
| 05 | Angson | — |
| 06 | Gym Billing | — |

Linked cards carry a `.deckcard__link` with `target="_blank" rel="noopener"`.
Cards with no URL simply omit it. Dragging is suppressed over the link so the
site stays clickable.

**Mockup colours are per-client, on purpose.** Each `.screen--*` sets its own
`--brand` matching the real site — PlayZoo gold, CornerStay teal, The Roost
wine, Farook white-on-black — and the `ui-*` primitives inherit it. Five
recolours of the same violet would make real client work look invented. The
portfolio's own chrome stays strictly violet/chrome/black. To make the
mockups monochrome instead, point every `--brand` at `var(--violet-400)`.

**Contact form.** With no backend it opens the visitor's mail client
pre-addressed to `skaycraftsmail@gmail.com`. To take submissions properly, set
one constant at the top of `js/form.js`:

```js
var ENDPOINT = 'https://formspree.io/f/xxxxxxx';   // or your own API
```

It will POST JSON there instead. Nothing else needs to change.

**The portal hero.** Two panels start closed and part outward to uncover the
logo, while the SKAY CRAFTS wordmark grows, its tracking tightens, and its two
halves travel to opposite edges. Growing and tightening *together* is the whole
effect — either alone reads as a plain zoom.

It is driven by exactly one custom property, `--p` (0 = closed, 1 = open), set
by `js/portal.js` from scroll **position**. Everything else is CSS `calc()`.
Two consequences worth knowing:

- Because it is position-bound rather than timed, the portal **closes again**
  on the way back up, for free.
- `--p` defaults to `1` in the stylesheet. So with no JavaScript, or under
  `prefers-reduced-motion` where the script never binds, the finished **open**
  page is what renders. Nothing is hidden behind a script that might not run.

To retune it, change the numbers in `css/portal.css` — `--portal-h` for how
long the scroll lasts, and the coefficients in the `calc()`s for how far each
layer travels. Re-measure after changing the typeface: Syne is wide and needs
less tightening than a condensed face would.

**The deck.** Six project cards stacked physically; drag past a tenth of the
deck width to throw one aside. It is focusable with `tabindex="0"` and the
arrow keys throw cards, so it works without a mouse, and `touch-action: pan-y`
keeps vertical scrolling working on a phone. Only the top card's link is
tabbable.

**Entrance animation.** There is no splash screen. The page itself is the
reveal: hero parts arrive in sequence via `[data-intro]` in
`css/animations.css`, and everything below the fold rises in on scroll.

---

## Notes

**Accessibility.** Skip link, visible focus rings, keyboard-navigable FAQ,
focus trapping in the mobile menu, ARIA on the accordion and nav. Everything
motion-related is switched off under `prefers-reduced-motion` — reveals resolve
instantly, the kinetic band stops, and the pinned timeline becomes an ordinary
swipeable row.

**Performance.** No libraries. All scroll and pointer work shares one
`requestAnimationFrame` loop (`js/utils.js`), animations stay on `transform`
and `opacity`, and a task that throws is dropped rather than taking the loop
down with it.

**Browser support.** Current Chrome, Edge, Firefox and Safari. Uses the
standalone `translate` property so pointer effects compose with CSS keyframes
instead of overwriting them.

**Contact details** are in the Contact section and footer of `index.html`:
skaycraftsmail@gmail.com · +91 78453 91992 · +91 81100 75633.
