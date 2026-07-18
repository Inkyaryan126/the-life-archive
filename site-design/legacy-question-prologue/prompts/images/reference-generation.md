# Reference Generation

Use this file before generating any scene asset. The prologue depends on three approved anchors: mourner, photograph, and mansion. Do not generate later mansion scenes until one canonical mansion design is approved.

## Shared Reference Workflow

1. Generate neutral references first, not dramatic scenes.
2. Save approved masters in `assets/source-masters/` and approved production derivatives in `assets/images/`.
3. Use the approved reference as image reference for every later scene involving that subject.
4. Reuse seed, style reference, and fixed wardrobe or architecture notes whenever the generator supports them.
5. Reject any reference that looks like generic AI art, fantasy, horror, fashion editorial, product advertising, or stock grief imagery.

## Mourner Reference

Canonical description: gender-ambiguous adult, approximately 5 ft 8 in to 5 ft 11 in, average build, dark wool funeral coat falling just above the knee, dark straight-leg trousers, simple dark leather shoes, restrained short-to-medium hairstyle, no visible facial identity, no jewelry that changes between scenes, no dramatic costume elements.

Fixed wardrobe notes: coat is matte dark wool, structured but not fashionable, no large buttons as a focal point, no scarf color accent, no hat, no umbrella as identity marker. Hands may be bare or in very simple dark gloves, but choose one approach and keep it consistent after approval.

Generator control notes:

- Image reference: use the approved neutral sheet as the primary character reference for Assets 03, 08, 11, 22, and 25.
- Character reference: lock body type, coat length, shoulder shape, trousers, shoes, and hairstyle.
- Seed reuse: reuse the approved mourner seed for all mourner scenes unless the image generator produces repeated artifacts.
- Style reference: pair with the global cinematic style reference, not fashion references.
- Fixed wardrobe notes: paste the canonical description into every mourner scene prompt.

### Mourner A - Full Rear Standing View

- Asset ID: `LQ-REF-MOURNER-001`
- Exact filename: `reference-mourner-full-rear-standing.png`
- Prompt: Neutral full-body rear view of a gender-ambiguous adult mourner, approximately 5 ft 8 in to 5 ft 11 in, average build, wearing a matte dark wool funeral coat above the knee, dark trousers, simple dark leather shoes, restrained short-to-medium hairstyle, standing naturally with arms at sides, face not visible, plain dark gray studio background, realistic proportions, no fashion pose, no jewelry, no text.
- Negative prompt: no face, no logo, no text, no fashion styling, no dramatic costume, no jewelry, no umbrella, no theatrical grief, no malformed hands, no duplicate fingers.

### Mourner B - Rear Three-Quarter View

- Asset ID: `LQ-REF-MOURNER-002`
- Exact filename: `reference-mourner-rear-three-quarter.png`
- Prompt: Neutral rear three-quarter view of the same gender-ambiguous mourner in the same dark wool funeral coat, average build, simple trousers and shoes, head turned slightly away but no facial identity visible, coat texture visible, plain background, realistic reference-sheet lighting.
- Negative prompt: no clear face, no visible identity, no jewelry, no brand marks, no theatrical pose, no fantasy costume.

### Mourner C - Seated Silhouette

- Asset ID: `LQ-REF-MOURNER-003`
- Exact filename: `reference-mourner-seated-silhouette.png`
- Prompt: Seated silhouette reference of the same mourner, dark wool coat visible, shoulders slightly rounded, hands low near lap, face fully hidden by angle and shadow, neutral gray background, realistic anatomy and natural seated posture.
- Negative prompt: no crying face, no hands covering face, no heroic posture, no expressive costume, no text.

### Mourner D - Coat and Hands Close-Up

- Asset ID: `LQ-REF-MOURNER-004`
- Exact filename: `reference-mourner-coat-hands-closeup.png`
- Prompt: Close-up reference of matte dark wool funeral coat texture and simple hands near the coat hem, no jewelry, no watch, realistic skin and fabric, neutral lighting, practical reference image.
- Negative prompt: no rings, no watch, no manicured fashion look, no deformed hands, no duplicate fingers, no text.

### Mourner E - Neutral Reference Sheet

- Asset ID: `LQ-REF-MOURNER-005`
- Exact filename: `reference-mourner-neutral-sheet.png`
- Prompt: Neutral character reference sheet for the same anonymous mourner, rear standing view, rear three-quarter view, seated silhouette, coat texture detail, simple shoes detail, plain gray background, consistent dark wool funeral coat and restrained hairstyle, no facial identity, no labels or text.
- Negative prompt: no readable labels, no face, no costume variation, no jewelry, no umbrella, no fashion editorial lighting.

## Photograph Reference

Canonical description: old printed photograph, 3.5 by 5 inches, off-white border approximately 0.18 inch, slightly worn edges, mild water damage, matte-to-satin paper surface, low gloss, softened corners, tiny corner wear, pictured face permanently obscured by angle, damage, or depth of field. Include a hidden blank square area on one corner or back surface for later QR compositing. The generated reference must not include an actual QR code or any code-like grid.

