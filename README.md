<div align="center">

# 🤖 42Botler 2.0
**Intelligent AI Assistant & Campus Guide for 42 Heilbronn**

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-cyan.svg)
![RAG Enabled](https://img.shields.io/badge/RAG-Indexed-purple.svg)

</div>

---

## 🌟 Overview

**42Botler** is a specialized AI-powered companion designed exclusively for **42 Heilbronn** students and Pisciners. It combines real-time streaming, local **Retrieval-Augmented Generation (RAG)** across 110+ official Notion Wiki chapters, and deep technical knowledge of the **42 Common Core Curriculum**.

---

## ✨ Features

- 🧠 **RAG Retrieval Engine**: High-coverage semantic search across official 42 student wiki pages and campus documentation.
- 💻 **42 Common Core Technical Engine**: Deep architecture guidance for `libft`, `ft_printf`, `get_next_line`, `born2beroot`, `push_swap`, `pipex`, `so_long`, `philosophers`, `minishell`, `cub3d`, `cpp00-cpp09`, and `ft_transcendence`.
- ⚡ **Multi-Provider AI & Streaming**: Real-time SSE token streaming supporting **Groq** (LLaMA 3.3 70B), **Google Gemini**, **OpenAI** (`gpt-4o-mini`), **Ollama**, or a completely standalone **Local Expert Engine**.
- 🛠️ **42 Slash Commands**:
  - `/norm` — Norminette rules and forbidden function checklist.
  - `/peer` — Peer evaluation etiquette, defense rules & edge-case testing.
  - `/cluster` — Linux workstation tricks, home directory quota (`df -h ~`), and frozen process killing.
  - `/degree` — 42 & Hochschule Heilbronn (HHN) Double Degree program overview.
  - `/help` — Overview of all available shortcuts.
  - `/clear` — Reset active chat session.
- 📝 **Modern Markdown & Code Blocks**: Full GitHub-Flavored Markdown (GFM) with syntax-styled C, Makefile, and Bash terminal cards with one-click clipboard copying.
- 💬 **Interactive Suggestion Chips**: 1-click follow-up prompt chips attached to responses.
- 🌙 **Dark Mode**: Full dark/light theme support with automatic system preference detection and `localStorage` persistence.
- 💾 **Session History & Export**: Chat history automatically saved to browser storage with an **Export to Markdown (`.md`)** feature.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- *(Optional)* API key for Groq, Google Gemini, or OpenAI (42Botler works standalone even without cloud keys).

### Installation

```bash
# Clone the repository
git clone https://github.com/ExceptedPrism3/42-Hackaton.git
cd 42-Hackaton

# Install all dependencies (Monorepo)
npm run install:all
```

### Environment Configuration

Create `server/.env`:
```bash
# Choose your preferred provider (or leave empty for standalone local expert engine):
OPENAI_API_KEY=sk-your-openai-key-here     # Optional: gpt-4o-mini
GROQ_API_KEY=gsk_your-groq-key-here        # Optional: Free ultra-fast LLaMA 3.3 70B
GEMINI_API_KEY=your-gemini-key-here        # Optional: Google Gemini Flash

PORT=3001
```

### Running the App

```bash
# Start Development Mode (Frontend :5173 + Backend :3001)
./run.sh d

# Build & Run Production Mode
./run.sh p
```

- **Frontend UI**: `http://localhost:5173` (or `/42botler/` in production)
- **Backend API**: `http://localhost:3001`
- **Health & RAG Metrics**: `http://localhost:3001/api/health`

---

## 📁 Project Structure

```text
42botler/
├── client/                     # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx  # Chat stream reader, slash commands, chips
│   │   │   ├── CodeBlock.jsx   # Terminal card with copy button
│   │   │   └── Message.jsx     # Markdown renderer with GFM & chips
│   │   ├── pages/
│   │   │   ├── About.jsx       # Project documentation
│   │   │   └── Team.jsx        # Development team page
│   │   ├── App.jsx             # Dark mode, health polling, routing
│   │   ├── main.jsx            # Dynamic basename router
│   │   └── index.css           # Styling tokens & animations
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── curriculum.js           # Deep 42 Common Core technical knowledge
│   ├── retriever.js            # In-memory RAG chunking & BM25 search
│   ├── server.js               # Express API, SSE streaming, rate limiting
│   ├── knowledge_base.md       # 42 Campus curated knowledge
│   ├── knowledge_base_notion.md# Scraped 42 Notion Wiki documentation
│   └── package.json
│
├── scrapers/                   # Data Ingestion & Crawling Tools
│   ├── 42-heilbronn-scraper.js # Web search crawler
│   ├── recursive-scraper.js    # Headless Puppeteer Notion scraper
│   └── run-scraper.js          # Scraper orchestrator
│
├── package.json                # Monorepo root scripts
├── run.sh                      # All-in-one execution orchestrator
└── USER_GUIDE.md               # Complete end-user guide
```

---

## 🔒 Security & Privacy

- **Safe Credential Management**: `.env`, SSH keys, and secret configurations are excluded from version control.
- **Rate Limiting**: Built-in `express-rate-limit` prevents spam and API quota exhaustion.
- **Local Fallback Protection**: Zero data leakage if external AI providers are unavailable.

---

## 👥 Authors & Credits

Built with ❤️ for students and Pisciners at **42 Heilbronn**.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
