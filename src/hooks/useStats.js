import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { today, getWeekStart, computeStreakWithFreeze, computeEarnedFreezes, getRankFromXP, checkNewAchievements, MAX_STREAK_FREEZES } from '../lib/helpers.js'
import { DEFAULT_WEEKLY_GOAL, ACHIEVEMENTS } from '../lib/constants.js'
import toast from 'react-hot-toast'

export function useStats(userId, problems, notebooks) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!userId) return
    // NOTE: .single() throws PGRST116 for BOTH zero rows AND multiple rows.
    // We deliberately avoid it everywhere in this file — if duplicate rows
    // exist for this user, treating that as "row doesn't exist" would insert
    // yet another duplicate on every login. Instead we always fetch/update
    // by user_id (the one column we know exists) and take the first row
    // back, ordered by xp so the "most real" duplicate wins until Sishir's
    // migration removes the duplicates and adds a unique constraint.
    const { data: rows, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .order('xp', { ascending: false })

    if (error) { setLoading(false); return }

    if (rows && rows.length > 0) {
      const primary = rows[0]
      const currentWeekStart = getWeekStart(today())
      if (primary.week_start !== currentWeekStart) {
        const { data: updated, error: updateError } = await supabase
          .from('user_stats')
          .update({ week_count: 0, week_start: currentWeekStart })
          .eq('user_id', userId)
          .select()
        if (!updateError && updated?.length) { setStats(updated[0]); setLoading(false); return }
      }
      setStats(primary)
    } else {
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
        streak_freezes: 0,
      }
      // upsert (not insert) so a concurrent duplicate-creating race is a
      // no-op instead of a second row, once user_id has a unique constraint.
      const { data: created, error: upsertError } = await supabase
        .from('user_stats')
        .upsert([newRow], { onConflict: 'user_id', ignoreDuplicates: false })
        .select()
      if (created?.length) setStats(created[0])
      else if (upsertError) console.error('[useStats] fetchStats upsert failed:', upsertError)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const awardXP = useCallback(async (xpAmount) => {
    if (!userId || !stats) return
    const t = today()
    const freezesHeld = stats.streak_freezes || 0
    const { streak: newStreak, freezeUsed } = computeStreakWithFreeze(stats.last_review_date, stats.streak, freezesHeld)
    const newXP = (stats.xp || 0) + xpAmount
    const newWeekCount = (stats.week_count || 0) + 1
    const newLongest = Math.max(stats.longest_streak || 0, newStreak)
    const remainingFreezes = freezeUsed ? freezesHeld - 1 : freezesHeld

    if (freezeUsed) {
      toast('❄️ Streak freeze used — your streak is safe!', { duration: 4000 })
    }

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
      streak_freezes: remainingFreezes,
    }

    const newlyUnlocked = checkNewAchievements({
      unlockedIds: stats.unlocked_achievements || [],
      stats: updatedStats,
      problems: problems || [],
      notebooks: notebooks || [],
    })

    if (newlyUnlocked.length > 0) {
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
        // xp intentionally omitted — SQL trigger award_xp_on_rating owns this field
        streak: updatedStats.streak,
        longest_streak: updatedStats.longest_streak,
        last_review_date: updatedStats.last_review_date,
        week_count: updatedStats.week_count,
        unlocked_achievements: updatedStats.unlocked_achievements,
        streak_freezes: updatedStats.streak_freezes,
      })
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('[useStats] awardXP update failed:', error)
      return { data: null, error }
    }

    // data[0].xp reflects the SQL trigger's real award — use it (not our
    // locally-guessed newXP) to decide whether a streak freeze was earned.
    const confirmedXP = data?.[0]?.xp ?? updatedStats.xp
    const earned = computeEarnedFreezes(stats.xp || 0, confirmedXP, remainingFreezes)
    let finalFreezes = remainingFreezes

    if (earned > 0) {
      finalFreezes = remainingFreezes + earned
      const { data: freezeData, error: freezeError } = await supabase
        .from('user_stats')
        .update({ streak_freezes: finalFreezes })
        .eq('user_id', userId)
        .select()
      if (freezeError) {
        console.error('[useStats] streak freeze grant failed:', freezeError)
        finalFreezes = remainingFreezes // DB write failed, don't claim we have it
      } else {
        toast(`❄️ Earned a streak freeze! (${finalFreezes}/${MAX_STREAK_FREEZES} held)`, { duration: 4000 })
      }
    }

    setStats({ ...updatedStats, xp: confirmedXP, streak_freezes: finalFreezes })
    return { data: data?.[0], error: null }
  }, [userId, stats, problems, notebooks])

  const updateWeeklyGoal = useCallback(async (goal) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_stats')
      .update({ weekly_goal: goal })
      .eq('user_id', userId)
      .select()
    if (!error && data?.length) setStats(data[0])
    else if (error) console.error('[useStats] updateWeeklyGoal failed:', error)
    return { data: data?.[0], error }
  }, [userId])

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
    const { data, error } = await supabase
      .from('user_stats')
      .update({ unlocked_achievements: allUnlocked })
      .eq('user_id', userId)
      .select()
    if (data?.length) setStats(data[0])
    else if (error) console.error('[useStats] recheckAchievements failed:', error)
  }, [userId, stats, problems, notebooks])

  return { stats, loading, awardXP, updateWeeklyGoal, recheckAchievements, refetch: fetchStats }
}
