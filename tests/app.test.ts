import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import { resetState } from "./testState.js";

describe("order fulfillment API", () => {
  beforeEach(() => resetState());

  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("creates a product, receives inventory, creates an order, pays it, and ships it", async () => {
    const productResponse = await request(app).post("/products").send({
      sku: "SKU-API-1",
      name: "API Product",
      priceCents: 10000
    });
    expect(productResponse.status).toBe(201);

    const receiveResponse = await request(app).post("/inventory/receive").send({
      productId: productResponse.body.id,
      quantity: 10
    });
    expect(receiveResponse.status).toBe(201);
    expect(receiveResponse.body.available).toBe(10);

    const orderResponse = await request(app).post("/orders").send({
      customerId: "customer-api",
      lines: [{ productId: productResponse.body.id, quantity: 3 }]
    });
    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body.totalCents).toBe(30000);

    const paidResponse = await request(app).post(`/orders/${orderResponse.body.id}/pay`).send();
    expect(paidResponse.status).toBe(200);
    expect(paidResponse.body.status).toBe("paid");

    const shipmentResponse = await request(app).post("/shipments").send({
      orderId: orderResponse.body.id,
      carrier: "DHL"
    });
    expect(shipmentResponse.status).toBe(201);

    const inventoryResponse = await request(app).get(`/inventory/${productResponse.body.id}`);
    expect(inventoryResponse.body).toMatchObject({ onHand: 7, reserved: 0, available: 7 });
  });

  it("returns inventory and revenue reports", async () => {
    const productResponse = await request(app).post("/products").send({
      sku: "SKU-REPORT",
      name: "Report Product",
      priceCents: 2500
    });
    await request(app).post("/inventory/receive").send({ productId: productResponse.body.id, quantity: 5 });
    const orderResponse = await request(app).post("/orders").send({
      customerId: "customer-report",
      lines: [{ productId: productResponse.body.id, quantity: 2 }]
    });
    await request(app).post(`/orders/${orderResponse.body.id}/pay`).send();

    const inventoryReport = await request(app).get("/reports/inventory");
    const revenueReport = await request(app).get("/reports/revenue");

    expect(inventoryReport.status).toBe(200);
    expect(inventoryReport.body[0]).toMatchObject({ sku: "SKU-REPORT", onHand: 5, reserved: 2, available: 3 });
    expect(revenueReport.body).toMatchObject({ totalOrders: 1, paidOrders: 1, grossRevenueCents: 5000 });
  });
});
