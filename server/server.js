const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const retriever = require('./retriever');
const { findCurriculumMatch } = require('./curriculum');

const app = express();
const port = process.env.PORT || 3001;

// Provider configurations
const OPENAI_KEY = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_API_KEY_HERE' ? process.env.OPENAI_API_KEY : null;
const GROQ_KEY = process.env.GROQ_API_KEY || null;
const GEMINI_KEY = process.env.GEMINI_API_KEY || null;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || null;

// Initialize OpenAI client (can point to OpenAI or Groq)
let activeClient = null;
let activeProvider = 'Local Expert Engine';
let activeModel = 'Local RAG v2';

if (GROQ_KEY) {
  activeClient = new OpenAI({
    apiKey: GROQ_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  activeProvider = 'Groq';
  activeModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
} else if (OPENAI_KEY) {
  activeClient = new OpenAI({
    apiKey: OPENAI_KEY,
  });
  activeProvider = 'OpenAI';
  activeModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Rate limiting: 60 requests per minute per IP
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    error: 'Too many requests. Please slow down and try again in a moment.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static client bundle
app.use('/42botler', express.static(path.join(__dirname, '../client/dist')));

// Content moderation
function containsInappropriateContent(text) {
  if (!text || typeof text !== 'string') return false;
  const inappropriateWords = [
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'cunt', 'piss',
    'stupid', 'idiot', 'moron', 'retard', 'gay', 'fag', 'nigger', 'whore',
    'kill', 'die', 'hate', 'suck', 'dumb', 'ugly', 'fat', 'loser'
  ];
  const lowerText = text.toLowerCase();
  return inappropriateWords.some(word => lowerText.includes(word));
}

// Local Expert Response Generator (Zero external dependencies)
function getSmartLocalReply(userMessage) {
  const msg = (userMessage || '').toLowerCase().trim();

  // 1. Check for specific 42 Common Core curriculum project matches
  const curriculumMatch = findCurriculumMatch(msg);
  if (curriculumMatch) {
    return curriculumMatch.content;
  }

  // 2. Common Greetings / Initial Queries
  if (['test', 'testing', 'hi', 'hello', 'hey', 'yo', 'ping', 'who are you', 'help', 'what can you do', 'good morning', 'good evening'].includes(msg)) {
    return `👋 **Hello! I'm 42Botler**, your intelligent AI assistant for **42 Heilbronn**.

**Here is what you can ask me about:**
• 🕒 **Campus & Access**: Cluster hours (24/7), RFID badge issues, student lounge coffee
• 🍽️ **Mensa & Dining**: Opening hours and student pricing
• 🔍 **Norminette**: 42 coding standards, forbidden keywords (\`for\`, \`switch\`), variable limits
• 🤖 **Moulinette & Grading**: Evaluation rules, memory leak checks (\`valgrind\`), compilation flags
• 🤝 **Peer Evaluations**: Grading etiquette, defense checklist
• 🎓 **Academics**: 42 & HHN Double Degree, milestone pace, safeguard mechanics
• 💻 **Projects**: Detailed guides for \`libft\`, \`ft_printf\`, \`get_next_line\`, \`born2beroot\`, \`push_swap\`, \`minishell\`, \`philosophers\`, \`cub3d\`, \`cpp\`, \`transcendence\`.

[? Tell me about Norminette ?] [? Explain Minishell ?] [? HHN Double Degree ?] [? Peer evaluation tips ?]`;
  }

  // 3. Specific Campus Life & Workflow Queries
  if (msg.includes('opening') || msg.includes('hours') || msg.includes('cluster') || msg.includes('open')) {
    return `🕒 **Opening Hours & Cluster Access**:
• **Cluster Hours**: Open **24/7/365** for all 42 students and Pisciners!
• **Access**: Use your 42 RFID badge at the entrance doors.
• **Security**: Security desk is staffed during campus hours. If your badge is not working, visit the front desk with a photo ID.

[? Where is the coffee machine? ?] [? Mensa opening hours ?] [? RFID badge broken ?]`;
  }

  if (msg.includes('coffee') || msg.includes('machine')) {
    return `☕ **Coffee Machines at 42 Heilbronn**:
• **Location**: Free machines available in the student lounges on the ground floor and upper floors.
• **Rules**: Keep the kitchen area clean and please bring your own reusable mug/cup!

[? Campus opening hours ?] [? Mensa information ?] [? Where to relax ?]`;
  }

  if (msg.includes('mensa') || msg.includes('eat') || msg.includes('food') || msg.includes('dining')) {
    return `🍽️ **Mensa & Dining Information**:
• **Location**: Ground floor near the main entrance
• **Hours**: Monday - Friday, 11:30 AM - 2:00 PM (Closed on weekends)
• **Payment**: Student card or contactless card payment
• **Piscine**: Pisciners are welcome to dine at the Mensa during opening hours.

[? Coffee machine location ?] [? Campus opening hours ?] [? Student discounts ?]`;
  }

  if (msg.includes('degree') || msg.includes('hhn') || msg.includes('hochschule') || msg.includes('ects')) {
    return `🎓 **Double Degree Program (42 Heilbronn & Hochschule Heilbronn - HHN)**:
• 42 Heilbronn partners with Hochschule Heilbronn (HHN) for an integrated Bachelor of Science track.
• **ECTS Transfer**: You earn recognized university credits while completing 42 Common Core and Advanced projects.
• **Prerequisites**: Check the minimum German/English language requirements and application windows on Intra or via the Pedagogy team.

[? How does Safeguard work? ?] [? Pace and Blackhole ?] [? Internship guidelines ?]`;
  }

  if (msg.includes('safeguard') || msg.includes('pace') || msg.includes('blackhole') || msg.includes('deadline')) {
    return `🛟 **42 Pace, Safeguards & Blackhole Days**:
• **Safeguard**: A pedagogical mechanism designed to ensure students make consistent progress across Milestones 0 to 6.
• **Blackhole Days**: Earned upon validating projects and conducting peer evaluations to maintain active student status.
• **Peer Evals**: Reviewing your peers awards evaluation points and keeps your profile active.

[? Peer evaluation etiquette ?] [? Milestone pace system ?] [? Norminette Checklist ?]`;
  }

  if (msg.includes('norm') || msg.includes('norminette')) {
    return `🔍 **Norminette (42 Coding Standard)**:
• Run \`norminette\` or \`norminette -R CheckForbiddenSourceHeader *.c\`
• **Rules Checklist**:
  - Max 25 lines per function (excluding braces)
  - Max 5 functions per \`.c\` file
  - Max 4 variable declarations per function (at top of scope)
  - Max 80 columns per line
  - No \`for\`, \`do ... while\`, or \`switch\` statements (use \`while\`)
  - No inline variable initialization (\`int a = 0;\` ❌)
  - Space after keywords (\`if\`, \`while\`, \`return\`), NO space between function name & parenthesis
  - Standard 42 Header must be present on all source files!

[? Common Norminette violations ?] [? Peer evaluation tips ?] [? Libft guide ?]`;
  }

  if (msg.includes('moulinette') || msg.includes('grading')) {
    return `🤖 **Moulinette & Grading**:
• Automated evaluation bot for Piscine and selected core projects.
• Tests for edge cases, memory leaks (\`valgrind\`), compilation flags (\`-Wall -Wextra -Werror\`), and norm compliance.
• **Golden Rule**: 0 on Norminette or compilation error = automatic 0 for the whole submission!

[? Valgrind leak check command ?] [? Norminette checklist ?] [? Peer evaluation guide ?]`;
  }

  if (msg.includes('peer') || msg.includes('evaluation') || msg.includes('eval point')) {
    return `🤝 **Peer Evaluation Guidelines & Etiquette**:
1. **Punctuality**: Be at the workstation on time.
2. **Code Defense**: The student being evaluated must explain every single line of code and architectural decision.
3. **Verification Checklist**:
   - Check norm: \`norminette\`
   - Compile flags: \`gcc -Wall -Wextra -Werror\`
   - Memory check: \`valgrind --leak-check=full ./<binary>\`
   - Test edge cases (\`NULL\`, empty strings, \`INT_MAX\`, negative numbers).
4. **Constructive Feedback**: Always leave helpful, encouraging comments on Intra.

[? Norminette rules ?] [? How to get eval points ?] [? Libft guide ?]`;
  }

  if (msg.includes('card') || msg.includes('badge') || msg.includes('broken') || msg.includes('rfid')) {
    return `🪪 **42 Badge / Access Card Issues**:
• If your card is damaged, lost, or not opening doors, visit the **Security Desk** on the ground floor.
• Bring official photo ID for identity verification.
• Do not tailgate or force doors open.

[? Cluster opening hours ?] [? Where is Security desk ?] [? Coffee machine ?]`;
  }

  if (msg.includes('visa') || msg.includes('residence') || msg.includes('ausländerbehörde')) {
    return `🚨 **CRITICAL VISA NOTICE**:
• ❌ **42 Heilbronn does NOT provide visa sponsorship or visa assistance.**
• 42 is an independent non-accredited private educational foundation in Germany; it cannot issue formal student visa certificates for German embassies.
• All visa questions must be directed to your local German Embassy or the Heilbronn Ausländerbehörde independently.

[? Campus hours ?] [? Scholarships ?] [? HHN Double Degree ?]`;
  }

  if (msg.includes('valgrind') || msg.includes('leak') || msg.includes('memory')) {
    return `🧼 **Memory Leak Detection with Valgrind**:
\`\`\`bash
# Compile with debug symbols
gcc -Wall -Wextra -Werror -g *.c -o program

# Run Valgrind with full leak checks
valgrind --leak-check=full --show-leak-kinds=all --track-origins=yes ./program
\`\`\`
**What to look for**:
• \`definitely lost\`: Memory allocated with \`malloc\` that was never freed.
• \`still reachable\`: Memory not freed before program exit.
• \`invalid read/write\`: Accessing out-of-bounds or freed memory.

[? Get_next_line memory leaks ?] [? Libft ft_split ?] [? Norminette rules ?]`;
  }

  // 4. RAG Semantic Chunk Retrieval
  const topChunks = retriever.search(userMessage, 1);
  if (topChunks && topChunks.length > 0) {
    const chunk = topChunks[0];
    const preview = chunk.content.substring(0, 600).trim();
    return `📖 **${chunk.title}** (from 42 Student Wiki):\n\n${preview}...\n\n[? Tell me more ?] [? Norminette rules ?] [? Campus hours ?]`;
  }

  // 5. Default Fallback
  return `🎯 **I specialize exclusively in 42 Heilbronn curriculum, tools, and campus life.**

I couldn't find a direct match for your question. You can ask me about:
• **Projects**: \`libft\`, \`ft_printf\`, \`gnl\`, \`born2beroot\`, \`push_swap\`, \`minishell\`, \`philosophers\`, \`cub3d\`, \`cpp\`, \`transcendence\`
• **Standards**: Norminette rules, Moulinette grading, \`valgrind\` memory leak checks
• **Campus**: 24/7 cluster access, RFID badge replacement, Mensa, free coffee
• **Academic Programs**: 42 & HHN Double Degree, Safeguard & Pace

[? Norminette rules ?] [? Common Core Projects ?] [? HHN Double Degree ?]`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const stats = retriever.getStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiProvider: activeProvider,
    aiModel: activeModel,
    hasApiKey: Boolean(activeClient),
    rag: {
      isLoaded: stats.isLoaded,
      chunksIndexed: stats.chunksCount,
      totalChars: stats.totalChars,
      sources: stats.sources
    }
  });
});

