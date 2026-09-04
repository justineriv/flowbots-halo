/* FlowBots — shared behaviour for the Halo and Obsidian directions.

   Motion model (one switch, deliberately simple):
   `html.motion-on` is set by the inline head script. EVERY decorative
   animation is defined under that class, and the motion-off state is the
   finished, fully visible layout. So dropping the class can never leave
   content hidden — which is the failure this project has hit twice. */
(function () {
  var motion = document.documentElement.classList.contains('motion-on');

  /* Failsafe 1 — the hero.
     If the hero has not reached full opacity shortly after load, drop
     motion-on so the page falls back to its finished state rather than
     sitting mid-animation. */
  if (motion) {
    var probe = document.querySelector('.hero h1');
    if (probe) {
      setTimeout(function () {
        if (parseFloat(getComputedStyle(probe).opacity) < 0.9) {
          document.documentElement.classList.remove('motion-on');
        }
      }, 1200);
    }
  }

  /* Failsafe 2 — scroll-driven entrances.
     Failsafe 1 probes a time-based animation. Obsidian's .reveal system is
     scroll-driven (animation-timeline: view()), so a viewer whose scroll
     timeline never resolves would pass the hero check while everything
     below the fold sat at opacity 0. This watches a .reveal element that
     is actually on screen and drops motion-on if it is still invisible.
     It also watches the console feed items, whose entrance stagger is the
     other place content could be left at opacity 0. */
  if (motion) {
    setTimeout(function () {
      var els = document.querySelectorAll('.reveal, .hero .feed-item');
      for (var i = 0; i < els.length; i++) {
        var r = els[i].getBoundingClientRect();
        var isFeed = els[i].classList.contains('feed-item');
        var onScreen = isFeed ? r.height > 2
                              : (r.top < window.innerHeight * 0.8 && r.bottom > 0 && r.height > 2);
        if (onScreen && parseFloat(getComputedStyle(els[i]).opacity) < 0.9) {
          document.documentElement.classList.remove('motion-on');
          return;
        }
      }
    }, 1500);
  }

  /* Real scrollbar width, so a full-bleed element can span the viewport
     without 100vw pushing the page wider and creating horizontal scroll. */
  (function () {
    var setSbw = function () {
      var w = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--sbw', (w > 0 ? w : 0) + 'px');
    };
    setSbw();
    window.addEventListener('resize', setSbw, { passive: true });
  })();

  /* mobile nav */
  var toggle = document.querySelector('.nav-toggle, .pill-toggle');
  var menu = document.querySelector('.mobile-menu, .pill-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Numbers. Only the hero console counts up, and only when motion is on.
     Everywhere else the final value is written immediately. */
  var fmt = function (n, dp) {
    var p = n.toFixed(dp).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return p.join('.');
  };
  var finalValue = function (el) {
    var t = parseFloat(el.getAttribute('data-target'));
    var dp = (el.getAttribute('data-target').split('.')[1] || '').length;
    return (el.getAttribute('data-prefix') || '') + fmt(t, dp) +
           (el.getAttribute('data-suffix') || '');
  };
  document.querySelectorAll('.countup').forEach(function (el) {
    var inHero = !!el.closest('.hero, .hero-slab');
    if (!motion || !inHero) { el.textContent = finalValue(el); return; }
    var target = parseFloat(el.getAttribute('data-target'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var dp = (el.getAttribute('data-target').split('.')[1] || '').length;
    var start = null, dur = 1100, done = false;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = prefix + fmt(target * (1 - Math.pow(1 - p, 3)), dp) + suffix;
      if (p < 1) requestAnimationFrame(step); else done = true;
    };
    requestAnimationFrame(step);
    /* If rAF never advances, still land on the real number. */
    setTimeout(function () { if (!done) el.textContent = finalValue(el); }, 2000);
  });

  /* The console feed — hero only, motion only. Four visible at a time,
     the oldest rotating off every 3.2s. */
  var feed = document.querySelector('[data-feed]');
  if (feed && motion) {
    var items = Array.prototype.slice.call(feed.children);
    var VISIBLE = 4;
    items.forEach(function (el, i) {
      if (i >= VISIBLE) el.style.display = 'none';
      else el.style.animationDelay = (0.12 * i) + 's';
    });
    if (items.length > VISIBLE) {
      setInterval(function () {
        var first = feed.children[0];
        first.style.display = 'none';
        feed.appendChild(first);
        var next = feed.children[VISIBLE - 1];
        next.style.display = '';
        next.style.animation = 'none';
        void next.offsetWidth;
        next.style.animation = '';
        next.style.animationDelay = '0s';
      }, 3200);
    }
  } else if (feed) {
    /* Static: show the first four, no motion, nothing hidden. */
    Array.prototype.slice.call(feed.children).forEach(function (el, i) {
      if (i >= 4) el.style.display = 'none';
    });
  }

  /* Lead form. Validates and confirms. There is no backend: no lead is
     delivered anywhere. That is recorded in the README and is Brian's to
     resolve, not something this prototype should pretend to do. */
  var form = document.querySelector('[data-leadform]');
  if (form) {
    var success = document.querySelector('.lead-ok');
    var setErr = function (input, msg) {
      var err = document.getElementById(input.id + '-err');
      if (err) err.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      var name = form.querySelector('#lf-name');
      var email = form.querySelector('#lf-email');
      var problem = form.querySelector('#lf-problem');

      if (!name.value.trim()) { setErr(name, 'Please add your name.'); ok = false; firstBad = firstBad || name; }
      else setErr(name, '');

      if (!email.value.trim()) { setErr(email, 'Please add your work email.'); ok = false; firstBad = firstBad || email; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        setErr(email, 'That email address does not look right.'); ok = false; firstBad = firstBad || email;
      } else setErr(email, '');

      if (!problem.value) { setErr(problem, 'Pick the closest option.'); ok = false; firstBad = firstBad || problem; }
      else setErr(problem, '');

      if (!ok) { if (firstBad) firstBad.focus(); return; }

      if (window.dataLayer) window.dataLayer.push({ event: 'lead_submit' });
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead');

      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
  }

  /* Track CTA clicks through dataLayer/gtag. Both fire the moment a GA4 or
     GTM container is added; neither is configured yet. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    var name = el.getAttribute('data-track');
    if (window.dataLayer) window.dataLayer.push({ event: 'cta_click', cta: name });
    if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { cta: name });
  });

  /* Back to top */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    var onTop = function () { toTop.hidden = window.scrollY < 900; };
    onTop();
    window.addEventListener('scroll', onTop, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Sticky mobile CTA, from 520px of scroll. The hero CTA is on screen
     above that, so the booking action is available at every scroll depth. */
  var sticky = document.querySelector('.sticky-cta');
  if (sticky) {
    var onScroll = function () { sticky.classList.toggle('show', window.scrollY > 520); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Homepage-only presentation: the other templates are not built for these
     two directions, so links to them are inert. Deleting this block turns
     them all back on — every href is intact. */
  document.querySelectorAll('a[data-inert]').forEach(function (a) {
    a.setAttribute('role', 'link');
    a.setAttribute('aria-disabled', 'true');
    a.style.cursor = 'default';
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
})();
