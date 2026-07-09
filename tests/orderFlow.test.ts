import { beforeEach, describe, expect, it } from "vitest";
import { inventoryService } from "../src/modules/inventory/inventoryService.js";
import { orderService } from "../src/modules/orders/orderService.js";
import { productRepository } from "../src/modules/products/productRepository.js";
import { shipmentService } from "../src/modules/shipments/shipmentService.js";
import { resetState } from "./testState.js";

describe("order fulfillment flow", () => {
  beforeEach(() => resetState());

  it("reserves inventory when an order is created", () => {
    const product = productRepository.create({ sku: "KIT-001", name: "Starter Kit", priceCents: 12000 });
    inventoryService.receive(product.id, 5);

    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 2 }] });

    expect(order.status).toBe("pending");
    expect(order.totalCents).toBe(24000);
    expect(inventoryService.get(product.id)).toMatchObject({ onHand: 5, reserved: 2, available: 3 });
  });

  it("prevents orders when available stock is insufficient", () => {
    const product = productRepository.create({ sku: "KIT-002", name: "Limited Kit", priceCents: 8000 });
    inventoryService.receive(product.id, 1);

    expect(() =>
      orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 2 }] })
    ).toThrow("Insufficient available inventory");
  });

  it("releases reserved inventory when a pending order is cancelled", () => {
    const product = productRepository.create({ sku: "KIT-003", name: "Cancel Kit", priceCents: 5000 });
    inventoryService.receive(product.id, 3);
    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 2 }] });

    const cancelled = orderService.cancel(order.id);

    expect(cancelled.status).toBe("cancelled");
    expect(inventoryService.get(product.id)).toMatchObject({ onHand: 3, reserved: 0, available: 3 });
  });

  it("ships paid orders by consuming reserved inventory", () => {
    const product = productRepository.create({ sku: "KIT-004", name: "Shipping Kit", priceCents: 7000 });
    inventoryService.receive(product.id, 4);
    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 2 }] });
    orderService.markPaid(order.id);

    const shipment = shipmentService.create(order.id, "DHL");

    expect(shipment.orderId).toBe(order.id);
    expect(orderService.get(order.id).status).toBe("shipped");
    expect(inventoryService.get(product.id)).toMatchObject({ onHand: 2, reserved: 0, available: 2 });
  });

  it("does not allow unpaid orders to be shipped", () => {
    const product = productRepository.create({ sku: "KIT-005", name: "Unpaid Kit", priceCents: 3000 });
    inventoryService.receive(product.id, 2);
    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 1 }] });

    expect(() => shipmentService.create(order.id, "UPS")).toThrow("Only paid orders can be shipped");
  });

  it("prevents duplicate shipments for the same order", () => {
    const product = productRepository.create({ sku: "KIT-006", name: "Duplicate Kit", priceCents: 9000 });
    inventoryService.receive(product.id, 2);
    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 1 }] });
    orderService.markPaid(order.id);
    shipmentService.create(order.id, "FedEx");

    expect(() => shipmentService.create(order.id, "FedEx")).toThrow("Only paid orders can be shipped");
  });

  it("does not allow shipped orders to be cancelled", () => {
    const product = productRepository.create({ sku: "KIT-007", name: "Final Kit", priceCents: 15000 });
    inventoryService.receive(product.id, 1);
    const order = orderService.create({ customerId: "cus_1", lines: [{ productId: product.id, quantity: 1 }] });
    orderService.markPaid(order.id);
    shipmentService.create(order.id, "Correios");

    expect(() => orderService.cancel(order.id)).toThrow("Shipped orders cannot be cancelled");
  });
});
