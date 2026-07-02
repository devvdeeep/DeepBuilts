(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var iconsLayer = document.getElementById("icons-layer");
  var logoText = document.getElementById("logo-text");
  var tagline = document.getElementById("tagline");
  var actions = document.getElementById("actions");
  var scrollIndicator = document.getElementById("scroll-indicator");

  var icons = Array.prototype.slice.call(document.querySelectorAll(".icon"));

  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // -------- Prepare every path for a hand-drawn reveal --------
  function preparePaths() {
    icons.forEach(function (icon) {
      var paths = icon.querySelectorAll("path.d");
      paths.forEach(function (path) {
        var len;
        try {
          len = path.getTotalLength();
        } catch (e) {
          len = 200;
        }
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      });
    });
  }

  // -------- Draw every illustration on the page at once --------
  function drawAllIcons() {
    icons.forEach(function (icon) {
      icon.querySelectorAll("path.d").forEach(function (path) {
        path.style.strokeDashoffset = "0";
      });
    });
    return delay(900).then(function () {
      icons.forEach(function (icon) { icon.classList.add("floating"); });
    });
  }

  // -------- Reduced-motion path: show everything instantly --------
  function skipToFinalState() {
    icons.forEach(function (icon) {
      icon.querySelectorAll("path.d").forEach(function (path) {
        path.style.transition = "none";
        path.style.strokeDashoffset = "0";
      });
    });
    logoText.classList.add("reveal");
    tagline.classList.add("show");
    actions.querySelectorAll(".btn").forEach(function (btn) {
      btn.classList.add("show");
    });
    scrollIndicator.classList.add("show");
  }

  // -------- Full storytelling timeline --------
  function runTimeline() {
    preparePaths();

    var sequence = Promise.resolve();

    sequence = sequence.then(function () { return delay(200); });
    sequence = sequence.then(function () { return drawAllIcons(); });

    sequence = sequence.then(function () {
      logoText.classList.add("reveal");
      return delay(500);
    });

    sequence = sequence.then(function () {
      tagline.classList.add("show");
      return delay(250);
    });

    sequence = sequence.then(function () {
      var btns = actions.querySelectorAll(".btn");
      btns.forEach(function (btn, i) {
        setTimeout(function () { btn.classList.add("show"); }, i * 90);
      });
      return delay(300);
    });

    sequence = sequence.then(function () {
      scrollIndicator.classList.add("show");
    });

    return sequence;
  }

  // -------- Subtle mouse parallax across the whole sketch layer --------
  function initParallax() {
    if (reduceMotion) return;

    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var maxShift = 10;

    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = nx * maxShift;
      targetY = ny * maxShift;
    });

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      iconsLayer.style.transform =
        "translate(" + curX.toFixed(2) + "px," + curY.toFixed(2) + "px)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // =====================================================
  // SCROLL-TRIGGERED REVEALS — about, cards, all sections
  // =====================================================

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal-up"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));

  function prepareCardPaths() {
    cards.forEach(function (card) {
      card.querySelectorAll("path.cd").forEach(function (path) {
        var len;
        try {
          len = path.getTotalLength();
        } catch (e) {
          len = 150;
        }
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      });
    });
  }

  function drawCardIcon(card) {
    card.querySelectorAll("path.cd").forEach(function (path) {
      path.style.strokeDashoffset = "0";
    });
  }

  function releaseCardAnimation(card) {
    card.addEventListener("animationend", function handler() {
      card.style.animation = "none";
      card.removeEventListener("animationend", handler);
    });
  }

  function initScrollReveals() {
    if (reduceMotion) {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
      cards.forEach(function (card) {
        card.classList.add("in-view");
        drawCardIcon(card);
      });
      return;
    }

    prepareCardPaths();
    cards.forEach(releaseCardAnimation);

    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
      cards.forEach(function (card) {
        card.classList.add("in-view");
        drawCardIcon(card);
      });
      return;
    }

    var textObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(function (el) { textObserver.observe(el); });

    var cardObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var index = +card.style.getPropertyValue("--i") || 0;
        card.classList.add("in-view");
        setTimeout(function () { drawCardIcon(card); }, 220 + index * 70);
        obs.unobserve(card);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    cards.forEach(function (card) { cardObserver.observe(card); });
  }

  // =====================================================
  // BACK TO TOP BUTTON
  // =====================================================

  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;

    var shown = false;
    var threshold = 600;

    function onScroll() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > threshold && !shown) {
        shown = true;
        btn.classList.add("visible");
      } else if (scrollY <= threshold && shown) {
        shown = false;
        btn.classList.remove("visible");
      }
    }

    // Throttle with rAF
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // =====================================================
  // HIDE SCROLL INDICATOR ON SCROLL
  // =====================================================

  function initScrollHide() {
    if (!scrollIndicator) return;
    var hidden = false;

    window.addEventListener("scroll", function () {
      if (!hidden && (window.pageYOffset || document.documentElement.scrollTop) > 100) {
        hidden = true;
        scrollIndicator.style.opacity = "0";
        scrollIndicator.style.transition = "opacity 0.5s ease";
      }
    }, { passive: true });
  }

  // =====================================================
  // BOOT
  // =====================================================

  document.addEventListener("DOMContentLoaded", function () {
    if (reduceMotion) {
      skipToFinalState();
    } else {
      runTimeline();
    }
    initParallax();
    initScrollReveals();
    initBackToTop();
    initScrollHide();
  });
})();
