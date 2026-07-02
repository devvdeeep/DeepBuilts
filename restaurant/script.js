(function () {
  "use strict";

  /* ============ LOADER ============ */
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    if (loader) {
      setTimeout(function () {
        loader.classList.add("hidden");
        // Remove from DOM after transition
        setTimeout(function () { loader.remove(); }, 700);
      }, 2200);
    }
  });

  /* ============ STICKY NAV ============ */
  var navbar = document.getElementById("navbar");
  var lastScroll = 0;

  function handleNavScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (y > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    lastScroll = y;
  }
  window.addEventListener("scroll", handleNavScroll, { passive: true });

  /* ============ MOBILE NAV TOGGLE ============ */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
    });

    // Close on link click
    var links = navLinks.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function () {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }
  }

  /* ============ SCROLL REVEAL ============ */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealOnScroll() {
    var reveals = document.querySelectorAll(".reveal:not(.revealed)");
    for (var i = 0; i < reveals.length; i++) {
      var el = reveals[i];
      var rect = el.getBoundingClientRect();
      var triggerPoint = window.innerHeight * 0.88;
      if (rect.top < triggerPoint) {
        el.classList.add("revealed");
      }
    }
  }

  if (reduceMotion) {
    // Instantly reveal all
    var all = document.querySelectorAll(".reveal");
    for (var j = 0; j < all.length; j++) all[j].classList.add("revealed");
  } else {
    window.addEventListener("scroll", revealOnScroll, { passive: true });
    revealOnScroll(); // Initial check
  }

  /* ============ ANIMATED COUNTERS ============ */
  var countersStarted = false;

  function animateCounters() {
    if (countersStarted) return;
    var counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    var firstCounter = counters[0];
    var rect = firstCounter.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.9) return;

    countersStarted = true;

    for (var i = 0; i < counters.length; i++) {
      (function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10);
        var duration = 2000;
        var start = 0;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          // Ease out quad
          var eased = 1 - (1 - progress) * (1 - progress);
          var current = Math.floor(eased * target);
          el.textContent = current.toLocaleString("en-IN");
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = target.toLocaleString("en-IN");
          }
        }
        requestAnimationFrame(step);
      })(counters[i]);
    }
  }

  window.addEventListener("scroll", animateCounters, { passive: true });
  animateCounters();

  /* ============ MENU TABS ============ */
  var tabs = document.querySelectorAll(".menu-tab");
  var panels = document.querySelectorAll(".menu-panel");

  for (var t = 0; t < tabs.length; t++) {
    (function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        // Remove active from all tabs and panels
        for (var a = 0; a < tabs.length; a++) {
          tabs[a].classList.remove("active");
          tabs[a].setAttribute("aria-selected", "false");
        }
        for (var b = 0; b < panels.length; b++) {
          panels[b].classList.remove("active");
        }
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var panel = document.querySelector('[data-panel="' + target + '"]');
        if (panel) panel.classList.add("active");
      });
    })(tabs[t]);
  }

  /* ============ GALLERY LIGHTBOX ============ */
  var galleryItems = document.querySelectorAll(".gallery-item");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lightboxPrev = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
  var lightboxNext = lightbox ? lightbox.querySelector(".lightbox-next") : null;
  var currentLightboxIndex = 0;
  var galleryImages = [];

  // Collect gallery data
  for (var g = 0; g < galleryItems.length; g++) {
    var img = galleryItems[g].querySelector("img");
    var overlay = galleryItems[g].querySelector(".gallery-overlay span");
    galleryImages.push({
      src: img ? img.src : "",
      alt: img ? img.alt : "",
      caption: overlay ? overlay.textContent : ""
    });
  }

  function openLightbox(index) {
    if (!lightbox || !galleryImages[index]) return;
    currentLightboxIndex = index;
    lightboxImg.src = galleryImages[index].src;
    lightboxImg.alt = galleryImages[index].alt;
    if (lightboxCaption) lightboxCaption.textContent = galleryImages[index].caption;
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("active");
    });
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    setTimeout(function () {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }, 400);
  }

  function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[currentLightboxIndex].src;
    lightboxImg.alt = galleryImages[currentLightboxIndex].alt;
    if (lightboxCaption) lightboxCaption.textContent = galleryImages[currentLightboxIndex].caption;
  }

  function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentLightboxIndex].src;
    lightboxImg.alt = galleryImages[currentLightboxIndex].alt;
    if (lightboxCaption) lightboxCaption.textContent = galleryImages[currentLightboxIndex].caption;
  }

  for (var gi = 0; gi < galleryItems.length; gi++) {
    (function (idx) {
      galleryItems[idx].addEventListener("click", function () { openLightbox(idx); });
    })(gi);
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", prevImage);
  if (lightboxNext) lightboxNext.addEventListener("click", nextImage);

  // Close on background click
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });

  /* ============ BACK TO TOP ============ */
  var backToTop = document.getElementById("backToTop");

  function handleBackToTop() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (backToTop) {
      if (y > 600) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }
  }

  window.addEventListener("scroll", handleBackToTop, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============ FLOATING RESERVE BUTTON ============ */
  var floatingReserve = document.getElementById("floatingReserve");
  var reservationSection = document.getElementById("reservation");

  function handleFloatingReserve() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (!floatingReserve) return;

    // Show after hero, hide when near reservation section
    var resTop = reservationSection ? reservationSection.getBoundingClientRect().top + y - 300 : Infinity;
    if (y > 500 && y < resTop) {
      floatingReserve.classList.add("visible");
    } else {
      floatingReserve.classList.remove("visible");
    }
  }

  window.addEventListener("scroll", handleFloatingReserve, { passive: true });

  /* ============ RESERVATION FORM ============ */
  var reservationForm = document.getElementById("reservationForm");
  var formSuccess = document.getElementById("formSuccess");

  // Set min date to today
  var dateInput = document.getElementById("resDate");
  if (dateInput) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    dateInput.setAttribute("min", yyyy + "-" + mm + "-" + dd);
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Basic validation
      var inputs = reservationForm.querySelectorAll("[required]");
      var valid = true;
      for (var v = 0; v < inputs.length; v++) {
        if (!inputs[v].value.trim()) {
          valid = false;
          inputs[v].style.borderColor = "#e53e3e";
          inputs[v].addEventListener("input", function () {
            this.style.borderColor = "";
          }, { once: true });
        }
      }

      if (!valid) return;

      // Show success
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      // Reset form after delay
      setTimeout(function () {
        reservationForm.reset();
        if (formSuccess) formSuccess.hidden = true;
      }, 5000);
    });
  }

  /* ============ ACTIVE NAV LINK HIGHLIGHTING ============ */
  var sections = document.querySelectorAll("section[id]");
  var navLinksList = document.querySelectorAll(".nav-links a:not(.nav-cta)");

  function highlightNav() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    for (var s = 0; s < sections.length; s++) {
      var section = sections[s];
      var sectionTop = section.offsetTop - 120;
      var sectionHeight = section.offsetHeight;
      var sectionId = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        for (var n = 0; n < navLinksList.length; n++) {
          navLinksList[n].style.color = "";
          if (navLinksList[n].getAttribute("href") === "#" + sectionId) {
            navLinksList[n].style.color = "var(--gold)";
          }
        }
      }
    }
  }

  window.addEventListener("scroll", highlightNav, { passive: true });

  /* ============ PARALLAX HERO SHAPES (subtle) ============ */
  if (!reduceMotion) {
    window.addEventListener("mousemove", function (e) {
      var shapes = document.querySelectorAll(".hero-shape");
      var x = (e.clientX / window.innerWidth - 0.5) * 20;
      var y = (e.clientY / window.innerHeight - 0.5) * 20;
      for (var p = 0; p < shapes.length; p++) {
        var factor = (p + 1) * 0.5;
        shapes[p].style.transform = "translate(" + (x * factor) + "px, " + (y * factor) + "px)";
      }
    }, { passive: true });
  }

})();
