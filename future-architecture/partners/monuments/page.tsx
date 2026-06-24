import { PartnerPageTemplate } from "@/components/PartnerPageTemplate";

export const dynamic = "force-dynamic";

export default function MonumentsPartnerPage() {
  return (
    <PartnerPageTemplate
      partnerType="Monument Builders"
      tagline="Engraving stories that granite alone cannot hold."
      intro="Granite and bronze stand for centuries, but their space for storytelling is naturally limited. By embedding The Life Archive into your monument craftsmanship, you allow families to carve a physical key directly into stone that unlocks a rich, dynamic chronicle of their loved one's existence."
      familyBenefits={[
        {
          title: "Overcome physical Space Constraints",
          description: "Granite monuments can only fit a few words. The embedded Storykeeper QR code connects visitors to thousands of photos, voicemails, and audio files."
        },
        {
          title: "Hear Them Speak at the Stone",
          description: "Families can scan the integrated stone plaque to instantly play their mother's laughter, hear their father's advice, or read their favorite poems."
        },
        {
          title: "Keep the Tribute Up to Date",
          description: "Unlike static stone, the connected digital archive can grow over time, allowing future generations to add chapters, birthday notes, and reflections."
        }
      ]}
      partnerBenefits={[
        {
          title: "Elevate Your Craftsmanship",
          description: "Position your monument studio as an industry leader, seamlessly weaving age-old stonemasonry with modern, premium legacy technology."
        },
        {
          title: "Premium Product Offerings",
          description: "Differentiate your portfolio by offering complete, high-ticket packages that combine custom-designed headstones with permanent secure hosting."
        },
        {
          title: "No Technical Hassle for Your Staff",
          description: "We handle the hosting, security, and QR generation. You focus entirely on the artistic design and installation of the physical stone."
        }
      ]}
      integrations={[
        {
          title: "Embedded Obsidian Plaques",
          description: "Precision-carved, laser-etched black granite or anodized bronze QR tags designed to be flush-mounted into the stone face."
        },
        {
          title: "Co-Branded Client Portals",
          description: "Provide clients with a custom onboarding kit featuring your studio's logo, linking their physical order to their online portal."
        },
        {
          title: "Sculpted Monogram Elements",
          description: "Create unique decorative stone elements representing a Life Archive record, acting as an elegant visual clue that the monument has a digital story."
        }
      ]}
      lastingValue="Granite preserves names; stories preserve lives. By partnering with The Life Archive, monument builders offer families an everlasting bridge between physical stone and the living spirit of the person they cherish."
    />
  );
}
