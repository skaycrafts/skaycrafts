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
├── assets/             logo, favicon, client marks
├── css/
│   ├── tokens.css      colours, type scale, spacing, motion — the design system
│   ├── base.css        reset, document, typography primitives
│   ├── layout.css      shell, nav, menu, footer, cursor, grain
│   ├── components.css  buttons, rule-links, index, band, mockups, accordion, form
│   ├── portal.css      the scroll-driven hero
│   ├── deck.css        the throwable deck — retired, kept for reference
│   ├── sections.css    process, why, faq, contact
│   ├── systems.css     positioning, what we build, case studies,
│   │                   capabilities, industries
│   ├── logoloop.css    the client logo row under the hero
│   ├── animations.css  keyframes, reveal states, reduced-motion opt-out
│   └── responsive.css  breakpoints + print
└── js/
    ├── utils.js        shared helpers and the single shared rAF loop
    ├── nav.js          sticky nav, active link, fullscreen menu
    ├── cursor.js       custom cursor (desktop only)
    ├── portal.js       drives --p on the hero from scroll position
    ├── deck.js         drag/throw for the retired deck — no longer loaded
    ├── reveal.js       split text + scroll-triggered entrances
    ├── cards.js        3D tilt on mockups, magnetic buttons
    ├── logoloop.js     seamless client logo marquee
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
| Obsidian | `#08080B` | the page ground |
| Linen | `#FDF1E2` | the ink |
| Amethyst | `#AB92BF` | accent |

The site used to run ink-on-Linen with a black hero and footer. That split is
gone: the black field the chrome lockup always needed now runs the whole page,
and the cream is what sits on it. Same hues, inverted relationship.

Near-black rather than `#000`. Pure black flattens every rule and shadow to
nothing and makes white type vibrate on OLED; `#08080B` leaves room for a
surface above the ground (`--ground-2`) and one below it (`--ground-3`), which
is what makes a panel read as a panel without a drop shadow.

**Contrast**, measured on the ground:

| Colour | Ratio | Safe for |
|---|---|---|
| `--ink` `#F6F3EE` | 18.2:1 | headings, body copy |
| `--ink-2` `#C4BECC` | 11.4:1 | secondary copy |
| `--ink-3` `#9E98AB` | 7.6:1 | muted labels |
| Amethyst | 7.2:1 | passes as text here |

A dark ground is forgiving where the cream one was not — there is headroom at
every tier, and Amethyst clears 4.5:1 for the first time. The constraint moves
from legibility to restraint: the accent *can* carry words now, so the
discipline is choosing not to let it carry many. It stays on rules, numbers,
the `.ital` phrases and one link state.

**Depth comes from surfaces and hairlines, not shadows.** `--shadow-card` and
`--shadow-lift` still resolve, but on near-black they are almost nothing. A
raised block is raised because it is lighter than the ground and has a rule
around it.

**The paper texture is off** (`--paper-strength: 0`). The embossed stone tile
was what gave the cream its tooth; multiplied over near-black it only muddies
the few pixels it reaches. `base.css` still draws it, at zero. The film grain
in `layout.css` carries the texture now. Set the strength above 0 only if the
ground ever goes light again.

**One wash, very slow.** `--ground-wash` is a single wide radial of Amethyst at
4.5% sitting under the whole page, fixed to the viewport. It exists so a flat
`#08080B` does not read as a dead void on a large display. Keep it under 5% —
a gradient anyone notices is the failure mode.

**Content.** All copy lives in `index.html`, in numbered sections that match the
comments (`01 · POSITIONING`, `02 · WHAT WE BUILD`, and so on). The homepage
runs hero → what we build → selected work → built for complexity → process →
where we work → why → FAQ → start a project. Proof sits early on purpose: the
client marks appear under the hero and the case studies are the third thing
on the page, before any claim about capability.

**Adding a project.** Copy an `<article class="case">` block in the Work
section. Each one carries the number, sector and place in the margin column,
then the argument — what was built, what the system does, the stack it runs
on — and the capture last, so a narrow viewport puts the words before the
picture. Nothing needs renumbering elsewhere; there is no carousel state to
keep in sync.

Five projects are set out as case studies, all of them linking to the live
site:

| # | Project | Live at |
|---|---------|---------|
| 01 | The Roost | <https://theroostsrh.com/> |
| 02 | CornerStay | <https://cornerstay.in/> |
| 03 | HiOnWheels | <https://hionwheels.com/> |
| 04 | PlayZoo | <https://playzoo.in/> |
| 05 | Farook J Basha | <https://farookjbashadop.com/> |

**Two fields are deliberately missing from every case study**: the measurable
outcome, and the specific third-party systems each build integrates. Those are
the two things a serious prospect weighs most, and they are the two things
nobody outside the project can write. Fill them in — a `The outcome` and a
`The integrations` column alongside the existing two — and these become full
case studies. Do not approximate them; an invented number is worth less than
a missing one, and it is the one mistake this page cannot survive.

**Adding a client logo.** The marquee sits between the opening section and
Selected Work, so the marks land immediately before the projects they belong
to. It is one authored `<ul class="logoloop__list">`; `js/logoloop.js` clones
it until the copies overflow and translates the track by exactly one sequence
width, so the seam never lands on screen. Add an `<li class="logoloop__item">`
and that is all — the clone count, the wrap point and the hover pause
re-measure themselves.

The row is deliberately **full bleed and unpanelled**: it is a child of
`.section`, not of `.container`, so it runs edge to edge on the Linen ground
with no card, border or field behind it. The edges fade with `mask-image`
rather than a painted gradient — the paper texture is `body::before` at
`z-index: -1`, so anything opaque laid over the ground shows up as a flat
patch.

Export the mark to `assets/clients/` as WebP on a **transparent** ground,
160px tall. The row drops every mark to one silhouette with `brightness(0)`,
which is what lets gold, white and black artwork share a line — in their own
colours three of the seven (The Roost and Dawood Decors in white, Farook J
Basha in ivory) barely register against Linen. The alpha channel is the only
thing that survives, so a logo baked onto a white rectangle will arrive as a
white rectangle.

Normalising on height alone leaves a stacked lockup looking half the weight of
a bold monogram, so each item takes an optical-size modifier:
`--lockup` (mark over a wordmark), `--seal` (fine-line roundel) or `--bold`
(heavy monogram). Plain `.logoloop__item` is the neutral case.

The container reads `data-speed` (px per second), `data-direction`
(`left`/`right`) and `data-hover-speed` (`0` pauses). Under
`prefers-reduced-motion` the loop is never started. Row height is
`--logoloop-h` in `css/logoloop.css`.

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
