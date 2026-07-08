function speakEntry() {
  const text =
    "PawDex Entry zero zero zero one. Aspen. Companion type canine guardian. Known for loyal behavior, squirrel lock on, and powerful zoomies.";

  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.85;
  voice.pitch = 0.8;
  voice.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
}
