// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getBot } from "../../../lib/bots";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bot = getBot(body.botId ?? null);
    const userMessages = body.messages ?? [];

    if (!process.envOPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server is misconfigured: missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

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
      content: "No response generated."
    };

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}
