import { useState } from 'react';
import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    setMessages([...messages, message]);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Messages envoyés :</h3>
        {messages.length === 0 ? (
          <p className="text-muted-foreground">Aucun message encore...</p>
        ) : (
          <ul className="space-y-2">
            {messages.map((msg, idx) => (
              <li key={idx} className="text-sm bg-card p-3 rounded-lg">{msg}</li>
            ))}
          </ul>
        )}
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
