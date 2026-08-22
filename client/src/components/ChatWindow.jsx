import React, { useState, useRef, useEffect } from 'react';
import Message from './Message.jsx';

const LOCAL_STORAGE_KEY = '42botler_chat_history_v2';

const SLASH_COMMANDS = {
  '/help': {
    title: 'Available Slash Commands',
    content: `🛠️ **42Botler Slash Commands**:
• \`/norm\` - Norminette rules and common violations checklist
• \`/peer\` - Peer-evaluation guidelines & defense tips
• \`/cluster\` - Workstation shortcuts, disk quota (\`df -h\`), and troubleshooting
• \`/degree\` - Information about the 42 & HHN Double Degree program
• \`/c <func>\` - Quick reference for standard C library functions
• \`/clear\` - Clear current chat history`
  },
  '/norm': {
    title: 'Norminette Quick Cheatsheet',
    content: `🔍 **42 Norminette Cheat Sheet**:
\`\`\`c
/* Essential Norminette Rules */
- Max 25 lines per function (excluding braces)
- Max 5 functions per .c file
- Max 4 variable declarations per function (at top of scope)
- Max 80 columns/characters per line
- No "for", "do ... while", or "switch" (use "while")
- No inline initialization: int a = 5; ❌ -> int a; a = 5; ✅
- Space after keywords (if, while, return), NO space between func name & parenthesis
- Standard 42 Header required on all .c and .h files!
\`\`\`
**Command**: \`norminette -R CheckForbiddenSourceHeader *.c *.h\``
  },
  '/peer': {
    title: 'Peer Evaluation Checklist',
    content: `🤝 **Peer Evaluation Guidelines & Etiquette**:
1. **Punctuality**: Be at the evaluator's or evaluatee's workstation on time.
2. **Explain Code**: The evaluatee must be able to explain every single line of code and logic.
3. **Norm & Compilation**:
   - Check norm first: \`norminette\`
   - Compile with flags: \`gcc -Wall -Wextra -Werror\`
   - Test for memory leaks: \`valgrind --leak-check=full ./<binary>\`
4. **Edge Cases**: Test with \`NULL\`, empty strings, \`INT_MIN\`, \`INT_MAX\`, negative values.
5. **Constructive Feedback**: Leave helpful feedback in the evaluation comment.`
  },
  '/cluster': {
    title: 'Cluster & Linux Workstation Tips',
    content: `💻 **Cluster & Workstation Guide**:
\`\`\`bash
# Check available disk space & home directory quota
df -h ~

# Clean caches if your home directory is full (Storage quota exceeded)
rm -rf ~/.cache/* ~/.local/share/Trash/* ~/Library/Caches/*

# Find and kill frozen processes
ps aux | grep <process_name>
kill -9 <PID>

# Lock your session when stepping away
Ctrl + Alt + L
\`\`\``
  },
  '/degree': {
    title: '42 & HHN Double Degree',
    content: `🎓 **42 Heilbronn & Hochschule Heilbronn (HHN) Degree**:
• Complete your 42 Common Core projects to earn recognized ECTS points.
• Transition smoothly into a Bachelor of Science (Computer Science) at HHN.
• Check with the 42 Pedagogy team on Slack/Intra for the latest semester enrollment cycles!`
  }
};

