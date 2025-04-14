
import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

// This is just for demo purposes, in a real app we would call an actual API
const demoResponses = [
  "Hello there! How can I assist you today?",
  "That's an interesting question. Let me think about that...",
  "I'm RICHA-AI, designed to help with a wide range of topics!",
  "I don't have personal experiences, but I can provide information on that topic.",
  "Let me search for more information on that for you...",
  "That's a great question! Here's what I know about it...",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi, I'm RICHA-AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate API call with a random response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would call the actual LLM API here
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      setMessages((prev) => [...prev, { role: "ai", content: randomResponse }]);
    } catch (error) {
      console.error("Failed to get response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              "flex", 
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex items-start max-w-[80%] gap-2">
              {message.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="text-ai-foreground w-5 h-5" />
                </div>
              )}
              <div 
                className={cn(
                  message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="text-primary-foreground w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%] gap-2">
              <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center animate-pulse-light">
                <Bot className="text-ai-foreground w-5 h-5" />
              </div>
              <div className="chat-bubble-ai flex space-x-2">
                <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-24 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
