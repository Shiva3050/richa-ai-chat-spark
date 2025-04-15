
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { VoiceRecorder } from "./VoiceRecorder";
import { sendTextMessage, sendMultiModalMessage, getApiKey } from "@/utils/gemini";
import { useChatHistory, Message } from "@/contexts/ChatHistoryContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Chat() {
  const { getCurrentChat, addMessageToCurrentChat } = useChatHistory();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const currentChat = getCurrentChat();
  const messages = currentChat?.messages || [];
  
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
    
    const userMessage: Message = { 
      role: "user", 
      content: input.trim(),
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined
    };
    
    addMessageToCurrentChat(userMessage);
    setInput("");
    setIsLoading(true);
    
    try {
      let response;
      const allMessages = [...messages, userMessage];
      
      if (selectedFiles.length > 0) {
        const mediaFiles = selectedFiles.filter(
          file => file.type.startsWith('image/') || file.type.startsWith('video/')
        );
        
        if (mediaFiles.length > 0) {
          response = await sendMultiModalMessage(allMessages, mediaFiles);
        } else {
          response = await sendTextMessage(allMessages);
        }
      } else {
        response = await sendTextMessage(allMessages);
      }
      
      addMessageToCurrentChat({ role: "ai", content: response });
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
          className="max-h-32 rounded-md object-contain"
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
          className="max-h-32 rounded-md"
          onLoadedData={() => URL.revokeObjectURL(url)}
        />
      );
    }
    
    return (
      <div className="flex items-center gap-2 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
        <PaperclipIcon className="h-4 w-4" />
        <span className="text-xs">{file.name}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div className="flex items-start max-w-[90%] md:max-w-[80%] gap-2">
              {message.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="text-white w-5 h-5" />
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
                    "px-4 py-2.5 rounded-2xl",
                    message.role === "user" 
                      ? "bg-purple-600 text-white rounded-br-none" 
                      : "bg-gray-200 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="text-gray-700 dark:text-gray-300 w-5 h-5" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%] gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                <Bot className="text-white w-5 h-5" />
              </div>
              <div className="bg-gray-200 dark:bg-gray-800 dark:text-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={`preview-${index}`} className="relative group">
                {renderFilePreview(file)}
                <button
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2 items-end bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 shadow-lg">
          <Textarea
            placeholder="Message RICHA-AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-12 max-h-36 border-0 focus-visible:ring-0 resize-none py-3 px-4 rounded-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <div className="flex mb-2 mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-8 h-8"
                >
                  <PaperclipIcon className="h-5 w-5 text-gray-500" />
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
            
            <Button 
              type="submit" 
              size="icon"
              className="rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
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
        </form>
      </div>
    </div>
  );
}
