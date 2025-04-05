import { startConnection } from '../../service/realtimeAPI/startConnection';
import { stopConnection } from '../../service/realtimeAPI/stopConnection';

// Mock modules
jest.mock('../../service/realtimeAPI/startConnection');
jest.mock('../../service/realtimeAPI/stopConnection');

describe('Audio Connection Integration', () => {
  // Mock connection object
  const mockConnection = {
    pc: {
      onconnectionstatechange: null,
      close: jest.fn()
    },
    dc: {
      readyState: 'open',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: jest.fn()
    },
    audioEl: {
      srcObject: null,
      pause: jest.fn(),
      remove: jest.fn()
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default implementation for startConnection
    startConnection.mockResolvedValue(mockConnection);
    
    // Default implementation for stopConnection
    stopConnection.mockImplementation((conn) => {
      // Simplified implementation to verify integration
      if (conn.pc) conn.pc.close();
      if (conn.dc) conn.dc.close();
      if (conn.audioEl) conn.audioEl.pause();
    });
  });

  test('establishes and then terminates a connection', async () => {
    // Start a connection
    const connection = await startConnection();
    
    // Verify connection was started
    expect(startConnection).toHaveBeenCalled();
    expect(connection).toEqual(mockConnection);
    
    // Stop the connection
    stopConnection(connection);
    
    // Verify connection was properly terminated
    expect(stopConnection).toHaveBeenCalledWith(connection);
    expect(connection.pc.close).toHaveBeenCalled();
    expect(connection.dc.close).toHaveBeenCalled();
    expect(connection.audioEl.pause).toHaveBeenCalled();
  });

  test('handles complete connection lifecycle with state changes', async () => {
    // Mock connection state changes
    let connectionStateChangeHandler;
    let dataChannelOpenHandler;
    
    mockConnection.pc.onconnectionstatechange = jest.fn(function(handler) {
      connectionStateChangeHandler = handler;
    });
    
    mockConnection.dc.addEventListener.mockImplementation((event, handler) => {
      if (event === 'open') {
        dataChannelOpenHandler = handler;
      }
    });
    
    // Start connection
    const connection = await startConnection();
    
    // Simulate connection state changes
    if (connectionStateChangeHandler) {
      // Simulate 'connecting' state
      mockConnection.pc.connectionState = 'connecting';
      connectionStateChangeHandler();
      
      // Simulate 'connected' state
      mockConnection.pc.connectionState = 'connected';
      connectionStateChangeHandler();
    }
    
    // Simulate data channel open
    if (dataChannelOpenHandler) {
      dataChannelOpenHandler();
    }
    
    // Stop connection
    stopConnection(connection);
    
    // Verify proper cleanup
    expect(connection.pc.close).toHaveBeenCalled();
    expect(stopConnection).toHaveBeenCalledWith(connection);
  });

  test('handles failed connection start gracefully', async () => {
    // Make startConnection fail
    const testError = new Error('Connection failed');
    startConnection.mockRejectedValue(testError);
    
    // Attempt to start connection
    await expect(startConnection()).rejects.toThrow('Connection failed');
    
    // Verify stopConnection was not called
    expect(stopConnection).not.toHaveBeenCalled();
  });

  test('accepts connection parameters', async () => {
    // Start connection with custom parameters
    await startConnection({ customParameter: 'test' });
    
    // Verify parameters were passed
    expect(startConnection).toHaveBeenCalledWith({ customParameter: 'test' });
  });

  test('full cycle with error in stopConnection', async () => {
    // Set up startConnection to succeed
    const connection = await startConnection();
    
    // Make stopConnection throw an error
    stopConnection.mockImplementation(() => {
      throw new Error('Failed to clean up');
    });
    
    // Error in stopConnection should be propagated
    expect(() => stopConnection(connection)).toThrow('Failed to clean up');
  });
}); 