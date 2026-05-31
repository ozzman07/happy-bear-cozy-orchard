/* Age Gate */
(function () {
  if (/underage\.html/.test(window.location.pathname)) return;
  var gate = document.getElementById('age-gate');
  if (!gate) return;
  if (!localStorage.getItem('hbc-age-ok')) {
    gate.style.display = 'flex';
  }
  document.getElementById('age-yes').onclick = function () {
    localStorage.setItem('hbc-age-ok', '1');
    gate.style.opacity = '0';
    gate.style.transition = 'opacity .4s';
    setTimeout(function () { gate.style.display = 'none'; }, 420);
  };
  document.getElementById('age-no').onclick = function () {
    window.location.href = 'underage.html';
  };
}());

/* Mobile nav */
(function () {
  var btn = document.querySelector('.nav-hamburger');
  var links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}());

/* Scroll fade-in */
(function () {
  var els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  if (!window.IntersectionObserver) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function (el) { obs.observe(el); });
}());

/* Page transitions */
(function () {
  document.querySelectorAll('a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|http)/.test(href)) return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var target = href;
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(-6px)';
      document.body.style.transition = 'opacity .25s, transform .25s';
      setTimeout(function () { window.location.href = target; }, 260);
    });
  });
}());

/* Active nav link */
(function () {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}());
