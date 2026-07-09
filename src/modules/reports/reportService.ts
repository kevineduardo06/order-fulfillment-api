import { inventoryService } from "../inventory/inventoryService.js";
import { orderService } from "../orders/orderService.js";
import { productRepository } from "../products/productRepository.js";

export const reportService = {
  inventory() {
    return inventoryService.list().map((item) => {
      const product = productRepository.findById(item.productId);
      return {
        productId: item.productId,
        sku: product?.sku ?? "unknown",
        name: product?.name ?? "Unknown product",
        onHand: item.onHand,
        reserved: item.reserved,
        available: item.available
      };
    });
  },

  revenue() {
    const orders = orderService.list();
    const paidOrders = orders.filter((order) => order.status === "paid" || order.status === "shipped");
    const cancelledOrders = orders.filter((order) => order.status === "cancelled");

    return {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      cancelledOrders: cancelledOrders.length,
      grossRevenueCents: paidOrders.reduce((sum, order) => sum + order.totalCents, 0),
      pendingRevenueCents: orders
        .filter((order) => order.status === "pending")
        .reduce((sum, order) => sum + order.totalCents, 0)
    };
  }
};
