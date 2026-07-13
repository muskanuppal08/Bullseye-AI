import { NextRequest } from "next/server";
import { createAgentGraph } from "./agent";

// Enable edge/streaming response support in Next.js
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a ReadableStream for Server-Sent Events (SSE)
  const stream = new ReadableStream({
    async start(controller) {
      // Helper to enqueue event packets
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = await req.json();
        const { ticker, apiKey } = body;

        if (!ticker) {
          sendEvent({ error: "No stock ticker provided." });
          controller.close();
          return;
        }

        const cleanTicker = ticker.toUpperCase().trim();

        // 1. Initialize the LangGraph compiled state machine with active feedback hooks
        const agentGraph = createAgentGraph(apiKey, (node, log, snapshot) => {
          sendEvent({
            status: "running",
            node,
            log,
            snapshot,
          });
        });

        // 2. Define the initial state container matching our annotation schema
        const initialState = {
          ticker: cleanTicker,
          name: "",
          verdict: "" as const,
          confidenceScore: 0,
          summary: "",
          metrics: {
            pe: 0,
            peg: 0,
            margin: 0,
            debtToEquity: 0,
            revenue: "",
            marketCap: "",
          },
          swot: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
          },
          details: {
            financials: "",
            sentiment: "",
            competitors: "",
            risks: "",
          },
          competitorsList: [],
          logs: [],
        };

        sendEvent({ status: "start", log: `🚀 [System] Executing state graph for ${cleanTicker}...` });

        // 3. Invoke the LangGraph workflow
        const finalState = await agentGraph.invoke(initialState);

        // 4. Stream the finalized report state
        sendEvent({
          status: "completed",
          report: finalState,
        });

        controller.close();
      } catch (err: any) {
        console.error("Agent workflow error:", err);
        sendEvent({
          status: "error",
          error: err.message || "An unexpected error occurred during research.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in Nginx/Vercel proxies for real-time streaming
    },
  });
}
