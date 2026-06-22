import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function useNotebooks(userId) {
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotebooks = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('notebooks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (!error) setNotebooks(data || [])
    setLoading(false)
    return data || []
  }, [userId])

  useEffect(() => {
    fetchNotebooks()
  }, [fetchNotebooks])

  const upsertNotebook = useCallback(async (topicName, theory) => {
    if (!userId) return { error: { message: 'Not authenticated' } }
    const existing = notebooks.find(n => n.topic_name === topicName)
    if (existing) {
      const { data, error } = await supabase
        .from('notebooks')
        .update({ theory, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
      if (!error) setNotebooks(prev => prev.map(n => n.id === existing.id ? data : n))
      return { data, error, isNew: false }
    } else {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([{
          user_id: userId,
          topic_name: topicName,
          theory: theory || '',
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()
      if (!error) setNotebooks(prev => [data, ...prev])
      return { data, error, isNew: true }
    }
  }, [userId, notebooks])

  const deleteNotebook = useCallback(async (notebookId) => {
    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', notebookId)
    if (!error) setNotebooks(prev => prev.filter(n => n.id !== notebookId))
    return { error }
  }, [])

  return { notebooks, loading, upsertNotebook, deleteNotebook, refetch: fetchNotebooks }
}
