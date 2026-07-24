(() => {
  const IDLE_TIME = 45_000;

  let idleTimer;

  function returnHome() {
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/index.html"
    ) {
      window.location.replace("/");
    }
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(returnHome, IDLE_TIME);
  }

  [
    "pointerdown",
    "touchstart",
    "wheel",
    "scroll",
    "keydown"
  ].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });

  resetIdleTimer();
})();
