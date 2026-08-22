const fs = require('fs');
const path = require('path');

class KnowledgeRetriever {
  constructor() {
    this.chunks = [];
    this.isLoaded = false;
    this.init();
  }

  init() {
    try {
      this.chunks = [];
      const kbDir = path.join(__dirname);
      
      const filesToLoad = [
        path.join(kbDir, 'knowledge_base.md'),
        path.join(kbDir, 'knowledge_base_notion.md')
      ];

      for (const filePath of filesToLoad) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const fileChunks = this.parseMarkdownChunks(content, path.basename(filePath));
          this.chunks.push(...fileChunks);
        }
      }

      this.isLoaded = true;
      console.log(`🧠 RAG Retriever initialized: ${this.chunks.length} clean chunks indexed across knowledge bases.`);
    } catch (err) {
      console.error('❌ Failed to initialize KnowledgeRetriever:', err);
    }
  }

  cleanText(text) {
    if (!text) return '';
    let cleaned = text;

    // Remove json / javascript artifacts
    cleaned = cleaned.replace(/window\.LOCALE_SETUP[\s\S]*?__notion_html_async\.push\(null,null\)/g, '');
    cleaned = cleaned.replace(/\{\s*"props"\s*:\s*\{[\s\S]*?\}\s*\}/g, '');
    cleaned = cleaned.replace(/\{\s*"resolvedServerColorMode"\s*:\s*"[^"]*"\s*\}/g, '');
    cleaned = cleaned.replace(/__notion_html_async[\s\S]*?\)/g, '');
    cleaned = cleaned.replace(/Skip to content42 Heilbronn's NotionSearchInboxShared📚Student Wiki📚Student Wiki/g, '');
    cleaned = cleaned.replace(/Skip to content/g, '');
    cleaned = cleaned.replace(/Navigation Menu[\s\S]*?Home/g, '');
    
    // Normalize lines: strip leading 4+ spaces so they don't get treated as raw code blocks
    cleaned = cleaned
      .split('\n')
      .map(line => line.replace(/^ {4,}/, ''))
      .join('\n')
      .trim();

    return cleaned;
  }

  cleanTitle(rawTitle) {
    if (!rawTitle) return 'General 42 Heilbronn Information';
    
    let title = rawTitle.trim();

    // If title is a Notion URL, extract the slug
    const urlMatch = title.match(/(?:https?:\/\/[^\s]+)?(?:42heilbronn\/)?([a-zA-Z0-9_-]+)-[a-f0-9]{32}/i);
    if (urlMatch) {
      title = urlMatch[1].replace(/[-_]/g, ' ');
    } else if (title.startsWith('http')) {
      const parts = title.split('/');
      title = parts[parts.length - 1].replace(/[-_?&=]/g, ' ').substring(0, 40);
    }

    // Clean markdown bold stars if present
    title = title.replace(/\*\*/g, '').trim();

    // Capitalize words nicely
    title = title
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    return title || '42 Heilbronn Campus Guide';
  }

  parseMarkdownChunks(markdown, sourceFile) {
    const lines = markdown.split('\n');
    const chunks = [];
    let currentTitle = 'General Information';
    let currentContent = [];
    let currentLevel = 1;
    let currentUrl = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      const urlMatch = line.match(/^\*\*URL:\*\*\s+(https?:\/\/[^\s]+)/i);

      if (urlMatch) {
        currentUrl = urlMatch[1].trim();
      }

      if (headingMatch) {
        const cleanedPrevContent = this.cleanText(currentContent.join('\n'));
        if (cleanedPrevContent.length > 40) {
          chunks.push(this.createChunk(currentTitle, cleanedPrevContent, sourceFile, currentLevel, currentUrl));
        }
        currentLevel = headingMatch[1].length;
        currentTitle = headingMatch[2].trim();
        currentContent = [];
        currentUrl = '';
      } else if (line.startsWith('---') && currentContent.length > 5) {
        const cleanedPrevContent = this.cleanText(currentContent.join('\n'));
        if (cleanedPrevContent.length > 40) {
          chunks.push(this.createChunk(currentTitle, cleanedPrevContent, sourceFile, currentLevel, currentUrl));
        }
        currentContent = [];
        currentUrl = '';
      } else {
        currentContent.push(line);
      }
    }

    const finalContent = this.cleanText(currentContent.join('\n'));
    if (finalContent.length > 40) {
      chunks.push(this.createChunk(currentTitle, finalContent, sourceFile, currentLevel, currentUrl));
    }

    return chunks;
  }

  createChunk(title, content, sourceFile, level, url) {
    const humanTitle = this.cleanTitle(title);
    const text = `${humanTitle} ${content}`.toLowerCase();
    const tokens = text.match(/[a-z0-9äöüß_/-]+/gi) || [];
    const termFreq = {};

    for (const token of tokens) {
      const t = token.toLowerCase();
      if (t.length > 2) {
        termFreq[t] = (termFreq[t] || 0) + 1;
      }
    }

    return {
      title: humanTitle,
      rawTitle: title,
      content,
      url,
      sourceFile,
      level,
      charCount: content.length,
      termFreq,
      tokens
    };
  }

  tokenize(query) {
    if (!query) return [];
    const rawTokens = query.toLowerCase().match(/[a-z0-9äöüß_/-]+/gi) || [];
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'for', 'to', 'of', 'with', 'about',
      'can', 'i', 'you', 'how', 'what', 'where', 'when', 'who', 'why', 'do', 'does', 'tell', 'me', 'please',
      'der', 'die', 'das', 'und', 'ist', 'in', 'den', 'von', 'zu', 'mit', 'auf', 'für', 'eine', 'ein', 'wie'
    ]);
    return rawTokens.filter(t => t.length > 1 && !stopWords.has(t));
  }

  search(query, topK = 5) {
    if (!this.isLoaded || this.chunks.length === 0) {
      this.init();
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    const scored = this.chunks.map(chunk => {
      let score = 0;
      const lowerTitle = chunk.title.toLowerCase();

      for (const token of queryTokens) {
        if (lowerTitle.includes(token)) {
          score += 20;
        }
        if (chunk.termFreq[token]) {
          score += Math.min(chunk.termFreq[token] * 3, 20);
        }
      }

      // Domain boosts
      if (lowerQuery.includes('visa') && (lowerTitle.includes('visa') || chunk.termFreq['visa'])) score += 40;
      if (lowerQuery.includes('mensa') && (lowerTitle.includes('mensa') || chunk.termFreq['mensa'])) score += 40;
      if (lowerQuery.includes('coffee') && (lowerTitle.includes('coffee') || chunk.termFreq['coffee'])) score += 40;
      if ((lowerQuery.includes('norm') || lowerQuery.includes('norminette')) && (lowerTitle.includes('norm') || chunk.termFreq['norminette'])) score += 40;
      if (lowerQuery.includes('moulinette') && (lowerTitle.includes('moulinette') || chunk.termFreq['moulinette'])) score += 40;
      if (lowerQuery.includes('exam') && (lowerTitle.includes('exam') || chunk.termFreq['exam'])) score += 30;
      if ((lowerQuery.includes('degree') || lowerQuery.includes('hhn')) && lowerTitle.includes('degree')) score += 40;
      if (lowerQuery.includes('safeguard') && (lowerTitle.includes('safeguard') || chunk.termFreq['safeguard'])) score += 40;
      if (lowerQuery.includes('scholarship') && (lowerTitle.includes('scholarship') || chunk.termFreq['scholarship'])) score += 40;
      if (lowerQuery.includes('internship') && (lowerTitle.includes('internship') || chunk.termFreq['internship'])) score += 40;
      if (lowerQuery.includes('eval') && (lowerTitle.includes('eval') || chunk.termFreq['evaluation'])) score += 30;

      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    
    return scored
      .filter(s => s.score >= 8)
      .slice(0, topK)
      .map(s => s.chunk);
  }

  buildContext(query, maxChars = 6000) {
    const topChunks = this.search(query, 4);
    if (topChunks.length === 0) {
      return '';
    }

    let context = '';
    for (const chunk of topChunks) {
      const section = `### ${chunk.title}\n${chunk.content}\n\n---\n\n`;
      if (context.length + section.length > maxChars) {
        break;
      }
      context += section;
    }

    return context.trim();
  }

  getStats() {
    const totalChars = this.chunks.reduce((acc, c) => acc + c.charCount, 0);
    return {
      chunksCount: this.chunks.length,
      totalChars,
      isLoaded: this.isLoaded,
      sources: [...new Set(this.chunks.map(c => c.sourceFile))]
    };
  }
}

module.exports = new KnowledgeRetriever();
