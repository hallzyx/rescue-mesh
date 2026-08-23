"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSpeechRecognitionSupported, startDictation } from "@/lib/speech";

function subscribe() {
  return () => {};
}

export function AudioDictation({
  onTranscript,
}: {
  onTranscript: (text: string, append: boolean) => void;
}) {
  const supported = useSyncExternalStore(subscribe, isSpeechRecognitionSupported, () => false);
  const [listening, setListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current?.();
    };
  }, []);

  if (!supported) {
    return (
      <p className="text-xs text-slate-500">
        Voice dictation is not available in this browser. Use free text.
      </p>
    );
  }

  function toggle() {
    if (listening) {
      stopRef.current?.();
      stopRef.current = null;
      setListening(false);
      return;
    }

    setListening(true);
    stopRef.current = startDictation({
      onFinal: (text) => {
        onTranscript(text, true);
      },
      onError: () => {
        setListening(false);
        stopRef.current = null;
      },
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={listening ? "border-red-500 text-red-300" : "border-slate-700 text-slate-300"}
      onClick={toggle}
    >
      {listening ? <MicOff data-icon="inline-start" /> : <Mic data-icon="inline-start" />}
      {listening ? "Stop dictation" : "Dictate report (local)"}
    </Button>
  );
}
