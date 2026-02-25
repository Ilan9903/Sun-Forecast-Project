import { useEffect, useMemo, useState } from 'react'
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { MapPinned, Search } from 'lucide-react'
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
	const activeLayerConfig = useMemo(() => TILE_LAYERS[activeLayer], [activeLayer])
	const weatherLayerUrl = useMemo(
		() => getWeatherTileTemplateUrl(activeLayerConfig.key),
		[activeLayerConfig]
	)

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

	useEffect(() => {
		let isMounted = true

		async function loadGeoLocation() {
			try {
				const position = await getBrowserPosition()

				if (!isMounted) {
					return
				}

				setCoords({
					lat: position.coords.latitude,
					lon: position.coords.longitude,
				})
				setLocationLabel('Position actuelle')
			} catch {
				if (!isMounted) {
					return
				}

				setError('Géolocalisation non disponible. Utilise la recherche de ville.')
			}
		}

		loadGeoLocation()

		return () => {
			isMounted = false
		}
	}, [])

	return (
		<motion.main
			className="space-y-4 text-primary-foreground"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs text-primary-foreground/70">/maps</p>
					<h1 className="text-2xl font-semibold">Cartes météo</h1>
				</div>
				<p className="text-xs text-primary-foreground/80">Pluie • Température • Vent</p>
			</div>

			<form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
				<div className="relative flex-1">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/70" />
					<input
						type="text"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Lyon"
						className="h-10 w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/15 pl-9 pr-3 text-primary-foreground placeholder:text-primary-foreground/70"
					/>
				</div>
				<Button
					type="submit"
					disabled={loading}
					className="h-10 bg-background text-foreground hover:bg-background/90"
				>
					{loading ? 'Recherche...' : 'Rechercher'}
				</Button>
				<Button
					type="button"
					onClick={() => {
						setError('')
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
					}}
					className="h-10 bg-background text-foreground hover:bg-background/90"
				>
					<MapPinned className="mr-1 h-4 w-4" /> Ma position
				</Button>
			</form>

			<div className="flex items-center gap-3 text-primary-foreground/90">
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

			{error && <p className="text-sm text-red-200">{error}</p>}

			<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
				<CardHeader>
					<CardTitle>{locationLabel}</CardTitle>
					<CardDescription>
						Coordonnées: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
						<TabsList className="bg-primary-foreground/10">
							<TabsTrigger value="rain">Pluie</TabsTrigger>
							<TabsTrigger value="temp">Température</TabsTrigger>
							<TabsTrigger value="wind">Vent</TabsTrigger>
						</TabsList>
					</Tabs>

					<p className="mt-4 text-sm text-primary-foreground/85">
						Couche active: {activeLayerConfig.label} (aujourd’hui)
					</p>

					<div className="relative mt-3 h-[460px] overflow-hidden rounded-xl border border-primary-foreground/20 bg-primary-foreground/10">
						<MapContainer
							center={[coords.lat, coords.lon]}
							zoom={zoom}
							scrollWheelZoom={true}
							className="h-full w-full"
						>
							<RecenterMap center={[coords.lat, coords.lon]} zoom={zoom} />
							<TileLayer
								attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
								url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
							/>
							<TileLayer url={weatherLayerUrl} opacity={0.75} />
							<Marker position={[coords.lat, coords.lon]} icon={markerIcon}>
								<Popup>
									{locationLabel} <br /> {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
								</Popup>
							</Marker>
						</MapContainer>

						<div className="pointer-events-none absolute right-4 top-4 rounded-lg bg-primary-foreground/90 p-3 text-primary">
							<p className="text-xs text-primary/70">Couche</p>
							<p className="text-sm font-semibold">{activeLayerConfig.key}</p>
						</div>
					</div>

					<p className="mt-3 text-xs text-primary-foreground/75">
						Tape une ville puis valide: la carte se recentre automatiquement dessus.
					</p>
				</CardContent>
			</Card>
		</motion.main>
	)
}
