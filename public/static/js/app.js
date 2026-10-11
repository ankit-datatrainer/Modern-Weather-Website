/**
 * ATMOS — Meteorological Intelligence & Weather System
 * High-precision frontend client with real-time OpenWeather integration,
 * In-App Location Permission Telemetry, 60FPS Weather Canvas FX,
 * and 5-Day / 7-Day (Week) / 10-Day Predictive Forecasting.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State & Configuration
  // ---------------------------------------------------------------------------
  const STORAGE_KEYS = {
    UNITS: 'atmos_units',
    RECENT: 'atmos_recent_cities',
    LAST_CITY: 'atmos_last_city',
    DAYS: 'atmos_forecast_days',
    FX_ACTIVE: 'atmos_fx_active',
  };

  const state = {
    units: localStorage.getItem(STORAGE_KEYS.UNITS) || 'metric',
    forecastDays: parseInt(localStorage.getItem(STORAGE_KEYS.DAYS) || '7', 10),
    recentCities: JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT) || '[]'),
    currentLocation: null,
    weatherData: null,
    isLoading: false,
    clockInterval: null,
    fxActive: localStorage.getItem(STORAGE_KEYS.FX_ACTIVE) !== 'false',
    currentConditionCode: 800,
    currentIconCode: '01d',
  };

  // ---------------------------------------------------------------------------
  // DOM Elements
  // ---------------------------------------------------------------------------
  const elements = {
    body: document.body,
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    clearInputBtn: document.getElementById('clear-input-btn'),
    geoBtn: document.getElementById('geo-btn'),
    popularRail: document.getElementById('popular-cities-rail'),
    recentGroup: document.getElementById('recent-cities-group'),
    recentRail: document.getElementById('recent-cities-rail'),
    
    // Status & Notice
    statusText: document.getElementById('status-text'),
    noticeBanner: document.getElementById('notice-banner'),
    noticeMessage: document.getElementById('notice-message'),
    noticeDismiss: document.getElementById('notice-dismiss'),
    loadingState: document.getElementById('loading-state'),
    loadingLabel: document.getElementById('loading-label'),
    errorState: document.getElementById('error-state'),
    errorTitle: document.getElementById('error-title'),
    errorDetail: document.getElementById('error-detail'),
    btnRetry: document.getElementById('btn-retry'),
    btnDemoFallback: document.getElementById('btn-demo-fallback'),

    // Dashboard & Hero Card
    dashboard: document.getElementById('weather-dashboard'),
    heroCard: document.getElementById('hero-card'),
    locName: document.getElementById('loc-name'),
    locCountry: document.getElementById('loc-country'),
    locCoords: document.getElementById('loc-coords'),
    telemetryTag: document.getElementById('telemetry-tag'),
    timeText: document.getElementById('time-text'),
    conditionPill: document.getElementById('condition-pill'),
    conditionText: document.getElementById('condition-text'),
    tempVal: document.getElementById('temp-val'),
    tempUnit: document.getElementById('temp-unit'),
    feelsVal: document.getElementById('feels-val'),
    hiVal: document.getElementById('hi-val'),
    loVal: document.getElementById('lo-val'),
    heroIcon: document.getElementById('hero-condition-icon'),
    weatherSummary: document.getElementById('weather-summary-text'),
    lastUpdated: document.getElementById('last-updated'),
    refreshBtn: document.getElementById('refresh-btn'),

    // FX Stage & Canvas
    animCanvas: document.getElementById('weather-anim-canvas'),
    animToggleBtn: document.getElementById('anim-toggle-btn'),
    animToggleText: document.getElementById('anim-toggle-text'),
    visualGlow: document.getElementById('visual-glow'),

    // Quick Telemetry
    windSpeedVal: document.getElementById('wind-speed-val'),
    windUnit: document.getElementById('wind-unit'),
    windCardinal: document.getElementById('wind-cardinal'),
    windGustVal: document.getElementById('wind-gust-val'),
    compassNeedle: document.getElementById('compass-needle'),
    
    // Sun
    sunMarkerDot: document.getElementById('sun-marker-dot'),
    arcProgressPath: document.getElementById('arc-progress-path'),
    daylightRemaining: document.getElementById('daylight-remaining'),
    sunriseVal: document.getElementById('sunrise-val'),
    sunsetVal: document.getElementById('sunset-val'),

    // Rails & Forecasts
    hourlyRail: document.getElementById('hourly-rail'),
    forecastHeading: document.getElementById('forecast-heading'),
    dailyList: document.getElementById('daily-list'),
    rangeTabs: document.querySelectorAll('.range-tab'),

    // Mini Matrix
    humidityVal: document.getElementById('humidity-val'),
    humidityTag: document.getElementById('humidity-tag'),
    humidityBar: document.getElementById('humidity-bar'),
    dewPointVal: document.getElementById('dew-point-val'),
    
    pressureVal: document.getElementById('pressure-val'),
    pressureNeedle: document.getElementById('pressure-needle'),
    pressureTag: document.getElementById('pressure-tag'),
    
    visibilityVal: document.getElementById('visibility-val'),
    visibilityUnit: document.getElementById('visibility-unit'),
    visibilityTag: document.getElementById('visibility-tag'),
    
    cloudsVal: document.getElementById('clouds-val'),
    cloudsBar: document.getElementById('clouds-bar'),
    cloudsTag: document.getElementById('clouds-tag'),

    // Units
    unitC: document.getElementById('unit-c'),
    unitF: document.getElementById('unit-f'),

    // In-App Location Modal Elements
    locModal: document.getElementById('location-modal'),
    locModalGpsBtn: document.getElementById('loc-modal-gps-btn'),
    locModalIpBtn: document.getElementById('loc-modal-ip-btn'),
    locModalCancelBtn: document.getElementById('loc-modal-cancel-btn'),
    locModalCloseIcon: document.getElementById('loc-modal-close-icon'),

    toastContainer: document.getElementById('toast-container'),
    footerStationInfo: document.getElementById('footer-station-info'),
  };

  // ---------------------------------------------------------------------------
  // Condition & Icon Mapper
  // ---------------------------------------------------------------------------
  function mapConditionToIcon(id, iconCode) {
    const isNight = iconCode && iconCode.endsWith('n');
    if (id >= 200 && id < 300) return '#w-thunder';
    if (id >= 300 && id < 400) return '#w-drizzle';
    if (id >= 500 && id < 600) return '#w-rain';
    if (id >= 600 && id < 700) return '#w-snow';
    if (id >= 700 && id < 800) return '#w-mist';
    if (id === 800) return isNight ? '#w-clear-night' : '#w-clear-day';
    if (id === 801 || id === 802) return isNight ? '#w-partly-night' : '#w-partly-day';
    if (id === 803) return '#w-cloud';
    if (id >= 804) return '#w-overcast';
    return isNight ? '#w-clear-night' : '#w-clear-day';
  }

  function getConditionTheme(id, iconCode) {
    const isNight = iconCode && iconCode.endsWith('n');
    if (id >= 200 && id < 300) return 'thunder';
    if (id >= 300 && id < 400) return 'drizzle';
    if (id >= 500 && id < 600) return 'rain';
    if (id >= 600 && id < 700) return 'snow';
    if (id >= 700 && id < 800) return 'mist';
    if (id === 800) return isNight ? 'clear-night' : 'clear-day';
    return isNight ? 'clear-night' : 'clouds';
  }

  function getWindCardinal(degrees) {
    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return cardinals[index];
  }

  // ---------------------------------------------------------------------------
  // Weather Summary & Insight Generator
  // ---------------------------------------------------------------------------
  function generateInsightSummary(current, units) {
    const desc = (current.condition?.description || 'clear skies').toLowerCase();
    const temp = current.temp;
    const isMetric = units === 'metric';
    const tempC = isMetric ? temp : (temp - 32) * 5 / 9;

    let thermalFeeling = 'mild';
    if (tempC < 5) thermalFeeling = 'crisp and cold';
    else if (tempC < 15) thermalFeeling = 'cool';
    else if (tempC < 25) thermalFeeling = 'pleasant and comfortable';
    else if (tempC < 32) thermalFeeling = 'warm';
    else thermalFeeling = 'hot';

    const windSpeed = current.wind_speed;
    const windKmH = isMetric ? windSpeed : windSpeed * 1.60934;
    let windText = 'calm air';
    if (windKmH > 35) windText = 'gusty winds';
    else if (windKmH > 18) windText = 'a moderate breeze';
    else if (windKmH > 6) windText = 'a gentle breeze';

    const humidity = current.humidity;
    let humidText = '';
    if (humidity > 75) humidText = 'with noticeable humidity';
    else if (humidity < 35) humidText = 'with dry conditions';

    return `Currently experiencing ${desc}. Conditions are ${thermalFeeling} with ${windText}${humidText ? ' ' + humidText : ''}.`;
  }

  // ---------------------------------------------------------------------------
  // 60FPS Atmospheric Weather FX Animation Canvas Engine
  // ---------------------------------------------------------------------------
  class AtmosphericWeatherEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.width = 220;
      this.height = 220;
      this.particles = [];
      this.lightning = { active: false, timer: 0, branches: [] };
      this.stars = [];
      this.shootingStar = null;
      this.sunAngle = 0;
      this.animId = null;
      this.lastTime = performance.now();
      this.condition = 'clear-day';
      this.initStars();
    }

    initStars() {
      this.stars = [];
      for (let i = 0; i < 40; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 1.6 + 0.4,
          alpha: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    }

    setCondition(theme, isNight) {
      this.condition = theme;
      this.isNight = isNight;
      this.particles = [];
      this.lightning.active = false;
      this.lightning.timer = Math.random() * 180 + 120; // 2-5 seconds
      
      const count = (theme === 'rain' || theme === 'drizzle') ? 50
                  : (theme === 'thunder') ? 60
                  : (theme === 'snow') ? 35
                  : (theme === 'clouds' || theme === 'mist') ? 16
                  : 20;

      for (let i = 0; i < count; i++) {
        this.particles.push(this.createParticle(theme));
      }
    }

    createParticle(theme) {
      if (theme === 'rain' || theme === 'drizzle' || theme === 'thunder') {
        return {
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: Math.random() * 12 + 8,
          speed: Math.random() * 5 + 7,
          opacity: Math.random() * 0.5 + 0.3,
          tilt: -1.5,
        };
      } else if (theme === 'snow') {
        return {
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.2 + 1,
          speed: Math.random() * 0.8 + 0.6,
          sway: Math.random() * 2,
          swaySpeed: Math.random() * 0.03 + 0.01,
          opacity: Math.random() * 0.6 + 0.3,
        };
      } else if (theme === 'clouds' || theme === 'mist') {
        return {
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 28 + 20,
          speed: Math.random() * 0.3 + 0.15,
          opacity: Math.random() * 0.08 + 0.04,
        };
      } else {
        // Clear Day (warm solar embers) or Clear Night
        return {
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2 + 0.8,
          speedY: -(Math.random() * 0.5 + 0.2),
          speedX: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI,
        };
      }
    }

    start() {
      if (!this.ctx) return;
      if (this.animId) cancelAnimationFrame(this.animId);
      this.lastTime = performance.now();
      const loop = (now) => {
        if (!state.fxActive) return;
        this.render(now);
        this.animId = requestAnimationFrame(loop);
      };
      this.animId = requestAnimationFrame(loop);
    }

    stop() {
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height);
      }
    }

    generateLightning() {
      const branches = [];
      let startX = 60 + Math.random() * 100;
      let startY = 15;
      let currX = startX;
      let currY = startY;

      while (currY < this.height - 20) {
        const nextX = currX + (Math.random() - 0.5) * 30;
        const nextY = currY + Math.random() * 25 + 15;
        branches.push({ x1: currX, y1: currY, x2: nextX, y2: nextY });
        currX = nextX;
        currY = nextY;
      }
      return branches;
    }

    render(now) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      const cx = this.width / 2;
      const cy = this.height / 2;

      // 1. Condition: CLEAR DAY (Sun Rays & Warm Corona)
      if (this.condition === 'clear-day') {
        this.sunAngle += 0.008;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.sunAngle);

        // Rotating soft solar corona rays
        for (let i = 0; i < 12; i++) {
          ctx.rotate((Math.PI * 2) / 12);
          const grad = ctx.createLinearGradient(0, 40, 0, 95);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(-4, 40);
          ctx.lineTo(4, 40);
          ctx.lineTo(0, 95);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Warm floating solar embers
        this.particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += 0.04;
          if (p.y < 0) p.y = this.height;
          if (p.x < 0) p.x = this.width;
          if (p.x > this.width) p.x = 0;

          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Condition: CLEAR NIGHT (Cosmic Stars & Shooting Star)
      else if (this.condition === 'clear-night') {
        this.stars.forEach((s) => {
          s.alpha += Math.sin(now * s.speed) * 0.015;
          const a = Math.max(0.1, Math.min(0.9, s.alpha));
          ctx.fillStyle = `rgba(224, 231, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Periodic meteor / shooting star
        if (!this.shootingStar && Math.random() < 0.008) {
          this.shootingStar = {
            x: Math.random() * 120,
            y: Math.random() * 60,
            len: 45,
            speed: 8,
            progress: 0,
          };
        }

        if (this.shootingStar) {
          const ss = this.shootingStar;
          ctx.save();
          const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + ss.len, ss.y + ss.len);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0.9)');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x + ss.len, ss.y + ss.len);
          ctx.stroke();
          ctx.restore();

          ss.x += ss.speed;
          ss.y += ss.speed;
          ss.progress++;
          if (ss.progress > 20 || ss.x > this.width) {
            this.shootingStar = null;
          }
        }
      }

      // 3. Condition: RAIN & DRIZZLE
      else if (this.condition === 'rain' || this.condition === 'drizzle') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = this.condition === 'rain' ? 1.5 : 1;
        ctx.lineCap = 'round';

        this.particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.length);
          ctx.stroke();

          p.y += p.speed;
          p.x += p.tilt * 0.4;

          // Splash ripple at base
          if (p.y > this.height - 15) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity * 0.5})`;
            ctx.beginPath();
            ctx.ellipse(p.x, this.height - 10, 5, 2, 0, 0, Math.PI * 2);
            ctx.stroke();

            p.y = -p.length;
            p.x = Math.random() * this.width;
          }
        });
      }

      // 4. Condition: THUNDERSTORM (Dynamic Lightning Bursts + Rain)
      else if (this.condition === 'thunder') {
        // Rain layer
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.7)';
        ctx.lineWidth = 1.8;
        this.particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.tilt * 1.5, p.y + p.length * 1.2);
          ctx.stroke();
          p.y += p.speed * 1.3;
          if (p.y > this.height) {
            p.y = -p.length;
            p.x = Math.random() * this.width;
          }
        });

        // Lightning flash controller
        this.lightning.timer--;
        if (this.lightning.timer <= 0) {
          this.lightning.active = true;
          this.lightning.branches = this.generateLightning();
          this.lightning.duration = 8; // frames
          this.lightning.timer = Math.random() * 220 + 150;
        }

        if (this.lightning.active) {
          ctx.save();
          // Ambient strobe flash
          ctx.fillStyle = 'rgba(168, 85, 247, 0.16)';
          ctx.fillRect(0, 0, this.width, this.height);

          // Draw lightning bolt
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 14;

          this.lightning.branches.forEach((b) => {
            ctx.beginPath();
            ctx.moveTo(b.x1, b.y1);
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();
          });
          ctx.restore();

          this.lightning.duration--;
          if (this.lightning.duration <= 0) {
            this.lightning.active = false;
          }
        }
      }

      // 5. Condition: SNOW
      else if (this.condition === 'snow') {
        ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
        this.particles.forEach((p) => {
          p.sway += p.swaySpeed;
          p.y += p.speed;
          const currentX = p.x + Math.sin(p.sway) * 8;

          ctx.beginPath();
          ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          if (p.y > this.height) {
            p.y = -p.radius * 2;
            p.x = Math.random() * this.width;
          }
        });
      }

      // 6. Condition: CLOUDS & MIST
      else {
        this.particles.forEach((p) => {
          p.x += p.speed;
          if (p.x - p.radius > this.width) {
            p.x = -p.radius;
            p.y = Math.random() * this.height;
          }
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(148, 163, 184, ${p.opacity})`);
          grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  }

  let fxEngine = null;

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  async function fetchWeather({ city = '', lat = null, lon = null, days = null } = {}) {
    if (state.isLoading) return;
    setLoading(true);
    hideNotice();
    hideError();

    const targetDays = days || state.forecastDays;
    const params = new URLSearchParams();
    params.set('units', state.units);
    params.set('days', targetDays);

    if (city) params.set('city', city);
    if (lat !== null && lon !== null) {
      params.set('lat', lat);
      params.set('lon', lon);
    }

    try {
      const res = await fetch(`/api/weather?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to retrieve meteorological data.');
      }

      state.weatherData = data;
      state.currentLocation = {
        name: data.location.name,
        country: data.location.country,
        lat: data.location.lat,
        lon: data.location.lon,
      };

      // Save to recent cities and update input
      if (data.location?.name) {
        addRecentCity(data.location.name);
        localStorage.setItem(STORAGE_KEYS.LAST_CITY, data.location.name);
        elements.searchInput.value = data.location.name;
        elements.clearInputBtn.hidden = false;
      }

      renderWeather(data);

      if (data.notice) {
        showNotice(data.notice);
      }

      showToast(`Telemetry updated: ${data.location.name}, ${data.location.country}`);
    } catch (err) {
      console.error('[Atmos Error]', err);
      showError('Observation Unavailable', err.message);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // In-App Location Auto-Detection via IP Telemetry
  // ---------------------------------------------------------------------------
  async function detectLocationViaIP() {
    setLoading(true, 'Triangulating station coordinates via IP network...');
    hideLocationModal();

    try {
      const res = await fetch('/api/geolocate');
      const data = await res.json();

      if (data && data.lat && data.lon) {
        showToast(`Located Station: ${data.city || 'Local Area'}, ${data.country || ''}`);
        await fetchWeather({ lat: data.lat, lon: data.lon, city: data.city || '' });
      } else {
        throw new Error('Network geolocation lookup returned incomplete coordinates.');
      }
    } catch (err) {
      console.warn('[IP Geolocate Error]', err);
      showToast('Falling back to default meteorological station...');
      await fetchWeather({ city: 'London' });
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function renderWeather(data) {
    const loc = data.location;
    const cur = data.current;
    const isMetric = data.units === 'metric';
    const tempSymbol = isMetric ? '°C' : '°F';
    const speedUnit = isMetric ? 'km/h' : 'mph';

    // 1. Theme & Body Condition
    const condCode = cur.condition?.id || 800;
    const iconCode = cur.condition?.icon || '01d';
    const themeName = getConditionTheme(condCode, iconCode);
    const isNight = iconCode && iconCode.endsWith('n');

    elements.body.dataset.condition = themeName;
    state.currentConditionCode = condCode;
    state.currentIconCode = iconCode;

    // Trigger Canvas Animation Engine
    if (fxEngine) {
      fxEngine.setCondition(themeName, isNight);
    }

    // 2. Location & Coordinates
    elements.locName.textContent = loc.name || 'Local Station';
    elements.locCountry.textContent = loc.country || 'INT';
    const latDir = loc.lat >= 0 ? 'N' : 'S';
    const lonDir = loc.lon >= 0 ? 'E' : 'W';
    elements.locCoords.textContent = `${Math.abs(loc.lat).toFixed(4)}° ${latDir}, ${Math.abs(loc.lon).toFixed(4)}° ${lonDir}`;

    // Telemetry Badge
    elements.telemetryTag.textContent = data.is_demo ? 'SIMULATED RADAR' : 'LIVE OBSERVATION';
    elements.telemetryTag.className = data.is_demo ? 'telemetry-tag demo-tag' : 'telemetry-tag';

    // 3. Local Time Clock
    startLocalClock(loc.timezone || 0);

    // 4. Hero Temperature & Conditions
    elements.conditionText.textContent = cur.condition?.description || cur.condition?.main || 'Clear';
    elements.tempVal.textContent = Math.round(cur.temp);
    elements.tempUnit.textContent = tempSymbol;
    elements.feelsVal.textContent = `Feels like ${Math.round(cur.feels_like)}°`;
    elements.hiVal.textContent = `${Math.round(cur.temp_max)}°`;
    elements.loVal.textContent = `${Math.round(cur.temp_min)}°`;

    // Hero Icon
    const iconSymbolId = mapConditionToIcon(condCode, iconCode);
    elements.heroIcon.querySelector('use').setAttribute('href', iconSymbolId);

    // Weather Summary
    elements.weatherSummary.textContent = generateInsightSummary(cur, data.units);
    elements.lastUpdated.textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 5. Wind & Compass
    const windSpeed = cur.wind_speed;
    elements.windSpeedVal.textContent = windSpeed;
    elements.windUnit.textContent = speedUnit;
    const deg = cur.wind_deg || 0;
    elements.windCardinal.textContent = `${getWindCardinal(deg)} · ${deg}°`;
    elements.compassNeedle.style.transform = `rotate(${deg}deg)`;

    if (cur.wind_gust) {
      elements.windGustVal.textContent = `${cur.wind_gust} ${speedUnit}`;
      document.getElementById('wind-gust-row').hidden = false;
    } else {
      document.getElementById('wind-gust-row').hidden = true;
    }

    // 6. Solar Arc Trajectory
    renderSolarArc(cur.sunrise, cur.sunset, loc.timezone || 0);

    // 7. Hourly Rail (24 Hours)
    renderHourlyRail(data.hourly || [], loc.timezone || 0, tempSymbol);

    // 8. Multi-Day Outlook (5, 7, or 10 Days)
    renderDailyList(data.daily || [], tempSymbol);

    // 9. Precision Matrix Metrics
    renderMatrixMetrics(cur, isMetric);

    // Footer info
    elements.footerStationInfo.textContent = `Station: ${loc.name} · Coordinates (${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)})`;

    // Show dashboard and hide states
    elements.dashboard.hidden = false;
    elements.errorState.hidden = true;
    elements.loadingState.hidden = true;
  }

  // ---------------------------------------------------------------------------
  // Local Clock & Solar Trajectory
  // ---------------------------------------------------------------------------
  function startLocalClock(tzOffsetSeconds) {
    if (state.clockInterval) clearInterval(state.clockInterval);

    function update() {
      const nowUtc = Date.now() + new Date().getTimezoneOffset() * 60000;
      const targetTime = new Date(nowUtc + tzOffsetSeconds * 1000);
      const dayName = targetTime.toLocaleDateString('en-US', { weekday: 'long' });
      const timeStr = targetTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      elements.timeText.textContent = `${dayName}, ${timeStr}`;
    }

    update();
    state.clockInterval = setInterval(update, 30000);
  }

  function renderSolarArc(sunriseUnix, sunsetUnix, tzOffsetSeconds) {
    if (!sunriseUnix || !sunsetUnix) {
      elements.daylightRemaining.textContent = 'Solar schedule unavailable';
      elements.sunriseVal.textContent = '—';
      elements.sunsetVal.textContent = '—';
      return;
    }

    function formatTime(unix) {
      const d = new Date((unix + tzOffsetSeconds) * 1000);
      return d.toUTCString().slice(17, 22);
    }

    elements.sunriseVal.textContent = formatTime(sunriseUnix);
    elements.sunsetVal.textContent = formatTime(sunsetUnix);

    const nowUnix = Math.floor(Date.now() / 1000);
    const totalDaylight = sunsetUnix - sunriseUnix;
    const elapsed = nowUnix - sunriseUnix;

    let progressRatio = 0;
    if (nowUnix < sunriseUnix) {
      progressRatio = 0;
      const untilSun = Math.max(0, Math.floor((sunriseUnix - nowUnix) / 3600));
      elements.daylightRemaining.textContent = `Sunrise in ~${untilSun} hours`;
    } else if (nowUnix > sunsetUnix) {
      progressRatio = 1;
      const afterSun = Math.max(0, Math.floor((nowUnix - sunsetUnix) / 3600));
      elements.daylightRemaining.textContent = `Sunset was ~${afterSun}h ago`;
    } else {
      progressRatio = Math.max(0, Math.min(1, elapsed / totalDaylight));
      const hoursRemaining = Math.floor((sunsetUnix - nowUnix) / 3600);
      const minsRemaining = Math.floor(((sunsetUnix - nowUnix) % 3600) / 60);
      elements.daylightRemaining.textContent = `${hoursRemaining}h ${minsRemaining}m daylight remaining`;
    }

    const theta = Math.PI * (1 - progressRatio);
    const cx = 100 + 80 * Math.cos(theta);
    const cy = 90 - 70 * Math.sin(theta);

    elements.sunMarkerDot.setAttribute('cx', cx.toFixed(1));
    elements.sunMarkerDot.setAttribute('cy', cy.toFixed(1));
  }

  // ---------------------------------------------------------------------------
  // Hourly Forecast Strip
  // ---------------------------------------------------------------------------
  function renderHourlyRail(hourlyList, tzOffsetSeconds, tempSymbol) {
    elements.hourlyRail.innerHTML = '';

    if (!hourlyList.length) {
      elements.hourlyRail.innerHTML = '<p class="field-hint">Hourly forecast unavailable.</p>';
      return;
    }

    hourlyList.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `hour-card ${index === 0 ? 'active-hour' : ''}`;

      let timeLabel = 'Now';
      if (index > 0) {
        const d = new Date((item.dt + tzOffsetSeconds) * 1000);
        timeLabel = d.toUTCString().slice(17, 22);
      }

      const iconCode = item.condition?.icon || '01d';
      const condId = item.condition?.id || 800;
      const iconHref = mapConditionToIcon(condId, iconCode);

      card.innerHTML = `
        <span class="hour-time">${timeLabel}</span>
        <svg class="icon hour-icon"><use href="${iconHref}"/></svg>
        <span class="hour-temp">${Math.round(item.temp)}${tempSymbol}</span>
        ${item.pop > 10 ? `
          <span class="hour-pop">
            <svg class="icon"><use href="#i-drop"/></svg>
            ${item.pop}%
          </span>
        ` : `
          <span class="hour-pop" style="opacity: 0.35;">${item.wind_speed} <small>w</small></span>
        `}
      `;

      elements.hourlyRail.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------------
  // Multi-Day Outlook (5, 7, or 10 Days)
  // ---------------------------------------------------------------------------
  function renderDailyList(dailyList, tempSymbol) {
    elements.dailyList.innerHTML = '';

    const labelMap = { 5: '5-Day Precision Outlook', 7: '7-Day Week Outlook', 10: '10-Day Extended Outlook' };
    elements.forecastHeading.textContent = labelMap[state.forecastDays] || `${dailyList.length}-Day Outlook`;

    if (!dailyList.length) {
      elements.dailyList.innerHTML = '<p class="field-hint">Forecast unavailable.</p>';
      return;
    }

    // Determine overall period min and max to scale range bars
    const allMins = dailyList.map(d => d.temp_min);
    const allMaxs = dailyList.map(d => d.temp_max);
    const periodMin = Math.min(...allMins);
    const periodMax = Math.max(...allMaxs);
    const periodRange = Math.max(1, periodMax - periodMin);

    dailyList.forEach((day, index) => {
      const row = document.createElement('div');
      row.className = 'daily-row';

      let dayName = 'Today';
      if (index === 1) {
        dayName = 'Tomorrow';
      } else if (index > 1) {
        const d = new Date(day.date + 'T12:00:00');
        dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      }

      const dateParts = day.date.split('-');
      const formattedDate = `${dateParts[1]}/${dateParts[2]}`;

      const iconHref = mapConditionToIcon(day.condition?.id || 800, day.condition?.icon || '01d');
      const condDesc = day.condition?.description || 'Clear';

      const leftPercent = Math.max(0, ((day.temp_min - periodMin) / periodRange) * 100);
      const widthPercent = Math.max(15, ((day.temp_max - day.temp_min) / periodRange) * 100);

      row.innerHTML = `
        <div>
          <div class="daily-name">${dayName}</div>
          <div class="daily-date">${formattedDate}</div>
        </div>
        <div class="daily-condition">
          <svg class="icon"><use href="${iconHref}"/></svg>
          <span>${condDesc}</span>
        </div>
        <div class="daily-temp-bar-wrapper">
          <span class="temp-label">${Math.round(day.temp_min)}°</span>
          <div class="temp-bar-track">
            <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
          </div>
          <span class="temp-label high">${Math.round(day.temp_max)}°</span>
        </div>
        <div class="daily-pop-pill">
          ${day.pop > 15 ? `
            <svg class="icon"><use href="#i-drop"/></svg>
            ${day.pop}%
          ` : `
            <span style="opacity: 0.25;">—</span>
          `}
        </div>
      `;

      elements.dailyList.appendChild(row);
    });
  }

  // ---------------------------------------------------------------------------
  // Precision Matrix Metrics
  // ---------------------------------------------------------------------------
  function renderMatrixMetrics(cur, isMetric) {
    const humidity = cur.humidity || 50;
    elements.humidityVal.textContent = `${humidity}%`;
    elements.humidityBar.style.width = `${humidity}%`;
    
    let humidTag = 'Normal';
    if (humidity > 70) humidTag = 'Humid';
    else if (humidity < 35) humidTag = 'Dry';
    elements.humidityTag.textContent = humidTag;

    const t = cur.temp;
    const dewPoint = Math.round(t - ((100 - humidity) / 5));
    elements.dewPointVal.textContent = `The dew point is approx ${dewPoint}° right now.`;

    const pressure = cur.pressure || 1013;
    elements.pressureVal.textContent = pressure;
    const pressureRatio = Math.max(0, Math.min(100, ((pressure - 970) / 80) * 100));
    elements.pressureNeedle.style.left = `${pressureRatio}%`;

    let pressText = 'Normal atmospheric stability.';
    if (pressure > 1022) pressText = 'High pressure system · Stable sky.';
    else if (pressure < 1005) pressText = 'Low pressure system · Weather unsettled.';
    elements.pressureTag.textContent = pressText;

    const visMeters = cur.visibility || 10000;
    if (isMetric) {
      const visKm = Math.round(visMeters / 1000);
      elements.visibilityVal.textContent = visKm >= 10 ? '10+' : visKm;
      elements.visibilityUnit.textContent = 'km';
    } else {
      const visMiles = Math.round(visMeters * 0.000621371);
      elements.visibilityVal.textContent = visMiles >= 6 ? '6+' : visMiles;
      elements.visibilityUnit.textContent = 'mi';
    }

    let visLabel = 'Crystal clear horizon.';
    if (visMeters < 2000) visLabel = 'Dense fog or heavy precipitation.';
    else if (visMeters < 5000) visLabel = 'Moderate haze or mist.';
    elements.visibilityTag.textContent = visLabel;

    const clouds = cur.clouds || 0;
    elements.cloudsVal.textContent = `${clouds}%`;
    elements.cloudsBar.style.width = `${clouds}%`;
    
    let cloudsText = 'Mostly clear skies.';
    if (clouds > 80) cloudsText = 'Heavy overcast cloud blanket.';
    else if (clouds > 40) cloudsText = 'Scattered cloud formations.';
    elements.cloudsTag.textContent = cloudsText;
  }

  // ---------------------------------------------------------------------------
  // Recent Cities Store
  // ---------------------------------------------------------------------------
  function addRecentCity(cityName) {
    if (!cityName) return;
    const filtered = state.recentCities.filter(c => c.toLowerCase() !== cityName.toLowerCase());
    filtered.unshift(cityName);
    state.recentCities = filtered.slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(state.recentCities));
    renderRecentCities();
  }

  function renderRecentCities() {
    if (!state.recentCities.length) {
      elements.recentGroup.hidden = true;
      return;
    }
    elements.recentGroup.hidden = false;
    elements.recentRail.innerHTML = '';
    state.recentCities.forEach(city => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip recent-chip';
      btn.textContent = city;
      btn.addEventListener('click', () => {
        elements.searchInput.value = city;
        fetchWeather({ city });
      });
      elements.recentRail.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // Location Permission Modal Logic
  // ---------------------------------------------------------------------------
  function showLocationModal() {
    elements.locModal.hidden = false;
  }

  function hideLocationModal() {
    elements.locModal.hidden = true;
  }

  // ---------------------------------------------------------------------------
  // UI Helpers (Status, Loading, Notices, Toasts)
  // ---------------------------------------------------------------------------
  function setLoading(loading, message = 'Synchronizing Live Meteorological Radar...') {
    state.isLoading = loading;
    elements.loadingLabel.textContent = message;
    elements.loadingState.hidden = !loading;
    if (loading) {
      elements.dashboard.style.opacity = '0.5';
    } else {
      elements.dashboard.style.opacity = '1';
    }
  }

  function showNotice(msg) {
    elements.noticeMessage.textContent = msg;
    elements.noticeBanner.hidden = false;
  }

  function hideNotice() {
    elements.noticeBanner.hidden = true;
  }

  function showError(title, detail) {
    elements.errorTitle.textContent = title;
    elements.errorDetail.textContent = detail;
    elements.errorState.hidden = false;
    elements.dashboard.hidden = true;
  }

  function hideError() {
    elements.errorState.hidden = true;
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="icon" style="color: var(--accent-cyan);"><use href="#i-pin"/></svg>
      <span>${message}</span>
    `;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  // ---------------------------------------------------------------------------
  // 3D Parallax Tilt Effect on Hero Card
  // ---------------------------------------------------------------------------
  function setupHeroCard3DTilt() {
    const card = elements.heroCard;
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  }

  // ---------------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    // Search Form Submit
    elements.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = elements.searchInput.value.trim();
      if (!query) return;

      // Coordinate detection (e.g. "40.7128, -74.0060" or "40.7128 -74.0060")
      const coordMatch = query.match(/^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);
        fetchWeather({ lat, lon });
      } else {
        fetchWeather({ city: query });
      }
    });

    // Clear input
    elements.searchInput.addEventListener('input', () => {
      elements.clearInputBtn.hidden = !elements.searchInput.value.trim();
    });

    elements.clearInputBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.clearInputBtn.hidden = true;
      elements.searchInput.focus();
    });

    // In-App "My Location" Button -> Opens In-App Permission Dialog
    elements.geoBtn.addEventListener('click', () => {
      showLocationModal();
    });

    // Modal Action 1: Grant GPS Permission
    elements.locModalGpsBtn.addEventListener('click', () => {
      hideLocationModal();

      if (!navigator.geolocation) {
        showToast('Browser GPS unavailable — auto-detecting via network...');
        detectLocationViaIP();
        return;
      }

      showToast('Acquiring high-accuracy station GPS coordinates...');
      setLoading(true, 'Requesting device satellite telemetry...');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchWeather({ lat: latitude, lon: longitude });
        },
        (err) => {
          console.warn('[Browser GPS Denied/Failed]', err);
          showToast('GPS access denied by browser; automatically locking via network IP...');
          detectLocationViaIP();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });

    // Modal Action 2: Auto-Detect via Network (IP)
    elements.locModalIpBtn.addEventListener('click', () => {
      detectLocationViaIP();
    });

    // Modal Close / Cancel
    elements.locModalCancelBtn.addEventListener('click', hideLocationModal);
    elements.locModalCloseIcon.addEventListener('click', hideLocationModal);
    elements.locModal.addEventListener('click', (e) => {
      if (e.target === elements.locModal) hideLocationModal();
    });

    // Forecast Duration Range Selector Tabs (5 Days, 7 Days, 10 Days)
    elements.rangeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const days = parseInt(tab.dataset.days, 10);
        if (state.forecastDays === days) return;

        state.forecastDays = days;
        localStorage.setItem(STORAGE_KEYS.DAYS, days);

        elements.rangeTabs.forEach(t => t.classList.toggle('active', parseInt(t.dataset.days, 10) === days));

        if (state.currentLocation?.lat !== undefined && state.currentLocation?.lon !== undefined) {
          fetchWeather({ lat: state.currentLocation.lat, lon: state.currentLocation.lon, days });
        } else if (state.currentLocation?.name) {
          fetchWeather({ city: state.currentLocation.name, days });
        }
      });
    });

    // Live FX Animation Toggle
    elements.animToggleBtn.addEventListener('click', () => {
      state.fxActive = !state.fxActive;
      localStorage.setItem(STORAGE_KEYS.FX_ACTIVE, state.fxActive);

      elements.animToggleBtn.classList.toggle('paused', !state.fxActive);
      elements.animToggleText.textContent = state.fxActive ? 'LIVE FX' : 'FX OFF';

      if (state.fxActive && fxEngine) {
        fxEngine.start();
        showToast('Live meteorological simulation enabled');
      } else if (fxEngine) {
        fxEngine.stop();
        showToast('Live animation paused');
      }
    });

    // Popular cities clicks
    elements.popularRail.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const city = chip.dataset.city;
      if (city) {
        elements.searchInput.value = city;
        elements.clearInputBtn.hidden = false;
        fetchWeather({ city });
      }
    });

    // Unit toggle buttons
    elements.unitC.addEventListener('click', () => setUnits('metric'));
    elements.unitF.addEventListener('click', () => setUnits('imperial'));

    function setUnits(newUnit) {
      if (state.units === newUnit) return;
      state.units = newUnit;
      localStorage.setItem(STORAGE_KEYS.UNITS, newUnit);
      elements.unitC.classList.toggle('active', newUnit === 'metric');
      elements.unitF.classList.toggle('active', newUnit === 'imperial');

      if (state.weatherData) {
        if (state.currentLocation?.lat !== undefined && state.currentLocation?.lon !== undefined) {
          fetchWeather({ lat: state.currentLocation.lat, lon: state.currentLocation.lon });
        } else if (state.currentLocation?.name) {
          fetchWeather({ city: state.currentLocation.name });
        }
      }
      showToast(`Units switched to °${newUnit === 'metric' ? 'C' : 'F'}`);
    }

    // Retry and Demo fallback in error card
    elements.btnRetry.addEventListener('click', () => {
      const query = elements.searchInput.value.trim() || 'London';
      fetchWeather({ city: query });
    });

    elements.btnDemoFallback.addEventListener('click', () => {
      fetchWeather({ city: 'Tokyo' });
    });

    // Refresh button
    elements.refreshBtn.addEventListener('click', () => {
      if (state.currentLocation?.name) {
        fetchWeather({ city: state.currentLocation.name });
      } else {
        fetchWeather({ city: 'London' });
      }
    });

    // Notice Dismiss
    elements.noticeDismiss.addEventListener('click', hideNotice);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !elements.locModal.hidden) {
        hideLocationModal();
      }
      if (e.key === '/' && document.activeElement !== elements.searchInput) {
        e.preventDefault();
        elements.searchInput.focus();
        elements.searchInput.select();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  async function init() {
    // Initial unit toggle
    elements.unitC.classList.toggle('active', state.units === 'metric');
    elements.unitF.classList.toggle('active', state.units === 'imperial');

    // Forecast duration tabs initial active state
    elements.rangeTabs.forEach((tab) => {
      tab.classList.toggle('active', parseInt(tab.dataset.days, 10) === state.forecastDays);
    });

    // Initialize Canvas FX Engine
    if (elements.animCanvas) {
      fxEngine = new AtmosphericWeatherEngine(elements.animCanvas);
      if (state.fxActive) {
        fxEngine.start();
      } else {
        elements.animToggleBtn.classList.add('paused');
        elements.animToggleText.textContent = 'FX OFF';
      }
    }

    // Setup 3D card tilt
    setupHeroCard3DTilt();

    renderRecentCities();
    attachEventListeners();

    // Load initial city
    const initialCity = localStorage.getItem(STORAGE_KEYS.LAST_CITY) || 'London';
    elements.searchInput.value = initialCity;
    elements.clearInputBtn.hidden = false;
    fetchWeather({ city: initialCity, days: state.forecastDays });
  }

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
