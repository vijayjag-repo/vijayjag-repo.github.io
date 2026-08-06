(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Scroll-spy: highlight the nav link + glide the shared indicator ---
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
  var navList = document.querySelector(".site-nav__links");
  var indicator = document.getElementById("nav-indicator");
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  function moveIndicator(link) {
    if (!indicator || !navList || !link) return;
    var listBox = navList.getBoundingClientRect();
    var linkBox = link.getBoundingClientRect();
    indicator.style.width = linkBox.width + "px";
    indicator.style.transform = "translateX(" + (linkBox.left - listBox.left) + "px)";
    indicator.classList.add("is-active");
  }

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = navLinks.find(function (l) {
            return l.getAttribute("href") === "#" + entry.target.id;
          });
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.removeAttribute("aria-current"); });
            link.setAttribute("aria-current", "true");
            moveIndicator(link);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  window.addEventListener("resize", function () {
    var active = navLinks.find(function (l) { return l.getAttribute("aria-current") === "true"; });
    if (active) moveIndicator(active);
  });

  // --- Reveal-on-scroll for section blocks -------------------------------
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var reveal = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { reveal.observe(el); });
  }

  // --- Hero role typewriter ------------------------------------------------
  var typewriterEl = document.getElementById("typewriter");
  var ROLE_TEXT = "Software Engineer · Bangalore, India";

  if (typewriterEl) {
    if (reduceMotion) {
      typewriterEl.textContent = ROLE_TEXT;
    } else {
      var i = 0;
      var typeStep = function () {
        typewriterEl.textContent = ROLE_TEXT.slice(0, i);
        i++;
        if (i <= ROLE_TEXT.length) {
          setTimeout(typeStep, 28 + Math.random() * 26);
        }
      };
      setTimeout(typeStep, 550);
    }
  }

  // --- Magnetic hover: nudges links toward the cursor ---------------------
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    var magnets = Array.prototype.slice.call(document.querySelectorAll("[data-magnetic]"));
    magnets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var box = el.getBoundingClientRect();
        var relX = e.clientX - (box.left + box.width / 2);
        var relY = e.clientY - (box.top + box.height / 2);
        el.style.transform = "translate(" + (relX * 0.25).toFixed(1) + "px, " + (relY * 0.35).toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  // --- Tilt: project cards lean toward the cursor -------------------------
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    var tiltEls = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
    tiltEls.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var box = el.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        var py = (e.clientY - box.top) / box.height - 0.5;
        var rotateX = (-py * 8).toFixed(2);
        var rotateY = (px * 8).toFixed(2);
        el.style.transform =
          "perspective(800px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  // --- Hero artwork: a small generative node graph ------------------------
  var artEl = document.getElementById("hero-art");
  if (artEl) {
    var NS = "http://www.w3.org/2000/svg";
    var W = 320, H = 320;
    var rand = mulberry32(20260806);

    var nodes = [];
    var NODE_COUNT = 14;
    for (var n = 0; n < NODE_COUNT; n++) {
      nodes.push({
        x: 20 + rand() * (W - 40),
        y: 20 + rand() * (H - 40),
        r: 2 + rand() * 2.2
      });
    }

    // Connect each node to its 1-2 nearest neighbours for a sparse lattice.
    var edges = [];
    nodes.forEach(function (a, ai) {
      var dists = nodes
        .map(function (b, bi) { return { bi: bi, d: Math.hypot(a.x - b.x, a.y - b.y) }; })
        .filter(function (o) { return o.bi !== ai; })
        .sort(function (p, q) { return p.d - q.d; });
      var links = 1 + Math.floor(rand() * 2);
      for (var k = 0; k < links; k++) {
        var bi = dists[k].bi;
        var key = Math.min(ai, bi) + "-" + Math.max(ai, bi);
        if (edges.indexOf(key) === -1) edges.push(key);
      }
    });

    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var group = document.createElementNS(NS, "g");
    group.setAttribute("id", "hero-art-group");

    edges.forEach(function (key) {
      var parts = key.split("-");
      var a = nodes[+parts[0]], b = nodes[+parts[1]];
      var line = document.createElementNS(NS, "line");
      line.setAttribute("class", "edge");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      group.appendChild(line);
    });

    nodes.forEach(function (node, idx) {
      var circle = document.createElementNS(NS, "circle");
      circle.setAttribute("class", "node");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", node.r);
      circle.style.setProperty("--r", node.r);
      circle.style.animationDelay = (idx * 0.18).toFixed(2) + "s";
      group.appendChild(circle);
    });

    svg.appendChild(group);
    artEl.appendChild(svg);

    if (!reduceMotion) {
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var box = artEl.getBoundingClientRect();
          var progress = Math.max(-1, Math.min(1, (box.top) / window.innerHeight));
          group.setAttribute("transform", "translate(0, " + (progress * -14).toFixed(1) + ")");
          ticking = false;
        });
      }, { passive: true });
    }
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
})();
