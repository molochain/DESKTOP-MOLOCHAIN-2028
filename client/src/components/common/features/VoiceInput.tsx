import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Loader2, SmartphoneIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import AudioRecorder from 'audio-recorder-polyfill';

// Polyfill for iOS
if (typeof window !== 'undefined') {
  window.MediaRecorder = AudioRecorder;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language: string;
}

// Map of i18n language codes to Web Speech API language codes
const speechApiLanguages: Record<string, string> = {
  'en': 'en-US',
  'es': 'es-ES',
  'fa': 'fa-IR',
  'tr': 'tr-TR',
  'ar': 'ar-SA',
  'zh': 'zh-CN',
  'ru': 'ru-RU'
};

// Map of language codes to their full names for better UI display
const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fa': 'Persian',
  'tr': 'Turkish',
  'ar': 'Arabic',
  'zh': 'Chinese',
  'ru': 'Russian'
};

// Detect iOS device
const isIOS = typeof navigator !== 'undefined' && 
  /iPad|iPhone|iPod/.test(navigator.userAgent) && 
  !(window as any).MSStream;

export function VoiceInput({ onTranscript, language }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const startNativeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.addEventListener('dataavailable', (event) => {
        audioChunks.push(event.data);
      });

      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks);
        // Here you would typically send this blob to your server
        // for processing with a speech-to-text service
        toast({
          title: t('voice.recordingComplete'),
          description: t('voice.processingAudio'),
        });

        // For now, we'll just show a message
        // In a real implementation, you'd send this to your server
        // and use a service like Google Cloud Speech-to-Text
        setIsRecording(false);
      });

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        description: t('voice.recording'),
      });
    } catch (error) {
      // Recording error - handled by UI state
      toast({
        title: t('voice.microphoneError'),
        description: t('voice.enableMicrophone'),
        variant: "destructive"
      });
    }
  };

  const stopNativeRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
    }
    setIsRecording(false);
  };

  const startListening = async () => {
    if (isIOS) {
      await startNativeRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true,
        language: speechApiLanguages[language] || 'en-US'
      });
    } catch (error) {
      // Microphone permission error - handled by UI state
      toast({
        title: t('voice.microphoneError'),
        description: t('voice.enableMicrophone'),
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (isIOS) {
      stopNativeRecording();
      return;
    }

    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  if (!browserSupportsSpeechRecognition && !isIOS) {
    return (
      <Alert>
        <AlertDescription>
          {t('voice.browserNotSupported')}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isMicrophoneAvailable && !isIOS) {
    return (
      <Alert>
        <AlertDescription>
          {t('voice.microphoneNotAvailable')}
        </AlertDescription>
      </Alert>
    );
  }

  const isActive = isIOS ? isRecording : listening;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={isActive ? "destructive" : "default"}
          size="icon"
          onClick={isActive ? stopListening : startListening}
          className="relative"
        >
          {isActive ? (
            <>
              <MicOff className="h-4 w-4" />
              <span className="absolute -top-1 -right-1">
                <Loader2 className="h-3 w-3 animate-spin" />
              </span>
            </>
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {languageNames[language] || language} {isActive && '(Recording...)'}
        </span>
        {isIOS && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <SmartphoneIcon className="h-4 w-4" />
            {t('voice.iosMode')}
          </span>
        )}
      </div>

      {transcript && !isIOS && (
        <Alert>
          <AlertDescription className="text-sm">
            {transcript}
          </AlertDescription>
        </Alert>
      )}

      {isIOS && isRecording && (
        <Alert>
          <AlertDescription className="text-sm animate-pulse">
            {t('voice.recordingInProgress')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}