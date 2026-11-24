import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "../../../lib/systemPrompt";
 
const TARGETS = ["general", "coding", "image", "writing"] as const;
type Target = (typeof TARGETS)[number];
 
const MAX_CHARS = 2000;
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
 
export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server is missing its API key." }, { status: 500 });
  }
 
  let body: { prompt?: unknown; target?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
 
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const target: Target = TARGETS.find((t) => t === body.target) ?? "general";
 
  if (!prompt) {
    return NextResponse.json({ error: "Please enter a prompt." }, { status: 400 });
  }
  if (prompt.length > MAX_CHARS) {
    return NextResponse.json({ error: `Keep it under ${MAX_CHARS} characters.` }, { status: 400 });
  }
 
  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Target: ${target}\n\nPrompt to improve:\n"""\n${prompt}\n"""`,
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the AI. Please try again." }, { status: 502 });
  }
 
  if (res.status === 429) {
    return NextResponse.json(
      { error: "We're busy right now (free tier limit). Try again in a minute." },
      { status: 429 }
    );
  }
  if (!res.ok) {
    console.error("Groq error", res.status, await res.text());
    return NextResponse.json({ error: "The AI is unavailable right now. Please try again." }, { status: 502 });
  }
 
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
 
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.improved !== "string" || !Array.isArray(parsed.changes)) throw new Error();
    return NextResponse.json({
      improved: parsed.improved,
      changes: parsed.changes.filter((c: unknown) => typeof c === "string").slice(0, 5),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't read the AI's answer. Please try again." }, { status: 502 });
  }
}