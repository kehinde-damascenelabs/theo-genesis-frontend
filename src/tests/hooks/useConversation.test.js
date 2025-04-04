import { renderHook, act } from '@testing-library/react';
import { useConversation } from '../../hooks/useConversation';

describe('useConversation', () => {
  test('initializes with empty messages', () => {
    const { result } = renderHook(() => useConversation());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentMessage).toBe('');
  });

  test('initializes with provided messages', () => {
    const initialMessages = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi there' }
    ];
    
    const { result } = renderHook(() => useConversation(initialMessages));
    
    expect(result.current.messages).toEqual(initialMessages);
  });

  test('updates current message', () => {
    const { result } = renderHook(() => useConversation());
    
    act(() => {
      result.current.updateCurrentMessage('Hello, AI!');
    });
    
    expect(result.current.currentMessage).toBe('Hello, AI!');
  });

  test('submits current message', () => {
    const { result } = renderHook(() => useConversation());
    
    act(() => {
      result.current.updateCurrentMessage('Hello, AI!');
    });
    
    act(() => {
      result.current.submitCurrentMessage();
    });
    
    expect(result.current.messages).toEqual([
      { sender: 'user', text: 'Hello, AI!' }
    ]);
    expect(result.current.currentMessage).toBe('');
  });

  test('does not submit empty messages', () => {
    const { result } = renderHook(() => useConversation());
    
    act(() => {
      result.current.updateCurrentMessage('   ');
    });
    
    act(() => {
      result.current.submitCurrentMessage();
    });
    
    expect(result.current.messages).toEqual([]);
  });

  test('adds AI response', () => {
    const { result } = renderHook(() => useConversation());
    
    act(() => {
      result.current.addAIResponse('I am an AI assistant.');
    });
    
    expect(result.current.messages).toEqual([
      { sender: 'ai', text: 'I am an AI assistant.' }
    ]);
  });

  test('clears conversation', () => {
    const initialMessages = [
      { sender: 'user', text: 'Hello' },
      { sender: 'ai', text: 'Hi there' }
    ];
    
    const { result } = renderHook(() => useConversation(initialMessages));
    
    act(() => {
      result.current.updateCurrentMessage('New message');
    });
    
    act(() => {
      result.current.clearConversation();
    });
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentMessage).toBe('');
  });
}); 