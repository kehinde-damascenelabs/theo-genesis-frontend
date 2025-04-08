import React from 'react';
import { render, screen } from '@testing-library/react';
import PlaceDetailsPanel from '../../components/PlaceDetailsPanel';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the environment variables
process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_ELEVEN_MADISON_PARK_PLACE_ID = 'test-place-id';

// Mock the Google Maps API
global.google = {
  maps: {
    places: {}
  }
};

// Mock the configureFromPlace method
const mockConfigureFromPlace = jest.fn().mockResolvedValue(true);

// Mock the custom element creation
Object.defineProperty(window, 'customElements', {
  value: {
    define: jest.fn(),
    whenDefined: jest.fn().mockResolvedValue(true)
  }
});

// Mock createElement to handle gmp-place-details
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName) => {
  if (tagName === 'gmp-place-details') {
    const element = originalCreateElement('div');
    element.setAttribute = jest.fn();
    element.configureFromPlace = mockConfigureFromPlace;
    return element;
  }
  return originalCreateElement(tagName);
};

const theme = createTheme();

describe('PlaceDetailsPanel', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders with correct header', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceDetailsPanel placeId="test-place-id" />
      </ThemeProvider>
    );
    
    // Check header is rendered
    expect(screen.getByText('Place Details')).toBeInTheDocument();
    expect(screen.getByTestId('place-details-header')).toBeInTheDocument();
    expect(screen.getByTestId('place-details-content')).toBeInTheDocument();
  });
  
  it('calls configureFromPlace with the correct place ID', () => {
    // Mock the initPlaceDetails function
    window.initPlaceDetails = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <PlaceDetailsPanel placeId="test-place-id" />
      </ThemeProvider>
    );
    
    // Since we've mocked customElements.whenDefined to resolve immediately,
    // we need to wait for any useEffect hooks to run
    expect(window.initPlaceDetails).toBeDefined();
    
    // Manually call the callback that would be called when script loads
    if (window.initPlaceDetails) {
      window.initPlaceDetails();
    }
    
    // Verify configureFromPlace was called with the correct place ID
    expect(mockConfigureFromPlace).toHaveBeenCalledWith({ id: 'test-place-id' });
  });
  
  it('renders placeholder when no placeId is provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlaceDetailsPanel />
      </ThemeProvider>
    );
    
    // It should still render the container
    expect(screen.getByTestId('place-details-content')).toBeInTheDocument();
    
    // But configureFromPlace should not be called
    expect(mockConfigureFromPlace).not.toHaveBeenCalled();
  });
}); 