import React from 'react';
import { render, screen } from '@testing-library/react';
import CalendarConsole from '../CalendarConsole';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock theme for testing
const theme = createTheme();

describe('CalendarConsole', () => {
  test('renders the calendar iframe', () => {
    render(
      <ThemeProvider theme={theme}>
        <CalendarConsole />
      </ThemeProvider>
    );
    
    const iframe = screen.getByTestId('calendar-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toContain('calendar.google.com');
    expect(iframe.src).toContain('showPrint=0');
    expect(iframe.src).toContain('showNav=0');
  });
}); 