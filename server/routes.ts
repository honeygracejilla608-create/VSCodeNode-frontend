import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { jwtAuth, generateToken, type JWTPayload } from "./auth";
import { sendMail } from "./mailer";
import { insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Public endpoint for health check
  app.get("/", (req, res) => {
    res.send("Todo API – JWT protected");
  });

  // Generate a test token (development only)
  app.post("/api/generate-token", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    const token = generateToken(email);
    res.json({ token, email });
  });

  // Protected routes
  app.get("/api/tasks", jwtAuth, async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve tasks" });
    }
  });

  app.post("/api/tasks", jwtAuth, async (req, res) => {
    try {
      const validation = insertTaskSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid task data",
          details: validation.error.errors 
        });
      }

      const user = (req as any).user as JWTPayload;
      const task = await storage.createTask({
        ...validation.data,
        user: user.email,
      });

      // Send email notification
      await sendMail({
        to: user.email,
        subject: `New task created: ${task.title}`,
        text: `You just added a new task:\n\n${task.title}\n\n${task.description || ""}`,
      });

      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
