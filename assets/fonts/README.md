# Fonts

These are **self-hosted**. The site makes no external font requests, so it
renders the same offline, behind a strict network, and in regions where Google
Fonts is blocked — with no third-party round trip before first paint.

| File | Face | Weights | Licence |
|---|---|---|---|
| `Jost-Variable-latin.woff2` | Jost | 300–700 (variable) | SIL OFL 1.1 |
| `Jost-Variable-latin-ext.woff2` | Jost | 300–700 (variable) | SIL OFL 1.1 |
| `PinyonScript-Regular-latin.woff2` | Pinyon Script | 400 | SIL OFL 1.1 |
| `PinyonScript-Regular-latin-ext.woff2` | Pinyon Script | 400 | SIL OFL 1.1 |

Both licences permit commercial use and web embedding. Ship `OFL.txt` beside
these files if you ever redistribute the folder itself.

Jost is a **variable** font — a single file spans the whole 300–700 range, so
all five weights the site uses cost one 26KB download rather than five files.

Only the `latin` and `latin-ext` subsets are bundled. Google also serves a
`cyrillic` subset; nothing here uses it, so it is left out. Add it back if that
changes.

## Swapping in the brand faces

`Vonca` and `Bangeline` are the intended faces. They are **commercial** and are
not bundled. To activate them:

1. **Confirm you hold a webfont licence for each.** A desktop licence usually
   does *not* cover embedding a font on a website, and these files are served
   publicly to every visitor. This is the one item here that carries legal risk.
2. Convert to `.woff2` — <https://transfonter.org>, roughly 40% smaller than
   `.otf`/`.ttf`, supported everywhere.
3. Save them here using **exactly** these names:

   | File | Weight |
   |---|---|
   | `Vonca-Light.woff2` | 300 |
   | `Vonca-Regular.woff2` | 400 |
   | `Vonca-Medium.woff2` | 500 |
   | `Vonca-SemiBold.woff2` | 600 |
   | `Vonca-Bold.woff2` | 700 |
   | `Bangeline.woff2` | script accent |

4. Uncomment the "Brand faces — inactive" block at the bottom of
   `css/fonts.css`.

You do not need all five Vonca weights — any you leave out fall through to the
next available one, and Regular plus Bold alone will carry the site.

The stacks in `css/tokens.css` already name Vonca and Bangeline *ahead* of Jost
and Pinyon Script, so the brand faces take over as soon as those `@font-face`
rules exist. Nothing else needs editing.

Those rules are commented out rather than deleted: live `@font-face` rules
pointing at files that are not there put a 404 per face into every visitor's
console, which is what the previous setup did.
