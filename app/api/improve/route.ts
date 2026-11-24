import { NextResponse } from "next/server";
 
// Stage 3: fake response so we can build the UI. Stage 4 swaps this for a free Groq call.
export async function POST(req: Request) {
  const { prompt, target } = await req.json();
 
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Please enter a prompt." }, { status: 400 });
  }
 
  await new Promise((r) => setTimeout(r, 1200)); // pretend to think
 
  return NextResponse.json({
    improved: `You are an expert ${target} assistant.\n\nTask: ${prompt.trim()}\n\nContext: The audience is beginners who want a clear, practical answer.\n\nRequirements:\n- Be specific and concrete\n- Keep it under 300 words\n- Use simple language\n\nOutput format: A short title, then clear sections with headings.`,
    changes: [
      "Added a role so the AI knows who to act as",
      "Split the request into task, context and requirements",
      "Set a length limit and an output format",
    ],
  });
}