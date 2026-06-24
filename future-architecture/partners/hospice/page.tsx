import { PartnerPageTemplate } from "@/components/PartnerPageTemplate";

export const dynamic = "force-dynamic";

export default function HospicePartnerPage() {
  return (
    <PartnerPageTemplate
      partnerType="Hospice Care Providers"
      tagline="Honoring the closing chapter with quiet dignity and legacy preservation."
      intro="Hospice care is dedicated to profound comfort and emotional support in life's final transition. The Life Archive helps hospice caregivers support families during this meaningful window by giving patients an elegant, calming avenue to record their life lessons, speak final wishes, and share their stories."
      familyBenefits={[
        {
          title: "Capture Wisdom While There is Time",
          description: "Provides a quiet, structured, and extremely gentle pathway for patients to record final advice, memories, or loving words for those who will follow."
        },
        {
          title: "Therapeutic Legacy Building",
          description: "Engaging in legacy storytelling has been proven to bring patients deep solace, helping them reflect on a life full of impact, meaning, and connection."
        },
        {
          title: "Organized Estate Transition",
          description: "Store practical guidelines and estate instructions securely so the family can find everything they need easily when the transition occurs."
        }
      ]}
      partnerBenefits={[
        {
          title: "True Holistic Care",
          description: "Extend your clinical care model into deep emotional and spiritual legacy support, helping patients build something that survives them."
        },
        {
          title: "Compassionate Family Support",
          description: "Help families begin the healing process early by actively preserving their loved one's presence while they are still able to speak."
        },
        {
          title: "Resource Support for Bereavement",
          description: "Provide the family with an ongoing, private digital sanctuary that continues to support their healing journey long after your medical care ends."
        }
      ]}
      integrations={[
        {
          title: "Guided Story Circles",
          description: "Deploy trained staff or volunteers equipped with gentle, conversational legacy templates to help patients comfortably record stories."
        },
        {
          title: "Voice-First Recording Tools",
          description: "Integrate simple, highly-accessible tablet-based recorders allowing patients to record messages with a single tap of their hand."
        },
        {
          title: "Private Heirloom Kits",
          description: "Co-distribute custom-packaged Storykeeper Card kits to families upon admission, providing an immediate path to preserve memories."
        }
      ]}
      lastingValue="By integrating legacy preservation into hospice care, providers elevate the closing chapter of life into an intentional moment of preservation. We help you give families a gift that only grows in emotional value over the decades—the actual voice and loving wisdom of their parent or partner."
    />
  );
}
