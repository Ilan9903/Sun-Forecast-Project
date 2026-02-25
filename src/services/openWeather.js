const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim() || ''

const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_TILE_BASE_URL = 'https://tile.openweathermap.org/map'

function requireApiKey() {
  if (!OPEN_WEATHER_API_KEY) {
    throw new Error('Clé API OpenWeather manquante. Ajoute VITE_OPENWEATHER_API_KEY dans .env')
  }

  return OPEN_WEATHER_API_KEY
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erreur API OpenWeather (${response.status})`)
  }

  return response.json()
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export async function getForecastByCoords(lat, lon) {
  const apiKey = requireApiKey()
  const url = new URL(FORECAST_BASE_URL)
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  url.searchParams.set('lang', 'fr')
  url.searchParams.set('units', 'metric')
  url.searchParams.set('appid', apiKey)

  return fetchJson(url)
}

export async function geocodeCity(cityName) {
  const apiKey = requireApiKey()
  const url = new URL(GEO_BASE_URL)
  url.searchParams.set('q', cityName)
  url.searchParams.set('limit', '1')
  url.searchParams.set('appid', apiKey)

  const results = await fetchJson(url)

  if (!results.length) {
    throw new Error('Ville introuvable')
  }

  return results[0]
}

export function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n’est pas supportée sur ce navigateur.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

export function latLonToTile(lat, lon, zoom) {
  const normalizedZoom = Number(zoom)
  const zoomFactor = 2 ** normalizedZoom
  const latitude = Math.min(85.05112878, Math.max(-85.05112878, Number(lat)))
  const longitude = Number(lon)
  const latRad = (latitude * Math.PI) / 180

  const x = Math.floor(((longitude + 180) / 360) * zoomFactor)
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * zoomFactor
  )

  return { x, y, z: normalizedZoom }
}

export function getWeatherTileUrl(layer, z, x, y) {
  const apiKey = requireApiKey()
  return `${WEATHER_TILE_BASE_URL}/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`
}

export function getWeatherTileTemplateUrl(layer) {
  const apiKey = requireApiKey()
  return `${WEATHER_TILE_BASE_URL}/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`
}

export function hasOpenWeatherApiKey() {
  return Boolean(OPEN_WEATHER_API_KEY)
}
