# Atmos · Meteorological Intelligence Application

Atmos is a professional, modern meteorological intelligence web application powered by **Python Flask** on the backend and bespoke **HTML5, Vanilla CSS, and JavaScript** on the frontend, featuring real-time data from the **OpenWeather API**.

---

## 🌟 Key Features

- **Atmospheric Precision UI**: Designed with a high-craft dark meteorologic aesthetic, obsidian glassmorphism, refined typography, and dynamic ambient lighting that shifts with weather conditions.
- **OpenWeather Platform Integration**: Connects to OpenWeather's Geocoding API (`/geo/1.0/direct`), Current Weather Data (`/data/2.5/weather`), and 5-Day / 3-Hour Forecast (`/data/2.5/forecast`).
- **Zero-Friction Demo Mode**: Works immediately out of the box with realistic simulated telemetry if an API key is not yet configured or pending activation.
- **In-App API Key Verification**: Configure and verify your OpenWeather API key directly through the web UI settings modal or via a `.env` file.
- **Real-Time Telemetry & Insights**:
  - **Hero Current Conditions**: Big temperature display, high/low range, feels-like temperature, condition glyphs, and natural language summary.
  - **Aeronautical Wind Compass**: Live rotating compass dial displaying exact degrees and cardinal heading (e.g. `ESE · 115°`), wind speed, and gusts.
  - **Solar Trajectory Arc**: Dynamic SVG daylight arc mapping the sun/moon's position relative to sunrise, sunset, and daylight remaining.
  - **24-Hour Forecast Timeline**: Horizontal scrollable hourly strip with condition icons, temperature, precipitation chance, and wind speed.
  - **5-Day Precision Outlook**: Multi-day outlook featuring temperature range gradient bars and rain probability.
  - **Precision Matrix Cards**: Humidity & Dew Point calculation, Barometric pressure gauge & atmospheric stability, Visibility with clarity rating, and Cloud density coverage.
- **Instant Search & History**:
  - City search with keyboard shortcut (`/`), clear button, and Enter-to-search.
  - Geolocation detection ("My Location" button) using browser GPS.
  - Recent searches history saved in `localStorage`.
  - Quick-select popular global cities (Tokyo, London, New York, Paris, Dubai, Mumbai, Sydney).
- **Unit Conversion**: Animated toggle switch between Metric (`°C`, `km/h`) and Imperial (`°F`, `mph`).

---

## 🚀 Getting Started

### 1. Requirements

- Python 3.9+
- Dependencies listed in `requirements.txt`:
  - `Flask`
  - `requests`

### 2. Installation

Install the required Python packages:

```bash
pip install -r requirements.txt
```

### 3. (Optional) Configure OpenWeather API Key

You can run the app immediately in Demo Mode, or add your free OpenWeather API key:

1. Obtain a free key at [OpenWeather API Keys](https://home.openweathermap.org/api_keys).
2. Copy `.env.example` to `.env` and set your key:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
*(Alternatively, you can click the **Key Settings** icon in the top right of the running web interface to enter and verify your key directly!)*

### 4. Running the Application

```bash
python app.py
```

Then open your browser at:
```
http://127.0.0.1:5000/
```

To run on a custom port:
```bash
python app.py --port 8080
```
