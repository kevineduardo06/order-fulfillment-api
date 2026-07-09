import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { inventoryService } from "./modules/inventory/inventoryService.js";
import { orderService } from "./modules/orders/orderService.js";
import type { OrderStatus } from "./modules/orders/orderTypes.js";
import { productRepository } from "./modules/products/productRepository.js";
import { reportService } from "./modules/reports/reportService.js";
import { shipmentService } from "./modules/shipments/shipmentService.js";
import { HttpError } from "./shared/errors.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().positive()
});

app.post("/products", (req, res) => {
  const input = productSchema.parse(req.body);
  const existing = productRepository.findBySku(input.sku);
  if (existing) {
    throw new HttpError(409, "SKU already exists");
  }
  res.status(201).json(productRepository.create(input));
});

app.get("/products", (_req, res) => {
  res.json(productRepository.list());
});

const receiveInventorySchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive()
});

app.post("/inventory/receive", (req, res) => {
  const input = receiveInventorySchema.parse(req.body);
  res.status(201).json(inventoryService.receive(input.productId, input.quantity));
});

app.get("/inventory/:productId", (req, res) => {
  res.json(inventoryService.get(req.params.productId));
});

const orderSchema = z.object({
  customerId: z.string().min(1),
  lines: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1)
});

app.post("/orders", (req, res) => {
  const input = orderSchema.parse(req.body);
  res.status(201).json(orderService.create(input));
});

app.get("/orders", (req, res) => {
  const status = req.query.status as OrderStatus | undefined;
  res.json(orderService.list(status));
});

app.get("/orders/:id", (req, res) => {
  res.json(orderService.get(req.params.id));
});

app.post("/orders/:id/pay", (req, res) => {
  res.json(orderService.markPaid(req.params.id));
});

app.post("/orders/:id/cancel", (req, res) => {
  res.json(orderService.cancel(req.params.id));
});

const shipmentSchema = z.object({
  orderId: z.string().min(1),
  carrier: z.string().min(1)
});

app.post("/shipments", (req, res) => {
  const input = shipmentSchema.parse(req.body);
  res.status(201).json(shipmentService.create(input.orderId, input.carrier));
});

app.get("/shipments", (_req, res) => {
  res.json(shipmentService.list());
});

const dispatchSchema = z.object({ trackingCode: z.string().min(1) });

app.post("/shipments/:id/dispatch", (req, res) => {
  const input = dispatchSchema.parse(req.body);
  res.json(shipmentService.dispatch(req.params.id, input.trackingCode));
});

app.get("/reports/inventory", (_req, res) => {
  res.json(reportService.inventory());
});

app.get("/reports/revenue", (_req, res) => {
  res.json(reportService.revenue());
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res.status(400).json({ message: "Invalid request", details: error.flatten() });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
});
