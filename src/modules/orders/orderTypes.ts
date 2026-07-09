export type OrderStatus = "pending" | "paid" | "cancelled" | "shipped";

export interface OrderLine {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  lines: OrderLine[];
  totalCents: number;
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
  shippedAt?: string;
}
