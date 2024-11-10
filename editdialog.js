// editdialog.js
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const editTargetForm = document.getElementById('editTargetForm');
    const cancelBtn = document.getElementById('cancelBtn');

    let originalUsername = '';

    // Listen for the 'edit-target-data' event to populate the form
    ipcRenderer.on('edit-target-data', (event, target) => {
        document.getElementById('username').value = target.username;
        document.getElementById('url').value = target.url;
        originalUsername = target.username; // Store original username for reference
    });

    editTargetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const url = document.getElementById('url').value.trim();

        // Basic Validation
        if (!username || !url) {
            alert('Please fill in all fields.');
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
        ipcRenderer.send('close-add-target-dialog'); // Reuse the close event
    });
});
