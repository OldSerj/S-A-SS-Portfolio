document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'video-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    overlay.innerHTML = `
        <div class="video-overlay-box">
            <button type="button" class="video-overlay-close" aria-label="Close video">✕</button>
            <video class="video-overlay-player" controls playsinline></video>
            <div class="video-overlay-caption"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const box = overlay.querySelector('.video-overlay-box');
    const closeBtn = overlay.querySelector('.video-overlay-close');
    const player = overlay.querySelector('.video-overlay-player');
    const caption = overlay.querySelector('.video-overlay-caption');

    let currentItem = null;

    function open(item) {
        currentItem = item;
        const sourceUrl = item.blobUrl || item.src;

        player.src = sourceUrl;
        caption.textContent = item.title || '';

        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        player.play().catch(() => { });
    }

    function close() {
        if (!overlay.classList.contains('open')) return;

        player.pause();
        player.removeAttribute('src');
        player.load();

        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        if (typeof window.onVideoOverlayClose === 'function' && currentItem) {
            window.onVideoOverlayClose(currentItem);
        }
        currentItem = null;
    }

    function updateSourceIfActive(item) {
        if (currentItem && currentItem.index === item.index && item.blobUrl) {
            const wasPlaying = !player.paused;
            const resumeTime = player.currentTime;
            player.src = item.blobUrl;
            player.currentTime = resumeTime;
            if (wasPlaying) {
                player.play().catch(() => { });
            }
        }
    }

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
    });

    overlay.addEventListener('click', (e) => {
        if (!box.contains(e.target)) {
            close();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            close();
        }
    });

    window.VideoOverlay = {
        open,
        close,
        updateSourceIfActive,
        isOpenFor: (index) => Boolean(currentItem && currentItem.index === index)
    };
});