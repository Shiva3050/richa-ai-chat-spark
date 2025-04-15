import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "./VoiceRecorder";
import { FileUpload } from "./FileUpload";
import { sendTextMessage, sendMultiModalMessage, getApiKey } from "@/utils/gemini";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: "user" | "ai";
  content: string;
  files?: File[];
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "ai", 
      content: "Hi, I'm RICHA-AI your personal AI assistant specially made by your love Shiva." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setHasApiKey(!!getApiKey());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasApiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key first",
        variant: "destructive",
      });
      return;
    }
    
    if (!input.trim() && selectedFiles.length === 0) return;
    
    const userMessage = input.trim();
    const userMessageObj: Message = { 
      role: "user", 
      content: userMessage,
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    setInput("");
    setIsLoading(true);
    
    try {
      let response;
      
      if (selectedFiles.length > 0) {
        const mediaFiles = selectedFiles.filter(
          file => file.type.startsWith('image/') || file.type.startsWith('video/')
        );
        
        if (mediaFiles.length > 0) {
          response = await sendMultiModalMessage([...messages, userMessageObj], mediaFiles);
        } else {
          response = await sendTextMessage([...messages, userMessageObj]);
        }
      } else {
        response = await sendTextMessage([...messages, userMessageObj]);
      }
      
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
      
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to get response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    setInput(prev => prev + " " + text);
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return (
        <img 
          src={url} 
          alt="Uploaded image" 
          className="max-h-40 rounded-md object-contain"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      return (
        <video 
          src={url} 
          controls
          className="max-h-40 rounded-md"
          onLoadedData={() => URL.revokeObjectURL(url)}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
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
                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <Bot className="text-ai-foreground w-5 h-5" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {message.files && message.files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {message.files.map((file, fileIndex) => (
                      <div key={`file-${index}-${fileIndex}`} className="flex flex-col hover:scale-105 transition-transform">
                        {renderFilePreview(file)}
                      </div>
                    ))}
                  </div>
                )}
                <div 
                  className={cn(
                    "transition-all duration-200 ease-in-out",
                    message.role === "user" 
                      ? "chat-bubble-user hover:shadow-lg transform hover:-translate-y-0.5" 
                      : "chat-bubble-ai hover:shadow-lg transform hover:-translate-y-0.5"
                  )}
                >
                  {message.content}
                </div>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <User className="text-primary-foreground w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%] gap-2">
              <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center animate-pulse-light shadow-lg">
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
      
      <div className="border-t p-4 space-y-4 bg-background/50 backdrop-blur-sm">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={`file-${index}`} className="flex flex-col hover:scale-105 transition-transform">
                {renderFilePreview(file)}
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-24 resize-none rounded-xl transition-shadow duration-200 focus:shadow-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
              className="rounded-xl transition-transform hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl transition-transform hover:scale-105"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => document.getElementById('image-upload')?.click()}>
                    Images
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('document-upload')?.click()}>
                    Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('video-upload')?.click()}>
                    Videos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <VoiceRecorder onTranscription={handleVoiceInput} isLoading={isLoading} />
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
              />
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
                multiple
                onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
              />
              <input
                type="file"
                id="video-upload"
                className="hidden"
                accept="video/*"
                multiple
                onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
