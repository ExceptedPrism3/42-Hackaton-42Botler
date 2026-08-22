import React, { useState } from 'react';

export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = (language || 'text').toUpperCase();

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700/60 bg-gray-950 shadow-xl font-mono text-sm">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <span className="text-gray-400 font-semibold tracking-wider ml-2">{displayLang}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-emerald-300/90 leading-relaxed scrollbar-thin">
        <pre>
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
}
