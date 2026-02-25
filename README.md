# Sun Forecast Project

Application météo React réalisée dans le cadre du TP `TP_Projet_React_Sun_Forecast_extrait.txt`
}.

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

## API utilisée

- Forecast 5 jours: `https://api.openweathermap.org/data/2.5/forecast`
- Geocoding: `https://api.openweathermap.org/geo/1.0/direct`
- Icônes météo: `https://openweathermap.org/img/wn/{icon}@2x.png`
- Tuiles météo: `https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png`

Clé API utilisée dans le projet: celle fournie par l’énoncé.

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

- `src/pages/HomePage.jsx`
- `src/pages/MapsPage.jsx`
- `src/services/openWeather.js`
- `src/components/ui/*`

## Rendu

Le projet est livrable sous forme de:

- dépôt GitHub (ce repo), ou
- archive `.zip` du projet (hors `node_modules`).
