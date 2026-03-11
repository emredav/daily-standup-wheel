/**
 * Daily Standup Wheel
 * Timer Logic (Countdown + Total Elapsed)
 */

// --- COUNTDOWN TIMER ---

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
