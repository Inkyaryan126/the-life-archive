# Quality Control

Use a 1-5 score for every generated candidate. `1` means unusable. `3` means technically acceptable but not yet production-ready. `5` means approved-level quality with no meaningful reservations.

## Image Scorecard

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Realism | Obviously artificial | Mostly real with minor artifacts | Believable cinematic photograph |
| Emotional honesty | Melodramatic or stock | Restrained but generic | Human, quiet, specific |
| Continuity | Breaks references | Mostly aligned | Fully matches approved references |
| Anatomy | Broken hands/body | Minor issues | Natural anatomy |
| Architecture consistency | Castle/hotel/haunted | Close but inconsistent | Same approved mansion |
| Photograph consistency | Wrong size/surface | Close but imperfect | Exact approved photo behavior |
| Composition | No usable copy zone | Some safe space | Strong desktop and mobile composition |
| Mobile crop safety | Subject lost | Subject readable | Subject and copy zone both safe |
| Text-safe area | Busy behind copy | Usable with treatment | Clean natural negative space |
| Restrained color | Oversaturated | Slightly pushed | Controlled cold-to-amber progression |
| Lack of AI cliches | Generic AI look | Some cliche risk | Specific, grounded, art-directed |
| Narrative usefulness | Pretty but irrelevant | Supports scene | Clearly advances story |

## Effects Scorecard

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Realism | Synthetic | Believable at low opacity | Natural at production opacity |
| Subtlety | Distracting | Manageable | Supports scene invisibly |
| Loop quality | Visible seam | Minor loop tell | Seamless |
| Compositing quality | Edge artifacts | Some tuning needed | Blends cleanly |
| Browser performance | Too heavy | Acceptable desktop | Works desktop and mobile |
| Mobile performance | Drops frames | Fallback needed | Smooth or clean fallback |
| Absence of fantasy appearance | Magical/neon | Slightly stylized | Practical and grounded |

## Audio Scorecard

| Criterion | 1 | 3 | 5 |
|---|---|---|---|
| Emotional restraint | Manipulative | Quiet but generic | Specific, restrained, moving |
| Dynamic balance | Too loud/flat | Mixable | Wide but controlled |
| Mobile clarity | Disappears or harsh | Needs EQ | Clear at low mobile volume |
| Silence usage | Overfilled | Some breathing room | Silence carries emotion |
| Loop quality | Obvious seam | Minor seam | Seamless |
| Synchronization | Misses visual beat | Adjustable | Lands naturally |
| Lack of trailer cliches | Braam/stinger | Slight trailer risk | No trailer language |
| Lack of commercial sentimentality | Ad-like | Some sentiment | Honest and unsentimental |

## Hard Rejection Rules

Reject any image immediately when it:

- Looks like horror.
- Looks like fantasy.
- Looks like a funeral advertisement.
- Shows a clear crying face.
- Makes the mansion too close.
- Includes fake text.
- Includes a fake QR code.
- Looks oversaturated.
- Breaks mourner continuity.
- Breaks mansion continuity.
- Looks like generic AI art.
- Contains malformed hands or duplicate fingers.
- Uses angels, ghosts, skeletons, glowing eyes, random candles, ravens, or magical particles.

Reject any effect immediately when it:

- Creates a portal, spell, scan grid, neon path, or supernatural glow.
- Has visible loop seams at production opacity.
- Blocks copy readability.
- Drops frames on a current iPhone-class mobile device without a fallback.

Reject any audio immediately when it:

- Sounds like a trailer, horror sting, app notification, corporate brand film, religious cue, or sentimental advertisement.
- Contains spoken words or lyrics.
- Resolves emotionally before the final confirmation state.
