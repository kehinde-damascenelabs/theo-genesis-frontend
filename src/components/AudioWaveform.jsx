"use client"; // This directive indicates that the component should be rendered on the client-side

// Import React hooks for managing state, refs, and side effects
import { useState, useRef, useEffect } from "react";
// Import MUI components for buttons and tooltips
import { IconButton, Tooltip } from "@mui/material";
// Import MUI icons for microphone on/off states
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
// Import functions to start and stop a connection (likely WebRTC or similar)
import { startConnection } from "../../realtimeAPI/startConnection";
import { stopConnection } from "../../realtimeAPI/stopConnection";

// AudioWaveform component provides microphone control and audio visualization
const AudioWaveform = () => {
  // State to track if the microphone is on or off
  const [isMicOn, setIsMicOn] = useState(false);
  // State to track if a processing operation is currently running (prevents concurrent actions)
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs to persist mutable values across renders
  const connectionRef = useRef(null); // Reference for the external connection (e.g., AI or WebRTC)
  const barsRef = useRef([]);         // References to DOM elements representing the waveform bars
  const audioContextRef = useRef(null);  // Reference to the AudioContext for audio processing
  const analyserRef = useRef(null);        // Reference to the AnalyserNode for frequency data extraction
  const microphoneStreamRef = useRef(null); // Reference to the MediaStream from the user's microphone
  const animationIdRef = useRef(null);        // Reference to the current animation frame for cleanup

  // cleanup: Cleans up all audio-related resources and stops ongoing processes
  const cleanup = async () => {
    // Set processing state to true to disable actions during cleanup
    setIsProcessing(true);
    try {
      // Stop and cleanup any active connection (e.g., WebRTC/AI connection)
      if (connectionRef.current) {
        await stopConnection(connectionRef.current);
        connectionRef.current = null;
      }

      // Stop all audio tracks from the microphone stream
      if (microphoneStreamRef.current) {
        const tracks = microphoneStreamRef.current.getTracks();
        tracks.forEach(track => {
          track.stop();      // Stop the track
          track.enabled = false; // Disable the track
        });
        microphoneStreamRef.current = null;
      }

      // Close the AudioContext if it's still open
      if (audioContextRef.current) {
        if (audioContextRef.current.state !== 'closed') {
          await audioContextRef.current.close();
        }
        audioContextRef.current = null;
      }

      // Disconnect the analyser node
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      // Cancel any ongoing animation frame for the waveform visualization
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Reset the visual appearance of the waveform bars
      barsRef.current.forEach(bar => {
        if (bar) {
          bar.style.height = "4px";
          bar.style.transform = "none";
        }
      });

    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      // Reset processing state and update microphone state to off
      setIsProcessing(false);
      setIsMicOn(false);
    }
  };

  // startMicrophone: Initiates the microphone stream and audio visualization
  const startMicrophone = async () => {
    try {
      // Clean up any previous connection/resources before starting a new one
      await cleanup();

      // Start a new external connection (e.g., WebRTC or AI service connection)
      connectionRef.current = await startConnection();
      console.log("AI Connection started", connectionRef.current);

      // Request microphone access from the user (audio only)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a new AudioContext for handling audio operations
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      // Create an AnalyserNode to extract frequency data for visualization
      analyserRef.current = audioContextRef.current.createAnalyser();

      // Create a media source from the microphone stream and connect it to the analyser node
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      // Save the microphone stream reference for later cleanup
      microphoneStreamRef.current = stream;

      // Configure the analyser node
      analyserRef.current.fftSize = 512; // Determines the frequency resolution
      const bufferLength = analyserRef.current.frequencyBinCount; // Half of fftSize
      const dataArray = new Uint8Array(bufferLength); // Array to store frequency data

      // animateBars: Function to update the waveform bars based on the current frequency data
      const animateBars = () => {
        // Guard clause: If the analyser is not available, exit the animation
        if (!analyserRef.current) return; 
        
        // Populate the dataArray with current frequency data from the analyser
        analyserRef.current.getByteFrequencyData(dataArray);
        // Loop over each bar element to update its height based on frequency data
        barsRef.current.forEach((bar, index) => {
          if (!bar) return; // Skip if the bar element is undefined
          
          // Calculate the height proportionally (value normalized to a percentage)
          const value = dataArray[index % bufferLength];
          const height = (value / 255) * 100;
          bar.style.height = `${height}px`; // Set the new height of the bar
          bar.style.transform = "none"; // Reset any transforms (if applicable)
        });
        
        // Schedule the next frame of animation
        animationIdRef.current = requestAnimationFrame(animateBars);
      };

      // Start the animation loop for updating the waveform visualization
      animateBars();
      // Update state to indicate that the microphone is now active
      setIsMicOn(true);
    } catch (err) {
      console.error("Error starting microphone and AI:", err);
      // On error, perform cleanup to ensure no resources are leaked
      await cleanup();
    }
  };

  // toggleMicrophone: Toggles the microphone and related processes on or off
  const toggleMicrophone = async () => {
    // Prevent toggling if a process is already running
    if (isProcessing) return; 
    
    // If the microphone is currently on, clean up (i.e., turn it off)
    if (isMicOn) {
      await cleanup();
    } else {
      // Otherwise, start the microphone and associated processes
      await startMicrophone();
    }
  };

  // useEffect hook to manage side effects related to page visibility
  useEffect(() => {
    // handleVisibilityChange: Stops the microphone when the page becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden && isMicOn) {
        console.log("Page hidden. Stopping microphone to conserve resources.");
        cleanup();
      }
    };

    // Add event listener for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Cleanup: Remove the event listener and clean up resources when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanup(); // Ensure all resources are cleaned up on unmount
    };
  }, [isMicOn]); // Depend on isMicOn to re-run if microphone state changes

  return (
    // Main container for the audio waveform and microphone control UI
    <div className="flex flex-col items-center justify-center m-screen pb-24">
      <div className="relative w-full max-w-md h-64 flex items-center justify-center">
        {/* Container for the waveform visualization bars */}
        <div className="relative flex gap-1 items-center h-full">
          {/* Create 5 bars for visualizing audio frequency data */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center h-full">
              <div
                // Save a reference to each bar element for dynamic styling
                ref={(el) => (barsRef.current[i] = el)}
                // Assign width, minimum height, rounded corners, and transition effects,
                // with a unique background color for each bar based on its index
                className={`w-10 min-h-[40px] rounded-lg transition-all duration-75 ${
                  ["bg-blue-300", "bg-blue-500", "bg-blue-700", "bg-yellow-400", "bg-orange-500"][i]
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* Tooltip wrapping the microphone toggle button */}
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
          {/* Position the microphone toggle button absolutely within the container */}
          <div className="absolute top-52 left-1/2 -translate-x-1/2">
            <IconButton
              onClick={toggleMicrophone} // Toggle microphone state when clicked
              disabled={isProcessing} // Disable button while processing to prevent multiple actions
              className={`p-4 ${isProcessing ? 'bg-gray-500' : 'bg-gray-700 hover:bg-gray-600'} rounded-full transition-all`}
            >
              {/* Conditionally render the MicIcon (on) or MicOffIcon (off) based on isMicOn */}
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
// // TODO: Prevent microphone button from shifting when waveform changes. 
// //  - Wrap the waveform and button in a flex container with a fixed height.

// // TODO: Reduce the gap between waveform bars. 
// //  - Update `gap-2` to `gap-1` in the waveform container class.

// // TODO: Show a tooltip when hovering over the microphone button. 
// //  - Use MUI’s `<Tooltip>` component to display a message on hover.

// // TODO: Fix overlapping audio when stopping and restarting connection. 
// //  - Ensure `stopConnection()` fully closes the previous connection before starting a new one. 
// //  - Clear any existing event listeners before re-initializing the audio stream. 

// // TODO: Add a responsive Material UI Navbar
// //  - Use MUI's `<AppBar>` and `<Toolbar>` components.
// //  - Include links for "Home," "About," and "Contact".
// //  - Ensure it collapses into a menu on mobile devices.

// // TODO: Add a welcome message for users
// //  - Display a greeting like: "Hi, welcome to my prototype AI agent. All feedback is welcome!"
// //  - Position this message at the top of the page or inside the chat area.
// //  - Use a styled `<Typography>` component for readability.

// // TODO: Create a feedback section
// //  - Add a simple feedback form with fields for Name, Email (optional), and Comments.
// //  - Include a submit button that logs feedback to a database or sends an email.
// //  - Optionally, allow users to upvote or rate the AI's responses.

// DO LATER
// TODO: Improve color switching between inbound and outbound audio. 
//  - Currently, only the microphone input is being analyzed. 
//  - Capture **both microphone and AI audio output** by combining the streams. 
//  - Use Web Audio API's `MediaElementSource` to analyze AI-generated audio. 

// TODO: Add waveform reponsiveness to both in/out audio

// TODO: Fix AI agent misinterpreting spoken language as Spanish. STILL A BIG ISSUE
//  - Check if `speech-to-text` service is detecting the wrong language. 
//  - Explicitly set the language model to `en-US` when initializing speech recognition. 
//  - Log detected text to verify what the AI is actually hearing. 

// NEXT
// TODO: Consider integrating Google Ads (???)
//  - Check if Google Ads is relevant for monetization.
//  - If adding, implement Google AdSense via `react-google-adsense`.
//  - Ensure ads do not interfere with user experience (avoid excessive ads).
//  - Styling the Ad Container

// TODO: Implement SEO best practices
//  - Add `<meta>` tags for title, description, and keywords.
//  - Use `next/head` for metadata management in a Next.js project.
//  - Ensure proper Open Graph and Twitter card metadata for social sharing.


// TODO: Add prompt suggestions like ChatGPT
//  - Provide example prompts like "What can you do?" or "Summarize this article."
//  - Implement a button UI where clicking a suggestion auto-fills the input box.
//  - Store predefined prompts in an array and display dynamically.


// TODO: Turn a feedback section into comment section?
// TODO: Question will my application beable to handle multiple users??
// TODO: Dont i have to upload the server first then the frontend???

