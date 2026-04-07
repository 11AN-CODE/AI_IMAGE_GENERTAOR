// 1. Elements Selection
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const themeToggle = document.querySelector(".theme-toggle");
const gridGallery = document.querySelector(".gallery-grid");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");



// 3. Theme Toggle Logic
const applyTheme = (isDark) => {
    document.body.classList.toggle("dark-theme", isDark);
    const icon = themeToggle.querySelector("i");
    if (icon) icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
};

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme === "dark");

themeToggle.addEventListener("click", () => {
    const isNowDark = !document.body.classList.contains("dark-theme");
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
    applyTheme(isNowDark);
});

// 4. Random Prompt Logic
const examplePrompts = [
    "A magic forest with glowing plants and fairy homes",
    "An old steampunk airship floating through golden clouds",
    "A future Mars colony with glass domes and red mountains",
    "A dragon sleeping on gold coins in a crystal cave",
    "An underwater kingdom with merpeople and glowing coral",
    "A cyberpunk city street at night with neon signs",
    "A cute cat astronaut floating in space with a slice of pizza"
];

promptBtn.addEventListener("click", (e) => {
    e.preventDefault(); 
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = randomPrompt;
    promptInput.focus();
});

// 5. Image Generation Logic (CORS Optimized)
async function query(model, data) {
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            inputs: data.inputs,
            parameters: data.parameters
        }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const [w, h] = aspectRatio.split("x").map(Number);

    // Run all requests in parallel
    const tasks = Array.from({ length: imageCount }).map(async (_, i) => {
        const imgCard = document.getElementById(`img-card-${i}`);
        
        try {
            const blob = await query(selectedModel, {
                inputs: promptText,
                parameters: { width: w, height: h },
                options: { wait_for_model: true }
            });

            const imgURL = URL.createObjectURL(blob);

            // Update UI
            imgCard.classList.remove("loading");
            imgCard.innerHTML = `
                <img src="${imgURL}" class="result-img">
                <div class="img-overlay">
                    <a href="${imgURL}" download="ai-gen-${Date.now()}.png" class="img-download-btn">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>`;
        } catch (error) {
            console.error(error);
            if(imgCard) {
                imgCard.classList.remove("loading");
                imgCard.innerHTML = `<p class="status-text" style="color:#ff4c4c; font-size:12px; padding:10px;">${error.message}</p>`;
            }
        }
    });

    await Promise.all(tasks);
};

// 6. Form Handling
const handleFormSubmit = (e) => {
    e.preventDefault();
    const promptText = promptInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!promptText || !selectedModel) {
        alert("Please enter a prompt and select a model!");
        return;
    }

    gridGallery.innerHTML = "";
    const count = parseInt(countSelect.value) || 1;
    const ratio = ratioSelect.value || "1x1";

    for (let i = 0; i < count; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio.replace('x','/')}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <p class="status-text">Generating...</p>
                </div>
            </div>`;
    }

    generateImages(selectedModel, count, ratio, promptText);
};

promptForm.addEventListener("submit", handleFormSubmit);