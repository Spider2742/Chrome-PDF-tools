document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_RIGHT = 170; // keep in step with content.js
    const slider = document.getElementById('positionSlider');
    const display = document.getElementById('valDisplay');
    const resetBtn = document.getElementById('resetBtn');

    document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;

    function show(value) {
        slider.value = value;
        display.innerText = value;
        resetBtn.disabled = Number(value) === DEFAULT_RIGHT;
    }

    function apply(value) {
        show(value);

        // Save it
        chrome.storage.local.set({ rightPos: String(value) });

        // Send to active tab (live preview)
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                // The active tab may not be a PDF; reading lastError keeps that from being logged as an error.
                chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_POS', value: String(value) }, () => void chrome.runtime.lastError);
            }
        });
    }

    // 1. Load saved value
    show(DEFAULT_RIGHT);
    chrome.storage.local.get(['rightPos'], (result) => {
        if (result.rightPos) show(result.rightPos);
    });

    // 2. Listen for changes
    slider.addEventListener('input', () => apply(slider.value));
    resetBtn.addEventListener('click', () => apply(DEFAULT_RIGHT));
});
