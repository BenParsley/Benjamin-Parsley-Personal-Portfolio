document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('main section[id]');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarTogglerIcon = navbarToggler?.querySelector('.navbar-toggler-icon');

  const updateBodyNavState = (isOpen) => {
    document.body.classList.toggle('nav-open', isOpen);
  };

  const smoothScrollTo = (targetY, duration = 650) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const scrollToSection = (targetId) => {
    const targetSection = document.querySelector(targetId);

    if (!targetSection) {
      return;
    }

    const offset = window.innerWidth <= 991 ? 70 : 90;
    const targetY = window.pageYOffset + targetSection.getBoundingClientRect().top - offset;
    smoothScrollTo(Math.max(0, targetY));
  };

  const closeMenu = () => {
    if (!navbarCollapse || !navbarToggler) {
      return;
    }

    if (navbarCollapse.classList.contains('show')) {
      const bootstrapCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bootstrapCollapse) {
        bootstrapCollapse.hide();
      } else {
        navbarCollapse.classList.remove('show');
      }
    }

    updateBodyNavState(false);
  };

  if (navbarToggler && navbarTogglerIcon) {
    navbarToggler.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        closeMenu();
      } else {
        updateBodyNavState(true);
        navbarTogglerIcon.classList.add('navbar-toggler-icon-open');
      }
    });
  }

  if (navbarCollapse && navbarTogglerIcon) {
    navbarCollapse.addEventListener('show.bs.collapse', () => {
      updateBodyNavState(true);
      navbarTogglerIcon.classList.add('navbar-toggler-icon-open');
    });
    navbarCollapse.addEventListener('hidden.bs.collapse', () => {
      updateBodyNavState(false);
      navbarTogglerIcon.classList.remove('navbar-toggler-icon-open');
    });
  }

  [...navLinks, ...smoothScrollLinks].forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || !href.startsWith('#')) {
        return;
      }

      event.preventDefault();
      closeMenu();
      scrollToSection(href);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
        });
      });
    },
    {
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0.2,
    }
  );

  sections.forEach((section) => observer.observe(section));

  // Add a lock to prevent rapid toggling of collapse elements while they are animating
  const collapseTriggers = document.querySelectorAll('[data-bs-toggle="collapse"]');
  collapseTriggers.forEach(trigger => {
    // We only want to target the tech stack category toggles or similar custom toggles, not the navbar
    if (trigger.classList.contains('navbar-toggler')) return;

    const targetSelector = trigger.getAttribute('data-bs-target');
    if (!targetSelector) return;
    
    const targetEl = document.querySelector(targetSelector);
    let isAnimating = false;

    if (targetEl) {
      targetEl.addEventListener('show.bs.collapse', () => isAnimating = true);
      targetEl.addEventListener('hide.bs.collapse', () => isAnimating = true);
      targetEl.addEventListener('shown.bs.collapse', () => isAnimating = false);
      targetEl.addEventListener('hidden.bs.collapse', () => isAnimating = false);

      trigger.addEventListener('click', (e) => {
        if (isAnimating) {
          e.stopPropagation();
          e.preventDefault();
        }
      }, true); // Capturing phase to intercept before Bootstrap's delegated listener
    }
  });
});
