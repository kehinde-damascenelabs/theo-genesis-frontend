/**
 * Utility for saving conversation transcripts and session metadata
 * This is designed for developer/investor usage, not end-users
 */

// Session state tracking
let currentSessionData = null;
let isSaving = false;

/**
 * Initialize a new session for transcript collection
 * @returns {Object} The initialized session metadata object
 */
export const initializeSession = () => {
  currentSessionData = {
    sessionId: crypto.randomUUID(),
    startTime: new Date(),
    messages: [],
    functionCalls: [],
    userAudioClips: [],
    aiAudioClips: [],
    metadata: {
      sessionStartTime: new Date().toISOString(),
    }
  };
  return currentSessionData;
};

/**
 * Add a message to the current session
 * @param {Object} message - Message to add to transcript
 */
export const addMessageToSession = (message) => {
  if (!currentSessionData) {
    console.warn('No active session, initializing one now');
    initializeSession();
  }
  
  const formattedMessage = {
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: message.text,
    timestamp: message.timestamp || new Date().toISOString()
  };
  
  currentSessionData.messages.push(formattedMessage);
};

/**
 * Add user audio clip to the current session
 * @param {Object} audioClip - User audio clip data
 */
export const addUserAudioToSession = (audioClip) => {
  if (!currentSessionData) {
    console.warn('No active session, initializing one now');
    initializeSession();
  }
  
  const formattedAudioClip = {
    timestamp: audioClip.timestamp || new Date().toISOString(),
    audioData: audioClip.audioData
  };
  
  currentSessionData.userAudioClips.push(formattedAudioClip);
};

/**
 * Add AI audio clip to the current session
 * @param {Object} audioClip - AI audio clip data
 */
export const addAIAudioToSession = (audioClip) => {
  if (!currentSessionData) {
    console.warn('No active session, initializing one now');
    initializeSession();
  }
  
  const formattedAudioClip = {
    timestamp: audioClip.timestamp || new Date().toISOString(),
    audioData: audioClip.audioData
  };
  
  currentSessionData.aiAudioClips.push(formattedAudioClip);
};

/**
 * Add function call to the current session
 * @param {Object} functionCall - Function call data
 */
export const addFunctionCallToSession = (functionCall) => {
  if (!currentSessionData) {
    console.warn('No active session, initializing one now');
    initializeSession();
  }
  
  currentSessionData.functionCalls.push(functionCall);
};

/**
 * Update session metadata
 * @param {Object} metadata - Additional metadata to merge
 */
export const updateSessionMetadata = (metadata) => {
  if (!currentSessionData) {
    console.warn('No active session, initializing one now');
    initializeSession();
  }
  
  currentSessionData.metadata = {
    ...currentSessionData.metadata,
    ...metadata
  };
};

/**
 * Finalize and save the session transcript
 * @param {Object} additionalMetadata - Any final metadata to include
 * @returns {Promise} Promise that resolves when the transcript is saved
 */
export const saveSessionTranscript = async (additionalMetadata = {}) => {
  // Skip if no session or already saving
  if (!currentSessionData || isSaving) {
    console.log('No active session or save already in progress, skipping');
    return { skipped: true };
  }
  
  try {
    isSaving = true;
    
    // Calculate session duration
    const endTime = new Date();
    const sessionDuration = endTime - currentSessionData.startTime;
    
    // Prepare final payload
    const payload = {
      transcript: currentSessionData.messages,
      functionCalls: currentSessionData.functionCalls,
      userAudioClips: currentSessionData.userAudioClips,
      aiAudioClips: currentSessionData.aiAudioClips,
      sessionData: {
        sessionId: currentSessionData.sessionId,
        timestamp: endTime.toISOString(),
        sessionDuration: sessionDuration,
        sessionDurationFormatted: `${Math.floor(sessionDuration / 60000)}m ${Math.floor((sessionDuration % 60000) / 1000)}s`,
        ...currentSessionData.metadata,
        ...additionalMetadata
      }
    };
    
    console.log('Sending consolidated transcript payload to backend:', payload);
    
    // Send to backend API - use local development endpoint
    const response = await fetch('http://localhost:3000/api/save-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save transcript: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Transcript saved successfully:', result);
    
    // Clear session data after successful save
    currentSessionData = null;
    
    return result;
  } catch (error) {
    console.error('Failed to save transcript:', error);
    throw error;
  } finally {
    isSaving = false;
  }
};

/**
 * Clean up the session (without saving)
 */
export const clearSession = () => {
  currentSessionData = null;
  console.log('Session data cleared without saving');
};

/**
 * Legacy function maintained for backward compatibility
 * @deprecated Use the new session-based approach instead
 */
export const saveTranscript = async (messages, functionCalls, sessionData = {}) => {
  console.warn('saveTranscript is deprecated. Use session-based approach instead');
  
  // If we have an active session, add the messages and function calls to it
  if (currentSessionData) {
    messages.forEach(msg => addMessageToSession(msg));
    functionCalls.forEach(call => addFunctionCallToSession(call));
    updateSessionMetadata(sessionData);
    return saveSessionTranscript();
  }
  
  // Otherwise, use the legacy approach
  try {
    if (isSaving) {
      console.log('Save already in progress, skipping');
      return { skipped: true };
    }
    
    isSaving = true;
    
    // Format the transcript data for better readability
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
      timestamp: msg.timestamp || new Date().toISOString()
    }));
    
    // Prepare the payload
    const payload = {
      transcript: formattedMessages,
      functionCalls,
      sessionData: {
        sessionId: crypto.randomUUID(), // Generate a unique ID for the session
        timestamp: new Date().toISOString(),
        ...sessionData
      }
    };
    
    console.log('LEGACY: Sending transcript payload to backend:', payload);
    
    // Send to backend API
    const response = await fetch('http://localhost:3000/api/save-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save transcript: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Transcript saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to save transcript:', error);
    throw error;
  } finally {
    setTimeout(() => {
      isSaving = false;
    }, 2000);
  }
};

/**
 * Legacy function maintained for backward compatibility
 * @deprecated Use the new session-based approach instead
 */
export const autoSaveTranscript = async (messages, functionCalls, reason = "completed") => {
  console.warn('autoSaveTranscript is deprecated. Use session-based approach instead');
  
  // Add session metadata
  const sessionData = {
    endReason: reason,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
    saveType: 'automatic'
  };

  return saveTranscript(messages, functionCalls, sessionData);
}; 