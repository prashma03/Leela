export const gentleSpeechRate = 0.8;
export const gentleSpeechPitch = 0.92;
export const mantraSpeechRate = 0.66;

const preferredVoiceWords = [
  "samantha",
  "serena",
  "aria",
  "jenny",
  "zira",
  "susan",
  "female",
  "google uk english",
  "google us english",
  "english india",
  "en-in",
];

export function softenSpeechText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s+/g, "$1  ")
    .replace(/:\s+/g, ".  ")
    .replace(/;\s+/g, ".  ")
    .trim();
}

export function chooseGentleVoice(voices: readonly SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith("en"));
  return preferredVoiceWords
    .map(word => englishVoices.find(voice => `${voice.name} ${voice.lang}`.toLowerCase().includes(word)))
    .find(Boolean) ?? englishVoices[0] ?? voices[0];
}

export function createGentleUtterance(text: string, options: { lang?: string; rate?: number; pitch?: number } = {}) {
  const utterance = new SpeechSynthesisUtterance(softenSpeechText(text));
  utterance.lang = options.lang ?? "en";
  utterance.rate = options.rate ?? gentleSpeechRate;
  utterance.pitch = options.pitch ?? gentleSpeechPitch;
  const voice = chooseGentleVoice(window.speechSynthesis.getVoices());
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  return utterance;
}
