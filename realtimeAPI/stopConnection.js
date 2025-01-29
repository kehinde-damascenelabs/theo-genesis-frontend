export function stopConnection({ pc, dc, audioEl }) {
    // Clean up data channel if it exists and is open
    if (dc) {
        if (dc.readyState === 'open') {
            dc.close();
        }
        // Remove any event listeners
        dc.removeEventListener('message', null);
        dc.removeEventListener('open', null);
    }

    // Clean up audio element
    if (audioEl) {
        audioEl.pause();
        audioEl.srcObject = null;
        audioEl.load(); // Ensure it resets
        audioEl.remove();
    }
    

    // Clean up WebRTC peer connection
    if (pc) {
        // Stop all tracks from all senders
        pc.getSenders().forEach(sender => {
            if (sender.track) {
                sender.track.stop();
            }
        });

        // Stop all receivers (incoming tracks)
        pc.getReceivers().forEach(receiver => {
            if (receiver.track) {
                receiver.track.stop();
            }
        });

        // Remove all event listeners
        pc.ontrack = null;
        pc.onconnectionstatechange = null;

        // Close the peer connection
        pc.close();

        console.log("Connection fully closed and cleaned up.");
    }
}