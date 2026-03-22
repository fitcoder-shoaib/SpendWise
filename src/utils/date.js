function startOfDay(dateInput = new Date()) {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateInput = new Date()) {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfWeek(dateInput = new Date()) {
  const date = startOfDay(dateInput);
  const day = date.getDay();
  const diff = date.getDate() - day;
  date.setDate(diff);
  return date;
}

function endOfWeek(dateInput = new Date()) {
  const date = startOfWeek(dateInput);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
}

module.exports = {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek
};
