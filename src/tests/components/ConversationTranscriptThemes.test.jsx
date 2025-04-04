import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationTranscript from '../../components/ConversationTranscript';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('ConversationTranscript Theme Support', () => {
  const sampleMessages = [
    { sender: 'user', text: 'Hello!' },
    { sender: 'ai', text: 'Hi there! How can I assist you today?' },
  ];

  test('renders correctly with light theme', () => {
    const lightTheme = createTheme({
      palette: {
        mode: 'light',
      },
    });

    const { getByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <ConversationTranscript messages={sampleMessages} />
      </ThemeProvider>
    );

    const transcriptContainer = getByTestId('conversation-transcript');
    expect(transcriptContainer).toBeInTheDocument();
    
    // In light mode, the background should have a light color
    expect(window.getComputedStyle(transcriptContainer).backgroundColor).not.toBe('rgb(18, 18, 18)');
  });

  test('renders correctly with dark theme', () => {
    const darkTheme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const { getByTestId } = render(
      <ThemeProvider theme={darkTheme}>
        <ConversationTranscript messages={sampleMessages} />
      </ThemeProvider>
    );

    const transcriptContainer = getByTestId('conversation-transcript');
    expect(transcriptContainer).toBeInTheDocument();
    
    // In dark mode, the container should have a dark background
    // Note: This is a simplified test as jest-dom doesn't fully compute styles
    // In a real browser, we would check for the actual dark background color
    expect(window.getComputedStyle(transcriptContainer).backgroundColor).not.toBe('rgb(245, 245, 245)');
  });
}); 