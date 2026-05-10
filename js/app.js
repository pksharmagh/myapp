/**
 * App Module - Main Entry Point
 * Initializes all modules and sets up the application.
 */

import { initParticles } from './particles.js';
import { initAnimations } from './animations.js';
import { registerRoute, navigate, initRouter } from './router.js';
import { renderMemoryBuilder } from './memory-builder.js';

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
 * Set up navigation visibility
 */
function setupNavigation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  // Show nav on scroll past hero
  function updateNavVisibility() {
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
    return '<section class="section section--centered"><div class="container"><h2 class="section__title">Timeline</h2><p class="section__content">A timeline of memories...</p></div></section>';
  });

  registerRoute('#/food', () => {
    return '<section class="section section--centered"><div class="container"><h2 class="section__title">Food Memories</h2><p class="section__content">Meals that shaped us...</p></div></section>';
  });

  registerRoute('#/places', () => {
    return '<section class="section section--centered"><div class="container"><h2 class="section__title">Places</h2><p class="section__content">The places that hold our stories...</p></div></section>';
  });

  registerRoute('#/tribute', () => {
    return '<section class="section section--centered"><div class="container"><h2 class="section__title">Tribute</h2><p class="section__content">A tribute to her...</p></div></section>';
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
