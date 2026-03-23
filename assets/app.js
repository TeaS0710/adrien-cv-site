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
const assistantEyebrow = document.querySelector("#assistant-eyebrow");
const assistantPersonaName = document.querySelector("#assistant-persona-name");
const assistantPersonaRole = document.querySelector("#assistant-persona-role");
const assistantIntro = document.querySelector("#assistant-intro");
const assistantPersonaMood = document.querySelector("#assistant-persona-mood");
const assistantPersonaTask = document.querySelector("#assistant-persona-task");
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
const ASSISTANT_PERSONAS = {
  profile: {
    id: "profile",
    name: "Mira",
    role: "Profile architect and poised overview guide",
    eyebrow: "YIYI Switchboard // Mira",
    intro:
      "Mira gives the polished big-picture read: profile, trajectory, strengths and why Adrien's cross-domain positioning stands out.",
    mood: "Calm synthesis",
    task: "Best for profile overviews, positioning and recruiter-facing summaries.",
    placeholder: "Ask Mira for an overview, trajectory or high-level positioning...",
    suggestions: [
      "Who is Adrien and what makes his profile stand out?",
      "How would you summarize Adrien for a recruiter?",
      "What is the overall shape of Adrien's trajectory?",
    ],
    avatar: "assets/assistant/yiyi-1.png",
    starter:
      "Hello. YIYI is online. Mira is currently at the front: she handles Adrien's global profile, trajectory and overall positioning.",
  },
  work: {
    id: "work",
    name: "Kael",
    role: "Technical analyst for projects, systems and methods",
    eyebrow: "YIYI Switchboard // Kael",
    intro:
      "Kael takes over when the question turns technical: projects, implementation choices, tooling, evaluation logic and engineering depth.",
    mood: "Sharp analysis",
    task: "Best for project breakdowns, workflows, tools and technical credibility.",
    placeholder: "Ask Kael about projects, methods, tools or engineering choices...",
    suggestions: [
      "Which projects best show Adrien's technical work?",
      "What engineering methods define Adrien's work?",
      "What tools and workflows does Adrien use most?",
    ],
    avatar: "assets/assistant/yiyi-2.png",
    starter:
      "Kael is on point. He handles Adrien's projects, engineering logic, tools and the technical shape of the work.",
  },
  personal: {
    id: "personal",
    name: "Sora",
    role: "Human-side interpreter for style, interests and character",
    eyebrow: "YIYI Switchboard // Sora",
    intro:
      "Sora frames Adrien from the human side: working style, curiosity, hands-on habits and the technical interests that shape his personality.",
    mood: "Human portrait",
    task: "Best for working style, personal technical interests and a warmer reading of the profile.",
    placeholder: "Ask Sora about Adrien's style, curiosity or personal technical interests...",
    suggestions: [
      "What kind of person does Adrien seem to be outside pure coursework?",
      "How do Adrien's technical hobbies shape his profile?",
      "What does Adrien's working style seem to be?",
    ],
    avatar: "assets/assistant/yiyi-3.png",
    starter:
      "Sora is listening. She sketches the more human portrait: curiosity, working style, technical hobbies and the energy behind the profile.",
  },
};

const getPersona = (personaId) => ASSISTANT_PERSONAS[personaId] || ASSISTANT_PERSONAS.profile;

const detectPersonaFromText = (value) => {
  const text = String(value || "").toLowerCase();
  const workSignals = [
    "project",
    "projects",
    "work",
    "technical",
    "tech",
    "engineering",
    "code",
    "pipeline",
    "ml",
    "nlp",
    "asr",
    "ocr",
    "hardware",
    "system",
    "systems",
    "tool",
    "tools",
    "stack",
    "experience",
    "skills",
    "internship",
    "research",
  ];
  const personalSignals = [
    "personality",
    "personal",
    "person",
    "outside work",
    "outside of work",
    "life",
    "hobbies",
    "hobby",
    "interests",
    "passion",
    "passions",
    "human",
    "kind of person",
    "character",
    "repair",
    "rc",
    "car",
    "cars",
    "motor",
    "languages",
  ];

  if (personalSignals.some((signal) => text.includes(signal))) {
    return ASSISTANT_PERSONAS.personal;
  }

  if (workSignals.some((signal) => text.includes(signal))) {
    return ASSISTANT_PERSONAS.work;
  }

  return ASSISTANT_PERSONAS.profile;
};

