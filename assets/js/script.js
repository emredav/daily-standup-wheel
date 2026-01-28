/**
 * Daily Standup Wheel
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
    members: [], // { name: string, active: boolean }
    timerSettings: {
        enabled: true,
        duration: 120
    },
    settings: {
        winnerAction: 'auto', // Default to auto
        hideNames: false
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

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    loadState();
    setupEventListeners();
    renderNamesList();
    updateTimerDisplay(state.timerSettings.duration);
    if (state.elapsedStartTime) {
        startElapsedTimer();
    }
    updateElapsedDisplay(); // Initial draw
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

// --- WHEEL LOGIC ---
const PI2 = Math.PI * 2;

function spinWheel() {
    if (wheel.isSpinning) return;

    // --- REMOVAL LOGIC (delete winner after click spin button again) ---
    if (state.lastWinnerIndex !== -1) {
        // Only remove if we are still in auto mode or just cleaning up
        if (state.settings.winnerAction === 'auto') {
            if (state.members[state.lastWinnerIndex] && state.members[state.lastWinnerIndex].active) {
                state.members[state.lastWinnerIndex].active = false;
            }
        }
        state.lastWinnerIndex = -1;
        saveState();
        renderNamesList();
        drawWheel();
    }

    const activeMembers = state.members.filter(m => m.active);
    if (activeMembers.length === 0) {
        alert("Please add some team members first!");
        return;
    }

    // Reset winner display
    document.getElementById('winner-display').classList.add('hidden');
    document.getElementById('winner-name').textContent = '-';

    // Reset timer
    resetTimer(false);

    // Start Total Elapsed Timer on first spin
    if (!state.elapsedStartTime) {
        state.elapsedStartTime = Date.now();
        saveState();
        startElapsedTimer();
    }

    // Initial kick
    wheel.velocity = 0.4 + Math.random() * 0.2;
    wheel.isSpinning = true;
}

function updatePhysics() {
    if (!wheel.isSpinning) return;

    wheel.rotation += wheel.velocity;
    wheel.velocity *= 0.96; // Friction

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

    // Filter active members
    const activeMembers = state.members.filter(m => m.active);
    const count = activeMembers.length;

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
        const member = activeMembers[i];

        ctx.beginPath();
        ctx.moveTo(wheel.center, wheel.center);
        ctx.arc(wheel.center, wheel.center, wheel.center - 10, angle, angle + arcSize);
        ctx.closePath();

        // Color
        ctx.fillStyle = COLORS[state.members.indexOf(member) % COLORS.length];
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
        ctx.font = 'bold 18px Inter';

        let label = member.name;
        if (state.settings?.hideNames) {
            label = '***';
        } else {
            if (label.length > 15) label = label.substring(0, 12) + '...';
        }
        ctx.fillText(label, wheel.center - 40, 6);
        ctx.restore();
    }
}

function animate() {
    updatePhysics();
    drawWheel();
    requestAnimationFrame(animate);
}



// --- TIMER LOGIC ---
function startTimer() {
    if (timer.isRunning) return;

    timer.isRunning = true;
    updateTimerIcons();

    timer.intervalId = setInterval(() => {
        timer.remainingTime--;
        updateTimerDisplay(timer.remainingTime);

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

    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);

    const m = Math.floor(absSeconds / 60).toString().padStart(2, '0');
    const s = (absSeconds % 60).toString().padStart(2, '0');
    el.textContent = `${isNegative ? '-' : ''}${m}:${s}`;
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


// --- TOTAL ELAPSED TIMER ---
function startElapsedTimer() {
    if (elapsedTimer.intervalId) clearInterval(elapsedTimer.intervalId);

    // For simplicity, we just update the display every second based on Date.now() - state.elapsedStartTime

    elapsedTimer.intervalId = setInterval(() => {
        updateElapsedDisplay();
    }, 1000);
}

function stopElapsedTimer() {
    if (elapsedTimer.intervalId) {
        clearInterval(elapsedTimer.intervalId);
        elapsedTimer.intervalId = null;
    }
}

function updateElapsedDisplay() {
    const el = document.getElementById('total-time-display');
    if (!el) return;

    if (!state.elapsedStartTime) {
        el.textContent = "00:00";
        return;
    }

    const diff = Math.floor((Date.now() - state.elapsedStartTime) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
}

// --- LIST MANAGEMENT ---
function addMember(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('new-member-input');
    const name = input.value.trim();

    if (name) {
        state.members.push({ name: name, active: true });
        saveState();
        renderNamesList();
        input.value = '';
        drawWheel();
    }
}

// Make globally available for onclick
window.removeMember = function (index) {
    if (state.members[index]) {
        state.members[index].active = false;
        saveState();
        renderNamesList();
        drawWheel();
    }
}

// Hard delete member
window.deleteMember = function (index) {
    if (state.members[index]) {
        if (confirm('Are you sure you want to permanently delete this member? This cannot be undone.')) {
            state.members.splice(index, 1);
            saveState();
            renderNamesList();
            drawWheel();
        }
    }
}

function restartRound() {
    if (confirm('Restart round? All names will be restored to the wheel.')) {
        state.members.forEach(m => m.active = true);

        // Clear winner display
        document.getElementById('winner-display').classList.add('hidden');
        document.getElementById('winner-name').textContent = '-';

        state.lastWinnerIndex = -1;
        saveState();
        renderNamesList();
        drawWheel();
        resetTimer(true);

        // Reset Total Elapsed Timer
        stopElapsedTimer();
        state.elapsedStartTime = null;
        saveState();
        updateElapsedDisplay();
    }
}

function renderNamesList() {
    const list = document.getElementById('members-list');
    if (!list) return;
    list.innerHTML = '';

    const hide = state.settings?.hideNames;

    state.members.forEach((member, index) => {
        const li = document.createElement('li');
        li.className = 'member-item';
        if (!member.active) li.classList.add('inactive');

        const displayName = hide ? '***' : member.name;

        // Show remove button only if active
        let actionsHtml = '';

        if (member.active) {
            actionsHtml += `<button class="btn remove-btn" onclick="removeMember(${index})" title="Remove from round">&times;</button>`;
        }

        // Add Delete Button
        const deleteIcon = `<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
        actionsHtml += `<button class="btn delete-btn" onclick="deleteMember(${index})" title="Permanently Delete">${deleteIcon}</button>`;

        li.innerHTML = `
            <span>${displayName}</span>
            <div class="member-actions">
                ${actionsHtml}
            </div>
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

    // Settings Toggle
    document.getElementById('settings-toggle')?.addEventListener('click', () => {
        document.getElementById('settings-panel').classList.toggle('hidden');
    });

    // Winner Action Radio
    document.querySelectorAll('input[name="winner-action"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.settings.winnerAction = e.target.value;
            saveState();
        });
    });

    // Modal Actions
    document.getElementById('btn-remove')?.addEventListener('click', () => handleSelectedDecision('remove'));
    document.getElementById('btn-keep')?.addEventListener('click', () => handleSelectedDecision('keep'));
    document.getElementById('btn-spin-again')?.addEventListener('click', () => handleSelectedDecision('spin-again'));

    // Update settings UI on load
    const savedAction = state.settings?.winnerAction || 'popup';
    const radio = document.querySelector(`input[name="winner-action"][value="${savedAction}"]`);
    if (radio) radio.checked = true;

    // Privacy Toggle
    document.getElementById('hide-names-toggle')?.addEventListener('change', (e) => {
        state.settings.hideNames = e.target.checked;
        saveState();
        renderNamesList();
        drawWheel();
    });

    // Load Privacy State
    if (state.settings.hideNames) {
        document.getElementById('hide-names-toggle').checked = true;
    }

    // Restart Round
    document.getElementById('restart-round-btn')?.addEventListener('click', restartRound);
}

// --- SELECTED HANDLING ---

function determineWinner() {
    // We only spin with active members, so we need to map the result back to the main array index or just use the filtered list logic
    // CAUTION: The wheel segments are drawn based on *Active* members.
    // So if winningIndex is 2, it means the 3rd *Active* member.

    const activeMembers = state.members.filter(m => m.active);
    const count = activeMembers.length;
    const arcSize = PI2 / count;

    let pointerAngle = (3 * Math.PI / 2) - wheel.rotation;
    pointerAngle = pointerAngle % PI2;
    if (pointerAngle < 0) pointerAngle += PI2;

    const winningActiveIndex = Math.floor(pointerAngle / arcSize);
    const winnerMember = activeMembers[winningActiveIndex];

    // Find absolute index in state.members
    const absoluteIndex = state.members.indexOf(winnerMember);
    state.lastWinnerIndex = absoluteIndex;
    saveState(); // Persist this so we know who to remove on next spin

    const winnerName = winnerMember.name;
    const action = state.settings?.winnerAction || 'auto';

    // Start timer immediately if enabled (as requested: "popup confirmationda timer başlamıyor... saymalı")
    if (state.timerSettings.enabled) {
        startTimer();
    }

    if (action === 'auto') {
        // Auto remove mode
        // Show temporary winner display (sidebar)
        document.getElementById('winner-name').textContent = winnerName;
        document.getElementById('winner-display').classList.remove('hidden');

        // DO NOT remove immediately. Wait for next spin.

    } else {
        // Popup mode
        // Show Modal
        document.getElementById('modal-winner-name').textContent = winnerName;
        document.getElementById('winner-modal').classList.remove('hidden');

        // Also update sidebar
        document.getElementById('winner-name').textContent = winnerName;
    }
}

function handleSelectedDecision(decision) {
    document.getElementById('winner-modal').classList.add('hidden');

    if (decision === 'remove') {
        if (state.lastWinnerIndex !== -1) {
            removeMember(state.lastWinnerIndex);
            state.lastWinnerIndex = -1;
            saveState();
        }
        document.getElementById('winner-display').classList.remove('hidden');
    } else if (decision === 'keep') {
        // Just keep, show in sidebar
        document.getElementById('winner-display').classList.remove('hidden');
    } else if (decision === 'spin-again') {
        // Typically spin again means "ignore this result". Reset timer.
        resetTimer(false);
        spinWheel();
    }
}
