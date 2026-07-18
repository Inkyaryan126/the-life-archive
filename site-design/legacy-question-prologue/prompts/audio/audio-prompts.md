# Audio Prompts and Timeline

Build separate stems, not one completed soundtrack. Audio should be off by default unless implementation explicitly asks for consent. Global exclusions: no giant trailer braams, no horror stingers, no sentimental commercial piano, no superhero music, no corporate inspiration music, no pop drums, no spoken words, no religious lyrics, no cheerful success sounds, no full emotional resolution before the final scene.

## Timeline Mix Plan, 0:00-1:40

- 0:00-0:12: Cemetery rain and distant wind only; music almost absent.
- 0:12-0:24: Add low cello harmonic and photograph foley.
- 0:24-0:38: Interior rain, empty-house tone, sparse piano fragments.
- 0:38-0:50: First mansion reveal impact, low strings, restrained horn/bass clarinet color.
- 0:50-1:05: QR reveal, montage Foley, analog hiss, wordless choir breath extremely low.
- 1:05-1:18: Open landscape after rain, low pulse 48-54 BPM, road illumination.
- 1:18-1:28: Music drops under the question; typing or recording stops cinematic progression.
- 1:28-1:40: Only after confirmed server success, preservation rise and final restrained resolution.

## Ambience Assets

| Asset ID | Exact filename | Category | Duration | Looping | Emotional purpose | Generation or sourcing prompt | Tempo | Instrumentation | Dynamic range | Reverb | Frequency balance | Fade-in | Fade-out | Tail length | Mobile-speaker considerations | What to avoid |
|---|---|---|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|
| `LQ-AUD-AMB-001` | `ambience-cemetery-rain-loop.wav` | Ambience | 30s | Seamless | Cold public finality. | Real cemetery rain on umbrellas, wet soil, distant soft rumble, no thunder crack, somber restraint. | None | Rain and soft environment only | Wide but gentle | Outdoor natural | Low mids controlled, soft highs | 2s | 3s | 2s | Keep rain audible at low volume without harsh hiss | Storm drama, horror thunder |
| `LQ-AUD-AMB-002` | `ambience-distant-wind-loop.wav` | Ambience | 40s | Seamless | Distance, winter, exposed landscape. | Low distant winter wind through trees, subtle movement, no whistle, no storm. | None | Wind | Moderate | Outdoor diffuse | Low-mid air, no shrill top | 3s | 4s | 3s | Avoid thin high frequencies that vanish or hiss | Horror wind, jump-scare swells |
| `LQ-AUD-AMB-003` | `ambience-rain-on-window-loop.wav` | Ambience | 30s | Seamless | Private interior absence. | Soft rain on glass from inside a dark room, small droplets, muted exterior rain bed. | None | Rain/glass | Narrow-medium | Interior small room | Gentle high detail, warm low mids | 2s | 3s | 2s | Preserve midrange droplet detail | Thunder, watery wash |
| `LQ-AUD-AMB-004` | `ambience-empty-house-loop.wav` | Ambience | 45s | Seamless | A room that still remembers someone. | Empty house room tone, low air, distant settling, almost silent, no horror creaks. | None | Room tone | Very restrained | Small interior | Low air around 100-300 Hz | 4s | 5s | 3s | Keep enough midrange for phone speakers | Haunted-house creaks |
| `LQ-AUD-AMB-005` | `ambience-analog-tape-hiss-loop.wav` | Ambience | 20s | Seamless | Foreshadows recorded voice. | Warm analog tape hiss, very low level, intimate, no mechanical failure, no warble parody. | None | Tape noise | Narrow | Dry | Soft high shelf, no harshness | 1s | 2s | 1s | Keep subtle or omit on mobile if noisy | Nostalgia cliche, loud hiss |
| `LQ-AUD-AMB-006` | `ambience-open-landscape-after-rain-loop.wav` | Ambience | 40s | Seamless | The world opens after grief. | Open wet landscape after rain, distant trees, sparse drips, broad quiet air. | None | Air, drips | Moderate | Outdoor broad | Low wind, soft high drips | 4s | 5s | 3s | Gentle width collapses cleanly to mono | Birdsong, cheerful morning |
| `LQ-AUD-AMB-007` | `ambience-distant-mansion-atmosphere-loop.wav` | Ambience | 45s | Seamless | The archive feels distant and inhabited. | Distant estate atmosphere in fog, low exterior air, faint warm interior resonance, no voices. | None | Air, subtle building tone | Moderate | Large exterior | Low warmth under cold air | 4s | 5s | 4s | Preserve low-mid warmth without mud | Haunted mansion drones |

