---
name: tla-keepsake-commerce
description: Implement physical & digital Keepsake commerce, checkout, fulfillment orders, QR links, and payment integrations.
---

# TLA Keepsake Commerce

Safely build, maintain, and expand physical and digital Keepsake commerce flows, checkout pipelines, QR code connections, fulfillment orders, and payment integrations for TLA 2.0.

## Triggers
Activate this skill when:
- Creating or updating Keepsake products, physical print orders, custom books, QR-linked physical artifacts, or digital access tokens.
- Modifying checkout flows, cart management, Stripe payment intents, webhook handlers, or fulfillment API pipelines.
- Implementing keepsake pricing, digital entitlement verification, or surprise gift delivery logic.
- Debugging payment reconciliation, order status updates, or physical fulfillment workflows.

## Operating Rules
1. Map Keepsakes directly to underlying People and Memories (`Person -> Memory -> Keepsake`).
2. Integrate Stripe payment handling safely using standard server-side APIs and webhook reconciliation.
3. Ensure QR code destinations link seamlessly to physical keepsake items and authorized person/memory views.
4. Protect digital entitlement and media access—only grant keepsake access post-payment or via verified gift redemption tokens.
5. Validate physical fulfillment order payloads (shipping address, print assets, dimensions, print resolution) before submitting to vendor or fulfillment APIs.
6. Keep checkout and order tracking clear, transparent, and reassuring for customers.

## Verification Requirements
- Test Stripe webhook handlers and payment intent lifecycle with mock/test payloads.
- Validate QR token generation, scanning resolution, and entitlement security checks.
- Verify cart state persistence, tax/shipping calculation, and checkout validation.
- Run `npm run build` and targeted tests on checkout and fulfillment actions.

## Anti-Patterns
- Never hardcode or silently change live Stripe price IDs, keys, or payment configuration without explicit task instructions.
- Never grant access to paid Keepsakes or physical print order previews without verified payment or entitlement authorization.
- Never expose private customer shipping addresses, secret webhook signatures, or secret keys in client-side code.
- Never decouple Keepsakes from the Person and Memory entities that define their emotional value.
