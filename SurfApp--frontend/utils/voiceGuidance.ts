/**
 * Voice Guidance System
 * Provides contextual voice commands to help user position themselves
 */

let lastSpokenMessage = '';
let lastSpokenTime = 0;
const THROTTLE_MS = 3000; // Don't repeat same message within 3 seconds

export type CalibrationStatus = 
  | 'not_detected' 
  | 'detecting' 
  | 'positioning' 
  | 'too_close' 
  | 'too_far' 
  | 'off_center' 
  | 'ready';

/**
 * Get voice message for calibration status
 */
export function getVoiceMessage(
  calibrationStatus: CalibrationStatus,
  bodyCompleteness?: { head: boolean; torso: boolean; legs: boolean; feet: boolean }
): string | null {
  const messages: Record<CalibrationStatus, string> = {
    'not_detected': 'Move into the center of the frame',
    'detecting': 'Stay still, detecting your pose...',
    'positioning': 'Adjust your position',
    'too_close': bodyCompleteness?.feet === false 
      ? "Step back, I can't see your feet" 
      : 'Step back a bit',
    'too_far': 'Move closer, I need to see your full body',
    'off_center': 'Move to the center of the frame',
    'ready': 'Perfect! Get ready to start',
  };
  
  return messages[calibrationStatus] || null;
}

/**
 * Speak voice guidance message (throttled)
 */
export async function speakGuidance(
  calibrationStatus: CalibrationStatus,
  bodyCompleteness?: { head: boolean; torso: boolean; legs: boolean; feet: boolean }
): Promise<void> {
  const message = getVoiceMessage(calibrationStatus, bodyCompleteness);
  
  if (!message) {
    return;
  }
  
  const now = Date.now();
  
  // Throttle: don't repeat same message within throttle period
  if (message === lastSpokenMessage && (now - lastSpokenTime) < THROTTLE_MS) {
    return;
  }
  
  // Only speak if status changed
  if (message === lastSpokenMessage) {
    return;
  }
  
  try {
    // Use Web Speech API if available (for web/Expo)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: Use expo-speech if available
      // @ts-ignore
      if (typeof Speech !== 'undefined') {
        // @ts-ignore
        Speech.speak(message, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        });
      } else {
        // No voice support - just log
        console.log('[Voice Guidance]:', message);
      }
    }
    
    lastSpokenMessage = message;
    lastSpokenTime = now;
  } catch (error) {
    // Voice synthesis failed - fail silently
    console.warn('[Voice Guidance] Failed to speak:', error);
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Reset voice guidance state
 */
export function resetVoiceGuidance(): void {
  lastSpokenMessage = '';
  lastSpokenTime = 0;
  stopSpeaking();
}

