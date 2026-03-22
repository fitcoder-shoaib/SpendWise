function sanitizeText(value, maxLength = 500) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeChatInput(payload = {}) {
  const message = sanitizeText(payload.message, 500);
  const history = Array.isArray(payload.history)
    ? payload.history
        .slice(-8)
        .map((item) => ({
          role: item?.role === "assistant" ? "assistant" : "user",
          content: sanitizeText(item?.content, 500)
        }))
        .filter((item) => item.content)
    : [];

  return {
    message,
    history
  };
}

module.exports = {
  sanitizeText,
  sanitizeChatInput
};
