export interface InventoryItem {
  productId: string;
  onHand: number;
  reserved: number;
  updatedAt: string;
}

export interface InventorySnapshot extends InventoryItem {
  available: number;
}
