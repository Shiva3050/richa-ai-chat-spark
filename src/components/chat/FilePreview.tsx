
import { PaperclipIcon } from "lucide-react";
import { FilePreviewProps } from "@/types/chat";

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    return (
      <div className="relative group">
        <img 
          src={url} 
          alt="Uploaded image" 
          className="max-h-32 rounded-md object-contain"
          onLoad={() => URL.revokeObjectURL(url)}
        />
        {onRemove && (
          <button
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            &times;
          </button>
        )}
      </div>
    );
  }
  
  if (file.type.startsWith('video/')) {
    const url = URL.createObjectURL(file);
    return (
      <div className="relative group">
        <video 
          src={url} 
          controls
          className="max-h-32 rounded-md"
          onLoadedData={() => URL.revokeObjectURL(url)}
        />
        {onRemove && (
          <button
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            &times;
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="relative group">
      <div className="flex items-center gap-2 rounded-md bg-gray-100 p-2 dark:bg-gray-800">
        <PaperclipIcon className="h-4 w-4" />
        <span className="text-xs">{file.name}</span>
      </div>
      {onRemove && (
        <button
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          &times;
        </button>
      )}
    </div>
  );
}
