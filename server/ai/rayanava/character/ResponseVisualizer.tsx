import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '@/context/CharacterContext';
import AnimatedCharacter from './AnimatedCharacter';

interface ResponseVisualizerProps {
  text: string;
  response?: string;
  className?: string;
  autoAnimate?: boolean;
  typingSpeed?: number;
  onComplete?: () => void;
}

// Map certain phrases to emotions
const emotionPhrases = [
  { regex: /happy|glad|excited|wonderful|great/i, emotion: 'happy' },
  { regex: /wow|amazing|incredible|awesome/i, emotion: 'excited' },
  { regex: /hmm|thinking|let me think|consider|analyzing/i, emotion: 'thinking' },
  { regex: /not sure|confused|unclear|difficult to say/i, emotion: 'confused' },
  { regex: /sorry|sad|unfortunate|regret/i, emotion: 'sad' },
  { regex: /surprised|unexpected|shock|oh!/i, emotion: 'surprised' }
];

export const ResponseVisualizer: React.FC<ResponseVisualizerProps> = ({
  text = '',
  response = '',
  className = '',
  autoAnimate = true,
  typingSpeed = 30, // milliseconds per character
  onComplete
}) => {
  const { emotion, setEmotion, isSpeaking, setIsSpeaking } = useCharacter();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Detect emotion based on text content
  const detectEmotion = (text: string) => {
    for (const { regex, emotion } of emotionPhrases) {
      if (regex.test(text)) {
        return emotion as any;
      }
    }
    return 'neutral';
  };
  
  // Start typing animation
  useEffect(() => {
    if (!response) return;
    
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
    setIsSpeaking(true);
    
    if (autoAnimate) {
      const detectedEmotion = detectEmotion(response);
      setEmotion(detectedEmotion);
    }
  }, [response, autoAnimate, setEmotion, setIsSpeaking]);
  
  // Typing effect
  useEffect(() => {
    if (!isTyping || !response) return;
    
    if (currentIndex < response.length) {
      timerRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + response[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Periodically update emotion while typing for longer responses
        if (autoAnimate && currentIndex % 30 === 0 && currentIndex > 0) {
          const segment = response.substring(
            Math.max(0, currentIndex - 30), 
            currentIndex
          );
          const segmentEmotion = detectEmotion(segment);
          setEmotion(segmentEmotion);
        }
      }, typingSpeed);
    } else {
      setIsTyping(false);
      setIsSpeaking(false);
      if (onComplete) onComplete();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTyping, currentIndex, response, typingSpeed, autoAnimate, setEmotion, setIsSpeaking, onComplete]);
  
  // Skip animation when clicked
  const skipAnimation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText(response);
    setCurrentIndex(response.length);
    setIsTyping(false);
    setIsSpeaking(false);
    if (onComplete) onComplete();
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <AnimatedCharacter 
        emotion={emotion} 
        speaking={isSpeaking}
        size="lg"
        className="mb-4" 
      />
      
      <div 
        className="relative p-4 rounded-lg bg-background border shadow-sm w-full max-w-2xl"
        onClick={isTyping ? skipAnimation : undefined}
      >
        {text && (
          <div className="text-sm text-muted-foreground mb-2">
            {text}
          </div>
        )}
        
        <div className="prose">
          {displayedText}
          {isTyping && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ▋
            </motion.span>
          )}
        </div>
        
        {isTyping && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            Click to skip
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseVisualizer;