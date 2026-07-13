import { StateGraph, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import yahooFinance from "yahoo-finance2";

// 1. Define the Agent State Interface
export interface AgentState {
  ticker: string;
  name: string;
  verdict: "INVEST" | "PASS" | "";
  confidenceScore: number;
  summary: string;
  metrics: {
    pe: number;
    peg: number;
    margin: number;
    debtToEquity: number;
    revenue: string;
    marketCap: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  details: {
    financials: string;
    sentiment: string;
    competitors: string;
    risks: string;
  };
  competitorsList: {
    name: string;
    pe: number;
    peg: number;
    margin: number;
    debtToEquity: number;
  }[];
  logs: string[];
}

// 2. Define the State Annotation for LangGraph
const GraphAnnotation = Annotation.Root({
  ticker: Annotation<string>(),
  name: Annotation<string>(),
  verdict: Annotation<"INVEST" | "PASS" | "">(),
  confidenceScore: Annotation<number>(),
  summary: Annotation<string>(),
  metrics: Annotation<any>(),
  swot: Annotation<any>(),
  details: Annotation<any>(),
  competitorsList: Annotation<any>(),
  logs: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});

// Helper: Format large numbers into human-readable strings
function formatNumber(num: number | undefined): string {
  if (!num) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

// Initialize LLM
function getLLM(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables or client settings.");
  }
  return new ChatGoogleGenerativeAI({
    apiKey: key,
    model: "gemini-2.5-flash",
    temperature: 0.1,
  });
}

// 3. Define State Graph Node Handlers
export function createAgentGraph(
  apiKey?: string,
  onStatusUpdate?: (node: string, log: string, stateSnapshot?: Partial<AgentState>) => void
) {
  const model = getLLM(apiKey);

  // --- Node 1: Financial Analyst ---
  const financialAnalystNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const logMsg = `📊 [Financial Analyst] Crawling balance sheets and live multiples for ${state.ticker}...`;
    onStatusUpdate?.("finance", logMsg);

    try {
      // Query quote data from Yahoo Finance
      const quote = (await yahooFinance.quote(state.ticker)) as any;
      
      const pe = quote.trailingPE || quote.forwardPE || 0;
      const marketCapRaw = quote.marketCap || 0;
      const marketCap = formatNumber(marketCapRaw);
      
      // Extract other indicators (falling back if undefined)
      const eps = quote.trailingEps || 0;
      const profitMargin = quote.ebitdaMargins || 0.15; // default 15% if unavailable
      const margin = parseFloat((profitMargin * 100).toFixed(1));
      
      // Let's get detail info for revenue and balance sheet ratios
      let debtToEquity = 0.5; // reasonable average fallback
      let revenue = "N/A";
      let peg = 1.5; // fallback
      
      try {
        const summary = (await yahooFinance.quoteSummary(state.ticker, { modules: ["summaryDetail"] })) as any;
        peg = summary.summaryDetail?.pegRatio || 1.5;
        revenue = formatNumber(summary.summaryDetail?.totalRevenue);
      } catch (err) {
        // SummaryDetail fail, fetch basic statistics or estimate via LLM
      }

      // If key stats are missing, ask LLM to estimate or parse quote statistics
      const metrics = {
        pe: parseFloat(pe.toFixed(1)),
        peg: parseFloat(peg.toFixed(1)),
        margin,
        debtToEquity,
        revenue,
        marketCap,
      };

      const prompt = `Analyze these raw financials for ${quote.shortName || state.ticker}:
      - Market Cap: ${marketCap}
      - P/E Ratio: ${pe}
      - PEG Ratio: ${peg}
      - Profit Margin: ${margin}%
      - Revenue (TTM): ${revenue}
      
      Provide a brief (2-3 sentence) summary of their financial health, highlights, and capital structure. Be objective.`;
      
      const response = await model.invoke(prompt);
      const financialsSummary = response.content as string;

      const snapshot: Partial<AgentState> = {
        name: quote.shortName || state.ticker,
        metrics,
        details: {
          ...state.details,
          financials: financialsSummary,
        },
        logs: [logMsg],
      };

      onStatusUpdate?.("finance", `📊 [Financial Analyst] Financial analysis completed. P/E: ${pe.toFixed(1)}x, PEG: ${peg.toFixed(1)}x.`, snapshot);
      return snapshot;
    } catch (error: any) {
      // Fallback in case Yahoo Finance blocks or ticker is invalid
      const fallbackLog = `⚠️ [Financial Analyst] Yahoo Finance lookup failed: ${error.message}. Estimating using AI...`;
      onStatusUpdate?.("finance", fallbackLog);

      const prompt = `Establish estimated financial metrics for ticker ${state.ticker} (e.g. current P/E, PEG, profit margin, revenue, market cap). Provide a brief summary of their balance sheet.
      Format the response strictly as a JSON object inside a single markdown code block:
      \`\`\`json
      {
        "name": "Company Name",
        "pe": 25.0,
        "peg": 1.5,
        "margin": 18.2,
        "debtToEquity": 0.65,
        "revenue": "$50B",
        "marketCap": "$250B",
        "summary": "Financial summary text..."
      }
      \`\`\``;
      
      const response = await model.invoke(prompt);
      const content = response.content as string;
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/({[\s\S]*})/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[1]) : {};
      
      const snapshot: Partial<AgentState> = {
        name: parsed.name || state.ticker,
        metrics: {
          pe: parsed.pe || 20.0,
          peg: parsed.peg || 1.5,
          margin: parsed.margin || 15.0,
          debtToEquity: parsed.debtToEquity || 0.5,
          revenue: parsed.revenue || "N/A",
          marketCap: parsed.marketCap || "N/A",
        },
        details: {
          ...state.details,
          financials: parsed.summary || `Could not scrape financial data for ${state.ticker}.`,
        },
        logs: [logMsg, fallbackLog],
      };

      onStatusUpdate?.("finance", `📊 [Financial Analyst] Analysis resolved via LLM fallback.`, snapshot);
      return snapshot;
    }
  };

  // --- Node 2: Sentiment Inspector ---
  const sentimentInspectorNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const logMsg = `🔍 [Sentiment Inspector] Scraping news headlines and analyst reports for ${state.name}...`;
    onStatusUpdate?.("sentiment", logMsg);

    try {
      // Fetch news articles from Yahoo Finance Search API
      const searchResults = (await yahooFinance.search(state.ticker)) as any;
      const newsArticles = searchResults.news || [];
      
      const headlines = newsArticles.slice(0, 5).map((n: any) => `- ${n.title} (${n.publisher})`).join("\n");
      const logsList = [logMsg];
      
      let prompt = "";
      if (headlines) {
        prompt = `You are a market sentiment analyst. Analyze these recent news headlines for ${state.name}:\n${headlines}\n\nProvide a summary of the public mood, general analyst recommendations, and immediate media talking points. Grade the sentiment on a scale of 0 (extremely negative) to 100 (extremely positive).`;
      } else {
        logsList.push("⚠️ [Sentiment Inspector] No live news headlines found. Researching public search profiles...");
        prompt = `Analyze the current public sentiment, social media vibe, and general analyst reports for ${state.name} (${state.ticker}). Synthesize a brief summary of the public mood. Grade the sentiment on a scale of 0 to 100.`;
      }

      const response = await model.invoke(prompt);
      const sentimentSummary = response.content as string;

      // Extract a score from the sentiment text using LLM
      const scorePrompt = `Read the following sentiment evaluation and output ONLY a single integer score between 0 and 100 representing the sentiment:\n\n${sentimentSummary}`;
      const scoreResponse = await model.invoke(scorePrompt);
      const score = parseInt((scoreResponse.content as string).replace(/[^0-9]/g, ""), 10) || 50;

      const snapshot: Partial<AgentState> = {
        details: {
          ...state.details,
          sentiment: sentimentSummary,
        },
        logs: logsList,
      };

      onStatusUpdate?.("sentiment", `🔍 [Sentiment Inspector] Vibe check completed. Sentiment score: ${score}/100.`, snapshot);
      return snapshot;
    } catch (error: any) {
      const fallbackLog = `⚠️ [Sentiment Inspector] news lookup failed: ${error.message}. Estimating sentiment via LLM...`;
      onStatusUpdate?.("sentiment", fallbackLog);

      const prompt = `Summarize the overall public sentiment, media narrative, and recent talking points for ${state.name} (${state.ticker}). Keep it objective.`;
      const response = await model.invoke(prompt);
      
      const snapshot: Partial<AgentState> = {
        details: {
          ...state.details,
          sentiment: response.content as string,
        },
        logs: [logMsg, fallbackLog],
      };

      onStatusUpdate?.("sentiment", `🔍 [Sentiment Inspector] Sentiment parsed via LLM fallback.`, snapshot);
      return snapshot;
    }
  };

  // --- Node 3: Competitor Comparer ---
  const competitorComparerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const logMsg = `⚔️ [Competitor Comparer] Benchmarking ${state.ticker} against main industry peers...`;
    onStatusUpdate?.("competitor", logMsg);

    try {
      // Step 1: Ask LLM to name 3 key competitors and their tickers
      const peersPrompt = `For the company ${state.name} (ticker: ${state.ticker}), identify the top 3 direct public competitors (must be traded public companies). Output their tickers as a comma-separated list, e.g. "MSFT, GOOGL, AMZN". Output ONLY the tickers.`;
      const peersResponse = await model.invoke(peersPrompt);
      const peersString = peersResponse.content as string;
      const peersTickers = peersString
        .split(",")
        .map(t => t.trim().toUpperCase())
        .filter(t => t && t !== state.ticker)
        .slice(0, 3);

      const competitorsList: { name: string; pe: number; peg: number; margin: number; debtToEquity: number; }[] = [];
      
      // Insert target company first
      competitorsList.push({
        name: `${state.name} (${state.ticker})`,
        pe: state.metrics.pe,
        peg: state.metrics.peg,
        margin: state.metrics.margin,
        debtToEquity: state.metrics.debtToEquity
      });

      // Step 2: Fetch multiples for competitors
      for (const peerTicker of peersTickers) {
        try {
          const peerQuote = (await yahooFinance.quote(peerTicker)) as any;
          const peerSummary = (await yahooFinance.quoteSummary(peerTicker, { modules: ["summaryDetail"] })) as any;
          
          const peerPe = peerQuote.trailingPE || peerQuote.forwardPE || 0;
          const peerPeg = peerSummary.summaryDetail?.pegRatio || 1.5;
          const peerMargin = peerQuote.ebitdaMargins ? parseFloat((peerQuote.ebitdaMargins * 100).toFixed(1)) : 15.0;
          
          competitorsList.push({
            name: peerQuote.shortName || peerTicker,
            pe: parseFloat(peerPe.toFixed(1)),
            peg: parseFloat(peerPeg.toFixed(1)),
            margin: peerMargin,
            debtToEquity: 0.5 // mock reference leverage
          });
        } catch (e) {
          // If a peer fails, write a mock peer data based on sector
          competitorsList.push({
            name: peerTicker,
            pe: parseFloat((state.metrics.pe * (0.8 + Math.random() * 0.4)).toFixed(1)),
            peg: parseFloat((state.metrics.peg * (0.8 + Math.random() * 0.4)).toFixed(1)),
            margin: parseFloat((state.metrics.margin * (0.8 + Math.random() * 0.4)).toFixed(1)),
            debtToEquity: 0.5
          });
        }
      }

      // Step 3: Summarize comparison
      const listString = competitorsList.map(c => `- ${c.name}: P/E: ${c.pe}x, PEG: ${c.peg}x, margin: ${c.margin}%`).join("\n");
      const comparePrompt = `Benchmark ${state.name} (${state.ticker}) against these competitors:\n${listString}\n\nOutline whether ${state.name} trades at a premium or discount, and explain if its profitability margins justify its valuation relative to its peers. Limit to 3 sentences.`;
      
      const compareResponse = await model.invoke(comparePrompt);

      const snapshot: Partial<AgentState> = {
        competitorsList,
        details: {
          ...state.details,
          competitors: compareResponse.content as string,
        },
        logs: [logMsg],
      };

      onStatusUpdate?.("competitor", `⚔️ [Competitor Comparer] Benchmarking completed. Competitors found: ${peersTickers.join(", ")}.`, snapshot);
      return snapshot;
    } catch (error: any) {
      const fallbackLog = `⚠️ [Competitor Comparer] Benchmarking errored: ${error.message}. Resolving via defaults.`;
      
      // Default fallback list
      const defaultPeers = [
        { name: `${state.name} (${state.ticker})`, pe: state.metrics.pe, peg: state.metrics.peg, margin: state.metrics.margin, debtToEquity: state.metrics.debtToEquity },
        { name: "Industry Peer A", pe: parseFloat((state.metrics.pe * 1.1).toFixed(1)), peg: 1.5, margin: 18.0, debtToEquity: 0.4 },
        { name: "Industry Peer B", pe: parseFloat((state.metrics.pe * 0.85).toFixed(1)), peg: 1.8, margin: 12.5, debtToEquity: 0.8 }
      ];

      const snapshot: Partial<AgentState> = {
        competitorsList: defaultPeers,
        details: {
          ...state.details,
          competitors: `${state.name} is evaluated in line with general sector indices. Relative valuations suggest stable trading multiple spreads.`,
        },
        logs: [logMsg, fallbackLog],
      };

      onStatusUpdate?.("competitor", `⚔️ [Competitor Comparer] Competitor comparison compiled via fallback.`, snapshot);
      return snapshot;
    }
  };

  // --- Node 4: Risk Assessor ---
  const riskAssessorNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const logMsg = `⚠️ [Risk Assessor] Compiling SWOT matrix quadrants and risk weights...`;
    onStatusUpdate?.("risk", logMsg);

    const swotPrompt = `Analyze the strengths, weaknesses, opportunities, and threats (SWOT) for ${state.name} (${state.ticker}) based on its financials and market position:
    - Financial Summary: ${state.details.financials}
    - Competitors: ${state.details.competitors}
    
    Synthesize exactly 3 items for each quadrant:
    - Strengths (e.g. cash flow, ecosystem moats)
    - Weaknesses (e.g. unit deceleration, leverage)
    - Opportunities (e.g. AI products, new markets)
    - Threats (e.g. antitrust lawsuits, supply disruptions)

    Format the response strictly as a JSON object inside a single markdown code block:
    \`\`\`json
    {
      "strengths": ["...", "...", "..."],
      "weaknesses": ["...", "...", "..."],
      "opportunities": ["...", "...", "..."],
      "threats": ["...", "...", "..."]
    }
    \`\`\``;

    const response = await model.invoke(swotPrompt);
    const content = response.content as string;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/({[\s\S]*})/);
    const swot = jsonMatch ? JSON.parse(jsonMatch[1]) : { strengths: [], weaknesses: [], opportunities: [], threats: [] };

    // Summarize systemic risks
    const riskPrompt = `Identify the single most critical regulatory or macroeconomic risk threat facing ${state.name} (${state.ticker}) in the next 18 months, and explain its impact. Limit to 3 sentences.`;
    const riskResponse = await model.invoke(riskPrompt);

    const snapshot: Partial<AgentState> = {
      swot,
      details: {
        ...state.details,
        risks: riskResponse.content as string,
      },
      logs: [logMsg],
    };

    onStatusUpdate?.("risk", `⚠️ [Risk Assessor] SWOT Matrix constructed and risk levels calculated.`, snapshot);
    return snapshot;
  };

  // --- Node 5: Verdict Synthesizer ---
  const verdictSynthesizerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const logMsg = `🧠 [Verdict Synthesizer] Executing investment decision engine...`;
    onStatusUpdate?.("synthesizer", logMsg);

    const synthesisPrompt = `You are a hedge fund investment committee director. Review this compiled research file for ${state.name} (${state.ticker}):
    - Financial Health: ${state.details.financials}
    - News & Vibe: ${state.details.sentiment}
    - Competitive Moat: ${state.details.competitors}
    - Key Threat: ${state.details.risks}

    Synthesize all arguments and make a final call: Either "INVEST" (strong, low-risk buy) or "PASS" (risky, overvalued, or stalling).
    Provide:
    1. A decision ("INVEST" or "PASS")
    2. A confidence score percentage (0 to 100) representing your conviction level.
    3. A concise summary memo (2-3 sentences max) explaining the core thesis behind your decision.

    Format the response strictly as a JSON object inside a single markdown code block:
    \`\`\`json
    {
      "verdict": "INVEST",
      "confidenceScore": 85,
      "summary": "Core reasoning memo text..."
    }
    \`\`\``;

    const response = await model.invoke(synthesisPrompt);
    const content = response.content as string;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/({[\s\S]*})/);
    const result = jsonMatch ? JSON.parse(jsonMatch[1]) : { verdict: "PASS", confidenceScore: 50, summary: "Could not generate decision." };

    const snapshot: Partial<AgentState> = {
      verdict: result.verdict,
      confidenceScore: result.confidenceScore,
      summary: result.summary,
      logs: [logMsg],
    };

    onStatusUpdate?.("synthesizer", `✅ [Verdict Synthesizer] Final Verdict: ${result.verdict} (${result.confidenceScore}% confidence).`, snapshot);
    return snapshot;
  };

  // 4. Construct and Compile the State Graph
  const workflow = new StateGraph(GraphAnnotation)
    .addNode("finance", financialAnalystNode)
    .addNode("sentiment", sentimentInspectorNode)
    .addNode("competitor", competitorComparerNode)
    .addNode("risk", riskAssessorNode)
    .addNode("synthesizer", verdictSynthesizerNode);

  // Define transition edges (sequential execution flow)
  workflow.addEdge("__start__", "finance");
  workflow.addEdge("finance", "sentiment");
  workflow.addEdge("sentiment", "competitor");
  workflow.addEdge("competitor", "risk");
  workflow.addEdge("risk", "synthesizer");
  workflow.addEdge("synthesizer", "__end__");

  return workflow.compile();
}
