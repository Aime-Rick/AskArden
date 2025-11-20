import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

interface MessageResponse {
  userMessage: Message;
  botMessage: Message;
}

// Get or create session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('askArdenSessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('askArdenSessionId', sessionId);
  }
  return sessionId;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(getSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load message history on mount
  const { data: historyData } = useQuery({
    queryKey: ['/api/messages', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load message history');
      }
      return await response.json() as Message[];
    },
  });

  // Update messages when history is loaded
  useEffect(() => {
    if (historyData) {
      setMessages(historyData);
    }
  }, [historyData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return await response.json() as MessageResponse;
    },
    onSuccess: (data) => {
      // Remove the optimistic user message and add real messages from server
      setMessages((prev) => {
        const withoutTemp = prev.filter(msg => !msg.id.startsWith('temp-'));
        return [...withoutTemp, data.userMessage, data.botMessage];
      });
    },
    onError: (error) => {
      // Remove failed optimistic message
      setMessages((prev) => prev.filter(msg => !msg.id.startsWith('temp-')));
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    },
  });

  const handleSendMessage = (text: string) => {
    // Optimistically add user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Send to backend
    sendMessageMutation.mutate(text);
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
