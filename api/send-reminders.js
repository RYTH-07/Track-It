// Vercel Serverless Function (Node.js runtime — required, web-push needs Node crypto).
// Triggered once daily by the cron schedule in vercel.json.

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export default async function handler(req, res) {
  // Guard against anyone else hitting this public URL directly.
  // Vercel automatically sends this header on cron-triggered invocations
  // when CRON_SECRET is set as an environment variable.
  if (process.env.CRON_SECRET) {
    const auth = req.headers['authorization']
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'Missing required environment variables' })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  webpush.setVapidDetails('mailto:noreply@trackit.app', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD', matches helpers.js's today()

  // Who has reviews due/overdue today?
  const { data: dueProblems, error: dueError } = await supabase
    .from('problems')
    .select('user_id')
    .eq('archived', false)
    .lte('next_review', today)

  // Who has a pending assignment?
  const { data: pendingAssignments, error: pendingError } = await supabase
    .from('assignment_progress')
    .select('student_id')
    .eq('status', 'pending')

  if (dueError || pendingError) {
    return res.status(500).json({ error: (dueError || pendingError).message })
  }

  const dueUserIds = new Set((dueProblems || []).map((p) => p.user_id))
  const pendingUserIds = new Set((pendingAssignments || []).map((a) => a.student_id))
  const allUserIds = new Set([...dueUserIds, ...pendingUserIds])

  if (allUserIds.size === 0) {
    return res.status(200).json({ sent: 0, message: 'Nobody has anything due today' })
  }

  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', Array.from(allUserIds))

  if (subError) return res.status(500).json({ error: subError.message })

  let sent = 0
  let cleaned = 0

  for (const sub of subscriptions || []) {
    const hasDue = dueUserIds.has(sub.user_id)
    const hasPending = pendingUserIds.has(sub.user_id)

    let body
    if (hasDue && hasPending) body = "You've got due reviews and a pending assignment waiting."
    else if (hasDue) body = "You've got reviews due today — keep your streak alive!"
    else body = 'Your professor assigned a problem that\'s still pending.'

    const payload = JSON.stringify({
      title: 'Track-It reminder',
      body,
      url: hasPending && !hasDue ? '/assignments' : '/dashboard',
    })

    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    }

    try {
      await webpush.sendNotification(pushSubscription, payload)
      sent++
    } catch (err) {
      // 404/410 means the browser subscription is dead (cleared data, uninstalled, etc.)
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        cleaned++
      } else {
        console.error('[send-reminders] push failed for subscription', sub.id, err.statusCode, err.body)
      }
    }
  }

  return res.status(200).json({ sent, cleaned, totalCandidates: allUserIds.size })
}
