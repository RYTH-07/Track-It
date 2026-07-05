import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { today, getWeekStart, computeNewStreak, getRankFromXP, checkNewAchievements } from '../lib/helpers.js'
import { DEFAULT_WEEKLY_GOAL, ACHIEVEMENTS } from '../lib/constants.js'
import toast from 'react-hot-toast'

export function useStats(userId, problems, notebooks) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (!error && data) {
      // Check if week_start is stale (not current Monday) — reset week_count
      const currentWeekStart = getWeekStart(today())
      if (data.week_start !== currentWeekStart) {
        const updated = await supabase
          .from('user_stats')
          .update({ week_count: 0, week_start: currentWeekStart })
          .eq('user_id', userId)
          .select()
          .single()
        if (!updated.error) { setStats(updated.data); setLoading(false); return }
      }
      setStats(data)
    } else if (error?.code === 'PGRST116') {
      // Row doesn't exist yet — create it
      const newRow = {
        user_id: userId,
        xp: 0,
        streak: 0,
        longest_streak: 0,
        last_review_date: null,
        weekly_goal: DEFAULT_WEEKLY_GOAL,
        week_start: getWeekStart(today()),
        week_count: 0,
        unlocked_achievements: [],
      }
      const { data: created } = await supabase.from('user_stats').insert([newRow]).select().single()
      if (created) setStats(created)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /** Award XP from a review/log action. Also updates streak, week_count, achievements. */
  const awardXP = useCallback(async (xpAmount) => {
    if (!userId || !stats) return
    const t = today()
    const newStreak = computeNewStreak(stats.last_review_date, stats.streak)
    const newXP = (stats.xp || 0) + xpAmount
    const newWeekCount = (stats.week_count || 0) + 1
    const newLongest = Math.max(stats.longest_streak || 0, newStreak)
    const totalReviews = (stats.total_reviews || 0) + 1

    // Check rank change
    const prevRank = getRankFromXP(stats.xp || 0)
    const newRank = getRankFromXP(newXP)
    if (newRank.name !== prevRank.name) {
      toast(`${newRank.emoji} Rank up! You are now ${newRank.name}!`, { icon: '🎉', duration: 4000 })
    }

    const updatedStats = {
      ...stats,
      xp: newXP,
      streak: newStreak,
      longest_streak: newLongest,
      last_review_date: t,
      week_count: newWeekCount,
      total_reviews: totalReviews,
    }

    // Check achievements
    console.log("Problems:", problems.length);
    console.log("Unlocked:", stats.unlocked_achievements);
    const newlyUnlocked = checkNewAchievements({
      unlockedIds: stats.unlocked_achievements || [],
      stats: updatedStats,
      problems: problems || [],
      notebooks: notebooks || [],
    })

    if (newlyUnlocked.length > 0) {
      console.log("New achievements:", newlyUnlocked);
      const allUnlocked = [...(stats.unlocked_achievements || []), ...newlyUnlocked]
      updatedStats.unlocked_achievements = allUnlocked
      newlyUnlocked.forEach(id => {
        const ach = ACHIEVEMENTS.find(a => a.id === id)
        if (ach) toast(`${ach.emoji} Achievement unlocked: ${ach.name}!`, { duration: 4000 })
      })
    }

    const { data, error } = await supabase
      .from('user_stats')
      .update({
        xp: updatedStats.xp,
        streak: updatedStats.streak,
        longest_streak: updatedStats.longest_streak,
        last_review_date: updatedStats.last_review_date,
        week_count: updatedStats.week_count,
        total_reviews: updatedStats.total_reviews,
        unlocked_achievements: updatedStats.unlocked_achievements,
      })
      .eq('user_id', userId)
      .select()
      .single()
      console.log("Supabase update error:", error);
      console.log("Supabase update data:", data);

    if (!error) setStats(data)
    return { data, error }
  }, [userId, stats, problems, notebooks])

  const updateWeeklyGoal = useCallback(async (goal) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_stats')
      .update({ weekly_goal: goal })
      .eq('user_id', userId)
      .select()
      .single()
    if (!error) setStats(data)
    return { data, error }
  }, [userId])

  /** Call after adding a notebook to re-check scholar/librarian achievements */
  const recheckAchievements = useCallback(async () => {
    if (!userId || !stats) return
    const newlyUnlocked = checkNewAchievements({
      unlockedIds: stats.unlocked_achievements || [],
      stats,
      problems: problems || [],
      notebooks: notebooks || [],
    })
    if (!newlyUnlocked.length) return
    const allUnlocked = [...(stats.unlocked_achievements || []), ...newlyUnlocked]
    newlyUnlocked.forEach(id => {
      const ach = ACHIEVEMENTS.find(a => a.id === id)
      if (ach) toast(`${ach.emoji} Achievement unlocked: ${ach.name}!`, { duration: 4000 })
    })
    const { data } = await supabase
      .from('user_stats')
      .update({ unlocked_achievements: allUnlocked })
      .eq('user_id', userId)
      .select()
      .single()
    if (data) setStats(data)
  }, [userId, stats, problems, notebooks])

  return { stats, loading, awardXP, updateWeeklyGoal, recheckAchievements, refetch: fetchStats }
}
