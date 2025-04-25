import fns from '../function_calling';
import { agentPrompt } from '../../utils/helper_func';
import { addFunctionCallToSession, addAIAudioToSession } from '../../utils/transcriptService';

// Helper to detect if we're on a mobile browser
const isMobileBrowser = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Export an asynchronous function that sets up a WebRTC connection and initializes an AI session.
export async function startConnection(callbacks = {}) {
    // Create an array to track function calls
    const functionCalls = [];
    
    try {
        // Fetch an ephemeral key from the backend service to authenticate the AI session.
        const response = await fetch("https://openaibackend-production.up.railway.app/getEKey");
        // const response = await fetch("http://localhost:3000/getEKey"); //DEV
        
        if (!response.ok) {
            const errorMsg = `Failed to get ephemeral key: ${response.status} ${response.statusText}`;
            console.error(errorMsg);
            if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
                callbacks.onConnectionFailed(errorMsg);
            }
            throw new Error(errorMsg);
        }
        
        const json = await response.json();
        // Extract the ephemeral key from the JSON response.
        const EPHEMERAL_KEY = json.ephemeralKey;

        // Create WebRTC configuration with ICE servers for better mobile connectivity
        const rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
            ],
            iceCandidatePoolSize: 10,
            // Optimize for mobile connections
            bundlePolicy: isMobileBrowser() ? 'max-bundle' : 'balanced'
        };

        // Create a new WebRTC Peer Connection with the config.
        const pc = new RTCPeerConnection(rtcConfig);
        
        // Log the connection state whenever it changes (e.g., "connecting", "connected", "disconnected").
        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            // Notify about connection state changes via callback
            if (callbacks.onConnectionStateChange && typeof callbacks.onConnectionStateChange === 'function') {
                callbacks.onConnectionStateChange(pc.connectionState);
            }
        };

        // Add ice connection state monitoring - important for mobile connectivity
        pc.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
                console.error("ICE connection failed");
                if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
                    callbacks.onConnectionFailed(`ICE connection state: ${pc.iceConnectionState}`);
                }
            }
        };

        // Request access to the user's microphone.
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
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
        
        // Add datachannel event handlers
        dc.onopen = () => {
            console.log('Data channel opened, sending initial message');
            dc.send(JSON.stringify(sessionUpdate));
            dc.send(JSON.stringify(responseCreate));
        };
        
        dc.onclose = () => {
            console.log('Data channel closed');
        };
        
        dc.onerror = (error) => {
            console.error('Data channel error:', error);
            if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
                callbacks.onConnectionFailed(`Data channel error: ${error.message || 'Unknown error'}`);
            }
        };

        // Listen for messages on the data channel.
        dc.addEventListener("message", (e) => {
            // Parse the incoming JSON message.
            const event = JSON.parse(e.data);
            // Log the received AI event.
            console.log("AI Event:", event);
            if (event.type === "error") {
                console.log("Error event received :", event.error.message);
            }
            
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
            
            // Capture AI audio chunks
            if (event.type === "response.audio.delta" && event.audio) {
                try {
                    // Convert binary audio data to base64
                    const audioData = btoa(String.fromCharCode(...new Uint8Array(event.audio)));
                    
                    // Save to transcript service
                    addAIAudioToSession({
                        timestamp: new Date().toISOString(),
                        audioData: audioData
                    });
                    
                    // Callback for audio chunk if needed
                    if (callbacks.onAIAudioChunk && typeof callbacks.onAIAudioChunk === 'function') {
                        callbacks.onAIAudioChunk(audioData);
                    }
                } catch (error) {
                    console.error("Error processing AI audio chunk:", error);
                }
            }

            // Handle function calls
            if (event.type === 'response.function_call_arguments.done') {
                const fn = fns[event.name];
                if (fn !== undefined) {
                    console.log(`Calling local function ${event.name} with ${event.arguments}`);
                    const args = JSON.parse(event.arguments);
                    
                    // Create a more detailed function call record
                    const functionCall = {
                        timestamp: new Date().toISOString(),
                        functionName: event.name,
                        arguments: args,
                        callId: event.call_id
                    };
                    
                    // Add to the function calls array
                    functionCalls.push(functionCall);
                    
                    // Add to session storage for transcript saving
                    addFunctionCallToSession(functionCall);
                    
                    // Notify via callback if provided
                    if (callbacks.onFunctionCall && typeof callbacks.onFunctionCall === 'function') {
                        callbacks.onFunctionCall(functionCalls);
                    }
                    
                    (async () => {
                        try {
                            const result = await fn(args);
                            console.log('Function call result:', result);
                            // Let OpenAI know that the function has been called and share it's output
                            const fnEvent = {
                                type: 'conversation.item.create',
                                item: {
                                    type: 'function_call_output',
                                    call_id: event.call_id, // call_id from the function_call message
                                    output: JSON.stringify(result), // result of the function
                                },
                            };
                            dc.send(JSON.stringify(fnEvent));
                            // Have assistant respond after getting the results
                            dc.send(JSON.stringify({type:"response.create"}));
                        } catch (fnError) {
                            console.error(`Error executing function ${event.name}:`, fnError);
                            // Send error result to OpenAI
                            const errorEvent = {
                                type: 'conversation.item.create',
                                item: {
                                    type: 'function_call_output',
                                    call_id: event.call_id,
                                    output: JSON.stringify({ error: fnError.message }),
                                },
                            };
                            dc.send(JSON.stringify(errorEvent));
                            dc.send(JSON.stringify({type:"response.create"}));
                        }
                    })();
                }
            }
        });
        
        // Add ICE candidate gathering timeout for mobile
        let iceGatheringTimeout;
        if (isMobileBrowser()) {
            pc.onicegatheringstatechange = () => {
                console.log("ICE gathering state:", pc.iceGatheringState);
                
                // Clear any existing timeout
                if (iceGatheringTimeout) {
                    clearTimeout(iceGatheringTimeout);
                }
                
                // Set timeout for ICE gathering
                if (pc.iceGatheringState === 'gathering') {
                    iceGatheringTimeout = setTimeout(() => {
                        if (pc.iceGatheringState !== 'complete') {
                            console.log("ICE gathering taking too long, continuing with available candidates");
                        }
                    }, 5000); // 5 second timeout for mobile ICE gathering
                }
            };
        }

        // Begin the WebRTC session by creating an SDP offer.
        const offer = await pc.createOffer();
        
        // Set the local description of the peer connection using the created offer.
        await pc.setLocalDescription(offer);
        
        try {
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
            });
            
            if (!sdpResponse.ok) {
                throw new Error(`API returned status ${sdpResponse.status}: ${sdpResponse.statusText}`);
            }
            
            // Construct an SDP answer using the response from the API.
            const answer = { type: "answer", sdp: await sdpResponse.text() };
            
            // Set the remote description of the peer connection with the received SDP answer.
            await pc.setRemoteDescription(answer);
            
        } catch (apiError) {
            console.error("API or SDP error:", apiError.message);
            if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
                callbacks.onConnectionFailed(`API error: ${apiError.message}`);
            }
            throw apiError;
        }

        // Prepare the response creation objects as before
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
                    threshold: 0.75,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 1000,
                    create_response: true,
                },
                temperature: 0.6,
                instructions: agentPrompt,
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
                                },
                            },
                            required: ["zipCode"],
                        },
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
                                    description: "Name of the person making the reservation",
                                },
                                date: {
                                    type: "string",
                                    description: "Date of the reservation in YYYY-MM-DD format",
                                },
                                time: {
                                    type: "string",
                                    description:
                                        "Time of the reservation in HH:MM format (24-hour)",
                                },
                                partySize: {
                                    type: "integer",
                                    description: "Number of people in the reservation",
                                },
                                email: {
                                    type: "string",
                                    description: "Contact email for the reservation",
                                },
                                restaurantName: {
                                    type: "string",
                                    description: "Name of the restaurant for the reservation",
                                },
                                restaurantAddress: {
                                    type: "string",
                                    description: "Address of the restaurant",
                                },
                            },
                            required: [
                                "date",
                                "name",
                                "time",
                                "partySize",
                                "email",
                                "restaurantName",
                                "restaurantAddress",
                            ],
                        },
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
                                    description:
                                        "The name of the person who made the reservation (used to identify the reservation)",
                                },
                                date: {
                                    type: "string",
                                    description: "Date of the reservation in YYYY-MM-DD format",
                                },
                                time: {
                                    type: "string",
                                    description:
                                        "Time of the reservation in HH:MM format (24-hour)",
                                },
                                partySize: {
                                    type: "integer",
                                    description: "Number of people in the reservation",
                                },
                                email: {
                                    type: "string",
                                    description: "Contact email for the reservation",
                                },
                                restaurantName: {
                                    type: "string",
                                    description: "Name of the restaurant for the reservation",
                                },
                                restaurantAddress: {
                                    type: "string",
                                    description: "Address of the restaurant",
                                },
                                newName: {
                                    type: "string",
                                    description:
                                        "New name for the person making the reservation (if changing the name)",
                                },
                            },
                            required: ["name"],
                        },
                    },
                    {
                        type: "function",
                        name: "deleteReservationEvent",
                        description: "Deletes an existing restaurant reservation.",
                        parameters: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description:
                                        "The name of the person who made the reservation to delete",
                                },
                            },
                            required: ["name"],
                        },
                    },
                    {
                        type: "function",
                        name: "switchTab",
                        description: "Switches the display to a different information tab",
                        parameters: {
                            type: "object",
                            properties: {
                                tabName: {
                                    type: "string",
                                    enum: ["Transcript", "Restaurant Info", "Menu", "Calendar"],
                                    description: "The name of the tab to switch to",
                                },
                            },
                            required: ["tabName"],
                        },
                    },
                ],
                tool_choice: "auto",
            },
        };

        // Return the peer connection, data channel, and audio element so they can be used elsewhere.
        return { pc, dc, audioEl, functionCalls };
        
    } catch (error) {
        console.error("Connection setup error:", error);
        if (callbacks.onConnectionFailed && typeof callbacks.onConnectionFailed === 'function') {
            callbacks.onConnectionFailed(`Connection error: ${error.message}`);
        }
        throw error;
    }
}
