---
name: tla-agent-memory
description: Preserve useful technical and operational lessons so TLA agents do not repeat failed approaches.
---

# TLA Agent Memory

Capture durable lessons only.

Record something when:
- an approach failed repeatedly
- a platform/tool has a known limitation
- a workaround is likely to be needed again
- an architectural decision was made
- a regression revealed an important rule
- a deployment or environment quirk matters later

Store lessons under docs/agent-memory/.

Preferred files:
- failed-approaches.md
- architecture-decisions.md
- deployment-gotchas.md
- regression-history.md
- tooling.md

Each entry should include:
- date
- problem
- attempted approach
- outcome
- working approach
- future rule

Do not fill memory files with routine task logs.

If an approach fails twice, check existing agent memory before trying more variations.
