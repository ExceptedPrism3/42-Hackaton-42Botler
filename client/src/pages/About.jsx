import React from 'react';

export default function About() {
  return (
    <div className="relative space-y-6 animate-fadeIn max-w-5xl mx-auto py-2">
      {/* Banner */}
      <div className="rounded-3xl overflow-hidden border border-white/40 dark:border-gray-800 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
        <div className="p-8 sm:p-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">About 42Botler</h2>
          <p className="mt-3 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Your specialized 42 Heilbronn companion for campus info, Norminette rules, curriculum guidance, and student workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 p-6 sm:p-8">
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Purpose</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Instant, precise answers about campus resources, curriculum, tools, and evaluation workflows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Modern RAG</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
              Retrieval-Augmented Generation across 110+ Notion Wiki chapters and official 42 documentation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/80 shadow-sm">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Focused Scope</h3>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
              42-only topics. General questions are politely redirected to keep your workflow distraction-free.
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800 shadow-md">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
            <span>⚙️</span> How It Works
          </h3>
          <ul className="mt-4 text-gray-600 dark:text-gray-400 text-sm space-y-2.5 list-disc pl-5">
            <li><strong>Live Indexing</strong>: Semantic search extracts relevant wiki chunks instantly.</li>
            <li><strong>AI Model</strong>: GPT-4o-mini with SSE streaming for zero-latency response rendering.</li>
            <li><strong>Interactive Code</strong>: Built-in C/Bash syntax highlight with one-click copy buttons.</li>
            <li><strong>Offline Fallbacks</strong>: Keyword responses keep working even when network is down.</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800 shadow-md">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
            <span>💬</span> What You Can Ask
          </h3>
          <ul className="mt-4 text-gray-600 dark:text-gray-400 text-sm space-y-2.5 list-disc pl-5">
            <li><strong>Norminette & Moulinette</strong>: Specific rule explanations and C code syntax.</li>
            <li><strong>Campus & Cluster</strong>: Opening hours, security badge replacement, Mensa schedule.</li>
            <li><strong>Academics</strong>: Peer evaluation etiquette, milestone pace, HHN Double Degree.</li>
            <li><strong>Commands</strong>: Quick slash shortcuts like <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">/norm</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">/peer</code>, <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">/cluster</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
