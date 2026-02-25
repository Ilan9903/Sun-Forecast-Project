import { useEffect, useMemo, useState } from 'react'
//eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { Droplets, Gauge, MapPin, Search, Wind } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
		const date = new Date(item.dt * 1000)
		const dayKey = date.toISOString().split('T')[0]

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
			const noonEntry =
				entries.find((entry) => entry.dt_txt.includes('12:00:00')) || entries[0]

			return {
				dayKey,
				label: new Date(`${dayKey}T00:00:00`).toLocaleDateString('fr-FR', {
					weekday: 'short',
					day: 'numeric',
					month: 'short',
				}),
				shortLabel: new Date(`${dayKey}T00:00:00`).toLocaleDateString('fr-FR', {
					weekday: 'short',
				}),
				minTemp,
				maxTemp,
				icon: noonEntry.weather[0].icon,
				description: noonEntry.weather[0].description,
				entries,
			}
		})
}

function getHourlyEntries(forecast) {
	if (!forecast?.list?.length) {
		return []
	}

	return forecast.list.slice(0, 8).map((entry) => ({
		time: new Date(entry.dt * 1000).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit',
		}),
		temp: Math.round(entry.main.temp),
		icon: entry.weather[0].icon,
		description: entry.weather[0].description,
	}))
}

function buildChartPoints(entries) {
	if (!entries?.length) {
		return ''
	}

	const width = 520
	const height = 170
	const padding = 20
	const temperatures = entries.map((entry) => entry.main.temp)
	const minTemp = Math.min(...temperatures)
	const maxTemp = Math.max(...temperatures)
	const temperatureRange = Math.max(1, maxTemp - minTemp)

	return entries
		.map((entry, index) => {
			const x = padding + (index * (width - padding * 2)) / Math.max(1, entries.length - 1)
			const y =
				padding +
				((maxTemp - entry.main.temp) * (height - padding * 2)) / temperatureRange
			return `${x},${y}`
		})
		.join(' ')
}

