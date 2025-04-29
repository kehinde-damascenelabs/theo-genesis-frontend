import { startConnection } from '../../service/realtimeAPI/startConnection';

// Mock fetch
global.fetch = jest.fn();

// Mock RTCPeerConnection and related methods
const mockTrack = { id: 'mock-track' };
const mockStream = {
  getTracks: jest.fn().mockReturnValue([mockTrack])
};

const mockDataChannel = {
  addEventListener: jest.fn(),
  send: jest.fn()
};

const mockPeerConnection = {
  onconnectionstatechange: null,
  ontrack: null,
  addTrack: jest.fn(),
  createDataChannel: jest.fn().mockReturnValue(mockDataChannel),
  createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp-offer' }),
  setLocalDescription: jest.fn().mockResolvedValue(undefined),
  setRemoteDescription: jest.fn().mockResolvedValue(undefined),
  close: jest.fn()
};

// Mock audio element
const mockAudioElement = {
  autoplay: false,
  srcObject: null
};

// Mock navigator.mediaDevices
const originalMediaDevices = global.navigator.mediaDevices;

// Mock document.createElement
const originalCreateElement = document.createElement;

describe('startConnection', () => {
  beforeAll(() => {
    // Mock RTCPeerConnection
    global.RTCPeerConnection = jest.fn().mockImplementation(() => mockPeerConnection);
    
    // Mock navigator.mediaDevices
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue(mockStream)
    };
    
    // Mock document.createElement
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'audio') {
        return mockAudioElement;
      }
      return originalCreateElement.call(document, tagName);
    });
  });
  
  afterAll(() => {
    // Restore original implementations
    global.navigator.mediaDevices = originalMediaDevices;
    document.createElement = originalCreateElement;
  });
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default fetch mock implementations
    global.fetch.mockImplementation(async (url) => {
      if (url.includes('getEKey')) {
        return {
          json: async () => ({ ephemeralKey: 'mock-ephemeral-key' })
        };
      }
      if (url.includes('api.openai.com/v1/realtime')) {
        return {
          text: async () => 'mock-sdp-answer'
        };
      }
      throw new Error(`Unhandled fetch to ${url}`);
    });
  });
  
  test('successfully establishes a WebRTC connection', async () => {
    // Mock callbacks
    const mockCallbacks = {
      onUserTranscript: jest.fn(),
      onAITranscript: jest.fn(),
      onAISpeakingStateChange: jest.fn()
    };
    
    // Call the function with callbacks
    const result = await startConnection(mockCallbacks);
    
    // Verify ephemeral key was fetched
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/getEKey');
    
    // Verify RTCPeerConnection was created
    expect(global.RTCPeerConnection).toHaveBeenCalled();
    
    // Verify user media was accessed
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    
    // Verify track was added to the peer connection
    expect(mockPeerConnection.addTrack).toHaveBeenCalledWith(mockTrack);
    
    // Verify audio element was created
    expect(document.createElement).toHaveBeenCalledWith('audio');
    expect(mockAudioElement.autoplay).toBe(true);
    
    // Verify data channel was created
    expect(mockPeerConnection.createDataChannel).toHaveBeenCalledWith('oai-events');
    
    // Verify offer was created and set as local description
    expect(mockPeerConnection.createOffer).toHaveBeenCalled();
    expect(mockPeerConnection.setLocalDescription).toHaveBeenCalledWith({ type: 'offer', sdp: 'mock-sdp-offer' });
    
    // Verify SDP offer was sent to OpenAI API
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
      expect.objectContaining({
        method: 'POST',
        body: 'mock-sdp-offer',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-ephemeral-key',
          'Content-Type': 'application/sdp'
        })
      })
    );
    
    // Verify remote description was set
    expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalledWith({ 
      type: 'answer', 
      sdp: 'mock-sdp-answer' 
    });
    
    // Verify data channel event listener was added
    expect(mockDataChannel.addEventListener).toHaveBeenCalledWith('open', expect.any(Function));
    
    // Trigger the 'open' event handler
    const openEventHandler = mockDataChannel.addEventListener.mock.calls.find(
      call => call[0] === 'open'
    )[1];
    openEventHandler();
    
    // Verify initial messages were sent
    expect(mockDataChannel.send).toHaveBeenCalled();
    
    // Verify the structure of messages without requiring exact equality
    const calls = mockDataChannel.send.mock.calls;
    expect(calls.length).toBe(2);
    
    // Parse first call (session.update message)
    const sessionUpdateMessage = JSON.parse(calls[0][0]);
    expect(sessionUpdateMessage.type).toBe('session.update');
    expect(sessionUpdateMessage.session.modalities).toEqual(['text', 'audio']);
    expect(sessionUpdateMessage.session.input_audio_transcription).toEqual({ model: 'whisper-1' });
    expect(sessionUpdateMessage.session.temperature).toBe(0.6);
    expect(sessionUpdateMessage.session.max_response_output_tokens).toBe(4096);
    expect(sessionUpdateMessage.session.tool_choice).toBe('auto');
    expect(sessionUpdateMessage.session.instructions).toBeTruthy();
    expect(Array.isArray(sessionUpdateMessage.session.tools)).toBeTruthy();
    
    // Parse second call (response.create message)
    const responseCreateMessage = JSON.parse(calls[1][0]);
    expect(responseCreateMessage.type).toBe('response.create');
    
    // Verify the returned connection object
    expect(result).toEqual({
      pc: mockPeerConnection,
      dc: mockDataChannel,
      audioEl: mockAudioElement
    });
  });
  
  test('handles error when fetching ephemeral key fails', async () => {
    // Mock fetch to reject
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    // Expect the function to throw
    await expect(startConnection()).rejects.toThrow('Network error');
    
    // Verify RTCPeerConnection was not created
    expect(global.RTCPeerConnection).not.toHaveBeenCalled();
  });
  
  test('handles error when getUserMedia fails', async () => {
    // Mock getUserMedia to reject
    navigator.mediaDevices.getUserMedia.mockImplementationOnce(() => 
      Promise.reject(new Error('Permission denied'))
    );
    
    // Expect the function to throw
    await expect(startConnection()).rejects.toThrow('Permission denied');
    
    // Verify we didn't proceed to create an offer
    expect(mockPeerConnection.createOffer).not.toHaveBeenCalled();
  });
  
  test('handles error when OpenAI API request fails', async () => {
    // Mock fetch to succeed for ephemeral key but fail for OpenAI API
    global.fetch
      .mockImplementationOnce(() => ({
        json: async () => ({ ephemeralKey: 'mock-ephemeral-key' })
      }))
      .mockImplementationOnce(() => Promise.reject(new Error('API error')));
    
    // Expect the function to throw
    await expect(startConnection()).rejects.toThrow('API error');
    
    // Verify we didn't proceed to set remote description
    expect(mockPeerConnection.setRemoteDescription).not.toHaveBeenCalled();
  });
  
  test('handles failed response from AI', async () => {
    // Mock message event with failure data
    const mockMessageEvent = {
      data: JSON.stringify({
        type: 'response.done',
        response: {
          status: 'failed',
          status_details: {
            error: {
              message: 'AI processing failed'
            }
          }
        }
      })
    };
    
    // Make sure mockPeerConnection.close is properly defined
    mockPeerConnection.close = jest.fn();
    
    // Call the function
    const result = await startConnection();
    
    // Capture the message event handler
    const messageHandler = mockDataChannel.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )[1];
    
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Trigger the message event with failure data
    messageHandler(mockMessageEvent);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith(
      'AI Connection Error:',
      'AI processing failed'
    );
    
    // Verify connection was closed
    expect(mockPeerConnection.close).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('calls transcript callbacks when receiving transcript events', async () => {
    // Mock callbacks
    const mockCallbacks = {
      onUserTranscript: jest.fn(),
      onAITranscript: jest.fn(),
      onAISpeakingStateChange: jest.fn()
    };
    
    // Call the function with callbacks
    const result = await startConnection(mockCallbacks);
    
    // Capture the message event handler
    const messageHandler = mockDataChannel.addEventListener.mock.calls.find(
      call => call[0] === 'message'
    )[1];
    
    // Mock AI transcript event
    const aiTranscriptEvent = {
      data: JSON.stringify({
        type: 'response.audio_transcript.done',
        transcript: 'This is an AI transcript'
      })
    };
    
    // Trigger AI transcript event
    messageHandler(aiTranscriptEvent);
    
    // Verify AI transcript callback was called
    expect(mockCallbacks.onAITranscript).toHaveBeenCalledWith('This is an AI transcript');
    
    // Mock user transcript event
    const userTranscriptEvent = {
      data: JSON.stringify({
        type: 'conversation.item.input_audio_transcription.completed',
        transcript: 'This is a user transcript'
      })
    };
    
    // Trigger user transcript event
    messageHandler(userTranscriptEvent);
    
    // Verify user transcript callback was called
    expect(mockCallbacks.onUserTranscript).toHaveBeenCalledWith('This is a user transcript');
    
    // Mock AI speaking state events
    const aiSpeakingStartEvent = {
      data: JSON.stringify({
        type: 'response.audio.generation.started'
      })
    };
    
    const aiSpeakingEndEvent = {
      data: JSON.stringify({
        type: 'response.audio.generation.done'
      })
    };
    
    // Trigger AI speaking state events
    messageHandler(aiSpeakingStartEvent);
    messageHandler(aiSpeakingEndEvent);
    
    // Verify AI speaking state callbacks were called
    expect(mockCallbacks.onAISpeakingStateChange).toHaveBeenCalledWith(true);
    expect(mockCallbacks.onAISpeakingStateChange).toHaveBeenCalledWith(false);
  });
}); 