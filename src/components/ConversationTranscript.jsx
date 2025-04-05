"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/system';

// Styled components for transcript messages
const MessageContainer = styled(Box)(({ theme, sender }) => ({
  display: 'flex',
  justifyContent: sender === 'user' ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1.25),
  width: '100%',
  opacity: 1,
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: sender === 'user' ? 'translateX(10px)' : 'translateX(-10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, sender }) => ({
  maxWidth: '90%', // Increased from 75% to allow more space for text
  padding: theme.spacing(1.75),
  borderRadius: '8px',
  backgroundColor: sender === 'user' 
    ? theme.palette.mode === 'dark' 
      ? alpha(theme.palette.primary.main, 0.25) // Subtle blue in dark mode
      : alpha(theme.palette.primary.main, 0.12) // Lighter blue in light mode
    : theme.palette.mode === 'dark' 
      ? alpha(theme.palette.success.main, 0.2) // Subtle green in dark mode
      : alpha(theme.palette.success.main, 0.08), // Lighter green in light mode
  color: theme.palette.mode === 'dark' 
    ? theme.palette.grey[100] 
    : theme.palette.text.primary,
  wordBreak: 'break-word', // Ensure long words break to prevent overflow
  overflowWrap: 'break-word', // Additional property for better word wrapping
  boxShadow: theme.palette.mode === 'dark' 
    ? 'none'
    : '0 1px 2px rgba(0,0,0,0.05)',
}));

const TranscriptContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  width: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' // Softer dark background
    : theme.palette.grey[50], // Light gray in light mode
  borderRadius: theme.spacing(1),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.25)' 
    : theme.shadows[2],
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[400],
    borderRadius: '3px',
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTopLeftRadius: theme.spacing(1),
  borderTopRightRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' 
    : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? 'none' 
    : '0 1px 2px rgba(0,0,0,0.03)',
}));

const HeaderText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.grey[400] 
    : theme.palette.grey[600],
  textTransform: 'uppercase',
}));

const SenderLabel = styled(Typography)(({ theme, sender }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  color: sender === 'user'
    ? theme.palette.mode === 'dark' 
      ? theme.palette.primary.light 
      : theme.palette.primary.main
    : theme.palette.mode === 'dark' 
      ? theme.palette.success.light 
      : theme.palette.success.main,
}));

const MessageText = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: '0.95rem',
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  whiteSpace: 'normal', // Ensure text wraps naturally
  wordWrap: 'break-word', // Enable breaking of long words
  hyphens: 'auto', // Enable hyphenation for better text wrapping
  textOverflow: 'initial', // Remove text truncation
}));

// Loading dots animation span-based component (to avoid div inside p)
const LoadingDotsSpan = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  '& span': {
    width: '6px',
    height: '6px',
    margin: '0 2px',
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.grey[300] 
      : theme.palette.grey[700],
    display: 'inline-block',
    animation: 'loadingDots 1.4s infinite ease-in-out both',
  },
  '& span:nth-of-type(1)': {
    animationDelay: '0s',
  },
  '& span:nth-of-type(2)': {
    animationDelay: '0.2s',
  },
  '& span:nth-of-type(3)': {
    animationDelay: '0.4s',
  },
  '@keyframes loadingDots': {
    '0%, 80%, 100%': {
      transform: 'scale(0)',
      opacity: 0.5,
    },
    '40%': {
      transform: 'scale(1)',
      opacity: 1,
    }
  }
}));

