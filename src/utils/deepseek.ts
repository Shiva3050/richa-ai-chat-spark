
// Store API key in localStorage
let API_KEY = ""; 

// Function to set the API key
export const setApiKey = (key: string) => {
  API_KEY = key;
  localStorage.setItem("deepseek-api-key", key);
  return true;
};

// Function to get the API key
export const getApiKey = (): string => {
  // Try to get the API key from memory first
  if (API_KEY) return API_KEY;
  
  // Otherwise, try to get it from localStorage
  const storedKey = localStorage.getItem("deepseek-api-key");
  if (storedKey) {
    API_KEY = storedKey;
    return storedKey;
  }
  
  return "";
};

// Interface for message structure
interface Message {
  role: string;
  content: string;
}

// Function to send text messages to DeepSeek API
export const sendTextMessage = async (messages: { role: string; content: string }[]) => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API key not set. Please set your DeepSeek API key.");
    }
    
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content
    }));
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to get response from DeepSeek API");
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error sending message to DeepSeek API:", error);
    throw error;
  }
};

// Convert file to base64 for multimodal messages
export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || '');
    reader.readAsDataURL(file);
  });
};

// Function to handle multimodal messages (text + images)
export const sendMultiModalMessage = async (
  messages: { role: string; content: string }[], 
  files: File[]
) => {
  try {
    // Currently DeepSeek might not support multimodal in the same way as Gemini
    // This is a simplified implementation - adjust based on DeepSeek's actual API
    const lastMessage = messages[messages.length - 1];
    
    // For now, let's just send the text message
    // In a real implementation, you would need to check DeepSeek's documentation
    // for how to handle images and other media types
    return await sendTextMessage(messages);
  } catch (error) {
    console.error("Error sending multimodal message to DeepSeek:", error);
    throw error;
  }
};
