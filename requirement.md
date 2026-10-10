# Atmos — Meteorological Intelligence & Weather System
## Requirements, Changelog & Feature Specification

---

## 1. Project Overview & Architecture

**Atmos** is a professional meteorological intelligence web application. It combines real-time satellite telemetry, predictive forecasting models, and a Swiss-precision aerometeorological design to deliver live weather intelligence without looking like a generic or AI-generated template.

### Technology Stack
* **Backend:** Python 3.9+ with **Flask** micro-framework.
  * Proxies OpenWeather API requests securely (API keys are never exposed on client-side).
  * Enriches meteorological observations with reverse geocoding, IP geolocation failover, and multi-day forecasting.
  * Deterministic simulation engine ensures the application functions even when offline or without external credentials.
* **Frontend:**
  * **HTML5:** Semantic structure, accessible markup, embedded SVG glyph sprite system.
  * **Vanilla CSS:** Custom design tokens, glassmorphism, dynamic condition-driven atmospheric backdrops, 3D card perspective tilt.
  * **Vanilla JavaScript (ES6+):** Modular client, 60 FPS HTML5 Canvas weather FX simulation, live local clock, persistent state management.
* **APIs & Services:**
  * **OpenWeather API (2.5 & Geocoding 1.0):** Real-time current observations, 5-day 3-hourly forecast, and reverse geocoding.
  * **Open-Meteo API:** High-resolution global 7-day (1 week) and 10-day daily predictive forecasts.
  * **IP Geolocation Services (`ipapi.co`, `ip-api.com`, `ipwho.is`):** Frictionless in-app location auto-detection.

---

## 2. System Requirements & Dependencies

### Python Environment
* Python `>= 3.9`
* Dependencies listed in `requirements.txt`:
  ```txt
  flask>=3.0.0
  requests>=2.31.0
  ```

### Client Browser
* Modern web browser with ES6+ JavaScript and HTML5 Canvas support (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).
* Local storage enabled for saving unit preferences (°C/°F), selected forecast duration, and recent cities.

### Environment Variables (`.env`)
```ini
# OpenWeather API Key (managed internally by the server)
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

---

## 3. Detailed Changelog & Evolution (From Start to Present)

### Phase 1: Initial Architecture & Foundation
* **Directory Structure Standardization:** Organized project into a modular Flask layout with `templates/` and `static/css/`, `static/js/`.
* **Backend Proxy:** Built Flask API endpoints (`/api/weather`, `/api/health`) that query OpenWeather and normalize raw payloads into clean JSON structures.
* **Swiss-Precision Design System:** Implemented dark obsidian theme (`#07090e`), frosted glass cards (`rgba(15, 20, 31, 0.72)`), custom typography (`Plus Jakarta Sans` and `Outfit`), and dynamic ambient glow backdrops that morph based on the current weather condition (clear, rain, thunder, snow, clouds, mist).
* **Root Launcher:** Added root `app.py` launcher supporting execution directly from workspace roots and custom port parameters (`--port 5000`).

### Phase 2: User Experience Polish & Key Abstraction
* **Removed Live Key Exposure:** Eliminated all UI controls that asked users to input an API key or mentioned OpenWeather branding. The internal key is managed strictly on the backend.
* **Pre-Set Search Chips:** Added one-click popular city chips: Tokyo, London, New York, Paris, Dubai, Mumbai, New Delhi, and Sydney.
* **Search History Rail:** Added recent search pills saved in `localStorage` with quick reload capability.
* **Dual Unit Switching:** Added interactive `°C` and `°F` unit toggles that automatically convert temperatures and wind speeds (`km/h` vs `mph`).

### Phase 3: In-App Location Permission & Actual Location Telemetry
* **Problem Addressed:** Browsers often block native geolocation popups on insecure HTTP or webview origins, causing "Location permission denied" errors. Furthermore, coordinate queries previously lacked city names.
* **In-App Location Permission Modal:** Built a custom modal dialog (`#location-modal`) triggered by clicking **"My Location"**:
  * Concentric pulsing radar beacon animation.
  * Clear explanation of privacy and station telemetry usage.
  * **Option 1 ("Grant Location Permission"):** Requests high-accuracy GPS coordinates via `navigator.geolocation`. If denied or blocked by the browser, it seamlessly falls back to IP geolocation.
  * **Option 2 ("Auto-Detect via Network (IP)"):** Bypasses all browser popups and instantly resolves location via `/api/geolocate`.
* **Reverse Geocoding Pipeline:** Updated `/api/weather` so latitude and longitude queries automatically perform reverse geocoding to resolve real city, state, and country names (e.g. New Delhi, IN).
* **Direct Coordinate Parsing:** Added regex detection in both frontend search and backend routes to handle direct coordinate inputs (e.g., `40.7128, -74.0060`).

