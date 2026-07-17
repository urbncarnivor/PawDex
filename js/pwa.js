if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
      console.log("PawDex service worker ready.");
    } catch (error) {
      console.error("PawDex service worker failed:", error);
    }
  });
}
