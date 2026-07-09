# 🎯 BullseyeAI — AI Investment Research Agent

**BullseyeAI** is a state-of-the-art AI-powered Investment Research Agent. It takes a company name or stock ticker, conducts thorough, multi-agent financial research, analyzes market sentiment, benchmarks competitors, parses potential risks, and synthesizes a structured "INVEST" or "PASS" verdict.

This project was built for the **InsideIIM × Altuni AI Labs** Take-Home Assignment.

---

## 🚀 Overview
BullseyeAI replaces manual, tedious financial research with a collaborative network of specialized AI agents. The user is presented with a **vibrant, joyful, and interactive glassmorphic dashboard** that visualizes the agent's real-time thought process, shows financial health charts, and provides a chatbot interface for follow-up questions.

### Key Features:
*   🤖 **Stateful Multi-Agent Workflow**: Managed by LangGraph.js to coordinate analysis between Financial, Sentiment, Competitor, and Synthesizer agents.
*   📊 **Real-time Thought Stream**: Dynamic terminal logging and node highlights representing what the agent is researching *right now*.
*   📈 **Competitor Benchmarking**: Rich interactive charting displaying key valuation ratios (P/E, PEG, Profit Margins) compared to industry peers.
*   💬 **Post-Analysis Chat**: Interact directly with the synthesized report to ask follow-up questions or test hypotheses.
*   🗂️ **SWOT & Risk Matrix**: Beautiful flip-cards organizing Strengths, Weaknesses, Opportunities, and Threats.

---

## 🛠️ How to Run It

### 1. Prerequisites
Ensure you have **Node.js (v18.x or later)** and **NPM** installed.

### 2. Installation
Clone the repository (or extract the zip) and run:
```bash
cd bullseye-ai
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root of the `bullseye-ai` folder and add your API keys:
```env
# The API key for Google Gemini (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Alternatively, if using OpenAI:
# OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Development Server
Run the local dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How It Works (Architecture)

BullseyeAI uses a structured state graph built on **LangGraph.js** to coordinate specialized agents:

```mermaid
graph TD
    Start([User Query]) --> FinAnalyst[Financial Analyst Agent]
    FinAnalyst --> SentInspector[Sentiment Inspector Agent]
    SentInspector --> CompComparer[Competitor Comparer Agent]
    CompComparer --> RiskAssessor[Risk Assessor Agent]
    RiskAssessor --> Synthesizer[Verdict Synthesizer Agent]
    Synthesizer --> Output([Final Report & Verdict])
```

1.  **State Schema**: Holds the research context, financial figures, news headlines, SWOT details, and the final verdict.
2.  **Financial Agent**: Uses Yahoo Finance (`yahoo-finance2`) to query core metrics (revenue, debt, margins, P/E).
3.  **Sentiment Agent**: Extracts news vibes and analyst recommendations.
4.  **Competitor Agent**: Composes benchmarking statistics against industry peers.
5.  **Synthesizer Agent**: Aggregates all data, grades the investment, and structures the final markdown.

---

## ⚖️ Key Decisions & Trade-offs
*(To be completed as we build out the final agent details)*

---

## 📝 Example Runs
*(To be completed with actual agent outputs on selected companies)*

---

## 🔮 What We Would Improve with More Time
*(To be completed at the end of the project)*

---

## 💬 LLM Chat Session Logs
*(Full chat logs detailing the pairing process with the AI will be attached here to claim the assignment's bonus points)*
