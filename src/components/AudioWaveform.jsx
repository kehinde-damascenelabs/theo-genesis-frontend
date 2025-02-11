"use client";

import { useMicrophone } from "../hooks/useMicrophone";
import { IconButton, Tooltip } from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";

const AudioWaveform = () => {
  const { isMicOn, startMicrophone, stopMicrophone, barsRef } = useMicrophone();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pb-24">
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
          title={<div className="text-center"><strong>{isMicOn ? "Turn off microphone" : "Turn on microphone"}</strong></div>}
          arrow
          placement="bottom"
        >
          <div className="absolute top-52 left-1/2 -translate-x-1/2">
            <IconButton
              onClick={isMicOn ? stopMicrophone : startMicrophone}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
            >
              {isMicOn ? <MicIcon className="text-white text-4xl" /> : <MicOffIcon className="text-white text-4xl" />}
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
