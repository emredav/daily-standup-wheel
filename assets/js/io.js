/**
 * Daily Standup Wheel
 * Export & Import Functionality
 */

function exportMembers() {
    if (state.members.length === 0) {
        alert("No members to export!");
        return;
    }

    const content = state.members.map(m => m.name).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'daily-standup-team.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const text = event.target.result;
        processImportedText(text);
        // Reset input so same file can be selected again
        e.target.value = '';
        document.getElementById('import-options-modal').classList.add('hidden');
    };
    reader.readAsText(file);
}

function handleTextImport() {
    const text = document.getElementById('import-textarea').value;
    if (!text.trim()) {
        alert("Please enter some names.");
        return;
    }
    processImportedText(text);
    document.getElementById('text-import-modal').classList.add('hidden');
}

function processImportedText(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) {
        alert("No valid names found.");
        return;
    }

    // Replaces current list entirely
    state.members = lines.map(name => ({ name: name, active: true }));

    // Reset Game State
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

    alert(`Imported ${lines.length} members successfully.`);
}
