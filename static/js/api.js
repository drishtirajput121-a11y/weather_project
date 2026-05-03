/* ============================================================
   API — Data Fetching Logic
   ============================================================ */

import { API_BASE } from './utils.js';
import { 
    renderCurrentWeather, 
    updateNavCity, 
    initMap, 
    renderForecast, 
    renderHourlyChart, 
    renderAQI, 
    showLoading, 
    showToast 
} from './render.js';

let isFetching = false;

export async function fetchAllData(city) {
    if (isFetching) return;
    isFetching = true;
    showLoading(true);

    try {
        const [current, forecast, aqi] = await Promise.allSettled([
            fetchJSON(`${API_BASE}/current/?city=${encodeURIComponent(city)}`),
            fetchJSON(`${API_BASE}/forecast/?city=${encodeURIComponent(city)}`),
            fetchJSON(`${API_BASE}/air-quality/?city=${encodeURIComponent(city)}`),
        ]);

        if (current.status === 'fulfilled' && current.value && !current.value.error) {
            renderCurrentWeather(current.value);
            updateNavCity(current.value);
            initMap(current.value.coord);
        } else {
            const errMsg = current.status === 'fulfilled'
                ? (current.value?.error || 'City not found.')
                : 'Failed to fetch weather data.';
            showToast(errMsg);
        }

        if (forecast.status === 'fulfilled' && forecast.value && !forecast.value.error) {
            renderForecast(forecast.value);
            renderHourlyChart(forecast.value);
        }

        if (aqi.status === 'fulfilled' && aqi.value && !aqi.value.error) {
            renderAQI(aqi.value);
        }
    } catch (e) {
        console.error('[ERROR] fetchAllData:', e);
        showToast('Something went wrong. Please try again.');
    }

    showLoading(false);
    isFetching = false;
}

async function fetchJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        try {
            const errData = await resp.json();
            return errData;
        } catch {
            throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
    }
    return resp.json();
}

export function getIsFetching() {
    return isFetching;
}
