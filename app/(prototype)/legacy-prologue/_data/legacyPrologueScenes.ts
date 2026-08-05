import type { LegacyPrologueImage, LegacyPrologueScene } from "./types";

function image(
  stem: string,
  alt: string,
  duration: number,
  options: Pick<LegacyPrologueImage, "caption" | "introCaption" | "focalPoint" | "motion"> = {}
): LegacyPrologueImage {
  return {
    desktopSrc: `/images/legacy-prologue/desktop/${stem}.webp`,
    mobileSrc: `/images/legacy-prologue/mobile/${stem}-mobile.webp`,
    fallbackSrc: `/images/legacy-prologue/fallback/${stem}-fallback.webp`,
    alt,
    duration,
    ...options
  };
}

function chapter(
  id: LegacyPrologueScene["id"],
  label: string,
  overlay: LegacyPrologueScene["overlay"],
  images: LegacyPrologueImage[]
): LegacyPrologueScene {
  return {
    id,
    label,
    overlay,
    images,
    duration: images.reduce((total, item) => total + item.duration, 0)
  };
}

export const legacyPrologueScenes: LegacyPrologueScene[] = [
  chapter("funeral", "Funeral", "none", [
    image(
      "scene-01-a-funeral-empty-cemetery-void",
      "A far, cold cemetery valley creates the opening sense of absence.",
      3200,
      {
        introCaption: "No one plans to become a memory.",
        focalPoint: "50% 55%",
        motion: "push"
      }
    ),
    image(
      "scene-01-b-ground-flower-wide",
      "Rain-dark ground and fallen flowers hold on the physical weight of the funeral.",
      5000,
      {
        caption: ["No one wakes up knowing this is the day their voice becomes silence."],
        focalPoint: "50% 58%",
        motion: "still"
      }
    ),
    image(
      "scene-01-c-funeral-distant-mourners-wide",
      "Mourners stand at a distance in the cold funeral landscape.",
      3600,
      {
        caption: ["But someday, the world will keep moving…"],
        focalPoint: "50% 54%",
        motion: "drift-left"
      }
    ),
    image(
      "scene-01-d-ground-flower-close",
      "A close rain-struck flower detail deepens the quiet grief.",
      2800,
      {
        caption: ["and yours will not."],
        focalPoint: "52% 56%",
        motion: "still"
      }
    ),
    image(
      "scene-01-e-funeral-distant-mourners-closer",
      "The funeral gathers closer while the world remains gray and distant.",
      3700,
      {
        caption: ["The people you love will be left with questions you can no longer answer."],
        focalPoint: "50% 55%",
        motion: "drift-right"
      }
    ),
    image(
      "scene-01-f-ground-rain-impact",
      "Rain hits the ground, ending the opening funeral void.",
      3400,
      {
        caption: ["The stories only you knew."],
        focalPoint: "52% 57%",
        motion: "still"
      }
    ),
    image(
      "scene-01-g-funeral-mourner-under-umbrellas",
      "The mourner stands anonymous under umbrellas at the funeral.",
      3200,
      {
        caption: [
          "The lessons only you could teach.",
          "The words they will wish they could hear one more time."
        ],
        focalPoint: "50% 54%",
        motion: "push"
      }
    ),
    image(
      "scene-01-h-funeral-keychain-handoff",
      "A memorial keychain is quietly handed to the mourner.",
      3800,
      {
        caption: ["Unless you leave them behind."],
        focalPoint: "52% 54%",
        motion: "drift-right"
      }
    ),
    image(
      "scene-01-i-funeral-mourner-leaves-with-keychain",
      "The mourner leaves the funeral alone with the keychain.",
      3400,
      {
        caption: ["As you."],
        focalPoint: "50% 52%",
        motion: "push"
      }
    )
  ]),
  chapter("home", "Home", "none", [
    image(
      "scene-02-a-home-photograph-and-keychain",
      "At home, the mourner sits with a photograph, his keys, and the memorial keychain.",
      3600,
      {
        caption: ["Your voice."],
        focalPoint: "50% 52%",
        motion: "push"
      }
    ),
    image(
      "scene-02-aa-walk-mansion-through-window",
      "Through the rain-covered window, a distant mansion barely enters the world.",
      3600,
      {
        caption: ["Your memories."],
        focalPoint: "50% 52%",
        motion: "still"
      }
    ),
    image(
      "scene-02-aaaa-home-room-warming",
      "The room warms slightly as the first sense of hope enters.",
      3500,
      {
        caption: ["Your guidance."],
        focalPoint: "52% 52%",
        motion: "drift-left"
      }
    ),
    image(
      "scene-02-b-home-keychain-scan",
      "The mourner scans the memorial keychain with his phone.",
      3400,
      {
        caption: ["Because death can take your presence."],
        focalPoint: "52% 55%",
        motion: "push"
      }
    ),
    image(
      "scene-02-bb-their-story-isnt-over",
      "The phone shows the message that their story is not over.",
      5200,
      {
        caption: ["It does not have to take your words."],
        focalPoint: "50% 50%",
        motion: "push"
      }
    ),
    image(
      "scene-02-bbbb-window-brighter",
      "The window view grows brighter as the void begins to fill.",
      3400,
      {
        focalPoint: "52% 52%",
        motion: "drift-right"
      }
    )
  ]),
  chapter("journey", "Journey", "fog", [
    image(
      "scene-03-b-walk-to-mansion-road",
      "The mourner walks the wet road toward the distant Life Archive mansion.",
      4400,
      {
        caption: ["Because goodbye is hard"],
        focalPoint: "50% 53%",
        motion: "push"
      }
    ),
    image(
      "scene-03-c-walk-mansion-after-storm",
      "The mansion waits brighter after the storm on wet reflective grounds.",
      4600,
      {
        caption: ["But silence leaves the deepest wounds."],
        focalPoint: "50% 50%",
        motion: "drift-left"
      }
    )
  ]),
  chapter("mansion", "Mansion", "amber", [
    image(
      "scene-04-a-at-mansion-hand-on-closed-door",
      "The mourner grips the closed brass handles of the Life Archive doors.",
      8200,
      {
        caption: [
          "The Life Archive begins with one question…",
          "What would you say?"
        ],
        focalPoint: "58% 52%",
        motion: "still"
      }
    )
  ])
];
