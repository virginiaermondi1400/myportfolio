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
  langButton.setAttribute("aria-label", lang === "en" ? "Passa all’italiano" : "Switch to English");
  document.querySelector(".nav nav").setAttribute("aria-label", lang === "en" ? "Main navigation" : "Navigazione principale");
  document.querySelector(".filters").setAttribute("aria-label", lang === "en" ? "Filter projects" : "Filtra i progetti");
  document.querySelectorAll(".video-project").forEach((card) => {
    const title = card.querySelector("h3").textContent;
    card.querySelector(".visual-trigger").setAttribute("aria-label", lang === "en" ? `Play video: ${title}` : `Guarda il video: ${title}`);
    card.querySelector(".inline-close").setAttribute("aria-label", lang === "en" ? "Close video" : "Chiudi il video");
  });
}

langButton.addEventListener("click", () => {
  lang = lang === "en" ? "it" : "en";
  localStorage.setItem("portfolio-language", lang);
  renderLang();
});
renderLang();

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const filters = document.querySelectorAll(".filter");
filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll(".project").forEach((card) => {
      card.hidden = button.dataset.filter !== "all" && !card.dataset.cat.includes(button.dataset.filter);
      if (card.hidden) stopInlineVideo(card);
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
  video.setAttribute("aria-label", card.querySelector("h3").textContent);

  visual.appendChild(video);
  card.classList.add("is-playing");
  visual.scrollIntoView({ block: "nearest" });
  card.querySelector(".inline-close").focus({ preventScroll: true });
  video.play().catch(() => {});
}

document.querySelectorAll(".video-project").forEach((card) => {
  const trigger = card.querySelector(".visual-trigger");
  const close = card.querySelector(".inline-close");
  trigger?.addEventListener("click", () => startInlineVideo(card));
  close?.addEventListener("click", (event) => {
    event.stopPropagation();
    stopInlineVideo(card);
    trigger?.focus({ preventScroll: true });
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
