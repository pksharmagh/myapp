/**
 * Timeline Viewer Module
 * Renders an animated vertical timeline of all memories sorted by life stage.
 */

import { getAllMemories } from './memory-store.js';
import { stages } from './data/stages.js';
import { generateMotherPerspective } from './ai-engine.js';

const cinematicQuotes = [
  'She measured your life in meals cooked and prayers whispered.',
  'The distance between you was never measured in miles, but in longing.',
  'Every goodbye at the door was a small death she never spoke of.',
  'Her hands remember what your mind forgot.',
  'Some love is so quiet, you only hear it in the silence it leaves behind.',
  'She built a world for you, brick by invisible brick.',
  'Time passed, but her kitchen always waited.',
  'The train that took you away also carried a piece of her heart.',
  'She never asked you to stay. That was her greatest sacrifice.',
  'In every city you lived, she lived through your voice on the phone.'
];

/**
 * Render the timeline view
 * @returns {HTMLElement}
 */
export function renderTimeline() {
  const container = document.createElement('div');
  container.className = 'timeline-wrapper';

  const allMemories = getAllMemories();
  const flatMemories = [];

  // Collect all memories sorted by stage order
  for (const stage of stages) {
    const stageMemories = allMemories[stage.id] || [];
    const sorted = [...stageMemories].sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const memory of sorted) {
      flatMemories.push({ ...memory, stage });
    }
  }

  // Empty state
  if (flatMemories.length === 0) {
    container.innerHTML = `
      <div class="timeline__empty">
        <div class="timeline__empty-icon">\u{1F54A}\u{FE0F}</div>
        <h2 class="timeline__empty-title">Your timeline awaits</h2>
        <p class="timeline__empty-text">
          Every story has a beginning. Start building your memory journey, 
          and watch your life unfold here as a beautiful timeline.
        </p>
        <a href="#/journey" class="timeline__empty-link">Start your journey</a>
      </div>
    `;
    return container;
  }

  // Build timeline
  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  // Connecting line
  const line = document.createElement('div');
  line.className = 'timeline__line';
  timeline.appendChild(line);

  let currentStageId = null;
  let quoteIndex = 0;
  let itemIndex = 0;

  for (const memory of flatMemories) {
    // Insert quote between stage groups
    if (memory.stage.id !== currentStageId && currentStageId !== null) {
      const quote = document.createElement('div');
      quote.className = 'timeline__quote animate-on-scroll';
      quote.innerHTML = `
        <p class="timeline__quote-text">"${cinematicQuotes[quoteIndex % cinematicQuotes.length]}"</p>
      `;
      timeline.appendChild(quote);
      quoteIndex++;
    }
    currentStageId = memory.stage.id;

    // Timeline item
    const side = itemIndex % 2 === 0 ? 'left' : 'right';
    const item = document.createElement('div');
    item.className = `timeline__item timeline__item--${side} animate-on-scroll`;

    // Node on the line
    const node = document.createElement('div');
    node.className = 'timeline__node';
    node.style.top = `${item.offsetTop}px`;

    // Card content
    const description = memory.description || memory.text || '';
    const snippet = description.length > 150 ? description.substring(0, 150) + '...' : description;
    const perspective = generateMotherPerspective(description || memory.title || '', memory.stageId);

    let photoHtml = '';
    if (memory.photo) {
      photoHtml = `<img class="timeline__photo" src="${memory.photo}" alt="${memory.title || 'Memory photo'}">`;
    }

    item.innerHTML = `
      <div class="timeline__card">
        <span class="timeline__badge">${memory.stage.icon} ${memory.stage.title}</span>
        ${photoHtml}
        <h3 class="timeline__title">${memory.title || 'Untitled Memory'}</h3>
        <p class="timeline__description">${snippet}</p>
        <blockquote class="timeline__perspective">${perspective}</blockquote>
      </div>
    `;

    timeline.appendChild(item);
    itemIndex++;
  }

  container.appendChild(timeline);

  // Initialize scroll after a microtask to ensure DOM is ready
  setTimeout(() => initTimelineScroll(), 50);

  return container;
}

/**
 * Initialize scroll progress bar and intersection observers for timeline
 */
function initTimelineScroll() {
  // Create progress bar
  let progressBar = document.querySelector('.timeline-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.className = 'timeline-progress';
    document.body.appendChild(progressBar);
  }

  // Update progress bar on scroll
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Intersection Observer for reveal animations
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  const items = document.querySelectorAll('.timeline__item, .timeline__quote');
  for (const item of items) {
    observer.observe(item);
  }
}

export default { renderTimeline };
