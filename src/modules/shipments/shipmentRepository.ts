import { createId } from "../../shared/id.js";
import type { Shipment } from "./shipmentTypes.js";

const shipments = new Map<string, Shipment>();

export const shipmentRepository = {
  create(input: Omit<Shipment, "id" | "status" | "createdAt">): Shipment {
    const shipment: Shipment = {
      id: createId("shp"),
      status: "created",
      createdAt: new Date().toISOString(),
      ...input
    };
    shipments.set(shipment.id, shipment);
    return shipment;
  },

  save(shipment: Shipment): Shipment {
    shipments.set(shipment.id, shipment);
    return shipment;
  },

  findById(id: string): Shipment | undefined {
    return shipments.get(id);
  },

  findByOrderId(orderId: string): Shipment | undefined {
    return [...shipments.values()].find((shipment) => shipment.orderId === orderId);
  },

  list(): Shipment[] {
    return [...shipments.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  clear(): void {
    shipments.clear();
  }
};
