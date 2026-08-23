# Product specification

RescueMesh turns fragmented emergency reports into a shared, prioritized operational picture using local AI and peer-to-peer coordination.

## Contract

| Topic | Decision |
| --- | --- |
| One-liner | RescueMesh turns chaotic emergency reports into a shared, prioritized incident board using on-device QVAC and peer-to-peer Pear — no central server. |
| Tagline | WhatsApp communicates. RescueMesh coordinates. |
| Allowed claim | Removes dependency on centralized coordination servers and cloud AI. Reports stay local and sync peer-to-peer when a communication path exists. |
| Forbidden claim | Works with absolutely no connectivity. |
| Primary hackathon track | Pears Track, when only one track can be selected. QVAC remains visible as `AI LOCAL ✓`. WDK is out of scope. |

## Roles

| Role | Who | What they do |
| --- | --- | --- |
| Reporter | Affected citizen, volunteer, brigade member | Free-text or local dictation. No complex form. |
| Responder | Brigade, NGO, coordination desk | Prioritized list, acknowledge / start / resolve. |
| Command Center | Third peer | Same Responder UI, separate store, same replica. |

No authentication. The role lives on the instance.

## Must-have loop

1. Show runtime: `AI LOCAL ✓`, `P2P CONNECTED ✓`, `CENTRAL SERVER NONE`.
2. Reporter writes Plaza San Martin.
3. QVAC returns CRITICAL with rescue + medical.
4. Responder receives NEW CRITICAL INCIDENT without a RescueMesh backend.
5. Network reads real Peer IDs.
6. Stop Peer A from the UI (kill the process).
7. The incident remains on Peer B.

Narration for step 7: **The original reporter is gone. The incident isn't.**

## Stretch (already in the MVP)

- Local dictation (Web Speech API) → same QVAC pipeline.
- Spanish input → English operational summary; raw report preserved.
- Likely-duplicate hints; no silent merge.
- Third peer on `:43149`.

## Non-goals

Login, maps, GPS, mobile app, blockchain, WDK, LoRa, Firebase, a proprietary REST+DB sync path, and replacing WhatsApp.

## Related documents

- [Architecture](ARCHITECTURE.md)
- [Demo script](DEMO.md)
- [QVAC](QVAC.md)
- [Pear](PEAR.md)
