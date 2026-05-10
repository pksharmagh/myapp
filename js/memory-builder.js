/**
 * Memory Builder Module
 * Main journey page: renders stages as an accordion with memory CRUD,
 * drag-and-drop reordering, photo upload, and voice recording.
 */

import { stages } from './data/stages.js';
import { saveMemory, getMemories, deleteMemory, reorderMemories } from './memory-store.js';
import { generateMotherPerspective } from './ai-engine.js';
import { createPhotoUploader } from './photo-upload.js';
import { createVoiceRecorder } from './voice-recorder.js';
import { escapeHtml, escapeAttr } from './utils.js';

let expandedStageId = null;
let editingMemory = null;
let container = null;

/**
 * Render the memory builder page
 * @returns {HTMLElement}
 */
export function renderMemoryBuilder() {
  container = document.createElement('div');
  container.className = 'memory-builder';

  // Header
  const header = document.createElement('header');
  header.className = 'memory-builder__header';
  header.innerHTML = `
    <h1 class="memory-builder__title">Your Memory Journey</h1>
    <p class="memory-builder__subtitle">Walk through 10 stages of your life. Add memories, photos, and voice notes. Watch her story unfold alongside yours.</p>
    <div class="memory-builder__actions">
      <a href="#/timeline" class="memory-builder__preview-btn">Preview Story</a>
    </div>
  `;
  container.appendChild(header);

  // Stages accordion
  const stagesContainer = document.createElement('div');
  stagesContainer.className = 'memory-builder__stages';

  stages.forEach(function (stage) {
    const stageEl = renderStage(stage);
    stagesContainer.appendChild(stageEl);
  });

  container.appendChild(stagesContainer);
  return container;
}

/**
 * Render a single stage card
 */
function renderStage(stage) {
  const memories = getMemories(stage.id);
  const isExpanded = expandedStageId === stage.id;

  const stageEl = document.createElement('section');
  stageEl.className = 'stage-card' + (isExpanded ? ' stage-card--expanded' : '');
  stageEl.dataset.stageId = stage.id;
  stageEl.style.setProperty('--stage-color', stage.color);

  // Header (always visible)
  const headerEl = document.createElement('div');
  headerEl.className = 'stage-card__header';
  headerEl.setAttribute('role', 'button');
  headerEl.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  headerEl.setAttribute('tabindex', '0');

  headerEl.innerHTML = `
    <span class="stage-card__icon">${stage.icon}</span>
    <div class="stage-card__info">
      <h2 class="stage-card__title">${stage.title}</h2>
      <p class="stage-card__subtitle">${stage.subtitle}</p>
    </div>
    <span class="stage-card__badge">${memories.length}</span>
    <span class="stage-card__chevron">${isExpanded ? '\u25B2' : '\u25BC'}</span>
  `;

  headerEl.addEventListener('click', function () {
    toggleStage(stage.id);
  });

  headerEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleStage(stage.id);
    }
  });

  stageEl.appendChild(headerEl);

  // Body (visible when expanded)
  if (isExpanded) {
    const bodyEl = document.createElement('div');
    bodyEl.className = 'stage-card__body';

    // Prompts
    const promptsEl = document.createElement('div');
    promptsEl.className = 'stage-card__prompts';
    promptsEl.innerHTML = '<p class="stage-card__prompts-label">Memory prompts to inspire you:</p>';
    const promptsList = document.createElement('ul');
    promptsList.className = 'stage-card__prompts-list';
    stage.prompts.forEach(function (prompt) {
      const li = document.createElement('li');
      li.textContent = prompt;
      promptsList.appendChild(li);
    });
    promptsEl.appendChild(promptsList);
    bodyEl.appendChild(promptsEl);

    // Existing memories
    if (memories.length > 0) {
      const memoriesEl = document.createElement('div');
      memoriesEl.className = 'stage-card__memories';
      memories.forEach(function (memory) {
        memoriesEl.appendChild(renderMemoryCard(memory, stage));
      });
      setupDragAndDrop(memoriesEl, stage.id);
      bodyEl.appendChild(memoriesEl);
    }

    // Add memory button or form
    if (editingMemory && editingMemory.stageId === stage.id) {
      bodyEl.appendChild(renderMemoryForm(stage, editingMemory));
    } else {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'stage-card__add-btn';
      addBtn.textContent = '+ Add Memory';
      addBtn.addEventListener('click', function () {
        editingMemory = { stageId: stage.id };
        rerender();
      });
      bodyEl.appendChild(addBtn);
    }

    stageEl.appendChild(bodyEl);
  }

  return stageEl;
}

/**
 * Render a memory card
 */
