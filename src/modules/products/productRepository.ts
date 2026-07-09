import { createId } from "../../shared/id.js";
import type { Product } from "./productTypes.js";

const products = new Map<string, Product>();

export const productRepository = {
  create(input: Omit<Product, "id" | "createdAt" | "active">): Product {
    const product: Product = {
      id: createId("prod"),
      active: true,
      createdAt: new Date().toISOString(),
      ...input
    };
    products.set(product.id, product);
    return product;
  },

  findById(id: string): Product | undefined {
    return products.get(id);
  },

  findBySku(sku: string): Product | undefined {
    return [...products.values()].find((product) => product.sku === sku);
  },

  list(): Product[] {
    return [...products.values()].sort((a, b) => a.sku.localeCompare(b.sku));
  },

  clear(): void {
    products.clear();
  }
};
