"use client";

import React, { useEffect, useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components to match ConversationTranscript styling
const PanelContainer = styled(Box)(({ theme }) => ({
  height: '437.39px',
  width: '100%',
  overflow: 'auto',
  backgroundColor: theme.palette.mode === 'dark' 
    ? '#1C1C1C' // Softer dark background
    : theme.palette.grey[50], // Light gray in light mode
  borderRadius: theme.spacing(1),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.25)' 
    : theme.shadows[2],
}));

const PlaceDetailsContent = styled(Box)(({ theme }) => ({
  // height: '100%',
  width: '100%',
  padding: theme.spacing(0),
  position: 'relative',
  overflow: 'auto',
  color: '#000',
}));

const PlaceDetailsPanel = ({ placeId }) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    // Only load if the component is mounted and placeId is provided
    if (containerRef.current && placeId) {
      // Wait for the Maps JavaScript API to load
      if (window.google && window.google.maps) {
        initPlaceDetails();
      } else {
        // If the API isn't loaded yet, set up a callback
        window.initPlaceDetails = initPlaceDetails;
        
        // Check if the script is already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=alpha&callback=initPlaceDetails`;
          script.async = true;
          document.head.appendChild(script);
        }
      }
    }

    function initPlaceDetails() {
      if (!containerRef.current) return;
      
      // Clear any existing content
      containerRef.current.innerHTML = "";
      
      // Create the place details element
      const placeDetails = document.createElement('gmp-place-details');
      placeDetails.setAttribute('size', 'x-large');
      
      // Style the element to fit the container
      placeDetails.style.width = '100%';
      placeDetails.style.height = '100%';
      
      // Append to the container
      containerRef.current.appendChild(placeDetails);
      
      // Configure the place details with the given placeId
      placeDetails.configureFromPlace({ id: placeId })
        .then(() => {
          console.log("Place details loaded successfully.");
        })
        .catch((error) => {
          console.error("Error loading place details:", error);
        });
    }

    return () => {
      // Cleanup if needed
      if (window.initPlaceDetails) {
        delete window.initPlaceDetails;
      }
    };
  }, [placeId, apiKey]);

  return (
    <Box>
      <PanelContainer>
        <PlaceDetailsContent ref={containerRef} data-testid="place-details-content">
          {/* Google Maps Place Details will be inserted here by the useEffect */}
        </PlaceDetailsContent>
      </PanelContainer>
    </Box>
  );
};

export default PlaceDetailsPanel; 