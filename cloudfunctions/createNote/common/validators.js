const { PLACE_CATEGORIES, NOTE_COLORS } = require('./constants');

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field}不能为空`);
  }
  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function requireNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${field}必须是数字`);
  }
  return number;
}

function requireCategory(value) {
  if (!PLACE_CATEGORIES.includes(value)) {
    throw new Error('地点分类无效');
  }
  return value;
}

function requireNoteColor(value) {
  if (!NOTE_COLORS.includes(value)) {
    throw new Error('便利贴颜色无效');
  }
  return value;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
}

module.exports = {
  requireString,
  optionalString,
  requireNumber,
  requireCategory,
  requireNoteColor,
  normalizeStringArray
};