// Knowledge base debug info
app.get('/api/knowledge-base', (_req, res) => {
  try {
    const stats = retriever.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read knowledge base' });
  }
});

// Chat endpoint (Standard JSON)
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestMessage = messages[messages.length - 1];
    const userText = latestMessage?.content || '';

    if (containsInappropriateContent(userText)) {
      return res.json({
        reply: `🚫 **Let's keep our communication respectful.**\n\nI am here to assist with 42 Heilbronn campus life, coding standards, and academic questions. What 42 topic can I help you with? 🤝`
      });
    }

    // If no external AI client, use the smart local engine
    if (!activeClient) {
      const reply = getSmartLocalReply(userText);
      return res.json({ reply });
    }

    const ragContext = retriever.buildContext(userText, 6000);
    const systemPrompt = `You are 42Botler, an intelligent, concise, and highly knowledgeable AI companion designed exclusively for 42 Heilbronn students and Pisciners.

RULES:
1. ONLY answer questions related to 42 Heilbronn, 42 school curriculum (C, C++, algorithms, graphics, web), Norminette, Moulinette, campus life, peer evaluations, and student resources.
2. If asked about unrelated general topics, politely explain you specialize in 42 Heilbronn topics only.
3. Be clear, structured, and use Markdown code blocks for C/Bash commands with syntax tags.
4. After your answer, suggest 2-3 short relevant follow-up questions wrapped in [? Suggestion ?] format (e.g. [? Tell me about Norminette ?]).
5. Context from 42 Student Wiki:
${ragContext}`;

    try {
      const completion = await activeClient.chat.completions.create({
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1200,
        temperature: 0.5,
      });

      const reply = completion.choices[0]?.message?.content || getSmartLocalReply(userText);
      return res.json({ reply });
    } catch (apiError) {
      console.warn(`AI Provider (${activeProvider}) error, using smart local engine:`, apiError.message);
      const reply = getSmartLocalReply(userText);
      return res.json({ reply });
    }
  } catch (error) {
    console.error('Chat error:', error);
    const userMsg = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    return res.json({ reply: getSmartLocalReply(userMsg) });
  }
});

