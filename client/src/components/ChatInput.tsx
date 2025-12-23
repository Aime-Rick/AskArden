import { useState, useRef, useEffect } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleHRTicket = () => {
    setIsDialogOpen(true);
  };

  const handleSubmitTicket = () => {
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) {
      return;
    }

    const conversationHistory = messages
      .map((msg, index) => {
        const role = msg.isUser ? "You" : "Ask HR Assistant";
        return `${role}: ${msg.content}\n`;
      })
      .join("\n");

    const emailSubject = "HR Inquiry";
    const emailBody = `Hello HR Team,\n\nI have a question that requires additional assistance.\n\nUser Information:\nName: ${userName}\nEmail: ${userEmail}\nPhone: ${userPhone}\n\nConversation History:\n${conversationHistory}\n\nThank you for your help.`;

    const mailtoLink = `mailto:AskHR@spiceworldinc.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
    
    // Reset form and close dialog
    setIsDialogOpen(false);
    setUserName("");
    setUserEmail("");
    setUserPhone("");
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
    <>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit HR Ticket</DialogTitle>
            <DialogDescription>
              Please provide your contact information to submit your inquiry to HR.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitTicket}
              disabled={!userName.trim() || !userEmail.trim() || !userPhone.trim()}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send to HR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
