import { renderHook, act } from '@testing-library/react';
import { useConversation } from '../../hooks/useConversation';

// Mock timer functions
jest.useFakeTimers();

describe('useConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty messages', () => {
    const { result } = renderHook(() => useConversation());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.conversationData.messages).toEqual([]);
    expect(result.current.currentMessage).toBe('');
    expect(result.current.conversationData.sessionStart).toBeDefined();
    expect(result.current.conversationData.sessionEnd).toBeNull();
  });

  test('initializes with provided messages', () => {
    const initialMessages = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi, how can I help?' }
    ];
    
    const { result } = renderHook(() => useConversation(initialMessages));
    
    expect(result.current.messages).toEqual(initialMessages);
    expect(result.current.conversationData.messages).toEqual(initialMessages);
    expect(result.current.currentMessage).toBe('');
  });

  test('updates current message', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.updateCurrentMessage('Hello, AI!');
    });
    
    expect(result.current.currentMessage).toBe('Hello, AI!');
  });

  test('submits current message without animation', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.updateCurrentMessage('Hello, AI!');
    });
    
    act(() => {
      result.current.submitCurrentMessage();
    });
    
    // Check message has sender, timestamp and name properties
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].sender).toBe('user');
    expect(result.current.messages[0].text).toBe('Hello, AI!');
    expect(result.current.messages[0].isTyping).toBe(false);
    expect(result.current.messages[0].senderName).toBe('User');
    expect(result.current.messages[0].timestamp).toBeDefined();
    
    // Verify processingUserInput is set to true initially
    expect(result.current.processingUserInput).toBe(true);
    
    // Fast forward to processing completion
    act(() => {
      jest.advanceTimersByTime(300); // Reduced from 500ms to 300ms in our changes
    });
    
    // Verify processingUserInput is reset
    expect(result.current.processingUserInput).toBe(false);
  });

  test('returns empty string when submitting empty message', () => {
    const { result } = renderHook(() => useConversation([]));
    
    let returnValue;
    act(() => {
      returnValue = result.current.submitCurrentMessage();
    });
    
    expect(returnValue).toBe('');
    expect(result.current.messages).toEqual([]);
  });

  test('adds AI response', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.addAIResponse('I am an AI assistant.');
    });
    
    // Forward timers to simulate typing animation completion
    jest.advanceTimersByTime(100);
    
    // Check message has expected properties
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].sender).toBe('ai');
    expect(result.current.messages[0].senderName).toBe('Theo');
    expect(result.current.messages[0].text).toBe('I am an AI assistant.');
    expect(result.current.messages[0].isTyping).toBe(true);
    expect(result.current.messages[0].timestamp).toBeDefined();
    
    // Complete the animation
    jest.advanceTimersByTime(2000);
  });

  test('clears conversation', () => {
    const initialMessages = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi, how can I help?' }
    ];
    
    const { result } = renderHook(() => useConversation(initialMessages));
    
    act(() => {
      result.current.clearConversation();
    });
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.conversationData.messages).toEqual([]);
    expect(result.current.currentMessage).toBe('');
    expect(result.current.conversationData.sessionStart).toBeDefined();
    expect(result.current.conversationData.sessionEnd).toBeNull();
  });

  test('handles user transcript without animation delay', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.handleUserTranscript('This is a test transcript');
    });
    
    // Check message has expected properties
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].sender).toBe('user');
    expect(result.current.messages[0].senderName).toBe('User');
    expect(result.current.messages[0].text).toBe('This is a test transcript');
    expect(result.current.messages[0].isTyping).toBe(false);
    expect(result.current.messages[0].timestamp).toBeDefined();
    
    // Check that currentMessage is reset immediately
    expect(result.current.currentMessage).toBe('');
    
    // Verify processingUserInput state
    expect(result.current.processingUserInput).toBe(true);
    
    // Complete the delay for processing state reset
    act(() => {
      jest.advanceTimersByTime(300); // Reduced from 500ms to 300ms
    });
    
    expect(result.current.processingUserInput).toBe(false);
  });
  
  test('handles AI transcript', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.handleAITranscript('AI response transcript');
    });
    
    // Check message has expected properties
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].sender).toBe('ai');
    expect(result.current.messages[0].senderName).toBe('Theo');
    expect(result.current.messages[0].text).toBe('AI response transcript');
    expect(result.current.messages[0].isTyping).toBe(true);
    expect(result.current.messages[0].timestamp).toBeDefined();
    
    // Complete typing animation
    act(() => {
      jest.advanceTimersByTime(2000);
    });
  });
  
  test('handles empty transcripts gracefully', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.handleUserTranscript('');
      result.current.handleAITranscript('');
    });
    
    // No messages should be added for empty transcripts
    expect(result.current.messages).toEqual([]);
  });

  test('endSession sets sessionEnd timestamp', () => {
    const { result } = renderHook(() => useConversation([]));
    
    act(() => {
      result.current.endSession();
    });
    
    expect(result.current.conversationData.sessionEnd).toBeDefined();
  });
}); 