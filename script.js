/* ═══════════════════════════════════════════════════════════════════════════
   NARENDRA LELLA PORTFOLIO — MAIN JAVASCRIPT FILE
   Handles animated dots background, navigation, scroll effects, and interactions
   ═══════════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────
const COLORS = {
  orange_bright: "#ff7a00",
  orange_light: "#ffb36b",
  blue_dark: "#0b4f6c",
  blue_bright: "#1b85b8",
  gray_light: "#f6f2ea",
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED DOTS BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

class DotBackground {
  constructor() {
    this.canvas = document.getElementById("dot-bg");
    this.ctx = this.canvas.getContext("2d");
    this.dots = [];
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.currentSection = null;
    this.targetLogo = null;
    this.hoverIntensity = 0;
    this.backendCard = null;
    this.formationDots = [];
    this.backendFormationActive = false;

    this.init();
  }

  init() {
    this.resizeCanvas();
    this.initDots();
    this.setupEventListeners();
    this.setupBackendCardFormation();
    this.animate();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initDots() {
    this.dots = [];
    // ~10% more dots by slightly reducing grid spacing.
    const spacing = 33;

    for (let y = 0; y < this.canvas.height; y += spacing) {
      for (let x = 0; x < this.canvas.width; x += spacing) {
        this.dots.push(
          new Dot(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5),
        );
      }
    }
  }

  setupEventListeners() {
    window.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.hoverIntensity = Math.min(1, this.hoverIntensity + 0.05);
    });

    window.addEventListener("mouseleave", () => {
      this.hoverIntensity = 0;
    });

    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.initDots();
      if (this.backendFormationActive) {
        this.updateBackendFormation();
      }
    });

    window.addEventListener("scroll", () => {
      if (this.backendFormationActive) {
        this.updateBackendFormation();
      }
    });
  }

  setupBackendCardFormation() {
    this.backendCard = document.getElementById("backend-card");
    if (!this.backendCard) return;

    this.backendCard.addEventListener("mouseenter", () => {
      this.backendFormationActive = true;
      this.updateBackendFormation();
    });

    this.backendCard.addEventListener("mouseleave", () => {
      this.backendFormationActive = false;
      this.clearFormationTargets();
    });
  }

  updateBackendFormation() {
    if (!this.backendCard) return;

    const rect = this.backendCard.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height) * 0.38;

    // Place the Python logo around the card (right side; fallback to left on small screens).
    let centerX = rect.right + size * 0.95;
    if (centerX + size > window.innerWidth - 20) {
      centerX = rect.left - size * 0.95;
    }
    const centerY = rect.top + rect.height * 0.5;

    const points = this.getPythonFormationPoints(centerX, centerY, size);
    this.assignDotsToPoints(points);
  }

  getPythonFormationPoints(cx, cy, size) {
    const points = [];
    const topCenter = { x: cx, y: cy - size * 0.55 };
    const bottomCenter = { x: cx, y: cy + size * 0.55 };
    const circleR = size * 0.38;

    const addCirclePoints = (center, count) => {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const radiusJitter = circleR * (0.9 + Math.random() * 0.15);
        points.push({
          x: center.x + Math.cos(angle) * radiusJitter,
          y: center.y + Math.sin(angle) * radiusJitter,
        });
      }
    };

    addCirclePoints(topCenter, 24);
    addCirclePoints(bottomCenter, 24);

    // Connector stem.
    const connectorHeight = size * 0.9;
    const connectorStep = size * 0.13;
    for (
      let y = cy - connectorHeight / 2;
      y <= cy + connectorHeight / 2;
      y += connectorStep
    ) {
      points.push({ x: cx - size * 0.08, y });
      points.push({ x: cx + size * 0.08, y });
    }

    // Accent dots similar to the two-tone python icon notches.
    points.push({ x: cx - size * 0.22, y: cy - size * 0.18 });
    points.push({ x: cx + size * 0.22, y: cy + size * 0.18 });

    return points;
  }

  assignDotsToPoints(points) {
    this.clearFormationTargets();

    const usedDotIndices = new Set();
    for (const point of points) {
      let bestDotIndex = -1;
      let bestDistance = Infinity;

      for (let i = 0; i < this.dots.length; i += 1) {
        if (usedDotIndices.has(i)) continue;
        const dot = this.dots[i];
        const dx = dot.x - point.x;
        const dy = dot.y - point.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < bestDistance) {
          bestDistance = distSq;
          bestDotIndex = i;
        }
      }

      if (bestDotIndex !== -1) {
        usedDotIndices.add(bestDotIndex);
        const dot = this.dots[bestDotIndex];
        dot.targetX = point.x;
        dot.targetY = point.y;
        this.formationDots.push(dot);
      }
    }
  }

  clearFormationTargets() {
    this.formationDots.forEach((dot) => {
      dot.targetX = null;
      dot.targetY = null;
    });
    this.formationDots = [];
  }

  detectCurrentSection() {
    const sections = document.querySelectorAll("section[data-logo]");
    let found = null;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (
        rect.top < window.innerHeight * 0.5 &&
        rect.bottom > window.innerHeight * 0.5
      ) {
        found = section.getAttribute("data-logo");
      }
    });

    return found;
  }

  drawLogo(logoType, centerX, centerY, scale) {
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);

    if (logoType === "python") {
      this.drawPythonLogo();
    } else if (logoType === "code") {
      this.drawCodeLogo();
    } else if (logoType === "react") {
      this.drawReactLogo();
    } else if (logoType === "aiml") {
      this.drawAIMLLogo();
    }

    this.ctx.restore();
  }

  drawPythonLogo() {
    // Python logo
    this.ctx.fillStyle = COLORS.blue_bright;
    this.ctx.strokeStyle = COLORS.orange_bright;
    this.ctx.lineWidth = 2;

    // Top circle
    this.ctx.beginPath();
    this.ctx.arc(0, -15, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Bottom circle
    this.ctx.beginPath();
    this.ctx.arc(0, 15, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Center connector
    this.ctx.fillRect(-3, -15, 6, 30);

    // Side accents
    this.ctx.fillStyle = COLORS.orange_bright;
    this.ctx.fillRect(-8, -8, 3, 16);
    this.ctx.fillRect(5, -8, 3, 16);
  }

  drawCodeLogo() {
    // </> Code brackets
    this.ctx.strokeStyle = COLORS.blue_bright;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    // < bracket
    this.ctx.beginPath();
    this.ctx.moveTo(-20, -15);
    this.ctx.lineTo(-5, 0);
    this.ctx.lineTo(-20, 15);
    this.ctx.stroke();

    // > bracket
    this.ctx.beginPath();
    this.ctx.moveTo(5, -15);
    this.ctx.lineTo(20, 0);
    this.ctx.lineTo(5, 15);
    this.ctx.stroke();

    // / slash
    this.ctx.strokeStyle = COLORS.orange_bright;
    this.ctx.beginPath();
    this.ctx.moveTo(-2, -15);
    this.ctx.lineTo(2, 15);
    this.ctx.stroke();
  }

  drawReactLogo() {
    // React atom with orbits
    this.ctx.strokeStyle = COLORS.orange_bright;
    this.ctx.lineWidth = 2.5;
    this.ctx.fillStyle = COLORS.blue_bright;

    // Central circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Three orbital paths
    for (let i = 0; i < 3; i++) {
      this.ctx.save();
      this.ctx.rotate((Math.PI * 2 * i) / 3);
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  drawAIMLLogo() {
    // AIML brain-like shape
    this.ctx.fillStyle = COLORS.blue_bright;
    this.ctx.strokeStyle = COLORS.orange_bright;
    this.ctx.lineWidth = 2;

    // Four corner circles
    this.ctx.beginPath();
    this.ctx.arc(-8, -10, 7, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(8, -10, 7, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(-8, 8, 7, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(8, 8, 7, 0, Math.PI * 2);
    this.ctx.fill();

    // Central connecting circle
    this.ctx.fillStyle = COLORS.orange_bright;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  animate() {
    const isDarkTheme =
      document.documentElement.getAttribute("data-theme") === "dark";
    const canvasBg = isDarkTheme ? "#0b1220" : "#ffffff";
    const dotColor = isDarkTheme ? "#ffb36b" : "#0b4f6c";

    // Clear canvas
    this.ctx.fillStyle = canvasBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw all dots
    this.dots.forEach((dot) => {
      dot.update(this.mouseX, this.mouseY, this.hoverIntensity);
      dot.draw(this.ctx, dotColor);
    });

    // Detect current section
    this.currentSection = this.detectCurrentSection();
    this.targetLogo = this.currentSection;

    // Decay hover intensity
    this.hoverIntensity *= 0.95;

    requestAnimationFrame(() => this.animate());
  }
}

class Dot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.radius = Math.random() * 1.4 + 0.8;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = (Math.random() - 0.5) * 0.2;
    this.offset = Math.random() * Math.PI * 2;
    this.targetX = null;
    this.targetY = null;
  }

  update(mouseX, mouseY, hoverIntensity) {
    if (this.targetX !== null && this.targetY !== null) {
      const tx = this.targetX - this.x;
      const ty = this.targetY - this.y;

      this.vx += tx * 0.08;
      this.vy += ty * 0.08;
      this.vx *= 0.78;
      this.vy *= 0.78;

      this.x += this.vx;
      this.y += this.vy;
      return;
    }

    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = 150;

    // Repel from mouse
    if (distance < minDistance) {
      const angle = Math.atan2(dy, dx);
      const force = (1 - distance / minDistance) * hoverIntensity * 2;
      this.vx -= Math.cos(angle) * force;
      this.vy -= Math.sin(angle) * force;
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.92;
    this.vy *= 0.92;

    // Return to base position
    const dx2 = this.baseX - this.x;
    const dy2 = this.baseY - this.y;
    this.x += dx2 * 0.04;
    this.y += dy2 * 0.04;

    // Floating motion
    this.y += Math.sin(Date.now() * 0.001 + this.offset) * 0.08;
    this.x += Math.cos(Date.now() * 0.0008 + this.offset) * 0.08;

    // Boundary wrap
    if (this.x < 0) this.x = window.innerWidth;
    if (this.x > window.innerWidth) this.x = 0;
    if (this.y < 0) this.y = window.innerHeight;
    if (this.y > window.innerHeight) this.y = 0;
  }

  draw(ctx, color) {
    // Main dot
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

class Navigation {
  constructor() {
    this.navbar = document.getElementById("navbar");
    this.hamburger = document.getElementById("hamburger");
    this.navLinks = document.querySelector(".nav-links");

    this.init();
  }

  init() {
    // Scroll effect
    window.addEventListener("scroll", () => {
      this.navbar.classList.toggle("scrolled", window.scrollY > 50);
      this.updateActiveLink();
    });

    // Hamburger menu
    this.hamburger.addEventListener("click", () => {
      this.hamburger.classList.toggle("active");
      this.navLinks.classList.toggle("open");
    });

    // Close menu on link click
    this.navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.hamburger.classList.remove("active");
        this.navLinks.classList.remove("open");
      });
    });
  }

  updateActiveLink() {
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-links a");
    let current = "";

    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 100) {
        current = sec.getAttribute("id");
      }
    });

    navItems.forEach((a) => {
      a.classList.remove("active");
      if (a.getAttribute("href") === `#${current}`) {
        a.classList.add("active");
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    // Skill bar animations
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
            const pct = bar.style.getPropertyValue("--pct");
            bar.style.width = pct;
          });
        }
      });
    });

    document.querySelectorAll(".skill-group").forEach((el) => {
      skillObserver.observe(el);
    });

    // Element reveal animations
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    });

    document
      .querySelectorAll(
        ".project-card, .about-card, .skill-group, .contact-info, .contact-form",
      )
      .forEach((el) => {
        el.classList.add("reveal");
        revealObserver.observe(el);
      });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORM HANDLING
// ═══════════════════════════════════════════════════════════════════════════

class ContactForm {
  constructor() {
    this.form = document.getElementById("contact-form");
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const btn = this.form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    // Success feedback
    btn.textContent = "✓ Message Sent!";
    btn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";

    // Reset after 3 seconds
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = "";
      this.form.reset();
    }, 3000);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

class ThemeToggle {
  constructor() {
    this.button = document.getElementById("theme-toggle");
    this.storageKey = "portfolio-theme";
    this.root = document.documentElement;

    if (!this.button) return;

    this.applySavedTheme();
    this.button.addEventListener("click", () => this.toggleTheme());
    this.updateButton();
  }

  applySavedTheme() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === "dark" || saved === "light") {
      this.root.setAttribute("data-theme", saved);
    }
  }

  toggleTheme() {
    const current =
      this.root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    this.root.setAttribute("data-theme", next);
    localStorage.setItem(this.storageKey, next);
    this.updateButton();
  }

  updateButton() {
    const isDark = this.root.getAttribute("data-theme") === "dark";
    this.button.innerHTML = isDark
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
    this.button.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  const themeToggle = new ThemeToggle();
  const dotBg = new DotBackground();
  const nav = new Navigation();
  const scrollAnims = new ScrollAnimations();
  const contactForm = new ContactForm();

  // Log initialization
  console.log("✓ Portfolio initialized successfully");
});
