import React from 'react';
import { render, screen } from '@testing-library/react';
import CalendarConsole from '../CalendarConsole';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock theme for testing
const theme = createTheme();

describe('CalendarConsole', () => {
  const ORIGINAL_ENV = process.env.NEXT_PUBLIC_DEMO_CALENDAR_EMAIL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEMO_CALENDAR_EMAIL = 'demo-calendar@example.com';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_CALENDAR_EMAIL = ORIGINAL_ENV;
  });

  test('renders the calendar iframe when a demo calendar is configured', () => {
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
    expect(iframe.src).toContain(encodeURIComponent('demo-calendar@example.com'));
  });

  test('renders a placeholder when no demo calendar is configured', () => {
    process.env.NEXT_PUBLIC_DEMO_CALENDAR_EMAIL = '';

    render(
      <ThemeProvider theme={theme}>
        <CalendarConsole />
      </ThemeProvider>
    );

    expect(screen.queryByTestId('calendar-iframe')).not.toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_DEMO_CALENDAR_EMAIL/)).toBeInTheDocument();
  });
});