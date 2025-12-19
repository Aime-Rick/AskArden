import { useState, useRef, useEffect } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  messages?: Message[];
}

export default function ChatInput({ onSendMessage, disabled = false, messages = [] }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleHRTicket = () => {
    const conversationHistory = messages
      .map((msg, index) => {
        const role = msg.isUser ? "You" : "AskArden AI";
        return `${index + 1}. ${role}:\n${msg.content}\n`;
      })
      .join("\n");

    const emailSubject = "HR Inquiry";
    const emailBody = `Hello HR Team,\n\nI have a question that requires additional assistance.\n\nConversation History:\n${conversationHistory}\n\nThank you for your help.`;

    const mailtoLink = `mailto:AskHR@spiceworldinc.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your question..."
            className="resize-none min-h-[44px] max-h-[120px] text-[15px] focus-visible:ring-primary"
            disabled={disabled}
            data-testid="input-message"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-accent hover:bg-accent text-accent-foreground flex-shrink-0"
            disabled={!message.trim() || disabled}
            data-testid="button-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        <div className="mt-3 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleHRTicket}
            className="text-sm gap-2"
            disabled={messages.length === 0}
          >
            <Mail className="w-4 h-4" />
            Still have questions? Submit a ticket to HR
          </Button>
        </div>
      </div>
    </div>
  );
}
