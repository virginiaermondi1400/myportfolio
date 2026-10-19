"use strict";

const langButton = document.getElementById("lang");
let lang = localStorage.getItem("portfolio-language") || ((navigator.language || "").toLowerCase().startsWith("it") ? "it" : "en");

function renderLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-en][data-it]").forEach((el) => {
    if (el.matches("h2")) {
      el.innerHTML = el.dataset[lang];
    } else {
      el.textContent = el.dataset[lang];
    }
  });
  langButton.innerHTML = lang === "en" ? "IT / <b>EN</b>" : "<b>IT</b> / EN";
}

langButton.addEventListener("click", () => {
  lang = lang === "en" ? "it" : "en";
  localStorage.setItem("portfolio-language", lang);
  renderLang();
});
renderLang();

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === button));
    document.querySelectorAll(".project").forEach((card) => {
      card.hidden = button.dataset.filter !== "all" && !card.dataset.cat.includes(button.dataset.filter);
    });
  });
});

function stopInlineVideo(card) {
  if (!card) return;
  const visual = card.querySelector(".visual");
  const video = visual?.querySelector("video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  }
  card.classList.remove("is-playing");
}

function stopAllInlineVideos(exceptCard = null) {
  document.querySelectorAll(".project.is-playing").forEach((card) => {
    if (card !== exceptCard) stopInlineVideo(card);
  });
}

function startInlineVideo(card) {
  if (!card) return;
  const visual = card.querySelector(".visual");
  const source = card.dataset.videoSrc;
  if (!visual || !source) return;

  stopAllInlineVideos(card);
  stopInlineVideo(card);

  const video = document.createElement("video");
  video.className = "inline-player";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = source;
  video.setAttribute("controlsList", "nodownload");
  video.setAttribute("aria-label", `${card.querySelector("h3")?.textContent || "Project"} video`);

  visual.appendChild(video);
  card.classList.add("is-playing");
  visual.scrollIntoView({ block: "nearest", behavior: "smooth" });
  video.play().catch(() => {});
}

document.querySelectorAll(".video-project").forEach((card) => {
  const trigger = card.querySelector(".visual-trigger");
  const close = card.querySelector(".inline-close");
  trigger?.addEventListener("click", () => startInlineVideo(card));
  close?.addEventListener("click", (event) => {
    event.stopPropagation();
    stopInlineVideo(card);
  });
});

if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      io.unobserve(entry.target);
    }
  }), { threshold: 0.05 });

  document.querySelectorAll(".project,.section-heading,.about-grid,.contact").forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

const hero = document.querySelector(".hero");
if (hero && !matchMedia("(prefers-reduced-motion: reduce)").matches && matchMedia("(pointer:fine)").matches) {
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    hero.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--mx", 0);
    hero.style.setProperty("--my", 0);
  });
}
