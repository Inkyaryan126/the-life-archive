# Master Asset List

This file defines the complete pre-production asset plan for the Legacy Question cinematic prologue. Empty asset directories are intentional until references are approved and final media is generated.

## Approved Reference Gates

Generate and approve these before producing the full sequence:

1. `reference-mourner-dark-wool-coat.png`
2. `reference-old-photograph-off-white-border.png`
3. `reference-archive-mansion-distant-fog.png`

Do not proceed into bulk generation until these three visual anchors are accepted.

## Still Images

All stills should begin as 16:9 source masters. Recommended master dimensions: `3840x2160` or larger. Production derivatives can be WebP or AVIF after visual approval.

### Scene 1 - Funeral

1. `scene-01-funeral-establishing-wide-master.png`
2. `scene-01-rain-cemetery-soil-master.png`
3. `scene-01-mourner-behind-umbrellas-master.png`

### Scene 2 - Photograph

4. `scene-02-empty-cemetery-aftermath-master.png`
5. `scene-02-hands-holding-photograph-master.png`
6. `scene-02-thumb-brushing-unseen-face-master.png`

### Scene 3 - Absence

7. `scene-03-empty-chair-dark-home-master.png`
8. `scene-03-mourner-alone-with-photograph-master.png`
9. `scene-03-old-audio-recorder-still-life-corrected-master.png`

### Scene 4 - Distant Light

10. `scene-04-first-mansion-reveal-corrected-master.png`
11. `scene-04-mourner-noticing-light-master.png`
12. `scene-04-light-crossing-room-master.png`

### Scene 5 - QR Reveal

13. `scene-05-light-touching-photograph-master.png`
14. `scene-05-hidden-engraving-emerging-master.png`
15. `scene-05-blank-illuminated-qr-plate-master.png`

### Scene 6 - Memory Montage

16. `scene-06-voice-recording-master.png`
17. `scene-06-handwritten-letter-unreadable-master.png`
18. `scene-06-home-video-memory-master.png`
19. `scene-06-archiving-a-story-master.png`
20. `scene-06-future-message-waiting-master.png`

### Scene 7 - Road

21. `scene-07-road-emerging-through-darkness-master.png`
22. `scene-07-figure-standing-at-road-master.png`
23. `scene-07-road-to-mansion-corrected-master.png`

### Scene 8 - Question

24. `scene-08-empty-question-environment-master.png`
25. `scene-08-question-environment-mourner-silhouette-master.png`

### Scene 9 - Claim and Confirmation

26. `scene-09-first-illuminated-road-section-master.png`
27. `scene-09-additional-mansion-window-illuminated-master.png`
28. `scene-09-final-illuminated-road-to-mansion-master.png`

## Mobile Crops

Create mobile crops only from approved source masters. Suggested naming:

- `mobile-scene-01-funeral-establishing-wide-9x16.webp`
- `mobile-scene-05-blank-illuminated-qr-plate-9x16.webp`
- `mobile-scene-09-final-illuminated-road-to-mansion-9x16.webp`

Keep the subject center-safe, with enough dark space for coded copy.

## Effects Assets

Suggested production names:

- `effect-foreground-rain-alpha.webm`
- `effect-rain-on-window-alpha.webm`
- `effect-ground-splashes-alpha.webm`
- `effect-drifting-fog-alpha.webm`
- `effect-dust-in-amber-light-alpha.webm`
- `effect-film-grain-overlay.webm`
- `effect-vignette.css`
- `effect-gold-light-beam-alpha.webm`
- `effect-photograph-water-droplet-alpha.webm`
- `effect-qr-engraving-reveal-mask.svg`
- `effect-road-illumination-mask.svg`
- `effect-mansion-window-illumination.png`
- `effect-cross-dissolve.css`
- `effect-dip-to-black.css`
- `effect-restrained-light-bloom.css`

## Audio Assets

Suggested stem names:

- `audio-cemetery-rain-loop.wav`
- `audio-distant-wind-loop.wav`
- `audio-rain-on-windows-loop.wav`
- `audio-empty-house-room-tone-loop.wav`
- `audio-photograph-handling.wav`
- `audio-wet-clothing-movement.wav`
- `audio-quiet-breath.wav`
- `audio-cassette-click.wav`
- `audio-pen-writing.wav`
- `audio-archive-drawer.wav`
- `audio-envelope-handling.wav`
- `music-sparse-piano-stem.wav`
- `music-low-cello-stem.wav`
- `music-low-strings-stem.wav`
- `music-bass-clarinet-french-horn-stem.wav`
- `music-wordless-choir-breath-stem.wav`
- `music-low-pulse-50bpm-stem.wav`
- `impact-mansion-reveal.wav`
- `impact-qr-reveal.wav`
- `impact-submission-confirmation.wav`
- `impact-road-illumination.wav`
- `impact-path-is-open-resolution.wav`

## Production Readiness Checks

- Every still has a desktop master and mobile-safe crop plan.
- Every still is free of generated text, QR codes, UI, logos, and watermarks.
- Every effect has a reduced-motion fallback.
- Audio is separated into stems.
- Source masters are not placed in public runtime folders.
- Final confirmation assets are not triggered until persistence succeeds.
- `GENERATION-BATCHES.md` controls production order and prevents inconsistent bulk generation.
- `QUALITY-CONTROL.md` defines rejection thresholds before assets can advance.
