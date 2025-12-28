import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInterfaceProps {
  onTranscript?: (text: string) => void;
  onCommand?: (command: string) => void;
  autoListen?: boolean;
  language?: string;
}

export function VoiceInterface({
  onTranscript,
  onCommand,
  autoListen = false,
  language = 'en-US'
}: VoiceInterfaceProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onstart = () => {
        if (import.meta.env.DEV) {
          console.log('Voice recognition started');
        }
        setIsListening(true);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          processCommand(finalTranscript);
          if (onTranscript) onTranscript(finalTranscript);
        }
        
        setInterimTranscript(interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        if (import.meta.env.DEV) {
          console.error('Speech recognition error:', event.error);
        }
        if (event.error === 'no-speech') {
          toast({
            title: "No speech detected",
            description: "Please try speaking again",
            variant: "default"
          });
        } else {
          toast({
            title: "Voice recognition error",
            description: event.error,
            variant: "destructive"
          });
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (import.meta.env.DEV) {
          console.log('Voice recognition ended');
        }
        setIsListening(false);
      };
      
      if (autoListen) {
        startListening();
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn('Speech recognition not supported');
      }
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, autoListen]);

  // Process voice commands
  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Command patterns
    const commands = {
      'hello rayanava': 'greet',
      'hey rayanava': 'greet',
      'help': 'help',
      'show dashboard': 'dashboard',
      'show analytics': 'analytics',
      'open settings': 'settings',
      'what can you do': 'capabilities',
      'stop listening': 'stop',
      'clear': 'clear',
      'analyze': 'analyze',
      'optimize': 'optimize',
      'generate report': 'report',
      'check status': 'status'
    };
    
    for (const [pattern, command] of Object.entries(commands)) {
      if (lowerText.includes(pattern)) {
        if (import.meta.env.DEV) {
          console.log(`Command detected: ${command}`);
        }
        if (onCommand) onCommand(command);
        
        // Execute built-in commands
        switch (command) {
          case 'stop':
            stopListening();
            break;
          case 'clear':
            setTranscript('');
            setInterimTranscript('');
            break;
          case 'greet':
            speak("Hello! I'm Rayanava, your AI assistant. How can I help you today?");
            break;
          case 'help':
            speak("I can help you with analytics, automation, logistics optimization, and much more. Just ask me anything!");
            break;
          case 'capabilities':
            speak("I can analyze data, optimize routes, automate workflows, generate reports, and provide intelligent insights for your business operations.");
            break;
        }
        break;
      }
    }
  };

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setTranscript('');
        setInterimTranscript('');
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to start recognition:', error);
        }
        toast({
          title: "Failed to start listening",
          description: "Please check microphone permissions",
          variant: "destructive"
        });
      }
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Text-to-speech
  const speak = useCallback((text: string, rate: number = 1.0, pitch: number = 1.0) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Select a voice (prefer female voice for Rayanava)
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        if (import.meta.env.DEV) {
          console.error('Speech synthesis error:', event);
        }
        setIsSpeaking(false);
      };
      
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  }, [language]);

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            className="relative"
            data-testid="button-voice-toggle"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-2" />
                Stop Listening
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-2" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button
            size="lg"
            variant={isSpeaking ? "secondary" : "outline"}
            onClick={isSpeaking ? stopSpeaking : () => speak(transcript || "No text to speak")}
            disabled={!transcript && !isSpeaking}
            data-testid="button-voice-speak"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-5 w-5 mr-2" />
                Stop Speaking
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5 mr-2" />
                Speak Text
              </>
            )}
          </Button>
        </div>

        {/* Visualizer */}
        <div className="relative min-h-[100px] bg-muted/20 rounded-lg p-4">
          <AnimatePresence>
            {isListening && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      animate={{
                        height: [20, 40, 20],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Transcript Display */}
          <div className="relative z-10">
            {(transcript || interimTranscript) && (
              <div className="space-y-2">
                {transcript && (
                  <p className="text-sm" data-testid="text-transcript">
                    <span className="font-semibold">Transcript:</span> {transcript}
                  </p>
                )}
                {interimTranscript && (
                  <p className="text-sm text-muted-foreground italic">
                    {interimTranscript}
                  </p>
                )}
              </div>
            )}
            {!transcript && !interimTranscript && !isListening && (
              <p className="text-sm text-muted-foreground text-center">
                Click "Start Listening" to begin voice input
              </p>
            )}
            {isListening && !transcript && !interimTranscript && (
              <p className="text-sm text-muted-foreground text-center">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Listening... Say something!
              </p>
            )}
          </div>
        </div>

        {/* Voice Commands Guide */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold">Voice Commands:</p>
          <p>• "Hello Rayanava" - Greet the assistant</p>
          <p>• "Help" - Get assistance</p>
          <p>• "Show dashboard/analytics" - Navigate</p>
          <p>• "What can you do?" - Learn capabilities</p>
          <p>• "Stop listening" - Stop voice input</p>
        </div>
      </CardContent>
    </Card>
  );
}