## Foley Assets

| Asset ID | Exact filename | Category | Duration | Looping | Emotional purpose | Generation or sourcing prompt | Tempo | Instrumentation | Dynamic range | Reverb | Frequency balance | Fade-in | Fade-out | Tail length | Mobile-speaker considerations | What to avoid |
|---|---|---|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|
| `LQ-AUD-FOL-001` | `foley-soil-impact-soft.wav` | Foley | 2s | No | Weight of finality. | Soft wet soil impact, tiny mud compression, no shovel scrape, no dramatic thud. | None | Soil | Moderate transient | Outdoor close | Low-mid thump, soft top | 0s | 0.4s | 0.5s | Keep transient audible but not startling | Burial horror, loud impact |
| `LQ-AUD-FOL-002` | `foley-wet-wool-movement.wav` | Foley | 4s | No | Human body present but restrained. | Damp wool coat shifting quietly, small sleeve movement, no footsteps. | None | Fabric | Low | Close dry | Mid texture | 0.2s | 0.5s | 0.3s | Midrange detail should survive mono | Fashion rustle, loud fabric |
| `LQ-AUD-FOL-003` | `foley-photograph-handling.wav` | Foley | 5s | No | The photograph is fragile and real. | Old photo paper flex, soft edge touch, slight damp paper sound, no crinkle exaggeration. | None | Paper | Low | Close dry | 1-5 kHz detail softened | 0.1s | 0.5s | 0.3s | Keep paper audible at low level | Loud paper crumple |
| `LQ-AUD-FOL-004` | `foley-thumb-brushing-paper.wav` | Foley | 3s | No | Longing through touch. | Thumb brushing matte old photograph paper, one gentle pass, intimate and quiet. | None | Skin/paper | Very low | Close dry | Soft high detail | 0.1s | 0.4s | 0.2s | Raise 2 kHz slightly for phones | Wet smear, melodramatic scrape |
| `LQ-AUD-FOL-005` | `foley-quiet-breath.wav` | Foley | 3s | No | Human vulnerability before question. | Single quiet gender-neutral breath in a cold room, not crying, not gasping. | None | Breath | Low | Small room | Natural mid/high breath | 0.2s | 0.8s | 0.4s | Keep subtle; allow mute | Sobbing, gasp, spoken word |
| `LQ-AUD-FOL-006` | `foley-cassette-click.wav` | Foley | 1s | No | Voice preservation cue. | Soft mechanical cassette button click, vintage but not parody, dry close mic. | None | Mechanism | Medium transient | Dry | Mid click | 0s | 0.2s | 0.2s | Transient clear on mobile | Loud clack, toy sound |
| `LQ-AUD-FOL-007` | `foley-pen-scratching-paper.wav` | Foley | 6s | No | A message being formed. | Fountain pen scratching softly on thick paper, no readable speech, steady and restrained. | None | Pen/paper | Low | Close dry | Soft 2-6 kHz detail | 0.2s | 0.8s | 0.5s | Avoid harsh scratch on phones | Cartoon writing, busy scribble |
| `LQ-AUD-FOL-008` | `foley-archive-drawer-open.wav` | Foley | 4s | No | Preservation becomes tactile. | Heavy wooden archive drawer opening softly, felt-lined movement, premium wood, no creak horror. | None | Wood/felt | Moderate | Close room | Warm low mids | 0.1s | 0.8s | 0.7s | Low mids audible without boom | Haunted creak |
| `LQ-AUD-FOL-009` | `foley-envelope-handling.wav` | Foley | 5s | No | Future message waiting. | Thick paper envelope handled gently and slid into drawer, no tear, no stamp sound. | None | Paper | Low | Close dry | Soft mids/highs | 0.2s | 0.7s | 0.4s | Keep paper present but soft | Mail notification metaphor |
| `LQ-AUD-FOL-010` | `foley-restrained-footsteps-wet-road.wav` | Foley | 8s | No | Threshold movement without action-movie energy. | Restrained footsteps on wet road, slow, distant, one person, no running, no heel drama. | 48-54 BPM feel | Footsteps | Moderate | Outdoor | Low-mid step, wet high detail | 0.5s | 1s | 0.8s | Reduce sub on phones | Marching, chase, heroic stomp |

