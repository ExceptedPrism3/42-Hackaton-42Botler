# Retriever tests

Run from the repository root with Node.js 20 (verified with 20.11.1):

```sh
node --test server/test/retriever.test.js
```

No installation, external services, API keys, or network access are needed.
Only built-in `node:test` and `node:assert/strict` are used. The production
singleton loads the two checked-in knowledge bases once. Synthetic Markdown
fixtures use separate objects sharing its prototype; neither singleton state
nor knowledge files are modified.

Verified baseline run: **27 tests, 22 passed, 5 expected TODO failures,
0 regular failures, 0 skipped; exit status 0** (about 59 ms).

## Coverage and interpretation

- Empty, whitespace, missing, punctuation-only, stop-word-only and unknown queries.
- Markdown headings at levels 1-4, metadata, final chunk, the strict
  40-character cutoff, horizontal separators and known text cleanup.
- Case-insensitive search, stop words, title weighting, relevance threshold
  and result limits.
- Context formatting, exact character boundaries, whole-section packing,
  the four-hit cap and the default 6000-character limit.
- Real-source retrieval for `norminette`, `peer evaluation`, `mensa` and
  `scholarship`, plus source/statistics consistency.

Normal tests guard working behavior. Executable `todo` tests describe desired
behavior that already fails on the unchanged baseline. Node reports their
assertion failures as `not ok ... # TODO`, without counting them as regular
failures or returning a failing exit status. They are not skipped. A regular
failure requires investigation; it is not automatically evidence of a code
regression, since changes to the knowledge files can also affect integration
tests. Review a TODO that starts passing and remove its marker once resolved.

## Baseline observations

Observed with the checked-in data: **84 chunks, 139860 content characters**.
These counts and the incidental ordering of unrelated hits are not frozen
as test expectations.

| Query | Existing result | Assessment |
| --- | --- | --- |
| `norminette` | First: `1. Backend Details` (`/server`), then `Community Meeting`. Default context: 1989 characters. | The first hit contains a useful coding-standard sentence, but inside application-generation instructions. Source contamination, not a new regression; covered by a TODO. |
| `peer evaluation` | First: `What Happens If I Have A Problem With A Peer?`, then `Double Degree 42 Hhn`, `Evaluation Cheatsheet`, `Evaluation Points Economy` and a Berlin school page. Default context: 1240 characters. | Conflict advice outranks evaluation guidance. The cheatsheet and points-economy bodies contain Notion JavaScript. Ranking and cheatsheet-content TODOs keep these separate from working retrieval. |
| `mensa` | First: `Study In 42 Heilbronn In Germany - The Network`. Default context: 4690 characters. | Relevant evidence: access to Mensa and Library at Bildungscampus. The source does not establish opening hours, menus or prices; the tests do not invent those facts. |
| `scholarship` | First: `Scholarships`. Default context: 909 characters. | Heading/URL match, but the body is the Rules page, not funding advice. A positive title-match test does not imply answer quality; a separate TODO checks the body without counting its URL as evidence. |

`buildContext` stops at the first chunk that exceeds the remaining budget,
instead of considering subsequent smaller hits. For `peer evaluation`, the
10932-character second hit prevents even the smaller evaluation pages from
entering the default context. A deterministic fixture reproduces this as a
TODO. Actual output still respects the character limit.

All five TODOs are pre-existing issues. This suite deliberately changes no
retrieval logic, knowledge data, scrapers, API, frontend, dependencies or
package scripts. It checks lexical retrieval and context assembly, not
embeddings, generated-answer correctness, API integration or live-source
freshness.
