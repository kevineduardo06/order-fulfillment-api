export type ShipmentStatus = "created" | "dispatched";

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingCode?: string;
  status: ShipmentStatus;
  createdAt: string;
  dispatchedAt?: string;
}
