import * as Speech from 'expo-speech';

export async function speakKannada(text) {
  try {
    // Check if speech is available
    const available = await Speech.isSpeakingAsync();
    if (available) {
      await Speech.stop();
    }

    // Speak in Kannada
    console.log('[TTS] Speaking in Kannada:', text);
    Speech.speak(text, {
      language: 'kn-IN', // Kannada (India)
      pitch: 1.0,
      rate: 0.9,
      onDone: () => console.log('[TTS] Speech completed'),
      onError: (error) => {
        console.error('[TTS] Speech error:', error);
        // Fallback to English if Kannada not available
        Speech.speak(text, {
          language: 'en-IN',
          pitch: 1.0,
          rate: 0.9,
        });
      }
    });
  } catch (error) {
    console.error('[TTS] Error in speakKannada:', error);
    // Silent fail - TTS is not critical
  }
}
