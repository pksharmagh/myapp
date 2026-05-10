/**
 * Tribute Module
 * Renders a cinematic final tribute experience with summary, photo montage, and tribute card.
 */

import { getAllMemories } from './memory-store.js';
import { generateSummary, generateTribute, generateTitle } from './ai-engine.js';
import { stages } from './data/stages.js';

/**
 * Render the tribute view
 * @returns {HTMLElement}
 */
export function renderTribute() {
  const container = document.createElement('div');
  container.className = 'tribute';

  const allMemories = getAllMemories();

  // Flatten all memories
  const flatMemories = [];
  for (const stage of stages) {
    const stageMemories = allMemories[stage.id] || [];
    for (const memory of stageMemories) {
      flatMemories.push({ ...memory, stage });
    }
  }

  // Empty state
  if (flatMemories.length === 0) {
    container.innerHTML = `
      <div class="tribute__empty">
        <div class="tribute__empty-icon">\u{2728}</div>
        <h2 class="tribute__empty-title">Your tribute is waiting</h2>
        <p class="tribute__empty-text">
          Build your memory journey first. Once you have memories to share, 
          this space will transform into a beautiful cinematic tribute to the woman 
          who shaped your story.
        </p>
      </div>
    `;
    return container;
  }

  // Section 1: Cinematic Title
  const title = generateTitle(flatMemories);
  const titleSection = document.createElement('section');
  titleSection.className = 'tribute__section';
  titleSection.innerHTML = `<h1 class="tribute__title">${title}</h1>`;
  container.appendChild(titleSection);

  // Section 2: Life Summary
  const summary = generateSummary(flatMemories);
  const summarySection = document.createElement('section');
  summarySection.className = 'tribute__section';
  summarySection.innerHTML = `<div class="tribute__summary">${summary}</div>`;
  container.appendChild(summarySection);

  // Section 3: Photo Montage
  const photos = flatMemories
    .filter((m) => m.photo)
    .map((m) => m.photo);

  const montageSection = document.createElement('section');
  montageSection.className = 'tribute__section';

  if (photos.length > 0) {
    const montage = document.createElement('div');
    montage.className = 'tribute__montage';
    for (const photo of photos) {
      const img = document.createElement('img');
      img.className = 'tribute__montage-photo';
      img.src = photo;
      img.alt = 'Memory photo';
      montage.appendChild(img);
    }
    montageSection.appendChild(montage);
  } else {
    montageSection.innerHTML = `<p class="tribute__montage-empty">Your photo memories will appear here as a montage.</p>`;
  }
  container.appendChild(montageSection);

  // Section 4: Tribute Card
  const tributeText = generateTribute(flatMemories);
  const closingLine = 'No matter how far life carried you, some hands still waited to feed you.';

  const cardSection = document.createElement('section');
  cardSection.className = 'tribute__section';
  cardSection.innerHTML = `
    <div class="tribute__card">
      <div class="tribute__card-text">${tributeText}</div>
      <p class="tribute__card-closing">${closingLine}</p>
    </div>
  `;
  container.appendChild(cardSection);

  // Section 5: Download/Print
  const closingSection = document.createElement('section');
  closingSection.className = 'tribute__closing';
  closingSection.innerHTML = `
    <p class="tribute__closing-text">This is your story. Preserve it.</p>
    <button class="tribute__download-btn" type="button">Print / Download Tribute</button>
  `;

  const downloadBtn = closingSection.querySelector('.tribute__download-btn');
  downloadBtn.addEventListener('click', () => {
    window.print();
  });

  container.appendChild(closingSection);

  return container;
}

export default { renderTribute };
