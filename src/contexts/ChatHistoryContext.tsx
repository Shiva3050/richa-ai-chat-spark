
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  role: "user" | "ai";
  content: string;
  files?: File[];
}

interface ChatHistoryContextType {
  chats: Chat[];
  currentChatId: string | null;
  createNewChat: () => void;
  setCurrentChatId: (id: string) => void;
  addMessageToCurrentChat: (message: Message) => void;
  updateChatTitle: (id: string, title: string) => void;
  deleteChat: (id: string) => void;
  getCurrentChat: () => Chat | undefined;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert string dates back to Date objects
        const processedChats = parsedChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt)
        }));
        setChats(processedChats);
        
        // Set the most recent chat as current if available
        if (processedChats.length > 0 && !currentChatId) {
          setCurrentChatId(processedChats[0].id);
        }
      } catch (error) {
        console.error('Error parsing saved chats:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chats));
  }, [chats]);

  // Create a new chat
  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{ 
        role: "ai", 
        content: "Hi, I'm RICHA-AI your personal AI assistant specially made by your love Shiva." 
      }],
      createdAt: new Date()
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  // Add a message to the current chat
  const addMessageToCurrentChat = (message: Message) => {
    if (!currentChatId) {
      createNewChat();
      setChats(prev => {
        const updatedChats = [...prev];
        if (updatedChats[0]) {
          updatedChats[0].messages.push(message);
          // Generate title from first user message if it's a user message
          if (message.role === 'user' && updatedChats[0].title === 'New Chat') {
            updatedChats[0].title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
          }
        }
        return updatedChats;
      });
      return;
    }

    setChats(prev => {
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(chat => chat.id === currentChatId);
      
      if (chatIndex !== -1) {
        updatedChats[chatIndex].messages.push(message);
        
        // Update title based on first user message if still default
        if (message.role === 'user' && updatedChats[chatIndex].title === 'New Chat') {
          updatedChats[chatIndex].title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
      }
      
      return updatedChats;
    });
  };

  // Update a chat's title
  const updateChatTitle = (id: string, title: string) => {
    setChats(prev => {
      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(chat => chat.id === id);
      
      if (chatIndex !== -1) {
        updatedChats[chatIndex].title = title;
      }
      
      return updatedChats;
    });
  };

  // Delete a chat
  const deleteChat = (id: string) => {
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== id);
      
      // If we're deleting the current chat, set current to the most recent one
      if (id === currentChatId && updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id);
      } else if (updatedChats.length === 0) {
        setCurrentChatId(null);
      }
      
      return updatedChats;
    });
  };

  // Get the current chat
  const getCurrentChat = () => {
    return chats.find(chat => chat.id === currentChatId);
  };

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        currentChatId,
        createNewChat,
        setCurrentChatId,
        addMessageToCurrentChat,
        updateChatTitle,
        deleteChat,
        getCurrentChat
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
