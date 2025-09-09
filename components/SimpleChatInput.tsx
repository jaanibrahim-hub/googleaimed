import React, { useState } from 'react';

interface SimpleChatInputProps {
  apiKey: string;
}

// Function to add messages to the chat UI
const addMessageToChat = (sender: 'user' | 'ai', message: string) => {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = 'mb-4';
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="flex justify-end">
        <div class="bg-blue-500 text-white rounded-lg px-4 py-3 max-w-xs lg:max-w-md">
          <div class="text-sm">${message.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-start gap-4">
          <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            AI
          </div>
          <div class="flex-1">
            <div class="text-gray-800 text-sm leading-relaxed">${message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  const container = document.getElementById('messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

const SimpleChatInput: React.FC<SimpleChatInputProps> = ({ apiKey }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Add user message to chat
      console.log('User:', userMessage);
      
      // Simple AI call using the Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a compassionate medical AI assistant called MediTeach AI. Provide helpful, educational medical information while always reminding users to consult healthcare professionals for actual medical advice. 

User question: ${userMessage}

Please provide a clear, compassionate response that educates but doesn't replace professional medical advice.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue generating a response. Please try again.';
      
      console.log('AI:', aiResponse);
      
      // Add messages to the chat
      addMessageToChat('user', userMessage);
      addMessageToChat('ai', aiResponse);
      
    } catch (error) {
      console.error('Error:', error);
      addMessageToChat('user', userMessage);
      addMessageToChat('ai', 'I apologize, but I encountered an error processing your request. Please check your API key and try again. If the problem persists, please verify your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-full p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
      <button className="p-2 text-gray-500 hover:text-blue-500 rounded-full transition-colors">
        📎
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask about your medical condition, upload documents, or use voice..."
        className="flex-1 bg-transparent focus:outline-none text-base"
        disabled={isLoading}
      />
      <button className="p-2 text-gray-500 hover:text-blue-500 rounded-full transition-colors">
        🎤
      </button>
      <button 
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
        className={`p-3 rounded-full transition-transform ${
          isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105'
        }`}
      >
        {isLoading ? '⏳' : '➤'}
      </button>
    </div>
  );
};

export default SimpleChatInput;