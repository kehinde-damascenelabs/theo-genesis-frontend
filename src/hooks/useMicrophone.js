import { useState, useRef, useEffect } from "react";
import { startConnection } from "../service/realtimeAPI/startConnection";
import { stopConnection } from "../service/realtimeAPI/stopConnection";
import { createSilentAudio, requestWakeLock } from '../utils/helper_func';

export const useMicrophone = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionRef = useRef(null);
  const barsRef = useRef([]);
  const audioContextRef = useRef(null);
  const animationIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);

  // Audio processing refs
  const mergedAnalyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const microphoneStreamRef = useRef(null);

  const startMicrophone = async () => {
    try {
      setIsConnecting(true);

      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create audio processing nodes
      mergedAnalyserRef.current = audioContextRef.current.createAnalyser();
      mergedAnalyserRef.current.fftSize = 512;
      
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Start WebRTC connection
      connectionRef.current = await startConnection();
      console.log("AI Connection started", connectionRef.current);

      // Set up microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      // Create microphone source and connect ONLY to the analyzer
      const micSource = audioContextRef.current.createMediaStreamSource(stream);
      micSource.connect(mergedAnalyserRef.current);
      // Note: We do NOT connect micSource to the gainNode to prevent echo

      // Set up remote audio handling
      if (connectionRef.current.audioEl) {
        const setupRemoteAudio = (stream) => {
          if (stream) {
            const remoteSource = audioContextRef.current.createMediaStreamSource(stream);
            // Connect remote audio to both analyzer and gain node
            remoteSource.connect(mergedAnalyserRef.current);
            remoteSource.connect(gainNodeRef.current);
            // Connect gain node to output
            gainNodeRef.current.connect(audioContextRef.current.destination);
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
      setIsMicOn(true);
    } catch (err) {
      console.error("Error starting microphone and AI:", err);
      stopMicrophone();
    } finally {
      setIsConnecting(false);
    }
  };

  const stopMicrophone = () => {
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

  return { isMicOn, isConnecting, startMicrophone, stopMicrophone, barsRef };
};