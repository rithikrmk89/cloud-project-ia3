import { createFileRoute } from "@tanstack/react-router";

const SYSTEM = `You are the Near Bee Assistant, a friendly 🐝 helper for a local services marketplace.

Near Bee connects users with verified local helpers for 12 services: pet care, pest control, car washing, house cleaning, movers & packers, cook service, water tank cleaning, laundry & ironing, plant maintenance, housekeeping, home organizing service, and bathroom deep cleaning.

How it works:
1) Set location (state → district → area), 2) Pick a service, 3) Choose a provider from the list, 4) Provider arrives, 5) Work completed with photos, 6) Pay & review.

Key answers:
- Book a service: open the dashboard, set your location, pick a category, browse providers and send a request.
- Find invoices: go to My Invoices in the dashboard. PDF download available.
- Raise complaint: go to Complaints, fill subject + description.
- Become a provider: from the landing page, click Become a Provider and fill the application (admin approval required).
- Pricing: transparent starting prices per service. No hidden fees.

Style: short, warm, helpful, 1-3 sentences. Use 🐝 occasionally. If asked something off-topic, gently steer back to Near Bee.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: Array<{ role: string; content: string }> };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI not configured", { status: 500 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            stream: true,
            messages: [
              { role: "system", content: SYSTEM },
              ...messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
            ],
          }),
        });

        if (!upstream.ok) {
          return new Response(`AI error`, { status: upstream.status });
        }

        const stream = new ReadableStream({
          async start(controller) {
            const reader = upstream.body!.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (payload === "[DONE]") { controller.close(); return; }
                  try {
                    const j = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
                    const text = j.choices?.[0]?.delta?.content;
                    if (text) controller.enqueue(encoder.encode(text));
                  } catch {}
                }
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
