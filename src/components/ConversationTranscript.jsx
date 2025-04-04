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
  maxWidth: '75%',
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
  wordBreak: 'break-word',
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
}));

const ConversationTranscript = ({ 
  messages = [], 
  isListening = false,
  currentMessage = "",
}) => {
  const theme = useTheme();
  const transcriptRef = useRef(null);
  const [displayMessages, setDisplayMessages] = useState(messages);

  // Update displayed messages when props change or during real-time transcription
  useEffect(() => {
    if (isListening && currentMessage) {
      // During real-time transcription, update the latest user message
      const updatedMessages = [...messages];
      if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].sender === 'user') {
        // Update the last message if it's from the user
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          text: currentMessage
        };
      } else {
        // Add a new user message
        updatedMessages.push({ sender: 'user', text: currentMessage });
      }
      setDisplayMessages(updatedMessages);
    } else {
      // When not in real-time transcription mode, simply use the provided messages
      setDisplayMessages(messages);
    }
  }, [messages, currentMessage, isListening]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [displayMessages]);

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
              <MessageText variant="body1">
                {message.text}
              </MessageText>
            </MessageBubble>
          </MessageContainer>
        ))}
      </TranscriptContainer>
    </Box>
  );
};

export default ConversationTranscript; 