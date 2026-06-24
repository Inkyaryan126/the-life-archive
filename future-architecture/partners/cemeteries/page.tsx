import { PartnerPageTemplate } from "@/components/PartnerPageTemplate";

export const dynamic = "force-dynamic";

export default function CemeteriesPartnerPage() {
  return (
    <PartnerPageTemplate
      partnerType="Cemeteries"
      tagline="Connecting sacred grounds with a lifetime of stories."
      intro="A cemetery is a beautiful, physical testament to lives lived. By partnering with The Life Archive, you can seamlessly connect your physical headstones, columbaria, and memorial gardens to rich, interactive digital capsules of memories, voice, and history."
      familyBenefits={[
        {
          title: "A Deeper Connection at the Gravesite",
          description: "Allow visiting relatives to scan a subtle, secure QR element on a monument or bench to listen to their loved one's actual voice right where they rest."
        },
        {
          title: "Preserve the Context of History",
          description: "Help future descendants understand who lay beneath the stone, moving beyond just names and dates to a full archive of achievements, stories, and images."
        },
        {
          title: "Private, Protected Gathering",
          description: "Maintain control over who views private details, keeping the space respectful and dedicated only to family and close friends."
        }
      ]}
      partnerBenefits={[
        {
          title: "Modernize Your Memorial Space",
          description: "Turn your physical park into an interactive historical landscape, offering families a deeply immersive visiting experience."
        },
        {
          title: "Generate Long-Term Value",
          description: "Differentiate your cemetery offerings by pairing physical interment options with permanent digital preservation rights."
        },
        {
          title: "Uncompromising Respect & Quality",
          description: "We use only premium materials and a dark/gold editorial layout that fits beautifully within the serene atmosphere of your gardens."
        }
      ]}
      integrations={[
        {
          title: "Subtle Monument Plaques",
          description: "Embed weatherproof, highly-durable brass or obsidian-finish QR plaques directly into flat markers, headstones, or columbarium niches."
        },
        {
          title: "Interactive Park Maps",
          description: "Connect physical coordinates in your directory with direct links to the public archives, creating virtual historical walking tours."
        },
        {
          title: "Anniversary & Remembrance Triggers",
          description: "Allow families to schedule annual reminder notifications to prompt visits, flower placements, or collective storytelling gatherings."
        }
      ]}
      lastingValue="By linking physical headstones to living digital records, cemeteries transition from silent resting grounds into rich historical corridors. Every stone becomes a gateway to an active, preserved legacy, preserving community stories for centuries."
    />
  );
}
