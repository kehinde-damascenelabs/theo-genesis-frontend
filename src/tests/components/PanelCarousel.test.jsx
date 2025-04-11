import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PanelCarousel from '../../components/PanelCarousel';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('PanelCarousel', () => {
  const mockTranscriptPanel = <div data-testid="transcript-content">Transcript Content</div>;
  const mockPlaceDetailsPanel = <div data-testid="place-details-content">Place Details Content</div>;
  const mockMenuConsolePanel = <div data-testid="menu-content">Menu Content</div>;
  const mockCalendarPanel = <div data-testid="calendar-content">Calendar Content</div>;
  
  it('renders transcript panel visible by default', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
          menuConsolePanel={mockMenuConsolePanel}
          calendarPanel={mockCalendarPanel}
        />
      </ThemeProvider>
    );
    
    // Initially the transcript panel should be visible in the first container
    const transcriptContainer = screen.getByTestId('transcript-panel-container');
    expect(transcriptContainer).toBeInTheDocument();
    expect(transcriptContainer).toContainElement(screen.getByTestId('transcript-content'));
    
    // Verify tabs are rendered
    expect(screen.getByText('Transcript')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Info')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });
  
  it('switches to place details panel when clicking the place details tab', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
          menuConsolePanel={mockMenuConsolePanel}
          calendarPanel={mockCalendarPanel}
        />
      </ThemeProvider>
    );
    
    // Initially transcript tab should be active
    const transcriptTab = screen.getByTestId('transcript-tab');
    const placeDetailsTab = screen.getByTestId('place-details-tab');
    
    // Verify transcript tab is active
    expect(transcriptTab.getAttribute('data-active')).toBe('true');
    expect(placeDetailsTab.getAttribute('data-active')).toBe('false');
    
    // Click the place details tab
    fireEvent.click(placeDetailsTab);
    
    // Place details tab should now be active
    expect(placeDetailsTab.getAttribute('data-active')).toBe('true');
    expect(transcriptTab.getAttribute('data-active')).toBe('false');
  });
  
  it('switches to menu console panel when clicking the menu tab', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
          menuConsolePanel={mockMenuConsolePanel}
          calendarPanel={mockCalendarPanel}
        />
      </ThemeProvider>
    );
    
    // Initially transcript tab should be active
    const transcriptTab = screen.getByTestId('transcript-tab');
    const menuTab = screen.getByTestId('menu-console-tab');
    
    // Verify transcript tab is active
    expect(transcriptTab.getAttribute('data-active')).toBe('true');
    expect(menuTab.getAttribute('data-active')).toBe('false');
    
    // Click the menu tab
    fireEvent.click(menuTab);
    
    // Menu tab should now be active
    expect(menuTab.getAttribute('data-active')).toBe('true');
    expect(transcriptTab.getAttribute('data-active')).toBe('false');
    
    // Menu content should be visible
    const menuContainer = screen.getByTestId('menu-console-panel-container');
    expect(menuContainer).toBeInTheDocument();
    expect(menuContainer).toContainElement(screen.getByTestId('menu-content'));
  });
  
  it('switches to calendar panel when clicking the calendar tab', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
          menuConsolePanel={mockMenuConsolePanel}
          calendarPanel={mockCalendarPanel}
        />
      </ThemeProvider>
    );
    
    // Initially transcript tab should be active
    const transcriptTab = screen.getByTestId('transcript-tab');
    const calendarTab = screen.getByTestId('calendar-tab');
    
    // Verify transcript tab is active
    expect(transcriptTab.getAttribute('data-active')).toBe('true');
    expect(calendarTab.getAttribute('data-active')).toBe('false');
    
    // Click the calendar tab
    fireEvent.click(calendarTab);
    
    // Calendar tab should now be active
    expect(calendarTab.getAttribute('data-active')).toBe('true');
    expect(transcriptTab.getAttribute('data-active')).toBe('false');
    
    // Calendar content should be visible
    const calendarContainer = screen.getByTestId('calendar-panel-container');
    expect(calendarContainer).toBeInTheDocument();
    expect(calendarContainer).toContainElement(screen.getByTestId('calendar-content'));
  });
}); 