
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getApiKey, setApiKey } from "@/utils/deepseek";
import { useToast } from "@/hooks/use-toast";

interface ApiKeySetupProps {
  onApiKeySet: (isSet: boolean) => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKeyState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is already set
    const key = getApiKey();
    if (key) {
      setApiKeyState(key);
      onApiKeySet(true);
    } else {
      setIsOpen(true);
    }
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    setApiKey(apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
    setIsOpen(false);
    onApiKeySet(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {getApiKey() ? "Change API Key" : "Set API Key"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set DeepSeek API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter your DeepSeek API key to use RICHA-AI. You can get an API key from{" "}
            <a
              href="https://platform.deepseek.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              DeepSeek Platform
            </a>
          </p>
          <Input
            placeholder="Enter your DeepSeek API key"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
          />
          <Button onClick={handleSaveApiKey} className="w-full">
            Save API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
