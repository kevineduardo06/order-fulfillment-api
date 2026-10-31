# Development roadmap

This is a proposed backlog for continued personal development. Items below are **not implemented** unless subsequently marked complete and linked to a commit or pull request. Time ranges are rough estimates, not hours already worked.

| Priority | Proposed work | Approx. effort | Acceptance criteria |
| --- | --- | --- | --- |
| P1 | Prevent duplicate shipments | 3–5 h | Repeated shipment attempts cannot consume inventory twice; tests cover retry behavior. |
| P1 | Idempotent order creation | 4–6 h | Same idempotency key and request return the original result; conflicting payloads are rejected. |
| P1 | Partial shipment workflow | 6–10 h | Orders can ship in parts without overshipping; reserved/on-hand stock remains consistent. |
| P1 | Inventory invariants and edge-case tests | 4–6 h | Reservation, cancellation, and shipment tests validate stock invariants across transitions. |
| P2 | Filtering and stable pagination for orders | 3–5 h | Deterministic ordering, filters, pagination, and API tests. |
| P2 | Persistent database repository | 8–14 h | Documented schema and migrations, persistence across restarts, and integration tests. |
| P2 | Error handling and API documentation | 3–5 h | Consistent errors and documented request/response examples. |
| P3 | CI checks and developer workflow | 2–4 h | Automated build/test checks on pull requests and clear contributor setup. |

**Total estimated future work:** 33–55 hours. Actual scope and priority may change during implementation. Work should be performed because it advances the project, not to fabricate activity or commit history.
