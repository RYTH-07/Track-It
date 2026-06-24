import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { today, getLast90Days } from '../lib/helpers.js'

export function useActivityLog(userId) {
  const [activityMap, setActivityMap] = useState({}) // { 'YYYY-MM-DD': count }
  const [loading, setLoading] = useState(false)

  const fetchActivity = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const ninetyDaysAgo = getLast90Days()[0]
    const { data, error } = await supabase
      .from('activity_log')
      .select('log_date, review_count')
      .eq('user_id', userId)
      .gte('log_date', ninetyDaysAgo)
    if (!error) {
      const map = {}
      for (const row of data || []) {
        map[row.log_date] = row.review_count
      }
      setActivityMap(map)
    }
    setLoading(false)
  }, [userId])

  /** Increment today's activity count by 1 */
  const logReview = useCallback(async () => {
    if (!userId) return
    const t = today()
    const current = activityMap[t] || 0
    const newCount = current + 1
    // Upsert: insert or update
    await supabase
      .from('activity_log')
      .upsert(
        [{ user_id: userId, log_date: t, review_count: newCount }],
        { onConflict: 'user_id,log_date' }
      )
    setActivityMap(prev => ({ ...prev, [t]: newCount }))
  }, [userId, activityMap])

  return { activityMap, loading, fetchActivity, logReview }
}
