
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageListProps, MessageProps } from "@/types/chat";
import { FilePreview } from "./FilePreview";

function Message({ message }: MessageProps) {
  const isAi = message.role === "ai";
  
  return (
    <div className={cn("flex", isAi ? "justify-start" : "justify-end")}>
      <div className="flex items-start max-w-[90%] md:max-w-[80%] gap-2">
        {isAi && (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="text-white w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.files.map((file, fileIndex) => (
                <div key={`file-${fileIndex}`} className="flex flex-col hover:scale-105 transition-transform">
                  <FilePreview file={file} />
                </div>
              ))}
            </div>
          )}
          <div 
            className={cn(
              "px-4 py-2.5 rounded-2xl",
              isAi 
                ? "bg-gray-200 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
                : "bg-purple-600 text-white rounded-br-none"
            )}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
        {!isAi && (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
            <User className="text-gray-700 dark:text-gray-300 w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
      {messages.map((message, index) => (
        <Message key={index} message={message} />
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
    </div>
  );
}
