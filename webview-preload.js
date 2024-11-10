// webview-preload.js

const { ipcRenderer } = require('electron');

// Listen for context menu events
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const targetElement = event.target;

    // Function to extract URL from an element or its parents
    function getLinkUrl(element) {
        while (element) {
            if (element.tagName) {
                const tagName = element.tagName.toLowerCase();

                if (tagName === 'a' && element.href) {
                    return element.href;
                } else if ((tagName === 'button' || tagName === 'input') && element.formAction) {
                    // For buttons with form actions
                    return element.formAction;
                } else if (element.hasAttribute('onclick')) {
                    // Try to extract URL from onclick attribute
                    const onclick = element.getAttribute('onclick');
                    const urlMatch = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
                    if (urlMatch && urlMatch[1]) {
                        return urlMatch[1];
                    }
                } else if (element.dataset) {
                    // Check for data-href or data-url attributes
                    if (element.dataset.href) {
                        return element.dataset.href;
                    }
                    if (element.dataset.url) {
                        return element.dataset.url;
                    }
                }
            }

            element = element.parentElement;
        }
        return null;
    }

    const href = getLinkUrl(targetElement);

    ipcRenderer.sendToHost('show-webview-context-menu', {
        href: href,
        x: event.clientX,
        y: event.clientY
    });
});

// Listen for keyboard events
window.addEventListener('keydown', (event) => {
    ipcRenderer.sendToHost('webview-keydown', {
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
    });
});

// Listen for mouseup events to capture the mouse back and forward buttons
window.addEventListener('mouseup', (event) => {
    ipcRenderer.sendToHost('webview-mouseup', {
        button: event.button,
        x: event.clientX,
        y: event.clientY,
    });
});
