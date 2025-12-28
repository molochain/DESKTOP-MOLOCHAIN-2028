import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CharacterEmotion = 
  | 'neutral' 
  | 'happy' 
  | 'excited'
  | 'thinking'
  | 'confused'
  | 'sad'
  | 'surprised'
  | 'helpful'
  | 'analytical'
  | 'creative';

interface AnimatedCharacterProps {
  emotion?: CharacterEmotion;
  speaking?: boolean;
  characterId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const emotionColors = {
  neutral: '#FFD6A5',
  happy: '#FFE5B4',
  excited: '#FFCC99',
  thinking: '#FFDAB9',
  confused: '#FFD4AA',
  sad: '#F5DEB3',
  surprised: '#FFE4B5',
  helpful: '#FFE5CC',
  analytical: '#E6E6FA',
  creative: '#FFB6C1'
};

const sizeMap = {
  sm: 100,
  md: 150,
  lg: 200
};

export function AnimatedCharacter({
  emotion = 'neutral',
  speaking = false,
  className = '',
  size = 'md'
}: AnimatedCharacterProps) {
  const [currentEmotion, setCurrentEmotion] = useState<CharacterEmotion>(emotion);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (emotion !== currentEmotion) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentEmotion(emotion);
        setIsAnimating(false);
      }, 300);
    }
  }, [emotion, currentEmotion]);

  const svgSize = sizeMap[size];
  const faceColor = emotionColors[currentEmotion];

  const renderFace = () => {
    switch (currentEmotion) {
      case 'happy':
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333" />
            <circle cx="65" cy="40" r="5" fill="#333" />
            <path d="M35 65 Q50 75 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        );
      case 'excited':
        return (
          <>
            <circle cx="35" cy="38" r="6" fill="#333" />
            <circle cx="65" cy="38" r="6" fill="#333" />
            <path d="M35 65 Q50 80 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M25 30 L35 27" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            <path d="M75 30 L65 27" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case 'thinking':
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333" />
            <circle cx="65" cy="40" r="5" fill="#333" />
            <path d="M40 70 Q45 65 55 70" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="75" cy="25" r="3" fill="#666" opacity="0.6" />
            <circle cx="80" cy="20" r="2" fill="#666" opacity="0.4" />
            <circle cx="82" cy="15" r="1" fill="#666" opacity="0.2" />
          </>
        );
      case 'confused':
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333" />
            <circle cx="65" cy="40" r="5" fill="#333" />
            <path d="M40 65 Q45 60 60 65" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <text x="72" y="30" fontSize="20" fill="#333">?</text>
          </>
        );
      case 'sad':
        return (
          <>
            <circle cx="35" cy="42" r="5" fill="#333" />
            <circle cx="65" cy="42" r="5" fill="#333" />
            <path d="M35 70 Q50 60 65 70" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="30" cy="55" r="2" fill="#87CEEB" opacity="0.7" />
          </>
        );
      case 'surprised':
        return (
          <>
            <circle cx="35" cy="35" r="7" fill="#333" />
            <circle cx="65" cy="35" r="7" fill="#333" />
            <ellipse cx="50" cy="70" rx="12" ry="15" fill="none" stroke="#333" strokeWidth="3" />
          </>
        );
      case 'helpful':
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333" />
            <circle cx="65" cy="40" r="5" fill="#333" />
            <path d="M35 65 Q50 72 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M50 10 L50 25" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
            <path d="M45 15 L55 15" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          </>
        );
      case 'analytical':
        return (
          <>
            <rect x="30" y="35" width="15" height="10" rx="2" fill="none" stroke="#333" strokeWidth="2" />
            <rect x="55" y="35" width="15" height="10" rx="2" fill="none" stroke="#333" strokeWidth="2" />
            <path d="M45 40 L55 40" stroke="#333" strokeWidth="2" />
            <path d="M40 65 L60 65" stroke="#333" strokeWidth="3" strokeLinecap="round" />
            <circle cx="35" cy="40" r="3" fill="#333" />
            <circle cx="65" cy="40" r="3" fill="#333" />
          </>
        );
      case 'creative':
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333">
              <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="65" cy="40" r="5" fill="#333">
              <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite" />
            </circle>
            <path d="M35 65 Q50 75 65 65" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M20 20 L25 25 M25 20 L20 25" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" />
            <path d="M75 20 L80 25 M80 20 L75 25" stroke="#FF69B4" strokeWidth="2" strokeLinecap="round" />
            <circle cx="30" cy="15" r="2" fill="#FFD700" />
            <circle cx="70" cy="15" r="2" fill="#FFD700" />
          </>
        );
      default: // neutral
        return (
          <>
            <circle cx="35" cy="40" r="5" fill="#333" />
            <circle cx="65" cy="40" r="5" fill="#333" />
            <path d="M40 65 L60 65" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`inline-block ${className}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: speaking ? [1, 1.05, 1] : 1, 
          opacity: 1 
        }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          scale: speaking ? {
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut"
          } : {
            type: "spring",
            stiffness: 300,
            damping: 20
          },
          opacity: { duration: 0.3 }
        }}
      >
        <svg 
          width={svgSize} 
          height={svgSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill={faceColor}
            stroke="#333"
            strokeWidth="2"
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
          {renderFace()}
          
          {/* Speaking indicator */}
          {speaking && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <circle cx="50" cy="85" r="3" fill="#333" opacity="0.5" />
              <circle cx="40" cy="88" r="2" fill="#333" opacity="0.3" />
              <circle cx="60" cy="88" r="2" fill="#333" opacity="0.3" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}