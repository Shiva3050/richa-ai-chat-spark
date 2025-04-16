
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getApiKey, setApiKey } from "@/utils/deepseek";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeySetupProps {
  onApiKeySet: (isSet: boolean) => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKeyState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
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
      setError("Please enter a valid API key");
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    // Clear previous errors
    setError("");
    
    // Save the API key
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
          <DialogTitle>Set Gemini API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter your Gemini API key to use RICHA-AI. You can get an API key from{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Google AI Studio
            </a>
          </p>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Input
            placeholder="Enter your Gemini API key"
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
