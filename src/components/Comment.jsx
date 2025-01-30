"use client"

import React, { useState } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export default function CommentSection({ isDarkMode }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() === "") return;

    const newComment = {
      id: uuidv4(),
      message: input,
      timestamp: new Date().toLocaleString(),
    };

    setComments([newComment, ...comments]);
    setInput("");
  };

  // Handles Enter key press inside TextField
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents new line in the input field
      handleSubmit();
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
        Comment Section
      </Typography>
      
      <TextField
        label="Leave a comment"
        variant="outlined"
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}  // <-- Added this line
        sx={{ mb: 2 }}
      />
      
      <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
        Submit
      </Button>

      {comments.length > 0 && (
        <List sx={{ mt: 3 }}>
          {comments.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem 
                sx={{ 
                  bgcolor: isDarkMode ? 'primary.light' : 'primary.main', 
                  color: "black", 
                  borderRadius: 1,
                }}
              >
                <ListItemText 
                  primary={item.message} 
                  secondary={`Posted on: ${item.timestamp}`} 
                />
              </ListItem>
              {index < comments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

