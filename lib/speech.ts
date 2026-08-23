type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const scope = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export type DictationCallbacks = {
  onPartial?: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
};

export function startDictation(callbacks: DictationCallbacks): () => void {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    callbacks.onError("This browser does not support local dictation (Web Speech API).");
    return () => {};
  }

  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let finalText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0]?.transcript ?? "";
      if (event.results[i].isFinal) {
        finalText += chunk;
      } else {
        interim += chunk;
      }
    }

    if (interim && callbacks.onPartial) callbacks.onPartial(interim);
    if (finalText.trim()) callbacks.onFinal(finalText.trim());
  };

  recognition.onerror = () => {
    callbacks.onError("Could not capture audio. Check microphone permissions.");
  };

  recognition.start();
  return () => recognition.stop();
}
