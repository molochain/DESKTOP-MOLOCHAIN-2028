import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define emotion types
export type CharacterEmotion = 
  | 'neutral' 
  | 'happy' 
  | 'excited'
  | 'thinking'
  | 'confused'
  | 'sad'
  | 'surprised';

// Define props for the component
interface AnimatedCharacterProps {
  emotion?: CharacterEmotion;
  speaking?: boolean;
  characterId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// SVG content for different emotions
const emotionSvgs: Record<CharacterEmotion, React.ReactNode> = {
  neutral: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M40 65 H60" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  happy: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M35 65 Q50 75 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  excited: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="38" r="5" fill="#333" />
      <circle cx="65" cy="38" r="5" fill="#333" />
      <path d="M35 65 Q50 80 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <path d="M25 30 L35 27" stroke="#333" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 30 L65 27" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  thinking: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M40 70 Q45 65 55 70" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="75" cy="40" rx="10" ry="8" fill="#E6E6E6" stroke="#333" strokeWidth="1" />
      <ellipse cx="85" cy="30" rx="8" ry="6" fill="#E6E6E6" stroke="#333" strokeWidth="1" />
    </svg>
  ),
  confused: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M40 65 Q45 60 60 65" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 30 L80 25" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  sad: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="40" r="5" fill="#333" />
      <circle cx="65" cy="40" r="5" fill="#333" />
      <path d="M35 70 Q50 60 65 70" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  surprised: (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#FFD6A5" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="35" r="6" fill="#333" />
      <circle cx="65" cy="35" r="6" fill="#333" />
      <circle cx="50" cy="70" r="10" fill="none" stroke="#333" strokeWidth="3" />
    </svg>
  )
};

// Define animations for speaking state
const speakingAnimation = {
  scale: [1, 1.05, 1],
  transition: { 
    repeat: Infinity,
    duration: 1.5
  }
};

// Define animations for emotion changes
const emotionTransition = {
  type: "spring",
  stiffness: 300,
  damping: 20
};

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  emotion = 'neutral',
  speaking = false,
  characterId = 'default',
  className = '',
  size = 'md'
}) => {
  // Local state to track current emotion for animations
  const [currentEmotion, setCurrentEmotion] = useState<CharacterEmotion>(emotion);

  // Update current emotion when prop changes
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEmotion}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: speaking ? [1, 1.05, 1] : 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={emotionTransition}
          className="w-full h-full"
          {...(speaking && { animate: speakingAnimation })}
        >
          {emotionSvgs[currentEmotion]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Export a component that demonstrates all emotions
export const EmotionShowcase: React.FC = () => {
  const emotions: CharacterEmotion[] = [
    'neutral', 'happy', 'excited', 'thinking', 
    'confused', 'sad', 'surprised'
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {emotions.map(emotion => (
        <div key={emotion} className="flex flex-col items-center">
          <AnimatedCharacter emotion={emotion} size="md" />
          <span className="mt-2 text-sm font-medium">{emotion}</span>
        </div>
      ))}
    </div>
  );
};

export default AnimatedCharacter;