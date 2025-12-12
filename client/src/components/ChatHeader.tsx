import logoUrl from "@assets/Ask Arden_1763380877872.png";

export default function ChatHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center px-4 gap-3 z-10">
      <img 
        src={logoUrl} 
        alt="Ask HR Logo" 
        className="w-10 h-10 rounded-lg"
        data-testid="img-logo"
      />
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground" data-testid="text-title">
          Ask HR
        </h1>
        <div className="flex items-center gap-1.5" data-testid="status-online">
          <div className="w-2 h-2 rounded-full bg-status-online"></div>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </div>
    </header>
  );
}
