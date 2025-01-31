import { agentPrompt } from "../src/helper_func.js";

export async function startConnection() {
    const response = await fetch("https://openaibackend-production.up.railway.app/getEKey");
    const json = await response.json();
    const EPHEMERAL_KEY = json.ephemeralKey;

    // Create WebRTC peer connection
    const pc = new RTCPeerConnection();
    pc.onconnectionstatechange = () => console.log("Connection state:", pc.connectionState);

    // Get user microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    pc.addTrack(stream.getTracks()[0]);

    // Handle AI audio response
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = (e) => (audioEl.srcObject = e.streams[0]);

    // Setup data channel for events
    const dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("AI Event:", event);
    });

    // Start WebRTC session
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17`, {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${EPHEMERAL_KEY}`, "Content-Type": "application/sdp" },
    });

    const answer = { type: "answer", sdp: await sdpResponse.text() };
    await pc.setRemoteDescription(answer);

    // Send AI initial response
    const responseCreate = {
        type: "response.create",
        response: { modalities: ["text", "audio"], instructions: agentPrompt },
    };
    dc.addEventListener("open", () => dc.send(JSON.stringify(responseCreate)));
    
    return { pc, dc, audioEl };
}