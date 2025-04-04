import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AudioWaveform from '../../components/AudioWaveform';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CircularProgress from '@mui/material/CircularProgress';

// Create mock states
let mockMicState = {
  isMicOn: false,
  isConnecting: false
};

// Mock the Material-UI components we need to test
jest.mock('@mui/material/CircularProgress', () => jest.fn(() => <div data-testid="circular-progress" />));
jest.mock('@mui/icons-material/Mic', () => jest.fn(() => <div data-testid="MicIcon" />));
jest.mock('@mui/icons-material/MicOff', () => jest.fn(() => <div data-testid="MicOffIcon" />));

// Mock the useMicrophone hook
jest.mock('../../hooks/useMicrophone', () => ({
  useMicrophone: () => ({
    isMicOn: mockMicState.isMicOn,
    isConnecting: mockMicState.isConnecting,
    startMicrophone: jest.fn().mockImplementation(() => {
      mockMicState.isConnecting = true;
      // Simulate async connection
      return new Promise(resolve => {
        setTimeout(() => {
          mockMicState.isConnecting = false;
          mockMicState.isMicOn = true;
          resolve();
        }, 100);
      });
    }),
    stopMicrophone: jest.fn().mockImplementation(() => {
      mockMicState.isMicOn = false;
    }),
    barsRef: { current: Array(5).fill(null) }
  })
}));

// Mock the useConversation hook
let mockMessages = [];
let mockCurrentMessage = '';
jest.mock('../../hooks/useConversation', () => ({
  useConversation: (initialMessages) => {
    // Initialize mock messages on first render
    if (mockMessages.length === 0 && initialMessages) {
      mockMessages = [...initialMessages];
    }
    
    return {
      messages: mockMessages,
      currentMessage: mockCurrentMessage,
      updateCurrentMessage: jest.fn().mockImplementation((msg) => {
        mockCurrentMessage = msg;
      }),
      submitCurrentMessage: jest.fn().mockImplementation(() => {
        if (mockCurrentMessage.trim()) {
          mockMessages.push({ sender: 'user', text: mockCurrentMessage });
          mockCurrentMessage = '';
        }
      }),
      addAIResponse: jest.fn().mockImplementation((text) => {
        mockMessages.push({ sender: 'ai', text });
      })
    };
  }
}));

// Mock the Tooltip component to make testing easier
jest.mock('@mui/material/Tooltip', () => ({ 
  children, 
  title 
}) => (
  <>
    {title && <div data-testid="tooltip-text">{title.props.children.props.children}</div>}
    {children}
  </>
));

// Wrapper with theme provider
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Mock props for the AudioWaveform component
const mockProps = {
  updateCurrentMessage: jest.fn(),
  submitCurrentMessage: jest.fn(),
  addAIResponse: jest.fn(),
  currentMessage: '',
  setIsListening: jest.fn()
};

describe('AudioWaveform Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset mocks between tests
    mockMicState = {
      isMicOn: false,
      isConnecting: false
    };
    // Reset mock props
    mockProps.updateCurrentMessage.mockClear();
    mockProps.submitCurrentMessage.mockClear();
    mockProps.addAIResponse.mockClear();
    mockProps.setIsListening.mockClear();
    mockProps.currentMessage = '';
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('renders with initial state', () => {
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Check that the microphone visualization is rendered
    const waveformBars = document.querySelectorAll('.rounded-lg');
    expect(waveformBars.length).toBe(5);
  });

  test('displays mic off icon initially', () => {
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Should show the mic off icon initially
    const micOffIcon = screen.getByTestId('MicOffIcon');
    expect(micOffIcon).toBeInTheDocument();
  });

  test('shows loading state when connecting', () => {
    mockMicState.isConnecting = true;
    
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Should show circular progress during connection
    const progressIndicator = screen.getByTestId('circular-progress');
    expect(progressIndicator).toBeInTheDocument();
  });

  test('toggles microphone on button click', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    const { rerender } = render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Click mic button to turn it on
    const micButton = screen.getByRole('button');
    await user.click(micButton);
    
    // Update component to show connecting state
    mockMicState.isConnecting = true;
    
    rerender(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Should show connecting state
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    
    // Advance timers to complete connection
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    
    // Update component with new state
    mockMicState.isConnecting = false;
    mockMicState.isMicOn = true;
    
    rerender(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Should now show mic on icon
    const micOnIcon = screen.getByTestId('MicIcon');
    expect(micOnIcon).toBeInTheDocument();
    
    // Click again to turn off
    await user.click(micButton);
    
    // Should show mic off icon again
    mockMicState.isMicOn = false;
    
    rerender(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    const micOffIcon = screen.getByTestId('MicOffIcon');
    expect(micOffIcon).toBeInTheDocument();
  });

  test('calls setIsListening when microphone state changes', async () => {
    const { rerender } = render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Initial state - mic is off
    expect(mockProps.setIsListening).toHaveBeenCalledWith(false);
    
    // Change mic state
    mockMicState.isMicOn = true;
    
    rerender(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    // Should call setIsListening with new mic state
    expect(mockProps.setIsListening).toHaveBeenCalledWith(true);
  });

  test('shows correct tooltip text when mic is off', () => {
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('tooltip-text').textContent).toBe('Turn on microphone');
  });

  test('shows connecting tooltip during connection', () => {
    mockMicState.isConnecting = true;
    
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('tooltip-text').textContent).toBe('Connecting...');
  });

  test('shows turn off microphone tooltip when mic is on', () => {
    mockMicState.isMicOn = true;
    
    render(
      <TestWrapper>
        <AudioWaveform {...mockProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('tooltip-text').textContent).toBe('Turn off microphone');
  });
}); 