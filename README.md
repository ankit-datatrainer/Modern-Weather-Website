# Atmos — Modern Meteorological Intelligence Platform

A state-of-the-art meteorological intelligence web application built with **Python Flask** on the backend and bespoke **HTML5, Vanilla CSS, and JavaScript** on the frontend. Fully optimized for instant deployment on **Vercel** and **GitHub**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ankit-datatrainer/Modern-Weather-Website&env=OPENWEATHER_API_KEY)

---

## 🌟 Key Features

* **Swiss-Precision Aerometeorological Aesthetic**: Deep obsidian theme (`#07090e`), frosted glass cards, dynamic condition-reactive atmospheric lighting, and clean typography (`Plus Jakarta Sans` & `Outfit`).
* **In-App Location Permission Telemetry**:
  * Concentric animated radar beacon modal.
  * Dual detection: High-accuracy GPS with automatic failover to IP network telemetry (`/api/geolocate`).
  * Real city, state, and country reverse geocoding (e.g. New Delhi, IN).
* **60 FPS Atmospheric Weather Canvas FX Engine**:
  * Real-time condition particle simulation right inside the hero card:
    * ☀️ **Clear Day**: Radiant pulsing sun corona, rotating solar light beams, and floating warmth particles.
    * 🌙 **Clear Night**: Silvery moon glow, twinkling cosmic starfield, and streaking shooting stars.
    * 🌧️ **Rain & Drizzle**: Realistic diagonal rain streaks with bottom puddle splash ripples.
    * ⚡ **Thunderstorm**: Storm clouds, torrential rain, and branching electric lightning flashes with ambient strobes.
    * ❄️ **Snow**: Swaying 3D crystalline snowflakes drifting down based on wind speed.
    * ☁️ **Clouds & Fog**: Volumetric floating cloud vapor and rolling fog.
  * Interactive `LIVE FX` / `FX OFF` toggle badge.
  * 3D perspective mouse-tracking tilt on the hero weather card.
* **Multi-Day Predictive Forecasts (5 Days / 7 Days / 10 Days)**:
  * Interactive range selector tabs: `5 Days`, `7 Days (Week)`, and `10 Days`.
  * Dynamic relative heat range bars scaled across the selected period.
  * Daily precipitation probability badges (`%`), condition descriptions, and wind/humidity readouts.
* **Aeronautical Instruments & Telemetry**:
  * **Wind & Compass**: 360-degree rotating compass dial with exact degrees, cardinal direction (e.g., `SSE · 158°`), speed, and gusts.
  * **Solar Trajectory Arc**: Parametric daylight progress arc calculating sunrise, sunset, and remaining daylight hours.
  * **24-Hour Atmospheric Timeline**: Smooth scrollable hourly timeline with rain probability dots.
  * **Precision Matrix**: Barometer gauge, Humidity bar & dew point, Visibility index, and Cloud density coverage.
* **Instant Search & History**:
  * Keyboard shortcut `/` to focus search.
  * Quick popular city chips (Tokyo, London, New York, Paris, Dubai, Mumbai, New Delhi, Sydney).
  * Recent searches history saved in `localStorage`.
  * Direct coordinate search support (e.g. `40.7128, -74.0060`).
* **Unit Switching**: Seamless one-click conversion between Metric (`°C`, `km/h`) and Imperial (`°F`, `mph`).
* **Deterministic Offline Simulation Fallback**: Zero downtime — seamlessly serves realistic telemetry even if network or API keys are disconnected.

---

## ⚡ Deployment on Vercel

This repository is pre-configured and optimized out-of-the-box for **Vercel Serverless Functions**:

* `api/index.py`: Serverless WSGI entry point exporting the Flask application.
* `vercel.json`: Automatic URL rewriting to route all traffic seamlessly to the Python runtime.
* `requirements.txt`: Lightweight dependencies for ultra-fast Vercel cold starts.

### 1-Click Deploy via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import your GitHub repository: `https://github.com/ankit-datatrainer/Modern-Weather-Website`.
3. In **Environment Variables**, add:
   * **Key**: `OPENWEATHER_API_KEY`
   * **Value**: Your OpenWeather API key
4. Click **Deploy**. Your live site will be ready in under 60 seconds!

---

## 🚀 Local Development Setup

### 1. Requirements
* Python 3.9+
* Git

### 2. Installation
```bash
git clone https://github.com/ankit-datatrainer/Modern-Weather-Website.git
cd Modern-Weather-Website
pip install -r requirements.txt
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your key inside `.env`:
```env
OPENWEATHER_API_KEY=your_openweather_key_here
```

### 4. Run the Server
```bash
python app.py
```
Open your browser at:
```
http://127.0.0.1:5000
```

---

## 📁 Repository Structure

```
├── api/
│   └── index.py            # Vercel Serverless Function entry point
├── static/
│   ├── css/
│   │   └── style.css       # Swiss aerometeorological CSS design system
│   └── js/
│       └── app.js          # Client-side state, 60fps Canvas FX, and telemetry
├── templates/
│   └── index.html          # Semantic HTML5 layout with embedded SVG glyphs
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules for Python, virtualenv, and .env
├── app.py                  # Flask backend proxy, geocoding, and simulation engine
├── requirements.md         # Detailed changelog, specifications, and feature audit
├── requirements.txt        # Python package dependencies (Flask, requests)
├── vercel.json             # Vercel deployment configuration
└── README.md               # Documentation and guides
```

---

## 📄 License
MIT License. Created by [Ankit Kumar](https://github.com/ankit-datatrainer).
