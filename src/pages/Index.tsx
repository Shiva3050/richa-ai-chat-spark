
import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import Chat from "@/components/Chat";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatHistory } from "@/contexts/ChatHistoryContext";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { createNewChat, currentChatId } = useChatHistory();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col relative">
          {/* Mobile sidebar toggle and new chat button */}
          <div className="flex items-center justify-between p-2 md:hidden border-b dark:border-gray-800">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={createNewChat}
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>
          
          {/* Empty state when no chat is selected */}
          {!currentChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="max-w-md text-center">
                <h2 className="text-2xl font-semibold mb-2">Welcome to RICHA-AI!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start a new conversation and discover the power of AI.
                </p>
                <Button 
                  onClick={createNewChat}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New chat
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <Chat />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
