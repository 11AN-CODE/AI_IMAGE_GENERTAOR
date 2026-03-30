// Theme Toggle
const modelSelect=document.getElementById("model-select");
const countSelect=document.getElementById("count-select");
const ratioSelect=document.getElementById("ratio-select");
const themeToggle = document.querySelector(".theme-toggle");
const gridGallery=document.querySelector(".gallery-grid");

// API Key from config.js
const API_KEY = CONFIG.HF_TOKEN;

(()=>{
    const savedTheme=localStorage.getItem("theme")
    const systemPreferDark=window.matchMedia("(prefers-color-scheme:dark)").matches;

    const isDarkTheme=savedTheme==="dark" || (!savedTheme && systemPreferDark);
    document.body.classList.toggle("dark-theme",isDarkTheme)
    themeToggle.querySelector("i").className=isDarkTheme?"fas fa-sun":"fas fa-moon";
})();

const toggleTheme=()=>{
    const isDark=document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme",isDark?"dark":"light");
    themeToggle.querySelector("i").className=isDark?"fas fa-sun":"fas fa-moon";
}

themeToggle.addEventListener("click",toggleTheme);

// Making the prompt -btn work
const promptBtn=document.querySelector(".prompt-btn");
const promptInput=document.querySelector(".prompt-input");
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains"
];

promptBtn.addEventListener("click",()=>{
    const prompt=examplePrompts[Math.floor(Math.random()*examplePrompts.length)];
    promptInput.value=prompt;
    promptInput.focus();
});

// Making the promptForm work
const handleFormSubmit=(e)=>{
    e.preventDefault();
    const selectedModel=modelSelect.value;
    const imageCount=parseInt(countSelect.value) || 1;
    const aspectRatio=ratioSelect.value || "1x1";
    const promptText=promptInput.value.trim();
    createImageCard(selectedModel, imageCount, aspectRatio, promptText);
}

const generateImages= async(selectedModel,imageCount,aspectRatio,promptText)=>{
    // FIX: Removed extra quotes from URL and fixed Replicate router path
    const Model_Url=`https://api-inference.huggingface.co/models/${selectedModel}`;

    const getImageDimensions=(aspectRatio,baseSize = 512)=>{
        const [width,height]=aspectRatio.split("x").map(Number);
        const scaleFactor=baseSize/Math.max(width,height);
        let calculatedWidth=Math.round(width*scaleFactor);
        let calculatedHeight=Math.round(height*scaleFactor);
        calculatedWidth=Math.floor(calculatedWidth/64)*64;
        calculatedHeight=Math.floor(calculatedHeight/64)*64;
        return {width:calculatedWidth,height:calculatedHeight};
    };
    const updateImageCard=(imgIndex,IMGURL)=>{
        const imgCard=document.getElementById(`img-card-${imgIndex}`);  
        if(!imgCard) return ;

        imgCard.classList.remove("loading");
        imgCard.innerHTML=`<img src="" alt="" class="result-img">
                        <div class="img-overlay">
                            <button class="img-download-btn">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>`

    const { width, height } = getImageDimensions(aspectRatio);

    const imagePromises=Array.from({length:imageCount},async(_,i)=>{
        try{
            const response=await fetch(Model_Url,{
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false",
                },
                method: "POST",
                // FIX: Corrected JSON.stringify syntax
                body: JSON.stringify({
                    inputs: promptText,
                    parameters:{width,height},
                    options:{wait_for_model:true , use_cache:false}
                }),             
            });

            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.blob();
            updateImageCard(i, URL.createObjectURL(result));
            
            // Adding logic to show result in the card
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.querySelector(".result-img").src = URL.createObjectURL(result);
            imgCard.classList.remove("loading");
        
        }catch(error){
            console.error("Error generating images:",error);
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.querySelector(".status-text").innerText = "Failed!";
        }
    });
 
    await Promise.allSettled(imagePromises);
};

const createImageCard=(selectedModel,imageCount,aspectRatio,promptText)=>{
    gridGallery.innerHTML="";
    for(let i=0;i<imageCount;i++){
        // Using '1 / 1' format for CSS aspect-ratio if needed
        const cssRatio = aspectRatio.replace("x", " / ");
        gridGallery.innerHTML+=`<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${cssRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating image...</p>
                        </div>
                        <img src="" alt="" class="result-img">
                        </div>`;
    }
    generateImages(selectedModel,imageCount,aspectRatio,promptText);
}

const promptForm=document.querySelector(".prompt-form");
promptForm.addEventListener("submit",handleFormSubmit);