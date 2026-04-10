/**
 * Warif API Service
 * Handles all communication with the Warif backend.
 *
 * Set VITE_API_URL in your .env file:
 *   VITE_API_URL=https://warif-backend.onrender.com   ← production
 *   VITE_API_URL=http://localhost:8010                ← local dev
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8010'

// ─── Auth token helpers ────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('warif_token')
}

function setToken(token) {
  localStorage.setItem('warif_token', token)
}

function clearToken() {
  localStorage.removeItem('warif_token')
}

// ─── Base fetch wrapper ────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw new Error('SESSION_EXPIRED')
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }

  return res.json()
}

// ─── Health ────────────────────────────────────────────────────────────────

/**
 * Check if the backend is reachable.
 * Returns true/false — safe to call without a token.
 */
export async function checkHealth() {
  try {
    const data = await request('/health')
    return data?.status === 'healthy'
  } catch {
    return false
  }
}

// ─── Authentication ────────────────────────────────────────────────────────

/**
 * Login and store the JWT token.
 * @param {string} username
 * @param {string} password
 * @returns {{ access_token: string, token_type: string }}
 */
export async function login(username, password) {
  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (data.access_token) setToken(data.access_token)
  return data
}

export function logout() {
  clearToken()
}

// ─── Sensor data ───────────────────────────────────────────────────────────

/**
 * Get the latest reading for each sensor type.
 * Returns an object shaped for the dashboard components:
 * {
 *   temperature:    { value: number, unit: '°C', status: 'normal'|'warning'|'critical' },
 *   humidity:       { value: number, unit: '%',  status: ... },
 *   soil_moisture:  { value: number, unit: '%',  status: ... },
 *   ...
 * }
 */
export async function getCurrentReadings() {
  const raw = await request('/api/v1/sensor-data?limit=50')
  return normalizeReadings(raw)
}

/**
 * Get historical readings for a specific sensor type (for charts).
 * Returns: [{ day: number, value: number }]
 *
 * @param {'temperature'|'humidity'|'soil_moisture'|'light'|'co2'} sensorType
 * @param {number} days  How many days of history to fetch
 */
export async function getSensorHistory(sensorType, days = 30) {
  const raw = await request(
    `/api/v1/sensor-data?sensor_type=${sensorType}&limit=${days * 24}`
  )
  return aggregateDailyHistory(raw, sensorType)
}

// ─── Alerts ────────────────────────────────────────────────────────────────

/**
 * Get active alerts.
 * Returns: [{ id, sensor_type, message, severity, created_at }]
 */
export async function getAlerts() {
  return request('/api/v1/alerts?status=active')
}

/**
 * Acknowledge an alert by ID.
 */
export async function acknowledgeAlert(alertId) {
  return request(`/api/v1/alerts/${alertId}/acknowledge`, { method: 'POST' })
}

// ─── Analytics ─────────────────────────────────────────────────────────────

/**
 * Get a summary of current farm conditions.
 */
export async function getAnalyticsSummary() {
  return request('/api/v1/analytics/summary')
}

// ─── Irrigation control ────────────────────────────────────────────────────

/**
 * Send an irrigation command to a device.
 * @param {string} deviceId
 * @param {'start'|'stop'|'set_schedule'} action
 * @param {object} params  Extra params (e.g. { duration_minutes: 20 })
 */
export async function sendIrrigationCommand(deviceId, action, params = {}) {
  return request('/api/v1/commands', {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId, command: action, params }),
  })
}

// ─── Data normalizers (internal) ───────────────────────────────────────────

function normalizeReadings(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) return null

  const latest = {}
  for (const reading of rawList) {
    const type = reading.sensor_type
    if (!latest[type]) {
      latest[type] = reading
    }
  }

  const statusFor = (type, value) => {
    const thresholds = {
      temperature:   { warn: 35, critical: 40 },
      humidity:      { warn: 85, critical: 95 },
      soil_moisture: { warn: 20, critical: 10 },
      light:         { warn: 1800, critical: 2000 },
      co2:           { warn: 1500, critical: 2000 },
    }
    const t = thresholds[type]
    if (!t) return 'normal'
    if (value >= t.critical) return 'critical'
    if (value >= t.warn) return 'warning'
    return 'normal'
  }

  const result = {}
  for (const [type, reading] of Object.entries(latest)) {
    result[type] = {
      value: reading.value,
      unit: reading.unit || '',
      status: statusFor(type, reading.value),
      timestamp: reading.timestamp,
    }
  }
  return result
}

function aggregateDailyHistory(rawList, sensorType) {
  if (!Array.isArray(rawList) || rawList.length === 0) return []

  const byDay = {}
  for (const r of rawList) {
    if (r.sensor_type !== sensorType) continue
    const day = new Date(r.timestamp).getDate()
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(r.value)
  }

  return Object.entries(byDay)
    .map(([day, values]) => ({
      day: Number(day),
      value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => a.day - b.day)
}
