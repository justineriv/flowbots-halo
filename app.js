/* FlowBots — shared behaviour for the Halo and Obsidian directions.

   Motion model (one switch, deliberately simple):
   `html.motion-on` is set by the inline head script. EVERY decorative
   animation is defined under that class, and the motion-off state is the
   finished, fully visible layout. So dropping the class can never leave
   content hidden — which is the failure this project has hit twice. */
(function () {
  var motion = document.documentElement.classList.contains('motion-on');

  /* Every failsafe funnels through here. `js-rv` is the scroll-reveal
     switch; if motion is being abandoned the reveal must be abandoned
     with it, or content below the fold stays at opacity 0 forever. */
  var standDown = function () {
    document.documentElement.classList.remove('motion-on');
    document.documentElement.classList.remove('js-rv');
  };

  /* Failsafe 1 — the hero.
     If the hero has not reached full opacity shortly after load, drop
     motion-on so the page falls back to its finished state rather than
     sitting mid-animation. */
  if (motion) {
    var probe = document.querySelector('.hero h1');
    if (probe) {
      setTimeout(function () {
        if (parseFloat(getComputedStyle(probe).opacity) < 0.9) {
          standDown();
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
          standDown();
          return;
        }
      }
    }, 1500);
  }

  /* ============================================================
     SCROLL REVEAL — Halo and Obsidian both use it.

     Each element rises 24px and fades in as it reaches the viewport.
     Siblings in a row are staggered 80ms apart so a card grid
     cascades rather than landing as one block.

     WHY THE HIDDEN STATE IS SET FROM HERE AND NOT FROM CSS:
     nothing in the HTML or the stylesheet carries `js-rv`. This block
     adds it only after it has built a working IntersectionObserver and
     found something to observe. No JavaScript, an older browser, a
     thrown error, reduced motion, or ?motion=off all leave the class
     off, and every element renders at full opacity in its final
     position. A watchdog strips it again if anything on screen is
     still hidden 1.5s later. This project has shipped invisible
     content twice; CSS is never allowed to hide anything on its own.
     ============================================================ */
  (function () {
    /* The head script arms `js-rv` before first paint. Every path out of
       this block that does NOT set up the reveal has to disarm it again,
       or the class would sit there with nothing to reveal. */
    var off = function () { document.documentElement.classList.remove('js-rv'); };
    /* The head script decides who gets the reveal, and only emits its
       arming script on pages that want it. Reading the class here instead
       of testing the skin keeps that decision in one place. */
    if (!document.documentElement.classList.contains('js-rv')) return;
    if (!motion) return off();
    if (!('IntersectionObserver' in window)) return off();

    var sections = document.querySelectorAll('main .sec, main .logos, main .close');
    if (!sections.length) return off();

    var STAGGER = 140, MAX_STEPS = 8;
    /* How far up from the bottom the reveal line sits, as a fraction of the
       viewport. The observer and the watchdog BOTH read it, so they cannot
       drift apart: a watchdog that judged "on screen" while the observer
       waited for this line would disarm the whole system 3.6s after load,
       every time, on any screen showing an element that had not reached the
       line yet. */
    var LINE = 0.80;
    var targets = [];

    var kidsOf = function (el) {
      return Array.prototype.filter.call(el.children, function (c) {
        return c.nodeType === 1 && !/^(SCRIPT|STYLE|BR)$/.test(c.tagName);
      });
    };
    /* A "simple" child holds at most a couple of elements — a heading with
       one span, a paragraph, a button. A run of those reads as lines of a
       block and cascades well. */
    var simple = function (el) { return kidsOf(el).length <= 2; };
    var laidOut = function (el) {
      var d = getComputedStyle(el).display;
      return d.indexOf('grid') > -1 || d.indexOf('flex') > -1;
    };
    /* The marquee track and the console feed run their own transforms.
       Never hand them a second one. `.lead-ok` starts hidden and is shown
       by the form handler, so it must not depend on a scroll event that
       already happened. */
    var SKIP = /(^|\s)(lg-track|feed|lead-ok)(\s|$)/;

    var add = function (el, i) {
      if (SKIP.test(el.getAttribute('class') || '')) return;
      el.classList.add('rv');
      if (i) el.style.setProperty('--rvd', Math.min(i, MAX_STEPS) * STAGGER + 'ms');
      targets.push(el);
    };

    Array.prototype.forEach.call(sections, function (sec) {
      var wrap = sec;
      kidsOf(sec).forEach(function (c) {
        if ((c.getAttribute('class') || '').split(/\s+/).indexOf('wrap') > -1) wrap = c;
      });
      kidsOf(wrap).forEach(function (child) {
        var kids = kidsOf(child);
        var cascade = kids.length >= 2 && kids.length <= 16 &&
                      (laidOut(child) || kids.every(simple));
        if (cascade) kids.forEach(add); else add(child, 0);
      });
    });
    if (!targets.length) return off();

    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('rv-in');
        seen.unobserve(e.target);
      });
      /* The trigger line sits 20% up from the bottom, not on the bottom
         edge. At -6% an element began moving the instant it poked into
         view and had finished before it reached anywhere near the reading
         line, so on a normal scroll the motion was over before you looked
         at it. Now it starts once the element is properly on screen. */
    }, { rootMargin: '0px 0px -' + Math.round((1 - LINE) * 100) + '% 0px', threshold: 0 });

    document.documentElement.classList.add('js-rv');   /* idempotent */
    targets.forEach(function (el) { seen.observe(el); });

    /* Watchdog. Two separate failures are caught: an element on screen the
       observer never marked, and an element it did mark that never became
       visible because the transition stalled. Either one abandons the whole
       system and leaves the page plainly visible.

       It runs 2.6s after load AND 2.6s after scrolling stops, until one
       run has actually inspected something and found it healthy. A single
       load-time check is not enough: on a phone the hero fills the screen,
       so at load there is nothing below it to inspect, and a broken
       observer would go unnoticed until the reader had already scrolled
       into a page of invisible text. */
    var settled = false, timer = null;

    var verify = function () {
      var inspected = false;
      for (var i = 0; i < targets.length; i++) {
        var el = targets[i], r = el.getBoundingClientRect();
        /* Same geometry the observer uses. Judging anything the observer
           has not been asked to fire for yet would report a false failure. */
        if (r.top >= window.innerHeight * LINE || r.bottom <= 0 || r.height <= 2) continue;
        inspected = true;
        if (!el.classList.contains('rv-in') ||
            parseFloat(getComputedStyle(el).opacity) < 0.9) { off(); return true; }
      }
      return inspected;   /* true also means: stop checking */
    };

    var schedule = function () {
      if (settled) return;
      clearTimeout(timer);
      /* The longest legitimate reveal is a 1120ms stagger plus a 950ms
         transition, so 3.6s leaves room on a slow device. */
      timer = setTimeout(function () { if (!settled && verify()) settled = true; }, 3600);
    };
    /* A trigger line 20% up from the bottom means an element sitting in
       the last fifth of the page can never cross it, because the page has
       run out of scroll. At the bottom, reveal whatever is left. */
    var atBottom = function () {
      if (window.innerHeight + window.scrollY <
          document.documentElement.scrollHeight - 4) return;
      targets.forEach(function (el) { el.classList.add('rv-in'); });
    };

    schedule();
    window.addEventListener('scroll', function () { atBottom(); schedule(); },
                            { passive: true });
  })();

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
