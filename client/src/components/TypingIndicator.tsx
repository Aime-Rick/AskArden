import logoUrl from "@assets/Ask Arden_1763380877872.png";

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4" data-testid="typing-indicator">
      <img 
        src={logoUrl} 
        alt="Ask HR" 
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className="bg-card border-l-[3px] border-l-primary rounded-lg p-4 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
