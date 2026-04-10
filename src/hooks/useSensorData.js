/**
 * useSensorData — React hook for live sensor data from the Warif backend.
 *
 * Usage in any component:
 *   const { readings, alerts, isLive, loading, error } = useSensorData()
 *
 * - `isLive`   → true when real backend data is being received
 * - `readings` → null until first successful fetch
 * - `alerts`   → [] until backend responds
 *
 * The hook polls every `interval` ms (default 30s) so the dashboard
 * stays up to date without a full page refresh.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  checkHealth,
  getCurrentReadings,
  getAlerts,
  getSensorHistory,
} from '../services/api'

export function useSensorData(interval = 30_000) {
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [readings, setReadings] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [history, setHistory] = useState({})   // { temperature: [...], humidity: [...], ... }

  const fetchAll = useCallback(async () => {
    try {
      const healthy = await checkHealth()
      if (!healthy) {
        setIsLive(false)
        setLoading(false)
        return
      }

      const [newReadings, newAlerts] = await Promise.all([
        getCurrentReadings(),
        getAlerts(),
      ])

      setReadings(newReadings)
      setAlerts(newAlerts ?? [])
      setIsLive(true)
      setError(null)
    } catch (err) {
      setError(err.message)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch history for a given sensor type on demand
  const fetchHistory = useCallback(async (sensorType, days = 30) => {
    try {
      const data = await getSensorHistory(sensorType, days)
      setHistory(prev => ({ ...prev, [sensorType]: data }))
      return data
    } catch {
      return []
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchAll()
    const timer = setInterval(fetchAll, interval)
    return () => clearInterval(timer)
  }, [fetchAll, interval])

  return {
    readings,      // { temperature: { value, unit, status }, ... }
    alerts,        // [{ id, sensor_type, message, severity, created_at }]
    history,       // { temperature: [{ day, value }], ... }
    fetchHistory,  // call with ('temperature', 30) to load chart data
    isLive,        // true = real data from backend
    loading,       // true on first load
    error,         // string or null
    refresh: fetchAll,
  }
}

/**
 * useAlerts — lightweight hook for alerts only.
 * Use this in components that only need to show alert count/list.
 */
export function useAlerts(interval = 60_000) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAlerts()
        setAlerts(data ?? [])
      } catch {
        // silently fail — alerts are non-critical UI
      } finally {
        setLoading(false)
      }
    }
    fetch()
    const timer = setInterval(fetch, interval)
    return () => clearInterval(timer)
  }, [interval])

  return { alerts, loading }
}
