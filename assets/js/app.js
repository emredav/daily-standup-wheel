/**
 * Daily Standup Wheel
 * Application Entry Point & Event Listeners
 */

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

    // Restore funny mode state
    if (state.settings?.funnyMode) {
        toggleFunnyMode(true);
    } else {
        // Show toast after 1 second if funny mode is not active
        setTimeout(() => {
            if (typeof showFunnyToast === 'function') {
                showFunnyToast();
            }
        }, 1000);
    }

    animate();
});

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

    // Funny Mode Toggle
    document.getElementById('funny-mode-btn')?.addEventListener('click', () => {
        state.settings.funnyMode = !state.settings.funnyMode;
        saveState();
        toggleFunnyMode(state.settings.funnyMode);
        drawWheel();
    });

    // Export/Import
    document.getElementById('export-btn')?.addEventListener('click', exportMembers);
    document.getElementById('import-btn')?.addEventListener('click', () => {
        document.getElementById('import-options-modal').classList.remove('hidden');
    });

    // Import Modal Actions
    document.getElementById('btn-cancel-import')?.addEventListener('click', () => {
        document.getElementById('import-options-modal').classList.add('hidden');
    });

    document.getElementById('btn-import-file')?.addEventListener('click', () => {
        document.getElementById('file-import-input').click();
    });

    document.getElementById('file-import-input')?.addEventListener('change', handleFileImport);

    document.getElementById('btn-import-text')?.addEventListener('click', () => {
        document.getElementById('import-options-modal').classList.add('hidden');
        document.getElementById('text-import-modal').classList.remove('hidden');
        document.getElementById('import-textarea').value = '';
        document.getElementById('import-textarea').focus();
    });

    document.getElementById('btn-cancel-text-import')?.addEventListener('click', () => {
        document.getElementById('text-import-modal').classList.add('hidden');
    });

    document.getElementById('btn-confirm-text-import')?.addEventListener('click', handleTextImport);
}
