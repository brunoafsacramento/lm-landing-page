document.addEventListener('DOMContentLoaded', () => {
    if (window.feather) feather.replace();

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('.site-header');
    const progress = document.querySelector('.scroll-progress');
    const horizontal = document.querySelector('.horizontal-section');
    const track = document.querySelector('.horizontal-track');

    const buildTicker = () => {
        const ticker = document.querySelector('.ticker');
        const tickerTrack = ticker?.querySelector('.ticker-track');
        const source = tickerTrack?.querySelector('.ticker-group');
        if (!ticker || !tickerTrack || !source) return;
        tickerTrack.querySelectorAll('.ticker-group:not(:first-child)').forEach(group => group.remove());
        const groupWidth = source.getBoundingClientRect().width;
        if (!groupWidth) return;
        const copies = Math.max(2, Math.ceil((innerWidth * 2) / groupWidth) + 1);
        for (let index = 1; index < copies; index += 1) {
            const clone = source.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            tickerTrack.appendChild(clone);
        }
        tickerTrack.style.setProperty('--ticker-shift', `${groupWidth}px`);
    };

    const horizontalTravel = () => {
        if (!horizontal || !track) return 0;
        if (innerWidth <= 650 || reducedMotion) {
            horizontal.style.removeProperty('height');
            track.style.removeProperty('transform');
            return 0;
        }
        track.style.transform = 'translate3d(0,0,0)';
        const lastCard = track.lastElementChild;
        if (!lastCard) return 0;
        const travel = Math.max(0, lastCard.getBoundingClientRect().right - innerWidth + 48);
        horizontal.style.height = `${innerHeight + travel}px`;
        return travel;
    };

    const updateScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const ratio = max > 0 ? scrollY / max : 0;
        if (progress) progress.style.width = `${ratio * 100}%`;
        header?.classList.toggle('scrolled', scrollY > 30);

        if (!reducedMotion && horizontal && track && innerWidth > 650) {
            const rect = horizontal.getBoundingClientRect();
            const distance = horizontal.offsetHeight - innerHeight;
            const local = Math.min(1, Math.max(0, -rect.top / Math.max(distance, 1)));
            track.style.transform = `translate3d(${-local * Math.max(distance, 0)}px,0,0)`;
        }

        document.querySelectorAll('[data-parallax]').forEach(el => {
            if (reducedMotion) return;
            const speed = Number(el.dataset.parallax || 0);
            el.style.transform = `translate3d(0,${scrollY * speed}px,0)`;
        });
    };
    addEventListener('scroll', updateScroll, { passive: true });
    addEventListener('resize', () => { buildTicker(); horizontalTravel(); updateScroll(); });
    buildTicker();
    horizontalTravel();
    updateScroll();

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    const menuButton = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = () => {
        mobileMenu?.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuButton?.setAttribute('aria-expanded', 'false');
    };
    menuButton?.addEventListener('click', () => {
        const open = mobileMenu?.classList.toggle('open');
        document.body.classList.toggle('menu-open', !!open);
        menuButton.setAttribute('aria-expanded', String(!!open));
    });
    mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        });
    });

    const customCursor = document.querySelector('.custom-cursor');
    if (customCursor && matchMedia('(pointer:fine)').matches && !reducedMotion) {
        let pointerX = innerWidth / 2, pointerY = innerHeight / 2;
        let ringX = pointerX, ringY = pointerY;
        addEventListener('mousemove', event => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            customCursor.style.setProperty('--cursor-x', `${pointerX}px`);
            customCursor.style.setProperty('--cursor-y', `${pointerY}px`);
            customCursor.classList.add('visible');
        });
        const renderCursor = () => {
            ringX += (pointerX - ringX) * .16;
            ringY += (pointerY - ringY) * .16;
            customCursor.style.setProperty('--ring-x', `${ringX}px`);
            customCursor.style.setProperty('--ring-y', `${ringY}px`);
            requestAnimationFrame(renderCursor);
        };
        renderCursor();
        document.querySelectorAll('a, button, .tilt-card').forEach(element => {
            element.addEventListener('mouseenter', () => customCursor.classList.add('interactive'));
            element.addEventListener('mouseleave', () => customCursor.classList.remove('interactive'));
        });
        document.documentElement.classList.add('has-custom-cursor');
    }

    if (!reducedMotion && matchMedia('(pointer:fine)').matches) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            card.addEventListener('mousemove', event => {
                const rect = card.getBoundingClientRect();
                const rx = ((event.clientY - rect.top) / rect.height - .5) * -5;
                const ry = ((event.clientX - rect.left) / rect.width - .5) * 5;
                card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
            card.addEventListener('mouseleave', () => card.style.transform = '');
        });
        document.querySelectorAll('.magnetic').forEach(button => {
            button.addEventListener('mousemove', event => {
                const rect = button.getBoundingClientRect();
                button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px,${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
            });
            button.addEventListener('mouseleave', () => button.style.transform = '');
        });
    }

    const audienceDescription = document.getElementById('audience-description');
    document.querySelectorAll('.audience-item').forEach(item => {
        const activate = () => {
            document.querySelectorAll('.audience-item').forEach(other => other.classList.remove('active'));
            item.classList.add('active');
            if (audienceDescription) audienceDescription.textContent = item.dataset.copy;
        };
        item.addEventListener('mouseenter', activate);
        item.addEventListener('focus', activate);
        item.addEventListener('click', activate);
    });
});
