(function() {
    if (document.contentType !== 'application/pdf') return;

    // --- CONFIGURATION ---
    let rightPosition = 130; // Default

    const container = document.createElement('div');
    container.id = 'pdf-tools-container';
    Object.assign(container.style, {
        position: 'fixed',
        top: '10px',
        right: rightPosition + 'px', 
        display: 'flex',
        gap: '8px',
        zIndex: '2147483647',
        transition: 'opacity 0.3s ease, right 0.2s ease' // Added transition for smooth sliding
    });

    // --- LOAD SAVED POSITION ---
    chrome.storage.local.get(['rightPos'], (result) => {
        if (result.rightPos) {
            rightPosition = result.rightPos;
            container.style.right = rightPosition + 'px';
        }
    });

    // --- LISTEN FOR UPDATES FROM POPUP ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'UPDATE_POS') {
            rightPosition = message.value;
            container.style.right = rightPosition + 'px';
        }
    });

    // --- REST OF THE LOGIC (Same as before) ---
    const isToolbarHidden = () => window.location.href.includes('#toolbar=0');

    function createButton(iconSvg, tooltipText, onClick) {
        const btn = document.createElement('div');
        
        Object.assign(btn.style, {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(2px)'
        });

        btn.innerHTML = iconSvg;
        const iconElement = btn.querySelector('svg');
        iconElement.style.fill = 'white';
        iconElement.style.width = '20px';
        iconElement.style.height = '20px';
        
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
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            updateBackground();
        });

        btn.addEventListener('click', onClick);
        return btn;
    }

    // Toggle Button
    const eyeIcon = `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
    const toggleBtn = createButton(eyeIcon, "Toggle Toolbar", () => {
        const url = window.location.href;
        if (url.indexOf('#toolbar=0') === -1) {
            window.location.href = url + '#toolbar=0';
        } else {
            window.location.href = url.replace('#toolbar=0', '');
        }
        setTimeout(() => window.location.reload(), 50);
    });

    // Fullscreen Button
    const fsIcon = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
    const fsBtn = createButton(fsIcon, "Fullscreen (F11)", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    container.appendChild(toggleBtn);
    container.appendChild(fsBtn);
    document.body.appendChild(container);

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