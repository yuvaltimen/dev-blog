(function () {
  'use strict';

  // ============================================================
  // Dark Mode Toggle
  // ============================================================
  var toggle = document.getElementById('theme-toggle');
  var icon = toggle ? toggle.querySelector('.theme-toggle-icon') : null;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (icon) {
      icon.innerHTML = theme === 'dark' ? '&#9788;' : '&#9790;';
    }
  }

  // Initialize icon based on current state
  if (icon) {
    var current = document.documentElement.getAttribute('data-theme');
    icon.innerHTML = current === 'dark' ? '&#9788;' : '&#9790;';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ============================================================
  // Tag Filtering (blog page only)
  // ============================================================
  var tagButtons = document.querySelectorAll('.tag-filter-bar .tag');
  var postCards = document.querySelectorAll('#post-list .post-card');

  if (tagButtons.length > 0 && postCards.length > 0) {
    tagButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selectedTag = this.getAttribute('data-tag');

        // Update active state on buttons
        tagButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        // Filter cards
        postCards.forEach(function (card) {
          if (selectedTag === 'all') {
            card.style.display = '';
          } else {
            var cardTags = (card.getAttribute('data-tags') || '').split(',');
            card.style.display = cardTags.indexOf(selectedTag) !== -1 ? '' : 'none';
          }
        });
      });
    });
  }

  // ============================================================
  // Code Block Copy Button
  // ============================================================
  document.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code to clipboard');

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.textContent : pre.textContent;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      });
    });

    pre.style.position = 'relative';
    pre.appendChild(btn);
  });

  // ============================================================
  // Auto-hide Header on Scroll (post & project pages only)
  // Hides on scroll down once past threshold, shows instantly on scroll up.
  // ============================================================
  var autoHide = document.body.hasAttribute('data-autohide-header');
  var header = document.querySelector('.site-header');

  if (autoHide && header) {
    var lastScrollY = window.scrollY;
    var hideThreshold = 300; // px scrolled before hiding kicks in
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var currentScrollY = window.scrollY;

          if (currentScrollY > hideThreshold && currentScrollY > lastScrollY) {
            // Scrolling down past threshold — hide
            header.classList.add('header-hidden');
          } else {
            // Scrolling up (any amount) or near top — show
            header.classList.remove('header-hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ============================================================
  // Reading Progress Bar (post pages only)
  // ============================================================
  var progressBar = document.getElementById('reading-progress');

  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    });
  }

})();
