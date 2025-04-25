import { useState, useRef, useEffect, useCallback } from "react";
import { startConnection } from "../service/realtimeAPI/startConnection";
import { stopConnection } from "../service/realtimeAPI/stopConnection";
import { createSilentAudio, requestWakeLock } from '../utils/helper_func';
import { 
  initializeSession, 
  addMessageToSession, 
  addFunctionCallToSession,
  addUserAudioToSession,
  updateSessionMetadata, 
  saveSessionTranscript,
  clearSession
} from '../utils/transcriptService';

export const useMicrophone = ({ onUserTranscript, onAITranscript, messages = [] } = {}) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [functionCalls, setFunctionCalls] = useState([]);
  const connectionRef = useRef(null);
  const barsRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Audio processing refs
  const mergedAnalyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const remoteSourceRef = useRef(null);

  const handleUserTranscript = useCallback((transcript) => {
    if (onUserTranscript && typeof onUserTranscript === 'function') {
      onUserTranscript(transcript);
    }
    
    // Add to session data
    addMessageToSession({
      sender: 'user',
      text: transcript,
      timestamp: new Date().toISOString()
    });
  }, [onUserTranscript]);

  const handleAITranscript = useCallback((transcript) => {
    if (onAITranscript && typeof onAITranscript === 'function') {
      onAITranscript(transcript);
    }
    
    // Add to session data
    addMessageToSession({
      sender: 'ai',
      text: transcript,
      timestamp: new Date().toISOString()
    });
  }, [onAITranscript]);

  const handleAISpeakingStateChange = useCallback((isSpeaking) => {
    setIsAISpeaking(isSpeaking);
  }, []);

  const handleFunctionCall = useCallback((calls) => {
    setFunctionCalls(calls);
    
    // Add the new function call to session data
    if (calls.length > 0) {
      const latestCall = calls[calls.length - 1];
      addFunctionCallToSession(latestCall);
    }
  }, []);

  // Function to handle user audio chunks for transcript saving
  const handleUserAudioData = useCallback((audioBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result.split(',')[1]; // Extract base64 data
      
      // Add to session data
      addUserAudioToSession({
        timestamp: new Date().toISOString(),
        audioData: base64Audio
      });
    };
  }, []);

  const startMicrophone = async () => {
    try {
      setIsConnecting(true);
      
      // Initialize a new session
      initializeSession();
      
      // Record the session start time
      sessionStartTimeRef.current = new Date();

      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create audio processing nodes
      mergedAnalyserRef.current = audioContextRef.current.createAnalyser();
      mergedAnalyserRef.current.fftSize = 512;
      
      gainNodeRef.current = audioContextRef.current.createGain();
      // Connect gain node to audio output
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Start WebRTC connection with callbacks for transcript events
      connectionRef.current = await startConnection({
        onUserTranscript: handleUserTranscript,
        onAITranscript: handleAITranscript,
        onAISpeakingStateChange: handleAISpeakingStateChange,
        onFunctionCall: handleFunctionCall
      });
      
      console.log("AI Connection started", connectionRef.current);

      // Mute the default audio element to prevent double playback
      if (connectionRef.current.audioEl) {
        connectionRef.current.audioEl.muted = true;
      }

      // Set up microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      // Set up MediaRecorder for user audio capture - with MIME type fallbacks
      let options = {};
      const mimeTypes = [
        'audio/webm', 
        'audio/mp4',
        'audio/ogg',
        'audio/wav'
      ];
      
      // Find the first supported MIME type
      for (let type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          options.mimeType = type;
          console.log(`Using supported MIME type: ${type}`);
          break;
        }
      }
      
      try {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      } catch (err) {
        console.warn(`Failed to create MediaRecorder with options: ${JSON.stringify(options)}. Trying without MIME type.`);
        // Try without specifying the MIME type
        mediaRecorderRef.current = new MediaRecorder(stream);
      }
      
      // Handle audio data chunks
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          handleUserAudioData(event.data);
        }
      };
      
      // Start recording in small chunks to get frequent data
      mediaRecorderRef.current.start(1000); // Collect chunks every 1 second

      // Create microphone source and connect ONLY to the analyzer
      const micSource = audioContextRef.current.createMediaStreamSource(stream);
      micSource.connect(mergedAnalyserRef.current);

      // Set up remote audio handling
      if (connectionRef.current.audioEl) {
        const setupRemoteAudio = (stream) => {
          if (stream) {
            // Clean up previous remote source if it exists
            if (remoteSourceRef.current) {
              remoteSourceRef.current.disconnect();
            }

            // Create new remote source
            remoteSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            // Connect remote audio to both analyzer and gain node
            remoteSourceRef.current.connect(mergedAnalyserRef.current);
            remoteSourceRef.current.connect(gainNodeRef.current);
          }
        };

        // Handle initial remote stream if it exists
        if (connectionRef.current.audioEl.srcObject) {
          setupRemoteAudio(connectionRef.current.audioEl.srcObject);
        }

        // Handle new remote streams
        connectionRef.current.pc.ontrack = (e) => {
          connectionRef.current.audioEl.srcObject = e.streams[0];
          setupRemoteAudio(e.streams[0]);
        };
      }

      // Set up wake lock
      wakeLockRef.current = await requestWakeLock();
      if (!wakeLockRef.current) {
        console.warn('Using silent audio fallback to prevent screen dimming.');
        silentAudioRef.current = createSilentAudio();
        silentAudioRef.current.play().catch(console.error);
      }

      // Set up visualization
      const bufferLength = mergedAnalyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animateBars = () => {
        mergedAnalyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        
        // Update visualization if there's significant audio activity
        if (average > 5) {
          barsRef.current.forEach((bar, index) => {
            if (bar) {
              const value = dataArray[index % bufferLength];
              const height = Math.max((value / 255) * 100, 4);
              bar.style.height = `${height}px`;
            }
          });
        }
        
        animationIdRef.current = requestAnimationFrame(animateBars);
      };

      animateBars();
      
      // Add session metadata
      updateSessionMetadata({
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      });
      
      setIsMicOn(true);
    } catch (err) {
      console.error("Error starting microphone and AI:", err);
      stopMicrophone();
    } finally {
      setIsConnecting(false);
    }
  };

  const stopMicrophone = async () => {
    // Stop MediaRecorder if it's active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Save transcript if we have a session and the microphone was on
    if (isMicOn && sessionStartTimeRef.current) {
      try {
        // Calculate session duration
        const sessionDuration = new Date() - sessionStartTimeRef.current;
        
        // Update session metadata before saving
        updateSessionMetadata({
          sessionDuration: sessionDuration,
          sessionDurationFormatted: `${Math.floor(sessionDuration / 60000)}m ${Math.floor((sessionDuration % 60000) / 1000)}s`,
          sessionEndTime: new Date().toISOString(),
          functionCallCount: functionCalls.length,
          endReason: 'user-stopped',
          messageCount: messages.length
        });
        
        console.log('Saving transcript at end of session with data:', {
          messageCount: messages.length,
          messageData: messages.map(m => ({ sender: m.sender, textPreview: m.text.substring(0, 30) })),
          functionCallsCount: functionCalls.length,
          sessionDuration: `${Math.floor(sessionDuration / 60000)}m ${Math.floor((sessionDuration % 60000) / 1000)}s`
        });
        
        // Save transcript with all accumulated data
        await saveSessionTranscript();
      } catch (error) {
        console.error('Failed to save transcript:', error);
      }
    } else {
      clearSession();
    }

    // Clean up WebRTC connection
    if (connectionRef.current) {
      stopConnection(connectionRef.current);
      connectionRef.current = null;
    }

    // Clean up audio streams
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }

    // Clean up remote source
    if (remoteSourceRef.current) {
      remoteSourceRef.current.disconnect();
      remoteSourceRef.current = null;
    }

    // Clean up Web Audio nodes
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    if (mergedAnalyserRef.current) {
      mergedAnalyserRef.current.disconnect();
      mergedAnalyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop animation
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    // Reset visualization
    barsRef.current.forEach(bar => {
      if (bar) bar.style.height = "4px";
    });

    // Clean up wake lock
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(console.error);
      wakeLockRef.current = null;
    }

    // Stop silent audio
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current = null;
    }

    setIsMicOn(false);
    setIsAISpeaking(false);
    sessionStartTimeRef.current = null;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isMicOn) {
        stopMicrophone();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMicOn]);

  // Save transcript when component unmounts if the session is active
  useEffect(() => {
    return () => {
      if (isMicOn) {
        saveSessionTranscript({
          sessionEndReason: 'component-unmounted',
          sessionEndTime: new Date().toISOString()
        }).catch(err => console.error('Failed to save transcript on unmount:', err));
      }
    };
  }, [isMicOn]);

  return { 
    isMicOn, 
    isConnecting, 
    isAISpeaking,
    startMicrophone, 
    stopMicrophone, 
    barsRef,
    functionCalls
  };
};