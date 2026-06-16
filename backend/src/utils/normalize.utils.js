/**
 * Normalization Utilities
 * Helper functions for data normalization
 */

/**
 * Normalize email address
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Normalize phone number (remove spaces, dashes, etc.)
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\.\(\)]/g, '');
};

/**
 * Normalize postal code
 * @param {string} postalCode
 * @returns {string}
 */
export const normalizePostalCode = (postalCode) => {
  if (!postalCode) return '';
  return postalCode.trim().toUpperCase().replace(/\s/g, '');
};

/**
 * Slugify text for URLs
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Capitalize first letter
 * @param {string} text
 * @returns {string}
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 * @param {string} text
 * @returns {string}
 */
export const capitalizeEach = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

export default {
  normalizeEmail,
  normalizePhone,
  normalizePostalCode,
  slugify,
  capitalize,
  capitalizeEach,
};
