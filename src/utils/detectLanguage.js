//src/utils/detectLanguage.js  // Lightweight heuristic language detector — no dependencies needed.
// Scores code against signature patterns for common languages and
// returns the best match (falls back to 'plaintext').

const SIGNATURES = [
  { lang: 'python', patterns: [/^\s*def\s+\w+\(.*\):/m, /^\s*import\s+\w+/m, /:\s*$/m, /elif\s+/, /^\s*#/m, /print\(/] },
  { lang: 'java', patterns: [/public\s+class\s+\w+/, /public\s+static\s+void\s+main/, /System\.out\.println/, /\bnew\s+\w+\(/] },
  { lang: 'cpp', patterns: [/#include\s*<[\w./]+>/, /std::/, /cout\s*<</, /cin\s*>>/, /int\s+main\s*\(/] },
  { lang: 'c', patterns: [/#include\s*<stdio\.h>/, /printf\(/, /scanf\(/, /int\s+main\s*\(\s*(void)?\s*\)/] },
  { lang: 'javascript', patterns: [/=>\s*{?/, /\bconst\b|\blet\b|\bvar\b/, /console\.log\(/, /function\s*\w*\s*\(/, /require\(|import\s.+from/] },
  { lang: 'typescript', patterns: [/:\s*(string|number|boolean|any|void)\b/, /interface\s+\w+/, /:\s*\w+\[\]/] },
  { lang: 'go', patterns: [/package\s+main/, /func\s+\w+\(/, /fmt\.Println/, /:=\s*/] },
  { lang: 'ruby', patterns: [/^\s*def\s+\w+/m, /^\s*end\s*$/m, /puts\s+/] },
  { lang: 'rust', patterns: [/fn\s+\w+\(/, /let\s+mut\s+/, /println!\(/, /->\s*\w+/] },
  { lang: 'csharp', patterns: [/using\s+System/, /Console\.WriteLine/, /public\s+class\s+\w+/, /namespace\s+\w+/] },
]

export function detectLanguage(code) {
  if (!code || !code.trim()) return 'plaintext'

  let best = { lang: 'plaintext', score: 0 }

  for (const { lang, patterns } of SIGNATURES) {
    let score = 0
    for (const p of patterns) {
      if (p.test(code)) score++
    }
    // Disambiguate C vs C++: if both match, prefer cpp when std:: or cout present
    if (score > best.score) best = { lang, score }
  }

  // Tie-break: TS patterns imply JS too, but TS is more specific — nudge it up
  if (best.lang === 'javascript') {
    const tsHits = SIGNATURES.find(s => s.lang === 'typescript').patterns.filter(p => p.test(code)).length
    if (tsHits >= 1) best = { lang: 'typescript', score: best.score }
  }

  return best.score > 0 ? best.lang : 'plaintext'
}

export const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  ruby: 'Ruby',
  rust: 'Rust',
  csharp: 'C#',
  plaintext: 'Plain text',
}