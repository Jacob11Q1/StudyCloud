// Core boot + SW registration + helpers + header glass + scroll-spy
(() => {
    const ready = (fn) =>
        document.readyState !== 'loading'
            ? fn()
            : document.addEventListener('DOMContentLoaded', fn);
    window.$ready = ready;

    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => { });
        });
    }

    // Download helper
    window.downloadJSON = (obj, filename) => {
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // Parse/set query params
    window.setQuery = (params) => {
        const url = new URL(location.href);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        history.replaceState(null, '', url.toString());
    };
    window.getQuery = () => Object.fromEntries(new URL(location.href).searchParams.entries());

    // Header glass: add .scrolled on scroll
    ready(() => {
        const header = document.querySelector('.site-header');
        if (!header) return;
        const apply = () => (window.scrollY > 40 ? header.classList.add('scrolled') : header.classList.remove('scrolled'));
        window.addEventListener('scroll', apply, { passive: true });
        apply();
    });

    // Scroll-spy active nav link (based on visible section)
    ready(() => {
        const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
        if (!navLinks.length) return;

        const map = new Map();
        navLinks.forEach((a) => {
            const id = a.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            if (el) map.set(el, a);
        });

        const setActive = (targetEl) => {
            navLinks.forEach((a) => { a.classList.remove('is-active'); a.setAttribute('aria-current', 'false'); });
            const link = map.get(targetEl);
            if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
        };

        // Observe sections; prefer the one nearest to top
        const io = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
            if (visible[0]) setActive(visible[0].target);
        }, { root: null, threshold: 0.35 });

        map.forEach((_, section) => io.observe(section));

        // Also update active on hash navigation
        window.addEventListener('hashchange', () => {
            const id = location.hash.replace('#', '');
            const el = document.getElementById(id);
            if (el) setActive(el);
        });
    });
})();
