function isSameDay(leftDate, rightDate) {
  const left = new Date(leftDate);
  const right = new Date(rightDate);

  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

module.exports = {
  isSameDay
};