function renderMemoryCard(memory, stage) {
  const card = document.createElement('div');
  card.className = 'memory-card';
  card.draggable = true;
  card.dataset.memoryId = memory.id;

  // Drag handle
  const handle = document.createElement('span');
  handle.className = 'memory-card__handle';
  handle.textContent = '\u2630';
  handle.setAttribute('aria-label', 'Drag to reorder');
  card.appendChild(handle);

  // Content
  const content = document.createElement('div');
  content.className = 'memory-card__content';

  const titleRow = document.createElement('div');
  titleRow.className = 'memory-card__title-row';

  const title = document.createElement('h3');
  title.className = 'memory-card__title';
  title.textContent = memory.title || 'Untitled Memory';
  titleRow.appendChild(title);

  if (memory.year) {
    const year = document.createElement('span');
    year.className = 'memory-card__year';
    year.textContent = memory.year;
    titleRow.appendChild(year);
  }

  content.appendChild(titleRow);

  // Description snippet
  if (memory.description) {
    const desc = document.createElement('p');
    desc.className = 'memory-card__description';
    desc.textContent = memory.description.length > 120
      ? memory.description.substring(0, 120) + '...'
      : memory.description;
    content.appendChild(desc);
  }

  // Photo thumbnail
  if (memory.photoDataUrl) {
    const thumb = document.createElement('img');
    thumb.className = 'memory-card__thumbnail';
    thumb.src = memory.photoDataUrl;
    thumb.alt = 'Memory photo';
    content.appendChild(thumb);
  }

  // Mother's perspective - use stored value for stability
  const perspective = memory._motherPerspective || generateMotherPerspective(
    (memory.description || '') + ' ' + (memory.emotionalMemory || ''),
    stage.id
  );
  if (perspective) {
    const perspEl = document.createElement('blockquote');
    perspEl.className = 'memory-card__perspective';
    perspEl.textContent = perspective;
    content.appendChild(perspEl);
  }

  card.appendChild(content);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'memory-card__actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'memory-card__edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    editingMemory = { ...memory, stageId: stage.id };
    rerender();
  });

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'memory-card__delete-btn';
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteMemory(stage.id, memory.id);
      rerender();
    }
  });

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  card.appendChild(actions);

  return card;
}

/**
 * Render the memory form for adding/editing
 */
function renderMemoryForm(stage, memory) {
  const form = document.createElement('form');
  form.className = 'memory-form';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  const isEditing = !!memory.id;

  form.innerHTML = `
    <h3 class="memory-form__heading">${isEditing ? 'Edit Memory' : 'Add New Memory'}</h3>
    <div class="memory-form__field">
      <label class="memory-form__label" for="mem-title">Title</label>
      <input class="memory-form__input" type="text" id="mem-title" name="title" value="${escapeAttr(memory.title || '')}" placeholder="Give this memory a name" />
    </div>
    <div class="memory-form__row">
      <div class="memory-form__field memory-form__field--half">
        <label class="memory-form__label" for="mem-year">Year</label>
        <input class="memory-form__input" type="text" id="mem-year" name="year" value="${escapeAttr(memory.year || '')}" placeholder="e.g. 1998" />
      </div>
      <div class="memory-form__field memory-form__field--half">
        <label class="memory-form__label" for="mem-age">Age</label>
        <input class="memory-form__input" type="text" id="mem-age" name="age" value="${escapeAttr(memory.age || '')}" placeholder="e.g. 5" />
      </div>
    </div>
    <div class="memory-form__field">
      <label class="memory-form__label" for="mem-description">What happened?</label>
      <textarea class="memory-form__textarea" id="mem-description" name="description" rows="4" placeholder="Describe this memory...">${escapeHtml(memory.description || '')}</textarea>
    </div>
    <div class="memory-form__field">
      <label class="memory-form__label" for="mem-emotional">How did it make you feel?</label>
      <textarea class="memory-form__textarea" id="mem-emotional" name="emotionalMemory" rows="3" placeholder="The emotions, the feelings...">${escapeHtml(memory.emotionalMemory || '')}</textarea>
    </div>
    <div class="memory-form__row">
      <div class="memory-form__field memory-form__field--half">
        <label class="memory-form__label" for="mem-location">Location</label>
        <input class="memory-form__input" type="text" id="mem-location" name="location" value="${escapeAttr(memory.location || '')}" placeholder="Where was this?" />
      </div>
      <div class="memory-form__field memory-form__field--half">
        <label class="memory-form__label" for="mem-food">Favorite Food</label>
        <input class="memory-form__input" type="text" id="mem-food" name="favFood" value="${escapeAttr(memory.favFood || '')}" placeholder="A dish from this time" />
      </div>
    </div>
    <div class="memory-form__field">
      <label class="memory-form__label" for="mem-festival">Festival Memory</label>
      <input class="memory-form__input" type="text" id="mem-festival" name="festivalMemory" value="${escapeAttr(memory.festivalMemory || '')}" placeholder="Any festival or celebration?" />
    </div>
    <div class="memory-form__field">
      <label class="memory-form__label" for="mem-people">People</label>
      <input class="memory-form__input" type="text" id="mem-people" name="people" value="${escapeAttr(memory.people || '')}" placeholder="Who was there? (comma-separated)" />
    </div>
  `;

  // Photo uploader
  const photoField = document.createElement('div');
  photoField.className = 'memory-form__field';
  const photoLabel = document.createElement('label');
  photoLabel.className = 'memory-form__label';
  photoLabel.textContent = 'Photo';
  photoField.appendChild(photoLabel);

  let currentPhoto = memory.photoDataUrl || null;
  const uploader = createPhotoUploader(function (dataUrl) {
    currentPhoto = dataUrl;
  });
  if (memory.photoDataUrl) {
    uploader.setPhoto(memory.photoDataUrl);
  }
  photoField.appendChild(uploader);
  form.appendChild(photoField);

  // Voice recorder
  const voiceField = document.createElement('div');
  voiceField.className = 'memory-form__field';
  const voiceLabel = document.createElement('label');
  voiceLabel.className = 'memory-form__label';
  voiceLabel.textContent = 'Voice Note';
  voiceField.appendChild(voiceLabel);

  let currentVoice = memory.voiceNoteData || null;
  const recorder = createVoiceRecorder(function (data) {
    currentVoice = data;
  });
  if (memory.voiceNoteData) {
    recorder.setRecording(memory.voiceNoteData);
  }
  voiceField.appendChild(recorder);
  form.appendChild(voiceField);

  // Form actions
  const actionsEl = document.createElement('div');
  actionsEl.className = 'memory-form__actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'memory-form__save-btn';
  saveBtn.textContent = isEditing ? 'Update Memory' : 'Save Memory';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'memory-form__cancel-btn';
  cancelBtn.textContent = 'Cancel';

  saveBtn.addEventListener('click', function () {
    const formData = new FormData(form);
    const memoryData = {
      title: formData.get('title') || '',
      year: formData.get('year') || '',
      age: formData.get('age') || '',
      description: formData.get('description') || '',
      emotionalMemory: formData.get('emotionalMemory') || '',
      location: formData.get('location') || '',
      favFood: formData.get('favFood') || '',
      festivalMemory: formData.get('festivalMemory') || '',
      people: formData.get('people') || '',
      photoDataUrl: currentPhoto,
      voiceNoteData: currentVoice
    };

    if (isEditing) {
      memoryData.id = memory.id;
      // Preserve existing perspective if text has not changed
      if (memory._motherPerspective && memoryData.description === memory.description) {
        memoryData._motherPerspective = memory._motherPerspective;
      }
    }

    // Generate and store mother's perspective if not already present
    if (!memoryData._motherPerspective) {
      const perspText = (memoryData.description || '') + ' ' + (memoryData.emotionalMemory || '');
      memoryData._motherPerspective = generateMotherPerspective(perspText, stage.id);
    }

    const result = saveMemory(stage.id, memoryData);
    if (!result.saved) {
      alert('Unable to save: storage is full. Try removing some photos or memories to free space.');
    }
    editingMemory = null;
    rerender();
  });

  cancelBtn.addEventListener('click', function () {
    editingMemory = null;
    rerender();
  });

  actionsEl.appendChild(saveBtn);
  actionsEl.appendChild(cancelBtn);
  form.appendChild(actionsEl);

  return form;
}

