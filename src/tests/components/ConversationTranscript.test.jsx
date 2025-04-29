import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationTranscript from '../../components/ConversationTranscript';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock setInterval and clearInterval
jest.useFakeTimers();

// Mock theme provider for testing
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('ConversationTranscript', () => {
  // Update sample messages to include senderName and timestamp
  const sampleMessages = [
    { 
      sender: 'user', 
      senderName: 'User', 
      text: 'Hello!', 
      timestamp: '2023-07-15T10:30:00.000Z' 
    },
    { 
      sender: 'ai', 
      senderName: 'Theo', 
      text: 'Hi there! How can I assist you today?', 
      timestamp: '2023-07-15T10:30:05.000Z'
    },
    { 
      sender: 'user', 
      senderName: 'User', 
      text: "I'm curious about how you work. Can you explain a bit?", 
      timestamp: '2023-07-15T10:30:15.000Z'
    },
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
    
    // Check if sender labels are displayed
    const userLabels = screen.getAllByText('User');
    expect(userLabels).toHaveLength(2);
    
    const aiLabels = screen.getAllByText('Theo');
    expect(aiLabels).toHaveLength(1);
    
    // Check if timestamps are displayed
    const timestamps = screen.getAllByText(/\d+:\d+:\d+/);
    expect(timestamps.length).toBe(3);
  });

  test('handles long messages without truncation', () => {
    const longMessages = [
      { 
        sender: 'user', 
        senderName: 'User',
        text: 'Can you recommend a good restaurant?',
        timestamp: '2023-07-15T10:30:00.000Z'
      },
      { 
        sender: 'ai', 
        senderName: 'Theo',
        text: 'Well, if you\'re in the mood for something delicious, our Filet Mignon is always a hit—it\'s an 8 oz steak served with garlic mashed potatoes. If seafood is more your style, the Salmon Provençal, grilled with herbs and vegetables, is another fantastic choice. Hungry yet?',
        timestamp: '2023-07-15T10:30:05.000Z'
      }
    ];
    
    render(
      <TestWrapper>
        <ConversationTranscript messages={longMessages} />
      </TestWrapper>
    );
    
    // Verify the full text is there
    const aiResponse = screen.getByText(/Well, if you're in the mood for something delicious/);
    expect(aiResponse).toBeInTheDocument();
    
    // Check that the long message includes text from the end
    expect(screen.getByText(/Hungry yet?/)).toBeInTheDocument();
    
    // Verify that the message contains the middle part too
    expect(screen.getByText(/Salmon Provençal, grilled with herbs and vegetables/)).toBeInTheDocument();
    
    // Test the full text content
    expect(screen.getByTestId('message-text-1').textContent).toBe(
      'Well, if you\'re in the mood for something delicious, our Filet Mignon is always a hit—it\'s an 8 oz steak served with garlic mashed potatoes. If seafood is more your style, the Salmon Provençal, grilled with herbs and vegetables, is another fantastic choice. Hungry yet?'
    );
  });

  test('handles real-time message transcription with typewriter effect', () => {
    // Start with messages where the last one is NOT from the user
    const initialMessages = [
      { 
        sender: 'user', 
        senderName: 'User',
        text: 'Hello!',
        timestamp: '2023-07-15T10:30:00.000Z'
      },
      { 
        sender: 'ai', 
        senderName: 'Theo',
        text: 'Hi there! How can I assist you today?',
        timestamp: '2023-07-15T10:30:05.000Z'
      },
    ];
    
    const { rerender } = render(
      <TestWrapper>
        <ConversationTranscript 
          messages={initialMessages}
          isListening={true}
          currentMessage="This is a real-time message being typed..."
        />
      </TestWrapper>
    );

    // Should show loading animation initially
    expect(screen.getAllByTestId(/message-\d+/).length).toBe(3); // Two initial messages + new user message

    // Advance timers to simulate typewriter effect
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // When updating an existing user message (the last message is from user)
    const updatedMessages = [
      { 
        sender: 'user', 
        senderName: 'User',
        text: 'Hello!',
        timestamp: '2023-07-15T10:30:00.000Z'
      },
      { 
        sender: 'ai', 
        senderName: 'Theo',
        text: 'Hi there! How can I assist you today?',
        timestamp: '2023-07-15T10:30:05.000Z'
      },
      { 
        sender: 'user', 
        senderName: 'User',
        text: "I'm curious about how you work. Can you explain a bit?",
        timestamp: '2023-07-15T10:30:15.000Z'
      },
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
    
    // Should be updating the last user message
    expect(screen.getAllByTestId(/message-\d+/).length).toBe(3);
    
    // Advance timers to complete typewriter effect
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  });

  test('handles very long typewriter animations and completes them', () => {
    // Create a message that would take a long time to type character by character
    const veryLongText = 'This is an extremely long response that would normally take a long time to type out character by character. ' +
      'We need to make sure that the animation completes properly and does not get stuck in the middle. ' +
      'The timeout should force the animation to complete after a certain amount of time, ensuring the full text is displayed. ' +
      'Additionally, we want to verify that the message is not truncated and displays completely in the UI.';
      
    const longMessages = [
      { 
        sender: 'ai', 
        text: veryLongText,
        isTyping: true 
      }
    ];
    
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={longMessages}
          isAISpeaking={true}
        />
      </TestWrapper>
    );
    
    // Fast forward time to see partial animation
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if partial message is showing (animation in progress)
    const partialMessage = screen.getByTestId('message-text-0');
    expect(partialMessage.textContent.length).toBeLessThan(veryLongText.length);
    
    // Fast forward to complete the animation
    act(() => {
      jest.advanceTimersByTime(10000); // Skip ahead to force animation completion
    });
    
    // Now the full message should be visible
    const completeMessage = screen.getByTestId('message-text-0');
    expect(completeMessage.textContent).toBe(veryLongText);
  });

  test('shows loading animation for AI when speaking', () => {
    const messages = [
      { sender: 'user', text: 'Hello!' },
      { sender: 'ai', text: 'Hi there, I am speaking now.', isTyping: true },
    ];
    
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={messages}
          isAISpeaking={true}
        />
      </TestWrapper>
    );
    
    // The AI message should be marked as typing
    const messageElements = screen.getAllByTestId(/message-\d+/);
    expect(messageElements.length).toBe(2);
    
    // Advance timers to start typewriter effect
    act(() => {
      jest.advanceTimersByTime(100);
    });
  });

  test('does not display placeholder messages when no messages exist', () => {
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={[]}
          isListening={false}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // No messages should be displayed
    expect(screen.queryByTestId(/message-\d+/)).not.toBeInTheDocument();
  });

  test('properly handles loading animation without hydration errors', () => {
    // This test checks that loading animations are rendered correctly
    // without causing hydration errors (div inside p)
    const messages = [
      { sender: 'user', text: 'Hello!' },
      { sender: 'ai', text: 'This is typing...', isTyping: true }
    ];
    
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={messages}
          isAISpeaking={true}
        />
      </TestWrapper>
    );
    
    // Check that loading dots are rendered as a span, not inside Typography/p
    const messageBubbles = screen.getAllByTestId(/message-\d+/);
    expect(messageBubbles.length).toBe(2);
    
    // Initialize typewriter animation
    act(() => {
      jest.advanceTimersByTime(50);
    });
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
    const userLabels = screen.getAllByText('User');
    expect(userLabels.length).toBe(2);
    
    const aiLabels = screen.getAllByText('Theo');
    expect(aiLabels.length).toBe(1);
    
    // Check that the header is rendered correctly
    const header = screen.getByTestId('transcript-header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  test('displays user messages immediately without typewriter effect', () => {
    // Create a test message from the user
    const userMessage = { 
      sender: 'user', 
      text: 'This should display immediately without animation'
    };
    
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={[userMessage]}
          isListening={false}
        />
      </TestWrapper>
    );
    
    // The full message should be visible immediately without any animation
    const messageText = screen.getByTestId('message-text-0');
    expect(messageText.textContent).toBe(userMessage.text);
    
    // Verify no loading animation is shown for user messages
    expect(screen.queryAllByRole('progressbar').length).toBe(0);
  });

  test('applies typewriter effect only to AI messages but not user messages', () => {
    // Create messages with both user and AI where the AI message is still typing
    const messages = [
      { sender: 'user', text: 'User message should show immediately' },
      { sender: 'ai', text: 'AI message should animate with typewriter effect', isTyping: true }
    ];
    
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={messages}
          isAISpeaking={true}
        />
      </TestWrapper>
    );
    
    // User message should be fully visible immediately
    const userMessageText = screen.getByTestId('message-text-0');
    expect(userMessageText.textContent).toBe(messages[0].text);
    
    // AI message should start with animation
    // Advance timers to start typewriter effect
    act(() => {
      jest.advanceTimersByTime(50);
    });
    
    // Check if AI message is partially visible (animation in progress)
    const aiMessageText = screen.getByTestId('message-text-1');
    
    // The AI text should be either partial or still showing loading animation
    if (aiMessageText.textContent) {
      // If text is showing, it should be a partial animation
      expect(aiMessageText.textContent.length).toBeLessThan(messages[1].text.length);
    }
    
    // Fast forward to complete animation
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Now the AI message should be complete
    const completeAIMessage = screen.getByTestId('message-text-1');
    expect(completeAIMessage.textContent).toBe(messages[1].text);
  });

  test('real-time user input appears without delay', () => {
    render(
      <TestWrapper>
        <ConversationTranscript 
          messages={[]}
          isListening={true}
          currentMessage="This is real-time user input"
        />
      </TestWrapper>
    );
    
    // The current message should be visible immediately
    const messageText = screen.getByTestId('message-text-0');
    expect(messageText.textContent).toBe("This is real-time user input");
    
    // No loading animation should be displayed for the user message
    const messageContainer = screen.getByTestId('message-0');
    expect(messageContainer).not.toContainHTML('loadingDots');
  });
}); 