/* No dependencies. Two behaviors: nav scroll-spy with a sliding
   underline, and reveal-on-scroll. Both respect reduced motion. */
(function () {
  'use strict';

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var list = document.querySelector('.site-nav__links');
  var indicator = document.querySelector('.site-nav__indicator');
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Scroll-spy -------------------------------------------------- */

  var nav = document.querySelector('.site-nav');

  function activeLink() {
    var navBottom = window.scrollY + (nav ? nav.offsetHeight : 72) + 8; /* just past the sticky nav */
    var current = null;
    sections.forEach(function (section, i) {
      if (section.offsetTop <= navBottom) current = navLinks[i];
    });
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && navLinks.length) current = navLinks[navLinks.length - 1];
    return current;
  }

  function moveIndicator(link) {
    if (!link) {
      indicator.classList.remove('is-active');
      navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
      return;
    }
    var listRect = list.getBoundingClientRect();
    var rect = link.getBoundingClientRect();
    indicator.style.width = rect.width + 'px';
    indicator.style.transform = 'translateX(' + (rect.left - listRect.left) + 'px)';
    indicator.classList.add('is-active');
    navLinks.forEach(function (l) {
      if (l === link) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      moveIndicator(activeLink());
      ticking = false;
    });
  }

  if (sections.length && indicator) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* --- Reveal on scroll -------------------------------------------- */

  var revealables = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    revealables.forEach(function (el) { observer.observe(el); });
  }
})();
