import type { Express } from "express";
import { createServer, type Server } from "http";
import { runWorkflow } from "./openai-agent";

interface ChatMessage {
  content: string;
  isUser: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get agent response (client handles message storage)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Extract last 10 interactions (20 messages: 10 user + 10 bot)
      const conversationHistory: ChatMessage[] = history 
        ? history.slice(-20) 
        : [];

      // Get response from OpenAI agent with conversation history
      const agentResponse = await runWorkflow({ 
        input_as_text: message,
        history: conversationHistory
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