export default function HomePage() {
	const [query, setQuery] = useState('')
	const [cityLabel, setCityLabel] = useState('')
	const [forecast, setForecast] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [selectedDay, setSelectedDay] = useState('')

	const currentWeather = useMemo(() => getCurrentWeather(forecast), [forecast])
	const dailyForecasts = useMemo(() => getDailyForecasts(forecast), [forecast])
	const hourlyEntries = useMemo(() => getHourlyEntries(forecast), [forecast])
	const selectedDayEntries = useMemo(() => {
		if (!dailyForecasts.length) {
			return []
		}

		const foundDay = dailyForecasts.find((day) => day.dayKey === selectedDay)
		return (foundDay || dailyForecasts[0]).entries
	}, [dailyForecasts, selectedDay])
	const temperatureCurvePoints = useMemo(
		() => buildChartPoints(selectedDayEntries),
		[selectedDayEntries]
	)

	async function loadForecastByCoords(lat, lon, label) {
		setError('')
		setLoading(true)

		try {
			const data = await getForecastByCoords(lat, lon)
			setForecast(data)
			setCityLabel(label || data.city?.name || 'Position actuelle')
			const firstDayKey = data?.list?.[0]
				? new Date(data.list[0].dt * 1000).toISOString().split('T')[0]
				: ''
			setSelectedDay(firstDayKey)
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
			const label = `${city.name}${country}`
			await loadForecastByCoords(city.lat, city.lon, label)
		} catch (searchError) {
			setError(searchError.message || 'Impossible de trouver la ville')
		}
	}

	useEffect(() => {
		let isMounted = true

		async function loadInitialForecast() {
			try {
				const position = await getBrowserPosition()

				if (!isMounted) {
					return
				}

				await loadForecastByCoords(
					position.coords.latitude,
					position.coords.longitude,
					'Position actuelle'
				)
			} catch {
				if (!isMounted) {
					return
				}

				setError('Géolocalisation refusée. Utilise la recherche de ville.')
			}
		}

		loadInitialForecast()

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
			<form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSearch}>
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
				<Button type="submit" className="h-10 bg-background text-foreground hover:bg-background/90">
					Rechercher
				</Button>
				<Button
					type="button"
					onClick={() => {
						setQuery('')
						setError('')
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
					}}
					className="h-10 bg-background text-foreground hover:bg-background/90"
				>
					<MapPin className="mr-1 h-4 w-4" />
					Ma position
				</Button>
			</form>

			{loading && <p className="text-sm text-primary-foreground/90">Chargement de la météo...</p>}
			{error && <p className="text-sm text-red-200">{error}</p>}

			{!loading && !error && !currentWeather && (
				<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
					<CardHeader>
						<CardTitle>Aucune donnée météo</CardTitle>
						<CardDescription>
							Autorise la géolocalisation ou recherche une ville pour afficher les prévisions.
						</CardDescription>
					</CardHeader>
				</Card>
			)}

			{!loading && currentWeather && (
				<div className="grid gap-4 lg:grid-cols-[220px_1fr]">
					<div className="space-y-4">
						<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
							<CardContent className="space-y-3 p-4">
								<div className="flex items-center justify-between">
									<p className="text-4xl font-bold">{Math.round(currentWeather.main.temp)}°C</p>
									<img
										src={getWeatherIconUrl(currentWeather.weather[0].icon)}
										alt={currentWeather.weather[0].description}
										className="h-14 w-14"
									/>
								</div>
								<p className="text-sm capitalize text-primary-foreground/85">
									{currentWeather.weather[0].description}
								</p>
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Min</p>
										<p className="font-semibold">{Math.round(currentWeather.main.temp_min)}°</p>
									</div>
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Max</p>
										<p className="font-semibold">{Math.round(currentWeather.main.temp_max)}°</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Indicateurs</CardTitle>
								<CardDescription className="text-primary-foreground/80">Résumé</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2 text-xs">
								<div className="grid grid-cols-2 gap-2">
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Temp. ressentie</p>
										<p className="font-semibold">{Math.round(currentWeather.main.feels_like)}°</p>
									</div>
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Humidité</p>
										<p className="font-semibold">{currentWeather.main.humidity}%</p>
									</div>
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Vent</p>
										<p className="font-semibold">{currentWeather.wind.speed} km/h</p>
									</div>
									<div className="rounded-md bg-primary-foreground/10 p-2">
										<p className="text-primary-foreground/70">Indice UV</p>
										<p className="font-semibold">3.5</p>
									</div>
								</div>
								<div className="rounded-md bg-primary-foreground/10 p-2">
									<p className="text-primary-foreground/70">Qualité de l’air</p>
									<p className="font-semibold">Good</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-4">
						<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div>
										<CardDescription className="text-primary-foreground/80">
											Aujourd’hui — {cityLabel || 'Ma position'}
										</CardDescription>
										<CardTitle>Prévisions horaires</CardTitle>
									</div>
									<p className="text-xs text-primary-foreground/70">00h → 23h</p>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
									{hourlyEntries.map((entry) => (
										<div
											key={`${entry.time}-${entry.temp}`}
											className="rounded-lg bg-primary-foreground/10 p-2 text-center"
										>
											<img
												src={getWeatherIconUrl(entry.icon)}
												alt={entry.description}
												className="mx-auto h-8 w-8"
											/>
											<p className="text-[11px] text-primary-foreground/80">{entry.time}</p>
											<p className="text-sm font-semibold">{entry.temp}°</p>
										</div>
									))}
								</div>
								<Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
									<TabsList className="bg-primary-foreground/10">
										{dailyForecasts.map((day) => (
											<TabsTrigger
												key={day.dayKey}
												value={day.dayKey}
												className="capitalize data-[state=active]:bg-primary-foreground data-[state=active]:text-primary"
											>
												{day.shortLabel}
											</TabsTrigger>
										))}
									</TabsList>
								</Tabs>
							</CardContent>
						</Card>

						<Card className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
							<CardHeader className="pb-3">
								<CardDescription className="text-primary-foreground/80">Courbes du jour</CardDescription>
								<CardTitle>Température • Pluie • Vent</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex flex-wrap gap-2 text-xs">
									<span className="inline-flex items-center gap-1 rounded-md bg-primary-foreground px-2 py-1 text-primary">
										<Gauge className="h-3.5 w-3.5" /> Température
									</span>
									<span className="inline-flex items-center gap-1 rounded-md bg-primary-foreground/10 px-2 py-1">
										<Droplets className="h-3.5 w-3.5" /> Pluie
									</span>
									<span className="inline-flex items-center gap-1 rounded-md bg-primary-foreground/10 px-2 py-1">
										<Wind className="h-3.5 w-3.5" /> Vent
									</span>
								</div>

								<div className="rounded-lg bg-primary-foreground/10 p-3">
									<p className="mb-1 text-xs text-primary-foreground/75">Température du jour (°C)</p>
									<svg viewBox="0 0 560 190" className="h-44 w-full">
										<polyline
											fill="none"
											stroke="currentColor"
											strokeWidth="4"
											className="text-primary-foreground"
											points={temperatureCurvePoints}
										/>
									</svg>
									<div className="flex justify-between text-[10px] text-primary-foreground/70">
										<span>00h</span>
										<span>06h</span>
										<span>12h</span>
										<span>18h</span>
										<span>23h</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</motion.main>
	)
}
