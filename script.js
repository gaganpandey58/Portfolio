"use strict";

const body = document.body;
const root = document.documentElement;
const header = document.querySelector(".site-header");
const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const themeToggle = document.querySelector(".theme-toggle");
const navMenu = document.querySelector("#primary-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const progressBar = document.querySelector("#scroll-progress-bar");
const backToTopButton = document.querySelector("#backToTop");
const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const metricsSection = document.querySelector("#impact");
const metricValues = Array.from(document.querySelectorAll(".metric-value"));
const hero = document.querySelector(".hero");
const yearNode = document.querySelector("#year");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

let countersStarted = false;
let ticking = false;
const THEME_STORAGE_KEY = "portfolio-theme";

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const getStoredTheme = () => {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch (error) {
    return null;
  }
  return null;
};

const setThemeToggleUI = (theme) => {
  if (!themeToggle) {
    return;
  }
  const isDark = theme === "dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
};

const applyTheme = (theme) => {
  root.setAttribute("data-theme", theme);
  setThemeToggleUI(theme);
};

const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const storedTheme = getStoredTheme();
const initialTheme = storedTheme || (systemThemeQuery.matches ? "dark" : "light");
applyTheme(initialTheme);

if (!storedTheme) {
  systemThemeQuery.addEventListener("change", (event) => {
    applyTheme(event.matches ? "dark" : "light");
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      // no-op: storage may be unavailable in restricted contexts
    }
  });
}

const closeMenu = () => {
  if (!navMenu || !menuToggle) {
    return;
  }
  navMenu.classList.remove("open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
};

const openMenu = () => {
  if (!navMenu || !menuToggle) {
    return;
  }
  navMenu.classList.add("open");
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  body.classList.add("menu-open");
};

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.contains("open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("open")) {
      return;
    }
    if (nav && !nav.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const scrollToHash = (hash) => {
  if (!hash || hash === "#") {
    return;
  }
  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const headerOffset = header ? header.offsetHeight + 10 : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
};

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const { hash } = anchor;
    if (!hash || hash === "#") {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    event.preventDefault();
    scrollToHash(hash);
    closeMenu();
  });
});

const setActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveSection = () => {
  if (!sections.length) {
    return;
  }

  const marker =
    window.scrollY + (header ? header.offsetHeight : 0) + window.innerHeight * 0.28;
  let activeId = sections[0].id;

  sections.forEach((section) => {
    if (section.offsetTop <= marker) {
      activeId = section.id;
    }
  });

  setActiveLink(activeId);
};

const updateScrollUI = () => {
  const scrollTop = window.scrollY || window.pageYOffset;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

  if (header) {
    header.classList.toggle("scrolled", scrollTop > 12);
  }

  if (progressBar) {
    progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  }

  if (backToTopButton) {
    backToTopButton.classList.toggle("visible", scrollTop > 560);
  }

  updateActiveSection();
};

const requestScrollUpdate = () => {
  if (ticking) {
    return;
  }
  ticking = true;
  window.requestAnimationFrame(() => {
    updateScrollUI();
    ticking = false;
  });
};

window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
updateScrollUI();

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

const markVisible = (element) => {
  if (!element) {
    return;
  }
  const delayStep = Number(element.dataset.delay || 0);
  element.style.transitionDelay = `${delayStep * 90}ms`;
  element.classList.add("is-visible");
};

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -7% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const runCounter = (node, index) => {
  const target = Number(node.dataset.target || 0);
  const suffix = node.dataset.suffix || "";
  const prefix = node.dataset.prefix || "";
  const duration = 1250 + index * 140;

  if (prefersReducedMotion) {
    node.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  const startTime = performance.now();

  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    node.textContent = `${prefix}${value}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

const startCounters = () => {
  if (countersStarted) {
    return;
  }
  countersStarted = true;
  metricValues.forEach((valueNode, index) => runCounter(valueNode, index));
};

if (metricsSection) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    startCounters();
  } else {
    const metricObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    metricObserver.observe(metricsSection);
  }
}

if (hero && !prefersReducedMotion) {
  hero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = hero.getBoundingClientRect();
      const xRatio = (event.clientX - bounds.left) / bounds.width - 0.5;
      const yRatio = (event.clientY - bounds.top) / bounds.height - 0.5;
      hero.style.setProperty("--pointer-x", `${(xRatio * 30).toFixed(2)}px`);
      hero.style.setProperty("--pointer-y", `${(yRatio * 30).toFixed(2)}px`);
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--pointer-x", "0px");
    hero.style.setProperty("--pointer-y", "0px");
  });
}

if (contactForm) {
  const nameInput = contactForm.querySelector("#contactName");
  const emailInput = contactForm.querySelector("#contactEmail");
  const messageInput = contactForm.querySelector("#contactMessage");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const inputs = [nameInput, emailInput, messageInput].filter(Boolean);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formEndpoint =
    contactForm.dataset.endpoint || "https://formsubmit.co/ajax/gaganpandey58@gmail.com";

  const setFormStatus = (message, type = "") => {
    if (!formStatus) {
      return;
    }
    formStatus.textContent = message;
    formStatus.className = `form-status${type ? ` ${type}` : ""}`;
  };

  const clearFieldError = (field) => {
    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  };

  const setFieldError = (field) => {
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
  };

  inputs.forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field);
      if (formStatus && formStatus.classList.contains("error")) {
        setFormStatus("");
      }
    });
  });

  const buildMailtoUrl = (name, email, message) => {
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n")
    );
    return `mailto:gaganpandey58@gmail.com?subject=${subject}&body=${body}`;
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const message = (messageInput?.value || "").trim();
    let firstInvalidField = null;

    inputs.forEach((field) => clearFieldError(field));
    setFormStatus("");

    if (!name && nameInput) {
      setFieldError(nameInput);
      firstInvalidField = firstInvalidField || nameInput;
    }

    if ((!email || !emailPattern.test(email)) && emailInput) {
      setFieldError(emailInput);
      firstInvalidField = firstInvalidField || emailInput;
    }

    if (!message && messageInput) {
      setFieldError(messageInput);
      firstInvalidField = firstInvalidField || messageInput;
    }

    if (firstInvalidField) {
      setFormStatus("Please provide a valid name, email, and message.", "error");
      firstInvalidField.focus();
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }
    setFormStatus("Sending your message...", "");

    try {
      const response = await fetch(formEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Portfolio Inquiry from ${name}`,
          _captcha: "false",
          _template: "table",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error("form_submit_failed");
      }

      setFormStatus("Message sent successfully. Thanks for reaching out.", "success");
      contactForm.reset();
    } catch (error) {
      setFormStatus(
        "Form delivery is unavailable right now. Opening your email client as fallback...",
        "error"
      );
      window.location.href = buildMailtoUrl(name, email, message);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}
