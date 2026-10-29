import { useEffect, useRef, useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import beeLogo from "@/assets/bee-logo.png";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "nearbee:chat";
const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm the Near Bee assistant 🐝 Ask me about services, booking, invoices, or anything else!",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch {}
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const errText = res.status === 429
          ? "I'm getting too many requests. Please try again in a moment."
          : res.status === 402
          ? "AI credits are exhausted. Please contact support."
          : "Something went wrong. Please try again.";
        setMessages([...next, { role: "assistant", content: errText }]);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let acc = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 flex size-16 items-center justify-center rounded-full bg-gradient-bee shadow-bee animate-pulse-glow transition hover:scale-110"
        >
          <img src={beeLogo} alt="" width={42} height={42} className="animate-float" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl animate-fade-up">
          <div className="flex items-center justify-between bg-gradient-bee px-4 py-3 text-ink">
            <div className="flex items-center gap-2">
              <img src={beeLogo} alt="" width={32} height={32} />
              <div>
                <p className="text-sm font-bold">Near Bee Assistant</p>
                <p className="text-[10px] flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-600" /> Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-black/10">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-ink px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-bee px-3.5 py-2 text-sm text-ink shadow-bee">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                    {m.content || <Loader2 size={14} className="animate-spin text-bee" />}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 bg-black p-2">
            <div className="flex items-end gap-2 rounded-xl bg-white/5 p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask me anything…"
                rows={1}
                className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-bee text-ink shadow-bee disabled:opacity-40"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
