// ========================================
// PawDex Database
// script.js
// ========================================

// ---------------------------
// Companion Gallery
// ---------------------------

const galleryImages = [
  "images/aspen-1.jpg",
  "images/aspen-2.jpg",
  "images/aspen-3.jpg",
  "images/aspen-4.jpg",
  "images/aspen-5.jpg"
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

function speakEntry() {

  const text =
    "Connecting to the PawDex Database. Database online. Searching entries. Entry located. PawDex number zero zero zero zero zero one. Companion Aspen. Companion type canine guardian. Entry verified.";

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.82;
  speech.pitch = 0.72;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);

}

function speakAspenEntry() {

  const text =
    "Connecting to the PawDex Database. Database online. Searching entries. Entry located. PawDex number zero zero zero zero zero one. Aspen. Companion type canine guardian. Signature move. Zoomies. Natural trait. Squirrel Lock On. Entry verified.";

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = 0.82;
  speech.pitch = 0.72;
  speech.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);

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