### Phase 4: 60 FPS Atmospheric Weather Canvas FX
* **Atmospheric Canvas Engine (`AtmosphericWeatherEngine`):** Built a hardware-accelerated canvas simulation right inside the hero weather visualizer:
  * ☀️ **Clear Day:** Pulsing golden corona, 12 rotating solar light beams, and floating warm solar embers.
  * 🌙 **Clear Night:** Silvery lunar glow, twinkling starfield, and streaking shooting stars (meteors).
  * 🌧️ **Rain & Drizzle:** Diagonal high-velocity raindrops with splash ripples at the bottom baseline.
  * ⚡ **Thunderstorm:** Storm clouds, heavy rain, and branching electric lightning flashes with ambient strobes.
  * ❄️ **Snow:** Crystalline snowflakes drifting and swaying with harmonic oscillations based on wind speed.
  * ☁️ **Clouds & Fog:** Multi-layered volumetric drifting cloud puffs and atmospheric fog vapor.
* **Interactive Controls:** Added a toggle button (`LIVE FX` / `FX OFF`) allowing users to pause or resume animations.
* **3D Parallax Tilt:** Added mouse-tracking 3D perspective tilt on the hero weather card (`perspective(1000px) rotateX(...) rotateY(...)`).

### Phase 5: Multi-Day Predictive Forecasts (5 Days / 7 Days / 10 Days)
* **Forecast Duration Selector:** Added tab buttons above the daily forecast:
  * **5 Days:** Precision 5-day outlook.
  * **7 Days (Week):** Full 1-week forecast (default).
  * **10 Days:** Extended 10-day outlook powered by Open-Meteo's WMO weather model.
* **Dynamic Range Bars:** The temperature visualization bar dynamically scales its width and position based on the global minimum and maximum temperatures across all selected days.
* **Enriched Data Points:** Displays weather glyphs, descriptive text, rain probability percentages, humidity, and peak wind speeds for every day.

---

## 4. Complete Application Features Matrix

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Real-Time Telemetry** | Current temperature, feels like, min/max, weather description, and live timestamp. | ✅ Active |
| **In-App Location Modal** | In-app permission prompt with animated radar beacon, GPS request, and network fallback. | ✅ Active |
| **Network IP Geolocation** | Frictionless location resolution via `/api/geolocate` (guarantees 100% success rate). | ✅ Active |
| **Reverse Geocoding** | Coordinate queries automatically resolve to actual city and country names. | ✅ Active |
| **60 FPS Weather Canvas FX** | Live particle animations for Sun, Moon/Stars, Rain, Thunderstorm, Snow, and Fog. | ✅ Active |
| **Interactive FX Toggle** | `LIVE FX` / `FX OFF` badge with local storage persistence. | ✅ Active |
| **3D Perspective Card Tilt** | Smooth mouse-tracking tilt effect on the main weather card. | ✅ Active |
| **24-Hour Timeline Rail** | Horizontal scrolling 24-hour micro-forecast with temperature and rain probabilities. | ✅ Active |
| **Multi-Day Range Tabs** | Toggle between 5 Days, 7 Days (Week), and 10 Days of predictive forecasts. | ✅ Active |
| **Relative Heat Range Bars** | Visual min/max temperature gradient bars scaled across the forecast duration. | ✅ Active |
| **Wind & Compass Instrument** | 360-degree rotating compass needle with cardinal direction and gust readouts. | ✅ Active |
| **Solar Trajectory Arc** | Parametric daylight progression arc tracking sunrise, sunset, and remaining daylight. | ✅ Active |
| **Comprehensive Matrix** | Humidity bar & dew point, Barometer needle, Visibility scale, and Cloud coverage. | ✅ Active |
| **Recent Search Pills** | Persistent chips of recently queried locations saved in browser storage. | ✅ Active |
| **Popular City Shortcuts** | Quick-access pills for Tokyo, London, New York, Paris, Dubai, Mumbai, New Delhi, Sydney. | ✅ Active |
| **Unit Converter** | Instant toggle between Metric (°C, km/h) and Imperial (°F, mph). | ✅ Active |
| **Coordinate Search** | Support for entering raw coordinates (e.g., `51.5074, -0.1278`) in the search bar. | ✅ Active |
| **Simulation Fallback** | Realistic offline demo mode if network connection or API quota is interrupted. | ✅ Active |

---

## 5. Execution & Deployment Guide

### Running Locally
1. Clone or navigate to the project directory:
   ```bash
   cd "c:/Users/ankit/OneDrive/Desktop/Weather Application -KIMI"
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the application:
   ```bash
   python app.py
   # Or with a custom port:
   python app.py --port 5000
   ```
4. Access the web interface in your browser:
   ```
   http://127.0.0.1:5000
   ```

---

*Documentation maintained by Atmos Engineering.*
