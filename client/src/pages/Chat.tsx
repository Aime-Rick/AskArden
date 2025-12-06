import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import ChatHeader from "@/components/ChatHeader";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestedQuestions from "@/components/SuggestedQuestions";
import ChatInput from "@/components/ChatInput";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface AgentResponse {
  response: string;
}

const STORAGE_KEY = 'askArdenMessages';

// Load messages from sessionStorage
const loadMessages = (): Message[] => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading messages from sessionStorage:', error);
    return [];
  }
};

// Save messages to sessionStorage
const saveMessages = (messages: Message[]) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages to sessionStorage:', error);
  }
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, history }: { content: string; history: Message[] }) => {
      // Get last 10 interactions (20 messages)
      const recentHistory = history.slice(-20).map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: content,
          history: recentHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get agent response");
      }
      
      return await response.json() as AgentResponse;
    },
    onSuccess: (data, userContent) => {
      // Add bot message with agent response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: (error) => {
      // Remove failed optimistic user message
      setMessages((prev) => prev.slice(0, -1));
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    },
  });

  const handleSendMessage = (text: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Get agent response with conversation history
    sendMessageMutation.mutate({ 
      content: text, 
      history: messages // Send history before adding the new message
    });
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto py-6">
          {messages.length === 0 ? (
            <SuggestedQuestions onQuestionClick={handleQuestionClick} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={formatTime(message.timestamp)}
                />
              ))}
              {sendMessageMutation.isPending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={sendMessageMutation.isPending} 
      />
    </div>
  );
}
