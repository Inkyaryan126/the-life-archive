# Legacy Question Prologue Cinematic QA Review

Date: 2026-07-17  
Route reviewed: `http://localhost:3001/legacy-prologue`  
Scope: isolated prototype only

## Runtime Summary

- Total runtime before timing pass: 127.6 seconds
- Total runtime after timing pass: 104.9 seconds
- Configured scene count: 28
- Missing configured image files: 0
- Broken asset paths corrected: 0
- Production route connection: none
- Final audio, QR generation, and advanced effects: not added

## Scene-by-Scene Timing and QA Table

| # | Scene ID | Image filename | Old duration | New duration | Camera movement | Transition | Text timing | Desktop safe area | Mobile safe area | Approval status | Continuity concern | Remaining artwork limitation |
|---:|---|---|---:|---:|---|---|---|---|---|---|---|---|
| 1 | `scene-01-funeral-establishing` | `scene-01-funeral-establishing-wide-master.png` | 5.2s | 4.6s | Slow push with slight right drift | Crossfade | 0.9s delay | Pass: copy sits low right over negative space | Pass: lower placement stays readable | Approved | Mourner remains distant and unreadable | None |
| 2 | `scene-01-rain-soil` | `scene-01-rain-cemetery-soil-master.png` | 4.2s | 3.0s | Restrained macro drift | Fade to black | 0.45s delay | Pass | Pass | Approved | None | None |
| 3 | `scene-01-mourner-umbrellas` | `scene-01-mourner-behind-umbrellas-master.png` | 3.2s | 2.8s | Minimal lateral drift | Crossfade | No copy | Pass | Pass | Approved | Mourner remains hidden enough | None |
| 4 | `scene-02-cemetery-aftermath` | `scene-02-empty-cemetery-aftermath-master.png` | 5.0s | 4.2s | Slow environmental push | Crossfade | 0.6s delay | Pass | Pass | Approved | Graveyard atmosphere still restrained | None |
| 5 | `scene-02-hands-photograph` | `scene-02-hands-holding-photograph-master.png` | 5.2s | 3.9s | Intimate push with small left drift | Crossfade | 0.7s delay | Pass: text avoids hands | Pass | Approved | Photograph border and damage remain consistent | None |
| 6 | `scene-02-thumb-photograph` | `scene-02-thumb-brushing-unseen-face-master.png` | 4.2s | 3.0s | Tight tactile push | Fade to black | No copy | Pass | Pass | Approved | Photograph face stays obscured | None |
| 7 | `scene-03-empty-chair` | `scene-03-empty-chair-dark-home-master.png` | 5.0s | 4.2s | Slow room drift | Crossfade | 0.65s delay | Pass | Pass | Approved | Indoor darkness fits progression | None |
| 8 | `scene-03-mourner-alone` | `scene-03-mourner-alone-with-photograph-master.png` | 5.2s | 4.5s | Slow emotional compression | Crossfade | 0.55s delay | Pass | Pass | Approved | Mourner reads close to canonical silhouette | None |
| 9 | `scene-03-recorder` | `scene-03-old-audio-recorder-still-life-corrected-master.png` | 4.3s | 3.2s | Tight push with almost no pan | Fade to black | 0.45s delay | Pass | Pass | Approved | No character issue | Corrected replacement active; final effects pass should confirm no readable markings |
| 10 | `scene-04-first-mansion` | `scene-04-first-mansion-reveal-corrected-master.png` | 6.1s | 5.4s | Slow distant reveal | Crossfade | 0.75s delay | Pass | Pass | Approved | Approved darker distant wet-road first mansion reveal | Superseded reveal remains inactive reference only |
| 11 | `scene-04-mourner-noticing-light` | `scene-04-mourner-noticing-light-alt-02.png` | 5.2s | 4.4s | Controlled window drift | Crossfade | 0.6s delay | Pass | Pass | Approved | Intentional use of strongest reviewed alternate | None |
| 12 | `scene-04-light-crossing-room` | `scene-04-light-crossing-room-master.png` | 4.1s | 3.0s | Soft amber drift | Crossfade | No copy | Pass | Pass | Approved | Amber begins after mansion reveal | None |
| 13 | `scene-05-light-touching-photo` | `scene-05-light-touching-photograph-master.png` | 5.0s | 3.6s | Slow tactile push | Crossfade | 0.55s delay | Pass | Pass | Approved | Photograph remains consistent | None |
| 14 | `scene-05-engraving` | `scene-05-hidden-engraving-emerging-master.png` | 5.0s | 3.4s | Subtle macro push | Crossfade | 0.5s delay | Pass | Pass | Approved | No generated QR used | Real QR must be composited later |
| 15 | `scene-05-blank-qr-plate` | `scene-05-blank-illuminated-qr-plate-master.png` | 3.2s | 2.2s | Nearly locked plate hold | Crossfade | No copy | Pass | Pass | Approved | No fake interface or code | Real QR animation remains future work |
| 16 | `scene-06-voice-recording` | `scene-06-voice-recording-master.png` | 4.1s | 2.6s | Brief memory drift | Crossfade | 0.55s delay | Pass | Pass | Approved | Memory montage begins cleanly | None |
| 17 | `scene-06-handwritten-letter` | `scene-06-handwritten-letter-unreadable-master.png` | 4.2s | 2.8s | Brief paper drift | Crossfade | 0.5s delay | Pass | Pass | Approved | No character issue | Unreadable replacement active; final effects pass should confirm marks remain unreadable |
| 18 | `scene-06-home-video` | `scene-06-home-video-memory-master.png` | 3.2s | 2.2s | Short lateral memory drift | Crossfade | No copy | Pass | Pass | Approved | Fits memory montage rhythm | None |
| 19 | `scene-06-archiving-story` | `scene-06-archiving-a-story-master.png` | 4.1s | 2.9s | Gentle forward drift | Crossfade | No copy | Pass | Pass | Approved | Archive idea reads clearly | None |
| 20 | `scene-06-future-message` | `scene-06-future-message-waiting-master.png` | 3.2s | 2.2s | Small envelope hold | Fade to black | No copy | Pass | Pass | Approved | Works as montage exit | None |
| 21 | `scene-07-road-emerging` | `scene-07-road-emerging-through-darkness-master.png` | 5.0s | 4.2s | Slow forward road drift | Crossfade | 0.65s delay | Pass | Pass | Approved | Road geography establishes the threshold | None |
| 22 | `scene-07-figure-road` | `scene-07-figure-standing-at-road-master.png` | 5.2s | 4.5s | Nearly centered push | Crossfade | 0.65s delay | Pass | Pass | Approved | Mourner silhouette remains usable | None |
| 23 | `scene-07-mansion-through-trees` | `scene-07-road-to-mansion-corrected-master.png` | 2.4s | 2.6s | Brief distant compression | Fade to black | No copy | Pass | Pass | Approved | Approved road-to-mansion approach bridge | Superseded bridge remains inactive reference only |
| 24 | `scene-08-question-empty` | `scene-08-empty-question-environment-master.png` | 5.2s | 5.4s | Almost still threshold hold | Crossfade | 0.6s delay | Pass | Pass | Approved | Threshold feels intentionally calmer | None |
| 25 | `scene-08-question-mourner` | `scene-08-question-environment-mourner-silhouette-master.png` | 6.5s | 6.5s | Nearly still | Fade to black | 0.65s delay | Pass: long-copy style added | Pass: long-copy style added | Approved | Actual question must not auto-advance in production integration | Prototype still auto-advances by design |
| 26 | `scene-09-first-lit-road` | `scene-09-first-illuminated-road-section-master.png` | 5.0s | 4.2s | Restrained road illumination push | Crossfade | 0.55s delay | Pass | Pass | Approved | Amber/light progression now arrives late enough | None |
| 27 | `scene-09-mansion-window` | `scene-09-additional-mansion-window-illuminated-master.png` | 5.2s | 4.6s | Slow anchor push | Crossfade | 0.65s delay | Pass | Pass | Approved | Strongest approved mansion anchor | None |
| 28 | `scene-09-final-road` | `scene-09-final-illuminated-road-to-mansion-master.png` | 6.2s | 4.8s | Slow final threshold drift | Fade to black | 0.65s delay | Pass | Pass | Approved | Final approach is clear and restrained | None |

