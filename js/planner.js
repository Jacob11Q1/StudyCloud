$ready(() => {
    const KEY = 'planner:v1';
    const cells = [...document.querySelectorAll('.planner-cell[contenteditable][data-day]')];
    if (!cells.length) return;

    let state = {};
    try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { state = {}; }

    // hydrate
    cells.forEach(c => {
        const k = c.dataset.day;
        if (state[k]) c.textContent = state[k];
        c.addEventListener('blur', () => {
            state[k] = c.textContent.trim();
            localStorage.setItem(KEY, JSON.stringify(state));
        });
    });

    // controls
    const exportBtn = document.getElementById('planner-export');
    const importInput = document.getElementById('planner-import-input');
    const clearBtn = document.getElementById('planner-clear');

    exportBtn?.addEventListener('click', () => downloadJSON(state, `studycloud-week-${new Date().toISOString().slice(0, 10)}.json`));

    importInput?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (typeof data !== 'object') throw new Error('Invalid data');
            state = data;
            localStorage.setItem(KEY, JSON.stringify(state));
            cells.forEach(c => c.textContent = state[c.dataset.day] || '');
            alert('Planner imported.');
        } catch {
            alert('Import failed. Please select a valid JSON file.');
        } finally {
            e.target.value = '';
        }
    });

    clearBtn?.addEventListener('click', () => {
        if (!confirm('Clear all planner cells?')) return;
        state = {};
        localStorage.setItem(KEY, JSON.stringify(state));
        cells.forEach(c => c.textContent = '');
    });
});
