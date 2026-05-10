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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
