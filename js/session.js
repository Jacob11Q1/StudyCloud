$ready(() => {
    const key = 'session:last';
    const form = document.getElementById('session-form');
    if (!form) return;

    const subject = document.getElementById('session-subject');
    const method = document.getElementById('session-method');
    const duration = document.getElementById('session-duration');
    const goal = document.getElementById('session-goal');
    const saveBtn = document.getElementById('session-save');
    const startLink = document.getElementById('session-start');

    // hydrate
    try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.subject) subject.value = data.subject;
        if (data.method) method.value = data.method;
        if (data.duration) duration.value = data.duration;
        if (data.goal) goal.value = data.goal;
    } catch { }

    // save
    const save = () => {
        const data = {
            subject: subject.value.trim(),
            method: method.value,
            duration: duration.value.trim(),
            goal: goal.value.trim()
        };
        localStorage.setItem(key, JSON.stringify(data));
    };
    saveBtn?.addEventListener('click', () => { save(); alert('Session template saved.'); });

    // deep-link to focus
    startLink?.addEventListener('click', (e) => {
        save();
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const qs = new URLSearchParams(data).toString();
        startLink.href = `./html/focus.html?${qs}`;
    });
});
