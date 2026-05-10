/**
 * AI Engine Module
 * Simulated AI for generating mother's perspective, enhancing memories,
 * and creating cinematic narratives from user content.
 */

import { motherPerspectives, emotionalRewrites, cinematicPhrases, tributeTemplates, captionTemplates } from './data/ai-responses.js';

/**
 * Pick a random item from an array
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick multiple unique random items from an array
 */
function pickMultiple(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Extract meaningful keywords from text for matching
 */
function extractKeywords(text) {
  const lower = text.toLowerCase();
  const keywords = {
    food: ['cook', 'food', 'kitchen', 'meal', 'rice', 'spice', 'lunch', 'dinner', 'breakfast', 'tiffin', 'recipe', 'taste', 'flavor', 'eat', 'hungry'],
    distance: ['far', 'away', 'miss', 'distance', 'city', 'train', 'bus', 'phone', 'call', 'travel', 'leave', 'left', 'gone'],
    love: ['love', 'care', 'hug', 'hold', 'warm', 'heart', 'feel', 'touch', 'close', 'soft', 'gentle'],
    sacrifice: ['sacrifice', 'gave', 'give', 'work', 'hard', 'tired', 'early', 'late', 'money', 'save', 'afford'],
    childhood: ['child', 'small', 'young', 'play', 'game', 'toy', 'school', 'bed', 'sleep', 'dream', 'story'],
    home: ['home', 'house', 'room', 'door', 'window', 'village', 'town', 'street', 'road', 'garden', 'yard'],
    emotion: ['cry', 'tear', 'smile', 'laugh', 'happy', 'sad', 'angry', 'worry', 'afraid', 'proud', 'joy']
  };

  const found = [];
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lower.includes(word)) {
        found.push(category);
        break;
      }
    }
  }
  return found;
}

/**
 * Generate a mother's perspective for a given memory
 * @param {string} memoryText - The user's memory text
 * @param {string} stageId - The life stage ID
 * @returns {string} A mother's perspective response
 */
export function generateMotherPerspective(memoryText, stageId) {
  const perspectives = motherPerspectives[stageId];
  if (!perspectives || perspectives.length === 0) {
    return 'She carried this moment in her heart, long before you knew it mattered.';
  }

  // Use keyword matching to try to find a relevant perspective
  const keywords = extractKeywords(memoryText);
  let selected = null;

  if (keywords.length > 0 && memoryText.length > 10) {
    // Score each perspective by keyword overlap with memory text
    const scored = perspectives.map((p) => {
      const pLower = p.toLowerCase();
      let score = 0;
      const words = memoryText.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && pLower.includes(word)) {
          score += 1;
        }
      }
      // Add some randomness
      score += Math.random() * 0.5;
      return { text: p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    selected = scored[0].text;
  } else {
    selected = pickRandom(perspectives);
  }

  return selected;
}

/**
 * Enhance a plain memory text with nostalgic/cinematic tone
 * @param {string} text - The original memory text
 * @returns {string} Enhanced version
 */
export function enhanceMemory(text) {
  if (!text || text.trim().length === 0) return text;

  const opening = pickRandom(cinematicPhrases);
  const closing = pickRandom(emotionalRewrites);

  return `${opening}\n\n${text}\n\n${closing}`;
}

/**
 * Generate an emotional caption for a photo or food memory
 * @param {object} context - Object with optional fields: description, stageId, type
 * @returns {string} An emotional caption
 */
export function generateCaption(context) {
  const { description, type } = context || {};

  if (type === 'food' || (description && extractKeywords(description).includes('food'))) {
    const foodCaptions = captionTemplates.filter((c) =>
      c.toLowerCase().includes('food') ||
      c.toLowerCase().includes('cook') ||
      c.toLowerCase().includes('kitchen') ||
      c.toLowerCase().includes('recipe') ||
      c.toLowerCase().includes('meal') ||
      c.toLowerCase().includes('taste') ||
      c.toLowerCase().includes('plate') ||
      c.toLowerCase().includes('flavor')
    );
    if (foodCaptions.length > 0) {
      return pickRandom(foodCaptions);
    }
  }

  return pickRandom(captionTemplates);
}

/**
 * Generate a cinematic life summary from all memories
 * @param {Array} memories - Array of memory objects
 * @returns {string} A cinematic summary
 */
export function generateSummary(memories) {
  if (!memories || memories.length === 0) {
    return 'Your story is waiting to be written. Every memory you add becomes a scene in the film of your life.';
  }

  const phrases = pickMultiple(cinematicPhrases, 3);
  const rewrite = pickRandom(emotionalRewrites);

  const titles = memories
    .filter((m) => m.title)
    .map((m) => m.title)
    .slice(0, 5);

  let summary = phrases[0] + '\n\n';

  if (titles.length > 0) {
    summary += `From "${titles[0]}"`;
    if (titles.length > 1) {
      summary += ` to "${titles[titles.length - 1]}"`;
    }
    summary += `, your journey unfolds like a film only she could direct.\n\n`;
  }

  summary += phrases[1] + '\n\n';
  summary += rewrite + '\n\n';
  summary += phrases[2];

  return summary;
}

/**
 * Generate a tribute message from collected memories
 * @param {Array} memories - Array of memory objects
 * @returns {string} A tribute message
 */
export function generateTribute(memories) {
  if (!memories || memories.length === 0) {
    return pickRandom(tributeTemplates);
  }

  const template = pickRandom(tributeTemplates);
  const phrase = pickRandom(cinematicPhrases);
  const rewrite = pickRandom(emotionalRewrites);

  let tribute = template + '\n\n';
  tribute += phrase + '\n\n';

  // Personalize with memory details
  const people = memories
    .filter((m) => m.people && m.people.trim())
    .map((m) => m.people)
    .slice(0, 3);

  const foods = memories
    .filter((m) => m.favFood && m.favFood.trim())
    .map((m) => m.favFood)
    .slice(0, 3);

  if (foods.length > 0) {
    tribute += `The taste of ${foods[0]} will forever remind me of home.\n\n`;
  }

  if (people.length > 0) {
    tribute += `Through all of it, there was always family.\n\n`;
  }

  tribute += rewrite;

  return tribute;
}

/**
 * Generate a suggested title for a memory collection
 * @param {Array} memories - Array of memory objects
 * @returns {string} A suggested title
 */
export function generateTitle(memories) {
  const titleOptions = [
    'From Her Hands: A Life in Memories',
    'The Distance Between Love and Home',
    'Scenes From a Mother\'s Heart',
    'What She Gave Without Asking',
    'A Journey Through Her Kitchen, Her Words, Her Silence',
    'Every Mile Measured in Love',
    'The Invisible Thread',
    'Written in Warmth',
    'Before I Could Say Thank You',
    'The Film She Directed in Silence'
  ];

  if (!memories || memories.length === 0) {
    return pickRandom(titleOptions);
  }

  // Try to incorporate user's words
  const firstMemory = memories.find((m) => m.title && m.title.trim());
  if (firstMemory) {
    const personalized = [
      `From "${firstMemory.title}" to Now`,
      `Beginning with ${firstMemory.title}`,
      ...titleOptions
    ];
    return pickRandom(personalized);
  }

  return pickRandom(titleOptions);
}

export default {
  generateMotherPerspective,
  enhanceMemory,
  generateCaption,
  generateSummary,
  generateTribute,
  generateTitle
};
