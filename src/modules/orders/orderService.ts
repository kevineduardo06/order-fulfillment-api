import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { inventoryService } from "../inventory/inventoryService.js";
import { productRepository } from "../products/productRepository.js";
import { orderRepository } from "./orderRepository.js";
import type { Order, OrderLine, OrderStatus } from "./orderTypes.js";

export interface CreateOrderInput {
  customerId: string;
  lines: Array<{ productId: string; quantity: number }>;
}

const buildLine = (line: { productId: string; quantity: number }): OrderLine => {
  if (line.quantity <= 0 || !Number.isInteger(line.quantity)) {
    throw badRequest("Order line quantity must be a positive integer");
  }

  const product = productRepository.findById(line.productId);
  if (!product || !product.active) {
    throw notFound("Product");
  }

  return {
    productId: product.id,
    quantity: line.quantity,
    unitPriceCents: product.priceCents
  };
};

const calculateTotal = (lines: OrderLine[]): number =>
  lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);

export const orderService = {
  create(input: CreateOrderInput): Order {
    if (!input.customerId.trim()) {
      throw badRequest("Customer id is required");
    }
    if (input.lines.length === 0) {
      throw badRequest("Order must have at least one line");
    }

    const lines = input.lines.map(buildLine);

    for (const line of lines) {
      inventoryService.reserve(line.productId, line.quantity);
    }

    return orderRepository.create({
      customerId: input.customerId,
      lines,
      totalCents: calculateTotal(lines)
    });
  },

  get(id: string): Order {
    const order = orderRepository.findById(id);
    if (!order) throw notFound("Order");
    return order;
  },

  list(status?: OrderStatus): Order[] {
    return orderRepository.list(status);
  },

  markPaid(id: string): Order {
    const order = this.get(id);
    if (order.status !== "pending") {
      throw conflict("Only pending orders can be marked as paid");
    }

    return orderRepository.save({ ...order, status: "paid", paidAt: new Date().toISOString() });
  },

  cancel(id: string): Order {
    const order = this.get(id);
    if (order.status === "shipped") {
      throw conflict("Shipped orders cannot be cancelled");
    }
    if (order.status === "cancelled") {
      return order;
    }

    for (const line of order.lines) {
      inventoryService.release(line.productId, line.quantity);
    }

    return orderRepository.save({ ...order, status: "cancelled", cancelledAt: new Date().toISOString() });
  },

  markShipped(id: string): Order {
    const order = this.get(id);
    if (order.status !== "paid") {
      throw conflict("Only paid orders can be shipped");
    }

    return orderRepository.save({ ...order, status: "shipped", shippedAt: new Date().toISOString() });
  }
};
