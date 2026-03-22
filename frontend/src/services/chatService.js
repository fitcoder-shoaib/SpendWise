export async function sendChatMessage({ token, history, message }) {
  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      history
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Chat request failed");
    error.status = response.status;
    throw error;
  }

  return data.chat;
}
