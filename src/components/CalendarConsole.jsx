"use client";

import React from 'react';
import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled container to match the ConversationTranscript styling
const CalendarContainer = styled(Box)(({ theme }) => ({
  height: '443.29px',
  width: '100%',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' // Softer dark background
    : theme.palette.grey[50], // Light gray in light mode
  borderRadius: theme.spacing(1),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.25)' 
    : theme.shadows[2],
  overflow: 'hidden',
}));

// Styled iframe to be responsive
const ResponsiveCalendarFrame = styled('iframe')(({ theme }) => ({
  width: '100%',
  height: '100%',
  border: 'none',
  borderRadius: theme.spacing(1),
}));

const CalendarConsole = () => {
  const theme = useTheme();

  return (
    <CalendarContainer>
      <ResponsiveCalendarFrame
        src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&showPrint=0&showNav=0&showTabs=0&title=Theo%20Demo%20Calendar&showTz=0&showCalendars=0&src=demo-calendar%40example.com"
        data-testid="calendar-iframe"
      />
    </CalendarContainer>
  );
};

export default CalendarConsole; 