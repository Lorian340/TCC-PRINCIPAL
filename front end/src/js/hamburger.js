const hamburgerBtn = document.querySelector(".hamburger-btn");

const mobileMenu = document.getElementById("mobile-menu");

const closeMobileMenu = document.querySelector(".close-mobile-menu");

hamburgerBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("hidden");
  mobileMenu.classList.add("flex");
});

closeMobileMenu.addEventListener("click", () => {
  mobileMenu.classList.add("hidden");
  mobileMenu.classList.remove("flex");
});

mobileMenu.addEventListener("click", (e) => {
  if (e.target === mobileMenu) {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("flex");
  }
});