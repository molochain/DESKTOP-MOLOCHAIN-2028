import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCharacter } from '@/context/CharacterContext';
import AnimatedCharacter from './AnimatedCharacter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CharacterEmotion } from './AnimatedCharacter';

// Define character type
export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  role: string;
  imageUrl?: string;
  defaultEmotion?: CharacterEmotion;
}

// Mock data for characters (will be fetched from API later)
const mockCharacters: Character[] = [
  {
    id: 'assistant',
    name: 'Rayanava Assistant',
    description: 'The default helpful assistant character.',
    personality: 'Friendly, helpful, and informative',
    role: 'General Assistant',
    defaultEmotion: 'neutral'
  },
  {
    id: 'adviser',
    name: 'Business Adviser',
    description: 'Specializes in business strategy and planning.',
    personality: 'Professional, insightful, and analytical',
    role: 'Business Strategy',
    defaultEmotion: 'thinking'
  },
  {
    id: 'creative',
    name: 'Creative Writer',
    description: 'Helps with creative writing and content generation.',
    personality: 'Imaginative, expressive, and enthusiastic',
    role: 'Creative Content',
    defaultEmotion: 'excited'
  },
  {
    id: 'analyzer',
    name: 'Document Analyzer',
    description: 'Specializes in analyzing and summarizing documents.',
    personality: 'Precise, thorough, and methodical',
    role: 'Document Analysis',
    defaultEmotion: 'thinking'
  }
];

interface CharacterSelectionProps {
  onSelectCharacter?: (character: Character) => void;
  className?: string;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  onSelectCharacter,
  className = ''
}) => {
  const { selectedCharacterId, setSelectedCharacterId, setEmotion } = useCharacter();
  
  // Fetch characters from API (will use real API later)
  const { data: characters = mockCharacters, isLoading } = useQuery({
    queryKey: ['/api/assistant-characters'],
    queryFn: async () => {
      // In the future, fetch from API
      return mockCharacters;
    },
    enabled: true,
  });
  
  // Handle character selection
  const handleSelect = (character: Character) => {
    setSelectedCharacterId(character.id);
    if (character.defaultEmotion) {
      setEmotion(character.defaultEmotion);
    }
    if (onSelectCharacter) {
      onSelectCharacter(character);
    }
  };
  
  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-medium mb-4">Select Assistant Character</h3>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-1 gap-4">
            {characters.map((character) => (
              <Card 
                key={character.id} 
                className={`cursor-pointer transition-all ${
                  selectedCharacterId === character.id 
                    ? 'ring-2 ring-primary' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => handleSelect(character)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {character.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4 pb-2">
                  <AnimatedCharacter 
                    emotion={character.defaultEmotion || 'neutral'} 
                    characterId={character.id}
                    size="md" 
                  />
                  <div className="flex-1">
                    <p className="text-sm">{character.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Role: {character.role}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant={selectedCharacterId === character.id ? "default" : "ghost"} 
                    size="sm"
                    className="w-full"
                  >
                    {selectedCharacterId === character.id ? "Selected" : "Select"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default CharacterSelection;