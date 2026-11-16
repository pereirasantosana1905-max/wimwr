document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    hamburgerMenu.classList.toggle("show");
    const isOpen = hamburgerMenu.classList.contains("show");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });
});