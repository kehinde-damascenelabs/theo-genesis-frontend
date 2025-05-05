/**
 * WebRTC Audio Recording Utility
 * Records both local and remote audio tracks from a WebRTC connection
 */

class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recording = false;
    this.audioContext = null;
    this.mixedDestination = null;
    this.localGain = null;
    this.remoteGain = null;
    this.hasRemoteTrack = false;
    this.startTime = null;
    this.endTime = null;
    this.tracks = {
      local: null,
      remote: null
    };
    // Store the most recent complete recording
    this.lastRecording = null;
  }

  /**
   * Start recording from WebRTC tracks
   * @param {MediaStreamTrack} localTrack - Local microphone track
   * @param {MediaStreamTrack} remoteTrack - Remote assistant track (optional)
   * @returns {Promise<void>}
   */
  startRecording(localTrack, remoteTrack = null) {
    console.log('startRecording called with tracks:', 
      localTrack ? 'local track available' : 'no local track',
      remoteTrack ? 'remote track available' : 'no remote track');
    
    // Store tracks for restart if needed
    this.tracks.local = localTrack;
    this.tracks.remote = remoteTrack;
    
    if (this.recording) {
      console.log('Recording already in progress, not starting a new one');
      return Promise.resolve();
    }

    if (!localTrack && !remoteTrack) {
      console.error('No tracks provided for recording');
      return Promise.reject(new Error('No tracks provided for recording'));
    }

    return new Promise((resolve, reject) => {
      try {
        // Create audio context for mixing tracks
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mixedDestination = this.audioContext.createMediaStreamDestination();
        
        // Set up local track
        if (localTrack) {
          console.log('Setting up local track for recording');
          const localStream = new MediaStream([localTrack]);
          const localSource = this.audioContext.createMediaStreamSource(localStream);
          this.localGain = this.audioContext.createGain();
          this.localGain.gain.value = 1.0;
          localSource.connect(this.localGain);
          this.localGain.connect(this.mixedDestination);
        }
        
        // Set up remote track if available
        if (remoteTrack) {
          console.log('Setting up remote track for recording');
          this.hasRemoteTrack = true;
          const remoteStream = new MediaStream([remoteTrack]);
          const remoteSource = this.audioContext.createMediaStreamSource(remoteStream);
          this.remoteGain = this.audioContext.createGain();
          this.remoteGain.gain.value = 1.0;
          remoteSource.connect(this.remoteGain);
          this.remoteGain.connect(this.mixedDestination);
        }
        
        // Determine if browser supports WebM
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const mimeType = isSafari ? 'audio/wav' : 'audio/webm;codecs=opus';
        
        // Check if the browser supports the chosen format
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn(`${mimeType} is not supported, falling back to default format`);
        }

        // Create and configure MediaRecorder with mixed stream
        const supportedMimeType = MediaRecorder.isTypeSupported(mimeType) ? mimeType : '';
        console.log(`Creating MediaRecorder with MIME type: ${supportedMimeType || 'default'}`);
        
        this.mediaRecorder = new MediaRecorder(this.mixedDestination.stream, {
          mimeType: supportedMimeType
        });
        
        // Set up event handlers
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log(`Received audio chunk: ${event.data.size} bytes`);
            this.recordedChunks.push(event.data);
          } else {
            console.warn('Received empty audio chunk');
          }
        };
        
        this.mediaRecorder.onstart = () => {
          console.log('MediaRecorder started successfully');
          this.recording = true;
          this.startTime = Date.now();
          resolve();
        };
        
        this.mediaRecorder.onerror = (error) => {
          console.error('MediaRecorder error:', error);
          reject(error);
        };
        
        // Start recording with shorter chunks for more frequent callbacks
        this.mediaRecorder.start(500);
      } catch (error) {
        console.error('Failed to start recording:', error);
        reject(error);
      }
    });
  }

  /**
   * Get the duration of the last recording in seconds
   * @returns {number} Duration in seconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    
    const endTime = this.recording ? Date.now() : this.endTime;
    return (endTime - this.startTime) / 1000;
  }

  /**
   * Stop recording and get the recorded audio as base64
   * @returns {Promise<string>} Base64 encoded audio
   */
  stopRecording() {
    if (!this.recording || !this.mediaRecorder) {
      console.log('No recording in progress');
      
      // If we have a previous recording, return that
      if (this.lastRecording) {
        console.log('Returning previously saved recording');
        return Promise.resolve(this.lastRecording);
      }
      
      // Don't attempt emergency recording - just return null if no active recording
      return Promise.resolve(null);
    }

    return this.stopRecordingInternal();
  }
  
  /**
   * Stop the internal recording
   * @returns {Promise<string>} Base64 encoded audio
   */
  stopRecordingInternal() {
    return new Promise((resolve, reject) => {
      // If the recording was started
      if (this.recording && this.mediaRecorder) {
        // Ensure we record the end time
        this.endTime = Date.now();
        
        console.log(`Stopping recording after ${this.getDuration()} seconds`);
        console.log(`Recorded chunks: ${this.recordedChunks.length}`);
        
        // Save a copy of the chunks in case we need them
        const currentChunks = [...this.recordedChunks];
        
        this.mediaRecorder.onstop = async () => {
          try {
            // Clean up
            this.recording = false;
            
            if (this.audioContext && this.audioContext.state !== 'closed') {
              this.audioContext.close();
            }
            
            if (currentChunks.length === 0) {
              console.warn('No audio data recorded');
              resolve(null);
              return;
            }
            
            // Combine chunks into a single blob
            const audioBlob = new Blob(currentChunks, { 
              type: this.mediaRecorder.mimeType || 'audio/webm' 
            });
            
            console.log(`Audio blob created: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result.split(',')[1];
              console.log(`Converted audio to base64: ${base64data.length} chars`);
              
              const result = {
                data: base64data,
                mimeType: audioBlob.type,
                hasRemoteTrack: this.hasRemoteTrack,
                durationMs: this.startTime ? Date.now() - this.startTime : 0
              };
              
              // Store this recording for future use if needed
              this.lastRecording = result;
              
              // Reset for next recording
              this.recordedChunks = [];
              this.hasRemoteTrack = false;
              this.startTime = null;
              
              resolve(result);
            };
            
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            console.error('Error processing recorded audio:', error);
            resolve(null);
          }
        };
        
        // Stop the recorder if it's not in inactive state
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          console.warn('MediaRecorder already in inactive state');
          this.recording = false;
          
          // Try to process the chunks we have anyway
          if (currentChunks.length > 0) {
            try {
              const audioBlob = new Blob(currentChunks, { 
                type: 'audio/webm' 
              });
              
              console.log(`Audio blob created from saved chunks: ${audioBlob.size} bytes`);
              
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                
                const result = {
                  data: base64data,
                  mimeType: audioBlob.type,
                  hasRemoteTrack: this.hasRemoteTrack,
                  durationMs: this.startTime ? Date.now() - this.startTime : 0
                };
                
                this.lastRecording = result;
                resolve(result);
              };
              
              reader.readAsDataURL(audioBlob);
            } catch (error) {
              console.error('Error processing saved chunks:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      } else {
        reject(new Error('Recording not started'));
      }
    });
  }
}

// Export as singleton
const audioRecorder = new AudioRecorder();

// Make it globally available
if (typeof window !== 'undefined') {
  window.audioRecorder = audioRecorder;
}

export default audioRecorder;