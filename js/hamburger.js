document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    function setDropdown(open) {
        if (!dropdownMenu || !dropdownToggle) return;
        dropdownMenu.classList.toggle('open', open);
        dropdownToggle.setAttribute('aria-expanded', String(open));
    }

    function setMobileMenu(open) {
        if (!hamburger || !navLinks) return;
        hamburger.classList.toggle('active', open);
        navLinks.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';

        if (!open) {
            setDropdown(false);
        }
    }

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (event) => {
            event.stopPropagation();
            const isCurrentlyOpen = navLinks.classList.contains('active');
            setMobileMenu(!isCurrentlyOpen);
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                setMobileMenu(false);
            });
        });
    }

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDropdownOpen = dropdownMenu.classList.contains('open');
            setDropdown(!isDropdownOpen);
        });
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.navbar')) {
            setMobileMenu(false);
            return;
        }

        if (!event.target.closest('.nav-dropdown')) {
            setDropdown(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMobileMenu(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && navLinks && navLinks.classList.contains('active')) {
            setMobileMenu(false);
        }
    });
});