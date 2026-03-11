/**
 * Daily Standup Wheel
 * Funny Mode — Disco Lights, Whistle Sound, Meme Labels
 */

// --- EMOJI / MEME POOL ---
const FUNNY_LABELS = [
    '🍕', '☕', '🏃‍♂️', '😴', '🐛', '🔥', '💀', '🎮',
    '🤖', '👀', '🚀', '🦄', '🌮', '🍔', '🎸', '🧠',
    '😎', '🤡', '👻', '🎯'
];

// --- DISCO LIGHTS ---
let discoIntervalId = null;
const DISCO_NEON_COLORS = [
    '#ff00ff', '#00ffff', '#ffff00', '#ff3300',
    '#33ff00', '#ff6600', '#9900ff', '#00ff99',
    '#ff0066', '#33ccff', '#66ff00', '#ffcc00'
];

function startDiscoLights() {
    if (discoIntervalId) return;
    let colorIndex = 0;

    discoIntervalId = setInterval(() => {
        const c1 = DISCO_NEON_COLORS[colorIndex % DISCO_NEON_COLORS.length];
        const c2 = DISCO_NEON_COLORS[(colorIndex + 3) % DISCO_NEON_COLORS.length];
        const c3 = DISCO_NEON_COLORS[(colorIndex + 7) % DISCO_NEON_COLORS.length];

        document.body.style.setProperty('--disco-color-1', c1);
        document.body.style.setProperty('--disco-color-2', c2);
        document.body.style.setProperty('--disco-color-3', c3);

        colorIndex++;
    }, 400);
}

function stopDiscoLights() {
    if (discoIntervalId) {
        clearInterval(discoIntervalId);
        discoIntervalId = null;
    }
    document.body.style.removeProperty('--disco-color-1');
    document.body.style.removeProperty('--disco-color-2');
    document.body.style.removeProperty('--disco-color-3');
}

// --- WHISTLE SOUND (Web Audio API) ---
let whistleCtx = null;
let whistleOscillator = null;
let whistleGain = null;
let whistleIntervalId = null;

function initWhistleAudio() {
    if (!whistleCtx) {
        whistleCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playWhistleNote() {
    if (!whistleCtx) initWhistleAudio();

    const osc = whistleCtx.createOscillator();
    const gain = whistleCtx.createGain();

    osc.connect(gain);
    gain.connect(whistleCtx.destination);

    // Random whistle frequency for fun variation
    const baseFreq = 800 + Math.random() * 1200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, whistleCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(
        baseFreq + 200 + Math.random() * 400,
        whistleCtx.currentTime + 0.15
    );
    osc.frequency.linearRampToValueAtTime(
        baseFreq - 100,
        whistleCtx.currentTime + 0.3
    );

    // Volume envelope
    gain.gain.setValueAtTime(0, whistleCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, whistleCtx.currentTime + 0.03);
    gain.gain.linearRampToValueAtTime(0.06, whistleCtx.currentTime + 0.15);
    gain.gain.linearRampToValueAtTime(0, whistleCtx.currentTime + 0.3);

    osc.start(whistleCtx.currentTime);
    osc.stop(whistleCtx.currentTime + 0.3);
}

function startWhistle() {
    stopWhistle(); // Clear any existing
    initWhistleAudio();

    // Play whistle notes periodically
    playWhistleNote();
    whistleIntervalId = setInterval(() => {
        playWhistleNote();
    }, 250 + Math.random() * 150);
}

function stopWhistle() {
    if (whistleIntervalId) {
        clearInterval(whistleIntervalId);
        whistleIntervalId = null;
    }
}

// --- FUNNY LABEL ---
function getFunnyLabel(index) {
    return FUNNY_LABELS[index % FUNNY_LABELS.length];
}

// --- TOGGLE FUNNY MODE ---
function toggleFunnyMode(enabled) {
    if (enabled) {
        document.body.classList.add('funny-mode');
        startDiscoLights();
    } else {
        document.body.classList.remove('funny-mode');
        stopDiscoLights();
        stopWhistle();
    }

    // Update button appearance
    const btn = document.getElementById('funny-mode-btn');
    if (btn) {
        btn.classList.toggle('active', enabled);
    }
}

// --- TOAST NOTIFICATION ---
function showFunnyToast() {
    const toast = document.createElement('div');
    toast.className = 'funny-toast';
    toast.innerHTML = `
        <span class="toast-emoji">🎉</span>
        <span class="toast-text">Would you like to try Funny Mode with its fun design?</span>
    `;

    // Click to dismiss early
    toast.addEventListener('click', () => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    });

    document.body.appendChild(toast);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }
    }, 5000);
}
