import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function useAssignments(userId, isProfessor) {
  const [myAssignments, setMyAssignments] = useState([])       // student view
  const [allAssignments, setAllAssignments] = useState([])     // professor view
  const [loading, setLoading] = useState(true)

  // ── Student: my assigned problems + my completion status ──
  const fetchMyAssignments = useCallback(async () => {
    if (!userId) return []
    setLoading(true)
    const { data, error } = await supabase
      .from('assignment_progress')
      .select('*, assignments(*)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setMyAssignments(data || [])
    setLoading(false)
    return data || []
  }, [userId])

  // ── Professor: every assignment + roll-up of completion counts ──
  const fetchAllAssignments = useCallback(async () => {
    if (!isProfessor) return []
    setLoading(true)
    const { data, error } = await supabase
      .from('assignments')
      .select('*, assignment_progress(*)')
      .order('created_at', { ascending: false })
    if (error) {
      setLoading(false)
      return []
    }
    // assignment_progress.student_id has no direct FK to profiles, so
    // fetch display names separately and merge them in.
    const studentIds = Array.from(new Set(
      (data || []).flatMap(a => (a.assignment_progress || []).map(p => p.student_id))
    ))
    let namesById = {}
    if (studentIds.length) {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', studentIds)
      namesById = Object.fromEntries((profileRows || []).map(p => [p.user_id, p.display_name]))
    }
    const enriched = (data || []).map(a => ({
      ...a,
      assignment_progress: (a.assignment_progress || []).map(p => ({
        ...p,
        student_name: namesById[p.student_id] || 'Unknown',
      })),
    }))
    setAllAssignments(enriched)
    setLoading(false)
    return enriched
  }, [isProfessor])

  useEffect(() => {
    if (isProfessor) fetchAllAssignments()
    else fetchMyAssignments()
  }, [isProfessor, fetchMyAssignments, fetchAllAssignments])

  // ── Professor: create a new assignment (fans out to matching students via DB trigger) ──
  const createAssignment = async ({ title, url, topics, difficulty, notes, targetEmails, createdByEmail }) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert([{
        title: title.trim(),
        url: url?.trim() || null,
        topics: topics || [],
        difficulty: difficulty || 'medium',
        notes: notes?.trim() || null,
        target_emails: targetEmails || null,
        created_by: createdByEmail,
      }])
      .select()
      .single()
    if (!error) await fetchAllAssignments()
    return { data, error }
  }

  // ── Student: mark an assignment complete, linking to the problem row they just logged ──
  const completeAssignment = async (assignmentProgressId, problemId) => {
    const { data, error } = await supabase
      .from('assignment_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        problem_id: problemId || null,
      })
      .eq('id', assignmentProgressId)
      .select()
      .single()
    if (!error) {
      setMyAssignments(prev => prev.map(a => a.id === assignmentProgressId ? data : a))
    }
    return { data, error }
  }

  const pendingCount = myAssignments.filter(a => a.status === 'pending').length

  return {
    myAssignments,
    allAssignments,
    pendingCount,
    loading,
    createAssignment,
    completeAssignment,
    refetchMine: fetchMyAssignments,
    refetchAll: fetchAllAssignments,
  }
}
