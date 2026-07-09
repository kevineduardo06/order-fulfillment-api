import { inventoryRepository } from "../src/modules/inventory/inventoryRepository.js";
import { orderRepository } from "../src/modules/orders/orderRepository.js";
import { productRepository } from "../src/modules/products/productRepository.js";
import { shipmentRepository } from "../src/modules/shipments/shipmentRepository.js";
import { resetIdsForTests } from "../src/shared/id.js";

export const resetState = (): void => {
  productRepository.clear();
  inventoryRepository.clear();
  orderRepository.clear();
  shipmentRepository.clear();
  resetIdsForTests();
};
