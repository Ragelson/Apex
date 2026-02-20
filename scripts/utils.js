// Format from ISO-timestamp to "17:02 01.08.25" using local time
function formatTimestamp(isoString) {
  const date = new Date(isoString);

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

function getStartOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(new Date(date));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

function timeToPixel(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return (hours * 60 + minutes) * (60 / 60);
}

function getDayOfWeek(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function parseHash() {
  const match = window.location.hash.match(/^#([a-zA-Z]+)(?:-(\d+))?$/);
  if (!match) return [null, null];
  return [match[1], match[2] ? Number(match[2]) : null];
}

function setHash(category, id = null) {
  if (!category || typeof category !== "string") {
    throw new Error("Category must be a non-empty string");
  }
  const hashValue = id !== null ? `#${category}-${id}` : `#${category}`;
  window.location.hash = hashValue;
}

function getRandomColor() {
  const colors = [
    '#4CAF50', '#2196F3', '#9C27B0', '#FF5722',
    '#607D8B', '#795548', '#E91E63', '#3F51B5',
    '#009688', '#673AB7', '#FF9800', '#F44336'
  ];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

// ===== Функции для локализации времени (без конвертации в UTC) =====
/**
 * Форматирует дату в локальное время в формате YYYY-MM-DD
 * @param {Date} date - Объект Date
 * @returns {string} Строка в формате YYYY-MM-DD
 */
function formatLocalDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Форматирует время в локальное время в формате HH:MM
 * @param {Date} date - Объект Date
 * @returns {string} Строка в формате HH:MM
 */
function formatLocalTimeForInput(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Форматирует дату/время в локальное время в формате YYYY-MM-DDTHH:MM
 * @param {Date} date - Объект Date
 * @returns {string} Строка в формате YYYY-MM-DDTHH:MM
 */
function formatLocalDateTimeForInput(date) {
  return `${formatLocalDateForInput(date)}T${formatLocalTimeForInput(date)}`;
}