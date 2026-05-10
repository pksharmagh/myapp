/**
 * Particles Module
 * Creates floating particle elements with CSS animations
 * for a warm, cinematic ambient effect.
 */

const PARTICLE_COUNT = 20;

const PARTICLE_COLORS = [
  'rgba(212, 165, 116, 0.3)',
  'rgba(232, 201, 160, 0.25)',
  'rgba(250, 247, 242, 0.35)',
  'rgba(212, 165, 116, 0.2)',
  'rgba(184, 137, 77, 0.2)'
];

/**
 * Generate a random number between min and max
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Create a single particle element
 */
function createParticle() {
  const particle = document.createElement('div');
  particle.classList.add('particle');

  const size = random(2, 6);
  const opacity = random(0.1, 0.4);
  const duration = random(15, 30);
  const delay = random(0, 15);
  const left = random(0, 100);
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${left}%`;
  particle.style.bottom = `-${size}px`;
  particle.style.backgroundColor = color;
  particle.style.setProperty('--particle-opacity', opacity.toString());
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;

  return particle;
}

/**
 * Initialize particles in the container
 */
export function initParticles() {
  const container = document.querySelector('.particles-container');
  if (!container) return;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = createParticle();
    container.appendChild(particle);
  }
}

export default initParticles;
