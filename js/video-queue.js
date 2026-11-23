document.addEventListener('DOMContentLoaded', () => {
    const items = Array.from(document.querySelectorAll('[data-video-item]'));
    if (!items.length) return;

    const videos = items.map((card, index) => {
        const video = card.querySelector('.portfolio-video');
        const playBtn = card.querySelector('.video-play-btn');
        const badge = card.querySelector('.video-status-badge');
        const titleEl = card.querySelector('h3');
        const src = video.getAttribute('data-src');

        video.src = `${src}#t=0.5`;

        return {
            index,
            card,
            video,
            playBtn,
            badge,
            src,
            get title() {
                return titleEl ? titleEl.textContent.trim() : '';
            },
            blobUrl: null,
            status: 'pending'
        };
    });

    const queue = videos.map((item) => item.index);
    let activeIndex = null;
    let activeController = null;
    let queueStarted = false;

    function getLang() {
        return document.documentElement.lang === 'en' ? 'en' : 'ro';
    }

    function updateBadge(item, state) {
        if (!item.badge) return;
        const labels = {
            preview: { ro: 'Previzualizare', en: 'Preview' },
            loading: { ro: 'Se încarcă...', en: 'Loading...' },
            ready: { ro: 'Gata', en: 'Ready' }
        };
        const label = labels[state] || labels.preview;
        item.badge.setAttribute('data-ro', label.ro);
        item.badge.setAttribute('data-en', label.en);
        item.badge.textContent = label[getLang()];
    }

    function pauseAllPreviews() {
        videos.forEach((other) => {
            if (!other.video.paused) {
                other.video.pause();
                other.video.currentTime = 0.5;
            }
        });
    }

    async function downloadVideo(item, isPriority) {
        if (item.status === 'done') return;

        item.status = 'downloading';
        activeIndex = item.index;
        activeController = new AbortController();

        if (isPriority) {
            updateBadge(item, 'loading');
        }

        try {
            const response = await fetch(item.src, {
                signal: activeController.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            item.blobUrl = URL.createObjectURL(blob);
            item.status = 'done';
            updateBadge(item, 'ready');

            if (window.VideoOverlay) {
                window.VideoOverlay.updateSourceIfActive(item);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                item.status = 'pending';
                if (!queue.includes(item.index)) {
                    queue.unshift(item.index);
                }
                updateBadge(item, 'preview');
            } else {
                item.status = 'error';
                updateBadge(item, 'preview');
            }
        } finally {
            activeIndex = null;
            activeController = null;
        }
    }

    async function processQueue() {
        if (activeIndex !== null) return;

        while (queue.length > 0) {
            const nextIndex = queue.shift();
            const item = videos[nextIndex];
            if (!item || item.status === 'done' || item.status === 'error') {
                continue;
            }

            const isPriority = Boolean(window.VideoOverlay && window.VideoOverlay.isOpenFor(item.index));
            await downloadVideo(item, isPriority);
        }
    }

    function openAndPrioritize(item) {
        pauseAllPreviews();

        if (window.VideoOverlay) {
            window.VideoOverlay.open(item);
        }

        if (item.status === 'done') {
            return;
        }

        const existingPos = queue.indexOf(item.index);
        if (existingPos !== -1) {
            queue.splice(existingPos, 1);
        }
        queue.unshift(item.index);

        if (activeIndex !== null && activeIndex !== item.index && activeController) {
            activeController.abort();
        } else if (activeIndex === null) {
            queueStarted = true;
            processQueue();
        }
    }

    videos.forEach((item) => {
        item.card.addEventListener('mouseenter', () => {
            if (window.VideoOverlay && window.VideoOverlay.isOpenFor(item.index)) return;
            item.video.muted = true;
            item.video.play().catch(() => {});
        });

        item.card.addEventListener('mouseleave', () => {
            item.video.pause();
            item.video.currentTime = 0.5;
        });

        item.card.addEventListener('click', (e) => {
            e.preventDefault();
            openAndPrioritize(item);
        });
    });

    function startIdleQueue() {
        if (queueStarted) return;
        queueStarted = true;

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => processQueue(), { timeout: 2000 });
        } else {
            setTimeout(() => processQueue(), 800);
        }
    }

    if (document.readyState === 'complete') {
        startIdleQueue();
    } else {
        window.addEventListener('load', startIdleQueue, { once: true });
    }
});