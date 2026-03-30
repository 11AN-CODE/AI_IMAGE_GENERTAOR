// 1. Elements Selection
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const themeToggle = document.querySelector(".theme-toggle");
const gridGallery = document.querySelector(".gallery-grid");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const promptForm = document.querySelector(".prompt-form");

// 2. API Key
const API_KEY = CONFIG.HF_TOKEN;

// 3. Theme Toggle
const applyTheme = (isDark) => {
    document.body.classList.toggle("dark-theme", isDark);
    const icon = themeToggle.querySelector("i");
    if (icon) icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
};
applyTheme(localStorage.getItem("theme") === "dark");

themeToggle.addEventListener("click", () => {
    const isNowDark = !document.body.classList.contains("dark-theme");
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
    applyTheme(isNowDark);
});

// 4. Random Prompt
const examplePrompts = ["A magic forest", "Cyberpunk city", "Space cat with pizza"];
promptBtn.addEventListener("click", (e) => {
    e.preventDefault();
    promptInput.value = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
});

// 5. Image Generation Logic (Proxy Bypassing CORS)
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
    const targetUrl = `https://api-inference.huggingface.co/models/${selectedModel}`;
    
    // Sabse stable proxy URL
    const proxyUrl = "https://api.allorigins.win/raw?url=";

    for (let i = 0; i < imageCount; i++) {
        const imgCard = document.getElementById(`img-card-${i}`);
        
        try {
            // Hum direct HF ko call karne ke bajaye Proxy ke through bhej rahe hain
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: { width: 512, height: 512 },
                    options: { wait_for_model: true }
                }),
            });

            if (!response.ok) throw new Error("API Limit or Model Loading...");

            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);

            // UI Update & Download Fix
            imgCard.classList.remove("loading");
            imgCard.innerHTML = `
                <img src="${imgURL}" class="result-img">
                <div class="img-overlay">
                    <a href="${imgURL}" download="ai-img-${Date.now()}.png" class="img-download-btn">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>`;

        } catch (error) {
            console.error(error);
            if(imgCard) {
                imgCard.classList.remove("loading");
                imgCard.innerHTML = `<p class="status-text" style="color:red; font-size:10px;">CORS Blocked or Server Busy</p>`;
            }
        }
    }
};

// 6. Form Handling
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const promptText = promptInput.value.trim();
    const selectedModel = modelSelect.value;
    const count = parseInt(countSelect.value) || 1;
    const ratio = ratioSelect.value || "1x1";

    if (!promptText) return alert("Please enter prompt!");

    gridGallery.innerHTML = "";
    for (let i = 0; i < count; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${ratio.replace('x','/')}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <p class="status-text">Processing...</p>
                </div>
            </div>`;
    }

    generateImages(selectedModel, count, ratio, promptText);
});