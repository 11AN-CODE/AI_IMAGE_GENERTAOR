// Theme Toggle
const themeToggle = document.querySelector(".theme-toggle");
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












