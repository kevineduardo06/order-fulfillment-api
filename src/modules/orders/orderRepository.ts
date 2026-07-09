import { createId } from "../../shared/id.js";
import type { Order } from "./orderTypes.js";

const orders = new Map<string, Order>();

export const orderRepository = {
  create(input: Omit<Order, "id" | "status" | "createdAt">): Order {
    const order: Order = {
      id: createId("ord"),
      status: "pending",
      createdAt: new Date().toISOString(),
      ...input
    };
    orders.set(order.id, order);
    return order;
  },

  save(order: Order): Order {
    orders.set(order.id, order);
    return order;
  },

  findById(id: string): Order | undefined {
    return orders.get(id);
  },

  list(status?: Order["status"]): Order[] {
    const all = [...orders.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return status ? all.filter((order) => order.status === status) : all;
  },

  clear(): void {
    orders.clear();
  }
};
