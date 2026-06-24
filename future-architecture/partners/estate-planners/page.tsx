import { PartnerPageTemplate } from "@/components/PartnerPageTemplate";

export const dynamic = "force-dynamic";

export default function EstatePlannersPartnerPage() {
  return (
    <PartnerPageTemplate
      partnerType="Estate Planners"
      tagline="Securing the financial wealth and the emotional legacy in one place."
      intro="Traditional estate planning secures a family's financial wealth. By integrating The Life Archive's silent preservation infrastructure, forward-thinking planners can help clients secure their most important asset of all—their values, identity, life lessons, and personal guidance for the future."
      familyBenefits={[
        {
          title: "Comprehensive Legacy Protection",
          description: "Protect the wisdom and personal context behind your financial assets, giving future heirs a guiding roadmap of why and how you built your legacy."
        },
        {
          title: "Clear, Quiet Transition",
          description: "Organize digital assets, household inventories, final letters, and direct wishes in a secure, protected vault that the family can locate easily."
        },
        {
          title: "Generational Alignment",
          description: "Help younger generations connect with family values, keeping family foundations and business intentions tightly aligned across time."
        }
      ]}
      partnerBenefits={[
        {
          title: "Offer Modern, Premium Planning",
          description: "Move beyond standard legal documents, offering your clients a modern, high-touch estate-planning experience focused on holistic legacy preservation."
        },
        {
          title: "Strengthen Generational Relationships",
          description: "Connect naturally with your clients' children and heirs, positioning your practice as the multi-generational advisor for the entire family."
        },
        {
          title: "Ensure Legal Integrity with Calm Clarity",
          description: "When final wishes are documented with actual spoken audio in our vault, families navigate estate execution with absolute clarity, avoiding conflicts."
        }
      ]}
      integrations={[
        {
          title: "The Legacy Onboarding Protocol",
          description: "Introduce custom-branded client kits containing a premium physical Storykeeper Card right alongside final signed wills or trusts."
        },
        {
          title: "Secure Digital Executor Keys",
          description: "Allow clients to designate professional executors or attorneys as co-custodians to release private instructions only when estate conditions are met."
        },
        {
          title: "Pre-Scheduled Generational Releases",
          description: "Leverage estate triggers to automatically open locked digital memory chapters or milestone letters on future target dates."
        }
      ]}
      lastingValue="Money is only part of what a family inherits. By integrating The Life Archive, estate planners ensure that when clients pass on their financial estate, they are also passing on their identity, voice, love, and defining lessons."
    />
  );
}
