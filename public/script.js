const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "";

const examplePrompts = [
  "A futuristic Tokyo street with neon lights",
  "A floating castle in a fantasy world",
  "A space station orbiting Jupiter",
  "A medieval knight riding a dragon",
  "A retro 80s arcade room with neon lights",
];

// Set theme on load
(() => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
})();

// Toggle theme
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
});

// Image size calculation
const getImageDimensions = (ratio, base = 512) => {
  const [w, h] = ratio.split("/").map(Number);
  const scale = base / Math.sqrt(w * h);
  let width = Math.floor((w * scale) / 16) * 16;
  let height = Math.floor((h * scale) / 16) * 16;
  return { width, height };
};

// Update image UI
const updateImageCard = (i, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${i}`);
  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `
    <img src="${imgUrl}" class="result-img" />
    <div class="img-overlay">
      <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
        <i class="fa-solid fa-download"></i>
      </a>
    </div>`;
};

// Generate images
const generateImages = async (model, count, ratio, prompt) => {
  const MODEL_URL = ``;
  const { width, height } = getImageDimensions(ratio);

  const imageTasks = Array.from({ length: count }, (_, i) =>
    (async () => {
      try {
        const response = await fetch(MODEL_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { width, height },
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error?.error || "Unknown error occurred.");
        }

        const blob = await response.blob();
        updateImageCard(i, URL.createObjectURL(blob));
      } catch (err) {
        console.error(`Error generating image ${i}:`, err);
        updateImageCard(i, "error.png");
      }
    })()
  );

  await Promise.allSettled(imageTasks);
};

// Create image cards and call generation
const createImageCards = async (model, count, ratio, prompt) => {
  gridGallery.innerHTML = "";
  for (let i = 0; i < count; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio}">
        <div class="status-container">
          <div class="spinner"></div>
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Generating...</p>
        </div>
        <img src="test.png" class="result-img" />
      </div>`;
  }

  await generateImages(model, count, ratio, prompt);
};

// Handle form submission
promptForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const model = modelSelect.value;
  const count = parseInt(countSelect.value) || 1;
  const ratio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();

  if (!prompt) return alert("Please enter a prompt.");

  await createImageCards(model, count, ratio, prompt);
});

// Random prompt button
promptBtn.addEventListener("click", () => {
  const example = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = example;
  promptInput.focus();
});
