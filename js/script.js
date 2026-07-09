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

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.78;
  speech.pitch = 0.72;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

function speakEntry() {
  speakText([
    "Connecting to the PawDex Database",
    "Database online",
    "Searching entries",
    "Entry located",
    "Entry verified",
    "Reading companion entry",
    "Name: Aspen",
    "PawDex I.D.: One",
    "Species: Canine",
    "Companion Type: Guardian",
    "Breed: Pit Shepherd Mix",
    "Temperament: Friendly. Easily excited. Protective",
    "Signature Moves: Zoomies. Squirrel Lock-On",
    "Entry Status: Registered",
    "End of entry"
  ]);
}

function speakAspenEntry() {
  speakText([
    "Connecting to the PawDex Database",
    "Database online",
    "Searching entries",
    "Entry located",
    "Entry verified",
    "Reading companion entry",
    "Name: Aspen",
    "PawDex I.D.: One",
    "Species: Canine",
    "Companion Type: Canine Guardian",
    "Breed: Pit Shepherd Mix",
    "Temperament: Friendly. Easily excited. Scared easily",
    "Natural Trait: Squirrel Lock-On",
    "Signature Moves: Zoomies. Alert Scan. Dad Radar",
    "Owner Contact: Available",
    "Medical Notes: No emergency notes listed",
    "Entry Status: Registered",
    "End of entry"
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