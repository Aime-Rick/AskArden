import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { runWorkflow } from "./openai-agent";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to send a message and get a response from the agent
  app.post("/api/messages", async (req, res) => {
    try {
      const { content, sessionId } = req.body;

      if (!content || !sessionId) {
        return res.status(400).json({ error: "Content and sessionId are required" });
      }

      // Get previous conversation history for context
      const previousMessages = await storage.getMessagesBySession(sessionId);
      const conversationHistory = previousMessages.map((msg) => ({
        role: (msg.isUser === "true" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content
      }));

      // Save user message
      const userMessage = await storage.createMessage({
        content,
        isUser: "true",
        sessionId,
      });

      // Get response from OpenAI agent with conversation history
      const agentResponse = await runWorkflow({ 
        input_as_text: content,
        conversationHistory 
      });

      // Save bot response
      const botMessage = await storage.createMessage({
        content: agentResponse,
        isUser: "false",
        sessionId,
      });

      res.json({
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          isUser: true,
          timestamp: userMessage.timestamp.toISOString(),
        },
        botMessage: {
          id: botMessage.id,
          content: botMessage.content,
          isUser: false,
          timestamp: botMessage.timestamp.toISOString(),
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ 
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get message history for a session
  app.get("/api/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySession(sessionId);

      res.json(
        messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.isUser === "true",
          timestamp: msg.timestamp.toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
