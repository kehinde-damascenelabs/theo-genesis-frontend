import { useState, useCallback } from 'react';
import { stopConnection } from '../service/realtimeAPI/stopConnection';

export const useConversation = (initialMessages = []) => {
  const [conversationData, setConversationData] = useState({
    messages: initialMessages,
    sessionStart: new Date().toISOString(),
    sessionEnd: null
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [processingUserInput, setProcessingUserInput] = useState(false);
  const [aiResponsePending, setAiResponsePending] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState({
    pc: null,
    dc: null,
    audioEl: null
  });

  // Add a new message to the conversation
  const addMessage = useCallback((sender, text, isTyping = false) => {
    const timestamp = new Date().toISOString();
    const senderName = sender === 'ai' ? 'Theo' : 'User';
    
    setConversationData(prevData => ({
      ...prevData,
      messages: [
        ...prevData.messages, 
        { 
          sender, 
          senderName,
          text, 
          isTyping,
          timestamp
        }
      ]
    }));
  }, []);

  // Update the current (real-time) message being transcribed
  const updateCurrentMessage = useCallback((text) => {
    setCurrentMessage(text);
  }, []);

  // Submit the current message as a completed user message
  const submitCurrentMessage = useCallback(() => {
    if (currentMessage.trim()) {
      setProcessingUserInput(true);
      addMessage('user', currentMessage, false);
      setCurrentMessage('');
      
      setAiResponsePending(true);
      
      setTimeout(() => {
        setProcessingUserInput(false);
      }, 300);
      
      return currentMessage;
    }
    return '';
  }, [currentMessage, addMessage]);

  // Add an AI response to the conversation
  const addAIResponse = useCallback((text) => {
    addMessage('ai', text, true);
    
    setTimeout(() => {
      setAiResponsePending(false);
      
      setConversationData(prevData => {
        const updated = [...prevData.messages];
        if (updated.length > 0) {
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.sender === 'ai') {
            updated[updated.length - 1] = { ...lastMessage, isTyping: false };
          }
        }
        return {
          ...prevData,
          messages: updated
        };
      });
    }, 2000);
  }, [addMessage]);

  // Handle user transcript event from the realtime API
  const handleUserTranscript = useCallback((transcript) => {
    if (transcript && transcript.trim()) {
      setProcessingUserInput(true);
      setCurrentMessage(transcript);
      addMessage('user', transcript, false);
      setCurrentMessage('');
      
      setAiResponsePending(true);
      
      setTimeout(() => {
        setProcessingUserInput(false);
      }, 300);
    }
  }, [addMessage]);

  // Handle AI transcript event from the realtime API
  const handleAITranscript = useCallback((transcript) => {
    if (transcript && transcript.trim()) {
      addMessage('ai', transcript, true);
      
      setTimeout(() => {
        setAiResponsePending(false);
        
        setConversationData(prevData => {
          const updated = [...prevData.messages];
          if (updated.length > 0) {
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.sender === 'ai') {
              updated[updated.length - 1] = { ...lastMessage, isTyping: false };
            }
          }
          return {
            ...prevData,
            messages: updated
          };
        });
      }, 2000);
    }
  }, [addMessage]);

  // Clear all messages
  const clearConversation = useCallback(() => {
    setConversationData({
      messages: [],
      sessionStart: new Date().toISOString(),
      sessionEnd: null
    });
    setCurrentMessage('');
    setProcessingUserInput(false);
    setAiResponsePending(false);
  }, []);

  // Update WebRTC connection details
  const updateConnectionDetails = useCallback((details) => {
    setConnectionDetails(prev => ({
      ...prev,
      ...details
    }));
  }, []);

  // End session and print conversation data
  const endSession = useCallback(() => {
    setConversationData(prevData => {
      const updatedData = {
        ...prevData,
        sessionEnd: new Date().toISOString()
      };
      
      // Send conversation data to be saved along with connection details
      stopConnection({ 
        ...connectionDetails,
        conversationData: updatedData 
      });
      
      return updatedData;
    });
  }, [connectionDetails]);

  return {
    messages: conversationData.messages,
    conversationData,
    currentMessage,
    processingUserInput,
    aiResponsePending,
    updateCurrentMessage,
    submitCurrentMessage,
    addAIResponse,
    clearConversation,
    handleUserTranscript,
    handleAITranscript,
    updateConnectionDetails,
    endSession
  };
};

export default useConversation;