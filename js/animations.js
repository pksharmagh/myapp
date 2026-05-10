/**
 * Animations Module
 * Intersection Observer for scroll-based reveal animations
 * and scroll progress tracking.
 */

let scrollProgress = 0;

/**
 * Initialize Intersection Observer for scroll animations
 */
export function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .animate-on-scroll--left, .animate-on-scroll--right, .animate-on-scroll--scale');

  if (animatedElements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  animatedElements.forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Track scroll progress as a value between 0 and 1
 */
export function initScrollProgress() {
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    document.documentElement.style.setProperty('--scroll-progress', scrollProgress.toString());
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
}

/**
 * Get the current scroll progress (0 to 1)
 */
export function getScrollProgress() {
  return scrollProgress;
}

/**
 * Initialize all animation systems
 */
export function initAnimations() {
  initScrollAnimations();
  initScrollProgress();
}

export default initAnimations;
