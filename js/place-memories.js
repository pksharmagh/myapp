/**
 * Place Memories Module
 * Renders an abstract visual memory map with place markers and connection paths.
 */

import { getAllMemories } from './memory-store.js';
import { stages } from './data/stages.js';
import { escapeHtml, escapeAttr } from './utils.js';

/**
 * Render the place memories view
 * @returns {HTMLElement}
 */
export function renderPlaceMemories() {
  const container = document.createElement('div');
  container.className = 'places';

  const allMemories = getAllMemories();

  // Collect all locations from memories
  const locationMap = new Map();

  for (const stage of stages) {
    const stageMemories = allMemories[stage.id] || [];
    for (const memory of stageMemories) {
      const location = memory.location && memory.location.trim();
      if (location) {
        if (!locationMap.has(location)) {
          locationMap.set(location, []);
        }
        locationMap.get(location).push({ ...memory, stage });
      }
    }
  }

  // Header
  const header = document.createElement('div');
  header.className = 'places__header';
  header.innerHTML = `
    <h1 class="places__title">Places That Hold Our Stories</h1>
    <p class="places__subtitle">A constellation of locations that shaped who you are, connected by the invisible threads of memory.</p>
  `;
  container.appendChild(header);

  // Empty state
  if (locationMap.size === 0) {
    const empty = document.createElement('div');
    empty.className = 'places-empty';
    empty.innerHTML = `
      <div class="places-empty__icon">\u{1F5FA}\u{FE0F}</div>
      <h2 class="places-empty__title">No places mapped yet</h2>
      <p class="places-empty__text">
        Every memory lives somewhere. When you add location details to your memories in the journey builder, 
        they will appear here as points on your personal map.
      </p>
    `;
    container.appendChild(empty);
    return container;
  }

  // Abstract map
  const map = document.createElement('div');
  map.className = 'places__map';

  // SVG connections
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'places__connections');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  map.appendChild(svg);

  // Markers container
  const markersContainer = document.createElement('div');
  markersContainer.className = 'places__markers';

  for (const [location, memories] of locationMap) {
    const marker = document.createElement('div');
    marker.className = 'place-marker';
    marker.dataset.location = location;

    marker.innerHTML = `
      <div class="place-marker__circle">
        <span class="place-marker__icon">\u{1F4CD}</span>
        <span class="place-marker__count">${memories.length}</span>
      </div>
      <span class="place-marker__label">${escapeHtml(location)}</span>
    `;

    marker.addEventListener('click', () => openPlaceDetail(container, location, memories));
    markersContainer.appendChild(marker);
  }

  map.appendChild(markersContainer);
  container.appendChild(map);

  // Draw connection paths after render
  setTimeout(() => drawConnections(svg, markersContainer), 100);

  // Overlay for detail panel
  const overlay = document.createElement('div');
  overlay.className = 'places__overlay';
  overlay.addEventListener('click', () => closePlaceDetail(container));
  container.appendChild(overlay);

  // Detail panel
  const detail = document.createElement('div');
  detail.className = 'place-detail';
  detail.innerHTML = `
    <button class="place-detail__close" aria-label="Close">\u00D7</button>
    <h2 class="place-detail__title"></h2>
    <p class="place-detail__count"></p>
    <div class="place-detail__memories"></div>
  `;
  detail.querySelector('.place-detail__close').addEventListener('click', () => closePlaceDetail(container));
  container.appendChild(detail);

  return container;
}

/**
 * Draw SVG connection paths between place markers
 */
function drawConnections(svg, markersContainer) {
  const markers = markersContainer.querySelectorAll('.place-marker');
  if (markers.length < 2) return;

  const containerRect = markersContainer.getBoundingClientRect();
  const points = [];

  for (const marker of markers) {
    const rect = marker.getBoundingClientRect();
    points.push({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    });
  }

  // Draw curved paths between sequential points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const cpx = (p1.x + p2.x) / 2;
    const cpy = Math.min(p1.y, p2.y) - 30;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${cpx} ${cpy} ${p2.x} ${p2.y}`);
    svg.appendChild(path);
  }
}

/**
 * Open the place detail panel
 */
function openPlaceDetail(container, location, memories) {
  const detail = container.querySelector('.place-detail');
  const overlay = container.querySelector('.places__overlay');

  detail.querySelector('.place-detail__title').textContent = location;
  detail.querySelector('.place-detail__count').textContent = `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} from this place`;

  const memoriesList = detail.querySelector('.place-detail__memories');
  memoriesList.innerHTML = '';

  for (const memory of memories) {
    const memoryEl = document.createElement('div');
    memoryEl.className = 'place-detail__memory';

    let photoHtml = '';
    if (memory.photo) {
      photoHtml = `<img class="place-detail__memory-photo" src="${escapeAttr(memory.photo)}" alt="${escapeAttr(memory.title || 'Memory')}">`;
    }

    const description = memory.description || memory.text || '';
    const snippet = description.length > 200 ? description.substring(0, 200) + '...' : description;

    memoryEl.innerHTML = `
      <h3 class="place-detail__memory-title">${escapeHtml(memory.title || 'Untitled')}</h3>
      <p class="place-detail__memory-text">${escapeHtml(snippet)}</p>
      ${photoHtml}
    `;

    memoriesList.appendChild(memoryEl);
  }

  detail.classList.add('place-detail--open');
  overlay.classList.add('places__overlay--visible');
}

/**
 * Close the place detail panel
 */
function closePlaceDetail(container) {
  const detail = container.querySelector('.place-detail');
  const overlay = container.querySelector('.places__overlay');

  if (detail) detail.classList.remove('place-detail--open');
  if (overlay) overlay.classList.remove('places__overlay--visible');
}

export default { renderPlaceMemories };
