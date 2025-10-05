import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { jwtAuth, generateToken, type JWTPayload } from "./auth";
import { sendMail, sendAPIKeyEmail } from "./mailer";
import { apiKeyManager } from "./api-keys";
import { monitoring } from "./monitoring";
import { insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Monitoring middleware - track all requests
  app.use((req, res, next) => {
    monitoring.recordRequest();

    // Track response for errors
    const originalSend = res.send;
    res.send = function(data) {
      // Check for error status codes
      if (res.statusCode >= 400) {
        monitoring.recordError(res.statusCode);
      }
      return originalSend.call(this, data);
    };

    next();
  });

  // Periodic error rate checking
  setInterval(() => {
    monitoring.checkErrorRate();
  }, 60000); // Check every minute
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

  // API Key Routes

  // Generate new API key
  app.post("/api/keys", jwtAuth, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { expiresInHours = 24 } = req.body;

      const keyData = apiKeyManager.generateKey(user.email, expiresInHours);

      // Send email with the API key
      await sendAPIKeyEmail({
        to: user.email,
        subject: 'Your New API Key - Todo API',
        apiKey: keyData.key,
        expiresIn: expiresInHours * 3600, // convert to seconds
        userName: user.email.split('@')[0] // simple name extraction
      });

      // Return the key data (without the actual key for security)
      res.status(201).json({
        id: keyData.id,
        createdAt: keyData.createdAt,
        expiresAt: keyData.expiresAt,
        message: "API key generated and sent via email"
      });
    } catch (error) {
      console.error("Error generating API key:", error);
      res.status(500).json({ error: "Failed to generate API key" });
    }
  });

  // List user's API keys
  app.get("/api/keys", jwtAuth, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const userKeys = apiKeyManager.getUserKeys(user.email);

      // Return keys without the actual key value (security)
      const safeKeys = userKeys.map(key => ({
        id: key.id,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        usageCount: key.usageCount
      }));

      res.json(safeKeys);
    } catch (error) {
      console.error("Error retrieving API keys:", error);
      res.status(500).json({ error: "Failed to retrieve API keys" });
    }
  });

  // Revoke API key
  app.delete("/api/keys/:keyId", jwtAuth, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;
      const { keyId } = req.params;

      // Find the key to ensure it belongs to the user
      const keyData = apiKeyManager.getKeyById(keyId);
      if (!keyData || keyData.userEmail !== user.email) {
        return res.status(404).json({ error: "API key not found" });
      }

      // Revoke the key (we revoke by hashed key)
      const revoked = apiKeyManager.revokeKey(keyData.hashedKey);
      if (revoked) {
        res.json({ message: "API key revoked successfully" });
      } else {
        res.status(500).json({ error: "Failed to revoke API key" });
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  });

  // Validate API key (for API authentication)
  app.post("/api/auth/validate-key", async (req, res) => {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        monitoring.recordError(400);
        return res.status(400).json({ error: "API key required" });
      }

      // Hash the provided key for lookup
      const hashedKey = require('crypto').createHash('sha256').update(apiKey).digest('hex');
      const keyData = apiKeyManager.validateKey(hashedKey);

      if (keyData) {
        res.json({
          valid: true,
          user: keyData.userEmail,
          expiresAt: keyData.expiresAt
        });
      } else {
        // Record authentication failure
        monitoring.recordError(401);

        // Check if this might be an expired key
        const allKeys = apiKeyManager.getUserKeys(''); // Get all keys (simplified)
        const expiredKey = allKeys.find(k => k.hashedKey === hashedKey && k.expiresAt < new Date());
        if (expiredKey) {
          monitoring.recordExpiredKey(expiredKey.id);
        }

        res.status(401).json({ valid: false, error: "Invalid or expired API key" });
      }
    } catch (error) {
      monitoring.recordError(500);
      console.error("Error validating API key:", error);
      res.status(500).json({ error: "Failed to validate API key" });
    }
  });

  // Monitoring endpoints (protected)
  app.get("/api/monitoring/metrics", jwtAuth, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;

      // Basic admin check (in production, check for admin role)
      if (!user.email.includes('admin') && !user.email.includes('monitor')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const metrics = monitoring.getMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error retrieving metrics:", error);
      res.status(500).json({ error: "Failed to retrieve metrics" });
    }
  });

  // Reset metrics (admin only)
  app.post("/api/monitoring/reset", jwtAuth, async (req, res) => {
    try {
      const user = (req as any).user as JWTPayload;

      // Admin check
      if (!user.email.includes('admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      monitoring.resetMetrics();
      res.json({ message: "Metrics reset successfully" });
    } catch (error) {
      console.error("Error resetting metrics:", error);
      res.status(500).json({ error: "Failed to reset metrics" });
    }
  });

  // Alert webhook endpoint (for external monitoring systems)
  app.post("/api/monitoring/webhook", async (req, res) => {
    try {
      const { type, message, data } = req.body;

      console.log(`📤 Webhook Alert: ${type} - ${message}`, data);

      // In production, validate webhook signature
      // and route to appropriate alerting system

      res.json({ received: true, type, message });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
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
