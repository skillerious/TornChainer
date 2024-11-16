// editdialog.js
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const editTargetForm = document.getElementById('editTargetForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const usernameInput = document.getElementById('username');
    const urlInput = document.getElementById('url');

    let originalUsername = '';

    // Function to validate Profile URL (basic validation)
    function isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Listen for the 'edit-target-data' event to populate the form
    ipcRenderer.on('edit-target-data', (event, target) => {
        usernameInput.value = target.username;
        urlInput.value = target.url;
        originalUsername = target.username; // Store original username for reference
    });

    editTargetForm.addEventListener('submit', (e) => {
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

        // Send updated data to main process for handling
        ipcRenderer.send('update-target', {
            originalUsername: originalUsername,
            updatedTarget: {
                username: username,
                url: url
            }
        });
    });

    cancelBtn.addEventListener('click', () => {
        ipcRenderer.send('close-edit-target-dialog'); // Use a separate close event
    });
});
