export function stopConnection({ pc, dc, audioEl }) {
    // -------------------------------
    // Clean up the Data Channel (dc)
    // -------------------------------
    if (dc) {
        // If the data channel is currently open, close it.
        if (dc.readyState === 'open') {
            dc.close();
        }
        // Remove event listeners associated with the data channel.
        // (Passing null as the listener is a generic way to clear listeners if the implementation allows it.)
        dc.removeEventListener('message', null);
        dc.removeEventListener('open', null);
    }

    // -------------------------------
    // Clean up the Audio Element (audioEl)
    // -------------------------------
    if (audioEl) {
        // Pause the audio playback.
        audioEl.pause();
        // Detach any media stream that is set as the source.
        audioEl.srcObject = null;
        // Reload the audio element to reset its state.
        audioEl.load();
        // Remove the audio element from the DOM.
        audioEl.remove();
    }
    
    // ------------------------------------
    // Clean up the WebRTC Peer Connection (pc)
    // ------------------------------------
    if (pc) {
        // Stop all outgoing tracks added to the connection.
        pc.getSenders().forEach(sender => {
            if (sender.track) {
                sender.track.stop();
            }
        });

        // Stop all incoming tracks (from remote peer) to cease media reception.
        pc.getReceivers().forEach(receiver => {
            if (receiver.track) {
                receiver.track.stop();
            }
        });

        // Remove event listeners to avoid memory leaks.
        pc.ontrack = null;
        pc.onconnectionstatechange = null;

        // Close the WebRTC peer connection.
        pc.close();

        // Log a message indicating that the connection has been fully closed and cleaned up.
        console.log("Connection fully closed and cleaned up.");
    }
}
