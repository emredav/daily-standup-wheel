/**
 * Daily Standup Wheel
 * State Management & Persistence
 */

let state = {
    members: [], // { name: string, active: boolean }
    timerSettings: {
        enabled: true,
        duration: 120
    },
    settings: {
        winnerAction: 'auto', // Default to auto
        hideNames: false,
        funnyMode: false
    },
    lastWinnerIndex: -1, // Persist pending winner removal for auto mode
    elapsedStartTime: null // timestamp when first spin happened
};

let wheel = {
    rotation: 0,
    velocity: 0,
    isSpinning: false,
    ctx: null,
    canvas: null,
    size: 0,
    center: 0
};

let timer = {
    intervalId: null,
    remainingTime: 120,
    isRunning: false
};

let elapsedTimer = {
    intervalId: null
};

// --- PERSISTENCE ---

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);

            // Migration: Convert old 'names' array to 'members' object array
            if (parsed.names && Array.isArray(parsed.names)) {
                parsed.members = parsed.names.map(name => ({ name, active: true }));
                delete parsed.names;
            }

            state = { ...state, ...parsed };
            // Ensure timer duration is valid
            timer.remainingTime = state.timerSettings.duration;
            updateTimerUIFromState();
        } catch (e) {
            console.error('Failed to load state', e);
        }
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function factoryReset() {
    if (confirm('Are you sure you want to reset all settings and names? This action cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

function updateTimerUIFromState() {
    const toggle = document.getElementById('timer-toggle');
    const duration = document.getElementById('timer-duration');
    if (toggle) toggle.checked = state.timerSettings.enabled;
    if (duration) duration.value = state.timerSettings.duration;
}
