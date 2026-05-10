/**
 * Router Module
 * Hash-based SPA router with fade transitions between views.
 */

const routes = new Map();
let currentRoute = null;
let appContainer = null;
let transitionId = 0;

/**
 * Register a route with its handler
 * @param {string} path - The hash path (e.g., '#/' or '#/journey')
 * @param {Function} handler - Function that returns HTML string or DOM element for this route
 */
export function registerRoute(path, handler) {
  routes.set(path, handler);
}

/**
 * Navigate to a specific route
 * @param {string} path - The hash path to navigate to
 */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Get the current hash route
 */
function getCurrentHash() {
  const hash = window.location.hash || '#/';
  return hash;
}

/**
 * Handle route changes with fade transition
 */
async function handleRouteChange() {
  const hash = getCurrentHash();

  if (hash === currentRoute) return;
  currentRoute = hash;

  const handler = routes.get(hash);
  if (!handler) return;

  const myTransitionId = ++transitionId;

  if (appContainer) {
    // Fade out
    appContainer.style.opacity = '0';
    appContainer.style.transition = 'opacity 0.4s ease';

    await new Promise((resolve) => setTimeout(resolve, 400));

    // Bail if superseded by a newer transition
    if (myTransitionId !== transitionId) return;

    // Execute route handler
    const content = handler();
    if (typeof content === 'string') {
      appContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      appContainer.innerHTML = '';
      appContainer.appendChild(content);
    }

    // Fade in
    requestAnimationFrame(() => {
      appContainer.style.opacity = '1';
    });
  }
}

/**
 * Initialize the router
 * @param {string|HTMLElement} container - Container selector or element for route content
 */
export function initRouter(container) {
  if (typeof container === 'string') {
    appContainer = document.querySelector(container);
  } else {
    appContainer = container;
  }

  window.addEventListener('hashchange', handleRouteChange);

  // Handle initial route
  if (window.location.hash && window.location.hash !== '#/') {
    handleRouteChange();
  }
}

/**
 * Get all registered routes
 */
export function getRoutes() {
  return Array.from(routes.keys());
}

export default { registerRoute, navigate, initRouter, getRoutes };
