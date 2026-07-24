// ========================================
// PawDex Database
// script.js
// Version 0.5.2
// ========================================

// ---------------------------
// Companion Gallery
// ---------------------------

const galleryImages = [
  "images/aspen-1.jpeg",
  "images/aspen-2.jpeg",
  "images/aspen-3.jpeg",
  "images/aspen-4.jpeg"
];

let currentImageIndex = 0;

function updateGallery() {
  const mainImage = document.getElementById("mainCompanionImage");
  const counter = document.getElementById("galleryCounter");
  const thumbnails = document.querySelectorAll(".gallery-thumbnails img");

  if (!mainImage) return;

  mainImage.src = galleryImages[currentImageIndex];

  if (counter) {
    counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
  }

  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active-thumb", index === currentImageIndex);
  });
}

function nextImage() {
  currentImageIndex++;

  if (currentImageIndex >= galleryImages.length) {
    currentImageIndex = 0;
  }

  updateGallery();
}

function previousImage() {
  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = galleryImages.length - 1;
  }

  updateGallery();
}

function setImage(index) {
  currentImageIndex = index;
  updateGallery();
}

// ---------------------------
// Database Voice
// ---------------------------

function speakText(lines) {
  const text = lines.join(". ");

  let speechStarted = false;

  const playSpeech = () => {
    if (speechStarted) return;
    speechStarted = true;

    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          voice.lang === "en-US" &&
          /robot|computer|david|male/i.test(voice.name)
      ) ||
      voices.find((voice) => voice.lang === "en-US") ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0];

    if (preferredVoice) {
      speech.voice = preferredVoice;
    }

    // PawDex voice settings
    speech.rate = 0.98;
    speech.pitch = 0.9;
    speech.volume = 1;

    window.speechSynthesis.cancel();

    setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(speech);
    }, 400);
  };

  const voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    playSpeech();
  } else {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      playSpeech,
      { once: true }
    );

    setTimeout(playSpeech, 1500);
  }
}


// ------------------------------
// Aspen PawDex Entry
// ------------------------------

function speakEntry() {
  speakText([
    "PawDex Database online",
    "Scanning companion record",
    "Companion identified",
    "PawDex I.D. One",
    "Aspen",
    "Canine",
    "Pit Bull and Shepherd mix",
    "Friendly, loyal, and energetic",
    "Primary strength. Devoted companion",
    "Primary weakness. Reactive toward unfamiliar animals",
    "Complete profile displayed"
  ]);
}
// ---------------------------
// Future Database Loader
// ---------------------------

function databaseBoot() {
  console.log("Connecting to PawDex Database...");
  console.log("Database Online");
  console.log("Searching Entries...");
  console.log("Entry Located");
}

// ---------------------------
// Initialize
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
  updateGallery();
  databaseBoot();
});
