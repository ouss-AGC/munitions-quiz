import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuiz } from '@/contexts/QuizContext';

export function VoiceBriefing() {
  // const { selectedDiscipline } = useQuiz();
  const BRIEFING_TEXT = "Bonjour et bienvenue au devoir de contrôle sur les Généralités des Munitions. Ce test comprend 57 questions à choix multiples couvrant les principes fondamentaux des munitions militaires. Vous disposerez de 60 secondes pour répondre à chaque question. Bonne chance !";
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);
  const currentWordIndexRef = useRef(0);

  useEffect(() => {
    // Split text into words
    wordsRef.current = BRIEFING_TEXT.split(' ');
    // Reset displayed text when discipline changes
    setDisplayedText('');
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
    }

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startBriefing = () => {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n\'est pas supportée par votre navigateur');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    setIsPlaying(true);
    setDisplayedText('');
    currentWordIndexRef.current = 0;

    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(BRIEFING_TEXT);
    utteranceRef.current = utterance;

    // Configure voice
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for female voice
    utterance.volume = isMuted ? 0 : 1;

    // Try to find a French female voice
    const voices = window.speechSynthesis.getVoices();
    const frenchFemaleVoice = voices.find(
      voice => voice.lang.startsWith('fr') && voice.name.toLowerCase().includes('female')
    ) || voices.find(
      voice => voice.lang.startsWith('fr')
    );
    
    if (frenchFemaleVoice) {
      utterance.voice = frenchFemaleVoice;
    }

    // Use boundary event for precise word-by-word synchronization
    const words = wordsRef.current;
    let wordIntervalFallback: NodeJS.Timeout | null = null;

    // Boundary event fires when the speech synthesis reaches word boundaries
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Get the character index of the current word
        const charIndex = event.charIndex;
        // Find how many words have been spoken based on character position
        let charCount = 0;
        let wordIndex = 0;
        
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length + (i > 0 ? 1 : 0); // +1 for space
          if (charCount > charIndex) {
            wordIndex = i;
            break;
          }
        }
        
        // Update displayed text up to current word
        currentWordIndexRef.current = wordIndex + 1;
        setDisplayedText(words.slice(0, wordIndex + 1).join(' '));
      }
    };

    // Fallback: if boundary events don't work, use time-based animation
    const totalDuration = (BRIEFING_TEXT.length / utterance.rate) * 60;
    const wordDelay = totalDuration / words.length;
    
    wordIntervalFallback = setInterval(() => {
      if (currentWordIndexRef.current < words.length) {
        setDisplayedText(prev => 
          prev + (prev ? ' ' : '') + words[currentWordIndexRef.current]
        );
        currentWordIndexRef.current++;
      } else {
        if (wordIntervalFallback) clearInterval(wordIntervalFallback);
      }
    }, wordDelay);

    utterance.onend = () => {
      setIsPlaying(false);
      if (wordIntervalFallback) clearInterval(wordIntervalFallback);
      // Ensure all text is displayed
      setDisplayedText(BRIEFING_TEXT);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (wordIntervalFallback) clearInterval(wordIntervalFallback);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const stopBriefing = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current && isPlaying) {
      window.speechSynthesis.cancel();
      // Restart with new volume
      setTimeout(() => startBriefing(), 100);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl overflow-hidden">
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              BRIEFING VOCAL
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            {!isPlaying ? (
              <Button
                onClick={startBriefing}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Écouter
              </Button>
            ) : (
              <Button
                onClick={stopBriefing}
                size="sm"
                variant="destructive"
              >
                Arrêter
              </Button>
            )}
          </div>
        </div>

        {/* Text Display - FBI Style */}
        <div className="relative min-h-[200px] bg-black/40 rounded-lg p-4 border border-primary/30">
          <div className="absolute top-2 left-2 text-xs text-primary/60 font-mono">
            [TRANSMISSION EN COURS]
          </div>
          <div className="mt-6 text-white/90 font-mono text-sm sm:text-base leading-relaxed">
            {displayedText}
            {isPlaying && (
              <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
            )}
          </div>
          {!displayedText && !isPlaying && (
            <div className="flex items-center justify-center h-full text-white/40 text-sm">
              Cliquez sur "Écouter" pour commencer le briefing...
            </div>
          )}
        </div>

        {/* Waveform Animation */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-1 mt-4">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full"
                style={{
                  height: '4px',
                  animation: `wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
      `}</style>
    </Card>
  );
}

