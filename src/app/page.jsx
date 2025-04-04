"use client";

import * as React from 'react';
import { useState } from 'react';
import AudioWaveform from "@/components/AudioWaveform";
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '@/theme/AppTheme';
import AppAppBar from '@/components/AppAppBar';
import Hero from '@/components/Hero';
import Comment from '@/components/Comment';
import Footer from '@/components/Footer';
import ConversationTranscript from "@/components/ConversationTranscript";
import { Grid } from '@mui/material';
import { useConversation } from "@/hooks/useConversation";

// Sample conversation for demo purposes
const sampleConversation = [
  { sender: 'user', text: 'Hello!' },
  { sender: 'ai', text: 'Hi there! How can I assist you today?' },
  { sender: 'user', text: "I'm curious about how you work. Can you explain a bit?" },
  { sender: 'ai', text: "Of course! I'm powered by advanced natural language processing and machine learning algorithms that analyze your input and generate helpful responses based on patterns learned from a large amount of data." },
];

export default function Page(props) {
  const { 
    messages, 
    currentMessage, 
    updateCurrentMessage, 
    submitCurrentMessage, 
    addAIResponse 
  } = useConversation(sampleConversation);
  const [isListening, setIsListening] = useState(false);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <Divider />
      <div className="flex flex-col items-center justify-center min-h-screen pb-24">
        <Grid container spacing={3} sx={{ maxWidth: '1200px', width: '100%' }}>
          <Grid item xs={12} md={6}>
            <AudioWaveform 
              updateCurrentMessage={updateCurrentMessage}
              submitCurrentMessage={submitCurrentMessage}
              addAIResponse={addAIResponse}
              currentMessage={currentMessage}
              setIsListening={setIsListening}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ConversationTranscript 
              messages={messages}
              isListening={isListening}
              currentMessage={currentMessage}
            />
          </Grid>
        </Grid>
      </div>
      <Comment />
      <Footer />
    </AppTheme>
  );
}
