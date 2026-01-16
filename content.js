(function() {
    if (document.contentType !== 'application/pdf') return;

    // --- CONFIGURATION ---
    let rightPosition = 130; 

    // --- 1. CSS STYLES (High Contrast Dark Mode) ---
    const style = document.createElement('style');
    style.innerHTML = `
        /* DARK MODE: High Contrast Version */
        html.pdf-dark-mode { 
            /* contrast(1.2) crushes dark greys into black */
            filter: invert(1) hue-rotate(180deg) contrast(1.2) grayscale(0.3) !important;
            background-color: white !important; 
        }
        
        /* RESTORE IMAGES & UI */
        html.pdf-dark-mode img, 
        html.pdf-dark-mode video, 
        html.pdf-dark-mode #pdf-tools-container {
            filter: invert(1) hue-rotate(180deg) contrast(0.85) grayscale(0) !important;
        }

        /* SEPIA MODE */
        html.pdf-sepia-mode {
            filter: sepia(0.4) contrast(0.95) brightness(0.95) !important;
        }
        html.pdf-sepia-mode body {
            background-color: #f4ecd8 !important;
        }
    `;
    document.head.appendChild(style);

    // --- UI SETUP ---
    const container = document.createElement('div');
    container.id = 'pdf-tools-container';
    Object.assign(container.style, {
        position: 'fixed', top: '10px', right: rightPosition + 'px', 
        display: 'flex', gap: '8px', zIndex: '2147483647',
        transition: 'opacity 0.3s ease, right 0.2s ease'
    });

    chrome.storage.local.get(['rightPos'], (result) => {
        if (result.rightPos) { rightPosition = result.rightPos; container.style.right = rightPosition + 'px'; }
    });

    chrome.runtime.onMessage.addListener((m) => {
        if (m.type === 'UPDATE_POS') { rightPosition = m.value; container.style.right = rightPosition + 'px'; }
    });

    // --- BUTTON CREATION ---
    const isToolbarHidden = () => window.location.href.includes('#toolbar=0');

    function createButton(iconSvg, tooltipText, onClick) {
        const btn = document.createElement('div');
        Object.assign(btn.style, {
            width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(2px)'
        });

        btn.innerHTML = iconSvg;
        const iconElement = btn.querySelector('svg');
        Object.assign(iconElement.style, { fill: 'rgb(241, 240, 240)', width: '20px', height: '20px' });
        btn.title = tooltipText;

        function updateBackground() {
            if (isToolbarHidden()) {
                btn.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; 
                btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            } else {
                btn.style.backgroundColor = 'transparent'; 
                btn.style.boxShadow = 'none';
            }
        }
        updateBackground();

        btn.addEventListener('mouseenter', () => { 
            btn.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; 
            btn.style.transform = 'scale(1.1)';
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; updateBackground(); });
        btn.addEventListener('click', onClick);
        return btn;
    }

    // --- ACTIONS ---
    function toggleToolbar() {
        const url = window.location.href;
        if (url.indexOf('#toolbar=0') === -1) {
            window.location.href = url + '#toolbar=0';
        } else {
            window.location.href = url.replace('#toolbar=0', '');
        }
        setTimeout(() => window.location.reload(), 50);
    }

    function toggleDark() {
        document.documentElement.classList.remove('pdf-sepia-mode'); 
        document.documentElement.classList.toggle('pdf-dark-mode'); 
    }

    function toggleSepia() {
        document.documentElement.classList.remove('pdf-dark-mode'); 
        document.documentElement.classList.toggle('pdf-sepia-mode');
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    }

    // --- ICONS ---
    const eyeIcon = `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    const moonIcon = `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
    const coffeeIcon = `<svg viewBox="0 0 24 24"><path d="M12 3v18c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/></svg>`;
    const fsIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;

    container.appendChild(createButton(eyeIcon, "Toggle Toolbar", toggleToolbar));
    container.appendChild(createButton(moonIcon, "Dark Mode", toggleDark));
    container.appendChild(createButton(coffeeIcon, "Sepia Mode", toggleSepia));
    container.appendChild(createButton(fsIcon, "Fullscreen", toggleFullscreen));
    document.body.appendChild(container);

    // --- AUTO HIDE ---
    function checkFullscreen() {
        const isFS = document.fullscreenElement || (window.innerWidth === screen.width && window.innerHeight === screen.height);
        if (isFS) {
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
        } else {
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        }
    }
    document.addEventListener('fullscreenchange', checkFullscreen);
    window.addEventListener('resize', checkFullscreen);
    checkFullscreen();
})();
