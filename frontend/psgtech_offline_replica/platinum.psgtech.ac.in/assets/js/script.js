document.addEventListener("DOMContentLoaded", () => {
  // Create Menu Toggle Button
  const menuToggle = document.createElement("button");
  menuToggle.classList.add("menu-toggle");
  menuToggle.innerHTML = "☰";
  menuToggle.classList.add("text-dark");

  const header = document.querySelector(".header");
  if (header) {
    header.appendChild(menuToggle);
  }

  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Custom Cursor Effect
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY + window.scrollY}px`;
  });

  // Ripple Effect on Mouse Drag
  document.addEventListener("mousemove", createRipple);
  function createRipple(e) {
    const ripple = document.createElement("div");
    ripple.classList.add("ripple");
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }

  // Header Color Change on Scroll
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    let dropdowns = document.querySelectorAll(".dropdown-toggle");

    // Toggle dropdown on click (for mobile)
    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent link navigation
        this.parentElement.classList.toggle("open");
      });
    });

    // Close dropdown when scrolling (only on mobile)
    window.addEventListener("scroll", function () {
      if (window.innerWidth <= 768) {
        // Apply only for mobile screens
        document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
          dropdown.classList.remove("open");
        });
      }
    });
  });

  // GSAP Header Animation
  // gsap.from(".logo-container", { opacity: 0, y: -50, duration: 1 });
  // gsap.from(".nav-links li", { opacity: 0, y: -20, duration: 1, stagger: 0.2 });

  // Parallax Effect for Hero Section
  // document.addEventListener("scroll", function () {
  //   let scrollTop = window.scrollY;
  //   let parallaxText = document.querySelector(".parallax-text");
  //   if (parallaxText) {
  //     parallaxText.style.transform = `translateY(${scrollTop * 0.5}px)`;
  //   }
  //   if (parallaxText) {
  //     parallaxText.style.transform = "none"; // Stops movement
  //   }
  // });

  // Vertical Marquee for News Section
  const newsList = document.querySelector(".news-list");
  if (newsList) {
    const newsItems = newsList.children;
    const itemHeight = newsItems[0].offsetHeight;

    gsap.to(newsList, {
      y: `-${itemHeight * (newsItems.length - 1)}px`,
      duration: 10,
      ease: "linear",
      repeat: -1,
      yoyo: true,
      paused: false,
    });

    newsList.addEventListener("mouseenter", () => gsap.globalTimeline.pause());
    newsList.addEventListener("mouseleave", () => gsap.globalTimeline.resume());
  }

  // GSAP Animations 
  gsap.from(".big-text", { opacity: 0, y: 50, duration: 1.2 });
  gsap.from(".jubilee-text", { opacity: 0, y: 70, duration: 1.4 });
  gsap.from(".updates-box", {
    opacity: 0,
    scale: 0.9,
    duration: 1.5,
    delay: 0.5,
  });

  gsap.from(".image-container", { opacity: 0, x: -100, duration: 1 });
  gsap.from(".content-column .sec-title", {
    opacity: 0,
    x: 100,
    duration: 1.2,
  });
  gsap.from(".text", { opacity: 0, y: 30, duration: 1.3, delay: 0.3 });
  gsap.from(".theme-btn", {
    // opacity: 0,
    scale: 0.8,
    duration: 1.3,
    delay: 0.5,
  });

  // History Section Reveal on Scroll
  const historySection = document.querySelector(".history-section");
  if (historySection) {
    function revealOnScroll() {
      const sectionPosition = historySection.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.2;
      if (sectionPosition < screenPosition) {
        historySection.classList.add("visible");
      }
    }
    window.addEventListener("scroll", revealOnScroll);
  }

  // Vertical Scrolling for News Cards
//   const newsContainer = document.querySelector(".news-container");
//   const newsCards = document.querySelectorAll(".news-card");
//   if (newsContainer && newsCards.length > 0) {
//     let cardHeight = newsCards[0].offsetHeight;
//     const tl = gsap.timeline({
//       repeat: -1,
//       defaults: { duration: 1, ease: "power2.inOut" },
//     });
//     newsCards.forEach((_, index) => {
//       tl.to(newsList, { y: -(index * cardHeight), duration: 1.5 }).to(
//         newsList,
//         {},
//         "+=3"
//       );
//     });
//     tl.to(newsList, { y: 0, duration: 1.5 });
//   }
});

