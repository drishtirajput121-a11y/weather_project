/* ============================================================
   UTILS — Helper Functions & Config
   ============================================================ */

export const API_BASE = '/api';

export const iconURL = (code, size = '2x') =>
    `https://openweathermap.org/img/wn/${code || '01d'}@${size}.png`;

export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

export function capitalize(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function calculateDewPoint(temp, humidity) {
    if (!temp || !humidity) return 0;
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    return Math.round((b * alpha) / (a - alpha));
}

export function getWindDir(deg) {
    if (deg == null) return '';
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

export function getSummaryText(desc, high, current) {
    if (!desc) return `Currently ${current}°. High will be ${high}°.`;
    const d = desc.toLowerCase();
    if (d.includes('clear') || d.includes('sunny'))
        return `Expect sunny skies. The high will be ${high}°.`;
    if (d.includes('cloud'))
        return `Partly cloudy skies expected. High of ${high}°.`;
    if (d.includes('rain') || d.includes('drizzle'))
        return `Rain expected today. Carry an umbrella. High of ${high}°.`;
    if (d.includes('thunder'))
        return `Thunderstorms possible. Stay indoors. High of ${high}°.`;
    if (d.includes('snow'))
        return `Snowfall expected. Bundle up! High of ${high}°.`;
    if (d.includes('mist') || d.includes('fog') || d.includes('haze'))
        return `Low visibility due to ${desc}. High of ${high}°.`;
    return `Currently ${current}° with ${desc}. High will be ${high}°.`;
}
