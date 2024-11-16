// targetdialog.js
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const addTargetForm = document.getElementById('addTargetForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const usernameInput = document.getElementById('username');
    const urlInput = document.getElementById('url');

    // Function to validate Profile URL (basic validation)
    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    addTargetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const url = urlInput.value.trim();

        // Basic Validation
        if (!username || !url) {
            alert('Please fill in all fields.');
            return;
        }

        if (!isValidURL(url)) {
            alert('Please enter a valid URL.');
            return;
        }

        // Send new target data to main process for handling
        ipcRenderer.send('add-target', {
            username: username,
            url: url
        });
    });

    cancelBtn.addEventListener('click', () => {
        ipcRenderer.send('close-add-target-dialog'); // Reuse the close event
    });
});
