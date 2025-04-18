
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendTextMessage, sendMultiModalMessage, getApiKey } from "@/utils/gemini";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";

export default function Chat() {
  const { getCurrentChat, addMessageToCurrentChat } = useChatHistory();
  const [isLoading, setIsLoading] = useState(false);
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
    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  const handleSubmit = async (content: string, files: File[]) => {
    const userMessage = { 
      role: "user", 
      content,
      files: files.length > 0 ? [...files] : undefined
    };
    
    addMessageToCurrentChat(userMessage);
    setIsLoading(true);
    
    try {
      let response;
      const allMessages = [...messages, userMessage];
      
      if (files.length > 0) {
        const mediaFiles = files.filter(
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

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <MessageList messages={messages} isLoading={isLoading} />
      <div ref={messagesEndRef} />
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <MessageInput 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          hasApiKey={hasApiKey}
        />
      </div>
    </div>
  );
}
