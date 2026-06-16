/**
 * Date Utilities
 * Helper functions for date/time operations
 */

/**
 * Get current date in ISO format
 * @returns {string}
 */
export const getCurrentISODate = () => {
  return new Date().toISOString();
};

/**
 * Add days to a date
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 * @param {Date} date - The base date
 * @param {number} months - Number of months to add
 * @returns {Date}
 */
export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Check if date is in the past
 * @param {Date} date
 * @returns {boolean}
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date} date
 * @returns {boolean}
 */
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get days difference between two dates
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number}
 */
export const daysDifference = (date1, date2) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(date2) - new Date(date1)) / msPerDay);
};

export default {
  getCurrentISODate,
  addDays,
  addMonths,
  isPast,
  isFuture,
  daysDifference,
};