const assistantState = {
  token: sessionStorage.getItem("cv-assistant-token") || "",
  used: Number(sessionStorage.getItem("cv-assistant-used") || "0"),
  limit: 10,
  busy: false,
  persona: "profile",
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

const renderAssistantSuggestions = (persona) => {
  if (!assistantSuggestions.length && !document.querySelector("#assistant-suggestions")) return;
  const suggestionsContainer = document.querySelector("#assistant-suggestions");
  if (!suggestionsContainer) return;

  suggestionsContainer.innerHTML = "";

  persona.suggestions.forEach((text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "assistant-suggestion is-active";
    button.dataset.persona = persona.id;
    button.textContent = `${persona.name}: ${text}`;
    button.addEventListener("click", () => {
      if (!assistantInput) return;
      applyAssistantPersona(persona.id);
      assistantInput.value = text;
      setAssistantOpen(true);
    });
    suggestionsContainer.appendChild(button);
  });
};

const applyAssistantPersona = (personaId, options = {}) => {
  const persona = getPersona(personaId);
  assistantState.persona = persona.id;

  if (assistantPanel) {
    assistantPanel.dataset.persona = persona.id;
  }

  if (assistantLauncher) {
    assistantLauncher.dataset.persona = persona.id;
  }

  if (assistantEyebrow) {
    assistantEyebrow.textContent = persona.eyebrow;
  }

  if (assistantPersonaName) {
    assistantPersonaName.textContent = persona.name;
  }

  if (assistantPersonaRole) {
    assistantPersonaRole.textContent = persona.role;
  }

  if (assistantIntro) {
    assistantIntro.textContent = persona.intro;
  }

  if (assistantPersonaMood) {
    assistantPersonaMood.textContent = persona.mood;
  }

  if (assistantPersonaTask) {
    assistantPersonaTask.textContent = persona.task;
  }

  if (assistantInput) {
    assistantInput.placeholder = persona.placeholder;
  }

  if (assistantAvatarImage && (!options.preserveAvatar || !assistantAvatarImage.src)) {
    assistantAvatarImage.src = persona.avatar;
  }

  assistantGalleryItems.forEach((item) => {
    const isActive = item.dataset.persona === persona.id;
    item.classList.toggle("is-active", isActive);
  });

  assistantSuggestions.forEach((button) => {
    const isActive = button.dataset.persona === persona.id;
    button.classList.toggle("is-active", isActive);
  });

  renderAssistantSuggestions(persona);
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
    const persona = detectPersonaFromText(message);

    if (assistantState.used >= assistantState.limit) {
      updateAssistantMeta("Session limit reached. Please open a new browser session later.");
      return;
    }

    applyAssistantPersona(persona.id);
    appendAssistantMessage("user", message);
    assistantInput.value = "";
    setAssistantBusy(true);
    appendAssistantMessage("status", `${persona.name} is thinking...`);

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

assistantGalleryItems.forEach((button) => {
  button.addEventListener("click", () => {
    const nextAvatar = button.dataset.avatar;
    const personaId = button.dataset.persona || "profile";
    if (!nextAvatar || !assistantAvatarImage) return;

    assistantAvatarImage.src = nextAvatar;
    applyAssistantPersona(personaId, { preserveAvatar: true });
  });
});

if (assistantInput) {
  assistantInput.addEventListener("input", () => {
    applyAssistantPersona(detectPersonaFromText(assistantInput.value).id);
  });
}

applyAssistantPersona("profile");
updateAssistantMeta();
setAssistantBusy(false);
syncScrollProgress();
window.addEventListener("scroll", syncScrollProgress, { passive: true });
window.addEventListener("resize", () => {
  resetHeroMotion();
  resetDockEffect();
  syncScrollProgress();
});
