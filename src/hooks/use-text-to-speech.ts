import { useState, useEffect, useCallback } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null
  );
  const [highlightRange, setHighlightRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);
      setSynth(window.speechSynthesis);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking && synth) {
        synth.cancel();
      }
    };
  }, [isSpeaking, synth]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !synth) return;

      if (isSpeaking) {
        synth.cancel();
        setIsSpeaking(false);
        setHighlightRange(null);
        return;
      }

      // Simple markdown stripping
      const cleanText = text
        .replace(/[*#_`]/g, "") // Remove basic symbols
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, ""); // Images

      const newUtterance = new SpeechSynthesisUtterance(cleanText);
      
      // Optional: Select a voice (e.g., first English voice)
      const voices = synth.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        newUtterance.voice = englishVoice;
      }

      newUtterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const charLength = event.charLength || cleanText.substring(charIndex).indexOf(' ') || 0;
          setHighlightRange({
            start: charIndex,
            end: charIndex + (charLength > 0 ? charLength : 0),
          });
        }
      };

      newUtterance.onend = () => {
        setIsSpeaking(false);
        setHighlightRange(null);
      };
      
      newUtterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsSpeaking(false);
        setHighlightRange(null);
      };

      setUtterance(newUtterance);
      synth.speak(newUtterance);
      setIsSpeaking(true);
    },
    [supported, synth, isSpeaking]
  );

  const cancel = useCallback(() => {
    if (!supported || !synth) return;
    synth.cancel();
    setIsSpeaking(false);
    setHighlightRange(null);
  }, [supported, synth]);

  return { speak, cancel, isSpeaking, supported, highlightRange };
};
