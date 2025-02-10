"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { HERO_TEXT } from '../constants';



export default function Hero() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      id="hero"
      sx={{
        width: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundImage: isDarkMode
          ? 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)'
          : 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
      }}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
            }}
          >
            {HERO_TEXT.title}
            <Typography
              component="span"
              variant="h1"
              sx={{
                fontSize: 'inherit',
                color: isDarkMode ? 'primary.light' : 'primary.main',
              }}
            >
              {HERO_TEXT.subtitle}
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            {HERO_TEXT.description} 
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                color: isDarkMode ? 'primary.light' : 'primary.main', // Match "Demo" color
                fontWeight: 'bold',
              }}
            >
              {HERO_TEXT.actionText}
            </Typography>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
