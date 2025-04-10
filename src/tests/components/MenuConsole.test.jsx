import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuConsole from '../../components/MenuConsole';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('MenuConsole', () => {
  it('renders restaurant name and subtitle', () => {
    render(
      <ThemeProvider theme={theme}>
        <MenuConsole />
      </ThemeProvider>
    );
    
    expect(screen.getByText('ELEVEN MADISON PARK')).toBeInTheDocument();
    expect(screen.getByText('100% PLANT-BASED | HYPER-SEASONAL CUISINE')).toBeInTheDocument();
  });
  
  it('renders tasting menu section with correct options', () => {
    render(
      <ThemeProvider theme={theme}>
        <MenuConsole />
      </ThemeProvider>
    );
    
    expect(screen.getByText('TASTING MENUS')).toBeInTheDocument();
    expect(screen.getByText('Full Tasting Menu')).toBeInTheDocument();
    expect(screen.getByText('Five-Course Menu')).toBeInTheDocument();
    expect(screen.getByText('Bar-Tasting Menu')).toBeInTheDocument();
    
    expect(screen.getByText('$365 per person')).toBeInTheDocument();
    expect(screen.getByText('$285 per person')).toBeInTheDocument();
    expect(screen.getByText('$225 per person')).toBeInTheDocument();
  });
  
  it('renders enhancements and policies section', () => {
    render(
      <ThemeProvider theme={theme}>
        <MenuConsole />
      </ThemeProvider>
    );
    
    expect(screen.getByText('ENHANCEMENTS & POLICIES')).toBeInTheDocument();
    expect(screen.getByText('Optional Wine Pairings starting at $125 per person')).toBeInTheDocument();
    expect(screen.getByText('Corkage Fee: $75 per 750ml bottle (maximum 4)')).toBeInTheDocument();
  });
  
  it('renders a la carte offerings section', () => {
    render(
      <ThemeProvider theme={theme}>
        <MenuConsole />
      </ThemeProvider>
    );
    
    expect(screen.getByText('À LA CARTE OFFERINGS')).toBeInTheDocument();
    expect(
      screen.getByText('Available in the bar/lounge – a selection of snacks and small plates designed to complement an evening.')
    ).toBeInTheDocument();
  });
  
  it('renders menu note', () => {
    render(
      <ThemeProvider theme={theme}>
        <MenuConsole />
      </ThemeProvider>
    );
    
    expect(
      screen.getByText('Please note: Our menus are hyper-seasonal and change frequently. As such, courses are not published online.')
    ).toBeInTheDocument();
  });
}); 