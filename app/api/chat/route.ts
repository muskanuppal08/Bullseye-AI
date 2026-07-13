import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, message, report, apiKey } = body;

    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 400 }
      );
    }

    if (!message || !report) {
      return NextResponse.json(
        { error: "Message or report data is missing." },
        { status: 400 }
      );
    }

    // Initialize the Gemini model using LangChain's integration
    const model = new ChatGoogleGenerativeAI({
      apiKey: key,
      model: "gemini-2.5-flash",
      temperature: 0.2,
    });

    const prompt = `You are the BullseyeAI Investment Research Agent. You recently completed a comprehensive deep-dive research memo for ${report.name} (${report.ticker}).

Here is the compiled research folder details:
- Verdict: ${report.verdict} (${report.confidenceScore}% Conviction Confidence)
- Executive Summary: ${report.summary}
- Financials Health Brief: ${report.details.financials}
- Sentiment & Market Vibe: ${report.details.sentiment}
- Peer Competitors comparison: ${report.details.competitors}
- Critical Risks: ${report.details.risks}

Key metrics: 
- P/E: ${report.metrics.pe}x
- PEG: ${report.metrics.peg}x
- profit margin: ${report.metrics.margin}%
- debt-to-equity: ${report.metrics.debtToEquity}

The user is asking a follow-up question regarding this company report:
"${message}"

Answer the user's question directly and professionally using the compiled research files above. If the answer is not in the text, leverage your general financial intelligence to answer reasonably while staying strictly consistent with your final verdict of "${report.verdict}". Keep your response concise (3-4 sentences maximum).`;

    const result = await model.invoke(prompt);
    const text = result.content as string;

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat processing." },
      { status: 500 }
    );
  }
}
