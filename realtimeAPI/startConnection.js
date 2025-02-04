// Import the agentPrompt from the helper functions module. This prompt is later used for the AI's initial response.
import { agentPrompt } from "../src/helper_func.js";

// Export an asynchronous function that sets up a WebRTC connection and initializes an AI session.
export async function startConnection() {
    // Fetch an ephemeral key from the backend service to authenticate the AI session.
    const response = await fetch("https://openaibackend-production.up.railway.app/getEKey");
    // For development, you might use a local endpoint (uncomment below if needed)
    // const response = await fetch("http://localhost:3001/getEKey"); DEV
    const json = await response.json();
    // Extract the ephemeral key from the JSON response.
    const EPHEMERAL_KEY = json.ephemeralKey;

    // Create a new WebRTC Peer Connection.
    const pc = new RTCPeerConnection();
    // Log the connection state whenever it changes (e.g., "connecting", "connected", "disconnected").
    pc.onconnectionstatechange = () => console.log("Connection state:", pc.connectionState);

    // Request access to the user's microphone.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Add the first audio track from the microphone stream to the peer connection.
    pc.addTrack(stream.getTracks()[0]);

    // Create an audio element to play incoming audio from the AI.
    const audioEl = document.createElement("audio");
    // Automatically start playing the audio when it's available.
    audioEl.autoplay = true;
    // When a new track is received (from the remote peer), set it as the source for the audio element.
    pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

    // Set up a data channel for receiving AI event messages.
    const dc = pc.createDataChannel("oai-events");
    // Listen for messages on the data channel.
    dc.addEventListener("message", (e) => {
        // Parse the incoming JSON message.
        const event = JSON.parse(e.data);
        // Log the received AI event.
        console.log("AI Event:", event);
    });

    // Begin the WebRTC session by creating an SDP offer.
    const offer = await pc.createOffer();
    // Set the local description of the peer connection using the created offer.
    await pc.setLocalDescription(offer);
    
    // Send the SDP offer to the OpenAI realtime API to start the session.
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17`, {
        method: "POST",
        // The body contains the SDP offer from the WebRTC connection.
        body: offer.sdp,
        headers: { 
            // Authorize the request using the ephemeral key.
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            // Specify the content type as SDP.
            "Content-Type": "application/sdp" 
        },
    });

    // Construct an SDP answer using the response from the API.
    const answer = { type: "answer", sdp: await sdpResponse.text() };
    // Set the remote description of the peer connection with the received SDP answer.
    await pc.setRemoteDescription(answer);

    // Prepare the initial AI response message with the necessary instructions.
    const responseCreate = {
        type: "response.create",
        response: { 
            // Indicate that the AI should handle both text and audio modalities.
            modalities: ["text", "audio"],
            // Include the agent prompt that was imported earlier.
            instructions: agentPrompt 
        },
    };
    // Once the data channel is open, send the initial response to the AI.
    dc.addEventListener("open", () => dc.send(JSON.stringify(responseCreate)));
    
    // Return the peer connection, data channel, and audio element so they can be used elsewhere.
    return { pc, dc, audioEl };
}
