"use client";

import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CarouselContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const NavigationTab = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  transition: 'color 0.3s ease, font-weight 0.3s ease',
  '&[data-active="true"]': {
    fontWeight: 600,
    color: theme.palette.primary.main,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  }
}));

const StyledSlider = styled(Slider)({
  width: '100%',
  '& .slick-track': {
    display: 'flex',
    '& .slick-slide': {
      height: 'inherit',
      '& > div': {
        height: '100%',
      }
    }
  }
});

const PanelCarousel = ({ transcriptPanel, placeDetailsPanel }) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleChangeIndex = (index) => {
    setActiveIndex(index);
  };

  const handleTabClick = (index) => {
    setActiveIndex(index);
    if (sliderRef) {
      sliderRef.slickGoTo(index);
    }
  };

  // Settings for the Slider component
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: handleChangeIndex,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    arrows: false,
  };

  let sliderRef = null;

  return (
    <CarouselContainer>
      <NavigationContainer>
        <NavigationTab 
          data-active={activeIndex === 0} 
          onClick={() => handleTabClick(0)}
          data-testid="transcript-tab"
        >
          <Typography>Transcript</Typography>
        </NavigationTab>
        <NavigationTab 
          data-active={activeIndex === 1} 
          onClick={() => handleTabClick(1)}
          data-testid="place-details-tab"
        >
          <Typography>Place Details</Typography>
        </NavigationTab>
      </NavigationContainer>
      
      <StyledSlider
        ref={slider => (sliderRef = slider)}
        {...settings}
      >
        {/* Transcript Panel */}
        <Box data-testid="transcript-panel-container">{transcriptPanel}</Box>
        
        {/* Place Details Panel */}
        <Box data-testid="place-details-panel-container">{placeDetailsPanel}</Box>
      </StyledSlider>
    </CarouselContainer>
  );
};

export default PanelCarousel; 