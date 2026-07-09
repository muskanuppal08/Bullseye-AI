export interface CompetitorData {
  name: string;
  pe: number;
  peg: number;
  margin: number; // percentage
  debtToEquity: number;
}

export interface InvestmentReport {
  ticker: string;
  name: string;
  verdict: "INVEST" | "PASS";
  confidenceScore: number; // 0-100
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
  competitorsList: CompetitorData[];
}

export const mockReports: Record<string, InvestmentReport> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    verdict: "INVEST",
    confidenceScore: 88,
    summary: "Apple demonstrates robust pricing power, a highly resilient services ecosystem, and exceptional capital return programs. Despite regulatory headwinds in the EU and hardware stagnation, their dominant ecosystem lock-in makes it a high-conviction buy.",
    metrics: {
      pe: 29.4,
      peg: 2.1,
      margin: 26.3,
      debtToEquity: 1.45,
      revenue: "$385.7B",
      marketCap: "$3.42T",
    },
    swot: {
      strengths: [
        "Unrivaled ecosystem lock-in (iOS, macOS, Services).",
        "Strong pricing power yielding 40%+ gross margins.",
        "Immense cash flows and aggressive share buyback history."
      ],
      weaknesses: [
        "Slowing iPhone unit growth in saturated markets.",
        "Increased regulatory scrutiny over App Store fees.",
        "High reliance on third-party supply chain assembly."
      ],
      opportunities: [
        "Monetization of Apple Intelligence (on-device AI).",
        "Expansion of health-tech and wearable integrations.",
        "Accelerating growth in Indian and emerging markets."
      ],
      threats: [
        "EU Digital Markets Act causing antitrust forced splits.",
        "Geopolitical supply disruptions (Taiwan/China tensions).",
        "Rapid competition from open-source local AI alternatives."
      ]
    },
    details: {
      financials: "Apple's balance sheet remains fortress-like. Operating income was $114B with free cash flow exceeding $96B in the last trailing twelve months. Return on Equity (ROE) stands at an astounding 150% due to efficient leverage and share retirement.",
      sentiment: "Market sentiment is positive. Out of 38 Wall Street analysts, 28 rank AAPL as a strong buy. Sentiment on Reddit and financial blogs is heavily focused on Apple Intelligence rollouts, offsetting short-term iPhone stagnation worries.",
      competitors: "Apple trades at a slight premium compared to the S&P 500 median but maintains higher profit margins (26%) compared to hardware-reliant peers (e.g. HP, Lenovo) and stands neck-and-neck with Microsoft.",
      risks: "Key risk stems from regulatory crackdowns on App Store monetization. A forced opening of sideloading apps in major markets could shave 2-4% off high-margin services revenue."
    },
    competitorsList: [
      { name: "Apple (AAPL)", pe: 29.4, peg: 2.1, margin: 26.3, debtToEquity: 1.45 },
      { name: "Microsoft (MSFT)", pe: 34.2, peg: 2.4, margin: 35.1, debtToEquity: 1.10 },
      { name: "Alphabet (GOOGL)", pe: 22.8, peg: 1.5, margin: 25.9, debtToEquity: 0.35 },
      { name: "Samsung (SMSN)", pe: 15.6, peg: 1.1, margin: 12.4, debtToEquity: 0.18 }
    ]
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    verdict: "PASS",
    confidenceScore: 65,
    summary: "While Tesla remains the undisputed EV pioneer, compressed automotive margins, intensfying Chinese competition (BYD), and high execution risk on autonomous driving products (Robotaxi) suggest waiting for a more attractive valuation entry point.",
    metrics: {
      pe: 68.2,
      peg: 3.8,
      margin: 11.2,
      debtToEquity: 0.08,
      revenue: "$96.7B",
      marketCap: "$820B",
    },
    swot: {
      strengths: [
        "Industry-leading EV battery tech and charging network.",
        "Fortress balance sheet with virtually zero net debt.",
        "Strong brand equity and visionary leadership."
      ],
      weaknesses: [
        "Declining operating margins due to EV price wars.",
        "High stock valuation premium detached from automotive realities.",
        "Key-person risk centered on Elon Musk's split attention."
      ],
      opportunities: [
        "FSD (Full Self-Driving) licensing and robotaxi network.",
        "Rapid scale-up of energy storage division (Megapack).",
        "Introduction of the sub-$25k model next-gen vehicle."
      ],
      threats: [
        "Severe price cuts from Chinese EV manufacturers like BYD.",
        "Regulatory backlash or recall liability over Autopilot safety.",
        "Global cooling of consumer appetite for luxury EVs."
      ]
    },
    details: {
      financials: "Tesla boasts a highly liquid balance sheet with over $26B in cash and cash equivalents. However, automotive gross margins (ex-credits) fell to 14.6%, representing significant compression compared to its 2022 peak of 27%.",
      sentiment: "Highly volatile and polarized. Short-term news is dominated by Autonomous Driving promises, while traditional financial analysts are downgrading the stock citing structural automotive margin declines.",
      competitors: "Tesla's P/E of 68x is significantly higher than traditional automakers (Toyota @ 9x, GM @ 5x) and EV peers (BYD @ 18x), meaning it is priced as a high-growth tech stock despite decelerating vehicle growth.",
      risks: "Autonomous driving technology holds binary risk. If Tesla fails to deliver level-4 autonomy in the next 18 months, the valuation multiple will undergo substantial contraction."
    },
    competitorsList: [
      { name: "Tesla (TSLA)", pe: 68.2, peg: 3.8, margin: 11.2, debtToEquity: 0.08 },
      { name: "BYD Co.", pe: 18.4, peg: 1.2, margin: 9.8, debtToEquity: 0.45 },
      { name: "Toyota", pe: 9.1, peg: 0.8, margin: 10.1, debtToEquity: 1.02 },
      { name: "General Motors", pe: 5.4, peg: 0.5, margin: 6.2, debtToEquity: 1.85 }
    ]
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    verdict: "INVEST",
    confidenceScore: 92,
    summary: "NVIDIA owns the compute stack for the artificial intelligence revolution. Their CUDA software ecosystem creates an impenetrable moat. Despite trading at a massive valuation, their explosive revenue growth and 50%+ net margins justify a buy.",
    metrics: {
      pe: 55.4,
      peg: 1.1,
      margin: 54.8,
      debtToEquity: 0.17,
      revenue: "$96.3B",
      marketCap: "$3.15T",
    },
    swot: {
      strengths: [
        "Absolute monopoly (85%+) in high-end data center AI GPUs.",
        "Impenetrable CUDA software developer ecosystem moat.",
        "Extraordinary operating margins (50%+) and growth rate."
      ],
      weaknesses: [
        "High customer concentration (Big Tech hyperscalers = 40% of sales).",
        "Vulnerability to advanced packaging bottleneck constraints (TSMC).",
        "Extreme stock volatility due to market hype cycles."
      ],
      opportunities: [
        "Sustained enterprise adoption of generative AI systems.",
        "Expansion of robotics, omniverse, and edge-AI chips.",
        "Sovereign AI initiatives from global governments."
      ],
      threats: [
        "US government export restrictions on advanced chips (China).",
        "Competitors designing custom ASIC silicon (Google TPU, Amazon Trainium).",
        "Hyperscaper AI hardware spend cooling off or plateauing."
      ]
    },
    details: {
      financials: "NVIDIA's financials are historic. Year-over-year revenue grew by 262% in the recent quarter. Net income margin reached an unprecedented 57%, generating $14.9B in cash flow from operations in a single quarter.",
      sentiment: "Extremely bullish. Almost all major institutions list NVIDIA as a conviction buy. Social media and tech communities are intensely focused on Blackwell chip production ramp-ups.",
      competitors: "While AMD is introducing MI300 chips as options, Intel is lagging. NVIDIA trades at a high absolute P/E (55x) but its PEG ratio of 1.1x is cheaper than competitors due to spectacular earnings growth.",
      risks: "Supply chain risk is heavily concentrated. Any supply interruption or earthquake affecting TSMC's advanced packaging facilities in Taiwan would immediately freeze Blackwell chip shipments."
    },
    competitorsList: [
      { name: "Nvidia (NVDA)", pe: 55.4, peg: 1.1, margin: 54.8, debtToEquity: 0.17 },
      { name: "AMD", pe: 82.5, peg: 2.1, margin: 7.2, debtToEquity: 0.05 },
      { name: "Intel", pe: 38.0, peg: 3.5, margin: 2.1, debtToEquity: 0.78 },
      { name: "Broadcom (AVGO)", pe: 28.6, peg: 1.8, margin: 22.4, debtToEquity: 1.55 }
    ]
  }
};
