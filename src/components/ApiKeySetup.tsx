import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getApiKey, setApiKey } from "@/utils/gemini";
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

    setError("");
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
            Enter your Gemini API key to use RICHA-AI. The default key is already set, but you can use your own key if you prefer.
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
