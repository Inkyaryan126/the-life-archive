import type { Metadata } from "next";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteDesign";
import { publicSupportEmail } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Support After A Loss - The Life Archive",
  description:
    "A calm, practical guide for the first hours and days after someone dies, including who to contact, how to support children, preserving memories, and crisis resources."
};

const firstHours = [
  "If the death was expected, contact the hospice nurse, physician, or service already involved in their care.",
  "If the death was unexpected, in public, or there is any immediate danger, call local emergency services.",
  "Ask who can make the official pronouncement of death and what happens next.",
  "Choose one person to sit with you, make calls, or write details down.",
  "Do not rush belongings, photos, voicemails, or messages unless there is a practical reason they may be lost."
];

const contactList = [
  "Immediate family, close friends, or the person who should not hear the news secondhand.",
  "A funeral home, hospice team, hospital social worker, faith leader, or cultural/community support person.",
  "The person's employer, school, care facility, or daily support network if they were expecting them.",
  "Anyone responsible for children, pets, home access, medication, transportation, or urgent appointments."
];

const questionGroups = [
  {
    title: "Hospital, hospice, or care team",
    items: [
      "Who confirms the death and how do we receive documentation?",
      "Where will they be taken, and how much time do we have to decide?",
      "Is there a social worker, chaplain, bereavement coordinator, or family liaison available?"
    ]
  },
  {
    title: "Funeral home or service provider",
    items: [
      "What decisions are required today, and what can wait?",
      "How many certified death certificates might we need?",
      "What costs are required now, and what options are optional?"
    ]
  },
  {
    title: "Documents and details",
    items: [
      "Legal name, date of birth, Social Security number, and military service records if applicable.",
      "Funeral, burial, cremation, organ donation, religious, cultural, or written final instructions.",
      "Insurance, banking, benefits, property, bills, and account information that may need later attention."
    ]
  }
];

const childSupport = [
  "Use clear, direct words that match the child's age. Avoid confusing phrases if they may make death sound temporary.",
  "Let children ask the same question more than once. Repetition can be part of understanding.",
  "Tell them who will care for them today, tonight, and tomorrow.",
  "Invite feelings without requiring them. Some children cry, some play, some go quiet, and some move between all three.",
  "Ask a pediatrician, school counselor, therapist, or grief professional for help if a child seems unsafe, stuck, or overwhelmed."
];

const preserveItems = [
  "Voicemails, voice memos, home videos, and phone recordings.",
  "Photographs, handwritten notes, recipes, letters, journals, playlists, and favorite stories.",
  "Lessons, sayings, traditions, practical advice, and the details only they knew.",
  "Names of people who may have stories, photos, or recordings you do not have."
];

