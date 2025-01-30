// Import required modules
import express from "express"; // Web framework for building the server
import dotenv from "dotenv"; // Loads environment variables from a .env file
import cors from "cors"; // Middleware for enabling Cross-Origin Resource Sharing

// Load environment variables from the .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// Step 1: Apply CORS middleware globally
// This allows specific origins to access the server resources
// app.use(cors({
//     origin: ["http://127.0.0.1:5500", "http://localhost:3001"], // Allow both these origins
// }));
app.use(cors({
    origin: "*",
}));


// Step 2: Define the `/session` route
// This route interacts with the OpenAI Realtime API to create a new session
app.get("/session", async (req, res) => {
    try {
        // Send a POST request to the OpenAI Realtime API to create a new session
        const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Use the API key from environment variables
                "Content-Type": "application/json", // Specify JSON content
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-realtime-preview-2024-12-17", // Specify the model to use
                voice: "oynx", // Specify the voice for audio responses
            }),
        });

        // Parse the JSON response from OpenAI
        const data = await r.json();

        // Send the session data back to the client
        res.send(data);
    } catch (error) {
        // Handle any errors that occur during the API request
        console.error("Error creating session:", error);
        res.status(500).send({ error: "Failed to create session" });
    }
});

// Step 3: Start the server
// This starts the server and listens on port 3000 for incoming requests
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
