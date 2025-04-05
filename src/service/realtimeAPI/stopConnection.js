export function stopConnection({ pc, dc, audioEl }) {
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
}
