"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import visuallyHidden from '@mui/utils/visuallyHidden';
import StyledBox from "./styledBox";

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
            AI&nbsp;Voice&nbsp;Agent&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={{
                fontSize: 'inherit',
                color: isDarkMode ? 'primary.light' : 'primary.main',
              }}
            >
              Demo
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            Hi, I'm Kehinde!
            I'm a software developer building AI voice agents for businesses. Think of this AI like Jarvis from Iron Man—minus internet access (for now).
            This is a prototype, and more features are coming soon. I’d love your feedback—let me know what features you'd like to see below.
            AI can make mistakes, so please double-check any responses. 
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                color: isDarkMode ? 'primary.light' : 'primary.main', // Match "Demo" color
                fontWeight: 'bold',
              }}
            >
              Click the microphone & start a conversation!
            </Typography>
          </Typography>

          {/* REMOVE DO NOT NEED  */}
          {/* <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: '350px' } }}
          >
            <InputLabel htmlFor="email-hero" sx={visuallyHidden}>
              Email
            </InputLabel>
            <TextField
              id="email-hero"
              hiddenLabel
              size="small"
              variant="outlined"
              aria-label="Enter your email address"
              placeholder="Your email address"
              fullWidth
              slotProps={{
                htmlInput: {
                  autoComplete: 'off',
                  'aria-label': 'Enter your email address',
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ minWidth: 'fit-content' }}
            >
              Start now
            </Button>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            By clicking &quot;Start now&quot; you agree to our&nbsp;
            <Link href="#" color="primary">
              Terms & Conditions
            </Link>
            .
          </Typography> */}
        </Stack>
        {/* REMOVE DO NOT NEED  */}
        {/* <StyledBox id="image" /> */}
      </Container>
    </Box>
  );
}
