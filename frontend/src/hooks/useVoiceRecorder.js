/**
 * useVoiceRecorder Hook
 * Hybrid approach: MediaRecorder + Web Speech API with smart restart
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const isActiveRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const restartTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      console.log('🎤 Voice Recorder Ready');

      const recognition = new SpeechRecognition();

      // Optimized settings for speed and accuracy
      recognition.continuous = false; // Changed to false for manual restart control
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        // Recording started
      };

      recognition.onresult = (event) => {
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalTranscriptRef.current += text + ' ';
          } else {
            interim += text;
          }
        }

        // Update UI immediately
        const fullText = finalTranscriptRef.current + interim;
        setTranscript(fullText.trim());

        // Reset silence timeout on speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          // Silence detected
        }, 2000);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
          // No speech detected
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone permission denied');
          isActiveRef.current = false;
          setIsRecording(false);
          return;
        }

        if (event.error === 'network') {
          setError('Network error');
          isActiveRef.current = false;
          setIsRecording(false);
          return;
        }
      };

      recognition.onend = () => {
        // Auto-restart if still active
        if (isActiveRef.current) {
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }

          // Immediate restart with minimal delay
          restartTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                if (!err.message?.includes('already started')) {
                  console.error('❌ Restart failed:', err);
                }
              }
            }
          }, 50); // Minimal delay for smooth restart
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      console.error('❌ Not supported');
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          isActiveRef.current = false;
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }

    if (isRecording) {
      return;
    }

    setError(null);
    setTranscript('');
    finalTranscriptRef.current = '';
    isActiveRef.current = true;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      if (err.message?.includes('already started')) {
        setIsRecording(true);
      } else {
        setError('Failed to start');
        isActiveRef.current = false;
      }
    }
  }, [isSupported, isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }

    isActiveRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('❌ Stop failed:', err);
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript
  };
}
