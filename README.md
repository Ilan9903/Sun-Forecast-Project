# Sun Forecast Project

Application météo React réalisée dans le cadre du [TP_Projet_React_Sun_Forecast_extrait.txt](https://github.com/Ilan9903/Sun-Forecast-Project/blob/main/TP_Projet_React_Sun_Forecast_extrait.txt).

## Objectif

- Afficher la météo à partir de la géolocalisation utilisateur.
- Permettre la recherche d’une ville.
- Afficher des prévisions météo sur 5 jours.
- Afficher les couches cartographiques météo (pluie, température, vent).

## Stack technique

- React + Vite
- React Router
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Lucide React
- Leaflet / React Leaflet
- OpenWeather API

## API utilisée (conforme au TP)

- Forecast 5 jours: `https://api.openweathermap.org/data/2.5/forecast`
- Geocoding: `https://api.openweathermap.org/geo/1.0/direct`
- Icônes météo: `https://openweathermap.org/img/wn/{icon}@2x.png`
- Tuiles météo: `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png`

Le projet utilise la variable d’environnement `VITE_OPENWEATHER_API_KEY`.

## Configuration de la clé API

### En local

1. Duplique le fichier `.env.example` en `.env`.
2. Renseigne ta clé OpenWeather:

```bash
VITE_OPENWEATHER_API_KEY=ta_cle_openweather
```

3. Redémarre le serveur Vite si nécessaire.

### Pour GitHub (autres utilisateurs)

- Le repo contient `.env.example` (sans clé réelle).
- Chaque utilisateur copie `.env.example` vers `.env` et renseigne sa propre clé.
- Le fichier `.env` est ignoré par Git (sécurité).

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

## Build production

```bash
npm run build
```

## Vérification lint

```bash
npm run lint
```

## Fonctionnalités livrées

### Page Accueil

- Recherche de ville
- Bouton “Ma position” (géolocalisation)
- Météo actuelle (température + description + icône)
- Prévisions horaires
- Résumé des indicateurs météo
- Prévisions sur 5 jours

### Page Maps

- Carte interactive (Leaflet)
- Recentrage automatique sur la ville recherchée
- Couches météo OpenWeather:
	- Pluie
	- Température
	- Vent
- Contrôle du zoom

## Structure principale

- [HomePage](https://github.com/Ilan9903/Sun-Forecast-Project/blob/main/src/pages/HomePage.jsx)
- [MapsPage](https://github.com/Ilan9903/Sun-Forecast-Project/blob/main/src/pages/MapsPage.jsx)
- [openWeather](https://github.com/Ilan9903/Sun-Forecast-Project/blob/main/src/services/openWeather.js)
- [UI Components](https://github.com/Ilan9903/Sun-Forecast-Project/blob/main/src/components/ui)

## Rendu

Le projet est livrable sous forme de:

- dépôt GitHub (ce repo), ou
- archive `.zip` du projet (hors `node_modules`).
