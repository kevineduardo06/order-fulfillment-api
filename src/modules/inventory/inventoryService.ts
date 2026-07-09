import { badRequest, conflict, notFound } from "../../shared/errors.js";
import { productRepository } from "../products/productRepository.js";
import { inventoryRepository } from "./inventoryRepository.js";
import type { InventorySnapshot } from "./inventoryTypes.js";

const toSnapshot = (item: { productId: string; onHand: number; reserved: number; updatedAt: string }): InventorySnapshot => ({
  ...item,
  available: item.onHand - item.reserved
});

export const inventoryService = {
  receive(productId: string, quantity: number): InventorySnapshot {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw badRequest("Quantity must be a positive integer");
    }
    if (!productRepository.findById(productId)) {
      throw notFound("Product");
    }

    const item = inventoryRepository.get(productId);
    return toSnapshot(inventoryRepository.save({ ...item, onHand: item.onHand + quantity }));
  },

  reserve(productId: string, quantity: number): InventorySnapshot {
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw badRequest("Quantity must be a positive integer");
    }

    const item = inventoryRepository.get(productId);
    if (item.onHand - item.reserved < quantity) {
      throw conflict("Insufficient available inventory");
    }

    return toSnapshot(inventoryRepository.save({ ...item, reserved: item.reserved + quantity }));
  },

  release(productId: string, quantity: number): InventorySnapshot {
    const item = inventoryRepository.get(productId);
    if (item.reserved < quantity) {
      throw conflict("Cannot release more inventory than is reserved");
    }

    return toSnapshot(inventoryRepository.save({ ...item, reserved: item.reserved - quantity }));
  },

  consumeReserved(productId: string, quantity: number): InventorySnapshot {
    const item = inventoryRepository.get(productId);
    if (item.reserved < quantity) {
      throw conflict("Cannot ship more inventory than is reserved");
    }

    return toSnapshot(
      inventoryRepository.save({
        ...item,
        onHand: item.onHand - quantity,
        reserved: item.reserved - quantity
      })
    );
  },

  get(productId: string): InventorySnapshot {
    return toSnapshot(inventoryRepository.get(productId));
  },

  list(): InventorySnapshot[] {
    return inventoryRepository.list().map(toSnapshot);
  }
};
