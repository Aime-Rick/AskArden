import { cn } from "@/lib/utils";
import logoUrl from "@assets/Ask Arden_1763380877872.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div 
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${isUser ? 'user' : 'bot'}`}
    >
      {!isUser && (
        <img 
          src={logoUrl} 
          alt="Ask Arden" 
          className="w-8 h-8 rounded-full flex-shrink-0"
          data-testid="img-bot-avatar"
        />
      )}
      <div 
        className={cn(
          "max-w-[75%] rounded-lg p-4 border-l-[3px]",
          isUser 
            ? "bg-accent text-accent-foreground border-l-transparent" 
            : "bg-card text-card-foreground !border-l-primary"
        )}
      >
        <div className="text-[15px] leading-relaxed" data-testid="text-message">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3">{children}</pre>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                h1: ({ children }) => <h1 className="text-xl font-semibold mb-2 mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic my-3">{children}</blockquote>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2" data-testid="text-timestamp">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
