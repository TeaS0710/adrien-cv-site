const printButton = document.querySelector("#print-cv");
const themeToggle = document.querySelector("#theme-toggle");
const scrollTopButton = document.querySelector("#scroll-top");
const progressBar = document.querySelector("#scroll-progress-bar");
const heroSurface = document.querySelector("#hero-surface");
const heroOrbs = document.querySelectorAll(".hero__orb");
const assistantLauncher = document.querySelector("#assistant-launcher");
const assistantPanel = document.querySelector("#assistant-panel");
const assistantClose = document.querySelector("#assistant-close");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantMeta = document.querySelector("#assistant-meta");
const assistantSend = document.querySelector("#assistant-send");
const assistantSuggestions = document.querySelectorAll(".assistant-suggestion");
const assistantAvatarImage = document.querySelector("#assistant-avatar-image");
const assistantGalleryItems = document.querySelectorAll(".assistant-gallery__item");
const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".project-card");
const navLinks = document.querySelectorAll(".section-nav a");
const sectionNav = document.querySelector("#section-nav");
const revealNodes = document.querySelectorAll(".reveal");
const stickyGlowTargets = document.querySelectorAll(".hero__inner, .contact-card, .panel");
const sections = [...navLinks]
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const storedTheme = localStorage.getItem("adrien-cv-theme");
const assistantConfig = window.CV_ASSISTANT_CONFIG || {};
const assistantEndpoint = assistantConfig.endpoint || "";
const assistantName = assistantConfig.assistantName || "Airi";
const assistantState = {
  token: sessionStorage.getItem("cv-assistant-token") || "",
  used: Number(sessionStorage.getItem("cv-assistant-used") || "0"),
  limit: 10,
  busy: false,
};

if (storedTheme) {
  document.body.dataset.theme = storedTheme;
}

if (printButton) {
  printButton.addEventListener("click", () => {
    window.print();
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme =
      document.body.dataset.theme === "soft-night" ? "day" : "soft-night";

    if (nextTheme === "day") {
      delete document.body.dataset.theme;
      localStorage.setItem("adrien-cv-theme", "day");
      return;
    }

    document.body.dataset.theme = nextTheme;
    localStorage.setItem("adrien-cv-theme", nextTheme);
  });
}

if (scrollTopButton) {
  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;

    chips.forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");

    cards.forEach((card) => {
      const matches = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !matches);
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.15 }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const stickyGlowObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-stuck", entry.intersectionRatio < 1);
    });
  },
  { threshold: [0.98, 1] }
);

stickyGlowTargets.forEach((node) => stickyGlowObserver.observe(node));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-current", isCurrent);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
);

sections.forEach((section) => sectionObserver.observe(section));

const syncScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (scrollTopButton) {
    scrollTopButton.hidden = window.scrollY < 320;
  }

  document.body.classList.toggle("nav-condensed", window.scrollY > 120);
};

const attachCardMotion = (card) => {
  const reset = () => {
    card.style.transform = "";
  };

  card.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 920) return;

    const bounds = card.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;
    const rotateY = ((offsetX / bounds.width) - 0.5) * 7;
    const rotateX = (0.5 - (offsetY / bounds.height)) * 7;

    card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("pointerleave", reset);
  card.addEventListener("blur", reset);
};

cards.forEach(attachCardMotion);

const resetHeroMotion = () => {
  if (!heroSurface) return;
  heroSurface.style.transform = "";
  heroOrbs.forEach((orb) => {
    orb.style.transform = "";
  });
};

if (heroSurface) {
  heroSurface.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 920) return;

    const bounds = heroSurface.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const rotateY = offsetX * 6;
    const rotateX = offsetY * -5;

    heroSurface.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    heroOrbs.forEach((orb, index) => {
      const factor = index === 0 ? 18 : 12;
      orb.style.transform = `translate(${offsetX * factor}px, ${offsetY * factor}px)`;
    });
  });

  heroSurface.addEventListener("pointerleave", resetHeroMotion);
}

const updateDockEffect = (event) => {
  if (!sectionNav || window.innerWidth < 920) return;

  navLinks.forEach((link) => {
    const bounds = link.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    const distance = Math.abs(event.clientX - center);
    const influence = Math.max(0, 1 - distance / 140);
    const scale = 1 + influence * 0.18;
    const opacity = 0.72 + influence * 0.28;

    link.style.transform = `scale(${scale})`;
    link.style.opacity = `${opacity}`;
  });
};