## Music Stem Assets

| Asset ID | Exact filename | Category | Duration | Looping | Emotional purpose | Generation or sourcing prompt | Tempo | Instrumentation | Dynamic range | Reverb | Frequency balance | Fade-in | Fade-out | Tail length | Mobile-speaker considerations | What to avoid |
|---|---|---|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|
| `LQ-AUD-MUS-001` | `music-low-cello-harmonic-stem.wav` | Music stem | 40s | Seamless or long bed | Grief held quietly. | Sustained low cello harmonic, slow bow, warm but restrained, no melody. | Free, below 54 BPM | Solo cello | Wide but soft | Medium hall | Low mids warm, highs muted | 6s | 8s | 5s | Ensure low-mid translates; avoid sub-only | Melodramatic cello melody |
| `LQ-AUD-MUS-002` | `music-low-strings-stem.wav` | Music stem | 50s | Seamless | The path slowly gathers weight. | Soft low string pad, dark, cinematic, restrained, no trailer swell, no horror dissonance. | 48-54 BPM pulse-compatible | Low strings | Moderate | Large warm hall | Low mids, controlled highs | 8s | 8s | 6s | Collapse to mono cleanly | Trailer rise, horror cluster |
| `LQ-AUD-MUS-003` | `music-bass-clarinet-stem.wav` | Music stem | 22s | No | Distant estate nobility without heroism. | Very restrained bass clarinet tone, noble but quiet, breathy, no melody fanfare. | Free | Bass clarinet | Low-moderate | Medium hall | Warm 200-800 Hz | 3s | 5s | 4s | Keep tone audible on small speakers | Fantasy horn call |
| `LQ-AUD-MUS-004` | `music-restrained-french-horn-stem.wav` | Music stem | 18s | No | Mansion reveal color option. | Distant restrained French horn swell, almost below speech level, no heroic fanfare. | Free | French horn | Moderate | Large hall | Warm low mids | 4s | 6s | 5s | Use if bass clarinet is too dark | Superhero music |
| `LQ-AUD-MUS-005` | `music-wordless-choir-breath-stem.wav` | Music stem | 30s | Seamless | Human breath beyond words. | Barely audible wordless choir breath, no lyrics, no religious feeling, more air than choir. | Free | Human voices as texture | Very restrained | Large soft hall | Airy mids, no bright sibilance | 8s | 8s | 6s | May be omitted on mobile if muddy | Religious choir, angelic cue |
| `LQ-AUD-MUS-006` | `music-sparse-piano-stem.wav` | Music stem | 36s | No | Thought fragments and memory. | Sparse low-register piano notes with silence, restrained, not sentimental, no memorable commercial melody. | 48-54 BPM loosely | Felt piano | Wide | Small room/hall blend | Low-mid notes, soft hammer | 4s | 6s | 4s | Keep notes sparse; avoid tinny highs | Commercial piano |
| `LQ-AUD-MUS-007` | `music-low-pulse-52bpm-stem.wav` | Music stem | 45s | Seamless | Forward motion toward question. | Low organic pulse around 52 BPM, felt more than heard, no drums, no pop rhythm, no trailer percussion. | 52 BPM | Processed low wood/felt pulse | Controlled | Dry to small room | Low-mid pulse, little sub | 4s | 5s | 3s | Keep pulse audible without subwoofer | Pop beat, heartbeat cliche |
| `LQ-AUD-MUS-008` | `music-preservation-rise-stem.wav` | Music stem | 18s | No | Submission has meaning but is not final triumph. | Slow restrained rise made from low strings, breath, and soft harmonic overtones, no percussion, no braam. | 52 BPM feel | Strings, breath texture | Builds from low to moderate | Large soft hall | Warm, no harsh highs | 2s | 5s | 5s | Avoid relying on sub; keep mid warmth | Trailer riser |
| `LQ-AUD-MUS-009` | `music-final-resolution-stem.wav` | Music stem | 16s | No | The path opens with restraint. | Minimal final resolution, low strings and restrained horn or bass clarinet, peaceful but not triumphant. | Free/52 BPM release | Low strings plus horn/clarinet | Moderate, resolves gently | Large hall | Warm mids, no bright sparkle | 2s | 6s | 7s | Should still feel resolved on phone speakers | Full happy ending, choir lyrics |

