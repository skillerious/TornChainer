// apikeydialog.js
const { ipcRenderer } = require('electron');

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
            // Send the API key to the main process to save
            ipcRenderer.send('save-api-key', apiKey);
            // Close the dialog window
            window.close();
        } else {
            showError('Invalid API key format. Please enter a valid 16-character key.');
        }
    } else {
        showError('Please enter your API key.');
    }
});

cancelBtn.addEventListener('click', () => {
    window.close(); // Close the dialog without saving
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