// Chat endpoint (SSE Streaming)
app.post('/api/chat/stream', chatLimiter, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestMessage = messages[messages.length - 1];
    const userText = latestMessage?.content || '';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (containsInappropriateContent(userText)) {
      res.write(`data: ${JSON.stringify({ chunk: "🚫 **Let's keep our communication respectful.**\n\nI am here to assist with 42 Heilbronn questions." })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // If no external client, stream local reply smoothly
    if (!activeClient) {
      const localReply = getSmartLocalReply(userText);
      res.write(`data: ${JSON.stringify({ chunk: localReply })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const ragContext = retriever.buildContext(userText, 6000);
    const systemPrompt = `You are 42Botler, an intelligent, concise AI companion for 42 Heilbronn.
Context:
${ragContext}`;

    try {
      const stream = await activeClient.chat.completions.create({
        model: activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1200,
        temperature: 0.5,
        stream: true,
      });

      for await (const part of stream) {
        const text = part.choices[0]?.delta?.content || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      console.warn(`Streaming failed on ${activeProvider}, streaming local reply:`, streamError.message);
      const localReply = getSmartLocalReply(userText);
      res.write(`data: ${JSON.stringify({ chunk: localReply })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Stream failure' });
    } else {
      res.end();
    }
  }
});

// Serve client route
app.get('/42botler/*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`🚀 42Botler Server running on http://localhost:${port}`);
  console.log(`🤖 Active AI Engine: ${activeProvider} (${activeModel})`);
  console.log(`🩺 Health check: http://localhost:${port}/api/health`);
});
