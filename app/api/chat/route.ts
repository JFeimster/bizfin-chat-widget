// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getBot } from "../../../lib/bots";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY is not set. Set it in .env.local for dev and in your hosting env for prod."
  );
}

const openai = new OpenAI({ apiKey });

export async function POST(req: NextRequest) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const bot = getBot(body.botId ?? null);
    const userMessages = body.messages ?? [];

    const messages = [
      { role: "system", content: bot.systemPrompt },
      ...userMessages
    ];

    const completion = await openai.chat.completions.create({
      model: bot.model,
      messages,
      temperature: 0.6
    });

    const reply = completion.choices[0]?.message ?? {
      role: "assistant",
      content: "I couldn't generate a response."
    };

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat route error:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to generate response from OpenAI." },
      { status: 500 }
    );
  }
}
