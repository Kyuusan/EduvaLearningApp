

export const useGeminiChat = (apiKey) => {
  const [service] = useState(() => new GeminiService(apiKey));
  
  const sendMessage = async (message, history = []) => {
    try {
      return await service.generateResponse(message, history);
    } catch (error) {
      throw error;
    }
  };
  
  const isValidApiKey = (key) => {
    return key && key.startsWith('AIza') && key.length > 30;
  };
  
  return {
    sendMessage,
    isValidApiKey: isValidApiKey(apiKey)
  };
};