"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  MessageSquare, 
  Activity, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  BookOpen, 
  Settings, 
  History, 
  Terminal as TerminalIcon 
} from "lucide-react";
import { mockReports, InvestmentReport } from "./mocks";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [activeTab, setActiveTab] = useState("terminal"); // sidebar navigation
  const [reportTab, setReportTab] = useState("summary"); // report view tabs
  const [status, setStatus] = useState<"idle" | "analyzing" | "completed">("idle");
  const [activeNode, setActiveNode] = useState<string>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<InvestmentReport | null>(null);
  
  // Follow-up chat states
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "agent"; text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Simulate LangGraph Agent research execution
  const handleStartAnalysis = (searchTicker: string) => {
    if (!searchTicker) return;
    const cleanTicker = searchTicker.toUpperCase().trim();
    setTicker(cleanTicker);
    setStatus("analyzing");
    setLogs([]);
    setActiveNode("start");
    
    // Simulate steps in the state graph
    const steps = [
      { node: "start", log: "🚀 [System] Initializing state graph with target: " + cleanTicker, delay: 0 },
      { node: "finance", log: "📊 [Financial Analyst] Querying balance sheet, debt levels, and valuation multiples...", delay: 800 },
      { node: "finance", log: "📊 [Financial Analyst] Calculated metrics: Debt-to-Equity, P/E ratio, operating margins.", delay: 1600 },
      { node: "sentiment", log: "🔍 [Sentiment Inspector] Scraping news sources, Reddit investor discussions, and blogs...", delay: 2400 },
      { node: "sentiment", log: "🔍 [Sentiment Inspector] Sentiment score synthesized. Key drivers: product demand, regulation.", delay: 3200 },
      { node: "competitor", log: "⚔️ [Competitor Comparer] Benchmarking valuation ratios against industry median...", delay: 4000 },
      { node: "risk", log: "⚠️ [Risk Assessor] Compiling SWOT matrix quadrants and regulatory risk weights...", delay: 4800 },
      { node: "synthesizer", log: "🧠 [Verdict Synthesizer] Running final multi-dimensional investment reasoning...", delay: 5600 },
      { node: "synthesizer", log: "✅ [System] Decision compiled. Report generation complete.", delay: 6400 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setActiveNode(step.node);
        setLogs((prev) => [...prev, step.log]);
        
        // When finished
        if (step.node === "synthesizer" && step.log.includes("complete")) {
          setTimeout(() => {
            // Load mock report if exists, otherwise generate dynamic one
            const report = mockReports[cleanTicker] || generateFallbackReport(cleanTicker);
            setSelectedReport(report);
            setStatus("completed");
            setActiveNode("idle");
            setChatMessages([
              { 
                sender: "agent", 
                text: `Hi! I've finalized my research on ${report.name} (${report.ticker}). I've issued a decision of **${report.verdict}** with **${report.confidenceScore}% confidence**. Ask me anything about their financials, risks, or competitors!` 
              }
            ]);
          }, 800);
        }
      }, step.delay);
    });
  };

  const generateFallbackReport = (t: string): InvestmentReport => {
    return {
      ticker: t,
      name: `${t} Corp`,
      verdict: "PASS",
      confidenceScore: 58,
      summary: `Automated analysis for ${t} indicates high volatility and moderate valuation risk. Due to limited coverage in our primary indexes, our agents advise caution until more historic metrics are established.`,
      metrics: {
        pe: 22.4,
        peg: 1.6,
        margin: 12.8,
        debtToEquity: 0.95,
        revenue: "$1.2B",
        marketCap: "$8.5B",
      },
      swot: {
        strengths: ["Strong niche positioning", "Adaptable cost structures"],
        weaknesses: ["Higher cost of capital", "Limited pricing power"],
        opportunities: ["Expansion into adjacencies", "Digital channel scale"],
        threats: ["Intense macroeconomic competition", "Strict interest rate environments"]
      },
      details: {
        financials: "Financial leverage is moderate (Debt/Equity: 0.95). Operational growth is flat at +3.2% year-on-year. Current cash reserves stand at $420M, securing 18 months of burn.",
        sentiment: "Sentiment is neutral. Analyst reviews indicate 3 Buys, 5 Holds, 1 Sell. Online discussion volume is relatively low.",
        competitors: "The company trades in line with sector averages, but its smaller scale limits market power compared to tier-1 competitors.",
        risks: "Sovereign interest rate hikes pose a refinancing threat in late 2026."
      },
      competitorsList: [
        { name: `${t} (Target)`, pe: 22.4, peg: 1.6, margin: 12.8, debtToEquity: 0.95 },
        { name: "Industry Leader", pe: 28.5, peg: 1.2, margin: 18.5, debtToEquity: 0.45 },
        { name: "Competitor B", pe: 19.8, peg: 1.8, margin: 11.2, debtToEquity: 1.10 }
      ]
    };
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedReport) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    // Simulate Agent follow-up response
    setTimeout(() => {
      let responseText = `I ran a quick cross-examination of the research file for ${selectedReport.name}. Regarding "${userMsg}": `;
      const query = userMsg.toLowerCase();
      
      if (query.includes("financial") || query.includes("debt") || query.includes("pe") || query.includes("balance")) {
        responseText += `The financial data shows a leverage ratio of ${selectedReport.metrics.debtToEquity} and P/E ratio of ${selectedReport.metrics.pe}. ${selectedReport.details.financials}`;
      } else if (query.includes("risk") || query.includes("weakness") || query.includes("threat") || query.includes("regulation")) {
        responseText += `Our risk report highlights: ${selectedReport.swot.threats[0]} and ${selectedReport.swot.weaknesses[0]}. ${selectedReport.details.risks}`;
      } else if (query.includes("sentiment") || query.includes("news") || query.includes("what people say")) {
        responseText += `Current sentiment analysis notes: ${selectedReport.details.sentiment}`;
      } else if (query.includes("competitor") || query.includes("better") || query.includes("comparison")) {
        responseText += `Comparing with competitors: ${selectedReport.details.competitors}`;
      } else {
        responseText += `My core reasoning for the **${selectedReport.verdict}** decision is based on: ${selectedReport.summary} Let me know if you would like me to dissect their specific balance sheet ratios or customer sentiment logs further.`;
      }

      setChatMessages((prev) => [...prev, { sender: "agent", text: responseText }]);
      setIsChatLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-space text-text-primary bg-mesh-purple">
      
      {/* 🧭 Sidebar Component */}
      <aside className="w-64 border-r border-glass-border bg-glass-card/30 backdrop-blur-xl flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-lg shadow-brand-purple/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-outfit font-bold text-xl bg-gradient-to-r from-white via-text-primary to-brand-pink bg-clip-text text-transparent">
                BullseyeAI
              </span>
              <span className="block text-[10px] text-text-secondary uppercase tracking-widest font-mono">
                Investment Agent
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("terminal")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "terminal" 
                  ? "bg-brand-purple/20 text-white border border-brand-purple/35 shadow-inner" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <TerminalIcon className="h-4.5 w-4.5" />
              Research Terminal
            </button>
            <button 
              onClick={() => {
                setActiveTab("memos");
                if (selectedReport) setStatus("completed");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "memos" 
                  ? "bg-brand-purple/20 text-white border border-brand-purple/35 shadow-inner" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <History className="h-4.5 w-4.5" />
              Past Memos
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "settings" 
                  ? "bg-brand-purple/20 text-white border border-brand-purple/35 shadow-inner" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              Settings
            </button>
            <button 
              onClick={() => setActiveTab("docs")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "docs" 
                  ? "bg-brand-purple/20 text-white border border-brand-purple/35 shadow-inner" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              API Documentation
            </button>
          </nav>
        </div>

        <div className="p-4 rounded-xl glass-panel bg-white/3 border-white/5 text-center">
          <span className="text-[11px] text-text-secondary block mb-1">InsideIIM x Altuni Labs</span>
          <span className="text-[10px] text-brand-pink font-mono">v1.0.0 Stable</span>
        </div>
      </aside>

      {/* 🖥️ Main Workspace Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Glow Spheres for Visual Spiciness */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-pink/5 blur-[120px] pointer-events-none" />

        {/* 💻 Header */}
        <header className="h-16 border-b border-glass-border px-8 flex items-center justify-between bg-glass-card/10 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status === "analyzing" ? "bg-warn-amber animate-pulse" : "bg-invest-green"} block`} />
              Agent Status: {status === "idle" ? "Online & Idle" : status === "analyzing" ? "Running Graphs" : "Analysis Finished"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-text-secondary font-mono">
              Model: <span className="text-brand-pink">gemini-2.5-flash</span>
            </div>
            <button 
              onClick={() => {
                setStatus("idle");
                setSelectedReport(null);
                setTicker("");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Terminal
            </button>
          </div>
        </header>

        {/* 🎛️ Dynamic Body Switch */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">

          {activeTab === "terminal" && (
            <>
              {/* 1️⃣ IDLE STATE (Home / Search Ticker) */}
              {status === "idle" && (
                <div className="max-w-4xl mx-auto py-12 flex flex-col items-center">
                  <div className="text-center mb-10 max-w-2xl">
                    <span className="px-3.5 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-pink font-semibold uppercase tracking-wider mb-4 inline-block">
                      AI Investment Research Agent
                    </span>
                    <h1 className="font-outfit font-extrabold text-5xl leading-tight mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                      Deep-Dive Stock Analysis.<br />Powered by Collaborative AI.
                    </h1>
                    <p className="text-text-secondary text-base leading-relaxed">
                      Enter a company name or ticker symbol. Specialized AI agents will crawl financials, assess market sentiment, and benchmark competitors using LangGraph.js.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleStartAnalysis(ticker); }} 
                    className="w-full max-w-xl flex gap-3 p-2.5 rounded-2xl glass-panel bg-glass-card border-glass-border focus-within:border-brand-purple/50 focus-within:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 mb-12"
                  >
                    <div className="flex-1 flex items-center pl-3">
                      <Search className="h-5 w-5 text-text-secondary mr-3" />
                      <input 
                        type="text" 
                        placeholder="Search stock ticker (e.g. AAPL, NVDA, TSLA)..." 
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        className="bg-transparent border-none outline-none w-full text-white placeholder-text-secondary text-sm font-medium"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={!ticker.trim()}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold text-sm hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                      Analyze Stock
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Suggested Stocks Grid */}
                  <div className="w-full">
                    <span className="block font-mono text-[10px] text-text-secondary uppercase tracking-widest text-center mb-6">
                      Suggested Analyses
                    </span>
                    <div className="grid grid-cols-3 gap-6">
                      {Object.values(mockReports).map((report) => (
                        <button
                          key={report.ticker}
                          onClick={() => handleStartAnalysis(report.ticker)}
                          className="glass-panel glass-panel-hover p-6 text-left relative overflow-hidden group cursor-pointer"
                        >
                          {/* Colored Corner Indicator */}
                          <div className={`absolute top-0 right-0 h-10 w-10 bg-gradient-to-bl ${
                            report.verdict === "INVEST" ? "from-invest-green/20 to-transparent" : "from-pass-red/20 to-transparent"
                          } group-hover:scale-125 transition-transform`} />
                          
                          <div className="flex justify-between items-start mb-4">
                            <span className="font-mono text-sm px-2 py-0.5 rounded bg-white/5 border border-white/5 text-brand-pink font-semibold">
                              {report.ticker}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                              report.verdict === "INVEST" 
                                ? "bg-invest-green/10 text-invest-green border border-invest-green/20" 
                                : "bg-pass-red/10 text-pass-red border border-pass-red/20"
                            }`}>
                              {report.verdict === "INVEST" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {report.verdict}
                            </span>
                          </div>
                          <h3 className="font-outfit font-bold text-lg text-white mb-2 group-hover:text-brand-pink transition-colors">
                            {report.name}
                          </h3>
                          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                            {report.summary}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2️⃣ ANALYZING STATE (Graph Node Engine & Logs) */}
              {status === "analyzing" && (
                <div className="max-w-4xl mx-auto flex flex-col h-full justify-center">
                  
                  {/* Graph Visualizer Node Map */}
                  <div className="glass-panel p-8 mb-8 bg-glass-card/10 relative overflow-hidden">
                    <h2 className="font-outfit font-bold text-lg text-white mb-8 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-brand-purple animate-pulse" />
                      LangGraph Stateful Pipeline Trace
                    </h2>

                    <div className="flex justify-between items-center relative py-6 max-w-3xl mx-auto">
                      {/* Connection Line Bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/5 -translate-y-1/2 z-0" />
                      
                      {/* Nodes mapping */}
                      {[
                        { id: "start", label: "Start Query", desc: "Init graph State" },
                        { id: "finance", label: "Financials", desc: "P/E & Balance Sheet" },
                        { id: "sentiment", label: "Sentiment", desc: "News & Public mood" },
                        { id: "competitor", label: "Peers Bench", desc: "Valuation Compare" },
                        { id: "risk", label: "SWOT Risk", desc: "Threat Weights" },
                        { id: "synthesizer", label: "Synthesize", desc: "Decision Verdict" }
                      ].map((node, index) => {
                        const isCurrent = activeNode === node.id;
                        const isPast = index < ["start", "finance", "sentiment", "competitor", "risk", "synthesizer"].indexOf(activeNode);
                        
                        return (
                          <div key={node.id} className="flex flex-col items-center z-10 relative">
                            {/* Glowing radar ring on active */}
                            {isCurrent && (
                              <div className="absolute top-[-10px] h-14 w-14 rounded-full border border-brand-purple/40 animate-radar pointer-events-none" />
                            )}
                            
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-500 ${
                              isCurrent 
                                ? "bg-brand-purple text-white border-brand-pink shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110" 
                                : isPast
                                ? "bg-brand-purple/20 text-brand-pink border-brand-purple/50"
                                : "bg-[#0c0d12] text-text-secondary border-white/5"
                            }`}>
                              {isPast ? <CheckCircle2 className="h-4.5 w-4.5" /> : index + 1}
                            </div>
                            
                            <span className={`block text-xs font-semibold mt-3 ${isCurrent ? "text-white text-glow-purple" : "text-text-secondary"}`}>
                              {node.label}
                            </span>
                            <span className="block text-[9px] text-text-secondary/60 mt-1 max-w-[80px] text-center font-mono">
                              {node.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Terminal Console Logs */}
                  <div className="glass-panel p-6 bg-black/60 border-glass-border font-mono text-xs text-text-secondary h-64 flex flex-col justify-between shadow-2xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <TerminalIcon className="h-4 w-4 text-brand-pink" />
                        <span className="text-white font-semibold">Agent Activity Console</span>
                      </div>
                      <span className="text-[10px] text-text-secondary/50">Trace ID: b35e-99f-7ac</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                      {logs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed animate-fade-in">
                          <span className="text-brand-purple mr-1">&gt;</span>
                          <span className={log.includes("System") ? "text-brand-pink" : log.includes("Error") ? "text-pass-red" : "text-text-primary"}>
                            {log}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3 text-[10px] text-text-secondary/40">
                      <span>Graph State variables populated: {["company", "financials", "sentiment", "verdict"].slice(0, logs.length / 2).join(", ") || "none"}</span>
                      <span className="animate-pulse">CRAWLING SOURCES...</span>
                    </div>
                  </div>

                </div>
              )}

              {/* 3️⃣ COMPLETED STATE (Vibrant Verdict Dashboard) */}
              {status === "completed" && selectedReport && (
                <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
                  
                  {/* Verdict Top Card */}
                  <div className="glass-panel p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Glowing Mesh Corner Indicator */}
                    <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-[80px] opacity-25 pointer-events-none ${
                      selectedReport.verdict === "INVEST" ? "bg-invest-green" : "bg-pass-red"
                    }`} />
                    
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-brand-pink font-semibold">
                          {selectedReport.ticker}
                        </span>
                        <h2 className="font-outfit font-extrabold text-3xl text-white">
                          {selectedReport.name}
                        </h2>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                        {selectedReport.summary}
                      </p>
                    </div>

                    {/* Verdict Gauge Circle */}
                    <div className="flex items-center gap-6 pr-4">
                      <div className="text-right">
                        <span className="block text-[10px] text-text-secondary uppercase tracking-widest font-mono mb-1">
                          Research Verdict
                        </span>
                        <span className={`block font-outfit font-black text-4xl uppercase tracking-wider ${
                          selectedReport.verdict === "INVEST" ? "text-invest-green text-glow-emerald" : "text-pass-red text-glow-rose"
                        }`}>
                          {selectedReport.verdict}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {selectedReport.confidenceScore}% confidence rating
                        </span>
                      </div>

                      {/* Custom visual confidence ring */}
                      <div className="relative h-20 w-20 flex items-center justify-center">
                        <svg className="h-full w-full transform -rotate-90">
                          <circle cx="40" cy="40" r="34" className="stroke-white/5 fill-transparent" strokeWidth="6" />
                          <circle 
                            cx="40" 
                            cy="40" 
                            r="34" 
                            className={`fill-transparent transition-all duration-1000 ${
                              selectedReport.verdict === "INVEST" ? "stroke-invest-green" : "stroke-pass-red"
                            }`} 
                            strokeWidth="6" 
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - selectedReport.confidenceScore / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute font-mono font-bold text-sm text-white">{selectedReport.confidenceScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { label: "P/E Ratio", value: selectedReport.metrics.pe, note: "Sector Avg: 24.5x" },
                      { label: "PEG Ratio", value: selectedReport.metrics.peg, note: "Under 1.5x is cheap" },
                      { label: "Profit Margin", value: selectedReport.metrics.margin + "%", note: "High margins = Moat" },
                      { label: "Debt to Equity", value: selectedReport.metrics.debtToEquity, note: "Under 1.0 is healthy" }
                    ].map((metric, idx) => (
                      <div key={idx} className="glass-panel p-5 bg-white/2">
                        <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-2 font-mono">{metric.label}</span>
                        <span className="block text-2xl font-bold text-white mb-1 font-outfit">{metric.value}</span>
                        <span className="text-[10px] text-text-secondary/50 block">{metric.note}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sub-Tabs Switch (SWOT, Reports, Peers Chart) */}
                  <div className="border-b border-glass-border flex gap-6">
                    <button 
                      onClick={() => setReportTab("summary")}
                      className={`pb-4 text-sm font-semibold transition-all relative ${
                        reportTab === "summary" ? "text-white" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      SWOT Analysis
                      {reportTab === "summary" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />}
                    </button>
                    <button 
                      onClick={() => setReportTab("details")}
                      className={`pb-4 text-sm font-semibold transition-all relative ${
                        reportTab === "details" ? "text-white" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Specialist Briefs
                      {reportTab === "details" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />}
                    </button>
                    <button 
                      onClick={() => setReportTab("chart")}
                      className={`pb-4 text-sm font-semibold transition-all relative ${
                        reportTab === "chart" ? "text-white" : "text-text-secondary hover:text-white"
                      }`}
                    >
                      Competitor Benchmarks
                      {reportTab === "chart" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple" />}
                    </button>
                  </div>

                  {/* SWOT Grid View */}
                  {reportTab === "summary" && (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="glass-panel p-6 border-invest-green/20 bg-invest-green/2">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-invest-green" />
                          <h4 className="font-outfit font-bold text-base text-white">Strengths</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedReport.swot.strengths.map((str, idx) => (
                            <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-invest-green mt-1.5 shrink-0" />
                              {str}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="glass-panel p-6 border-pass-red/20 bg-pass-red/2">
                        <div className="flex items-center gap-2 mb-4">
                          <ShieldAlert className="h-5 w-5 text-pass-red" />
                          <h4 className="font-outfit font-bold text-base text-white">Weaknesses</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedReport.swot.weaknesses.map((wk, idx) => (
                            <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-pass-red mt-1.5 shrink-0" />
                              {wk}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="glass-panel p-6 border-brand-purple/20 bg-brand-purple/2">
                        <div className="flex items-center gap-2 mb-4">
                          <Layers className="h-5 w-5 text-brand-pink" />
                          <h4 className="font-outfit font-bold text-base text-white">Opportunities</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedReport.swot.opportunities.map((op, idx) => (
                            <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand-pink mt-1.5 shrink-0" />
                              {op}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="glass-panel p-6 border-warn-amber/20 bg-warn-amber/2">
                        <div className="flex items-center gap-2 mb-4">
                          <ShieldAlert className="h-5 w-5 text-warn-amber" />
                          <h4 className="font-outfit font-bold text-base text-white">Threats</h4>
                        </div>
                        <ul className="space-y-3">
                          {selectedReport.swot.threats.map((th, idx) => (
                            <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-warn-amber mt-1.5 shrink-0" />
                              {th}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Specialist Detailed Briefings */}
                  {reportTab === "details" && (
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { title: "Financial Analyst Brief", content: selectedReport.details.financials, tag: "Balance Sheet & Multiples" },
                        { title: "Market Vibe & Sentiment Report", content: selectedReport.details.sentiment, tag: "Social & Analyst Sentiment" },
                        { title: "Peers Benchmarking Summary", content: selectedReport.details.competitors, tag: "Relative Valuations" },
                        { title: "Systemic Risk Assessment", content: selectedReport.details.risks, tag: "Macro & Regulatory Risks" }
                      ].map((brief, idx) => (
                        <div key={idx} className="glass-panel p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-outfit font-bold text-white text-sm">{brief.title}</h4>
                            <span className="text-[9px] font-mono uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded text-text-secondary">{brief.tag}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {brief.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Benchmarking custom Charts */}
                  {reportTab === "chart" && (
                    <div className="glass-panel p-8 bg-glass-card/10">
                      <h4 className="font-outfit font-bold text-white text-base mb-6">
                        P/E Ratio Relative Benchmarking (Lower is cheaper)
                      </h4>
                      
                      <div className="space-y-5">
                        {selectedReport.competitorsList.map((comp, idx) => {
                          const isTarget = comp.name.includes(selectedReport.ticker);
                          // Calculate percentage of max P/E (let's assume max scale is 100 for normalization)
                          const percentage = Math.min((comp.pe / 100) * 100, 100);

                          return (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className={isTarget ? "text-brand-pink font-bold" : "text-text-secondary"}>
                                  {comp.name}
                                </span>
                                <span className="text-white font-mono">{comp.pe}x</span>
                              </div>
                              
                              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  style={{ width: `${percentage}%` }}
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    isTarget 
                                      ? "bg-gradient-to-r from-brand-purple to-brand-pink shadow-[0_0_10px_rgba(217,70,239,0.4)]" 
                                      : "bg-white/15"
                                  }`} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-text-secondary/50 font-mono">
                        Median Sector P/E benchmark stands at 24.5x. Valuation premium analysis is computed dynamically.
                      </div>
                    </div>
                  )}

                  {/* 💬 INTERACTIVE CHAT PANEL */}
                  <div className="glass-panel border-brand-purple/20 bg-glass-card/30 flex flex-col h-[400px] overflow-hidden shadow-2xl">
                    <div className="px-6 py-4 border-b border-glass-border bg-white/2 flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="h-5 w-5 text-brand-pink" />
                        <div>
                          <span className="font-outfit font-bold text-sm text-white">Cross-Examine the Investment Report</span>
                          <span className="block text-[10px] text-text-secondary">Ask questions about their debt, competitor advantages, or sentiment changes.</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-brand-purple/25 border border-brand-purple/45 px-2 py-0.5 rounded text-brand-pink">Interactive Chat Mode</span>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            msg.sender === "user" 
                              ? "bg-brand-purple/25 text-white border border-brand-purple/40 rounded-tr-none" 
                              : "bg-[#0b0c10] text-text-secondary border border-white/5 rounded-tl-none"
                          }`}>
                            <span className="block font-mono text-[9px] text-text-secondary/50 mb-1">
                              {msg.sender === "user" ? "You" : "Research Agent"}
                            </span>
                            <span className="whitespace-pre-wrap">{msg.text}</span>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-[#0b0c10] text-text-secondary border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce delay-100">●</span>
                            <span className="animate-bounce delay-200">●</span>
                            <span className="text-[10px] text-text-secondary/50 font-mono ml-1">Agent checking logs...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendChat} className="p-4 border-t border-glass-border bg-white/1 flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Ask the Agent a follow-up question (e.g. 'Why did you Pass on Tesla?' or 'What are Apple's strengths?')" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-black/40 border border-glass-border focus:border-brand-purple/40 rounded-xl px-4 py-3 text-xs text-white placeholder-text-secondary/60 outline-none transition-colors"
                      />
                      <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isChatLoading}
                        className="h-10 w-10 bg-brand-purple hover:bg-brand-pink text-white rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>
              )}
            </>
          )}

          {activeTab === "memos" && (
            <div className="max-w-4xl mx-auto py-8">
              <h2 className="font-outfit font-extrabold text-2xl text-white mb-2">Stored Investment Memos</h2>
              <p className="text-xs text-text-secondary mb-8">View historical research memos completed in this workspace.</p>
              
              <div className="space-y-4">
                {Object.values(mockReports).map((report) => (
                  <div key={report.ticker} className="glass-panel p-6 bg-white/2 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-brand-pink font-semibold">
                          {report.ticker}
                        </span>
                        <h3 className="font-outfit font-bold text-lg text-white">{report.name}</h3>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1 max-w-xl">{report.summary}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                        report.verdict === "INVEST" 
                          ? "bg-invest-green/10 text-invest-green border border-invest-green/20" 
                          : "bg-pass-red/10 text-pass-red border border-pass-red/20"
                      }`}>
                        {report.verdict}
                      </span>
                      <button 
                        onClick={() => {
                          setSelectedReport(report);
                          setStatus("completed");
                          setActiveTab("terminal");
                        }}
                        className="px-4 py-2 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-pink border border-brand-purple/35 text-xs font-medium transition-all"
                      >
                        Open Dashboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto py-8 space-y-6">
              <div>
                <h2 className="font-outfit font-extrabold text-2xl text-white mb-2">Developer Settings</h2>
                <p className="text-xs text-text-secondary">Configure backend model endpoints and API keys.</p>
              </div>

              <div className="glass-panel p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">Gemini API Key</label>
                  <input 
                    type="password" 
                    placeholder="AIzaSy..." 
                    disabled 
                    className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-xs text-text-secondary/60 outline-none"
                  />
                  <span className="text-[10px] text-text-secondary/50 block">Keys are pulled from local .env.local file automatically.</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-primary">Default Language Model</label>
                  <select disabled className="w-full bg-black/40 border border-glass-border rounded-xl px-4 py-2.5 text-xs text-text-secondary/60 outline-none cursor-not-allowed">
                    <option>gemini-2.5-flash (Recommended Default)</option>
                    <option>gemini-2.5-pro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "docs" && (
            <div className="max-w-2xl mx-auto py-8 space-y-6">
              <div>
                <h2 className="font-outfit font-extrabold text-2xl text-white mb-2">Research Agent Architecture</h2>
                <p className="text-xs text-text-secondary">Documentation on the Multi-Agent state-machine under the hood.</p>
              </div>

              <div className="glass-panel p-6 space-y-4 text-xs leading-relaxed text-text-secondary">
                <h3 className="font-outfit font-bold text-white text-sm">State Variables</h3>
                <p>The state variables flow sequentially through each node of the LangGraph. The nodes are synchronous, processing state inputs and updating key indicators.</p>
                <hr className="border-white/5 my-4" />
                <h3 className="font-outfit font-bold text-white text-sm">Yahoo Finance Metrics Scraper</h3>
                <p>Calculates the basic multiples. Competitor benchmarks are gathered dynamically by querying Yahoo Finance lists for companies within the same sub-industry categorization codes.</p>
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
