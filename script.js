(() => {
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const featureCards = document.querySelectorAll(".feature-card");
  const heroBg = document.querySelector(".hero-bg");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sticky navbar scroll state
  const handleScroll = () => {
    if (window.scrollY > 18) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Mobile nav
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open");
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const inside = navMenu.contains(target) || navToggle.contains(target);
      if (!inside && navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Subtle hero background movement (very light)
  if (!prefersReducedMotion && heroBg) {
    let raf = null;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const animate = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      heroBg.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(1.01)`;

      if (Math.abs(tx - cx) > 0.03 || Math.abs(ty - cy) > 0.03) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    };

    window.addEventListener(
      "pointermove",
      (e) => {
        const xNorm = e.clientX / window.innerWidth - 0.5;
        const yNorm = e.clientY / window.innerHeight - 0.5;
        tx = xNorm * -8;
        ty = yNorm * -8;

        if (!raf) raf = requestAnimationFrame(animate);
      },
      { passive: true }
    );
  }

  // Feature card gloss tracking
  featureCards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      card.style.setProperty("--x", `${x}%`);
    });
  });

  // FAQ single-open behavior
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
