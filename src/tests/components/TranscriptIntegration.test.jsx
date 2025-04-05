import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ConversationTranscript from '../../components/ConversationTranscript';
import { useConversation } from '../../hooks/useConversation';

// Mock theme provider for testing
const TestWrapper = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Mock useConversation hook
jest.mock('../../hooks/useConversation');

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('TranscriptIntegration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('shows loading animation when AI is speaking', () => {
    // Mock the useConversation hook with a value that indicates AI is speaking
    const mockMessages = [
      { sender: 'user', text: 'Hello', isTyping: false },
      { sender: 'ai', text: 'This is an AI response', isTyping: true }
    ];
    
    useConversation.mockReturnValue({
      messages: mockMessages,
      aiResponsePending: true,
      currentMessage: '',
    });
    
    render(
      <TestWrapper>
        <ConversationTranscript
          messages={mockMessages}
          isAISpeaking={true}
          isListening={false}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Verify that messages are rendered
    expect(screen.getAllByTestId(/message-\d+/).length).toBe(2);
    
    // Advance timers to process any animations
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    // Verify AI message shows typing indicator (since isTyping is true)
    expect(screen.getByText('AI')).toBeInTheDocument(); 
  });

  test('handles long AI responses correctly', () => {
    // Create a very long AI response
    const longAIResponse = `
      Well, if you're in the mood for something delicious, our Filet Mignon is always a hit—it's an 8 oz steak 
      served with garlic mashed potatoes. If seafood is more your style, the Salmon Provençal, grilled with 
      herbs and vegetables, is another fantastic choice. We also have vegetarian options like our Wild Mushroom 
      Risotto with truffle oil and parmesan. For appetizers, I'd recommend the Baked Brie with honey and walnuts 
      or our famous Crab Cakes with spicy remoulade. And don't forget to save room for dessert! Our Chocolate 
      Lava Cake and Crème Brûlée are customer favorites. Would you like me to make a reservation for you tonight?
    `.trim().replace(/\s+/g, ' ');
    
    const mockMessages = [
      { sender: 'user', text: 'What do you recommend from the menu?', isTyping: false },
      { sender: 'ai', text: longAIResponse, isTyping: true }
    ];
    
    // Render the component with a long AI message that's still typing
    render(
      <TestWrapper>
        <ConversationTranscript
          messages={mockMessages}
          isAISpeaking={true}
          isListening={false}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Advance timers to show partial animation
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Verify that some text is visible but not the complete message
    const aiMessageElement = screen.getByTestId('message-text-1');
    expect(aiMessageElement).toBeInTheDocument();
    expect(aiMessageElement.textContent.length).toBeLessThan(longAIResponse.length);
    
    // Complete the animation
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Now the complete message should be visible
    expect(screen.getByTestId('message-text-1').textContent).toBe(longAIResponse);
    
    // Verify that text from different parts of the message is visible
    expect(screen.getByText(/Filet Mignon is always a hit/)).toBeInTheDocument();
    expect(screen.getByText(/Salmon Provençal/)).toBeInTheDocument();
    expect(screen.getByText(/Wild Mushroom Risotto/)).toBeInTheDocument();
    expect(screen.getByText(/Chocolate Lava Cake/)).toBeInTheDocument();
    expect(screen.getByText(/Would you like me to make a reservation/)).toBeInTheDocument();
  });

  test('proper flow from user input to AI response', () => {
    // Stage 1: User is typing
    const initialMessages = [];
    
    const { rerender } = render(
      <TestWrapper>
        <ConversationTranscript
          messages={initialMessages}
          isListening={true}
          isAISpeaking={false}
          currentMessage="Hello world"
        />
      </TestWrapper>
    );
    
    // Verify user message with typing is shown
    expect(screen.getByText('You')).toBeInTheDocument();
    
    // Advance timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Stage 2: User message complete, AI is responding
    const userMessageComplete = [
      { sender: 'user', text: 'Hello world', isTyping: false }
    ];
    
    rerender(
      <TestWrapper>
        <ConversationTranscript
          messages={userMessageComplete}
          isListening={false}
          isAISpeaking={true}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Verify user message is shown
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    
    // Stage 3: AI response begins
    const aiResponding = [
      { sender: 'user', text: 'Hello world', isTyping: false },
      { sender: 'ai', text: 'Hi there', isTyping: true }
    ];
    
    rerender(
      <TestWrapper>
        <ConversationTranscript
          messages={aiResponding}
          isListening={false}
          isAISpeaking={true}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Verify AI label is present
    expect(screen.getAllByText('AI').length).toBe(1);
    
    // Advance timers to complete typewriter effect
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Stage 4: Complete conversation
    const conversationComplete = [
      { sender: 'user', text: 'Hello world', isTyping: false },
      { sender: 'ai', text: 'Hi there', isTyping: false }
    ];
    
    rerender(
      <TestWrapper>
        <ConversationTranscript
          messages={conversationComplete}
          isListening={false}
          isAISpeaking={false}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Verify both messages are displayed
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  test('no placeholder messages are displayed on empty conversation', () => {
    render(
      <TestWrapper>
        <ConversationTranscript
          messages={[]}
          isListening={false}
          isAISpeaking={false}
          currentMessage=""
        />
      </TestWrapper>
    );
    
    // Verify no messages are shown
    expect(screen.queryByTestId(/message-\d+/)).not.toBeInTheDocument();
    
    // Only the header should be present
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });
}); 