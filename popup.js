document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('positionSlider');
    const display = document.getElementById('valDisplay');

    // 1. Load saved value
    chrome.storage.local.get(['rightPos'], (result) => {
        if (result.rightPos) {
            slider.value = result.rightPos;
            display.innerText = result.rightPos;
        }
    });

    // 2. Listen for changes
    slider.addEventListener('input', () => {
        const newVal = slider.value;
        display.innerText = newVal;

        // Save it
        chrome.storage.local.set({ rightPos: newVal });

        // Send to active tab (live preview)
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_POS', value: newVal });
            }
        });
    });
});