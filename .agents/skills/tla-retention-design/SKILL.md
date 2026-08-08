---
name: tla-retention-design
description: Design and audit recurring engagement, milestone celebrations, memory anniversaries, time capsule surprises, and family contributor loops.
---

# TLA Retention Design

Design and audit meaningful, relationship-centered retention mechanisms built around `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.

## Triggers
Activate this skill when:
- Designing or auditing memory anniversary reminders, birthday notifications, or scheduled time capsule unlocks.
- Building or updating family contributor invite loops, collaborative memory prompts, or shared feeds.
- Auditing email digest cadence, push/SMS notifications, or in-app milestone celebrations.
- Addressing user retention decline or long-term engagement drop-offs.

## Inputs to Inspect
- Scheduled delivery tables and cron jobs (`supabase/migrations/*scheduled_deliveries*.sql`, backend cron handlers).
- Notification components and hooks (`lib/notifications/**`, `components/notifications/**`).
- Email template generators and delivery pipelines (`lib/email/**`, transactional templates).
- Time capsule unlock triggers and scheduled surprise logic (`lib/time-capsules.ts`).
- Contributor access and invitation logic (`lib/connections.ts`).

## Step-by-Step Procedure
1. **Audit Existing Re-engagement Loops**: Review all existing automated touchpoints (anniversary alerts, digest emails, time capsule unlock notifications).
2. **Evaluate Emotional Cadence & Pacing**: Ensure notifications feel like thoughtful personal reminders rather than aggressive growth hacks. Respect sensitive contexts (e.g., memorial anniversaries).
3. **Optimize Contributor Loops**: Trace how invited family members and friends interact with shared People and Connections. Build frictionless loops for adding memories, commenting, and contributing stories.
4. **Audit Time Capsule & Future Surprise Deliveries**: Verify scheduled delivery reliability, recipient notification mechanics, and unlock experience.
5. **Verify User Preference & Privacy Controls**: Ensure users can easily customize notification frequency, delivery channels, or pause sensitive reminders.

## Output & Report Format
Generate a **Retention & Engagement Blueprint**:

```markdown
# Retention & Engagement Blueprint

## 1. Engagement Loop Matrix
| Loop Name | Trigger Event | Target Relationship | Delivery Channel | Emotional Purpose |
|---|---|---|---|---|
| Memory Anniversary | 1 Year since Memory | Person -> Connection | Email & In-App | Celebrate shared legacy & prompt reflection |
| Time Capsule Unlock | Target Date Reached | Sender -> Recipient | Email + Secure Link | Deliver scheduled emotional surprise |
| Contributor Invite | Memory Added | Family Connection | In-App + Push | Invite collaborative story addition |

## 2. Cadence & Respectful Communication Audit
- **Pacing**: [Max 1 notification per week per connection]
- **Sensitivity Rules**: [Opt-out controls for memorial dates, respectful phrasing]
- **Unsubscribe & Preference Controls**: [Verified accessible in settings and email footers]

## 3. System Integrity & Delivery Verification
- [ ] Cron schedule verified for timezone accuracy
- [ ] Email render checks on mobile/desktop clients
- [ ] RLS verification for shared contributor access
```

## Verification Requirements
- Verify scheduled delivery functions execute reliably without missing target dates or duplicating sends.
- Verify notification access controls respect RLS policies (`person_id` and `connection_id` permissions).
- Test email opt-out and notification setting updates in user preferences.
- Run `npm run build` and targeted tests on notification handlers.

## Anti-Patterns
- Never send generic gamified push notifications ("You haven't logged in for 3 days!").
- Never deliver scheduled time capsules to unauthorized recipients or without explicit lock verification.
- Never spam invited family members with transactional marketing emails.
- Never hide notification management or unsubscribe controls from users.
