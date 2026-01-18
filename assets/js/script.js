/**
 * Daily Standup Wheel - Antigravity Edition
 * Core Logic
 */

// --- CONFIG ---
const STORAGE_KEY = 'antigravity_wheel_data_v1';
const CANVAS_ID = 'wheel-canvas';
const COLORS = [
    '#00F0FF', // Cyan
    '#FF0099', // Magenta
    '#CCFF00', // Lime
    '#9D00FF', // Purple
    '#FFD600', // Yellow
    '#FF3D00'  // Red-Orange
];

// --- STATE ---
let state = {
    names: [],
    timerSettings: {
        enabled: true,
        duration: 120
    }
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

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    loadState();
    setupEventListeners();
    renderNamesList();
    updateTimerDisplay(state.timerSettings.duration);
    animate();
});

function initDOM() {
    wheel.canvas = document.getElementById(CANVAS_ID);
    if (!wheel.canvas) return;
    wheel.ctx = wheel.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    const container = wheel.canvas.parentElement;
    if (!container) return;

    // Safety check div size
    const size = Math.min(container.clientWidth, container.clientHeight) || 500;
    const dpr = window.devicePixelRatio || 1;

    wheel.canvas.width = size * dpr;
    wheel.canvas.height = size * dpr;
    wheel.canvas.style.width = size + 'px';
    wheel.canvas.style.height = size + 'px';

    // Normalize coordinate system
    wheel.ctx.setTransform(1, 0, 0, 1, 0, 0);
    wheel.ctx.scale(dpr, dpr);

    wheel.size = size;
    wheel.center = size / 2;
    drawWheel();
}

// --- PERSISTENCE ---
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
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

// --- WHEEL LOGIC ---
const PI2 = Math.PI * 2;

function spinWheel() {
    if (wheel.isSpinning) return;
    if (state.names.length === 0) {
        alert("Please add some team members first!");
        return;
    }

    // Reset winner display
    document.getElementById('winner-display').classList.add('hidden');
    document.getElementById('winner-name').textContent = '-';

    // Reset timer
    resetTimer(false);

    // Initial kick
    wheel.velocity = 0.3 + Math.random() * 0.2;
    wheel.isSpinning = true;
}

function updatePhysics() {
    if (!wheel.isSpinning) return;

    wheel.rotation += wheel.velocity;
    wheel.velocity *= 0.985; // Friction

    // Stop threshold
    if (wheel.velocity < 0.001) {
        wheel.isSpinning = false;
        wheel.velocity = 0;
        determineWinner();
    }
}

function drawWheel() {
    if (!wheel.ctx) return;
    const ctx = wheel.ctx;
    const count = state.names.length;

    ctx.clearRect(0, 0, wheel.size, wheel.size);

    if (count === 0) {
        ctx.beginPath();
        ctx.arc(wheel.center, wheel.center, wheel.center - 20, 0, PI2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.font = '20px Inter';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add Members', wheel.center, wheel.center);
        return;
    }

    const arcSize = PI2 / count;

    // Draw Segments
    for (let i = 0; i < count; i++) {
        const angle = wheel.rotation + (i * arcSize);

        ctx.beginPath();
        ctx.moveTo(wheel.center, wheel.center);
        ctx.arc(wheel.center, wheel.center, wheel.center - 10, angle, angle + arcSize);
        ctx.closePath();

        // Color
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();

        // Border
        ctx.strokeStyle = '#0B0C15'; // Match bg for separation
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(wheel.center, wheel.center);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Inter';
        // Truncate long names
        let label = state.names[i];
        if (label.length > 15) label = label.substring(0, 12) + '...';
        ctx.fillText(label, wheel.center - 40, 6);
        ctx.restore();
    }
}

function animate() {
    updatePhysics();
    drawWheel();
    requestAnimationFrame(animate);
}

function determineWinner() {
    const count = state.names.length;
    const arcSize = PI2 / count;

    let pointerAngle = (3 * Math.PI / 2) - wheel.rotation;
    pointerAngle = pointerAngle % PI2;
    if (pointerAngle < 0) pointerAngle += PI2;

    const winningIndex = Math.floor(pointerAngle / arcSize);
    const winnerName = state.names[winningIndex];

    document.getElementById('winner-name').textContent = winnerName;
    document.getElementById('winner-display').classList.remove('hidden');

    if (state.timerSettings.enabled) {
        startTimer();
    }
}

// --- TIMER LOGIC ---
function startTimer() {
    if (timer.isRunning) return;

    timer.isRunning = true;
    updateTimerIcons();

    timer.intervalId = setInterval(() => {
        timer.remainingTime--;
        updateTimerDisplay(timer.remainingTime);

        if (timer.remainingTime <= 0) {
            pauseTimer();
        }
    }, 1000);
}

function pauseTimer() {
    timer.isRunning = false;
    clearInterval(timer.intervalId);
    updateTimerIcons();
}

function resetTimer(autoUpdateDisplay = true) {
    pauseTimer();
    timer.remainingTime = state.timerSettings.duration;
    if (autoUpdateDisplay) updateTimerDisplay(timer.remainingTime);
}

function updateTimerDisplay(seconds) {
    const el = document.getElementById('time-display');
    if (!el) return;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
}

function updateTimerIcons() {
    const btn = document.getElementById('timer-play-pause');
    if (!btn) return;
    if (timer.isRunning) {
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    }
}

// --- LIST MANAGEMENT ---
function addMember(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('new-member-input');
    const name = input.value.trim();

    if (name) {
        state.names.push(name);
        saveState();
        renderNamesList();
        input.value = '';
        drawWheel(); // Redraw immediately
    }
}

// Make globally available for onclick
window.removeMember = function (index) {
    state.names.splice(index, 1);
    saveState();
    renderNamesList();
    drawWheel();
}

function renderNamesList() {
    const list = document.getElementById('members-list');
    if (!list) return;
    list.innerHTML = '';

    state.names.forEach((name, index) => {
        const li = document.createElement('li');
        li.className = 'member-item';

        li.innerHTML = `
            <span>${name}</span>
            <button class="btn remove-btn" onclick="removeMember(${index})">&times;</button>
        `;
        list.appendChild(li);
    });
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('spin-btn')?.addEventListener('click', spinWheel);

    document.getElementById('timer-toggle')?.addEventListener('change', (e) => {
        state.timerSettings.enabled = e.target.checked;
        saveState();
    });

    document.getElementById('timer-duration')?.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 120;
        state.timerSettings.duration = val;

        if (!timer.isRunning) {
            timer.remainingTime = val;
            updateTimerDisplay(timer.remainingTime);
        }
        saveState();
    });

    document.getElementById('timer-play-pause')?.addEventListener('click', () => {
        if (timer.isRunning) pauseTimer();
        else startTimer();
    });

    document.getElementById('timer-reset')?.addEventListener('click', () => resetTimer(true));

    document.getElementById('add-member-form')?.addEventListener('submit', addMember);

    document.getElementById('factory-reset')?.addEventListener('click', factoryReset);
}
