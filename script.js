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






