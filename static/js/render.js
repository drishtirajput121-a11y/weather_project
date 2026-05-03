/* ============================================================
   RENDER — UI, Charts, Map & Rendering
   ============================================================ */

import { $, $$, iconURL, capitalize, calculateDewPoint, getWindDir, getSummaryText } from './utils.js';

// ── State ──
export let currentCity = 'Delhi';
let hourlyChart = null;
let weatherMap = null;

export function setCurrentCity(city) {
    currentCity = city;
}

// ── Search ──
export function initSearch(onSearch) {
    const input = $('#search-city');
    const btn = $('#search-btn');

    const doSearch = () => {
        const city = input.value.trim();
        if (city) {
            setCurrentCity(city);
            onSearch(city);
            input.blur();
        }
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doSearch();
    });
    btn.addEventListener('click', doSearch);
}

// ── Tab Switching ──
export function initTabs() {
    $$('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach((b) => b.classList.remove('tab-btn--active'));
            btn.classList.add('tab-btn--active');

            const tab = btn.dataset.tab;
            $$('.tab-content').forEach((tc) => {
                tc.style.display = tc.id === `tab-${tab}` ? 'block' : 'none';
            });
        });
    });
}

// ── Render Current Weather ──
export function renderCurrentWeather(data) {
    const container = $('#current-weather');
    if (!container || !data || !data.main) return;

    const temp = Math.round(data.main.temp || 0);
    const feelsLike = Math.round(data.main.feels_like || data.main.temp || 0);
    const desc = (data.weather && data.weather[0]?.description) || data.weather?.[0]?.main || 'N/A';
    const icon = (data.weather && data.weather[0]?.icon) || '01d';
    const high = Math.round(data.main.temp_max || data.main.temp || 0);
    const wind = data.wind?.speed || 0;
    const windDeg = data.wind?.deg;
    const humidity = data.main.humidity || 0;
    const pressure = data.main.pressure || 0;
    const visibility = data.visibility ? (data.visibility / 1000).toFixed(1) : '—';
    const dewPoint = (data.main.temp && data.main.humidity)
        ? calculateDewPoint(data.main.temp, data.main.humidity) : '—';
    const now = new Date();

    container.innerHTML = `
        <div class="current-header">
            <span class="current-header__label">Current weather</span>
            <span class="current-header__time">${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="current-main">
            <img class="current-main__icon" src="${iconURL(icon, '4x')}" alt="${desc}" />
            <div>
                <div class="current-main__temp">${temp}°<sup>C</sup></div>
            </div>
            <div class="current-main__details">
                <div class="current-main__desc">${capitalize(desc)}</div>
                <div class="current-main__feels">Feels like ${feelsLike}°</div>
            </div>
        </div>
        <p class="current-summary">
            ${getSummaryText(desc, high, temp)}
        </p>
        <div class="metrics-row" id="metrics-row">
            <div class="metric-chip" id="aqi-chip">
                <div>
                    <div class="metric-chip__label">Air quality</div>
                    <div class="metric-chip__value" id="aqi-value">—</div>
                </div>
            </div>
            <div class="metric-chip">
                <div>
                    <div class="metric-chip__label">Wind</div>
                    <div class="metric-chip__value">${wind} km/h ${getWindDir(windDeg)}</div>
                </div>
            </div>
            <div class="metric-chip">
                <div>
                    <div class="metric-chip__label">Humidity</div>
                    <div class="metric-chip__value">${humidity}%</div>
                </div>
            </div>
            <div class="metric-chip">
                <div>
                    <div class="metric-chip__label">Visibility</div>
                    <div class="metric-chip__value">${visibility} km</div>
                </div>
            </div>
            <div class="metric-chip">
                <div>
                    <div class="metric-chip__label">Pressure</div>
                    <div class="metric-chip__value">${pressure} mb</div>
                </div>
            </div>
            <div class="metric-chip">
                <div>
                    <div class="metric-chip__label">Dew point</div>
                    <div class="metric-chip__value">${dewPoint}°</div>
                </div>
            </div>
        </div>
    `;
    container.classList.add('animate-in');
}

// ── Render AQI ──
export function renderAQI(data) {
    const chip = $('#aqi-chip');
    if (!chip || !data.list || !data.list.length) return;

    const aqi = data.list[0].main.aqi;
    const labels = ['—', 'Good', 'Fair', 'Moderate', 'Poor', 'Hazardous'];
    const classes = ['', 'good', 'fair', 'moderate', 'poor', 'hazardous'];

    chip.className = `metric-chip metric-chip--aqi-${classes[aqi] || ''}`;
    const valueEl = chip.querySelector('#aqi-value');
    if (valueEl) {
        valueEl.textContent = `${labels[aqi] || '—'} (${aqi})`;
    }
}

// ── Update Nav City Display ──
export function updateNavCity(data) {
    const display = $('#nav-city-display');
    if (!display || !data) return;

    const icon = data.weather?.[0]?.icon || '01d';
    const name = data.name || currentCity;
    const temp = Math.round(data.main?.temp || 0);

    display.innerHTML = `
        <img src="${iconURL(icon)}" width="28" height="28" alt="" />
        ${name}
        <span class="temp-badge">${temp}°</span>
    `;
    document.title = `${name} Weather — ${temp}°C | Weather Dashboard`;
}

