import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'
import { today, getNextReviewDate, isDue, calculateXP } from '../lib/helpers.js'

export function useProblems(userId) {
  const [allProblems, setAllProblems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProblems = useCallback(async (archived = null) => {
    if (!userId) return []
    setLoading(true)
    let query = supabase
      .from('problems')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })

    if (archived === true) query = query.eq('archived', true)
    if (archived === false) query = query.eq('archived', false)

    const { data, error } = await query
    if (!error) setAllProblems(data || [])
    setLoading(false)
    return data || []
  }, [userId])

  useEffect(() => {
    fetchProblems(null)
  }, [fetchProblems])

  const problems = useMemo(() => allProblems.filter(p => !p.archived), [allProblems])
  const archivedProblems = useMemo(() => allProblems.filter(p => p.archived), [allProblems])

  const addProblem = async ({ title, url, topics, difficulty, notes, code, codeLanguage, initialConfidence }) => {
    const nextReview = getNextReviewDate(initialConfidence)
    const xpEarned = calculateXP(initialConfidence, difficulty)
    const { data, error } = await supabase
      .from('problems')
      .insert([{
        user_id: userId,
        title: title.trim(),
        url: url?.trim() || null,
        topics: topics || [],
        difficulty: difficulty || 'medium',
        notes: notes?.trim() || null,
        code: code?.trim() || null,
        code_language: codeLanguage || 'plaintext',
        mastery: initialConfidence,
        next_review: nextReview,
        review_count: 0,
        archived: false,
        consecutive_masters: 0,
        added_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (!error) {
      setAllProblems(prev => [data, ...prev])
    }
    return { data, error, xpEarned }
  }

  const reviewProblem = async (problemId, rating, options = {}) => {
    const problem = allProblems.find(p => p.id === problemId)
    if (!problem) return { error: { message: 'Problem not found' } }
    const nextReview = options.earlyReview ? problem.next_review : getNextReviewDate(rating)
    const xpBase = calculateXP(rating, problem.difficulty)
    const xpEarned = options.earlyReview ? Math.max(1, Math.floor(xpBase / 2)) : xpBase
    const consecutiveMasters = rating === 'master' ? (problem.consecutive_masters || 0) + 1 : 0
    const { data, error } = await supabase
      .from('problems')
      .update({
        mastery: rating,
        next_review: nextReview,
        review_count: (problem.review_count || 0) + 1,
        consecutive_masters: consecutiveMasters,
      })
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setAllProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error, xpEarned, suggestArchive: consecutiveMasters >= 3 && rating === 'master' }
  }

  const updateNotes = async (problemId, updates) => {
    const payload = typeof updates === 'string' ? { notes: updates } : updates || {}
    const { data, error } = await supabase
      .from('problems')
      .update(payload)
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setAllProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error }
  }

  const deleteProblem = async (problemId) => {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', problemId)
    if (!error) {
      setAllProblems(prev => prev.filter(p => p.id !== problemId))
    }
    return { error }
  }

  const archiveProblem = async (problemId) => {
    const { data, error } = await supabase
      .from('problems')
      .update({ archived: true, next_review: today() })
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setAllProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error }
  }

  const restoreProblem = async (problemId) => {
    const { data, error } = await supabase
      .from('problems')
      .update({ archived: false, next_review: today() })
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setAllProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error }
  }

  const importProblems = async (newProblems) => {
    if (!userId || !newProblems?.length) return { imported: 0, skipped: 0 }
    const existingTitles = new Set(allProblems.map(p => p.title?.toLowerCase()))
    const toInsert = newProblems.filter(p => !existingTitles.has(p.title?.toLowerCase()))
    const skipped = newProblems.length - toInsert.length
    if (!toInsert.length) return { imported: 0, skipped }
    const rows = toInsert.map(p => ({
      user_id: userId,
      title: p.title,
      url: p.url || null,
      topics: Array.isArray(p.topics) ? p.topics : (p.topics ? p.topics.split(';') : []),
      difficulty: p.difficulty || 'medium',
      notes: p.notes || null,
      mastery: p.mastery || 'good',
      next_review: p.next_review || today(),
      review_count: Number(p.review_count) || 0,
      archived: false,
      consecutive_masters: 0,
      added_at: p.added_at || new Date().toISOString(),
    }))
    const { data, error } = await supabase.from('problems').insert(rows).select()
    if (!error) {
      setAllProblems(prev => [...(data || []), ...prev])
    }
    return { imported: data?.length || 0, skipped, error }
  }

  const dueProblems = problems.filter(p => isDue(p.next_review))
  const overdueProblems = problems.filter(p => p.next_review < today())

  return {
    problems,
    allProblems,
    archivedProblems,
    loading,
    dueProblems,
    overdueProblems,
    addProblem,
    reviewProblem,
    updateNotes,
    deleteProblem,
    archiveProblem,
    restoreProblem,
    importProblems,
    refetch: fetchProblems,
  }
}
