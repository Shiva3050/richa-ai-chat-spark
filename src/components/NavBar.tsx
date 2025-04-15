
import { Sparkles, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { ApiKeySetup } from "./ApiKeySetup";
import { useState, useEffect } from "react";
import { getApiKey } from "@/utils/deepseek";

export function NavBar() {
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    // Check if API key is already set on component mount
    const key = getApiKey();
    setIsApiKeySet(!!key);
  }, []);

  const handleApiKeySet = (isSet: boolean) => {
    setIsApiKeySet(isSet);
    console.log("API key set:", isSet);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl gradient-text">RICHA-AI</span>
        </div>
        
        <div className="flex-1" />
        
        <nav className="flex items-center gap-4">
          <ApiKeySetup onApiKeySet={handleApiKeySet} />
          <a 
            href="https://github.com/your-username/richa-ai-chat" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
