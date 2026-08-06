// ========================================
// PawDex Interactive Pitch
// Show MVP
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  const pitch = document.getElementById("pawdexPitch");
  const slides = Array.from(document.querySelectorAll(".pitch-slide"));

  if (!pitch || slides.length === 0) return;

  const previousButton = document.getElementById("pitchPreviousButton");
  const nextButton = document.getElementById("pitchNextButton");
  const skipButton = document.getElementById("pitchSkipButton");
  const progressBar = document.getElementById("pitchProgressBar");
  const slideCount = document.getElementById("pitchSlideCount");
  const nextTriggers = document.querySelectorAll(".pitch-next-trigger");

  const signupSlide = document.getElementById("pitchSignupSlide");
  const successSlide = document.getElementById("pitchSuccessSlide");
  const form = document.getElementById("earlyAdopterForm");
  const formMessage = document.getElementById("pitchFormMessage");

  const exploreWebsiteButton = document.getElementById("exploreWebsiteButton");
  const restartPitchButton = document.getElementById("restartPitchButton");

  const restartWarning = document.getElementById("pitchRestartWarning");
  const restartCountdown = document.getElementById("pitchRestartCountdown");
  const cancelRestartButton = document.getElementById("cancelPitchRestart");

  const kioskMode =
    new URLSearchParams(window.location.search).get("mode") === "kiosk";

  let currentSlide = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  let inactivityTimer = null;
  let countdownTimer = null;
  let countdownValue = 10;

  function getSignupSlideIndex() {
    return slides.indexOf(signupSlide);
  }

  function getSuccessSlideIndex() {
    return slides.indexOf(successSlide);
  }

  function updateSlideClasses() {
    slides.forEach((slide, index) => {
      slide.classList.remove("active", "previous");

      if (index === currentSlide) {
        slide.classList.add("active");
      } else if (index < currentSlide) {
        slide.classList.add("previous");
      }

      slide.setAttribute(
        "aria-hidden",
        index === currentSlide ? "false" : "true"
      );
    });
  }

  function updateControls() {
    const displayNumber = currentSlide + 1;
    const totalSlides = slides.length;
    const progress = (displayNumber / totalSlides) * 100;

    if (slideCount) {
      slideCount.textContent = `${displayNumber} / ${totalSlides}`;
    }

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (previousButton) {
      previousButton.disabled = currentSlide === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentSlide === totalSlides - 1;
    }
  }

  function focusCurrentSlide() {
    const activeSlide = slides[currentSlide];
    if (!activeSlide) return;

    activeSlide.scrollTop = 0;
  }

  function showSlide(index) {
    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    currentSlide = safeIndex;

    updateSlideClasses();
    updateControls();
    focusCurrentSlide();
    resetInactivityTimer();
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      showSlide(currentSlide + 1);
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      showSlide(currentSlide - 1);
    }
  }

  function goToSignup() {
    const signupIndex = getSignupSlideIndex();

    if (signupIndex >= 0) {
      showSlide(signupIndex);
    }
  }

  function restartPitch() {
    clearInactivityTimers();

    if (form) {
      form.reset();

      const purchaseInterest = document.getElementById("purchaseInterest");
      if (purchaseInterest) {
        purchaseInterest.checked = true;
      }
    }

    if (formMessage) {
      formMessage.textContent = "";
    }

    if (restartWarning) {
      restartWarning.hidden = true;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    showSlide(0);
  }

  function exploreWebsite() {
    const fullWebsite = document.getElementById("fullWebsite");

    if (fullWebsite) {
      fullWebsite.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function handleTouchStart(event) {
    const touch = event.changedTouches[0];

    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];

    touchEndX = touch.screenX;
    touchEndY = touch.screenY;

    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = touchEndY - touchStartY;

    const isHorizontalSwipe =
      Math.abs(horizontalDistance) > 60 &&
      Math.abs(horizontalDistance) > Math.abs(verticalDistance);

    if (!isHorizontalSwipe) return;

    if (horizontalDistance < 0) {
      nextSlide();
    } else {
      previousSlide();
    }
  }

  function handleKeyboard(event) {
    const activeElement = document.activeElement;
    const isTyping =
      activeElement &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);

    if (isTyping) return;

    if (event.key === "ArrowRight") {
      nextSlide();
    }

    if (event.key === "ArrowLeft") {
      previousSlide();
    }
  }

  function clearInactivityTimers() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function hideRestartWarning() {
    if (restartWarning) {
      restartWarning.hidden = true;
    }

    countdownValue = 10;

    if (restartCountdown) {
      restartCountdown.textContent = countdownValue;
    }

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function beginRestartCountdown() {
    if (!kioskMode || !restartWarning || !restartCountdown) return;

    countdownValue = 10;
    restartCountdown.textContent = countdownValue;
    restartWarning.hidden = false;

    countdownTimer = setInterval(() => {
      countdownValue -= 1;
      restartCountdown.textContent = countdownValue;

      if (countdownValue <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        restartPitch();
      }
    }, 1000);
  }

  function resetInactivityTimer() {
    if (!kioskMode) return;

    clearInactivityTimers();
    hideRestartWarning();

    inactivityTimer = setTimeout(() => {
      beginRestartCountdown();
    }, 60000);
  }

  function recordActivity() {
    resetInactivityTimer();
  }

  async function submitEarlyAdopterForm(event) {
    event.preventDefault();

    if (!form || !formMessage) return;

    const submitButton = form.querySelector(".pitch-submit-button");
    const formData = new FormData(form);

    const payload = {
      ownerName: String(formData.get("ownerName") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
            phone: String(formData.get("phone") || "").trim(),
      companionName: String(formData.get("companionName") || "").trim(),
      companionType: String(formData.get("companionType") || "").trim(),
            preferredPawdexId: String(
        formData.get("preferredPawdexId") || ""
      ).trim(),
      purchaseInterest: formData.get("purchaseInterest") === "on",
      marketingConsent: formData.get("marketingConsent") === "on",
      eventSource: "pawdex-website"
    };

    if (
      !payload.ownerName ||
      !payload.email ||
      !payload.companionName ||
      !payload.companionType ||
      !payload.marketingConsent
    ) {
      formMessage.textContent = "Please complete all required fields.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving your early-adopter spot...";
    }

    formMessage.textContent = "Connecting to the PawDex database...";

    try {
      const response = await fetch("/api/early-adopter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Signup could not be completed.");
      }

      const successIndex = getSuccessSlideIndex();

      formMessage.textContent =
        "Success. Your early-adopter discount has been reserved.";

      if (successIndex >= 0) {
        setTimeout(() => {
          showSlide(successIndex);
        }, 450);
      }
    } catch (error) {
      console.error("PawDex early-adopter signup error:", error);

      formMessage.textContent =
                error.message || "We could not complete the signup. Please try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          "Join The PawDex Early-Adopter List";
      }
    }
  }

  if (previousButton) {
    previousButton.addEventListener("click", previousSlide);
  }

  if (nextButton) {
    nextButton.addEventListener("click", nextSlide);
  }

  if (skipButton) {
    skipButton.addEventListener("click", goToSignup);
  }

  nextTriggers.forEach((button) => {
    button.addEventListener("click", nextSlide);
  });

  if (exploreWebsiteButton) {
    exploreWebsiteButton.addEventListener("click", exploreWebsite);
  }

  if (restartPitchButton) {
    restartPitchButton.addEventListener("click", restartPitch);
  }

  if (cancelRestartButton) {
    cancelRestartButton.addEventListener("click", () => {
      hideRestartWarning();
      resetInactivityTimer();
    });
  }

  if (form) {
    form.addEventListener("submit", submitEarlyAdopterForm);
  }

  pitch.addEventListener("touchstart", handleTouchStart, {
    passive: true
  });

  pitch.addEventListener("touchend", handleTouchEnd, {
    passive: true
  });

  document.addEventListener("keydown", handleKeyboard);

  [
    "pointerdown",
    "pointermove",
    "touchstart",
    "keydown",
    "scroll"
  ].forEach((eventName) => {
    document.addEventListener(eventName, recordActivity, {
      passive: true
    });
  });

  if (kioskMode) {
    document.body.classList.add("pawdex-kiosk-mode");
  }

  showSlide(0);
});