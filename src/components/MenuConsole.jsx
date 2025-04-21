"use client";

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const MenuContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  width: '100%',
  overflowY: 'auto',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' 
    : theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.25)' 
    : theme.shadows[2],
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.mode === 'dark' 
      ? theme.palette.grey[800] 
      : theme.palette.grey[400],
    borderRadius: '3px',
  }
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTopLeftRadius: theme.spacing(1),
  borderTopRightRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' 
    : theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? 'none' 
    : '0 1px 2px rgba(0,0,0,0.03)',
}));

const HeaderText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  letterSpacing: '0.02em',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.grey[400] 
    : theme.palette.grey[600],
  textTransform: 'uppercase',
}));

const RestaurantTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(0.5),
  textAlign: 'center',
}));

const RestaurantSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  letterSpacing: '0.1em',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const SectionIcon = styled('span')(({ theme }) => ({
  fontSize: '1.5rem',
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
}));

const SectionText = styled(Typography)(({ theme }) => ({
  fontSize: '1.4rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
}));

const MenuItemTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const MenuItemDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  marginBottom: theme.spacing(1),
}));

const MenuItemDuration = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  marginBottom: theme.spacing(2.5),
  fontStyle: 'italic',
}));

const MenuItemPrice = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 500,
  position: 'absolute',
  right: theme.spacing(2.5),
  top: 0,
}));

const MenuNote = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontStyle: 'italic',
  marginTop: theme.spacing(2),
}));

const MenuConsole = () => {
  const theme = useTheme();

  return (
    <Box>
      <HeaderContainer>
        <HeaderText>Restaurant Menu</HeaderText>
      </HeaderContainer>
      <MenuContainer>
        <RestaurantTitle>ELEVEN MADISON PARK</RestaurantTitle>
        <RestaurantSubtitle>100% PLANT-BASED | HYPER-SEASONAL CUISINE</RestaurantSubtitle>
        
        <SectionTitle>
          <SectionIcon>🌱</SectionIcon>
          <SectionText>TASTING MENUS</SectionText>
        </SectionTitle>
        
        <Box position="relative" mb={2}>
          <MenuItemTitle>Full Tasting Menu</MenuItemTitle>
          <MenuItemDescription>
            An 8–9 course grand tasting experience showcasing the best of our plant-based culinary philosophy.
          </MenuItemDescription>
          <MenuItemDuration>Duration: ~2.5 to 3 hours</MenuItemDuration>
          <MenuItemPrice>$365 per person</MenuItemPrice>
        </Box>
        
        <Box position="relative" mb={2}>
          <MenuItemTitle>Five-Course Menu</MenuItemTitle>
          <MenuItemDescription>
            A curated 5-course tasting featuring highlights from our full menu.
          </MenuItemDescription>
          <MenuItemDuration>Duration: ~2 hours</MenuItemDuration>
          <MenuItemPrice>$285 per person</MenuItemPrice>
        </Box>
        
        <Box position="relative" mb={3}>
          <MenuItemTitle>Bar-Tasting Menu</MenuItemTitle>
          <MenuItemDescription>
            A 4–5 course tasting served in our bar and lounge space.
          </MenuItemDescription>
          <MenuItemDuration>Duration: ~2 hours</MenuItemDuration>
          <MenuItemPrice>$225 per person</MenuItemPrice>
        </Box>
        
        <SectionTitle>
          <SectionIcon>🍷</SectionIcon>
          <SectionText>ENHANCEMENTS & POLICIES</SectionText>
        </SectionTitle>
        
        <Box mb={2}>
          <MenuItemDescription>Optional Wine Pairings starting at $125 per person</MenuItemDescription>
          <MenuItemDescription>Corkage Fee: $75 per 750ml bottle (maximum 4)</MenuItemDescription>
        </Box>
        
        <SectionTitle>
          <SectionIcon>🍽️</SectionIcon>
          <SectionText>À LA CARTE OFFERINGS</SectionText>
        </SectionTitle>
        
        <Box mb={2}>
          <MenuItemDescription>
            Available in the bar/lounge – a selection of snacks and small plates designed to complement an evening.
          </MenuItemDescription>
        </Box>
        
        <MenuNote>
          Please note: Our menus are hyper-seasonal and change frequently. As such, courses are not published online.
        </MenuNote>
      </MenuContainer>
    </Box>
  );
};

export default MenuConsole; 