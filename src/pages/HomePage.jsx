import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  geocodeCity,
  getBrowserPosition,
  getForecastByCoords,
  getWeatherIconUrl,
} from '@/services/openWeather'

function getCurrentWeather(forecast) {
  return forecast?.list?.[0] ?? null
}

function getDailyForecasts(forecast) {
  if (!forecast?.list?.length) {
    return []
  }

  const groupedByDay = forecast.list.reduce((accumulator, item) => {
    const dayKey = new Date(item.dt * 1000).toISOString().split('T')[0]

    if (!accumulator[dayKey]) {
      accumulator[dayKey] = []
    }

    accumulator[dayKey].push(item)
    return accumulator
  }, {})

  return Object.entries(groupedByDay)
    .slice(0, 5)
    .map(([dayKey, entries]) => {
      const minTemp = Math.min(...entries.map((entry) => entry.main.temp_min))
      const maxTemp = Math.max(...entries.map((entry) => entry.main.temp_max))
      const mainEntry = entries.find((entry) => entry.dt_txt.includes('12:00:00')) || entries[0]

      return {
        dayKey,
        label: new Date(`${dayKey}T00:00:00`).toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        minTemp,
        maxTemp,
        icon: mainEntry.weather[0].icon,
        description: mainEntry.weather[0].description,
        entries,
      }
    })
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [cityLabel, setCityLabel] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDayKey, setSelectedDayKey] = useState('')

  const currentWeather = useMemo(() => getCurrentWeather(forecast), [forecast])
  const dailyForecasts = useMemo(() => getDailyForecasts(forecast), [forecast])
  const selectedDayForecast = useMemo(() => {
    if (!dailyForecasts.length) {
      return null
    }

    const foundDay = dailyForecasts.find((day) => day.dayKey === selectedDayKey)
    return foundDay || dailyForecasts[0]
  }, [dailyForecasts, selectedDayKey])

  async function loadForecastByCoords(lat, lon, label) {
    setLoading(true)
    setError('')

    try {
      const data = await getForecastByCoords(lat, lon)
      setForecast(data)
      setCityLabel(label || data.city?.name || 'Position actuelle')
      const firstDayKey = data?.list?.[0]
        ? new Date(data.list[0].dt * 1000).toISOString().split('T')[0]
        : ''
      setSelectedDayKey(firstDayKey)
    } catch (fetchError) {
      setError(fetchError.message || 'Impossible de récupérer la météo')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(event) {
    event.preventDefault()

    if (!query.trim()) {
      return
    }

    try {
      const city = await geocodeCity(query.trim())
      const country = city.country ? `, ${city.country}` : ''
      await loadForecastByCoords(city.lat, city.lon, `${city.name}${country}`)
    } catch (searchError) {
      setError(searchError.message || 'Impossible de trouver la ville')
    }
  }

  async function handleMyPosition() {
    setError('')

    try {
      const position = await getBrowserPosition()
      await loadForecastByCoords(
        position.coords.latitude,
        position.coords.longitude,
        'Ma position'
      )
    } catch {
      setError('Impossible de récupérer la position actuelle.')
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const position = await getBrowserPosition()
        await loadForecastByCoords(
          position.coords.latitude,
          position.coords.longitude,
          'Ma position'
        )
      } catch {
        setError('Impossible de récupérer la position actuelle.')
      }
    })()
  }, [])

  return (
    <main className="space-y-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une ville"
          className="h-10 flex-1 rounded-md border px-3"
        />
        <Button type="submit" className="hover:cursor-pointer">Rechercher</Button>
        <Button type="button" variant="outline" onClick={handleMyPosition} className="hover:cursor-pointer">
          Ma position
        </Button>
      </form>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle>{cityLabel || 'Prévisions météo'}</CardTitle>
            <CardDescription>
              {new Date(currentWeather.dt_txt).toLocaleString('fr-FR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <img
              src={getWeatherIconUrl(currentWeather.weather[0].icon)}
              alt={currentWeather.weather[0].description}
              className="h-14 w-14"
            />
            <div>
              <p className="text-3xl font-bold">{Math.round(currentWeather.main.temp)}°C</p>
              <p className="capitalize text-muted-foreground">
                {currentWeather.weather[0].description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {dailyForecasts.length > 0 && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Prévisions 5 jours</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {dailyForecasts.map((day) => (
              <button
                type="button"
                key={day.dayKey}
                onClick={() => setSelectedDayKey(day.dayKey)}
                className={`rounded-md border p-3 text-center hover:cursor-pointer transition ${
                  selectedDayForecast?.dayKey === day.dayKey
                    ? 'border-slate-900 bg-slate-100'
                    : 'hover:bg-slate-50'
                }`}
              >
                <p className="mb-2 text-sm font-medium capitalize">{day.label}</p>
                <img
                  src={getWeatherIconUrl(day.icon)}
                  alt={day.description}
                  className="mx-auto h-10 w-10"
                />
                <p className="mt-2 text-sm capitalize text-muted-foreground">{day.description}</p>
                <p className="mt-1 font-semibold">
                  {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                </p>
              </button>
            ))}
          </CardContent>

          {selectedDayForecast && (
            <CardContent className="pt-0">
              <div className="rounded-md border p-4">
                <p className="mb-3 text-sm font-semibold capitalize">
                  Heures disponibles - {selectedDayForecast.label}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {selectedDayForecast.entries.map((entry) => (
                    <div key={entry.dt} className="rounded-md border p-2 text-sm">
                      <p className="font-medium">
                        {new Date(entry.dt * 1000).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="capitalize text-muted-foreground">{entry.weather[0].description}</p>
                      <p className="font-semibold">{Math.round(entry.main.temp)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </main>
  )
}
