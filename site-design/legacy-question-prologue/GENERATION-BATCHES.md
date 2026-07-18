# Generation Batches

Do not run uncontrolled bulk generation. Stop at each approval gate and compare against `QUALITY-CONTROL.md`, `CONSISTENCY-BIBLE.md`, and the relevant prompt files.

## Batch 1 - Canonical References

- Prerequisites: None.
- Prompts used: `prompts/images/reference-generation.md`.
- Continuity checks: Mourner wardrobe, photograph dimensions, mansion architecture.
- Approval gate: Approve one mourner, one photograph system, one mansion candidate.
- Files expected: `reference-mourner-*`, `reference-photograph-*`, `reference-mansion-candidate-*`.
- Reasons not to continue: Mourner face visible, photograph has code/text, mansion reads as castle or haunted.

## Batch 2 - Funeral

- Prerequisites: Approved mourner reference.
- Prompts used: Assets 1-3 in `scene-01-funeral.md`.
- Continuity checks: Coat shape, cold palette, no amber light.
- Approval gate: Scene 1 establishes tone without horror.
- Files expected: Assets 1-3.
- Reasons not to continue: Stock grief, visible faces, readable headstones, horror cemetery.

## Batch 3 - Photograph

- Prerequisites: Approved photograph reference, approved mourner hands/coat detail.
- Prompts used: Assets 4-6 in `scene-02-photograph.md`.
- Continuity checks: Photograph border, face obscured, hand anatomy.
- Approval gate: Photo is emotionally central and technically usable.
- Files expected: Assets 4-6.
- Reasons not to continue: Identifiable face, text, QR pattern, malformed hands.

## Batch 4 - Absence

- Prerequisites: Approved Scene 2 photograph and mourner.
- Prompts used: Assets 7-9 in `scene-03-absence.md`.
- Continuity checks: No amber yet, room is not haunted, audio recorder unbranded.
- Approval gate: Interior absence feels human and quiet.
- Files expected: Assets 7-9.
- Reasons not to continue: Haunted-house cues, lifestyle warmth, readable labels.

## Batch 5 - Mansion and First Light

- Prerequisites: Approved mansion, mourner, photograph.
- Prompts used: Assets 10-12 in `scene-04-distant-light.md`.
- Continuity checks: Mansion distance, first amber restraint, same coat/photo.
- Approval gate: Amber enters without fantasy.
- Files expected: Assets 10-12.
- Reasons not to continue: Mansion too close, magical light, inconsistent architecture.

## Batch 6 - QR Reveal Plates

- Prerequisites: Approved photograph reference and Scene 5 blank area.
- Prompts used: Assets 13-15 in `scene-05-qr-reveal.md`.
- Continuity checks: Blank compositing area, no generated code, paper texture.
- Approval gate: Developer can overlay real QR or coded layer cleanly.
- Files expected: Assets 13-15.
- Reasons not to continue: Any QR-like pattern, text, warped plate, visible face.

## Batch 7 - Memory Montage

- Prerequisites: Approved amber light behavior and photograph.
- Prompts used: Assets 16-20 in `scene-06-memory-montage.md`.
- Continuity checks: No readable writing, no fake UI, consistent amber room.
- Approval gate: Montage suggests voice, story, and preservation without a collage.
- Files expected: Assets 16-20.
- Reasons not to continue: Product ad, readable labels, malformed hands, sentimental cliche.

## Batch 8 - Road

- Prerequisites: Approved mansion and mourner.
- Prompts used: Assets 21-23 in `scene-07-road.md`.
- Continuity checks: Road direction, distant amber, mansion consistency.
- Approval gate: Path feels open but not game-like.
- Files expected: Assets 21-23.
- Reasons not to continue: Neon path, runes, fantasy forest, mansion too close.

## Batch 9 - Question

- Prerequisites: Approved road threshold and mourner silhouette.
- Prompts used: Assets 24-25 in `scene-08-question.md`.
- Continuity checks: Clear copy zone, no baked question, figure restraint.
- Approval gate: Question can be rendered as accessible HTML over the still.
- Files expected: Assets 24-25.
- Reasons not to continue: UI-looking backdrop, text in image, heroic figure.

## Batch 10 - Claim and Confirmation

- Prerequisites: Approved road, mansion, road illumination plan.
- Prompts used: Assets 26-28 in `scene-09-claim-confirmation.md`.
- Continuity checks: Server-success-only visuals, restrained confirmation, mansion reference.
- Approval gate: Final state feels earned but not celebratory.
- Files expected: Assets 26-28.
- Reasons not to continue: Confetti, app-success look, fantasy glow, too much resolution.

## Batch 11 - Effects

- Prerequisites: Approved stills for alignment.
- Prompts used: `prompts/effects/effects-prompts.md`.
- Continuity checks: Effect opacity, loop quality, mobile fallback.
- Approval gate: Effects support images without drawing attention.
- Files expected: `LQ-FX-001` through `LQ-FX-020`.
- Reasons not to continue: Browser performance failure, loop seam, fantasy appearance.

## Batch 12 - Audio

- Prerequisites: Approved timeline and scene pacing.
- Prompts used: `prompts/audio/audio-prompts.md`.
- Continuity checks: Emotional restraint, mobile clarity, no early resolution.
- Approval gate: Separate stems can be mixed under interaction.
- Files expected: All ambience, Foley, music, and impact assets.
- Reasons not to continue: Trailer sound, horror sting, commercial piano, spoken words, lyrics.
