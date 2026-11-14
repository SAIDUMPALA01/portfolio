/* Sai Dumpala, portfolio. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- Intro loader: "runs" the six dimensions, then reveals the hero ---------- */
  (function intro() {
    var loader = $('.loader');
    function ready() {
      root.classList.remove('is-loading');
      root.classList.add('is-ready');
      try { sessionStorage.setItem('intro', '1'); } catch (e) {}
    }
    if (!root.classList.contains('is-loading') || !loader) { ready(); return; }
    var dims = $$('.loader__dims li', loader);
    var fill = $('.loader__bar span', loader);
    var step = 0;
    var tick = setInterval(function () {
      if (step < dims.length) {
        dims[step].classList.add('is-pass');
        step++;
        if (fill) fill.style.transform = 'scaleX(' + step / dims.length + ')';
        return;
      }
      clearInterval(tick);
      loader.classList.add('is-leaving');
      setTimeout(ready, 260);
    }, 150);
  })();

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Theme ---------- */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      store('theme', next);
    });
  });

  /* ---------- Toast ---------- */
  var toastEl = $('.toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  /* ---------- Copy buttons ---------- */
  var COPY = {
    email: 'Sai.Dumpalaa@gmail.com',
    bibtex: '@misc{dumpala2026sixdim,\n  author    = {Dumpala, Sai},\n  title     = {AI Model Performance in CV Generation and Consistency Testing: A Practical Six-Dimension Evaluation Framework},\n  year      = {2026},\n  publisher = {Zenodo},\n  doi       = {10.5281/zenodo.20102941}\n}'
  };
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-copy');
      copyText(COPY[key]).then(function () {
        toast(key === 'email' ? 'Email address copied' : 'BibTeX citation copied');
      }, function () { toast('Copy failed, please select the text manually'); });
    });
  });

  /* ---------- Nav: scrolled state, progress, active section ---------- */
  var nav = $('.nav');
  var bar = $('.progress span');
  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 8);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { sectionObs.observe(s); });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.nav__menu');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObs.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
    reveals.forEach(function (el) { revealObs.observe(el); });
  }

  /* ---------- Terminal replay (verbatim output from the READMEs) ---------- */
  var SCRIPTS = [
    {
      title: 'sixdim-eval',
      cmd: 'sixdim report results.jsonl',
      out: [
        ['m', '| Dimension               | Mean (1-5) |'],
        ['m', '|-------------------------|------------|'],
        ['', '| Completeness            | 4.33       |'],
        ['', '| Contextual utilisation  | 3.50       |'],
        ['', '| Factual accuracy        | 4.17       |'],
        ['', '| Confidence calibration  | 3.83       |'],
        ['', '| Specification adherence | 4.33       |'],
        ['', ''],
        ['', 'Lowest-scoring cases'],
        ['bad', "- cv-generic (3.00): completeness - placeholder text: '[Your Name]'"],
        ['bad', "- cv-fabricated-contacts (3.25): factual_accuracy - '+44 7700 900123' is not in the source"],
        ['bad', "- summary-invented-stat (3.60): factual_accuracy - '37%' is not in the source"]
      ]
    },
    {
      title: 'uk-visa-sponsor-mcp',
      cmd: 'sponsorcheck salary 2134 36000 --new-entrant',
      out: [
        ['', '2134 Programmers and software development professionals,'],
        ['bad', '£36,000, new_entrant route: DOES NOT MEET (short by £2,290)'],
        ['', '  - needs at least £38,290 (the higher of the amounts below)'],
        ['', '  - new-entrant floor £33,400'],
        ['', '  - 70% of the going rate = £38,290']
      ]
    },
    {
      title: 'sixdim-eval',
      cmd: 'sixdim agreement judge.jsonl --cases labelled.jsonl',
      out: [
        ['m', '| Dimension        | n | Exact | Within 1 | Kappa | TNR (fails found)    |'],
        ['m', '|------------------|---|-------|----------|-------|----------------------|'],
        ['', '| factual_accuracy | 6 | 0.33  | 0.83     | 0.73  | 0.67 (3 human fails) |'],
        ['', ''],
        ['m', '# TNR: the share of outputs humans failed that the judge also failed.']
      ]
    }
  ];

  var term = $('[data-term]');
  var termTitle = $('[data-term-title]');

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lineHTML(kind, text) {
    var cls = kind === 'm' ? 't-m' : kind === 'bad' ? 't-bad' : '';
    return cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text);
  }
  function renderStatic(s) {
    if (termTitle) termTitle.textContent = s.title;
    term.innerHTML = '<span class="t-p">$</span> ' + esc(s.cmd) + '\n' + s.out.map(function (l) { return lineHTML(l[0], l[1]); }).join('\n');
  }

  if (term) {
    if (reduceMotion) {
      renderStatic(SCRIPTS[0]);
    } else {
      var idx = 0;
      var visible = true;
      var running = false;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible && !running) play(); }).observe(term);
      }
      var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
      var play = function () {
        if (running) return;
        running = true;
        var s = SCRIPTS[idx % SCRIPTS.length];
        if (termTitle) termTitle.textContent = s.title;
        var typed = '';
        var head = '<span class="t-p">$</span> ';
        var chain = Promise.resolve();
        for (var i = 0; i < s.cmd.length; i++) {
          (function (ch) {
            chain = chain.then(function () {
              typed += ch;
              term.innerHTML = head + esc(typed) + '<span class="caret"></span>';
              return wait(28 + Math.random() * 40);
            });
          })(s.cmd[i]);
        }
        chain = chain.then(function () { return wait(380); });
        var outHTML = [];
        s.out.forEach(function (l) {
          chain = chain.then(function () {
            outHTML.push(lineHTML(l[0], l[1]));
            term.innerHTML = head + esc(s.cmd) + '\n' + outHTML.join('\n') + '\n<span class="caret"></span>';
            return wait(70);
          });
        });
        chain.then(function () { return wait(4200); }).then(function () {
          idx++;
          running = false;
          if (visible) play();
        });
      };
      play();
    }
  }

  /* ---------- Research chart (Experiment 1, paper/data/experiment1_model_comparison.csv) ---------- */
  var DATA = [
    { model: 'Claude Sonnet 4.6', comp: 4.8, ctx: 5.0, fact: 5.0, cal: 4.0, avg: 4.70 },
    { model: 'ChatGPT', comp: 4.0, ctx: 4.0, fact: 4.0, cal: 3.5, avg: 3.875 },
    { model: 'DeepSeek', comp: 3.5, ctx: 4.0, fact: 2.5, cal: 2.0, avg: 3.00 },
    { model: 'Blackbox AI', comp: 2.5, ctx: 3.0, fact: 3.0, cal: 2.5, avg: 2.75 }
  ];
  var DIM_LABEL = { avg: 'Average', comp: 'Completeness', ctx: 'Contextual utilisation', fact: 'Factual accuracy', cal: 'Confidence calibration' };
  var MAX = 5;

  var chart = $('[data-chart]');
  if (chart) {
    var barsEl = $('[data-bars]', chart);
    var axisEl = $('.chart__axis', chart);
    var tip = $('[data-tooltip]', chart);
    var tabs = $$('[data-dim]', chart);

    // Axis ticks 0..5 (bars start at zero so length is honest).
    axisEl.innerHTML = '';
    for (var t = 0; t <= MAX; t++) {
      var span = document.createElement('span');
      span.textContent = t;
      span.style.left = (t / MAX * 100) + '%';
      axisEl.appendChild(span);
    }

    var fmt = function (v, dim) { return dim === 'avg' ? v.toFixed(2) : v.toFixed(1); };

    var render = function (dim) {
      var rows = DATA.slice().sort(function (a, b) { return b[dim] - a[dim]; });
      var top = rows[0][dim];
      barsEl.innerHTML = '';
      rows.forEach(function (d) {
        var row = document.createElement('div');
        row.className = 'bar' + (d[dim] === top ? ' is-top' : '');
        row.setAttribute('role', 'img');
        row.setAttribute('aria-label', d.model + ': ' + fmt(d[dim], dim) + ' out of 5 for ' + DIM_LABEL[dim]);
        row.innerHTML =
          '<span class="bar__label">' + d.model + '</span>' +
          '<span class="bar__track"><span class="bar__fill"></span></span>' +
          '<span class="bar__val">' + fmt(d[dim], dim) + '</span>';
        barsEl.appendChild(row);
        var fill = $('.bar__fill', row);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { fill.style.width = (d[dim] / MAX * 100) + '%'; });
        });
        row.addEventListener('mousemove', function (ev) {
          var r = chart.getBoundingClientRect();
          tip.hidden = false;
          tip.textContent = d.model + ' · ' + DIM_LABEL[dim] + ': ' + fmt(d[dim], dim) + ' / 5';
          var x = Math.max(90, Math.min(r.width - 90, ev.clientX - r.left));
          tip.style.left = x + 'px';
          tip.style.top = (ev.clientY - r.top) + 'px';
        });
        row.addEventListener('mouseleave', function () { tip.hidden = true; });
      });
    };

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
        if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        render(btn.getAttribute('data-dim'));
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var i = tabs.indexOf(btn) + (e.key === 'ArrowRight' ? 1 : -1);
        var next = tabs[(i + tabs.length) % tabs.length];
        next.focus(); next.click();
      });
    });
    render('avg');
  }

  /* ---------- Hero dot field: grid points lift and glow near the cursor ---------- */
  (function field() {
    var canvas = $('.hero__field');
    if (!canvas || reduceMotion || !canvas.getContext) return;
    var hero = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    var GAP = 56;
    var dpr = 1, w = 0, h = 0, pts = [];
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var visible = true, raf = 0, t0 = performance.now();

    function colors() {
      var cs = getComputedStyle(root);
      return { dot: cs.getPropertyValue('--line-strong').trim(), hot: cs.getPropertyValue('--accent').trim() };
    }
    var col = colors();
    new MutationObserver(function () { col = colors(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (mq.addEventListener) mq.addEventListener('change', function () { col = colors(); });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (var y = GAP; y < h; y += GAP) for (var x = GAP; x < w; x += GAP) pts.push({ x: x, y: y });
    }
    function frame(now) {
      raf = 0;
      if (!visible) return;
      mouse.x += (mouse.tx - mouse.x) * 0.12;
      mouse.y += (mouse.ty - mouse.y) * 0.12;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var dx = p.x - mouse.x, dy = p.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / 220);                       // cursor influence 0..1
        var wave = 0.5 + 0.5 * Math.sin(t * 1.1 + p.x * 0.012 + p.y * 0.018);
        var fade = Math.max(0, 1 - p.y / (h * 0.95));          // fade towards the bottom
        var r = 1 + wave * 0.6 + k * 2.4;
        var ox = k ? (dx / (d || 1)) * k * 6 : 0;
        var oy = k ? (dy / (d || 1)) * k * 6 : 0;
        ctx.globalAlpha = (0.35 + wave * 0.25 + k * 0.6) * fade;
        ctx.fillStyle = k > 0.15 ? col.hot : col.dot;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.tx = -9999; mouse.ty = -9999; });
    window.addEventListener('resize', function () { resize(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; start(); });
    resize();
    start();
  })();

  /* ---------- Count-up stats ---------- */
  (function counters() {
    var nums = $$('[data-count]');
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        var el = entry.target;
        var end = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now(), dur = end > 10 ? 1400 : 700;
        var delay = root.classList.contains('is-ready') ? 200 : 1600;
        setTimeout(function () {
          (function step(now) {
            var p = Math.min(1, (now - start - delay) / dur);
            if (p < 0) { requestAnimationFrame(step); return; }
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * eased) + (p === 1 ? suffix : '');
            if (p < 1) requestAnimationFrame(step);
          })(performance.now());
        }, 0);
        el.textContent = '0';
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { obs.observe(n); });
  })();

  /* ---------- Cursor spotlight on cards ---------- */
  $$('.principle, .finding, .skill, .certs li, .dims li, .chart, .table-card').forEach(function (el) {
    el.classList.add('spot');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Quick navigation (Cmd/Ctrl + K) ---------- */
  var ITEMS = [
    { label: 'Selected work', hint: 'section', href: '#work' },
    { label: 'sixdim-eval', hint: 'project', href: '#sixdim-eval' },
    { label: 'ResuMetric', hint: 'project', href: '#resumetric' },
    { label: 'ResuMetric live demo', hint: 'external', href: 'https://saidumpala-resumetric.hf.space' },
    { label: 'docs-rag-eval', hint: 'project', href: '#docs-rag-eval' },
    { label: 'uk-visa-sponsor-mcp', hint: 'project', href: '#uk-visa-sponsor-mcp' },
    { label: 'Pneumonia CNN audit', hint: 'project', href: '#pneumonia-cnn' },
    { label: 'Research paper', hint: 'section', href: '#research' },
    { label: 'Read the paper (DOI)', hint: 'external', href: 'https://doi.org/10.5281/zenodo.20102941' },
    { label: 'How I work', hint: 'section', href: '#approach' },
    { label: 'Experience & education', hint: 'section', href: '#experience' },
    { label: 'Toolkit', hint: 'section', href: '#skills' },
    { label: 'Contact', hint: 'section', href: '#contact' },
    { label: 'Copy email address', hint: 'action', action: 'email' },
    { label: 'GitHub', hint: 'external', href: 'https://github.com/SAIDUMPALA01' },
    { label: 'LinkedIn', hint: 'external', href: 'https://www.linkedin.com/in/sai-dumpala' },
    { label: 'ORCID', hint: 'external', href: 'https://orcid.org/0009-0001-0260-0072' },
    { label: 'Switch colour theme', hint: 'action', action: 'theme' }
  ];

  var pal = $('[data-palette]');
  if (pal) {
    var input = $('.palette__input', pal);
    var list = $('.palette__list', pal);
    var results = ITEMS;
    var sel = 0;
    var lastFocus = null;

    var draw = function () {
      list.innerHTML = '';
      if (!results.length) {
        var li = document.createElement('li');
        li.className = 'empty';
        li.textContent = 'No matches';
        list.appendChild(li);
        return;
      }
      results.forEach(function (it, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === sel));
        li.innerHTML = '<span>' + esc(it.label) + '</span><small>' + it.hint + '</small>';
        li.addEventListener('mouseenter', function () { sel = i; mark(); });
        li.addEventListener('click', function () { run(it); });
        list.appendChild(li);
      });
    };
    var mark = function () {
      $$('li', list).forEach(function (li, i) { li.setAttribute('aria-selected', String(i === sel)); });
      var cur = list.children[sel];
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    };
    var openPal = function () {
      lastFocus = document.activeElement;
      pal.hidden = false;
      input.value = '';
      results = ITEMS; sel = 0; draw();
      input.focus();
    };
    var closePal = function () {
      pal.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    var run = function (it) {
      closePal();
      if (it.action === 'email') { copyText(COPY.email).then(function () { toast('Email address copied'); }); return; }
      if (it.action === 'theme') { $('[data-theme-toggle]').click(); return; }
      if (it.href.charAt(0) === '#') {
        var target = $(it.href);
        if (target) { target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); history.replaceState(null, '', it.href); }
      } else {
        window.open(it.href, '_blank', 'noopener');
      }
    };

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      results = !q ? ITEMS : ITEMS.filter(function (it) { return (it.label + ' ' + it.hint).toLowerCase().indexOf(q) !== -1; });
      sel = 0; draw();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Enter' && results[sel]) { e.preventDefault(); run(results[sel]); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    $$('[data-palette-open]').forEach(function (b) { b.addEventListener('click', openPal); });
    $$('[data-palette-close]', pal).forEach(function (b) { b.addEventListener('click', closePal); });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
      else if (e.key === 'Escape') {
        if (!pal.hidden) closePal();
        else if (menu && !menu.hidden) setMenu(false);
      }
    });
  }
})();
