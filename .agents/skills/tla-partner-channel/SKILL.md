---
name: tla-partner-channel
description: Audit and specify B2B2C distribution flows for funeral homes, hospices, estate planners, monument builders, and memory care partners.
---

# TLA Partner Channel

Define, audit, and design B2B2C partner distribution workflows for funeral homes, hospices, estate planners, monument builders, and care facilities, extending `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.

## Triggers
Activate this skill when:
- Designing or auditing partner landing pages (`app/partner/**`, `/b2b/**`), partner intake forms, or referral tracking.
- Building bulk QR keepsake provisioning pipelines for funeral directors, hospice care coordinators, or estate attorneys.
- Implementing co-branding banners, custom partner landing experiences, or partner discount codes.
- Setting up partner attribution analytics or B2B2C conversion reporting.

## Inputs to Inspect
- Partner route handlers and components (`app/partner/**`, `components/partner/**`).
- Referral code and attribution query parameter handlers (`lib/attribution.ts`, checkout session builders).
- QR bulk generation and physical artifact pairing tools (`lib/qr-generator.ts`, keepsake order logic).
- Partner branding settings, asset paths, and co-branded headers.
- Partner analytics tracking points (`partner_code`, `channel_source`).

## Step-by-Step Procedure
1. **Identify Partner Vertical Requirements**:
   - **Funeral Homes**: Immediate memorial keepsake creation, physical QR medallions for memorial services, family onboarding kits.
   - **Hospices**: Living history capture, legacy memory recording with care team, scheduled time capsules for surviving family.
   - **Estate Planners**: Digital heirloom setup, time-locked future surprises, secure memory preservation alongside legacy plans.
   - **Monument Builders**: Durable weather-resistant QR medallion/plaque integration linking gravestones and monuments to TLA Person spaces.
2. **Audit Co-Branding & Onboarding Flow**: Ensure partner-referred clients experience a dignified, co-branded onboarding flow that clearly explains the partner relationship without compromising TLA brand trust.
3. **Inspect Attribution & QR Provisioning**: Verify that referral codes, partner IDs, and QR tokens map accurately to partner organizations in checkout and onboarding analytics.
4. **Safeguard Privacy & Sensitive Contexts**: Ensure partner organizations have NO access to private user memories or personal data unless explicitly authorized by the user/family.
5. **Validate Business Claims**: Ensure code, copy, and partner specs do not include hardcoded unsupported financial projections, unsubstantiated ROI promises, or unverified legal guarantees.

## Output & Report Format
Generate a **Partner Channel Specification & Audit Report**:

```markdown
# Partner Channel Specification & Audit Report

## 1. Vertical Strategy & Channel Focus
- **Target Partner Vertical**: [Funeral Homes / Hospices / Estate Planners / Monument Builders]
- **Partner Touchpoint**: [Physical QR Medallion / Partner Portal / Referral Link / Welcome Kit]
- **Primary Value Delivered**: [Dignified legacy preservation & keepsake provisioning]

## 2. Workflow & Technical Specification
| Step | User / Partner Action | System Route & Component | Data & Attribution Captured |
|---|---|---|---|
| 1. Provision | Funeral Director orders QR Medallion | `app/partner/provision/page.tsx` | `partner_id`, `batch_sku`, `qr_token` |
| 2. Activate | Family scans QR Medallion | `app/qr/[token]/page.tsx` | `partner_code`, `person_id` association |
| 3. Onboard | Family completes Person profile | `app/onboarding/page.tsx?ref=partner` | Co-branding banner, partner attribution |

## 3. Privacy & Compliance Audit
- **Data Isolation**: User data isolated via RLS; partner has 0 visibility into private memories.
- **Copy Integrity**: Zero unverified business claims or guaranteed ROI claims in partner materials.

## 4. Verification Checklist
- [ ] Partner attribution parameters persist through checkout
- [ ] QR code scanning routes cleanly on mobile devices
- [ ] Co-branding elements render accurately without breaking layout
```

## Verification Requirements
- Test partner referral query string parsing (`?ref=PARTNER_CODE`) and session storage persistence.
- Verify physical QR code token destinations resolve correctly to intended person or onboarding pages.
- Ensure no partner administration route exposes end-user private memories or PII.
- Run `npm run build` and `npm run lint` on partner route files.

## Anti-Patterns
- Never hardcode unsupported financial projections or unsubstantiated partner commission claims.
- Never grant partner organizations access to private family memories without explicit user consent.
- Never use aggressive or transactional sales tactics in grief-sensitive partner contexts.
- Never break standard URL attribution or strip tracking parameters during partner checkout.
