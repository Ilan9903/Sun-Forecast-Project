import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  geocodeCity,
  getBrowserPosition,
  getWeatherTileTemplateUrl,
  hasOpenWeatherApiKey,
} from '@/services/openWeather'

const TILE_LAYERS = {
  rain: { key: 'precipitation_new', label: 'Pluie' },
  temp: { key: 'temp_new', label: 'Température' },
  wind: { key: 'wind_new', label: 'Vent' },
}

const DEFAULT_COORDS = { lat: 45.7578, lon: 4.832 }

const markerIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function RecenterMap({ center, zoom }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])

  return null
}

export default function MapsPage() {
  const [query, setQuery] = useState('')
  const [zoom, setZoom] = useState(6)
  const [coords, setCoords] = useState(DEFAULT_COORDS)
  const [locationLabel, setLocationLabel] = useState('Lyon, FR')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeLayer, setActiveLayer] = useState('rain')
  const hasApiKey = hasOpenWeatherApiKey()

  const activeLayerConfig = useMemo(() => TILE_LAYERS[activeLayer], [activeLayer])
  const weatherLayerUrl = useMemo(() => {
    if (!hasApiKey) {
      return ''
    }

    return getWeatherTileTemplateUrl(activeLayerConfig.key)
  }, [activeLayerConfig, hasApiKey])

  async function handleSearch(event) {
    event.preventDefault()

    if (!query.trim()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const city = await geocodeCity(query.trim())
      const country = city.country ? `, ${city.country}` : ''
      setCoords({ lat: city.lat, lon: city.lon })
      setZoom(9)
      setLocationLabel(`${city.name}${country}`)
    } catch (searchError) {
      setError(searchError.message || 'Impossible de trouver la ville')
    } finally {
      setLoading(false)
    }
  }

  async function handleMyPosition() {
    setError('')

    try {
      const position = await getBrowserPosition()
      setCoords({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
      setZoom(9)
      setLocationLabel('Ma position')
    } catch {
      setError('Impossible de récupérer la position actuelle.')
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const position = await getBrowserPosition()
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setZoom(9)
        setLocationLabel('Ma position')
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </Button>
        <Button type="button" variant="outline" onClick={handleMyPosition}>
          Ma position
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <label htmlFor="zoom" className="text-sm font-medium">
          Zoom
        </label>
        <input
          id="zoom"
          type="range"
          min="3"
          max="10"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <span className="text-sm">{zoom}</span>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {!hasApiKey && (
        <p className="text-red-500">
          Clé API manquante: ajoute VITE_OPENWEATHER_API_KEY dans .env puis redémarre l'app.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{locationLabel}</CardTitle>
          <CardDescription>
            Coordonnées: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
            <TabsList>
              <TabsTrigger value="rain">Pluie</TabsTrigger>
              <TabsTrigger value="temp">Température</TabsTrigger>
              <TabsTrigger value="wind">Vent</TabsTrigger>
            </TabsList>
          </Tabs>

          <p className="mt-4 text-sm text-muted-foreground">
            Couche active: {activeLayerConfig.label}
          </p>

          <div className="mt-3 h-115 overflow-hidden rounded-lg border">
            <MapContainer center={[coords.lat, coords.lon]} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
              <RecenterMap center={[coords.lat, coords.lon]} zoom={zoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hasApiKey && <TileLayer url={weatherLayerUrl} opacity={0.75} />}
              <Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
                <Popup>
                  {locationLabel} <br /> {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
