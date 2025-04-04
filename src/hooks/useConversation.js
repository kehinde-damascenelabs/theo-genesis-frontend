import { useState } from 'react';

export const useConversation = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');

  // Add a new message to the conversation
  const addMessage = (sender, text) => {
    setMessages(prevMessages => [...prevMessages, { sender, text }]);
  };

  // Update the current (real-time) message being transcribed
  const updateCurrentMessage = (text) => {
    setCurrentMessage(text);
  };

  // Submit the current message as a completed user message
  const submitCurrentMessage = () => {
    if (currentMessage.trim()) {
      addMessage('user', currentMessage);
      setCurrentMessage('');
      return currentMessage;
    }
    return '';
  };

  // Add an AI response to the conversation
  const addAIResponse = (text) => {
    addMessage('ai', text);
  };

  // Clear all messages
  const clearConversation = () => {
    setMessages([]);
    setCurrentMessage('');
  };

  return {
    messages,
    currentMessage,
    updateCurrentMessage,
    submitCurrentMessage,
    addAIResponse,
    clearConversation
  };
};

export default useConversation; 