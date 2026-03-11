/**
 * Daily Standup Wheel
 * Canvas Initialization, Drawing & Physics
 */

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

// --- SPIN ---

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

// --- PHYSICS ---

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

// --- DRAWING ---

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

// --- ANIMATION LOOP ---

function animate() {
    updatePhysics();
    drawWheel();
    requestAnimationFrame(animate);
}
