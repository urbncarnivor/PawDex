async function loadCompanion(id) {
  const response = await fetch(`database/companions/${id}.json`);

  if (!response.ok) {
    throw new Error(`Could not load companion ${id}`);
  }

  return response.json();
}

async function displayCompanion() {
  try {
    const companion = await loadCompanion("000001");

    const nameElement = document.getElementById("companion-name");
    const breedElement = document.getElementById("companion-breed");

    if (nameElement) {
      nameElement.textContent = companion.name;
    }

    if (breedElement) {
      breedElement.textContent = companion.breed;
    }
  } catch (error) {
    console.error("PawDex loading error:", error);
  }
}

displayCompanion();