const resetDockEffect = () => {
  navLinks.forEach((link) => {
    link.style.transform = "";
    link.style.opacity = "";
  });
};

if (sectionNav) {
  sectionNav.addEventListener("pointermove", updateDockEffect);
  sectionNav.addEventListener("pointerleave", resetDockEffect);
}

const updateAssistantMeta = (detail) => {
  if (!assistantMeta) return;

  const remaining = Math.max(0, assistantState.limit - assistantState.used);
  assistantMeta.textContent =
    detail || `${remaining} message${remaining === 1 ? "" : "s"} available in this browser session.`;
};

const setAssistantOpen = (open) => {
  if (!assistantPanel || !assistantLauncher) return;

  assistantPanel.classList.toggle("is-open", open);
  assistantPanel.setAttribute("aria-hidden", String(!open));
  assistantLauncher.setAttribute("aria-expanded", String(open));

  if (open && assistantInput) {
    assistantInput.focus();
  }
};

const appendAssistantMessage = (role, text) => {
  if (!assistantMessages) return;

  const article = document.createElement("article");
  article.className = `assistant-message assistant-message--${role}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  article.appendChild(paragraph);
  assistantMessages.appendChild(article);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
};

const setAssistantBusy = (busy) => {
  assistantState.busy = busy;
  if (assistantSend) {
    assistantSend.disabled = busy || assistantState.used >= assistantState.limit;
  }
  if (assistantInput) {
    assistantInput.disabled = busy || assistantState.used >= assistantState.limit;
  }
};

if (assistantLauncher) {
  assistantLauncher.addEventListener("click", () => {
    const isOpen = assistantPanel?.classList.contains("is-open");
    setAssistantOpen(!isOpen);
  });
}

if (assistantClose) {
  assistantClose.addEventListener("click", () => {
    setAssistantOpen(false);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setAssistantOpen(false);
  }
});

if (assistantForm) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!assistantInput || !assistantEndpoint) {
      appendAssistantMessage("status", "Assistant endpoint not configured yet.");
      return;
    }

    const message = assistantInput.value.trim();
    if (!message || assistantState.busy) return;

    if (assistantState.used >= assistantState.limit) {
      updateAssistantMeta("Session limit reached. Please open a new browser session later.");
      return;
    }

    appendAssistantMessage("user", message);
    assistantInput.value = "";
    setAssistantBusy(true);
    appendAssistantMessage("status", `${assistantName} is thinking...`);

    try {
      const response = await fetch(assistantEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CV-Assistant": "1",
        },
        body: JSON.stringify({
          message,
          token: assistantState.token || null,
        }),
      });

      const data = await response.json().catch(() => ({}));
      assistantMessages?.lastElementChild?.remove();

      if (!response.ok) {
        const detail = data?.error || data?.detail || "The assistant is temporarily unavailable.";
        appendAssistantMessage("assistant", detail);
        if (typeof data.remaining === "number") {
          assistantState.used = assistantState.limit - data.remaining;
          sessionStorage.setItem("cv-assistant-used", String(assistantState.used));
        }
        updateAssistantMeta();
        return;
      }

      assistantState.token = data.token || assistantState.token;
      if (assistantState.token) {
        sessionStorage.setItem("cv-assistant-token", assistantState.token);
      }

      assistantState.used = typeof data.used === "number" ? data.used : assistantState.used + 1;
      sessionStorage.setItem("cv-assistant-used", String(assistantState.used));
      appendAssistantMessage("assistant", data.reply || "I could not produce a reply.");
      updateAssistantMeta();
    } catch (error) {
      assistantMessages?.lastElementChild?.remove();
      appendAssistantMessage("assistant", "Network issue. Please try again in a moment.");
    } finally {
      setAssistantBusy(false);
    }
  });
}

assistantSuggestions.forEach((button) => {
  button.addEventListener("click", () => {
    if (!assistantInput) return;
    assistantInput.value = button.textContent?.trim() || "";
    setAssistantOpen(true);
  });
});

assistantGalleryItems.forEach((button) => {
  button.addEventListener("click", () => {
    const nextAvatar = button.dataset.avatar;
    if (!nextAvatar || !assistantAvatarImage) return;

    assistantGalleryItems.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    assistantAvatarImage.src = nextAvatar;
  });
});

updateAssistantMeta();
setAssistantBusy(false);
syncScrollProgress();
window.addEventListener("scroll", syncScrollProgress, { passive: true });
window.addEventListener("resize", () => {
  resetHeroMotion();
  resetDockEffect();
  syncScrollProgress();
});