const ConversationTranscript = ({ 
  messages = [], 
  isListening = false,
  isAISpeaking = false,
  currentMessage = "",
}) => {
  const theme = useTheme();
  const transcriptRef = useRef(null);
  const [displayMessages, setDisplayMessages] = useState(messages);
  const [typewriterIndices, setTypewriterIndices] = useState({});
  const [typewriterTimers, setTypewriterTimers] = useState({});
  const [animationCompleted, setAnimationCompleted] = useState({});

  // Update displayed messages when props change or during real-time transcription
  useEffect(() => {
    // Don't display any messages if there are no actual messages
    if (messages.length === 0 && !isListening && !currentMessage) {
      setDisplayMessages([]);
      return;
    }
    
    const updatedMessages = [...messages];
    
    if (isListening && currentMessage) {
      // If we're listening, update or add a user message
      if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].sender === 'user') {
        // Update the last message
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          text: currentMessage,
          isTyping: false // Changed to false for user messages to display immediately
        };
      } else {
        // Add a new user message
        updatedMessages.push({ 
          sender: 'user', 
          text: currentMessage,
          isTyping: false // Changed to false for user messages to display immediately
        });
      }
    }

    // Update AI messages if needed
    if (isAISpeaking && updatedMessages.length > 0) {
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage.sender === 'ai') {
        lastMessage.isTyping = true;
      }
    }

    setDisplayMessages(updatedMessages);
  }, [messages, currentMessage, isListening, isAISpeaking]);

  // Start typewriter animation for new messages or updated ones
  useEffect(() => {
    displayMessages.forEach((message, index) => {
      const messageId = `${message.sender}-${index}`;
      
      // Skip animation for user messages to make them appear immediately
      if (message.sender === 'user') {
        // Mark user message animations as completed immediately
        setAnimationCompleted(prev => ({
          ...prev,
          [messageId]: true
        }));
        
        // Set the typewriter index to the full length of the message
        setTypewriterIndices(prevIndices => ({
          ...prevIndices,
          [messageId]: message.text.length
        }));
        
        return;
      }
      
      // Only apply typing animation to AI messages
      if (message.isTyping && !typewriterTimers[messageId]) {
        // Set animation as not completed for this message
        setAnimationCompleted(prev => ({
          ...prev,
          [messageId]: false
        }));
        
        // Start a new typewriter animation
        const timer = setInterval(() => {
          setTypewriterIndices(prevIndices => {
            const currentIndex = prevIndices[messageId] || 0;
            
            // If we've displayed the entire message
            if (currentIndex >= message.text.length) {
              // Clear the timer
              clearInterval(typewriterTimers[messageId]);
              
              // Remove this message from the timers list
              const newTimers = { ...typewriterTimers };
              delete newTimers[messageId];
              setTypewriterTimers(newTimers);
              
              // Mark the message as not typing anymore
              const newMessages = [...displayMessages];
              if (newMessages[index]) {
                newMessages[index].isTyping = false;
                setDisplayMessages(newMessages);
              }
              
              // Mark animation as completed for this message
              setAnimationCompleted(prev => ({
                ...prev,
                [messageId]: true
              }));
              
              return prevIndices;
            }
            
            // Otherwise, increment the index more rapidly for long messages
            // This helps ensure messages don't get stuck mid-animation
            const increment = message.text.length > 100 ? 8 : 3; // Increased speed
            return {
              ...prevIndices,
              [messageId]: Math.min(currentIndex + increment, message.text.length)
            };
          });
        }, 15); // Faster animation speed (was 20ms)
        
        // Save the timer
        setTypewriterTimers(prevTimers => ({
          ...prevTimers,
          [messageId]: timer
        }));
        
        // Initialize the typewriter index if needed
        setTypewriterIndices(prevIndices => ({
          ...prevIndices,
          [messageId]: prevIndices[messageId] || 0
        }));
      }
    });
    
    // Cleanup timers on unmount
    return () => {
      Object.values(typewriterTimers).forEach(timer => clearInterval(timer));
    };
  }, [displayMessages, typewriterTimers]);

  // Force complete animations that take too long (failsafe)
  useEffect(() => {
    // Set a timeout to complete any animations that take too long
    const timeoutId = setTimeout(() => {
      displayMessages.forEach((message, index) => {
        const messageId = `${message.sender}-${index}`;
        if (message.isTyping && !animationCompleted[messageId]) {
          // Clear the timer
          if (typewriterTimers[messageId]) {
            clearInterval(typewriterTimers[messageId]);
          }
          
          // Force complete the animation
          setTypewriterIndices(prev => ({
            ...prev,
            [messageId]: message.text.length
          }));
          
          // Mark the message as not typing anymore
          const newMessages = [...displayMessages];
          if (newMessages[index]) {
            newMessages[index].isTyping = false;
            setDisplayMessages(newMessages);
          }
          
          // Remove this message from the timers list
          setTypewriterTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[messageId];
            return newTimers;
          });
          
          // Mark animation as completed
          setAnimationCompleted(prev => ({
            ...prev,
            [messageId]: true
          }));
        }
      });
    }, 10000); // Force complete after 10 seconds
    
    return () => clearTimeout(timeoutId);
  }, [displayMessages, typewriterTimers, animationCompleted]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [displayMessages, typewriterIndices]);

  // Get the displayed text for a message (either partial for typewriter effect or full)
  const getDisplayText = (message, index) => {
    const messageId = `${message.sender}-${index}`;
    
    // Always show full text for user messages immediately
    if (message.sender === 'user') {
      return message.text;
    }
    
    if (message.isTyping) {
      // If the message is currently being typed
      const currentIndex = typewriterIndices[messageId] || 0;
      if (currentIndex === 0) {
        // Show loading dots if we haven't started typing yet
        return null; // Return null to render loading dots separately to avoid hydration errors
      } else {
        // Show the partial text as a typewriter effect
        return message.text.substring(0, currentIndex);
      }
    }
    
    // Otherwise, show the full message
    return message.text;
  };

  // Determine if we should show loading dots
  const shouldShowLoadingDots = (message, index) => {
    // Never show loading dots for user messages
    if (message.sender === 'user') {
      return false;
    }
    
    const messageId = `${message.sender}-${index}`;
    return message.isTyping && (typewriterIndices[messageId] || 0) === 0;
  };

  return (
    <Box>
      <HeaderContainer data-testid="transcript-header">
        <HeaderText>Transcript</HeaderText>
      </HeaderContainer>
      <TranscriptContainer ref={transcriptRef} data-testid="conversation-transcript">
        {displayMessages.map((message, index) => (
          <MessageContainer key={index} sender={message.sender} data-testid={`message-${index}`}>
            <MessageBubble sender={message.sender}>
              <SenderLabel variant="subtitle2" sender={message.sender}>
                {message.sender === 'user' ? 'You' : 'AI'}
              </SenderLabel>
              {shouldShowLoadingDots(message, index) ? (
                <LoadingDotsSpan>
                  <span></span>
                  <span></span>
                  <span></span>
                </LoadingDotsSpan>
              ) : (
                <MessageText variant="body1" data-testid={`message-text-${index}`}>
                  {getDisplayText(message, index)}
                </MessageText>
              )}
            </MessageBubble>
          </MessageContainer>
        ))}
      </TranscriptContainer>
    </Box>
  );
};

export default ConversationTranscript; 