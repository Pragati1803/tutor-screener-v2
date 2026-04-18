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

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Google UK English Female', 'Microsoft Zira', 'Microsoft Jenny'];
      let voice = null;
      for (const name of preferred) {
        voice = voices.find(v => v.name.includes(name));
        if (voice) break;
      }
      if (!voice) voice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
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

  const startListening = useCallback((onLiveUpdate, onDone) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Please use Google Chrome for voice support.');
      return;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    // We accumulate FINAL results here — never reset this
    let accumulated = '';
    let silenceTimer = null;

    const resetSilence = () => {
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        recognition.stop();
      }, 3500); // 3.5s silence = done speaking
    };

    recognition.onstart = () => {
      setIsListening(true);
      accumulated = '';
    };

    recognition.onresult = (event) => {
      let interimText = '';

      // Loop only from the last processed result
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          accumulated += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }

      // Show accumulated finals + current interim
      const display = (accumulated + interimText).trim();
      onLiveUpdate(display);
      resetSilence();
    };

    recognition.onspeechstart = () => {
      resetSilence();
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      setIsListening(false);
      const final = accumulated.trim();
      onDone(final);
    };

    recognition.onerror = (e) => {
      clearTimeout(silenceTimer);
      console.error('Speech error:', e.error);
      if (e.error === 'no-speech') {
        // Let onend handle it naturally
        return;
      }
      setIsListening(false);
      onDone(accumulated.trim());
    };

    // Start with a max timeout of 60 seconds
    recognition.start();
    silenceTimer = setTimeout(() => recognition.stop(), 60000);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
  }, []);

  return { isListening, isSpeaking, speak, stopSpeaking, startListening, stopListening };
}
