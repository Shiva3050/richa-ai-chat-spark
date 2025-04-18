
import { Message } from "@/contexts/ChatHistoryContext";

export interface MessageProps {
  message: Message;
  isLoading?: boolean;
}

export interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
}

export interface MessageInputProps {
  onSubmit: (content: string, files: File[]) => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}
