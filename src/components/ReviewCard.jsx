import React, { useState, useEffect } from "react";
import { ExternalLink, Check, Flame, Star, RotateCcw, Archive } from "lucide-react";
import { detectLanguage, LANGUAGE_LABELS } from "../lib/detectLanguage.js";

const DIFFICULTY_STYLE = {
  easy: "bg-emerald-500/15 text-emerald-400",
  medium: "bg-amber-500/15 text-amber-400",
  hard: "bg-rose-500/15 text-rose-400",
};

const TAG_STYLE = {
  violet: "bg-violet-500/15 text-violet-300",
  amber: "bg-amber-500/15 text-amber-300",
  sky: "bg-sky-500/15 text-sky-300",
  emerald: "bg-emerald-500/15 text-emerald-300",
  pink: "bg-pink-500/15 text-pink-300",
};

const TAG_TONES = ["violet", "amber", "sky", "emerald", "pink"];

const GRADES = [
  { key: "again", label: "Again", sub: "1 day", icon: RotateCcw,
    classes: "border-rose-500/25 text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/10" },
  { key: "hard", label: "Hard", sub: "3 days", icon: Flame,
    classes: "border-amber-500/25 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/10" },
  { key: "good", label: "Good", sub: "7 days", icon: Check,
    classes: "border-emerald-500/25 text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/10" },
  { key: "master", label: "Master", sub: "14 days", icon: Star,
    classes: "border-violet-500/25 text-violet-300 hover:border-violet-500/60 hover:bg-violet-500/10" },
];

