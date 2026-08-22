import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock.jsx';

export default function Message({ role, content, timestamp, onSuggestionClick }) {
  const isUser = role === 'user';
  const timeString = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Extract suggestions if present in format: [? Suggestion text ?]
  const suggestionMatches = !isUser ? content.match(/\[\?\s*(.*?)\s*\?\]/g) : null;
  const cleanContent = !isUser 
    ? content.replace(/\[\?\s*(.*?)\s*\?\]/g, '').trim() 
    : content;

  const suggestions = suggestionMatches
    ? suggestionMatches.map(s => s.replace(/\[\?\s*|\s*\?\]/g, '').trim())
    : [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 group animate-fadeIn`}>
      <div className={`flex items-start max-w-[95%] md:max-w-[85%] space-x-3.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-300 group-hover:scale-105 ${
          isUser
            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
            : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 text-white'
        }`}>
          {isUser ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="font-bold text-xs tracking-tighter">42</span>
          )}
        </div>

        {/* Bubble */}
        <div className={`rounded-2xl px-5 py-3.5 shadow-md backdrop-blur-sm transition-all duration-200 ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white selection:bg-white/30'
            : 'bg-white/95 dark:bg-gray-850 dark:bg-[#111827] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-100'
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed break-words font-sans">
              {content}
            </div>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Prevent nested pre tags wrapping our code block
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');
                    const isMultiLine = codeText.includes('\n');

                    // If it has a language spec or is multiline, render CodeBlock
                    if (match || isMultiLine) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : 'text'}
                          value={codeText}
                        />
                      );
                    }

                    // Single line inline code: render clean inline badge
                    return (
                      <code
                        className="bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-cyan-300 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono font-semibold inline"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-xs md:text-sm">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="px-3.5 py-2 bg-gray-100/80 dark:bg-gray-800/80 font-bold text-left text-gray-800 dark:text-gray-200">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="px-3.5 py-2 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                        {children}
                      </td>
                    );
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-indigo-500 pl-4 py-1.5 my-2.5 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-r-xl text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                        {children}
                      </blockquote>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        {children}
                        <svg className="w-3 h-3 inline-block ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  }
                }}
              >
                {cleanContent}
              </ReactMarkdown>

              {/* Dynamic Interactive Suggestion Chips */}
              {suggestions.length > 0 && onSuggestionClick && (
                <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                  {suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => onSuggestionClick(sug)}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/60 transition-all transform hover:-translate-y-0.5 shadow-sm"
                    >
                      💬 {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Metadata */}
          <div className={`text-[11px] mt-2.5 font-medium flex items-center justify-between gap-4 ${
            isUser ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
          }`}>
            <span>{isUser ? 'You' : '42Botler'}</span>
            <span>{timeString}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
