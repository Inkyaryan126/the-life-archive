import { PartnerPageTemplate } from "@/components/PartnerPageTemplate";

export const dynamic = "force-dynamic";

export default function FuneralHomesPartnerPage() {
  return (
    <PartnerPageTemplate
      partnerType="Funeral Homes"
      tagline="Transforming traditional memorials into permanent, living digital vaults."
      intro="For funeral homes, care doesn't end when the service concludes. The Life Archive serves as preservation infrastructure, helping you offer grieving families a quiet, sacred sanctuary to host their loved one's voice, stories, and photographs forever."
      familyBenefits={[
        {
          title: "Healing Beyond the Service",
          description: "Give families a tangible, physical Storykeeper Card at the visitation or service, allowing them to collectively hear and celebrate the stories of a lifetime."
        },
        {
          title: "Seamless Collaboration",
          description: "Allow multiple family members, near and far, to instantly upload spoken memories, photos, and legacy instructions from any mobile device without complicated apps."
        },
        {
          title: "Permanent Peace of Mind",
          description: "Ensure that their loved one's digital legacy doesn't disappear on commercial social feeds or outdated guestbooks."
        }
      ]}
      partnerBenefits={[
        {
          title: "Differentiate Your Services",
          description: "Stand out as a modern, forward-thinking care provider by offering living heirloom technology alongside traditional memorial services."
        },
        {
          title: "Ongoing Family Relationships",
          description: "Remain in the family's lives as a trusted custodian of legacy, continuing to provide value years after the funeral service is complete."
        },
        {
          title: "An Elegant, Professional Presentation",
          description: "Deliver a polished, dark/gold branded digital space that represents your funeral home's high standards of care and dignity."
        }
      ]}
      integrations={[
        {
          title: "Printed Memorial Packages",
          description: "Directly integrate secure Storykeeper QR codes onto paper programs, obituary cards, or register books during service planning."
        },
        {
          title: "Custom Tribute Screens",
          description: "Display a live, rotating stream of newly uploaded family memory chapters on screens throughout your chapels."
        },
        {
          title: "Pre-Need Legacy Onboarding",
          description: "Help clients pre-plan their archives alongside traditional arrangements, securing their stories well in advance."
        }
      ]}
      lastingValue="By integrating The Life Archive's quiet, secure infrastructure, funeral homes help families transition from momentary grief to enduring memory. Stories, voices, and wisdom are safeguarded for generations, building a lasting legacy of premium care."
    />
  );
}
