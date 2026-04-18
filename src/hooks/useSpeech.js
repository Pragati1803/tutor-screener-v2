import { useState, useRef, useCallback } from 'react';

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const speak = useCallback((text, onEnd) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Priority order: best natural English voices
      const preferred = [
        'Samantha',           // macOS - best
        'Karen',              // macOS Australian
        'Moira',              // macOS Irish  
        'Google US English',  // Chrome
        'Google UK English Female',
        'Microsoft Zira',     // Windows
        'Microsoft Jenny',    // Windows
      ];
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name));
        if (v) return v;
      }
      // Fallback: any en-US female voice
      return voices.find(v => v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
        || voices.find(v => v.lang === 'en-US')
        || voices.find(v => v.lang.startsWith('en'));
    };

    const doSpeak = () => {
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
      utterance.onerror = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    } else {
      doSpeak();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback((onResult, onEnd) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Please use Google Chrome for voice support.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;   // show words as they come
    recognition.maxAlternatives = 1;
    recognition.continuous = true;       // keep listening, don't stop early

    recognitionRef.current = recognition;

    let finalTranscript = '';
    let silenceTimer = null;
    let hasStarted = false;

    const resetSilenceTimer = () => {
      clearTimeout(silenceTimer);
      // Stop after 3 seconds of silence once they've started speaking
      silenceTimer = setTimeout(() => {
        if (hasStarted && finalTranscript.trim()) {
          recognition.stop();
        }
      }, 3000);
    };

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscript = '';
      // Give 10 seconds max total listening time
      silenceTimer = setTimeout(() => {
        recognition.stop();
      }, 10000);
    };

    recognition.onresult = (event) => {
      let interim = '';
      finalTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      hasStarted = true;
      onResult(finalTranscript.trim() || interim.trim());
      resetSilenceTimer(); // reset silence timer every time we hear something
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      setIsListening(false);
      if (onEnd) onEnd(finalTranscript.trim());
    };

    recognition.onerror = (e) => {
      clearTimeout(silenceTimer);
      console.error('Speech error:', e.error);
      if (e.error === 'no-speech') {
        // Retry once on no-speech
        setIsListening(false);
        if (onEnd) onEnd('');
        return;
      }
      setIsListening(false);
      if (onEnd) onEnd(finalTranscript.trim());
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSpeaking, speak, stopSpeaking, startListening, stopListening };
}
