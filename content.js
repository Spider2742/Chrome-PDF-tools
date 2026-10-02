(function() {
    if (document.contentType !== 'application/pdf') return;

    // --- CONFIGURATION ---
    const DEFAULT_RIGHT = 170;   // clears the viewer's own buttons on the right of its toolbar
    const TOOLBAR_HEIGHT = 56;   // height of Chrome's PDF toolbar
    const MODE_KEY = 'pdf-tools-mode';
    let rightPosition = DEFAULT_RIGHT;

    const isToolbarHidden = () => window.location.href.includes('#toolbar=0');

    // --- 1. CSS STYLES ---
    // The reading modes are drawn by a layer over the document instead of a filter on the
    // whole page, so the viewer's toolbar and these buttons keep their normal look.
    const style = document.createElement('style');
    style.textContent = `
        #pdf-tools-shade {
            position: fixed; left: 0; right: 0; bottom: 0; top: ${TOOLBAR_HEIGHT}px;
            pointer-events: none; z-index: 2147483646; display: none;
        }
        #pdf-tools-shade.no-toolbar { top: 0; }

        /* DARK MODE: High Contrast Version */
        #pdf-tools-shade.dark {
            display: block;
            /* contrast(1.2) crushes dark greys into black; hue-rotate keeps colours near their own hue */
            -webkit-backdrop-filter: invert(1) hue-rotate(180deg) contrast(1.2) grayscale(0.3);
            backdrop-filter: invert(1) hue-rotate(180deg) contrast(1.2) grayscale(0.3);
        }

        /* SEPIA MODE */
        #pdf-tools-shade.sepia {
            display: block;
            background: rgba(244, 236, 216, 0.14);
            -webkit-backdrop-filter: sepia(0.4) contrast(0.95) brightness(0.95);
            backdrop-filter: sepia(0.4) contrast(0.95) brightness(0.95);
        }

        #pdf-tools-container {
            position: fixed; top: 10px; display: flex; gap: 8px; z-index: 2147483647;
            transition: opacity 0.3s ease, right 0.2s ease;
        }
        #pdf-tools-container button {
            all: unset; box-sizing: border-box; width: 36px; height: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            background: transparent;
            transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }
        #pdf-tools-container button svg { width: 20px; height: 20px; fill: rgb(241, 240, 240); }
        #pdf-tools-container button:hover { background: rgba(255, 255, 255, 0.12); transform: scale(1.08); }
        #pdf-tools-container button:active { transform: scale(0.96); }
        #pdf-tools-container button:focus-visible { box-shadow: 0 0 0 2px rgb(138, 180, 248); }
        #pdf-tools-container button[aria-pressed="true"] { background: rgba(255, 255, 255, 0.22); }

        /* With the toolbar hidden the buttons float over the page, so they get their own backing. */
        #pdf-tools-container.floating button {
            background: rgba(0, 0, 0, 0.5); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
        }
        #pdf-tools-container.floating button:hover { background: rgba(0, 0, 0, 0.7); }
        #pdf-tools-container.floating button[aria-pressed="true"] {
            background: rgba(0, 0, 0, 0.78); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.65);
        }
        @media (prefers-reduced-motion: reduce) {
            #pdf-tools-container, #pdf-tools-container button { transition: none; }
        }
    `;
    document.head.appendChild(style);

    // --- UI SETUP ---
    const shade = document.createElement('div');
    shade.id = 'pdf-tools-shade';
    shade.classList.toggle('no-toolbar', isToolbarHidden());

    const container = document.createElement('div');
    container.id = 'pdf-tools-container';
    container.classList.toggle('floating', isToolbarHidden());
    container.style.right = rightPosition + 'px';

    chrome.storage.local.get(['rightPos'], (result) => {
        if (result.rightPos) { rightPosition = result.rightPos; container.style.right = rightPosition + 'px'; }
    });

    chrome.runtime.onMessage.addListener((m) => {
        if (m.type === 'UPDATE_POS') { rightPosition = m.value; container.style.right = rightPosition + 'px'; }
    });

    // --- BUTTON CREATION ---
    function createButton(iconSvg, tooltipText, onClick) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = iconSvg;
        btn.title = tooltipText;
        btn.setAttribute('aria-label', tooltipText);
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

    // The reading mode is remembered for this tab, so it survives the reload that
    // showing or hiding the toolbar needs.
    const currentMode = () => shade.classList.contains('dark') ? 'dark' : shade.classList.contains('sepia') ? 'sepia' : '';

    function setMode(mode) {
        shade.classList.toggle('dark', mode === 'dark');
        shade.classList.toggle('sepia', mode === 'sepia');
        darkBtn.setAttribute('aria-pressed', String(mode === 'dark'));
        sepiaBtn.setAttribute('aria-pressed', String(mode === 'sepia'));
        try {
            if (mode) sessionStorage.setItem(MODE_KEY, mode);
            else sessionStorage.removeItem(MODE_KEY);
        } catch (_) {}
    }

    function toggleDark() { setMode(currentMode() === 'dark' ? '' : 'dark'); }
    function toggleSepia() { setMode(currentMode() === 'sepia' ? '' : 'sepia'); }

    function toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else if (document.exitFullscreen) document.exitFullscreen();
    }

    // --- ICONS ---
    const eyeIcon = `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    const eyeOffIcon = `<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`;
    const moonIcon = `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
    const coffeeIcon = `<svg viewBox="0 0 24 24"><path d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z"/></svg>`;
    const fsIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;

    const toolbarBtn = createButton(isToolbarHidden() ? eyeOffIcon : eyeIcon, isToolbarHidden() ? "Show toolbar" : "Hide toolbar", toggleToolbar);
    const darkBtn = createButton(moonIcon, "Dark mode", toggleDark);
    const sepiaBtn = createButton(coffeeIcon, "Sepia mode", toggleSepia);
    const fsBtn = createButton(fsIcon, "Fullscreen", toggleFullscreen);
    container.append(toolbarBtn, darkBtn, sepiaBtn, fsBtn);
    document.body.append(shade, container);

    let savedMode = '';
    try { savedMode = sessionStorage.getItem(MODE_KEY) || ''; } catch (_) {}
    setMode(savedMode === 'dark' || savedMode === 'sepia' ? savedMode : '');

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
