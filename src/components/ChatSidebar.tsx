
import { useState } from "react";
import { Plus, MessageSquare, Trash2, PenLine, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatHistory } from "@/contexts/ChatHistoryContext";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Separator } from "@/components/ui/separator";

interface ChatSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function ChatSidebar({ isOpen, setIsOpen }: ChatSidebarProps) {
  const { 
    chats, 
    currentChatId, 
    createNewChat, 
    setCurrentChatId, 
    updateChatTitle,
    deleteChat 
  } = useChatHistory();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleCreateNewChat = () => {
    createNewChat();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleEditChat = (id: string, currentTitle: string) => {
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    updateChatTitle(id, editTitle);
    setEditingChatId(null);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const chatDate = new Date(date);
    
    if (chatDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return chatDate.toLocaleDateString();
    }
  };

  // Group chats by date
  const groupedChats = chats.reduce<Record<string, typeof chats>>((acc, chat) => {
    const dateKey = formatDate(new Date(chat.createdAt));
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(chat);
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-300 ease-in-out",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && isOpen && "shadow-xl"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">RICHA-AI</h2>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Button
          className="mx-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600"
          onClick={handleCreateNewChat}
        >
          <Plus className="h-4 w-4" />
          <span>New chat</span>
        </Button>

        <div className="mt-4 flex-1 overflow-y-auto px-2">
          {Object.entries(groupedChats).map(([date, dateChats]) => (
            <div key={date} className="mb-2">
              <div className="mb-2 px-2">
                <span className="text-xs text-gray-400">{date}</span>
              </div>
              {dateChats.map((chat) => (
                <div key={chat.id} className="mb-1">
                  {editingChatId === chat.id ? (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveEdit(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(chat.id);
                        }}
                        autoFocus
                        className="flex-1 bg-transparent text-sm outline-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveEdit(chat.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex cursor-pointer items-center justify-between rounded-lg p-2 text-sm",
                        currentChatId === chat.id
                          ? "bg-gray-700"
                          : "hover:bg-gray-800"
                      )}
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="truncate">{chat.title}</span>
                      </div>
                      <div className="invisible flex gap-1 group-hover:visible">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChat(chat.id, chat.title);
                          }}
                        >
                          <PenLine className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-gray-800 p-4">
          <div className="text-xs text-gray-400">
            RICHA-AI - Made with ❤️ by Shiva
          </div>
        </div>
      </div>
    </div>
  );
}

import { Check } from "lucide-react";