## Broken or Missing Assets

- No configured image files are missing.
- No broken asset paths were corrected.
- All 28 configured imports point to files inside `site-design/legacy-question-prologue/assets/source-masters/`.

## Accidentally Used Alternates

- No rejected alternate is configured.
- `scene-04-mourner-noticing-light-alt-02.png` is intentionally configured because the image review identified it as the strongest option in that group.

## Mourner Continuity

- The mourner remains most consistent in the rear or silhouette shots.
- The configured sequence avoids the rejected face-forward alternate.
- Scene 8 and Scene 22 remain acceptable, though final production should continue to treat the mourner as anonymous and rear-biased.

## Photograph Continuity

- The configured photograph shots preserve the off-white border, worn paper, and obscured face.
- The sequence avoids the clearer alternate photograph angle.
- The blank QR plate remains empty enough for a real QR compositing pass later.

## Mansion Continuity

- The strongest mansion anchor remains `scene-09-additional-mansion-window-illuminated-master.png`.
- Scene 4’s first mansion reveal remains useful but less canonical and slightly more haunted because of the fog and isolation.
- Scene 7’s mansion-through-trees image should remain brief unless a closer architectural match is created later.

## Amber-Light Progression

- The early cemetery and absence sections remain cold and low.
- Amber begins at Scene 12, after the first mansion reveal and the mourner noticing light.
- Confirmation scenes now reserve the brightest road and mansion illumination for the end.