const toneForTopic = (index) => TAG_TONES[index % TAG_TONES.length];
const normalizeDifficulty = (difficulty) => difficulty?.toString().toLowerCase() || "medium";
const formatDifficulty = (difficulty) => {
  const normalized = normalizeDifficulty(difficulty);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export default function ReviewCard({ problem = {}, onRate, onNotesChange, onArchive }) {
  const [revealedNotes, setRevealedNotes] = useState(false);
  const [revealedSyntax, setRevealedSyntax] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState(problem.notes || "");
  const [codeDraft, setCodeDraft] = useState(problem.code || "");
  const [saving, setSaving] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNotesDraft(problem.notes || "");
    setCodeDraft(problem.code || "");
  }, [problem.notes, problem.code]);

  const detectedLang = codeDraft ? detectLanguage(codeDraft) : "plaintext";

  const handleSaveNotes = async () => {
    if (!onNotesChange) {
      setEditing(false);
      return;
    }

    const sameNotes = notesDraft === (problem.notes || "");
    const sameCode = codeDraft === (problem.code || "");
    if (sameNotes && sameCode) {
      setEditing(false);
      return;
    }

    setSaving(true);
    const payload = {
      notes: notesDraft,
      code: codeDraft,
      code_language: detectLanguage(codeDraft),
    };
    await onNotesChange(problem.id, payload);
    setSaving(false);
    setEditing(false);
  };

  const handleGrade = async (gradeKey) => {
    if (!onRate || submitting) return;
    setSubmitting(true);
    try {
      await onRate(problem.id, gradeKey);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;
    if (!archiveConfirm) {
      setArchiveConfirm(true)
      window.setTimeout(() => setArchiveConfirm(false), 1500)
      return
    }
    await onArchive(problem.id)
    setArchiveConfirm(false)
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    const escape = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = escape(text);
    html = html.replace(/```([\s\S]*?)```/g, "<pre class='markdown-code'><code>$1</code></pre>");
    html = html.replace(/`([^`]+)`/g, "<code class='inline-code'>$1</code>");
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    html = html.replace(/^- (.*)$/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>");
    html = html.replace(/\n/g, "<br />");
    return html;
  };

  const notesPreview = notesDraft ? (
    <div
      className="prose prose-invert max-w-none space-y-3"
      style={{ color: 'var(--text-primary)' }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(notesDraft) }}
    />
  ) : (
    <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>No notes written yet.</p>
  );

  const syntaxPreview = codeDraft ? (
    <pre className="mt-3 overflow-x-auto rounded-2xl p-4 text-sm" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}><code>{codeDraft}</code></pre>
  ) : (
    <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>No syntax snippets yet.</p>
  );

  return (
    <div className="card-glass rounded-[24px] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                DIFFICULTY_STYLE[normalizeDifficulty(problem.difficulty)],
              ].join(" ")}
            >
              {formatDifficulty(problem.difficulty)}
            </span>
            {problem.mastery && (
              <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                {problem.mastery}
              </span>
            )}
          </div>

          <h2 className="mt-3 text-2xl font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {problem.title || "Untitled problem"}
          </h2>

          {problem.url && (
            <a
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm transition"
              style={{ color: 'var(--accent)' }}
            >
              <ExternalLink className="h-4 w-4" />
              View problem
            </a>
          )}

          {Array.isArray(problem.topics) && problem.topics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {problem.topics.map((topic, index) => (
                <span
                  key={`${topic}-${index}`}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    TAG_STYLE[toneForTopic(index)],
                  ].join(" ")}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2 text-right text-xs sm:min-w-[140px]" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>Next review</div>
            <div className="mt-1 font-mono" style={{ color: 'var(--text-primary)' }}>{problem.next_review || "TBD"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-muted)' }}>Reviews</div>
            <div className="mt-1 font-mono" style={{ color: 'var(--text-primary)' }}>{problem.review_count ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="card-glass-inner mt-6 rounded-3xl p-5">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Markdown-supported recall notes.</p>
              </div>
              <div className="flex items-center gap-3">
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setRevealedNotes((v) => !v)}
                    className="text-xs font-semibold uppercase tracking-[0.18em] transition"
                    style={{ color: 'var(--accent)' }}
                  >
                    {revealedNotes ? "Hide" : "Reveal"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing((value) => !value)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] transition"
                  style={{ color: 'var(--accent)' }}
                >
                  {editing ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>

            {editing ? (
              <div className="mt-4 space-y-3">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={6}
                  className="input w-full"
                  placeholder="Write markdown notes here..."
                />
                <div className="rounded-3xl p-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  <div className="mb-2 text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>Preview</div>
                  <div
                    className="prose prose-invert max-w-none"
                    style={{ color: 'var(--text-primary)' }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(notesDraft) }}
                  />
                </div>
              </div>
            ) : !revealedNotes ? (
              <div className="mt-4 rounded-3xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                Notes are hidden. Click "Reveal" to show your saved approach.
              </div>
            ) : (
              <div className="mt-4 rounded-3xl p-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                {notesPreview}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Syntax</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Only keep language / algorithm syntax here.</p>
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setRevealedSyntax((v) => !v)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] transition"
                  style={{ color: 'var(--accent)' }}
                >
                  {revealedSyntax ? "Hide" : "Reveal"}
                </button>
              )}
            </div>

            {editing ? (
              <textarea
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
                rows={4}
                className="input mt-4 w-full"
                placeholder="e.g. max = -Infinity; for num of arr: if num > max..."
              />
            ) : !revealedSyntax ? (
              <div className="mt-4 rounded-3xl border border-dashed p-6 text-center text-sm" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                Syntax is hidden. Click "Reveal" to show any saved snippets.
              </div>
            ) : (
              <div className="mt-4 rounded-3xl p-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--text-secondary)' }}>Detected</div>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-primary)' }}>{LANGUAGE_LABELS[detectedLang] || detectedLang}</div>
                </div>
                {syntaxPreview}
              </div>
            )}
          </div>

          {editing && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Saving..." : "Save notes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {onArchive && (revealedNotes || revealedSyntax) && (
          <button
            type="button"
            onClick={handleArchive}
            className="text-xs font-semibold uppercase tracking-[0.18em] transition"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="inline-flex items-center gap-2">
              <Archive className="h-4 w-4" />
              {archiveConfirm ? 'Confirm?' : 'Archive this problem'}
            </span>
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {GRADES.map((grade) => {
          const Icon = grade.icon;
          return (
            <button
              key={grade.key}
              type="button"
              disabled={submitting}
              onClick={() => handleGrade(grade.key)}
              className={[
                "group flex flex-col items-center justify-center gap-2 rounded-3xl border px-4 py-4 text-xs font-semibold uppercase transition disabled:opacity-50 disabled:cursor-not-allowed",
                grade.classes,
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{grade.label}</span>
              <span className="text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>{grade.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}