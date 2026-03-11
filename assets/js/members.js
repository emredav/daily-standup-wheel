/**
 * Daily Standup Wheel
 * Team Member List Management
 */

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
