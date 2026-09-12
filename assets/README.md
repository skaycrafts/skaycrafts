# Assets

## `logo-full.png` — installed

The full stacked lockup: the chrome **SC** mark with **SKAY CRAFTS** and
**BUILDING BEYOND LIMITS** beneath it. **1032 × 589, transparent background.**

It was extracted from `SkayCrafts Portfolio.pdf`, which stored the artwork and
its alpha channel separately — recombining them gave a properly transparent
PNG rather than one with a baked-in black rectangle. The lockup itself is
untouched: no recolouring, no re-typesetting, no cropping of the wordmark.

### Where it is used

| Place | How it appears |
|---|---|
| Portal hero | The **SC** mark alone, on black — both text bands cropped off |
| Header | Only the **SC** mark, cropped out of the same file by CSS |
| Footer | Full lockup at small size |

**Never set the tagline as live text next to the artwork** — the lockup already
carries "BUILDING BEYOND LIMITS", and repeating it reads as a mistake.

### The three content bands

Measured from the file's alpha channel — useful whenever something needs to
show only part of the lockup:

| Band | Pixels (of 589) | As a fraction |
|---|---|---|
| SC mark | y 9–387 | 1.5% – 65.9% |
| SKAY CRAFTS | y 436–507 | 74.0% – 86.2% |
| BUILDING BEYOND LIMITS | y 546–580 | 92.7% – 98.6% |

**The portal hero crops at 69.6%**, cutting in the gap between the mark and the
"SKAY CRAFTS" band so the mark appears alone. Both text bands are dropped: the
wordmark is set at full size over the top of the hero, and showing the artwork's
own wordmark under it would say the name twice. That crop is `.portal__logo` in
`css/portal.css`; the PNG itself is untouched, so every other placement still
shows the complete lockup.

### The header crop

The header needs the mark alone; the wordmark would be illegible at 52px.
Rather than ship a second cropped file, `css/layout.css` shows just the mark's
region of the same image:

```css
.mark            { width: 52px; aspect-ratio: 495 / 379; overflow: hidden; }
.mark img        { width: 208.5%; left: -58.6%; top: -2.4%; }
```

Those numbers are the measured bounding box of the mark inside the current
file — **x 290…784, y 9…387** of 1032 × 589.

**If you replace `logo-full.png`,** re-measure. For a new file of width `W`
and height `H`, with the mark occupying `x0…x1`, `y0…y1`:

```
aspect-ratio : (x1-x0) / (y1-y0)
img width    : W / (x1-x0)  as a percentage
img left     : -x0 / (x1-x0)  as a percentage
img top      : -y0 / (y1-y0)  as a percentage
```

If the mark simply looks slightly off-centre after a swap, nudging `left` and
`top` by a few percent is enough.

### If the file goes missing

The site does not break. `js/main.js` detects the failed load and swaps in a
CSS-drawn wordmark so the header and splash still read as Skay Crafts.

## `favicon.png`

180 × 180, the real SC mark on a rounded near-black tile, generated from
`logo-full.png`. Used as both the browser icon and the iOS home-screen icon.
Regenerate it from the same source if the logo ever changes.


---

# Background texture

**`paper-tile.jpg`** — installed. 1120x1992, 130 KB. It is the ground under the
whole Linen page, tiled. The original is kept at `bg image/download.jpeg`.

Two things were done to the source photograph, and both matter:

## 1. Mirrored, so it tiles with no seam

A photograph's left edge does not match its right, so `background-repeat` shows
a hard line at every join. The source was mirrored into a 2x2 block — original,
flipped horizontally, flipped vertically, flipped both — which makes every outer
edge a mirror of the edge it meets when tiled.

| | Seam discontinuity (0-255) |
|---|---|
| Raw photo, tiled | **60** — clearly visible |
| Mirrored tile | **3** — JPEG noise only, invisible |

## 2. Tonally lifted, so it does not break text contrast

This is the part that is easy to miss. The raw texture ran down to **172** in
its darkest channel. Multiplied over Linen that dragged the page ground dark
enough to fail WCAG AA across **97.5%** of the page — not an edge case, the
whole surface.

The tile is therefore lifted (`out = in * 0.25 + 0.75`) so it now spans
**232-255**. It reads as a *tint* rather than a *shade*: the grain is still
there, but the ground stays light.

Measured over the darkest part of the finished texture:

| | Contrast | |
|---|---|---|
| `--ink` | **9.98** | pass |
| Dolphin | **5.28** | pass |
| `--ink-3` | **4.67** | pass |

`--ink-3` was deepened to `#6C6380` to clear that last case.

**If you regenerate this tile, keep the lift.** Rebuilding it from the raw
photograph without lifting, or pushing `--paper-strength` much above `.5`, puts
small muted type back under 4.5:1 over most of the page. Measure, do not assume.

## Regenerating

The tile was built with `System.Drawing` via PowerShell. For a PNG source there
is also a dependency-free Node path:

1. Save the texture as `assets/paper-source.png` (8-bit PNG, RGB or RGBA)
2. `node tools/make-seamless.js`

That writes `assets/paper-tile.png`, which the CSS also accepts. Note it does
**not** apply the tonal lift — do that first, or re-check contrast after.

## Tuning

```css
--paper-strength: .5;     /* 0 disables the texture entirely */
--paper-tile: 760px;      /* how wide one repeat is drawn */
```

The dark sections — hero, nav, menu, footer — paint over the texture, so it
shows only on the Linen body, which is the intent. If the file is missing the
flat Linen ground shows through and nothing breaks.
