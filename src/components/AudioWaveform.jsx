"use client";

import { useMicrophone } from "../hooks/useMicrophone";
import { IconButton, Tooltip, Grid, Button, Typography } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import { useEffect, useCallback } from "react";

const AudioWaveform = ({ 
  updateCurrentMessage,
  submitCurrentMessage,
  addAIResponse,
  currentMessage,
  setIsListening,
  setIsAISpeaking,
  handleUserTranscript,
  handleAITranscript
}) => {
  const onUserTranscript = useCallback((transcript) => {
    if (handleUserTranscript && typeof handleUserTranscript === 'function') {
      // Use the conversation hook's handler if provided
      handleUserTranscript(transcript);
    } else {
      // Fall back to the older separate methods
      updateCurrentMessage(transcript);
      submitCurrentMessage();
    }
  }, [handleUserTranscript, updateCurrentMessage, submitCurrentMessage]);

  const onAITranscript = useCallback((transcript) => {
    if (handleAITranscript && typeof handleAITranscript === 'function') {
      // Use the conversation hook's handler if provided
      handleAITranscript(transcript);
    } else {
      // Fall back to the older method
      addAIResponse(transcript);
    }
  }, [handleAITranscript, addAIResponse]);

  const { 
    isMicOn, 
    isConnecting, 
    isAISpeaking: aiSpeakingState,
    startMicrophone, 
    stopMicrophone, 
    barsRef 
  } = useMicrophone({
    onUserTranscript: onUserTranscript,
    onAITranscript: onAITranscript
  });

  // Update isListening state in parent component if the prop exists
  useEffect(() => {
    if (setIsListening && typeof setIsListening === 'function') {
      setIsListening(isMicOn);
    }
  }, [isMicOn, setIsListening]);

  // Update isAISpeaking state in parent component if the prop exists
  useEffect(() => {
    if (setIsAISpeaking && typeof setIsAISpeaking === 'function') {
      setIsAISpeaking(aiSpeakingState);
    }
  }, [aiSpeakingState, setIsAISpeaking]);

  // Helper function to render the appropriate button based on state
  const renderConnectionButton = () => {
    if (isConnecting) {
      return (
        <Button
          disabled
          sx={{
            bgcolor: '#8FD5B2', // Light green
            color: 'black',
            borderRadius: '4px',
            fontSize: '16px',
            padding: '10px 20px',
            textTransform: 'none',
            width: '130px',
          }}
          startIcon={<CircularProgress size={20} sx={{ color: 'white' }} data-testid="circular-progress" />}
        >
          <Typography variant="body1" component="span" sx={{ ml: 1 }}>
            Connecting
          </Typography>
        </Button>
      );
    } else if (isMicOn) {
      return (
        <Button
          onClick={stopMicrophone}
          sx={{
            bgcolor: '#F14C52', // Red
            color: 'white',
            borderRadius: '4px',
            fontSize: '16px',
            padding: '10px 20px',
            textTransform: 'none',
            width: '130px',
          }}
        >
          Disconnect
        </Button>
      );
    } else {
      return (
        <Button
          // variant="contained"
          disableElevation
          onClick={startMicrophone}
          sx={{
            bgcolor: '#25A969 !important',
            color: 'white',
            borderRadius: '4px',
            fontSize: '16px',
            padding: '10px 20px',
            textTransform: 'none',
            width: '130px',
          }}
          startIcon={<MicIcon />}
        >
          Connect
        </Button>
      );
    }
  };

  return (
    <div className="relative w-full max-w-md h-64 flex items-center justify-center">
      <div className="relative flex gap-1 items-center h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center h-full">
            <div
              ref={(el) => (barsRef.current[i] = el)}
              className={`w-10 min-h-[40px] rounded-lg transition-all duration-75 ${
                ["bg-blue-300", "bg-blue-500", "bg-blue-700", "bg-yellow-400", "bg-orange-500"][i]
              }`}
            ></div>
          </div>
        ))}
      </div>

      <Tooltip
        title={
          <div className="text-center">
            <strong>
              {isConnecting
                ? "Connecting..."
                : isMicOn
                ? "Turn off microphone"
                : "Turn on microphone"}
            </strong>
          </div>
        }
        arrow
        placement="bottom"
      >
        <div className="absolute top-52 left-1/2 -translate-x-1/2">
          <div className="relative">
            {renderConnectionButton()}
          </div>
        </div>
      </Tooltip>
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
// //  - Use MUI's `<Tooltip>` component to display a message on hover.

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

// https://chatgpt.com/g/g-p-678ecec56b608191a9f86acc72056cfa-genesis/c/6799e187-78e8-8000-bf3f-fd7b16fa79da
// // TODO: Prevent microphone button from shifting when waveform changes.
// //  - Wrap the waveform and button in a flex container with a fixed height.

// // TODO: Reduce the gap between waveform bars.
// //  - Update `gap-2` to `gap-1` in the waveform container class.

// // TODO: Show a tooltip when hovering over the microphone button.
// //  - Use MUI's `<Tooltip>` component to display a message on hover.

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
