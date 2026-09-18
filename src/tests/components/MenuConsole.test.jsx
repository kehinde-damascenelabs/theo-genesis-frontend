import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuConsole from '../../components/MenuConsole';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderMenu = () =>
  render(
    <ThemeProvider theme={theme}>
      <MenuConsole />
    </ThemeProvider>
  );

describe('MenuConsole', () => {
  it('renders restaurant name and subtitle', () => {
    renderMenu();

    expect(screen.getByText('MITI MITI')).toBeInTheDocument();
    expect(screen.getByText('MEXICAN CUISINE & CANTINA')).toBeInTheDocument();
  });

  it('renders the appetizers section with correct items and prices', () => {
    renderMenu();

    expect(screen.getByText('APPETIZERS & SHARES')).toBeInTheDocument();
    expect(screen.getByText('Potato Taquitos')).toBeInTheDocument();
    expect(screen.getByText('Wild Mushroom Croquetas')).toBeInTheDocument();
    expect(screen.getByText('Crab Cakes')).toBeInTheDocument();

    expect(screen.getByText('$9.00')).toBeInTheDocument();
    expect(screen.getAllByText('$7.00').length).toBeGreaterThan(0);
    expect(screen.getByText('$15.00')).toBeInTheDocument();
  });

  it('renders the beverages section', () => {
    renderMenu();

    expect(screen.getByText('BEVERAGES')).toBeInTheDocument();
    expect(screen.getByText('Classic Margarita')).toBeInTheDocument();
    expect(screen.getByText('Glass: $12.00 | Pitcher: $54.00')).toBeInTheDocument();
  });

  it('renders the entrees section', () => {
    renderMenu();

    expect(screen.getByText('ENTREES')).toBeInTheDocument();
    expect(screen.getByText('Skirt Steak')).toBeInTheDocument();
    expect(screen.getByText('Grilled Salmon')).toBeInTheDocument();
  });

  it('renders the closing menu note', () => {
    renderMenu();

    expect(
      screen.getByText('Happy Hour: Mon-Thu 11 AM-Close; Fri 11 AM-7 PM (not holidays)')
    ).toBeInTheDocument();
  });
});
