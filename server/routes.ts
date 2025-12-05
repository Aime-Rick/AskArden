import type { Express } from "express";
import { createServer, type Server } from "http";
import { runWorkflow } from "./openai-agent";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get agent response (client handles message storage)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get response from OpenAI agent
      const agentResponse = await runWorkflow({ 
        input_as_text: message
      });

      res.json({ response: agentResponse });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ 
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
