
import { useState, useRef } from "react";
import { Send, Loader2, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { VoiceRecorder } from "../VoiceRecorder";
import { FilePreview } from "./FilePreview";
import { MessageInputProps } from "@/types/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function MessageInput({ onSubmit, isLoading, hasApiKey }: MessageInputProps) {
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
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
    
    onSubmit(input.trim(), selectedFiles);
    setInput("");
    setSelectedFiles([]);
  };

  const handleVoiceInput = (text: string) => {
    setInput(prev => prev + " " + text);
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  return (
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
        <FileUploadButton onFilesSelected={handleFilesSelected} />
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
      
      {selectedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <FilePreview
                key={`preview-${index}`}
                file={file}
                onRemove={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
              />
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

function FileUploadButton({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
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

      <input
        type="file"
        id="image-upload"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
      />
      <input
        type="file"
        id="document-upload"
        className="hidden"
        accept=".pdf,.txt,.doc,.docx"
        multiple
        onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
      />
      <input
        type="file"
        id="video-upload"
        className="hidden"
        accept="video/*"
        multiple
        onChange={(e) => onFilesSelected(Array.from(e.target.files || []))}
      />
    </>
  );
}
