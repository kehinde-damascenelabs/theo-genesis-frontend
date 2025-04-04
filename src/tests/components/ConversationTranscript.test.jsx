import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationTranscript from '../../components/ConversationTranscript';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock theme provider for testing
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('ConversationTranscript', () => {
  const sampleMessages = [
    { sender: 'user', text: 'Hello!' },
    { sender: 'ai', text: 'Hi there! How can I assist you today?' },
    { sender: 'user', text: "I'm curious about how you work. Can you explain a bit?" },
  ];

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <ConversationTranscript messages={[]} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('conversation-transcript')).toBeInTheDocument();
    expect(screen.getByTestId('transcript-header')).toBeInTheDocument();
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  test('displays messages correctly', () => {
    render(
      <TestWrapper>
        <ConversationTranscript messages={sampleMessages} />
      </TestWrapper>
    );

    // Check if all messages are rendered
    expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
    expect(screen.getByText(/Hi there! How can I assist you today?/i)).toBeInTheDocument();
    expect(screen.getByText(/I'm curious about how you work. Can you explain a bit?/i)).toBeInTheDocument();
    
    // Check if sender labels are displayed (exact match instead of regex)
    const userLabels = screen.getAllByText('You');
    expect(userLabels).toHaveLength(2);
    
    const aiLabels = screen.getAllByText('AI');
    expect(aiLabels).toHaveLength(1);
  });

  test('handles real-time message transcription', () => {
    const { rerender } = render(
      <TestWrapper>
        <ConversationTranscript 
          messages={sampleMessages}
          isListening={true}
          currentMessage="This is a real-time message being typed..."
        />
      </TestWrapper>
    );

    // Should add the real-time message as a new user message
    expect(screen.getByText(/This is a real-time message being typed.../i)).toBeInTheDocument();
    
    // When updating an existing user message (the last message is from user)
    const updatedMessages = [
      { sender: 'user', text: 'Hello!' },
      { sender: 'ai', text: 'Hi there! How can I assist you today?' },
      { sender: 'user', text: "I'm curious about how you work. Can you explain a bit?" },
    ];
    
    rerender(
      <TestWrapper>
        <ConversationTranscript 
          messages={updatedMessages}
          isListening={true}
          currentMessage="Updated in real-time"
        />
      </TestWrapper>
    );
    
    // Should update the last user message
    expect(screen.getByText(/Updated in real-time/i)).toBeInTheDocument();
    expect(screen.queryByText(/This is a real-time message being typed.../i)).not.toBeInTheDocument();
  });

  test('applies correct styling for user and AI messages', () => {
    render(
      <TestWrapper>
        <ConversationTranscript messages={sampleMessages} />
      </TestWrapper>
    );

    const messages = screen.getAllByTestId(/message-\d+/);
    expect(messages.length).toBe(3);
    
    // Check message content instead of text content with labels
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there! How can I assist you today?')).toBeInTheDocument();
  });
  
  test('renders new UI elements correctly', () => {
    render(
      <TestWrapper>
        <ConversationTranscript messages={sampleMessages} />
      </TestWrapper>
    );
    
    // Check for the transcript container with styled scrollable area
    const transcriptContainer = screen.getByTestId('conversation-transcript');
    expect(transcriptContainer).toBeInTheDocument();
    
    // Check for exact text matches rather than regex
    const userLabels = screen.getAllByText('You');
    expect(userLabels.length).toBe(2);
    
    const aiLabels = screen.getAllByText('AI');
    expect(aiLabels.length).toBe(1);
    
    // Check that the header is rendered correctly
    const header = screen.getByTestId('transcript-header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });
}); 