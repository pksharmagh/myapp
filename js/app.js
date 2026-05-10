/**
 * App Module - Main Entry Point
 * Initializes all modules and sets up the application.
 */

import { initParticles } from './particles.js';
import { initAnimations } from './animations.js';
import { registerRoute, navigate, initRouter } from './router.js';
import { renderMemoryBuilder } from './memory-builder.js';
import { renderTimeline } from './timeline-viewer.js';
import { renderFoodMemories } from './food-memories.js';
import { renderPlaceMemories } from './place-memories.js';
import { renderTribute } from './tribute.js';

/**
 * Toggle visibility of landing page elements based on route
 */
function updateLandingVisibility() {
  const hash = window.location.hash || '#/';
  const hero = document.getElementById('hero');
  const landingSections = document.getElementById('landing-sections');
  const isLanding = hash === '#/' || hash === '';

  if (hero) {
    hero.style.display = isLanding ? '' : 'none';
  }
  if (landingSections) {
    landingSections.style.display = isLanding ? '' : 'none';
  }
}

/**
 * Set up the landing page interactions
 */
function setupLanding() {
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('#/journey');
    });
  }
}

/**
 * Set up navigation visibility and hamburger menu
 */
function setupNavigation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const hamburger = nav.querySelector('.nav__hamburger');
  const navLinks = nav.querySelector('.nav__links');

  // Hamburger menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('nav__links--open');
      hamburger.classList.toggle('nav__hamburger--open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when a link is clicked
    navLinks.addEventListener('click', function (e) {
      if (e.target.classList.contains('nav__link')) {
        navLinks.classList.remove('nav__links--open');
        hamburger.classList.remove('nav__hamburger--open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Show/hide nav based on route and scroll
  function updateNavVisibility() {
    const hash = window.location.hash || '#/';

    // Always show nav on non-landing pages
    if (hash !== '#/') {
      nav.classList.remove('nav--hidden');
      nav.classList.add('nav--visible');
      return;
    }

    // On landing page, show nav on scroll past hero
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;

    if (scrollY > heroHeight * 0.5) {
      nav.classList.remove('nav--hidden');
      nav.classList.add('nav--visible');
    } else {
      nav.classList.add('nav--hidden');
      nav.classList.remove('nav--visible');
    }
  }

  window.addEventListener('scroll', updateNavVisibility, { passive: true });
  window.addEventListener('hashchange', updateNavVisibility);
  updateNavVisibility();
}

/**
 * Register all routes
 */
function setupRoutes() {
  registerRoute('#/', () => {
    // Landing page is the default state - no dynamic content swap needed
    return '';
  });

  registerRoute('#/journey', () => {
    return renderMemoryBuilder();
  });

  registerRoute('#/timeline', () => {
    return renderTimeline();
  });

  registerRoute('#/food', () => {
    return renderFoodMemories();
  });

  registerRoute('#/places', () => {
    return renderPlaceMemories();
  });

  registerRoute('#/tribute', () => {
    return renderTribute();
  });
}

/**
 * Initialize the application
 */
function init() {
  // Initialize visual effects
  initParticles();
  initAnimations();

  // Set up interactions
  setupLanding();
  setupNavigation();

  // Set up routing
  setupRoutes();
  initRouter('#app-content');

  // Toggle landing visibility on route change
  window.addEventListener('hashchange', function () {
    updateLandingVisibility();
  });

  // Set initial visibility
  updateLandingVisibility();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
