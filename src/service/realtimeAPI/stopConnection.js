// Keep track of saved sessions to prevent duplicate saves
const savedSessionIds = new Set();

export function stopConnection({ pc, dc, audioEl, conversationData }) {
    // -------------------------------
    // Clean up the Data Channel (dc)
    // -------------------------------
    if (dc) {
        try {
            // If the data channel is currently open, close it.
            if (dc.readyState === 'open') {
                dc.close();
            }
            // Remove event listeners associated with the data channel.
            // (Passing null as the listener is a generic way to clear listeners if the implementation allows it.)
            dc.removeEventListener('message', null);
            dc.removeEventListener('open', null);
        } catch (error) {
            console.error('Error cleaning up data channel:', error);
        }
    }

    // -------------------------------
    // Clean up the Audio Element (audioEl)
    // -------------------------------
    if (audioEl) {
        try {
            // Pause the audio playback
            audioEl.pause();
            // Prevent auto-replay if the element is reused
            audioEl.autoplay = false;
            // Detach any media stream that is set as the source
            audioEl.srcObject = null;
            // Reload the audio element to reset its state
            audioEl.load();
            // Remove the audio element from the DOM
            audioEl.remove();
        } catch (error) {
            console.error('Error cleaning up audio element:', error);
        }
    }
    
    
    // ------------------------------------
    // Clean up the WebRTC Peer Connection (pc)
    // ------------------------------------
    if (pc) {
        try {
            // Stop all outgoing tracks added to the connection.
            pc.getSenders().forEach(sender => {
                if (sender.track) {
                    try {
                        sender.track.stop();
                    } catch (trackError) {
                        console.error('Error stopping sender track:', trackError);
                    }
                }
            });

            // Stop all incoming tracks (from remote peer) to cease media reception.
            pc.getReceivers().forEach(receiver => {
                if (receiver.track) {
                    try {
                        receiver.track.stop();
                    } catch (trackError) {
                        console.error('Error stopping receiver track:', trackError);
                    }
                }
            });

            // Remove event listeners to avoid memory leaks.
            pc.ontrack = null;
            pc.onconnectionstatechange = null;

            // Close the WebRTC peer connection.
            pc.close();

            // Log a message indicating that the connection has been fully closed and cleaned up.
            console.log("Connection fully closed and cleaned up.");
        } catch (error) {
            console.error('Error cleaning up peer connection:', error);
        }
    }

    // Save conversation data if available and not already saved
    if (conversationData && conversationData.messages && conversationData.messages.length > 0) {
        // Generate a unique ID for this session using the timestamp
        const sessionUniqueId = conversationData.sessionStart || new Date().toISOString();
        
        // Only save if this session hasn't been saved before
        if (!savedSessionIds.has(sessionUniqueId)) {
            savedSessionIds.add(sessionUniqueId);
            saveConversationData(conversationData);
        } else {
            console.log('Session transcript already saved, skipping duplicate save');
        }
    }
}

// Function to save conversation data to the backend
function saveConversationData(conversationData) {
    // Define your backend URL - adjust this to your actual backend URL
    const backendUrl = 'http://localhost:3000'; // Make sure this matches your actual backend port
    
    // Send data to the backend - backend will handle session counting
    fetch(`${backendUrl}/save-transcript`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionData: conversationData
        })
    })
    .then(response => {
        if (response.ok) {
            console.log("Transcript saved successfully");
        } else {
            console.error('Failed to save session transcript:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error saving session transcript:', error);
    });
}
