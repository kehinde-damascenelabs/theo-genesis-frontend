import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PanelCarousel from '../../components/PanelCarousel';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('PanelCarousel', () => {
  const mockTranscriptPanel = <div data-testid="transcript-content">Transcript Content</div>;
  const mockPlaceDetailsPanel = <div data-testid="place-details-content">Place Details Content</div>;
  
  it('renders transcript panel visible by default', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
        />
      </ThemeProvider>
    );
    
    // Initially the transcript panel should be visible in the first container
    const transcriptContainer = screen.getByTestId('transcript-panel-container');
    expect(transcriptContainer).toBeInTheDocument();
    expect(transcriptContainer).toContainElement(screen.getByTestId('transcript-content'));
    
    // Verify slider navigation elements are rendered
    expect(screen.getByTestId('panel-slider')).toBeInTheDocument();
    expect(screen.getByTestId('transcript-label')).toBeInTheDocument();
    expect(screen.getByTestId('place-details-label')).toBeInTheDocument();
    
    // Verify tab indicators are rendered
    expect(screen.getByTestId('tab-indicator-0')).toBeInTheDocument();
    expect(screen.getByTestId('tab-indicator-1')).toBeInTheDocument();
  });
  
  it('switches to place details panel when clicking the place details label', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
        />
      </ThemeProvider>
    );
    
    // Initially transcript panel should be active
    const transcriptLabel = screen.getByTestId('transcript-label');
    const placeDetailsLabel = screen.getByTestId('place-details-label');
    
    // Verify transcript label is active
    expect(transcriptLabel.getAttribute('data-active')).toBe('true');
    expect(placeDetailsLabel.getAttribute('data-active')).toBe('false');
    
    // Click the place details label
    fireEvent.click(placeDetailsLabel);
    
    // Place details label should now be active
    expect(placeDetailsLabel.getAttribute('data-active')).toBe('true');
    expect(transcriptLabel.getAttribute('data-active')).toBe('false');
  });
  
  it('renders tab indicators correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <PanelCarousel 
          transcriptPanel={mockTranscriptPanel}
          placeDetailsPanel={mockPlaceDetailsPanel}
        />
      </ThemeProvider>
    );
    
    // Get indicators by test IDs
    const indicator0 = screen.getByTestId('tab-indicator-0');
    const indicator1 = screen.getByTestId('tab-indicator-1');
    
    // First indicator should be active by default
    expect(indicator0.getAttribute('data-active')).toBe('true');
    expect(indicator1.getAttribute('data-active')).toBe('false');
    
    // Click the second indicator
    fireEvent.click(indicator1);
    
    // Now second indicator should be active
    expect(indicator0.getAttribute('data-active')).toBe('false');
    expect(indicator1.getAttribute('data-active')).toBe('true');
  });
}); 