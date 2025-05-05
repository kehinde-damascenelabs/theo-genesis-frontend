import { useState, useCallback } from 'react';

export const useConversation = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [currentMessage, setCurrentMessage] = useState('');
  const [processingUserInput, setProcessingUserInput] = useState(false);
  const [aiResponsePending, setAiResponsePending] = useState(false);

  // Add a new message to the conversation
  const addMessage = useCallback((sender, text, isTyping = false) => {
    setMessages(prevMessages => [...prevMessages, { 
      sender, 
      text, 
      isTyping,
      timestamp: new Date().toISOString() // Add timestamp to each message
    }]);
  }, []);

  // Update the current (real-time) message being transcribed
  const updateCurrentMessage = useCallback((text) => {
    setCurrentMessage(text);
  }, []);

  // Submit the current message as a completed user message
  const submitCurrentMessage = useCallback(() => {
    if (currentMessage.trim()) {
      setProcessingUserInput(true);
      addMessage('user', currentMessage, false); // Changed to false to disable animation
      setCurrentMessage('');
      
      // Simulate AI "thinking" state - in a real app, this would be triggered when 
      // the AI actually starts processing or speaking
      setAiResponsePending(true);
      
      // Clear the processing state after a delay
      setTimeout(() => {
        setProcessingUserInput(false);
      }, 300); // Reduced from 500ms
      
      return currentMessage;
    }
    return '';
  }, [currentMessage, addMessage]);

  // Add an AI response to the conversation
  const addAIResponse = useCallback((text) => {
    // Add the AI message with isTyping flag to enable animation
    addMessage('ai', text, true);
    
    // Simulate end of AI response after a delay
    setTimeout(() => {
      setAiResponsePending(false);
      
      // Update the message to remove isTyping flag
      setMessages(prevMessages => {
        const updated = [...prevMessages];
        if (updated.length > 0) {
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.sender === 'ai') {
            updated[updated.length - 1] = { ...lastMessage, isTyping: false };
          }
        }
        return updated;
      });
    }, 2000); // Delay long enough to show the animation
  }, [addMessage]);

  // Handle user transcript event from the realtime API
  const handleUserTranscript = useCallback((transcript) => {
    if (transcript && transcript.trim()) {
      setProcessingUserInput(true);
      // Update the current message with the transcript
      setCurrentMessage(transcript);
      // Submit as a completed message immediately without delay
      addMessage('user', transcript, false); // Changed to false to disable animation
      setCurrentMessage('');
      
      // Set AI response pending to show loading
      setAiResponsePending(true);
      
      setTimeout(() => {
        setProcessingUserInput(false);
      }, 300); // Reduced from 500ms to 300ms
    }
  }, [addMessage]);

  // Handle AI transcript event from the realtime API
  const handleAITranscript = useCallback((transcript) => {
    if (transcript && transcript.trim()) {
      // Add with typing animation
      addMessage('ai', transcript, true);
      
      // Simulate completion of typing after a delay
      setTimeout(() => {
        setAiResponsePending(false);
        
        // Update the message to remove isTyping flag
        setMessages(prevMessages => {
          const updated = [...prevMessages];
          if (updated.length > 0) {
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.sender === 'ai') {
              updated[updated.length - 1] = { ...lastMessage, isTyping: false };
            }
          }
          return updated;
        });
      }, 2000); // Allow time to see the typing animation
    }
  }, [addMessage]);

  // Clear all messages
  const clearConversation = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setProcessingUserInput(false);
    setAiResponsePending(false);
  }, []);

  return {
    messages,
    currentMessage,
    processingUserInput,
    aiResponsePending,
    updateCurrentMessage,
    submitCurrentMessage,
    addAIResponse,
    clearConversation,
    handleUserTranscript,
    handleAITranscript
  };
};

export default useConversation; 