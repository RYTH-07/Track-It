// Vercel Serverless Function (Node.js runtime). Triggered once daily by
// the cron schedule in vercel.json. Fetches public solved-count stats from
// LeetCode's unofficial GraphQL endpoint for every user who has linked a
// leetcode_username on their profile, and upserts the results.
//
// NOTE: leetcode.com/graphql is not an official/supported API — it's the
// same endpoint LeetCode's own site uses internally, widely relied on by
// community tools, but it could change or start blocking requests without
// notice. If this job starts failing for everyone at once, that's the
// first thing to check.

import { createClient } from '@supabase/supabase-js'

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql'

const QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchLeetCodeStats(username) {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // A realistic UA header improves reliability against basic bot filtering.
      'User-Agent': 'Mozilla/5.0 (compatible; TrackItBot/1.0)',
      'Referer': `https://leetcode.com/${username}/`,
    },
    body: JSON.stringify({ query: QUERY, variables: { username } }),
  })

  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`)
  const json = await res.json()
  const matchedUser = json?.data?.matchedUser
  if (!matchedUser) throw new Error('User not found on LeetCode')

  const counts = matchedUser.submitStats?.acSubmissionNum || []
  const byDifficulty = Object.fromEntries(counts.map((c) => [c.difficulty, c.count]))

  return {
    total_solved: byDifficulty.All || 0,
    easy_solved: byDifficulty.Easy || 0,
    medium_solved: byDifficulty.Medium || 0,
    hard_solved: byDifficulty.Hard || 0,
  }
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers['authorization']
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing required environment variables' })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: linkedProfiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, leetcode_username')
    .not('leetcode_username', 'is', null)

  if (profileError) return res.status(500).json({ error: profileError.message })

  if (!linkedProfiles || linkedProfiles.length === 0) {
    return res.status(200).json({ updated: 0, failed: 0, message: 'No linked LeetCode usernames yet' })
  }

  let updated = 0
  const failures = []

  for (const profile of linkedProfiles) {
    const username = (profile.leetcode_username || '').trim()
    if (!username) continue

    try {
      const stats = await fetchLeetCodeStats(username)
      const { error: upsertError } = await supabase
        .from('leetcode_stats')
        .upsert(
          [{ user_id: profile.user_id, username, ...stats, updated_at: new Date().toISOString() }],
          { onConflict: 'user_id' }
        )
      if (upsertError) throw upsertError
      updated++
    } catch (err) {
      failures.push({ username, error: err.message })
    }

    // Be a polite citizen of an endpoint we don't officially have permission
    // to hit — small delay between requests instead of firing them all at once.
    await sleep(400)
  }

  return res.status(200).json({ updated, failed: failures.length, failures })
}
