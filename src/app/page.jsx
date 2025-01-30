import * as React from 'react';
import AudioWaveform from "@/components/AudioWaveform";
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from '@/theme/AppTheme';
import AppAppBar from '@/components/AppAppBar';
import Hero from '@/components/Hero';
import Comment from '@/components/Comment';
import Footer from '@/components/Footer';

export default function Page(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
       <Hero />
       <Divider />
       <AudioWaveform />
        {/* <Divider /> */}
        <Comment />
        <Footer />
    </AppTheme>
  );
}
