/**
 * Session Recorder Service
 * Handles recording of session audio and metadata collection
 */
import audioRecorder from '../utils/audioRecorder';

class SessionRecorderService {
  constructor() {
    this.isRecording = false;
    this.sessionStartTime = null;
    this.sessionEndTime = null;
    this.functionCalls = [];
    this.metadata = {
      functionCallCount: 0,
      functionCalls: [],
      duration: 0,
      date: null,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Start recording a new session
   * @param {MediaStreamTrack} localTrack - Local microphone track
   * @param {MediaStreamTrack} remoteTrack - Remote assistant track (optional)
   * @returns {Promise<void>}
   */
  async startSession(localTrack, remoteTrack = null) {
    if (this.isRecording) {
      console.log('Session recording already in progress');
      return;
    }

    console.log('Starting session recording');
    this.isRecording = true;
    this.sessionStartTime = new Date();
    
    // Reset metadata for new session
    this.functionCalls = [];
    this.metadata = {
      functionCallCount: 0,
      functionCalls: [],
      duration: 0,
      date: this.sessionStartTime.toISOString().split('T')[0],
      startTime: this.sessionStartTime.toTimeString().split(' ')[0],
      endTime: null
    };
    
    // Start audio recording
    try {
      await audioRecorder.startRecording(localTrack, remoteTrack);
      console.log('Session recording started successfully');
    } catch (error) {
      console.error('Failed to start session recording:', error);
      this.isRecording = false;
    }
  }

  /**
   * Record a function call during the session
   * @param {string} functionName - Name of the function called
   * @param {Object} params - Parameters passed to the function
   */
  recordFunctionCall(functionName, params) {
    if (!this.isRecording) {
      console.warn('Cannot record function call - no active session');
      return;
    }

    const callTime = new Date();
    
    // Add to chronological list of function calls
    this.functionCalls.push({
      functionName,
      params,
      timestamp: callTime.toISOString(),
      relativeTimeMs: callTime - this.sessionStartTime
    });
    
    // Update metadata
    this.metadata.functionCallCount = this.functionCalls.length;
    this.metadata.functionCalls = this.functionCalls.map(call => call.functionName);
  }

  /**
   * End the current session and save the recording
   * @returns {Promise<Object>} Session data including audio and metadata
   */
  async endSession() {
    if (!this.isRecording) {
      console.warn('No active session to end');
      return null;
    }

    console.log('Ending session recording');
    this.isRecording = false;
    this.sessionEndTime = new Date();
    
    // Update metadata with end time and duration
    this.metadata.endTime = this.sessionEndTime.toTimeString().split(' ')[0];
    this.metadata.duration = (this.sessionEndTime - this.sessionStartTime) / 1000; // in seconds
    
    // Stop audio recording
    try {
      const audioData = await audioRecorder.stopRecording();
      
      if (!audioData) {
        console.warn('No audio data recorded for session');
        return {
          metadata: this.metadata,
          functionCalls: this.functionCalls
        };
      }
      
      // Send data to backend
      await this.saveSessionData(audioData);
      
      return {
        audio: audioData,
        metadata: this.metadata,
        functionCalls: this.functionCalls
      };
    } catch (error) {
      console.error('Error ending session recording:', error);
      return null;
    }
  }

  /**
   * Save session data to backend
   * @param {Object} audioData - Audio recording data
   * @returns {Promise<Object>} Response from the server
   */
  async saveSessionData(audioData) {
    try {
      console.log('Saving session data to backend');
      
      const response = await fetch('http://localhost:3000/audio/save-audio-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: audioData,
          metadata: this.metadata,
          functionCalls: this.functionCalls
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save session data: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Session data saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving session data:', error);
      throw error;
    }
  }
}

// Export as singleton
const sessionRecorder = new SessionRecorderService();
export default sessionRecorder; 