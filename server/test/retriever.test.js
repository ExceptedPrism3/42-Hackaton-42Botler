const assert = require('node:assert/strict');
const { describe, test } = require('node:test');
const retriever = require('../retriever');

function fixture(markdown) {
  // The module exports a singleton; isolate fixtures without reloading or changing it.
  const isolated = Object.create(Object.getPrototypeOf(retriever));
  isolated.chunks = isolated.parseMarkdownChunks(markdown, 'fixture.md');
  isolated.isLoaded = true;
  assert.ok(isolated.chunks.length > 0, 'Fixture must not trigger init()');
  return isolated;
}

function section(chunk) {
  return `### ${chunk.title}\n${chunk.content}\n\n---\n\n`;
}

describe('Query handling', () => {
  for (const query of ['', ' \n\t ', undefined, null, '?!...', 'the and der die']) {
    test(`empty or non-searchable query ${JSON.stringify(query)}`, () => {
      assert.deepEqual(retriever.search(query), []);
      assert.equal(retriever.buildContext(query), '');
    });
  }

  test('unknown terms return neither hits nor context', () => {
    const query = 'zzzxqvunknownterm';
    assert.deepEqual(retriever.search(query), []);
    assert.equal(retriever.buildContext(query), '');
  });
});

describe('Markdown chunking with isolated fixtures', () => {
  test('headings at levels 1-4 preserve content, source, level and URL', () => {
    const markdown = [1, 2, 3, 4].map(level =>
      `${'#'.repeat(level)} **Topic ${level}**\n` +
      `**URL:** https://example.test/${level}\n` +
      `This is the distinct explanatory body for topic ${level}, long enough to index.`
    ).join('\n');
    const { chunks } = fixture(markdown);
    assert.equal(chunks.length, 4);
    for (const [index, chunk] of chunks.entries()) {
      const level = index + 1;
      assert.equal(chunk.title, `Topic ${level}`);
      assert.equal(chunk.rawTitle, `**Topic ${level}**`);
      assert.equal(chunk.level, level);
      assert.equal(chunk.url, `https://example.test/${level}`);
      assert.equal(chunk.sourceFile, 'fixture.md');
      assert.equal(chunk.charCount, chunk.content.length);
      assert.ok(chunk.content.endsWith(`topic ${level}, long enough to index.`));
      assert.equal(chunk.termFreq.explanatory, 1);
    }
  });

  test('drops bodies of 40 characters but retains 41, including the final chunk', () => {
    const { chunks } = fixture(
      `# Short\n${'a'.repeat(40)}\n# Kept\n${'b'.repeat(41)}`
    );
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].title, 'Kept');
    assert.equal(chunks[0].content, 'b'.repeat(41));
  });

  test('horizontal separators flush long sections without leaking their URLs', () => {
    const first = [
      '**URL:** https://example.test/first',
      ...Array.from({ length: 5 }, (_, i) => `First section explanatory line ${i}.`)
    ].join('\n');
    const last = 'Second section has sufficient content to be retained separately.';
    const { chunks } = fixture(`# Guide\n${first}\n---\n${last}`);
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0].content, first);
    assert.equal(chunks[0].url, 'https://example.test/first');
    assert.equal(chunks[1].title, 'Guide');
    assert.equal(chunks[1].content, last);
    assert.equal(chunks[1].url, '');
  });

  test('cleans known artifacts and indentation before indexing', () => {
    const body = 'This useful explanation is long enough to remain in the index.';
    const { chunks } = fixture(
      `# Clean\nSkip to content\n{"resolvedServerColorMode":"dark"}\n    ${body}`
    );
    assert.equal(chunks[0].content, body);
  });
});

describe('Search ranking with isolated fixtures', () => {
  const isolated = fixture([
    '# General',
    'The telescope is mentioned once in this otherwise general explanation.',
    '# Telescope',
    'A dedicated guide describes instruments and observing the night sky.',
    '# Other',
    'Unrelated information about campus facilities and available resources.'
  ].join('\n'));

  test('title matches outrank weak body mentions and respect topK', () => {
    assert.deepEqual(isolated.search('telescope').map(c => c.title), ['Telescope']);
    assert.equal(isolated.search('telescope', 1).length, 1);
    assert.deepEqual(isolated.search('telescope', 0), []);
  });

  test('query matching is case-insensitive and ignores stop words', () => {
    assert.deepEqual(isolated.search('What is THE TELESCOPE?'), isolated.search('telescope'));
  });
});

