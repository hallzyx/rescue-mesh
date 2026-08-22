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
    callbacks.onError("El navegador no soporta dictado local (Web Speech API).");
    return () => {};
  }

  const recognition = new Ctor();
  recognition.lang = "es-PE";
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
    callbacks.onError("No se pudo capturar audio. Verifica permisos del micrófono.");
  };

  recognition.start();
  return () => recognition.stop();
}
