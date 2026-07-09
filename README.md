# Order Fulfillment API

A small but realistic TypeScript/Express greenfield API for order fulfillment workflows. It models products, inventory, orders, shipment preparation, cancellation, stock reservation, and operational reporting.

This repo is intentionally lightweight but structured like a real service so it can be used for engineering tasks involving bug fixes, refactors, feature extensions, testing, and workflow evaluation.

## Domain

The API supports:

- Product catalog management
- Inventory receiving and reservation
- Order creation with stock reservation
- Order cancellation with stock release
- Shipment creation for paid orders
- Operational reports for available stock and revenue

## Important business rules

- `available = onHand - reserved`
- Creating an order reserves stock immediately.
- Cancelling a pending or paid order releases reserved stock.
- Shipping a paid order consumes reserved stock and reduces on-hand stock.
- Shipped orders cannot be cancelled.
- Orders cannot be shipped unless they are paid.
- Payments are represented by marking an order as paid; no external payment gateway is included.

## Commands

```bash
npm install
npm test
npm run build
npm run dev
```

## Useful endpoints

```http
GET /health
POST /products
GET /products
POST /inventory/receive
GET /inventory/:productId
POST /orders
GET /orders/:id
POST /orders/:id/pay
POST /orders/:id/cancel
POST /shipments
GET /reports/inventory
GET /reports/revenue
```

## Good task ideas

- Prevent duplicate shipments for the same order.
- Add partial shipment support without breaking full shipment behavior.
- Fix inventory inconsistencies when cancelling orders after payment.
- Add stable sorting and filtering to the order list.
- Add idempotency keys for order creation or shipment creation.
- Refactor duplicated inventory calculations into one service method.
- Add tests for stock reservation edge cases.
