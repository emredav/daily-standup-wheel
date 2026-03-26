/**
 * Daily Standup Wheel
 * Configuration & Constants
 */

const STORAGE_KEY = 'antigravity_wheel_data_v1';
const CANVAS_ID = 'wheel-canvas';
const PI2 = Math.PI * 2;

const COLORS = [
    '#00F0FF', // Cyan
    '#FF0099', // Magenta
    '#CCFF00', // Lime
    '#9D00FF', // Purple
    '#FFD600', // Yellow
    '#FF3D00'  // Red-Orange
];

// We map messages by index because updateDailySubtitle() uses Date.getDay(),
// which returns values from 0 to 6 where 0 = Sunday and 6 = Saturday.
const DAILY_MESSAGES = [
    "SUNDAY!", // 0 Sunday
    "Have a great day!", // 1 Monday
    "Another day, another commit!", // 2 Tuesday
    "Think twice, code once.", // 3 Wednesday
    "Stay awesome, team!", // 4 Thursday
    "Make today amazing!", // 5 Friday
    "SATURDAY!", // 6 Saturday
];
