// Minimal Pomodoro engine + bindings for focus page
function format(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function createEngine({ work = 25, rest = 5, rounds = 4 }, onTick, onPhase, onEnd) {
    let phase = 'work', secs = work * 60, round = 1, handle = null;
    const tick = () => {
        secs--; onTick?.({ phase, secs, round });
        if (secs <= 0) {
            if (phase === 'work') {
                phase = 'rest'; secs = rest * 60; onPhase?.({ phase, round });
            } else {
                if (round >= rounds) { clearInterval(handle); handle = null; onEnd?.(); return; }
                phase = 'work'; round++; secs = work * 60; onPhase?.({ phase, round });
            }
        }
    };
    return {
        start() { if (!handle) { onPhase?.({ phase, round }); onTick?.({ phase, secs, round }); handle = setInterval(tick, 1000); } },
        pause() { clearInterval(handle); handle = null; },
        reset() { clearInterval(handle); handle = null; phase = 'work'; secs = work * 60; round = 1; onTick?.({ phase, secs, round }); },
        get() { return { phase, secs, round }; }
    };
}

function parsePreset(value) {
    // "25-5-4" => {work:25, rest:5, rounds:4}
    const [w, r, ro] = value.split('-').map(n => parseInt(n, 10));
    return { work: w || 25, rest: r || 5, rounds: ro || 4 };
}

document.addEventListener('DOMContentLoaded', () => {
    const presetSel = document.getElementById('timer-preset');
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');

    const phaseEl = document.getElementById('timer-phase');
    const remEl = document.getElementById('timer-remaining');
    const roundEl = document.getElementById('timer-round');

    if (!presetSel || !startBtn) return;

    let engine = createEngine(parsePreset(presetSel.value),
        ({ phase, secs, round }) => {
            remEl.textContent = format(secs);
        },
        ({ phase, round }) => {
            phaseEl.textContent = phase;
            roundEl.textContent = String(round);
            // Optional: simple notification (user must interact first)
            if (Notification && Notification.permission === 'granted') {
                const title = phase === 'work' ? 'Focus block started' : 'Break started';
                new Notification(`StudyCloud — ${title}`);
            }
        },
        () => {
            phaseEl.textContent = 'done';
            // chime
            try {
                const a = new Audio('/ding.mp3'); a.play().catch(() => { });
            } catch { }
        }
    );

    // ask notifications politely (once)
    if ('Notification' in window && Notification.permission === 'default') {
        try { Notification.requestPermission(); } catch { }
    }

    startBtn.addEventListener('click', () => engine.start());
    pauseBtn.addEventListener('click', () => engine.pause());
    resetBtn.addEventListener('click', () => {
        engine.reset();
        // re-initialize with the current preset (so Reset+Preset works intuitively)
        engine = createEngine(parsePreset(presetSel.value),
            engine._onTick, engine._onPhase, engine._onEnd
        );
    });
    presetSel.addEventListener('change', () => {
        const cur = engine.get();
        const next = parsePreset(presetSel.value);
        engine = createEngine(next,
            ({ phase, secs, round }) => { remEl.textContent = format(secs); },
            ({ phase, round }) => { phaseEl.textContent = phase; roundEl.textContent = String(round); },
            () => { phaseEl.textContent = 'done'; }
        );
        remEl.textContent = format(next.work * 60);
        phaseEl.textContent = 'work';
        roundEl.textContent = '1';
    });

    // initial display
    remEl.textContent = '25:00';
});
