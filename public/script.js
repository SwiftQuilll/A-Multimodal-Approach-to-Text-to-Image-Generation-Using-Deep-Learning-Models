const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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";

const examplePrompts = [
  "A futuristic Tokyo street with neon lights",
  "A floating castle in a fantasy world",
  "A space station orbiting Jupiter",
  "A medieval knight riding a dragon",
  "A retro 80s arcade room with neon lights",
  "A person standing at the edge of a shattered glass bridge, choosing between light and shadow, symbolic of decision and inner conflict",

"A tree growing from an open book in the middle of a desert, symbolizing knowledge and hope amidst emptines",

"A faceless figure staring into a cracked mirror, where each piece shows a different emotion, representing identity and self-reflection",

"A lonely astronaut floating in a cosmic ocean, tethered only to a glowing heart, symbolizing isolation and love in the vast unknown",

"A child holding a balloon shaped like the Earth, surrounded by machines, symbolizing innocence in a world of technology",

"A staircase made of broken clocks leading to the stars, symbolizing time, growth, and the pursuit of dreams",

"Two hands reaching out to each other through a screen, glowing faintly, depicting human connection in the digital age",

"A phoenix rising from a crumbling cityscape, with petals of fire and smoke, symbolizing rebirth after destruction",

"An old man walking through a forest of memories, each tree carved with moments of his life, autumn leaves falling around",

"A glass jar filled with butterflies, some trying to escape, others resting peacefully — symbol of freedom, dreams, and restraint",

];

// Theme setup
(() => {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
})();

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.querySelector("i").className = isDark ? "fa-solid fa-moon" : "fa-solid fa-sun";
});

const getImageDimensions = (ratio, base = 512) => {
  const [w, h] = ratio.split("/").map(Number);
  const scale = base / Math.sqrt(w * h);
  const width = Math.floor((w * scale) / 16) * 16;
  const height = Math.floor((h * scale) / 16) * 16;
  return { width, height };
};

const updateImageCard = (i, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${i}`);
  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `
    <img src="${imgUrl}" class="result-img" />
    <div class="img-overlay">
      <a href="${imgUrl}" class="img-download-btn" download="image-${Date.now()}.png">
        <i class="fa-solid fa-download"></i>
      </a>
    </div>`;
};

const generateImages = async (model, count, ratio, prompt) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${model}`;
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
          throw new Error(error?.error || "Error generating image");
        }

        const blob = await response.blob();
        updateImageCard(i, URL.createObjectURL(blob));
      } catch (err) {
        console.error(`Error with image ${i}:`, err);
        updateImageCard(i, "error.png");
      }
    })()
  );

  await Promise.allSettled(imageTasks);
};

const createImageCards = async (model, count, ratio, prompt) => {
  gridGallery.innerHTML = "";
  for (let i = 0; i < count; i++) {
    gridGallery.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio}">
        <div class="status-container">
          <div class="spinner"></div>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }

  await generateImages(model, count, ratio, prompt);
};

promptForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const model = modelSelect.value;
  const count = parseInt(countSelect.value) || 1;
  const ratio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();

  if (!model || !prompt) return;
  await createImageCards(model, count, ratio, prompt);
});

promptBtn.addEventListener("click", () => {
  const example = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = example;
  promptInput.focus();
});
