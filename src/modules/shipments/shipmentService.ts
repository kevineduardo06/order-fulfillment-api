import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { inventoryService } from "../inventory/inventoryService.js";
import { orderService } from "../orders/orderService.js";
import { shipmentRepository } from "./shipmentRepository.js";
import type { Shipment } from "./shipmentTypes.js";

export const shipmentService = {
  create(orderId: string, carrier: string): Shipment {
    if (!carrier.trim()) {
      throw badRequest("Carrier is required");
    }

    const order = orderService.get(orderId);
    if (order.status !== "paid") {
      throw conflict("Only paid orders can be shipped");
    }

    const existing = shipmentRepository.findByOrderId(orderId);
    if (existing) {
      throw conflict("Order already has a shipment");
    }

    for (const line of order.lines) {
      inventoryService.consumeReserved(line.productId, line.quantity);
    }

    orderService.markShipped(order.id);
    return shipmentRepository.create({ orderId, carrier });
  },

  dispatch(id: string, trackingCode: string): Shipment {
    const shipment = shipmentRepository.findById(id);
    if (!shipment) throw notFound("Shipment");
    if (!trackingCode.trim()) throw badRequest("Tracking code is required");

    return shipmentRepository.save({
      ...shipment,
      status: "dispatched",
      trackingCode,
      dispatchedAt: new Date().toISOString()
    });
  },

  list(): Shipment[] {
    return shipmentRepository.list();
  }
};