export default function ChatWindow({ isOnline }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save chat to localStorage:', err);
    }
  }, [messages]);

  // Auto-scroll on new messages or loading state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearChat = () => {
    if (messages.length > 0 && window.confirm('Clear current conversation history?')) {
      setMessages([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    let md = `# 42Botler Conversation Export\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
    messages.forEach(m => {
      const author = m.role === 'user' ? '🧑 Student' : '🤖 42Botler';
      md += `### ${author}\n\n${m.content}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `42botler-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function handleSend(e) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Check for Slash Commands
    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed === '/clear') {
      setMessages([]);
      setInput('');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }

    if (SLASH_COMMANDS[lowerTrimmed]) {
      const cmdData = SLASH_COMMANDS[lowerTrimmed];
      const nextMessages = [
        ...messages,
        { role: 'user', content: trimmed, timestamp: new Date().toISOString() },
        { role: 'assistant', content: cmdData.content, timestamp: new Date().toISOString() }
      ];
      setMessages(nextMessages);
      setInput('');
      return;
    }

    // Standard Query
    const userMessage = { role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    const apiBase = (typeof window !== 'undefined' && window.location.pathname.startsWith('/42botler'))
      ? '/42botler/api'
      : '/api';

    try {
      // Attempt SSE streaming first
      const streamRes = await fetch(`${apiBase}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (streamRes.ok && streamRes.body) {
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedReply = '';
        let assistantMessageAdded = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.chunk) {
                  accumulatedReply += parsed.chunk;
                  
                  if (!assistantMessageAdded) {
                    assistantMessageAdded = true;
                    setMessages([
                      ...nextMessages,
                      { role: 'assistant', content: accumulatedReply, timestamp: new Date().toISOString() }
                    ]);
                  } else {
                    setMessages(prev => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: accumulatedReply
                      };
                      return updated;
                    });
                  }
                }
              } catch {
                // non-JSON data stream line
              }
            }
          }
        }
        return;
      }

      // Fallback to standard JSON endpoint if SSE is not available
      const jsonRes = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!jsonRes.ok) {
        throw new Error(`Server status ${jsonRes.status}`);
      }

      const data = await jsonRes.json();
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: `🔧 **Connection Notice**:\n\nUnable to reach backend service. For campus questions:\n• Cluster open 24/7\n• Coffee in student lounge\n• Run \`norminette\` for coding standards\n• Try \`/norm\` or \`/peer\` for instant guides.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-gray-800/80 rounded-3xl shadow-2xl flex flex-col h-[calc(100vh-145px)] overflow-hidden relative transition-colors duration-300">
      
      {/* Top Action Bar */}
      <div className="px-5 py-2.5 bg-white/40 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            {isOnline ? 'Campus Assistant Ready' : 'Offline / Standalone Mode'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportChat}
                className="px-2.5 py-1 rounded-lg hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition flex items-center gap-1 text-gray-600 dark:text-gray-300"
                title="Export chat as Markdown"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button
                onClick={handleClearChat}
                className="px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-rose-600 dark:text-rose-400 transition flex items-center gap-1"
                title="Clear chat"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50/20 to-white/30 dark:from-gray-950/40 dark:to-gray-900/40 scrollbar-thin">
        {messages.length === 0 && (
          <div className="text-center py-6 md:py-10 max-w-2xl mx-auto animate-fadeIn">
            {/* 42 Logo Badge */}
            <div className="relative mb-5 inline-block">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white font-black text-2xl md:text-3xl tracking-tighter">42</span>
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-2">
              Welcome to 42Botler
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-6 max-w-md mx-auto leading-relaxed">
              Your intelligent companion for campus life, Norminette rules, and academic guidance at 42 Heilbronn.
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <button
                onClick={() => setInput("What are the cluster opening hours and badge rules?")}
                className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-500/50 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    🕒
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">Campus Hours</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">24/7 cluster & RFID access</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setInput("/norm")}
                className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    🔍
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">Norminette Helper</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Rules, flags & common mistakes</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setInput("How does the 42 & HHN Double Degree program work?")}
                className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    🎓
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">HHN Double Degree</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">ECTS & university partnership</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setInput("/peer")}
                className="p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 hover:border-purple-500/50 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    🤝
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-xs md:text-sm">Peer Evaluation Guide</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Checklist, etiquette & grading</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Slash Commands Tip */}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
              💡 Tip: Type <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-indigo-600 dark:text-indigo-400">/help</code> to view all instant slash commands.
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <Message key={idx} role={m.role} content={m.content} timestamp={m.timestamp} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 py-3 px-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm w-fit border border-gray-100 dark:border-gray-700">
            <div className="flex space-x-1.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">42Botler is thinking...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-800 p-3 md:p-4">
        <form onSubmit={handleSend} className="flex gap-2.5 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about 42 Heilbronn, Norminette, or type /help..."
              className="w-full bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm md:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-700 text-white p-3 md:px-5 md:py-3 rounded-2xl font-medium shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 transform -rotate-45" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  );
}