const supportSigns = [
  "You feel unable to function, sleep, eat, or care for basic safety for an extended period.",
  "You feel at risk of harming yourself or someone else.",
  "A child, older adult, or vulnerable person is unsafe or without care.",
  "Grief is becoming isolation, panic, substance misuse, or a level of despair you should not carry alone."
];

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-archive-gold/16 py-12">
      <h2 className="font-serif text-3xl leading-tight text-archive-ivory sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 text-base leading-8 text-archive-ivory/72">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="border-l border-archive-gold/34 pl-4">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AfterALossPage() {
  return (
    <main className="min-h-screen bg-[#080706] text-archive-ivory">
      <nav className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 border-b border-archive-gold/14 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-0">
        <Link
          className="inline-flex rounded-xl transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
          href="/"
        >
          <SiteLogo width={230} height={58} />
        </Link>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-archive-ivory/72">
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/">
            Grand Hall
          </Link>
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/legacy-question">
            Legacy Question
          </Link>
          <Link className="hover:text-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30" href="/create">
            Create Archive
          </Link>
        </div>
      </nav>

      <header className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-0 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            Support After A Loss
          </p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-archive-ivory sm:text-7xl">
            You do not have to solve everything today.
          </h1>
        </div>
        <div className="text-lg leading-8 text-archive-ivory/72">
          <p>
            Grief can make ordinary decisions feel impossible. Start with the
            next necessary thing, not everything at once.
          </p>
          <p className="mt-5">
            This guide is practical support, not medical, legal, financial, or
            emergency advice. When a decision carries legal, financial, medical,
            or safety consequences, contact the appropriate professional or
            emergency service.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[980px] px-5 pb-20 sm:px-8 lg:px-0">
        <Section title="What to do during the first few hours">
          <BulletList items={firstHours} />
        </Section>

        <Section title="Who to contact">
          <p className="mb-5">
            If there is one person who can help you make calls, ask them to
            write down names, times, phone numbers, and what each person says.
          </p>
          <BulletList items={contactList} />
        </Section>

        <Section title="Questions to ask hospitals, hospice, funeral homes, or other services">
          <div className="grid gap-6">
            {questionGroups.map((group) => (
              <article key={group.title} className="border border-archive-gold/16 bg-white/[0.03] p-5">
                <h3 className="font-serif text-2xl text-archive-champagne">
                  {group.title}
                </h3>
                <div className="mt-4">
                  <BulletList items={group.items} />
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title="How to tell family and close friends">
          <p>
            Keep the first message simple and direct. You can say what happened,
            where you are, what you need, and whether you are ready for calls.
            It is acceptable to ask one trusted person to notify others for you.
          </p>
          <p className="mt-5 font-serif text-2xl text-archive-champagne">
            You are allowed to protect your energy while telling the truth.
          </p>
        </Section>

        <Section title="Practical documents and details that may need attention">
          <p className="mb-5">
            Many official steps require certified copies of the death
            certificate. Make a simple folder for documents, receipts, contacts,
            passwords you are legally permitted to access, and notes from each
            call.
          </p>
          <p>
            In the United States, USAGov provides current guidance on agencies
            to notify, death certificates, survivor benefits, and related
            federal resources.
          </p>
          <p className="mt-5">
            <a
              className="font-semibold text-archive-champagne underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="https://www.usa.gov/death-loved-one"
            >
              View USAGov guidance for dealing with the death of a loved one
            </a>
          </p>
        </Section>

        <Section title="How to support children after a death">
          <BulletList items={childSupport} />
        </Section>

        <Section title="How to care for yourself while grieving">
          <p>
            Eat something small, drink water, take needed medication, and let
            someone else handle a task if you can. Grief is not a failure of
            strength. It is a human response to losing someone who mattered.
          </p>
          <p className="mt-5">
            The CDC suggests support from trusted people, routines, rest,
            movement, and honoring the person in ways that fit your faith,
            culture, or family.
          </p>
          <p className="mt-5">
            <a
              className="font-semibold text-archive-champagne underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="https://www.cdc.gov/howrightnow/emotion/grief/index.html"
            >
              Read CDC grief guidance
            </a>
          </p>
        </Section>

        <Section title="What to do when the initial shock begins to fade">
          <p>
            After the first wave of calls and arrangements, give yourself
            permission to slow down. Revisit documents, benefits, belongings,
            digital accounts, and memory preservation in smaller sessions. Some
            choices can wait until you are less overwhelmed.
          </p>
        </Section>

        <Section title="How to preserve someone’s voice, photographs, stories, lessons, and memories">
          <p className="mb-5">
            Preservation does not have to begin with a perfect tribute. It can
            begin with one voicemail, one photograph, one recipe, one lesson, or
            one story someone tells at the kitchen table.
          </p>
          <BulletList items={preserveItems} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne focus:outline-none focus:ring-4 focus:ring-archive-gold/35"
            >
              Create an Archive
            </Link>
            <Link
              href="/legacy-question"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-archive-gold/35 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
            >
              Answer the Legacy Question
            </Link>
          </div>
        </Section>

        <Section title="When professional grief support may help">
          <p className="mb-5">
            Support may help when grief becomes more than you can safely carry.
            SAMHSA notes that support can include trusted family or community,
            local or virtual grief groups, counseling, peer support, creative
            expression, physical movement, and outreach to a mental health
            professional.
          </p>
          <BulletList items={supportSigns} />
          <p className="mt-5">
            <a
              className="font-semibold text-archive-champagne underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="https://www.samhsa.gov/communities/coping-bereavement-grief"
            >
              Read SAMHSA grief and bereavement resources
            </a>
          </p>
        </Section>

        <Section title="Crisis and emergency resources">
          <p>
            If someone is in immediate danger, call local emergency services.
            If you are in the United States and are in suicidal crisis or
            emotional distress, contact the 988 Suicide &amp; Crisis Lifeline.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              className="border border-archive-gold/22 bg-white/[0.04] p-5 font-semibold text-archive-champagne hover:border-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="tel:988"
            >
              Call 988
            </a>
            <a
              className="border border-archive-gold/22 bg-white/[0.04] p-5 font-semibold text-archive-champagne hover:border-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="sms:988"
            >
              Text 988
            </a>
            <a
              className="border border-archive-gold/22 bg-white/[0.04] p-5 font-semibold text-archive-champagne hover:border-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="https://988lifeline.org/chat/"
            >
              988 Lifeline Chat
            </a>
            <a
              className="border border-archive-gold/22 bg-white/[0.04] p-5 font-semibold text-archive-champagne hover:border-archive-gold focus:outline-none focus:ring-4 focus:ring-archive-gold/30"
              href="https://988lifeline.org"
            >
              988 Lifeline Website
            </a>
          </div>
        </Section>

        <footer className="border-t border-archive-gold/16 py-10 text-sm leading-7 text-archive-ivory/58">
          <p>
            Questions about The Life Archive can be sent to{" "}
            <a
              className="font-semibold text-archive-champagne underline-offset-4 hover:underline"
              href={`mailto:${publicSupportEmail}`}
            >
              {publicSupportEmail}
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
