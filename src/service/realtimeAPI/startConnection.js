import fns from '../function_calling';

// Export an asynchronous function that sets up a WebRTC connection and initializes an AI session.
export async function startConnection(callbacks = {}) {
    // Fetch an ephemeral key from the backend service to authenticate the AI session.
    // const response = await fetch("https://openaibackend-production.up.railway.app/getEKey");
    // For development, you might use a local endpoint (uncomment below if needed)
    const response = await fetch("http://localhost:3000/getEKey"); //DEV
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
        
        // Check if the event contains a failed status
        if (event.type === "response.done" && event.response?.status === "failed") {
            // Get the error message if available
            const errorMessage = event.response?.status_details?.error?.message || "Connection failed";
            console.error("AI Connection Error:", errorMessage);
            
            // Close the connection
            pc.close();
            return { error: errorMessage };
        }

        // Handle transcript events
        if (event.type === "response.audio_transcript.done" && event.transcript) {
            // Handle AI transcript completion
            console.log("AI transcript received:", event.transcript);
            if (callbacks.onAITranscript && typeof callbacks.onAITranscript === 'function') {
                callbacks.onAITranscript(event.transcript);
            }
        } else if (event.type === "conversation.item.input_audio_transcription.completed" && event.transcript) {
            // Handle user transcript completion
            console.log("User transcript received:", event.transcript);
            if (callbacks.onUserTranscript && typeof callbacks.onUserTranscript === 'function') {
                callbacks.onUserTranscript(event.transcript);
            }
        }

        // Notify about AI speaking status
        if (event.type === "response.audio.generation.started") {
            if (callbacks.onAISpeakingStateChange && typeof callbacks.onAISpeakingStateChange === 'function') {
                callbacks.onAISpeakingStateChange(true);
            }
        } else if (event.type === "response.audio.generation.done") {
            if (callbacks.onAISpeakingStateChange && typeof callbacks.onAISpeakingStateChange === 'function') {
                callbacks.onAISpeakingStateChange(false);
            }
        }
    });

    // Begin the WebRTC session by creating an SDP offer.
    const offer = await pc.createOffer();
    // Set the local description of the peer connection using the created offer.
    await pc.setLocalDescription(offer);
    
    // Send the SDP offer to the OpenAI realtime API to start the session.
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`, {
        method: "POST",
        // The body contains the SDP offer from the WebRTC connection.
        body: offer.sdp,
        headers: { 
            // Authorize the request using the ephemeral key.
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            // Specify the content type as SDP.
            "Content-Type": "application/sdp" 
        },
    }).catch(error => {
        console.error("API connection error:", error.message);
        if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
            callbacks.onConnectionFailed(`API error: ${error.message}`);
        }
        throw error;
    });

    // Construct an SDP answer using the response from the API.
    const answer = { type: "answer", sdp: await sdpResponse.text() };
    // Set the remote description of the peer connection with the received SDP answer.
    await pc.setRemoteDescription(answer).catch(error => {
        console.error("Error setting remote description:", error.message);
        if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
            callbacks.onConnectionFailed(`SDP error: ${error.message}`);
        }
        throw error;
    });

    // Prepare the initial AI response message with the necessary instructions.
    // const responseCreate = {
    //     type: "response.create",
    //     response: { 
    //         // Indicate that the AI should handle both text and audio modalities.
    //         modalities: ["text", "audio"],
    //     },
    // };
    // Once the data channel is open, send the initial response to the AI.
    // dc.addEventListener("open", () => dc.send(JSON.stringify(responseCreate)));

    const responseCreate = {
        type: "response.create",
    };

    const sessionUpdate = {
        type: "session.update",
        session: {
            modalities: ["text", "audio"],
            // Enable transcription using Whisper
            input_audio_transcription: { model: "whisper-1" },
            // Configure voice activity detection
            turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000,
                create_response: true,
        },
        temperature: 0.7,
        max_response_output_tokens: 4096,
        tools: [
            {
              type: "function",
              name: "fetchWeatherForecast",
              description:
                "Gets current weather conditions using the restaurant ZIP code. Use `condition.text` for the weather, `temp_f` for °F, and `daily_chance_of_rain` to warn of rain.",
              parameters: {
                type: "object",
                properties: {
                  zipCode: {
                    type: "string",
                    description: "The restaurant ZIP code",
                  }
                },
                required: ["zipCode"],
              }
            },
            {
              type: "function",
              name: "createReservationEvent",
              description: 
                "Creates a new restaurant reservation. Schedules the event in the user's Google Calendar and returns the created event details.",
              parameters: {
                type: "object",
                properties: {
                    name: {
                      type: "string",
                      description: "Name of the person making the reservation"
                    },
                  date: {
                    type: "string",
                    description: "Date of the reservation in YYYY-MM-DD format"
                  },
                  time: {
                    type: "string",
                    description: "Time of the reservation in HH:MM format (24-hour)"
                  },
                  partySize: {
                    type: "integer",
                    description: "Number of people in the reservation"
                  },
                  email: {
                    type: "string",
                    description: "Contact email for the reservation"
                  },
                  restaurantName: {
                    type: "string",
                    description: "Name of the restaurant for the reservation"
                  },
                  restaurantAddress: {
                    type: "string",
                    description: "Address of the restaurant"
                  }
                },
                required: ["date", "name", "time", "partySize", "email", "restaurantName", "restaurantAddress"]
              }
            },
            {
              type: "function",
              name: "updateReservationEvent",
              description:
                "Updates an existing restaurant reservation. Only specified fields will be updated.",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the person who made the reservation (used to identify the reservation)"
                  },
                  date: {
                    type: "string",
                    description: "Date of the reservation in YYYY-MM-DD format"
                  },
                  time: {
                    type: "string",
                    description: "Time of the reservation in HH:MM format (24-hour)"
                  },
                  partySize: {
                    type: "integer",
                    description: "Number of people in the reservation"
                  },
                  email: {
                    type: "string",
                    description: "Contact email for the reservation"
                  },
                  restaurantName: {
                    type: "string",
                    description: "Name of the restaurant for the reservation"
                  },
                  restaurantAddress: {
                    type: "string",
                    description: "Address of the restaurant"
                  },
                  newName: {
                    type: "string",
                    description: "New name for the person making the reservation (if changing the name)"
                  }
                },
                required: ["name"]
              }
            },
            {
              type: "function",
              name: "deleteReservationEvent",
              description:
                "Deletes an existing restaurant reservation.",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The name of the person who made the reservation to delete"
                  }
                },
                required: ["name"]
              }
            },
          ],
          tool_choice: "auto",
      },
    };
    // Once the data channel is open, send the initial response to the AI.
    dc.addEventListener("open", () => {
        console.log('Data channel opened, sending initial message');
        dc.send(JSON.stringify(sessionUpdate));
        dc.send(JSON.stringify(responseCreate));
    });

    // Add error handling for data channel
    dc.addEventListener('error', (error) => {
        console.error('Data channel error:', error);
        if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
            callbacks.onConnectionFailed(`Data channel error: ${error.message || 'Unknown error'}`);
        }
    });

    dc.addEventListener('message', async (ev) => {
        // console.log('Data channel message received:', ev.data);
        const msg = JSON.parse(ev.data);
        // Handle function calls
        if (msg.type === 'response.function_call_arguments.done') {
            const fn = fns[msg.name];
            if (fn !== undefined) {
                console.log(`Calling local function ${msg.name} with ${msg.arguments}`);
                const args = JSON.parse(msg.arguments);
                const result = await fn(args);
                console.log('result', result);
                // Let OpenAI know that the function has been called and share it's output
                const event = {
                    type: 'conversation.item.create',
                    item: {
                        type: 'function_call_output',
                        call_id: msg.call_id, // call_id from the function_call message
                        output: JSON.stringify(result), // result of the function
                    },
                };
                dc.send(JSON.stringify(event));
                // Have assistant respond after getting the results
                dc.send(JSON.stringify({type:"response.create"}));
            }
        }
    });

    
    // Return the peer connection, data channel, and audio element so they can be used elsewhere.
    return { pc, dc, audioEl };
}
