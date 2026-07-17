async function reportPawDexTap() {
  try {
    await fetch("/api/tag-tap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companionId: "000001",
        source: "aspen-profile-open",
      }),
    });
  } catch (error) {
    console.error("PawDex tap report failed:", error);
  }
}

window.addEventListener("DOMContentLoaded", reportPawDexTap);
