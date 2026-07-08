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

  if (!mainImage || !counter) return;

  mainImage.src = galleryImages[currentImageIndex];
  counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;

  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle("active-thumb", index === currentImageIndex);
  });
}

function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  updateGallery();
}

function previousImage() {
  currentImageIndex =
    (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  updateGallery();
}

function setImage(index) {
  currentImageIndex = index;
  updateGallery();
}

function speakEntry() {
  const text =
    "Connecting to the PawDex Database. Database online. Searching entries. Entry located. PawDex number zero zero zero zero zero one. Companion Aspen. Companion type canine guardian. Entry status verified.";

  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.82;
  voice.pitch = 0.72;
  voice.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
}

function speakAspenEntry() {
  const text =
    "Connecting to the PawDex Database. Entry located. PawDex number zero zero zero zero zero one. Aspen. Companion type canine guardian. Natural trait, squirrel lock on. Signature move, zoomies. Status, verified.";

  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.82;
  voice.pitch = 0.72;
  voice.volume = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(voice);
}

document.addEventListener("DOMContentLoaded", updateGallery);