// ── Render 5-Day Forecast ──
export function renderForecast(data) {
    const container = $('#forecast-row');
    if (!container || !data.list) return;

    const dailyMap = {};
    data.list.forEach((item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap[date]) dailyMap[date] = [];
        dailyMap[date].push(item);
    });

    const days = Object.entries(dailyMap).slice(0, 7);
    const today = new Date().toISOString().split('T')[0];

    container.innerHTML = days
        .map(([date, entries], i) => {
            const temps = entries.map((e) => e.main.temp);
            const high = Math.round(Math.max(...temps));
            const low = Math.round(Math.min(...temps));
            const midEntry = entries[Math.floor(entries.length / 2)];
            const icon = midEntry.weather?.[0]?.icon || '01d';
            const d = new Date(date);
            const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
            const dateNum = d.getDate();
            const isToday = date === today;

            return `
                <div class="forecast-day ${isToday ? 'forecast-day--today' : ''} animate-in" style="animation-delay: ${i * 0.05}s">
                    <div class="forecast-day__date">${dateNum}</div>
                    <div class="forecast-day__name">${isToday ? 'Today' : dayName}</div>
                    <img class="forecast-day__icon" src="${iconURL(icon)}" alt="" />
                    <div class="forecast-day__temp-high">${high}°</div>
                    <div class="forecast-day__temp-low">${low}°</div>
                </div>
            `;
        })
        .join('');
}

// ── Render Hourly Chart ──
export function renderHourlyChart(data) {
    const ctx = document.getElementById('hourly-chart');
    if (!ctx || !data.list) return;

    const next24 = data.list.slice(0, 8);
    const labels = next24.map((item) => {
        const d = new Date(item.dt * 1000);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    });
    const temps = next24.map((item) => Math.round(item.main.temp));
    const feelsLike = next24.map((item) => Math.round(item.main.feels_like || item.main.temp));

    if (hourlyChart) hourlyChart.destroy();

    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Temperature °C',
                    data: temps,
                    borderColor: '#ff8c42',
                    backgroundColor: createGradient(ctx, '#ff8c42', 'rgba(255,140,66,0.05)'),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointBackgroundColor: '#ff8c42',
                    pointBorderColor: '#0b1120',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Feels Like °C',
                    data: feelsLike,
                    borderColor: 'rgba(74, 158, 255, 0.5)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    borderWidth: 1.5,
                    pointRadius: 0,
                },
            ],
        },
        options: chartOptions('°C'),
    });

    renderHourlyItems(next24);
}

function renderHourlyItems(items) {
    const container = $('#hourly-items');
    if (!container) return;

    container.innerHTML = items
        .map((item, i) => {
            const d = new Date(item.dt * 1000);
            const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const isNow = i === 0;
            const icon = item.weather?.[0]?.icon || '01d';
            return `
                <div class="hourly-item ${isNow ? 'hourly-item--now' : ''}">
                    <div class="hourly-item__time">${isNow ? 'Now' : timeStr}</div>
                    <img class="hourly-item__icon" src="${iconURL(icon)}" alt="" />
                    <div class="hourly-item__temp">${Math.round(item.main.temp)}°</div>
                </div>
            `;
        })
        .join('');
}

// ── Map ──
export function initMap(coord) {
    if (!coord) return;
    const mapEl = document.getElementById('weather-map');
    if (!mapEl) return;

    if (weatherMap) {
        weatherMap.setView([coord.lat, coord.lon], 8);
    } else {
        weatherMap = L.map('weather-map', {
            zoomControl: false,
            attributionControl: false,
        }).setView([coord.lat, coord.lon], 8);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
        }).addTo(weatherMap);

        L.control.zoom({ position: 'topright' }).addTo(weatherMap);
    }

    L.marker([coord.lat, coord.lon])
        .addTo(weatherMap)
        .bindPopup(`<strong>${currentCity}</strong>`)
        .openPopup();
}

// ── Chart Helpers ──
function chartOptions(unit) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
            legend: {
                labels: {
                    color: '#8892b0',
                    font: { family: "'Inter', sans-serif", size: 11 },
                    boxWidth: 12,
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 22, 45, 0.95)',
                titleColor: '#f0f4ff',
                bodyColor: '#8892b0',
                borderColor: 'rgba(74, 158, 255, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                titleFont: { family: "'Inter', sans-serif", weight: '600' },
                bodyFont: { family: "'Inter', sans-serif" },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#5a6380', font: { size: 10 }, maxRotation: 45 },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: {
                    color: '#5a6380',
                    font: { size: 10 },
                    callback: (value) => value + unit,
                },
            },
        },
    };
}

function createGradient(ctx, color, fadeColor) {
    const canvas = ctx.getContext ? ctx : ctx.canvas || ctx;
    const context = canvas.getContext ? canvas.getContext('2d') : null;
    if (!context) return color;

    const gradient = context.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
    gradient.addColorStop(1, fadeColor);
    return gradient;
}

// ── Feedback ──
export function showLoading(show) {
    const overlay = $('#loading-overlay');
    if (overlay) {
        overlay.classList.toggle('loading-overlay--hidden', !show);
    }
}

export function showToast(message) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('toast--visible');
    setTimeout(() => toast.classList.remove('toast--visible'), 4000);
}
