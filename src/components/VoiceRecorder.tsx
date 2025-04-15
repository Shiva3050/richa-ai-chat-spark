
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isLoading: boolean;
}

type SpeechRecognitionType = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export function VoiceRecorder({ onTranscription, isLoading }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setRecognizing(true);
      };
      
      recognitionRef.current.onend = () => {
        setRecognizing(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          onTranscription(finalTranscript);
          stopRecording();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Error",
          description: `Speech recognition failed: ${event.error}`,
          variant: "destructive",
        });
        setIsRecording(false);
        setRecognizing(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription, toast]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Error",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive",
      });
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak now...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button 
      type="button"
      variant="ghost" 
      size="icon" 
      onClick={toggleRecording}
      disabled={isLoading}
      className={cn(
        "rounded-full w-8 h-8",
        isRecording ? "text-red-500" : "text-gray-500"
      )}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : recognizing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
