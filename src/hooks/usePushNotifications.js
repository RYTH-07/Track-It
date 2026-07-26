import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// Web Push requires the VAPID public key as a raw Uint8Array, not the
// base64url string we store it as.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications(userId) {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setSupported(isSupported)
    if (isSupported) setPermission(Notification.permission)
  }, [])

  useEffect(() => {
    if (!supported || !userId) return
    ;(async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js')
        const existing = await reg.pushManager.getSubscription()
        setSubscribed(!!existing)
      } catch (e) {
        console.error('[usePushNotifications] service worker registration failed:', e)
      }
    })()
  }, [supported, userId])

  const enable = useCallback(async () => {
    if (!supported || !userId) return { error: 'Not supported on this device/browser' }
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') {
        setLoading(false)
        return { error: 'Permission not granted' }
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }

      const json = sub.toJSON()
      const { error } = await supabase.from('push_subscriptions').upsert(
        [{
          user_id: userId,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        }],
        { onConflict: 'endpoint' }
      )
      setLoading(false)
      if (error) return { error: error.message }
      setSubscribed(true)
      return { data: true }
    } catch (e) {
      setLoading(false)
      return { error: e.message || 'Failed to enable notifications' }
    }
  }, [supported, userId])

  const disable = useCallback(async () => {
    if (!supported) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } catch (e) {
      console.error('[usePushNotifications] disable failed:', e)
    }
    setLoading(false)
  }, [supported])

  return { supported, permission, subscribed, loading, enable, disable }
}
