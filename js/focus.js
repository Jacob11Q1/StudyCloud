$ready(() => {
    // Sidebar toggle + persist
    const side = document.getElementById('sidebar');
    const toggle = document.getElementById('menu-toggle');
    const SKEY = 'focus:sidebar';
    const open = () => { side?.classList.add('open'); localStorage.setItem(SKEY, '1'); };
    const close = () => { side?.classList.remove('open'); localStorage.setItem(SKEY, '0'); };

    if (localStorage.getItem(SKEY) === '1') side?.classList.add('open');
    toggle?.addEventListener('click', () => side?.classList.contains('open') ? close() : open());

    // Autosave draft area
    const area = document.getElementById('focus-area');
    const FKEY = 'focus:draft';
    if (area) {
        const q = getQuery();
        // Prefill with session query if provided
        const pre = [];
        if (q.subject) pre.push(`Subject: ${q.subject}`);
        if (q.method) pre.push(`Method: ${q.method}`);
        if (q.duration) pre.push(`Duration: ${q.duration}`);
        if (q.goal) pre.push(`Goal: ${q.goal}`);
        const header = pre.length ? pre.join(' — ') + '\n\n' : '';
        area.value = localStorage.getItem(FKEY) || (header + area.value);

        let t;
        area.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => localStorage.setItem(FKEY, area.value), 500);
        });
    }
});
