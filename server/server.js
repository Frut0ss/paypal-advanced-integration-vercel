import "dotenv/config";
  import express from "express";
  import { fileURLToPath } from "url";
  import path from "path";
  import * as paypal from "./paypal-api.js";
   
  const base = "https://api-m.sandbox.paypal.com";
  // Convert file URL to file path
  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
 
   
  app.set("view engine", "ejs");
  app.set("views", "./views");
  
   
  // Host static files
  const clientPath = path.join(__dirname, "../client");
  app.use(express.static(clientPath));
   
  // Middleware to parse JSON requests
  app.use(express.json());
   
  app.post("/api/orders", async (req, res) => {
    try {
      const { task, saveCard, vaultID } = req.body;
      const order = await paypal.createOrder(task, saveCard, vaultID);
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });
   
  app.get("/api/orders/:orderID", async (req, res) => {
    const { orderID } = req.params; // Ensure orderID is defined here
    try {
      const orderDetails = await paypal.getOrderDetails(orderID);
      res.json(orderDetails);
    } catch (error) {
      console.error(
        `Error fetching order details for ${orderID}:`,
        error.message
      );
      res
        .status(500)
        .json({ error: `Failed to get order details: ${error.message}` });
    }
  });
   
  // Capture payment
  app.post("/api/orders/:orderID/capture", async (req, res) => {
    try {
      const { orderID } = req.params;
      const captureData = await paypal.capturePayment(orderID);
      res.json(captureData);
    } catch (error) {
      res.status(500).json({ error: "Failed to capture payment" });
    }
  });
   
  app.get("/", async (req, res) => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
   
    res.render("checkout", {
      clientId,
    });
  });

  app.listen(8888, () => {
    console.log("Listening on http://localhost:8888/");
  });
   