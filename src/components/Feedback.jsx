"use client"

import React, { useState } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export default function FeedBack() {
  const [feedback, setFeedback] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() === "") return;

    const newFeedback = {
      id: uuidv4(),
      message: input,
      timestamp: new Date().toLocaleString(),
    };

    setFeedback([newFeedback, ...feedback]);
    setInput("");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 6, p: 4, bgcolor: "background.paper", borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Feedback Section
      </Typography>
      <TextField
        label="Leave your feedback"
        variant="outlined"
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
        Submit
      </Button>

      <List sx={{ mt: 2 }}>
        {feedback.map((item) => (
          <ListItem key={item.id} sx={{ bgcolor: "grey.100", mb: 1, borderRadius: 1 }}>
            <ListItemText primary={item.message} secondary={`Posted on: ${item.timestamp}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
