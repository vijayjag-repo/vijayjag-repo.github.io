/* No dependencies.
   Behaviors: nav scroll-spy + sliding underline, reveal-on-scroll,
   scroll progress bar, cursor spotlight, terminal card typing + tilt.
   Everything respects prefers-reduced-motion; no-JS visitors get
   the full static page. */
(function () {
  'use strict';

  document.body.classList.add('js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* --- Scroll-spy -------------------------------------------------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var list = document.querySelector('.site-nav__links');
  var indicator = document.querySelector('.site-nav__indicator');
  var nav = document.querySelector('.site-nav');
  var progress = document.querySelector('.scroll-progress');
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

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
    if (!indicator) return;
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

  function paintProgress() {
    if (!progress) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progress.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      moveIndicator(activeLink());
      paintProgress();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  paintProgress();
  onScroll();

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

  /* --- Cursor spotlight --------------------------------------------- */

  var spot = document.querySelector('.spotlight');

  if (spot && finePointer && !reducedMotion) {
    var mx = window.innerWidth / 2;
    var my = window.innerHeight * 0.35;
    var sx = mx;
    var sy = my;
    var spotRaf = null;

    function spotTick() {
      sx += (mx - sx) * 0.08;
      sy += (my - sy) * 0.08;
      spot.style.transform = 'translate3d(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px,0)';
      if (Math.abs(mx - sx) > 0.5 || Math.abs(my - sy) > 0.5) {
        spotRaf = window.requestAnimationFrame(spotTick);
      } else {
        spotRaf = null;
      }
    }

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      spot.classList.add('is-on');
      if (spotRaf == null) spotRaf = window.requestAnimationFrame(spotTick);
    }, { passive: true });
  }

  /* --- Theme toggle -------------------------------------------------- */

  var themeBtn = document.getElementById('theme-toggle');
  var metaTheme = document.getElementById('meta-theme');

  function applyTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    if (metaTheme) metaTheme.setAttribute('content', next === 'light' ? '#f4efe6' : '#0c0b09');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
    try { localStorage.setItem('theme', next); } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      if (document.startViewTransition && !reducedMotion) {
        document.startViewTransition(function () { applyTheme(next); });
      } else {
        applyTheme(next);
      }
    });
  }

  /* --- Card glow ----------------------------------------------------- */

  if (finePointer && !reducedMotion) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
      });
    });
  }

  /* --- Terminal card: tilt ------------------------------------------ */

  var tiltEl = document.querySelector('[data-tilt]');

  if (tiltEl && finePointer && !reducedMotion) {
    tiltEl.addEventListener('mousemove', function (e) {
      var r = tiltEl.getBoundingClientRect();
      var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      var rx = (py - 0.5) * -6;
      var ry = (px - 0.5) * 8;
      tiltEl.style.transform =
        'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
    tiltEl.addEventListener('mouseleave', function () {
      tiltEl.style.transform = '';
    });
  }

  /* --- Terminal card: typing ---------------------------------------- */

  var cmds = Array.prototype.slice.call(document.querySelectorAll('[data-type]'));
  var rest = document.querySelector('.term__rest');

  if (!cmds.length || !rest) return;

  var cursor = document.createElement('span');
  cursor.className = 'term__cursor';
  cursor.setAttribute('aria-hidden', 'true');

  function revealOutputs(cmd) {
    var el = cmd.parentElement.nextElementSibling;
    var delay = 0;
    while (el && !el.classList.contains('term__line')) {
      if (el.classList.contains('term__out')) {
        (function (node, d) {
          window.setTimeout(function () { node.classList.add('is-done'); }, d);
        })(el, delay);
        delay += 110;
      }
      el = el.nextElementSibling;
    }
  }

  function restCursor() {
    rest.appendChild(cursor);
  }

  if (reducedMotion) {
    cmds.forEach(function (cmd) { revealOutputs(cmd); });
    restCursor();
  } else {
    /* store original text before JS touches anything */
    cmds.forEach(function (cmd) { cmd.setAttribute('data-text', cmd.textContent); });
    var queue = cmds.slice();
    cmds.forEach(function (cmd) { cmd.textContent = ''; });

    window.setTimeout(function run() {
      var cmd = queue.shift();
      if (!cmd) { restCursor(); return; }
      var text = cmd.getAttribute('data-text');
      cmd.textContent = '';
      var txt = document.createTextNode('');
      cmd.appendChild(txt);
      cmd.appendChild(cursor);
      var i = 0;
      (function step() {
        if (i < text.length) {
          txt.data += text.charAt(i++);
          window.setTimeout(step, 42 + Math.random() * 46);
        } else {
          revealOutputs(cmd);
          window.setTimeout(run, 300);
        }
      })();
    }, 600);
  }
})();
