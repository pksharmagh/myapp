/**
 * Utils Module
 * Shared utility functions for HTML escaping and sanitization.
 */

/**
 * Escape HTML entities to prevent XSS when inserting into innerHTML.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escape a string for safe use inside HTML attribute values.
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

export default { escapeHtml, escapeAttr };
