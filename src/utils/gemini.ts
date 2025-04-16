
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize with your API key
let API_KEY = "AIzaSyCCxWRR-QldIoww1SBdTy6Ohs0P1BU9HdE"; 

// Function to set the API key
export const setApiKey = (key: string) => {
  API_KEY = key;
  localStorage.setItem("gemini-api-key", key);
  return true;
};

// Function to get the API key
export const getApiKey = (): string => {
  // Try to get the API key from memory first
  if (API_KEY) return API_KEY;
  
  // Otherwise, try to get it from localStorage
  const storedKey = localStorage.getItem("gemini-api-key");
  if (storedKey) {
    API_KEY = storedKey;
    return storedKey;
  }
  
  return "";
};

// Initialize the Gemini API client
const getGeminiClient = () => {
  return new GoogleGenerativeAI(API_KEY);
};

// Safety settings for the Gemini API
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Function to send text messages to Gemini API
export const sendTextMessage = async (messages: { role: string; content: string }[]) => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const chatSession = model.startChat({
      history: messages.filter((_, index) => index !== messages.length - 1).map(msg => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings,
    });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chatSession.sendMessage(lastMessage.content);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

// Function to convert file to generative part for multimodal
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { 
      data: await base64EncodedDataPromise as string,
      mimeType: file.type
    },
  };
};

// Function to handle multimodal messages (text + images)
export const sendMultiModalMessage = async (
  messages: { role: string; content: string }[], 
  files: File[]
) => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const lastMessage = messages[messages.length - 1];
    const fileParts = await Promise.all(files.map(fileToGenerativePart));
    
    const prompt = [
      ...fileParts,
      { text: lastMessage.content },
    ];
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: prompt }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings,
    });
    
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error sending multimodal message to Gemini:", error);
    throw error;
  }
};
