// apikeydialog.js

const { remote } = require('electron'); // Import the remote module

const currentWindow = remote.getCurrentWindow(); // Get the current window instance

// Function to adjust window size
function adjustWindowSize(width, height) {
    currentWindow.setSize(width, height); // Set the window size
}

// Adjust window size when the dialog is fully loaded
window.onload = () => {
    adjustWindowSize(700, 1100); // Set your desired width and height in pixels
};

// Existing code for handling Save and Cancel buttons
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const cancelBtn = document.getElementById('cancelBtn');
const errorMessage = document.getElementById('errorMessage');
const toggleVisibility = document.getElementById('toggleVisibility');
const visibilityIcon = document.getElementById('visibilityIcon');

// Function to validate API key (adjust pattern as needed)
function isValidApiKey(key) {
    const apiKeyPattern = /^[a-zA-Z0-9]{16}$/; // Example: 16-character alphanumeric
    return apiKeyPattern.test(key);
}

saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        if (isValidApiKey(apiKey)) {
            // Implement your API key saving logic here
            // For example, send it to the main process or save locally
            // Example using IPC:
            remote.getGlobal('sharedObject').apiKey = apiKey; // Example: Using a global shared object
            currentWindow.close(); // Close the dialog
        } else {
            showError('Invalid API key format. Please enter a valid 16-character key.');
        }
    } else {
        showError('Please enter your API key.');
    }
});

cancelBtn.addEventListener('click', () => {
    currentWindow.close(); // Close the dialog without saving
});

// Clear error message when user starts typing
apiKeyInput.addEventListener('input', () => {
    errorMessage.style.display = 'none';
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Show/Hide API key functionality
toggleVisibility.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        visibilityIcon.src = 'assets/hide-icon.png'; // Update to hide icon
        visibilityIcon.alt = 'Hide API Key';
    } else {
        apiKeyInput.type = 'password';
        visibilityIcon.src = 'assets/show-icon.png'; // Update to show icon
        visibilityIcon.alt = 'Show API Key';
    }
});