/**
 * Set up drag and drop for memory reordering
 */
function setupDragAndDrop(memoriesEl, stageId) {
  let draggedId = null;

  memoriesEl.addEventListener('dragstart', function (e) {
    const card = e.target.closest('.memory-card');
    if (!card) return;
    draggedId = card.dataset.memoryId;
    card.classList.add('memory-card--dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  memoriesEl.addEventListener('dragend', function (e) {
    const card = e.target.closest('.memory-card');
    if (card) card.classList.remove('memory-card--dragging');
    draggedId = null;
  });

  memoriesEl.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const afterElement = getDragAfterElement(memoriesEl, e.clientY);
    const dragged = memoriesEl.querySelector('.memory-card--dragging');
    if (!dragged) return;
    if (afterElement) {
      memoriesEl.insertBefore(dragged, afterElement);
    } else {
      memoriesEl.appendChild(dragged);
    }
  });

  memoriesEl.addEventListener('drop', function (e) {
    e.preventDefault();
    // Gather new order
    const cards = memoriesEl.querySelectorAll('.memory-card');
    const orderedIds = Array.from(cards).map(function (c) { return c.dataset.memoryId; });
    reorderMemories(stageId, orderedIds);
  });
}

/**
 * Get the element after which the dragged item should be inserted
 */
function getDragAfterElement(container, y) {
  const elements = Array.from(container.querySelectorAll('.memory-card:not(.memory-card--dragging)'));
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  elements.forEach(function (child) {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = child;
    }
  });

  return closest;
}

/**
 * Toggle a stage's expanded state
 */
function toggleStage(stageId) {
  if (expandedStageId === stageId) {
    expandedStageId = null;
  } else {
    expandedStageId = stageId;
  }
  editingMemory = null;
  rerender();
}

/**
 * Re-render the entire memory builder
 */
function rerender() {
  if (!container) return;
  const parent = container.parentElement;
  if (!parent) return;
  const newContainer = renderMemoryBuilder();
  parent.replaceChild(newContainer, container);
}

export default { renderMemoryBuilder };
