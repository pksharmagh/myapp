/**
 * Memory Store Module
 * localStorage-based persistence for memory data.
 */

const STORAGE_KEY = 'fromHerHands_memories';

/**
 * Generate a UUID v4
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Load all memories from localStorage
 */
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

/**
 * Persist all memories to localStorage
 */
function persistAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e.message);
  }
}

/**
 * Save or update a memory for a given stage.
 * Generates a UUID if the memory is new.
 * @param {string} stageId
 * @param {object} memory
 * @returns {object} The saved memory object
 */
export function saveMemory(stageId, memory) {
  const data = loadAll();
  if (!data[stageId]) {
    data[stageId] = [];
  }

  const now = new Date().toISOString();

  if (memory.id) {
    // Update existing
    const index = data[stageId].findIndex((m) => m.id === memory.id);
    if (index !== -1) {
      data[stageId][index] = {
        ...data[stageId][index],
        ...memory,
        stageId,
        updatedAt: now
      };
    } else {
      memory.updatedAt = now;
      memory.stageId = stageId;
      data[stageId].push(memory);
    }
  } else {
    // New memory
    memory.id = generateId();
    memory.stageId = stageId;
    memory.createdAt = now;
    memory.updatedAt = now;
    memory.order = data[stageId].length;
    data[stageId].push(memory);
  }

  persistAll(data);
  return memory;
}

/**
 * Get all memories for a specific stage
 * @param {string} stageId
 * @returns {Array}
 */
export function getMemories(stageId) {
  const data = loadAll();
  const memories = data[stageId] || [];
  return memories.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get all memories across all stages
 * @returns {object} Object keyed by stageId
 */
export function getAllMemories() {
  return loadAll();
}

/**
 * Delete a memory by its ID within a stage
 * @param {string} stageId
 * @param {string} memoryId
 */
export function deleteMemory(stageId, memoryId) {
  const data = loadAll();
  if (!data[stageId]) return;
  data[stageId] = data[stageId].filter((m) => m.id !== memoryId);
  // Re-index order
  data[stageId].forEach((m, i) => {
    m.order = i;
  });
  persistAll(data);
}

/**
 * Reorder memories within a stage
 * @param {string} stageId
 * @param {Array<string>} orderedIds - Array of memory IDs in desired order
 */
export function reorderMemories(stageId, orderedIds) {
  const data = loadAll();
  if (!data[stageId]) return;

  const ordered = [];
  orderedIds.forEach((id, index) => {
    const memory = data[stageId].find((m) => m.id === id);
    if (memory) {
      memory.order = index;
      ordered.push(memory);
    }
  });

  // Add any memories not in the orderedIds list at the end
  data[stageId].forEach((m) => {
    if (!orderedIds.includes(m.id)) {
      m.order = ordered.length;
      ordered.push(m);
    }
  });

  data[stageId] = ordered;
  persistAll(data);
}

/**
 * Export all data as a JSON string
 * @returns {string}
 */
export function exportData() {
  const data = loadAll();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from a JSON string
 * @param {string} json
 * @returns {boolean} Success status
 */
export function importData(json) {
  try {
    const data = JSON.parse(json);
    if (typeof data !== 'object' || data === null) return false;
    persistAll(data);
    return true;
  } catch (e) {
    console.warn('Import failed:', e.message);
    return false;
  }
}

export default {
  saveMemory,
  getMemories,
  getAllMemories,
  deleteMemory,
  reorderMemories,
  exportData,
  importData
};
