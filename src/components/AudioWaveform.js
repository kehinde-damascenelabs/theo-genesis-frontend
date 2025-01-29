"use client";

import { useState, useRef } from "react";
import { IconButton, Tooltip } from "@mui/material";
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import { startConnection } from "../../realtimeAPI/startConnection";
import { stopConnection } from "../../realtimeAPI/stopConnection";

const AudioWaveform = () => {
  const [isMicOn, setIsMicOn] = useState(false);
  // Store connection in a ref instead of a regular variable
  const connectionRef = useRef(null);
  
  const barsRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const animationIdRef = useRef(null);

  const startMicrophone = async () => {
    try {
      // Store connection in the ref
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
          const value = dataArray[index % bufferLength];
          const height = (value / 255) * 100 + 50;
          bar.style.height = `${height}px`;
        });
        animationIdRef.current = requestAnimationFrame(animateBars);
      };

      animateBars();
      setIsMicOn(true);
    } catch (err) {
      console.error("Error starting microphone and AI:", err);
      // Clean up any partial connections on error
      await stopMicrophone();
    }
  };

  const stopMicrophone = async () => {
    // Check the ref for the connection
    if (connectionRef.current) {
      stopConnection(connectionRef.current);
      connectionRef.current = null;
    }
    console.log("Microphone and AI connection stopped.");

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    if (audioContextRef.current) {
      await audioContextRef.current.close();
    }
    
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    if (barsRef.current) {
      barsRef.current.forEach((bar) => {
        if (bar) bar.style.height = "50px";
      });
    }

    setIsMicOn(false);
  };

  const toggleMicrophone = () => {
    isMicOn ? stopMicrophone() : startMicrophone();
  };

  // Rest of the component remains the same
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900">
      <div className="relative w-full max-w-md h-64">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-1 items-end">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              ref={(el) => (barsRef.current[i] = el)}
              className={`w-10 h-[50px] rounded-lg transition-all ease-out ${
                ["bg-blue-300", "bg-blue-500", "bg-blue-700", "bg-yellow-400", "bg-orange-500"][i]
              }`}
            ></div>
          ))}
        </div>

        <Tooltip
          title={
            <div className="text-center">
              <strong>{isMicOn ? "Turn off microphone" : "Turn on microphone"}</strong>
              <br />
            </div>
          }
          arrow
          placement="bottom"
        >
          <div className="absolute top-52 left-1/2 -translate-x-1/2">
            <IconButton
              onClick={toggleMicrophone}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
            >
              {isMicOn ? (
                <MicIcon className="text-white text-4xl" />
              ) : (
                <MicOffIcon className="text-white text-4xl" />
              )}
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default AudioWaveform;


// https://chatgpt.com/g/g-p-678ecec56b608191a9f86acc72056cfa-genesis/c/6799e187-78e8-8000-bf3f-fd7b16fa79da
// TODO: Prevent microphone button from shifting when waveform changes. 
//  - Wrap the waveform and button in a flex container with a fixed height.

// TODO: Reduce the gap between waveform bars. 
//  - Update `gap-2` to `gap-1` in the waveform container class.

// TODO: Show a tooltip when hovering over the microphone button. 
//  - Use MUI’s `<Tooltip>` component to display a message on hover.

// TODO: Fix overlapping audio when stopping and restarting connection. 
//  - Ensure `stopConnection()` fully closes the previous connection before starting a new one. 
//  - Clear any existing event listeners before re-initializing the audio stream. 

// TODO: Improve color switching between inbound and outbound audio. 
//  - Currently, only the microphone input is being analyzed. 
//  - Capture **both microphone and AI audio output** by combining the streams. 
//  - Use Web Audio API's `MediaElementSource` to analyze AI-generated audio. 

// TODO: Fix AI agent misinterpreting spoken language as Spanish. 
//  - Check if `speech-to-text` service is detecting the wrong language. 
//  - Explicitly set the language model to `en-US` when initializing speech recognition. 
//  - Log detected text to verify what the AI is actually hearing. 


// TODO: Add a responsive Material UI Navbar
//  - Use MUI's `<AppBar>` and `<Toolbar>` components.
//  - Include links for "Home," "About," and "Contact".
//  - Ensure it collapses into a menu on mobile devices.

// TODO: Consider integrating Google Ads (???)
//  - Check if Google Ads is relevant for monetization.
//  - If adding, implement Google AdSense via `react-google-adsense`.
//  - Ensure ads do not interfere with user experience (avoid excessive ads).
//  - Styling the Ad Container

// TODO: Implement SEO best practices
//  - Add `<meta>` tags for title, description, and keywords.
//  - Use `next/head` for metadata management in a Next.js project.
//  - Ensure proper Open Graph and Twitter card metadata for social sharing.

// TODO: Add a welcome message for users
//  - Display a greeting like: "Hi, welcome to my prototype AI agent. All feedback is welcome!"
//  - Position this message at the top of the page or inside the chat area.
//  - Use a styled `<Typography>` component for readability.

// TODO: Add prompt suggestions like ChatGPT
//  - Provide example prompts like "What can you do?" or "Summarize this article."
//  - Implement a button UI where clicking a suggestion auto-fills the input box.
//  - Store predefined prompts in an array and display dynamically.

// TODO: Create a feedback section
//  - Add a simple feedback form with fields for Name, Email (optional), and Comments.
//  - Include a submit button that logs feedback to a database or sends an email.
//  - Optionally, allow users to upvote or rate the AI's responses.

