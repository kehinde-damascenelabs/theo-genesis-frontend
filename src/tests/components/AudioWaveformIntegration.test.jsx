import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AudioWaveform from '../../components/AudioWaveform';
import ConversationTranscript from '../../components/ConversationTranscript';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

// Create a mock state for the microphone
let mockMicState = {
  isMicOn: false,
  isConnecting: false
};

// Sample conversation for testing
const sampleConversation = [
  { sender: 'user', text: 'Hello!' },
  { sender: 'ai', text: 'Hi there! How can I assist you today?' },
  { sender: 'user', text: "I'm curious about how you work. Can you explain a bit?" },
  { sender: 'ai', text: "Of course! I'm powered by advanced natural language processing and machine learning algorithms that analyze your input and generate helpful responses based on patterns learned from a large amount of data." },
];

// Mock useMicrophone hook
jest.mock('../../hooks/useMicrophone', () => ({
  useMicrophone: () => {
    return {
      isMicOn: mockMicState.isMicOn,
      isConnecting: mockMicState.isConnecting,
      startMicrophone: jest.fn().mockImplementation(() => {
        mockMicState.isMicOn = true;
        return Promise.resolve();
      }),
      stopMicrophone: jest.fn().mockImplementation(() => {
        mockMicState.isMicOn = false;
      }),
      barsRef: { current: Array(5).fill(null) }
    };
  }
}));

// Mock theme provider for testing
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Create an integration component that mimics the real usage
function IntegratedComponents() {
  const [isListening, setIsListening] = React.useState(false);
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [messages, setMessages] = React.useState(sampleConversation);
  
  const updateCurrentMessage = (msg) => setCurrentMessage(msg);
  const submitCurrentMessage = () => {
    if (currentMessage.trim()) {
      setMessages([...messages, { sender: 'user', text: currentMessage }]);
      setCurrentMessage('');
    }
  };
  const addAIResponse = (text) => {
    setMessages([...messages, { sender: 'ai', text }]);
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AudioWaveform 
          updateCurrentMessage={updateCurrentMessage}
          submitCurrentMessage={submitCurrentMessage}
          addAIResponse={addAIResponse}
          currentMessage={currentMessage}
          setIsListening={setIsListening}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ConversationTranscript 
          messages={messages}
          isListening={isListening}
          currentMessage={currentMessage}
        />
      </Grid>
    </Grid>
  );
}

describe('AudioWaveform with ConversationTranscript Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset mock state between tests
    mockMicState = {
      isMicOn: false,
      isConnecting: false
    };
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders both audio waveform and conversation transcript', () => {
    render(
      <TestWrapper>
        <IntegratedComponents />
      </TestWrapper>
    );
    
    // Check for microphone button (part of AudioWaveform)
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Check for conversation transcript
    expect(screen.getByTestId('conversation-transcript')).toBeInTheDocument();
    
    // Check initial sample messages are displayed
    expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
    expect(screen.getByText(/Hi there! How can I assist you today?/i)).toBeInTheDocument();
  });

  test('renders with initial conversation', () => {
    render(
      <TestWrapper>
        <IntegratedComponents />
      </TestWrapper>
    );
    
    // Check initial conversation is loaded properly
    expect(screen.getByText(/I'm curious about how you work/i)).toBeInTheDocument();
    expect(screen.getByText(/I'm powered by advanced natural language processing/i)).toBeInTheDocument();
  });
}); 