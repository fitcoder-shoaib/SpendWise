import { useState } from "react";

export default function ChatPanel({
  messages,
  onSend,
  loading,
  logicInsights,
  topCategories,
  starterPrompts,
  financialSummary
}) {
  const [draft, setDraft] = useState("");

  function isMinimalAssistantMessage(message) {
    return (
      message.role === "assistant" &&
      message.focusArea === "general-guidance" &&
      !message.alerts?.length &&
      !message.recommendedActions?.length &&
      !message.followUpPrompts?.length
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!draft.trim() || loading) {
      return;
    }

    await onSend(draft);
    setDraft("");
  }

  return (
    <section className="coach-layout">
      <article className="panel coach-main">
        <div className="section-title">
          <p className="eyebrow">AI Coach</p>
          <h2>Ask SpendWise anything</h2>
          <p className="helper lead-copy">
            Get short, personalized budgeting and savings advice grounded in your tracked finances.
          </p>
        </div>

        {!messages.length ? (
          <div className="coach-starters">
            <p className="helper">Try one of these to get a focused answer faster.</p>
            <div className="prompt-strip">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="prompt-chip"
                  onClick={() => onSend(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="chat-history">
          {messages.length ? (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "user" ? "chat-bubble user-bubble" : "chat-bubble assistant-bubble"}
              >
                <strong>{message.role === "user" ? "You" : "SpendWise AI"}</strong>
                <p>{message.content}</p>
                {message.role === "assistant" && message.focusArea && !isMinimalAssistantMessage(message) ? (
                  <div className="chat-meta">
                    <span className="pill">Focus: {message.focusArea}</span>
                    <span className="pill">Source: {message.source || "fallback"}</span>
                  </div>
                ) : null}
                {message.role === "assistant" && message.alerts?.length ? (
                  <div className="stack compact-stack">
                    {message.alerts.map((item) => (
                      <div key={item} className="mini-metric">
                        <span>Alert</span>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" && message.recommendedActions?.length ? (
                  <div className="coach-actions">
                    <p className="helper">Best next steps</p>
                    <ul className="list bullets compact-list">
                      {message.recommendedActions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {message.role === "assistant" && message.followUpPrompts?.length ? (
                  <div className="coach-follow-ups">
                    <p className="helper">Ask a follow-up</p>
                    <div className="prompt-strip">
                      {message.followUpPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="prompt-chip"
                          onClick={() => onSend(prompt)}
                          disabled={loading}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="chat-bubble assistant-bubble">
              <strong>SpendWise AI</strong>
              <p>Ask about overspending, savings targets, food delivery habits, or how to improve your budget this week.</p>
            </div>
          )}
        </div>

        <form className="stack coach-composer" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="How can I reduce food spending this month?"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </article>

      <aside className="panel coach-sidebar">
        <div className="section-title">
          <p className="eyebrow">Logic Layer</p>
          <h2>Pre-GPT insights</h2>
          <p className="helper lead-copy">
            These deterministic finance checks are evaluated before the chatbot prompt is sent.
          </p>
        </div>

        <div className="coach-sidebar-stack">
          {financialSummary ? (
            <div className="mini-metric">
              <span>Snapshot</span>
              <strong>
                Spend {financialSummary.totalExpense}, Save {financialSummary.totalSavings}
              </strong>
            </div>
          ) : null}

          <div className="mini-metric">
            <span>Top categories</span>
            <strong>{topCategories.length ? topCategories.map((item) => item.category).join(", ") : "No data yet"}</strong>
          </div>

          <div className="coach-insight-list">
            {logicInsights.length ? (
              logicInsights.map((item) => (
                <div key={item.type} className="coach-insight-card">
                  <span>{item.type}</span>
                  <strong>{item.message}</strong>
                </div>
              ))
            ) : (
              <div className="mini-metric">
                <span>Alerts</span>
                <strong>No rule-based alerts right now</strong>
              </div>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}