## Mobile Crop Risks

- The current prototype uses center-cover crops rather than dedicated mobile crops.
- Highest mobile crop risk: Scene 5 hands/photograph, Scene 14 engraving, Scene 22 figure-road, and Scene 25 question-mourner.
- The text layout was adjusted so the long threshold question uses smaller type on mobile.

## Performance Observations

- The player preloads the first three images and then preloads the next two scenes.
- The camera motion is transform-based and GPU accelerated.
- The animation loop was adjusted so progress state no longer recreates the frame loop every frame.
- All images are still full-resolution masters; final production should add optimized web formats and explicit mobile crops.

## Accessibility Verification

- Reduced-motion mode keeps a midpoint transform and disables rain/fog animation.
- Hidden tabs pause visual progression and resume timing without counting hidden time.
- The copy region uses polite live updates.
- The long question copy now uses a separate scale so it remains readable in narrow viewports.

## Controls Verification

- Skip jumps to the final threshold state without connecting to production routes.
- Continue advances the current scene.
- Replay appears after completion and restarts the prototype.
- Progress remains hidden until toggled.
- Failed-image fallback exists and displays a dark branded fallback instead of a broken image.

## Recommended Scenes for Future Rain Overlays

- Scene 1: `scene-01-funeral-establishing`
- Scene 2: `scene-01-rain-soil`
- Scene 3: `scene-01-mourner-umbrellas`
- Scene 7: `scene-03-empty-chair`
- Scene 8: `scene-03-mourner-alone`

## Recommended Scenes for Future Audio Cues

- Scene 1: cemetery rain and distant wind
- Scene 2: soil impact and medium rain
- Scene 9: cassette click and tape hiss
- Scene 10: restrained mansion reveal impact
- Scene 14: QR reveal impact
- Scene 21: open landscape after rain
- Scene 27: preservation rise
- Scene 28: final resolution

## Recommended Scenes for Future Light Masks

- Scene 12: amber light crossing room
- Scene 13: light touching photograph
- Scene 14: engraving reveal mask
- Scene 15: real QR reveal plate
- Scene 26: first illuminated road section
- Scene 27: mansion window illumination
- Scene 28: final road illumination

## Recommended Final Transition into `/legacy-question`

Keep the final fade-to-black from Scene 28, then reveal the real Legacy Question surface after a short black hold of roughly 0.6 to 0.9 seconds. The production integration should stop cinematic auto-advance at the actual question, preserve the user’s typing or recording state, and only show the preserved state after confirmed server success.