describe('Context limits with isolated fixtures', () => {
  const isolated = fixture(
    Array.from({ length: 5 }, (_, i) =>
      `# Telescope ${i}\nThis guide explains telescope equipment and observing techniques.`
    ).join('\n')
  );
  const hits = isolated.search('telescope');
  const firstSection = section(hits[0]);

  test('includes a complete section at its exact budget, never a partial section', () => {
    assert.equal(isolated.buildContext('telescope', firstSection.length), firstSection.trim());
    assert.equal(isolated.buildContext('telescope', firstSection.length - 1), '');
    assert.equal(isolated.buildContext('telescope', 0), '');
  });

  test('packs complete sections within the budget including formatting overhead', () => {
    const expected = hits.slice(0, 2).map(section).join('');
    assert.equal(isolated.buildContext('telescope', expected.length), expected.trim());
    assert.ok(isolated.buildContext('telescope', expected.length).length <= expected.length);
  });

  test('includes at most four search hits even when all five fit', () => {
    assert.equal(hits.length, 5);
    assert.equal(
      isolated.buildContext('telescope', 10000),
      hits.slice(0, 4).map(section).join('').trim()
    );
  });

  test('skips an oversized hit so a later fitting hit can supply context', {
    todo: 'Existing buildContext break stops at the first oversized hit'
  }, () => {
    const oversized = fixture(
      `# Telescope\n${'Long telescope explanation. '.repeat(30)}\n` +
      '# Telescope Short\nThis telescope guide is short enough to fit the context budget.'
    );
    const [, shorter] = oversized.search('telescope');
    const budget = section(shorter).length;
    assert.ok(section(oversized.search('telescope')[0]).length > budget);
    assert.equal(oversized.buildContext('telescope', budget), section(shorter).trim());
  });
});

describe('Integration with the checked-in knowledge bases', () => {
  test('loads both sources and exposes consistent statistics', () => {
    const stats = retriever.getStats();
    assert.equal(stats.isLoaded, true);
    assert.ok(stats.chunksCount > 0);
    assert.equal(stats.chunksCount, retriever.chunks.length);
    assert.equal(stats.totalChars, retriever.chunks.reduce((sum, c) => sum + c.content.length, 0));
    assert.deepEqual(stats.sources.slice().sort(), ['knowledge_base.md', 'knowledge_base_notion.md']);
  });

  test('norminette returns a coding-standard explanation', () => {
    const hits = retriever.search('norminette');
    assert.ok(hits.length > 0);
    assert.match(hits[0].content, /norminette.*coding standard checker/i);
  });

  test('mensa returns Bildungscampus access information', () => {
    const hits = retriever.search('mensa');
    assert.ok(hits.length > 0);
    assert.equal(hits[0].sourceFile, 'knowledge_base.md');
    assert.match(hits[0].content, /Access to Mensa and Library at Bildungscampus/i);
    assert.match(retriever.buildContext('mensa'), /Access to Mensa and Library at Bildungscampus/i);
  });

  test('peer evaluation finds evaluation-specific pages among its top five', () => {
    assert.ok(retriever.search('peer evaluation').some(c => /evaluation/i.test(c.title)));
  });

  test('scholarship finds the dedicated Scholarships page', () => {
    const [first] = retriever.search('scholarship');
    assert.ok(first);
    assert.equal(first.title, 'Scholarships');
    assert.equal(first.sourceFile, 'knowledge_base_notion.md');
  });

  test('real-query contexts obey the default and explicit character limits', () => {
    for (const query of ['norminette', 'peer evaluation', 'mensa', 'scholarship']) {
      const hits = retriever.search(query, 4);
      for (const budget of [0, 100, 1000, 6000]) {
        const context = retriever.buildContext(query, budget);
        assert.ok(context.length <= budget, `${query}: exceeded ${budget}`);
        let remaining = context;
        for (const chunk of hits) {
          const complete = section(chunk).trim();
          if (remaining.startsWith(complete)) {
            remaining = remaining.slice(complete.length).trim();
          }
        }
        assert.equal(remaining, '', `${query}: context contains a partial or unexpected section`);
      }
      assert.equal(retriever.buildContext(query), retriever.buildContext(query, 6000));
    }
  });
});

describe('Known knowledge and ranking weaknesses (not new regressions)', () => {
  test('norminette top hit is not application-generation scaffolding', {
    todo: 'Existing source contamination: Backend Details contains the only concise explanation'
  }, () => {
    const [first] = retriever.search('norminette');
    assert.ok(first);
    assert.doesNotMatch(first.content, /Create a placeholder for the OpenAI API key/i);
  });

  test('peer evaluation ranks evaluation guidance before peer-conflict advice', {
    todo: 'Existing ranking puts the peer-conflict FAQ before evaluation pages'
  }, () => {
    const [first] = retriever.search('peer evaluation');
    assert.ok(first);
    assert.match(first.title, /evaluation/i);
  });

  test('Evaluation Cheatsheet contains guidance rather than Notion bootstrap code', {
    todo: 'Existing scraped Evaluation Cheatsheet body is JavaScript'
  }, () => {
    const hit = retriever.search('peer evaluation').find(c => c.title === 'Evaluation Cheatsheet');
    assert.ok(hit, 'Evaluation Cheatsheet must be retrieved');
    assert.doesNotMatch(hit.content, /document\.getElementById|localStorage/);
  });

  test('Scholarships body contains funding information beyond its heading and URL', {
    todo: 'Existing Scholarships page contains Rules text instead of scholarship information'
  }, () => {
    const [first] = retriever.search('scholarship');
    assert.ok(first);
    const body = first.content.replace(/^\*\*URL:\*\*.*$/gm, '');
    assert.match(body, /scholarship|stipend|funding|financial support/i);
  });
});
