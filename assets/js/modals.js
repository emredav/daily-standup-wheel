/**
 * Daily Standup Wheel
 * Winner Determination & Modal Logic
 */

function determineWinner() {
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

    // Start timer immediately if enabled
    if (state.timerSettings.enabled) {
        startTimer();
    }

    if (action === 'auto') {
        // Auto remove mode — show temporary winner display (sidebar)
        document.getElementById('winner-name').textContent = winnerName;
        document.getElementById('winner-display').classList.remove('hidden');

        // DO NOT remove immediately. Wait for next spin.
    } else {
        // Popup mode — show Modal
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
        // Ignore this result, reset timer, spin again
        resetTimer(false);
        spinWheel();
    }
}