## Impact Assets

| Asset ID | Exact filename | Category | Duration | Looping | Emotional purpose | Generation or sourcing prompt | Tempo | Instrumentation | Dynamic range | Reverb | Frequency balance | Fade-in | Fade-out | Tail length | Mobile-speaker considerations | What to avoid |
|---|---|---|---:|---|---|---|---|---|---|---|---|---:|---:|---:|---|---|
| `LQ-AUD-IMP-001` | `impact-mansion-reveal.wav` | Impact | 5s | No | Distant possibility appears. | Restrained low cinematic impact for distant mansion reveal, soft sub movement and warm low horn color, no braam. | Free | Low strings/horn texture | Moderate | Large distant hall | Low-mid weight, light sub | 0.1s | 2s | 3s | Add mid harmonic so phones register it | Trailer braam, horror sting |
| `LQ-AUD-IMP-002` | `impact-qr-reveal.wav` | Impact | 3s | No | The photograph becomes a bridge. | Small intimate amber reveal sound, paper and light feeling, soft harmonic shimmer, no sci-fi scan. | Free | Paper, glass harmonic | Low | Small room | Soft mids/highs | 0.1s | 1s | 1.5s | Keep shimmer gentle, not notification-like | App ding, laser scan |
| `LQ-AUD-IMP-003` | `impact-more-than-photograph.wav` | Impact | 4s | No | The copy lands emotionally. | Restrained low warmth under the phrase more than a photograph, subtle cello bloom and room air. | Free | Cello/room tone | Low-moderate | Medium hall | Warm low mids | 0.5s | 2s | 2s | Avoid sub-only | Sentimental swell |
| `LQ-AUD-IMP-004` | `impact-submission-confirmation.wav` | Impact | 4s | No | Server-confirmed preservation. | Quiet confirmation tone, warm human interval, no cheerful success ding, no corporate notification. | Free | Soft harmonic, felt piano resonance | Low | Small hall | Mid warmth | 0.1s | 1.5s | 2s | Should be audible softly on phones | Success chime |
| `LQ-AUD-IMP-005` | `impact-road-illumination.wav` | Impact | 5s | No | The path begins to open. | Soft low light activation sound, wet road resonance, restrained amber warmth, no magic spell. | 52 BPM compatible | Low strings, road resonance | Moderate | Outdoor wide | Low-mid with subtle high air | 0.2s | 2s | 3s | Keep midrange resonance | Laser, spell, game unlock |
| `LQ-AUD-IMP-006` | `impact-path-is-open.wav` | Impact | 6s | No | Final confirmation without triumphal excess. | Minimal final path-open resolution, low strings, restrained horn breath, soft room-sized bloom, no choir lyrics. | Free | Strings, horn/clarinet | Moderate | Large hall | Warm, controlled highs | 0.3s | 3s | 4s | Preserve warm mids | Superhero ending, confetti sound |

## Mixing and Interaction Rules

- The prologue may auto-advance visually, but audio must pause when the browser tab is hidden.
- Typing or recording stops cinematic progression and should lower music stems under interaction.
- The actual question never auto-advances.
- Submission confirmation impacts can only play after confirmed server success.
- Use silence intentionally. Do not fill every second.
- Mobile mix should reduce low sub content, simplify rain layers, and keep copy interaction clear.
