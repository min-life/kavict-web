interface KavictSpeechRecognitionResultEvent {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
}

interface KavictSpeechRecognitionErrorEvent {
  error: string;
}

interface KavictSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: KavictSpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: KavictSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface KavictSpeechRecognitionConstructor {
  new (): KavictSpeechRecognition;
}

interface KavictYouTubePlayer {
  getCurrentTime(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
}

interface KavictYouTubeNamespace {
  Player: new (
    elementId: string,
    options: { events: { onReady: () => void } },
  ) => KavictYouTubePlayer;
}

interface Window {
  SpeechRecognition?: KavictSpeechRecognitionConstructor;
  webkitSpeechRecognition?: KavictSpeechRecognitionConstructor;
  YT?: KavictYouTubeNamespace;
  onYouTubeIframeAPIReady?: () => void;
}
