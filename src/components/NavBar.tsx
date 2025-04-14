
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl gradient-text">RICHA-AI</span>
        </div>
        
        <div className="flex-1" />
        
        <nav className="flex items-center gap-2">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
