import type { Express } from "express";
import { createServer, type Server } from "node:http";
import express from "express";
import cors from "cors";

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. Fix CORS (allows your frontend at :8081 to talk to your backend at :5000)
  app.use(cors());

  // 2. Middleware to read JSON
  app.use(express.json());

  // 3. The Add Pet Route
  app.post("/api/pets", async (req, res) => {
    try {
      const { name, species, breed, age } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Pet name is required" });
      }

      console.log("Successfully received pet on server:", req.body);

      // Send back a success response
      res.status(201).json({
        message: "Pet added successfully!",
        pet: { name, species, breed, age, id: Date.now() }
      });
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}