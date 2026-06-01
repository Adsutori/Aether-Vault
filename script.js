(() => {
  const floatingHeader = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const revealEls = document.querySelectorAll(".reveal");

  const layers = document.querySelectorAll(".layer");
  const blobs = document.querySelectorAll(".liquid-blob");
  const cursorGlow = document.querySelector(".cursor-glow");
  const tiltEls = document.querySelectorAll(".tilt");
  const magneticEls = document.querySelectorAll(".magnetic");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Floating nav visibility
  const onScroll = () => {
    const show = window.scrollY > Math.max(window.innerHeight * 0.25, 160);
    floatingHeader.classList.toggle("is-visible", show);
    floatingHeader.setAttribute("aria-hidden", show ? "false" : "true");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open");
    });

    navMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const inside = navMenu.contains(t) || navToggle.contains(t);
      if (!inside && navMenu.classList.contains("is-open")) {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Reveal
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (prefersReducedMotion) return;

  // Cursor glow
  window.addEventListener("pointermove", (e) => {
    if (!cursorGlow) return;
    cursorGlow.style.setProperty("--mx", `${e.clientX}px`);
    cursorGlow.style.setProperty("--my", `${e.clientY}px`);
  }, { passive: true });

  // Organic layer drift (pointer + micro-noise)
  let px = 0, py = 0;
  let sx = 0, sy = 0;
  let t = 0;

  const seeds = Array.from(blobs).map(() => ({
    ax: Math.random() * 1000,
    ay: Math.random() * 1000,
    ar: Math.random() * 1000
  }));

  window.addEventListener("pointermove", (e) => {
    px = (e.clientX / window.innerWidth - 0.5) * 2;
    py = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const animate = () => {
    t += 0.008;

    sx += (px - sx) * 0.06;
    sy += (py - sy) * 0.06;

    layers.forEach((layer, i) => {
      const depth = Number(layer.getAttribute("data-depth") || 0.04);
      const nx = Math.sin(t * (0.6 + i * 0.07)) * 0.8;
      const ny = Math.cos(t * (0.5 + i * 0.08)) * 0.8;
      const lx = sx * -18 * depth + nx;
      const ly = sy * -14 * depth + ny;
      layer.style.setProperty("--lx", `${lx}px`);
      layer.style.setProperty("--ly", `${ly}px`);
    });

    blobs.forEach((blob, i) => {
      const s = seeds[i];
      const nx = Math.sin(t * 0.9 + s.ax) * 6 + Math.sin(t * 0.33 + s.ay) * 4;
      const ny = Math.cos(t * 0.8 + s.ay) * 6 + Math.cos(t * 0.29 + s.ax) * 4;
      const rot = Math.sin(t * 0.45 + s.ar) * 4;

      const tx = sx * -10 + nx;
      const ty = sy * -8 + ny;

      blob.style.setProperty("--tx", `${tx.toFixed(2)}px`);
      blob.style.setProperty("--ty", `${ty.toFixed(2)}px`);
      blob.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
    });

    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  // Tilt
  tiltEls.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (py - 0.5) * -6;
      const ry = (px - 0.5) * 8;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });

  // Magnetic elements
  magneticEls.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "translate(0,0)";
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
