function base64ToBytes(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);

  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

function showAlertSetup(registration) {
  const panel = document.createElement("aside");

  panel.innerHTML = `
    <strong>Never miss a PawDex alert</strong>
    <p>Allow notifications so PawDex can immediately tell you when a companion profile is opened.</p>
    <button id="pawdex-enable-alerts">Enable Instant Alerts</button>
    <button id="pawdex-alerts-later">Not Now</button>
  `;

  Object.assign(panel.style, {
    position: "fixed",
    left: "16px",
    right: "16px",
    bottom: "20px",
    zIndex: "99999",
    padding: "20px",
    border: "1px solid #20ff24",
    borderRadius: "20px",
    background: "#07111f",
    color: "#ffffff",
    boxShadow: "0 0 28px rgba(32,255,36,.3)",
    fontFamily: "system-ui, sans-serif",
  });

  const buttons = panel.querySelectorAll("button");

  buttons.forEach((button) => {
    Object.assign(button.style, {
      padding: "12px 16px",
      margin: "8px 8px 0 0",
      border: "0",
      borderRadius: "12px",
      fontWeight: "700",
    });
  });

  buttons[0].style.background = "#20ff24";
  buttons[0].style.color = "#07111f";

  document.body.appendChild(panel);

  panel.querySelector("#pawdex-alerts-later").onclick = () => panel.remove();

  panel.querySelector("#pawdex-enable-alerts").onclick = async () => {
    const enableButton = panel.querySelector("#pawdex-enable-alerts");

    try {
      enableButton.disabled = true;

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notifications were not allowed.");
      }

      const pin = prompt("Enter your PawDex owner setup PIN:");

      if (!pin) {
        throw new Error("Setup PIN is required.");
      }

      const configResponse = await fetch("/api/push-config");
      const config = await configResponse.json();

      if (!configResponse.ok) {
        throw new Error(config.message);
      }

      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToBytes(config.publicKey),
        }));

      const response = await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companionId: "000001",
          pin,
          subscription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      panel.remove();
      alert("Instant PawDex alerts are enabled!");
    } catch (error) {
      enableButton.disabled = false;
      alert(error.message || "Unable to enable alerts.");
    }
  };
}

(async () => {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (
      standalone &&
      "Notification" in window &&
      "PushManager" in window
    ) {
      const existing = await registration.pushManager.getSubscription();

      if (Notification.permission !== "granted" || !existing) {
        showAlertSetup(registration);
      }
    }
  } catch (error) {
    console.error("PawDex service worker error:", error);
  }
})();