### Photograph A - Front View

- Asset ID: `LQ-REF-PHOTO-001`
- Exact filename: `reference-photograph-front-view.png`
- Prompt: Front view of a 3.5 by 5 inch old printed photograph with worn off-white border, mild water damage, matte-to-satin surface, softened corners, pictured face permanently obscured by blur and paper damage, no readable text, no QR code, no logos, neutral dark tabletop.
- Negative prompt: no clear face, no readable writing, no QR pattern, no modern glossy print, no perfect clean paper.

### Photograph B - Angled View

- Asset ID: `LQ-REF-PHOTO-002`
- Exact filename: `reference-photograph-angled-view.png`
- Prompt: Angled three-quarter view of the same old photograph, slight paper curl, worn off-white border, low gloss, edge wear, hidden blank square area visible on one corner for later compositing, pictured face obscured, realistic paper thickness.
- Negative prompt: no QR, no text, no visible identity, no heavy damage, no modern phone-photo look.

### Photograph C - Wet Version

- Asset ID: `LQ-REF-PHOTO-003`
- Exact filename: `reference-photograph-wet-version.png`
- Prompt: Wet version of the same old photograph with a few rain droplets, mild water stain near border, off-white edge, face still unidentifiable, hidden blank square area remains empty and readable as a blank area, realistic paper fibers.
- Negative prompt: no QR, no text, no face, no melodramatic damage, no blood-like stain.

### Photograph D - Indoor Dry Version

- Asset ID: `LQ-REF-PHOTO-004`
- Exact filename: `reference-photograph-indoor-dry-version.png`
- Prompt: Indoor dry version of the same old photograph on dark wood, matte-to-satin surface, worn off-white border, slight curl, hidden blank square area empty, face obscured by shallow focus and age damage, restrained amber edge light.
- Negative prompt: no QR, no writing, no face, no glossy modern finish, no decorative scrapbook.

### Photograph E - Macro Paper Texture

- Asset ID: `LQ-REF-PHOTO-005`
- Exact filename: `reference-photograph-macro-paper-texture.png`
- Prompt: 100mm macro reference of old photograph paper fibers, off-white border texture, mild water damage, low gloss, blank impressed square area with no markings, realistic print-paper surface.
- Negative prompt: no QR, no typography, no barcode, no fake scan lines, no magical glow.

## Mansion Reference

Canonical description: early-20th-century monumental archive estate, stone exterior, aged copper roof, restrained Beaux-Arts structure with slight gothic influence, symmetrical entrance, consistent window pattern, realistic institutional scale, maintained and occupied, not abandoned, not haunted, no towers that make it look like a castle.

### Mansion Candidate A - Beaux-Arts Archive Estate

- Asset ID: `LQ-REF-MANSION-001`
- Exact filename: `reference-mansion-candidate-a-beaux-arts.png`
- Prompt: Early-20th-century monumental archive estate, limestone facade, Beaux-Arts symmetry, copper mansard roof, restrained gothic window tracery, broad central entrance, consistent window rhythm, realistic scale, wet stone, light fog, a few warm windows, not castle, not haunted.

### Mansion Candidate B - Stone Research Estate

- Asset ID: `LQ-REF-MANSION-002`
- Exact filename: `reference-mansion-candidate-b-research-estate.png`
- Prompt: Monumental stone archive estate resembling an old research library, symmetrical facade, copper roof with low dormers, restrained pointed window influence, broad steps, wet grounds, fog, practical amber interior lights, no towers, no spires, no abandoned look.

### Mansion Candidate C - Archive Hall in the Rain

- Asset ID: `LQ-REF-MANSION-003`
- Exact filename: `reference-mansion-candidate-c-archive-hall.png`
- Prompt: Realistic early-20th-century archive hall, stone exterior, central pediment, copper roof, evenly spaced tall windows, subtle gothic influence in arches, symmetrical entrance, rain-darkened facade, restrained amber windows, not a castle, not a hotel.

### Mansion Candidate D - Monumental Memory Estate

- Asset ID: `LQ-REF-MANSION-004`
- Exact filename: `reference-mansion-candidate-d-memory-estate.png`
- Prompt: Monumental memory archive estate set behind wet trees, stone facade, copper roof, Beaux-Arts massing, restrained gothic details, consistent window grid, realistic maintained grounds, fog at base, small amber lights, no fantasy silhouette.

## Mansion Approval Checklist

Score each candidate 1-5 before approval:

- Looks like an archive estate, not a castle.
- Symmetrical entrance reads clearly at distance.
- Window pattern can support later illumination masks.
- Copper roof is visible but not theatrical.
- Stone exterior feels real and maintained.
- Scale is monumental but plausible.
- Fog and rain feel atmospheric, not horror.
- Amber light is restrained.
- The design can remain consistent from 135mm distant views.
- No towers, spires, lightning, overgrowth, broken windows, or haunted cues.

Approval rule: choose exactly one mansion candidate, document the winner in `CONSISTENCY-BIBLE.md`, then use that design as the only mansion reference for Assets 10, 23, 27, and 28.
