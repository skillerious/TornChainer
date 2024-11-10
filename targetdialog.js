// targetdialog.js
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    const addTargetForm = document.getElementById('addTargetForm');
    const cancelBtn = document.getElementById('cancelBtn');

    addTargetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const url = document.getElementById('url').value.trim();

        // Basic Validation
        if (!username || !url) {
            alert('Please fill in all fields.');
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
