// BotChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const BotChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bot-chat');
        
        setMessages(response.data.botChat.messages || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading chat history:', error);
        setLoading(false);
      }
    };
    
    loadChatHistory();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Optimistically add user message to UI
      setMessages(prev => [
        ...prev, 
        { isBot: false, content: newMessage, timestamp: new Date() }
      ]);
      
      setNewMessage('');
      setTyping(true);
      
      // Send message to API
      const response = await api.post('/bot-chat/message', 
        { message: newMessage.trim() }
      );
      
      // Only add bot response (user message was already added)
      const botResponse = response.data.newMessages[1];
      
      // Simulate typing delay for more natural interaction
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setTyping(false);
      }, 800);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setTyping(false);
      // Add error handling UI
      setMessages(prev => [
        ...prev,
        { 
          isBot: true, 
          content: "Sorry, I'm having trouble responding right now. Please try again later.", 
          timestamp: new Date(),
          isError: true
        }
      ]);
    }
  };
  
  // Clear chat history
  const handleClearChat = async () => {
    try {
      const response = await api.post('/bot-chat/clear');
      
      setMessages(response.data.botChat.messages);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  // Quick response buttons
  const quickResponses = [
    "How do I report a lost item?",
    "I found something, what should I do?",
    "How can I search for lost items?",
    "What information should I include?"
  ];

  const sendQuickResponse = (message) => {
    setNewMessage(message);
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto h-[600px] flex flex-col">
      <div className="bg-[#61906B] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="text-lg font-semibold">Khuje Dei Assistant</h3>
        <button 
          onClick={handleClearChat}
          className="bg-white text-[#61906B] px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#61906B]"></div>
            <span className="ml-2 text-gray-600">Loading chat history...</span>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <p>Start a conversation with the Khuje Dei Assistant!</p>
                <p className="text-sm mt-2">Ask questions about lost or found items, reporting procedures, or get help finding your belongings.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {msg.isBot && (
                  <div className="h-8 w-8 rounded-full bg-[#61906B] flex items-center justify-center text-white mr-2">
                    <span className="text-xs font-bold">KD</span>
                  </div>
                )}
                <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  msg.isBot 
                    ? `bg-white border ${msg.isError ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-gray-800` 
                    : 'bg-[#61906B] text-white'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-xs mt-1 ${msg.isBot ? 'text-gray-500' : 'text-gray-200'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="mb-4 flex justify-start">
                <div className="h-8 w-8 rounded-full bg-[#61906B] flex items-center justify-center text-white mr-2">
                  <span className="text-xs font-bold">KD</span>
                </div>
                <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {messages.length > 0 && !loading && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto">
          <div className="flex space-x-2">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => sendQuickResponse(response)}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-300 transition"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading || typing}
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#61906B] focus:border-transparent"
          />
          <button 
            type="submit" 
            disabled={loading || typing || !newMessage.trim()}
            className="bg-[#61906B] text-white px-4 py-2 rounded-r-md hover:bg-[#4e7357] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default BotChat;
