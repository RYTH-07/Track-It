import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { today, getNextReviewDate, isDue, calculateXP } from '../lib/helpers.js'

export function useProblems(userId) {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProblems = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    if (!error) setProblems(data || [])
    setLoading(false)
    return data || []
  }, [userId])

  useEffect(() => {
    fetchProblems()
  }, [fetchProblems])

  const addProblem = async ({ title, url, topics, difficulty, notes, initialConfidence }) => {
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
        mastery: initialConfidence,
        next_review: nextReview,
        review_count: 0,
        added_at: new Date().toISOString(),
      }])
      .select()
      .single()
    if (!error) {
      setProblems(prev => [data, ...prev])
    }
    return { data, error, xpEarned }
  }

  const reviewProblem = async (problemId, rating) => {
    const problem = problems.find(p => p.id === problemId)
    if (!problem) return { error: { message: 'Problem not found' } }
    const nextReview = getNextReviewDate(rating)
    const xpEarned = calculateXP(rating, problem.difficulty)
    const { data, error } = await supabase
      .from('problems')
      .update({
        mastery: rating,
        next_review: nextReview,
        review_count: (problem.review_count || 0) + 1,
      })
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error, xpEarned }
  }

  const updateNotes = async (problemId, notes) => {
    const { data, error } = await supabase
      .from('problems')
      .update({ notes })
      .eq('id', problemId)
      .select()
      .single()
    if (!error) {
      setProblems(prev => prev.map(p => p.id === problemId ? data : p))
    }
    return { data, error }
  }

  const deleteProblem = async (problemId) => {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', problemId)
    if (!error) {
      setProblems(prev => prev.filter(p => p.id !== problemId))
    }
    return { error }
  }

  const importProblems = async (newProblems) => {
    if (!userId || !newProblems?.length) return { imported: 0, skipped: 0 }
    const existingTitles = new Set(problems.map(p => p.title?.toLowerCase()))
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
      added_at: p.added_at || new Date().toISOString(),
    }))
    const { data, error } = await supabase.from('problems').insert(rows).select()
    if (!error) {
      setProblems(prev => [...(data || []), ...prev])
    }
    return { imported: data?.length || 0, skipped, error }
  }

  const dueProblems = problems.filter(p => isDue(p.next_review))
  const overdueProblems = problems.filter(p => p.next_review < today())

  return {
    problems,
    loading,
    dueProblems,
    overdueProblems,
    addProblem,
    reviewProblem,
    updateNotes,
    deleteProblem,
    importProblems,
    refetch: fetchProblems,
  }
}
