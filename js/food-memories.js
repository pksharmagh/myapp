/**
 * Food Memories Module
 * Renders food-related memories with recipe-card aesthetic and emotional captions.
 */

import { getAllMemories, saveMemory } from './memory-store.js';
import { generateCaption } from './ai-engine.js';
import { stages } from './data/stages.js';

/**
 * Render the food memories view
 * @returns {HTMLElement}
 */
export function renderFoodMemories() {
  const container = document.createElement('div');
  container.className = 'food-memories';

  const allMemories = getAllMemories();

  // Collect food-related memories
  const foodItems = [];

  for (const stage of stages) {
    const stageMemories = allMemories[stage.id] || [];
    for (const memory of stageMemories) {
      // Memories with favFood field or from festivals-food stage
      if (memory.favFood && memory.favFood.trim()) {
        foodItems.push({
          dishName: memory.favFood,
          description: memory.description || memory.text || '',
          memoryTitle: memory.title || '',
          photo: memory.photo || null,
          stage: stage,
          type: inferFoodType(stage.id)
        });
      }
      if (stage.id === 'festivals-food' && !memory.favFood) {
        foodItems.push({
          dishName: memory.title || 'A dish from home',
          description: memory.description || memory.text || '',
          memoryTitle: memory.title || '',
          photo: memory.photo || null,
          stage: stage,
          type: 'festival'
        });
      }
    }
  }

  // Hero Section
  const hero = document.createElement('div');
  hero.className = 'food-hero';
  hero.innerHTML = `
    <h1 class="food-hero__title">Meals That Raised Us</h1>
    <p class="food-hero__subtitle">Every dish she cooked was a letter of love, written in spices and served with silence.</p>
  `;
  container.appendChild(hero);

  // Empty state
  if (foodItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'food-empty';
    empty.innerHTML = `
      <div class="food-empty__icon">\u{1F372}</div>
      <h2 class="food-empty__title">No food memories yet</h2>
      <p class="food-empty__text">
        The kitchen was where her love spoke loudest. Add your first food memory below, 
        or add your favorite dishes when building memories in your journey.
      </p>
    `;
    container.appendChild(empty);
  } else {
    // Group by type
    const groups = {
      everyday: foodItems.filter((f) => f.type === 'everyday'),
      festival: foodItems.filter((f) => f.type === 'festival'),
      comfort: foodItems.filter((f) => f.type === 'comfort')
    };

    if (groups.everyday.length > 0) {
      container.appendChild(renderFoodSection('Everyday Meals', groups.everyday));
    }
    if (groups.festival.length > 0) {
      container.appendChild(renderFoodSection('Festival Foods', groups.festival));
    }
    if (groups.comfort.length > 0) {
      container.appendChild(renderFoodSection('Comfort Foods', groups.comfort));
    }
  }

  // Add Food Memory Button
  const addBtn = document.createElement('button');
  addBtn.className = 'food-add-btn';
  addBtn.textContent = 'Add a Food Memory';
  addBtn.addEventListener('click', () => {
    const form = container.querySelector('.food-form');
    if (form) {
      form.classList.toggle('food-form--visible');
    }
  });
  container.appendChild(addBtn);

  // Inline Form
  const form = document.createElement('div');
  form.className = 'food-form';
  form.innerHTML = `
    <div class="food-form__group">
      <label class="food-form__label" for="food-dish-name">Dish Name</label>
      <input class="food-form__input" type="text" id="food-dish-name" placeholder="e.g., Dal Chawal, Roti, Biryani">
    </div>
    <div class="food-form__group">
      <label class="food-form__label" for="food-description">Tell us about this dish</label>
      <textarea class="food-form__textarea" id="food-description" placeholder="What makes this dish special? When did she make it?"></textarea>
    </div>
    <div class="food-form__group">
      <label class="food-form__label" for="food-occasion">Occasion</label>
      <input class="food-form__input" type="text" id="food-occasion" placeholder="e.g., Festival, Everyday, When sick, Birthday">
    </div>
    <button class="food-form__submit" type="button">Save Food Memory</button>
  `;

  const submitBtn = form.querySelector('.food-form__submit');
  submitBtn.addEventListener('click', () => {
    const dishName = form.querySelector('#food-dish-name').value.trim();
    const description = form.querySelector('#food-description').value.trim();
    const occasion = form.querySelector('#food-occasion').value.trim();

    if (!dishName) return;

    saveMemory('festivals-food', {
      title: dishName,
      description: description,
      favFood: dishName,
      occasion: occasion,
      text: description
    });

    // Reset form
    form.querySelector('#food-dish-name').value = '';
    form.querySelector('#food-description').value = '';
    form.querySelector('#food-occasion').value = '';
    form.classList.remove('food-form--visible');

    // Re-render
    const parent = container.parentElement;
    if (parent) {
      const newView = renderFoodMemories();
      parent.replaceChild(newView, container);
    }
  });

  container.appendChild(form);

  return container;
}

/**
 * Render a grouped food section
 */
function renderFoodSection(title, items) {
  const section = document.createElement('div');
  section.className = 'food-section';
  section.innerHTML = `<h2 class="food-section__title">${title}</h2>`;

  const grid = document.createElement('div');
  grid.className = 'food-grid';

  for (const item of items) {
    const caption = generateCaption({ description: item.dishName, type: 'food' });
    const card = document.createElement('div');
    card.className = 'food-card';

    let photoHtml = '';
    if (item.photo) {
      photoHtml = `<img class="food-card__photo" src="${item.photo}" alt="${item.dishName}">`;
    }

    card.innerHTML = `
      <div class="food-card__icon">\u{1F37D}\u{FE0F}</div>
      ${photoHtml}
      <h3 class="food-card__name">${item.dishName}</h3>
      <p class="food-card__memory">${item.memoryTitle}</p>
      <p class="food-card__caption">${caption}</p>
    `;

    grid.appendChild(card);
  }

  section.appendChild(grid);
  return section;
}

/**
 * Infer food type from stage ID
 */
function inferFoodType(stageId) {
  if (stageId === 'festivals-food') return 'festival';
  if (stageId === 'childhood' || stageId === 'school-days') return 'everyday';
  if (stageId === 'college' || stageId === 'first-job' || stageId === 'hometown') return 'comfort';
  return 'everyday';
}

export default { renderFoodMemories };
