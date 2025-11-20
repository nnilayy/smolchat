"use client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Microphone } from "@phosphor-icons/react";
import { Tooltip } from "@/components/ui/tooltip";
import { AudioWaveSpinner } from "@/components/ui/audio-wave";
import { StopIcon } from "hugeicons-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useEffect } from "react";

export const useRecordVoice = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const { toast } = useToast();

  const startVoiceRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Browser not supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
      });
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopRecording = () => {
    SpeechRecognition.stopListening();
  };

  const renderRecordingControls = () => {
    if (listening) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            rounded={"full"}
            onClick={() => {
              stopRecording();
            }}
          >
            <StopIcon
              size={18}
              variant="solid"
              strokeWidth="2"
              className="text-red-300"
            />{" "}
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button size="iconSm" variant="ghost" onClick={startVoiceRecording}>
          <Microphone size={18} weight="bold" />
        </Button>
      </Tooltip>
    );
  };

  return {
    recording: listening,
    startRecording: startVoiceRecording,
    stopRecording,
    text: transcript,
    transcribing: false,
    renderRecordingControls,
    startVoiceRecording,
  };
};
