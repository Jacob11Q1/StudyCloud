$ready(() => {
    const LOG_KEY = 'reflect:log';     // array of entries
    const META_KEY = 'reflect:meta';   // streak cache {current,longest,lastDate}

    const form = document.getElementById('reflect-form');
    const wins = document.getElementById('wins');
    const hard = document.getElementById('hard');
    const priority = document.getElementById('priority');
    const exportBtn = document.getElementById('reflect-export');
    const badges = document.getElementById('streak-badges');

    if (!form) return;

    const today = () => new Date().toISOString().slice(0, 10);

    const loadLog = () => {
        try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; }
    };
    const saveLog = (arr) => localStorage.setItem(LOG_KEY, JSON.stringify(arr));

    const loadMeta = () => {
        try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
    };
    const saveMeta = (m) => localStorage.setItem(META_KEY, JSON.stringify(m));

    const updateBadges = () => {
        const meta = loadMeta();
        const cur = meta.current || 0;
        const longest = meta.longest || 0;
        badges.textContent = `Streak: ${cur} day${cur === 1 ? '' : 's'} — Longest: ${longest}`;
    };

    const isConsecutive = (prev, cur) => {
        const d1 = new Date(prev); const d2 = new Date(cur);
        const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
        return diff === 1;
    };

    updateBadges();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entry = {
            date: today(),
            wins: wins.value.trim(),
            hard: hard.value.trim(),
            priority: priority.value.trim()
        };
        const log = loadLog().filter(x => x.date !== entry.date); // replace if exists
        log.push(entry);
        log.sort((a, b) => a.date.localeCompare(b.date));
        saveLog(log);

        // streaks
        const meta = loadMeta();
        if (!meta.lastDate) {
            meta.current = 1;
        } else if (meta.lastDate === entry.date) {
            // same day replace; streak unchanged
            meta.current = meta.current || 1;
        } else if (isConsecutive(meta.lastDate, entry.date)) {
            meta.current = (meta.current || 0) + 1;
        } else {
            meta.current = 1;
        }
        meta.longest = Math.max(meta.longest || 0, meta.current);
        meta.lastDate = entry.date;
        saveMeta(meta);

        updateBadges();
        wins.value = ''; hard.value = ''; priority.value = '';
        alert('Reflection saved.');
    });

    exportBtn?.addEventListener('click', () => {
        downloadJSON({ log: loadLog() }, `studycloud-reflections-${today()}.json`);
    });
});
