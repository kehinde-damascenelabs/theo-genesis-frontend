import { stopConnection } from '../../service/realtimeAPI/stopConnection';

describe('stopConnection', () => {
  // Mock the connection objects
  let mockConnection;
  
  // Create replacement mocks for console
  let originalConsoleLog;
  let originalConsoleError;
  
  beforeAll(() => {
    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    
    // Replace with mocks
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  afterAll(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a fresh mock connection for each test
    mockConnection = {
      // Mock peer connection
      pc: {
        close: jest.fn(),
        ontrack: jest.fn(),
        onconnectionstatechange: jest.fn(),
        getSenders: jest.fn().mockReturnValue([
          { track: { stop: jest.fn() } },
          { track: null }, // Test case with no track
          { track: { stop: jest.fn() } }
        ]),
        getReceivers: jest.fn().mockReturnValue([
          { track: { stop: jest.fn() } },
          { track: null }, // Test case with no track
          { track: { stop: jest.fn() } }
        ])
      },
      
      // Mock data channel
      dc: {
        readyState: 'open',
        close: jest.fn(),
        removeEventListener: jest.fn()
      },
      
      // Mock audio element
      audioEl: {
        pause: jest.fn(),
        autoplay: true,
        srcObject: {},
        load: jest.fn(),
        remove: jest.fn()
      }
    };
  });
  
  test('stops and cleans up all connection components', () => {
    // Call the function
    stopConnection(mockConnection);
    
    // Test data channel cleanup
    expect(mockConnection.dc.close).toHaveBeenCalled();
    expect(mockConnection.dc.removeEventListener).toHaveBeenCalledWith('message', null);
    expect(mockConnection.dc.removeEventListener).toHaveBeenCalledWith('open', null);
    
    // Test audio element cleanup
    expect(mockConnection.audioEl.pause).toHaveBeenCalled();
    expect(mockConnection.audioEl.autoplay).toBe(false);
    expect(mockConnection.audioEl.srcObject).toBeNull();
    expect(mockConnection.audioEl.load).toHaveBeenCalled();
    expect(mockConnection.audioEl.remove).toHaveBeenCalled();
    
    // Test peer connection cleanup
    // Should stop all tracks from senders
    const senderTracks = mockConnection.pc.getSenders().filter(sender => sender.track);
    senderTracks.forEach(sender => {
      expect(sender.track.stop).toHaveBeenCalled();
    });
    
    // Should stop all tracks from receivers
    const receiverTracks = mockConnection.pc.getReceivers().filter(receiver => receiver.track);
    receiverTracks.forEach(receiver => {
      expect(receiver.track.stop).toHaveBeenCalled();
    });
    
    // Should reset event listeners
    expect(mockConnection.pc.ontrack).toBeNull();
    expect(mockConnection.pc.onconnectionstatechange).toBeNull();
    
    // Should close the connection
    expect(mockConnection.pc.close).toHaveBeenCalled();
    
    // Should log completion message
    expect(console.log).toHaveBeenCalledWith('Connection fully closed and cleaned up.');
  });
  
  test('handles null or undefined connection components gracefully', () => {
    // Create a connection with missing parts
    const incompleteConnection = {
      pc: null,
      dc: undefined,
      audioEl: null
    };
    
    // Should not throw an error
    expect(() => stopConnection(incompleteConnection)).not.toThrow();
    
    // Should still log completion
    expect(console.log).not.toHaveBeenCalled();
  });
  
  test('handles closed data channel gracefully', () => {
    // Set data channel to closed state
    mockConnection.dc.readyState = 'closed';
    
    // Call the function
    stopConnection(mockConnection);
    
    // Should not try to close already closed data channel
    expect(mockConnection.dc.close).not.toHaveBeenCalled();
    
    // But should still remove event listeners
    expect(mockConnection.dc.removeEventListener).toHaveBeenCalledWith('message', null);
    expect(mockConnection.dc.removeEventListener).toHaveBeenCalledWith('open', null);
  });
  
  test('handles errors during cleanup gracefully', () => {
    // Make one of the methods throw an error
    mockConnection.pc.close.mockImplementation(() => {
      throw new Error('Failed to close connection');
    });
    
    // Expect no error to be thrown
    expect(() => {
      stopConnection(mockConnection);
    }).not.toThrow();
    
    // Verify other cleanup operations still happened
    expect(mockConnection.dc.close).toHaveBeenCalled();
    expect(mockConnection.audioEl.pause).toHaveBeenCalled();
  });
  
  test('cleans up each component independently', () => {
    // Create partial connections to test each part separately
    
    // 1. Test with only data channel
    const dcOnlyConnection = { dc: mockConnection.dc };
    stopConnection(dcOnlyConnection);
    expect(mockConnection.dc.close).toHaveBeenCalled();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // 2. Test with only audio element
    const audioOnlyConnection = { audioEl: mockConnection.audioEl };
    stopConnection(audioOnlyConnection);
    expect(mockConnection.audioEl.pause).toHaveBeenCalled();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // 3. Test with only peer connection
    const pcOnlyConnection = { pc: mockConnection.pc };
    stopConnection(pcOnlyConnection);
    expect(mockConnection.pc.close).toHaveBeenCalled();
  });
}); 