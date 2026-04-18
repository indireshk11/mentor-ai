import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/store/AppStore";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should I do today?",
  "Plan my next 3 days",
  "How am I tracking on my goals?",
  "Suggest a study technique for my hardest task",
];

export default function MentorChat() {
  const { username } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-send a seeded prompt when arriving from "Ask Mentor" buttons.
  useEffect(() => {
    const seed = (location.state as { seedPrompt?: string } | null)?.seedPrompt;
    if (seed && !seededRef.current) {
      seededRef.current = true;
      navigate(location.pathname, { replace: true, state: null });
      send(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        if (resp.status === 429) toast.error("Slow down, hero — rate limit hit. Try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add credits in Workspace settings.");
        else toast.error("Mentor is unavailable right now.");
        setMessages(next); // keep user msg
        return;
      }
      if (!resp.body) throw new Error("No stream body");

      let assistantSoFar = "";
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const r = await reader.read();
        if (r.done) break;
        buf += decoder.decode(r.value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        toast.error("Something interrupted the mentor.");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <header className="mb-4">
        <h1 className="font-display text-4xl md:text-5xl text-gradient-hero">AI MENTOR</h1>
        <p className="text-muted-foreground">Your personal coach. Ask anything — I see your tasks and goals.</p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-3xl glass p-4 md:p-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-8">
            <div className="w-20 h-20 rounded-3xl gradient-hero flex items-center justify-center shadow-glow animate-pulse-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display text-2xl text-gradient-sunset">Hey {username}!</p>
              <p className="text-muted-foreground mt-1">What should we tackle today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm px-4 py-3 rounded-2xl bg-background/60 border border-border hover:border-primary hover:bg-background transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                m.role === "user" ? "gradient-electric" : "gradient-hero"
              }`}
            >
              {m.role === "user" ? (
                <User className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Bot className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-primary/15 border border-primary/30"
                  : "bg-background/60 border border-border"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:mt-3 prose-headings:mb-2 prose-strong:text-foreground prose-a:text-primary">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="shrink-0 w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-background/60 border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your mentor anything…"
          className="flex-1 bg-background/60 border border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-primary"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="gradient-hero text-primary-foreground font-bold px-5 shadow-orange hover:shadow-glow"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  );
}
