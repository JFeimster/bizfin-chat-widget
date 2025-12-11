// app/widget/[botId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getBot, BotConfig } from "../../../lib/bots";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WidgetPage({
  params
}: {
  params: { botId: string };
}) {
  const [bot, setBot] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBot(getBot(params.botId));
  }, [params.botId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !bot) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: bot.id,
          messages: newMessages
        })
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([...newMessages, data.reply]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something broke on my side. Try again in a bit."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!bot) return null;

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
        height: "100vh",
        maxHeight: 600,
        display: "flex",
        flexDirection: "column",
        background: "#050816",
        color: "#f9fafb",
        padding: 12,
        boxSizing: "border-box"
      }}
    >
      <header
        style={{
          paddingBottom: 8,
          borderBottom: "1px solid rgba(148, 163, 184, 0.4)",
          marginBottom: 8
        }}
      >
        <div style={{ fontWeight: 600 }}>{bot.name}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Ask me anything about your business money, funding, or credit.
        </div>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 4,
          marginBottom: 8
        }}
      >
        {messages.length === 0 && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Start with something like:{" "}
            <strong>“Here’s my business situation, what should I look at?”</strong>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              textAlign: m.role === "user" ? "right" : "left"
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 12,
                background:
                  m.role === "user" ? "#4b5563" : "rgba(15, 23, 42, 0.9)"
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          style={{
            flex: 1,
            borderRadius: 999,
            border: "1px solid rgba(148, 163, 184, 0.5)",
            padding: "8px 12px",
            background: "#020617",
            color: "white",
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            borderRadius: 999,
            border: "none",
            padding: "8px 14px",
            background: loading ? "#6b7280" : "#22c55e",
            color: "#020617",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
