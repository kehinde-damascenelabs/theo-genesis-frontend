import { useState, useRef, useEffect } from "react";
import { startConnection } from "../service/realtimeAPI/startConnection";
import { stopConnection } from "../service/realtimeAPI/stopConnection";
import { createSilentAudio, requestWakeLock } from "../utils/helper_func";

export const useMicrophone = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectionRef = useRef(null);
  const barsRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const silentAudioRef = useRef(null);

  const startMicrophone = async () => {
    try {
      setIsConnecting(true);

      // Request wake lock
      wakeLockRef.current = await requestWakeLock();
      
      // Start silent audio for iOS
      silentAudioRef.current = createSilentAudio();
      await silentAudioRef.current.play();

      connectionRef.current = await startConnection();
      console.log("AI Connection started", connectionRef.current);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      microphoneStreamRef.current = stream;

      analyserRef.current.fftSize = 512;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animateBars = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        barsRef.current.forEach((bar, index) => {
          if (bar) {
            bar.style.height = `${(dataArray[index % bufferLength] / 255) * 100}px`;
          }
        });
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
    // Release wake lock
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(console.error);
      wakeLockRef.current = null;
    }

    // Stop silent audio
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current = null;
    }

    if (connectionRef.current) {
      stopConnection(connectionRef.current);
      connectionRef.current = null;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    barsRef.current.forEach((bar) => {
      if (bar) {
        bar.style.height = "4px";
      }
    });

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

  useEffect(() => {
    return () => {
      if (isMicOn) {
        stopMicrophone();
      }
    };
  }, [isMicOn]);

  return { isMicOn, isConnecting, startMicrophone, stopMicrophone, barsRef };
};