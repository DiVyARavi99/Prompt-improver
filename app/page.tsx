"use client";

import { useState } from "react";

type Target = "general" | "coding" | "image" | "writing";
type Result = { improved: string; changes: string[] };

const APP_NAME = "PromptPolish";
const MAX_CHARS = 2000;

const TARGETS: { id: Target; label: string; emoji: string }[] = [
  { id: "general", label: "General", emoji: "💬" },
  { id: "coding", label: "Coding", emoji: "💻" },
  { id: "image", label: "Image", emoji: "🎨" },
  { id: "writing", label: "Writing", emoji: "✍️" },
];

const EXAMPLES: { text: string; target: Target }[] = [
  { text: "write a blog post about dogs", target: "writing" },
  { text: "python script to rename files", target: "coding" },
  { text: "a cat in space", target: "image" },
  { text: "explain crypto to me", target: "general" },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [target, setTarget] = useState<Target>("general");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function improve() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        {/* header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {APP_NAME} · Free · No sign-up
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Turn rough prompts into{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              great ones
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Paste any prompt. Get a sharper, structured version, and learn why it&apos;s better.
          </p>
        </div>

        {/* input card */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl shadow-violet-950/40 backdrop-blur sm:p-6">
          <div className="flex flex-wrap gap-2">
            {TARGETS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTarget(t.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  target === t.id
                    ? "bg-white text-zinc-900"
                    : "bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") improve();
            }}
            placeholder="e.g. write a blog post about dogs"
            rows={5}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-500">
              {prompt.length}/{MAX_CHARS} · ⌘ + Enter
            </span>
            <button
              onClick={improve}
              disabled={!prompt.trim() || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Spinner /> Improving…
                </>
              ) : (
                <>✨ Improve</>
              )}
            </button>
          </div>
        </div>

        {/* examples */}
        {!result && !loading && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-zinc-500">Try:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                onClick={() => {
                  setPrompt(ex.text);
                  setTarget(ex.target);
                }}
                className="rounded-full border border-white/10 px-3 py-1 text-zinc-400 transition hover:border-white/30 hover:text-zinc-200"
              >
                {ex.text}
              </button>
            ))}
          </div>
        )}

        {/* error */}
        {error && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {/* loading skeleton */}
        {loading && (
          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="h-4 w-1/3 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
          </div>
        )}

        {/* result */}
        {result && (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-500/10 to-transparent p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium uppercase tracking-wider text-violet-300">
                  Improved prompt
                </h2>
                <button
                  onClick={copy}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/20"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-zinc-100">
                {result.improved}
              </pre>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                Why it&apos;s better
              </h2>
              <ul className="mt-4 space-y-2">
                {result.changes.map((c) => (
                  <li key={c} className="flex gap-3 text-zinc-300">
                    <span className="text-emerald-400">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-zinc-600">
          Built with Next.js · Hosted on Vercel · Powered by open models
        </footer>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}