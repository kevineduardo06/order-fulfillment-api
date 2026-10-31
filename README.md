# Order Fulfillment API

A personal TypeScript and Express REST API for exploring order fulfillment workflows, inventory management, shipment processing, and operational reporting. The project is an independently developed prototype and uses in-memory repositories; it is not currently presented as a production service.

## Features

- Product catalog management
- Inventory receiving, stock availability, and reservations
- Order creation, payment-state updates, and cancellation
- Shipment creation for paid orders
- Inventory and revenue reports
- Automated API and workflow tests

## Technology

- Node.js, TypeScript, Express
- Zod for request validation
- Vitest and Supertest for testing
- In-memory data repositories (no database required)

## Getting started

Requires a recent Node.js version compatible with the dependencies and npm.

```bash
npm install
npm run build
npm test
npm run dev
```

The development server is configured in `src/server.ts`. See `src/app.ts` for route definitions and HTTP behavior.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health check |
| POST | `/products` | Create a product |
| GET | `/products` | List products |
| POST | `/inventory/receive` | Receive stock |
| GET | `/inventory/:productId` | Read inventory |
| POST | `/orders` | Create and reserve an order |
| GET | `/orders/:id` | Read an order |
| POST | `/orders/:id/pay` | Mark an order paid (simulated) |
| POST | `/orders/:id/cancel` | Cancel an eligible order |
| POST | `/shipments` | Create a shipment |
| GET | `/reports/inventory` | Inventory report |
| GET | `/reports/revenue` | Revenue report |

## Business rules

- Available stock equals on-hand stock minus reserved stock.
- Creating an order reserves stock.
- Cancelling an eligible order releases its reservation.
- Shipping a paid order consumes reserved stock and reduces on-hand stock.
- Shipped orders cannot be cancelled.
- Payment is simulated by a state change; there is no payment gateway integration.

## Project status and limitations

This is a development prototype. Repositories store data in memory, so data is not durable across process restarts. It is not intended for real customer orders or payment processing in its current form. No real customer data is required to run or test it.

## Planned work

See [ROADMAP.md](ROADMAP.md) for proposed features, refactoring, testing, and estimated implementation effort. Estimates are planning assumptions, not work already completed.

## License

MIT. See [LICENSE](LICENSE).
