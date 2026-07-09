import type { InventoryItem } from "./inventoryTypes.js";

const inventory = new Map<string, InventoryItem>();

const now = (): string => new Date().toISOString();

export const inventoryRepository = {
  get(productId: string): InventoryItem {
    const existing = inventory.get(productId);
    if (existing) return existing;

    const created: InventoryItem = {
      productId,
      onHand: 0,
      reserved: 0,
      updatedAt: now()
    };
    inventory.set(productId, created);
    return created;
  },

  save(item: InventoryItem): InventoryItem {
    const updated = { ...item, updatedAt: now() };
    inventory.set(item.productId, updated);
    return updated;
  },

  list(): InventoryItem[] {
    return [...inventory.values()].sort((a, b) => a.productId.localeCompare(b.productId));
  },

  clear(): void {
    inventory.clear();
  }
};
