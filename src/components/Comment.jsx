"use client"

import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState({
    feature: "",
    understanding: "",
    voice: "",
    useCase: "",
    other: "",
  });

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const newFeedback = {
      id: uuidv4(),
      timestamp: new Date().toLocaleString(),
      ...feedback,
    };

    try {
      const response = await axios.post(
        "https://script.google.com/macros/s/AKfycbxhTfEE_lFGIfv0qMRNA-drtdN4oGKg5dyZE8xUKRFSLBiOA7tIy2bJJATzKYQZ5JDN-g/exec",
        newFeedback,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
      
      if (response.data) {
        alert("Feedback submitted successfully!");
        setFeedback({ feature: "", understanding: "", voice: "", useCase: "", other: "" });
      }
    } catch (error) {
      console.error("Error submitting feedback", error);
      alert("Failed to submit feedback. Please try again later.");
    }
  };

  return (
    <Box 
      sx={{ 
        width: "100%", 
        maxWidth: 600, 
        mx: "auto", 
        mt: 6, 
        p: 4, 
        bgcolor: "background.paper", 
        borderRadius: 2, 
        boxShadow: 3 
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", textAlign: "center" }}>
        AI Feedback Section
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        What feature do you wish this AI had?
      </Typography>
      <TextField
        name="feature"
        variant="outlined"
        fullWidth
        minRows={2}
        maxRows={6}
        value={feedback.feature}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        How well did the AI understand you? Rate it 1-5 and let me know why!
      </Typography>
      <TextField
        name="understanding"
        variant="outlined"
        fullWidth
        minRows={2}
        maxRows={6}
        value={feedback.understanding}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Typography variant="body1" sx={{ mb: 1 }}>
        Did the AI's voice feel natural? What would make it sound better?
      </Typography>
      <TextField
        name="voice"
        variant="outlined"
        fullWidth
        minRows={2}
        maxRows={6}
        value={feedback.voice}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Typography variant="body1" sx={{ mb: 1 }}>
        Would you use this AI for anything specific? (Think content creation, customer service, gaming, etc.)
      </Typography>
      <TextField
        name="useCase"
        variant="outlined"
        fullWidth
        minRows={2}
        maxRows={6}
        value={feedback.useCase}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        Anything else on your mind? Share your thoughts or feedback!
      </Typography>
      <TextField
        name="other"
        variant="outlined"
        fullWidth
        minRows={2}
        maxRows={6}
        value={feedback.other}
        onChange={handleChange}
        sx={{ mb: 3 }}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth sx={{ mt: 2 }}>
        Submit Feedback
      </Button>
    </Box>
  );
}


