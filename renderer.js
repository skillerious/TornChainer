// renderer.js
const { ipcRenderer } = require('electron');

// Elements
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const homeBtn = document.getElementById('homeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const addTargetBtn = document.getElementById('addTargetBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const favoritesList = document.getElementById('favoritesList');
const targetList = document.getElementById('targetList');
const searchInput = document.getElementById('searchInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const sidebar = document.getElementById('sidebar');
const body = document.body;
const divider = document.getElementById('divider');
const favoritesGroup = document.getElementById('favoritesGroup');
const othersGroup = document.getElementById('othersGroup');
const favoritesEmptyState = document.getElementById('favoritesEmptyState');
const othersEmptyState = document.getElementById('othersEmptyState');

// References to sort icons
const favoritesSortIcon = document.getElementById('favoritesSortIcon');
const othersSortIcon = document.getElementById('othersSortIcon');

// API Key Button
const apiKeyBtn = document.getElementById('apiKeyBtn');

// Assuming you have a button with id 'newTabBtn'
const newTabBtn = document.getElementById('newTabBtn');

// Tabs Container and Webview Container
const tabsContainer = document.getElementById('tabsContainer');
const webviewContainer = document.getElementById('webviewContainer');

let targets = [];
let filteredTargets = [];
let tabs = [];
let activeTabId = null;
let apiKey = null;
let isReady = false;

// Sort Orders
let favoritesSortOrder = 'asc';
let othersSortOrder = 'asc';

// Variable to keep track of the current batch index
let currentBatchIndex = 0; // 0 or 1

// Request the API key from the main process
ipcRenderer.send('request-api-key');

// Handle the 'send-api-key' event
ipcRenderer.on('send-api-key', (event, key) => {
    apiKey = key;
    if (!apiKey) {
        // Prompt the user to enter the API key
        ipcRenderer.send('open-api-key-dialog');
    } else {
        checkReadyState();
    }
});

// Handle 'api-key-updated' event
ipcRenderer.on('api-key-updated', (event, key) => {
    apiKey = key;
    checkReadyState();
});

// Request targets data from main process
ipcRenderer.send('request-targets');

// Listen for 'send-targets' event to receive targets data
ipcRenderer.on('send-targets', (event, data) => {
    targets = data.targets;
    filteredTargets = targets.slice(); // Clone the array
    populateTargetLists(filteredTargets);
    // Update active list item based on current tab
    updateActiveListItem();
    checkReadyState();
});

// Function to check if the app is ready to start updating statuses
function checkReadyState() {
    if (apiKey && targets.length > 0 && !isReady) {
        isReady = true;
        startUpdatingPlayerStatuses();
    }
}

// Populate the favorites and others lists
function populateTargetLists(targetsToDisplay) {
    favoritesList.innerHTML = '';
    targetList.innerHTML = '';

    const query = searchInput.value.toLowerCase();

    // Separate favorites and others
    const favorites = [];
    const others = [];

    targetsToDisplay.forEach(target => {
        if (target.favorite) {
            favorites.push(target);
        } else {
            others.push(target);
        }
    });

    // Sort each group based on the selected sort order
    favorites.sort((a, b) => {
        const comparison = a.username.localeCompare(b.username);
        return favoritesSortOrder === 'asc' ? comparison : -comparison;
    });

    others.sort((a, b) => {
        const comparison = a.username.localeCompare(b.username);
        return othersSortOrder === 'asc' ? comparison : -comparison;
    });

    // Handle empty state for favorites
    if (favorites.length === 0) {
        favoritesEmptyState.style.display = 'flex';
        favoritesList.classList.add('empty');
    } else {
        favoritesEmptyState.style.display = 'none';
        favoritesList.classList.remove('empty');
        // Populate favorites
        favorites.forEach((target) => {
            const li = createTargetListItem(target, query);
            favoritesList.appendChild(li);
        });
    }

    // Handle empty state for others
    if (others.length === 0) {
        othersEmptyState.style.display = 'flex';
        targetList.classList.add('empty');
    } else {
        othersEmptyState.style.display = 'none';
        targetList.classList.remove('empty');
        // Populate others
        others.forEach((target) => {
            const li = createTargetListItem(target, query);
            targetList.appendChild(li);
        });
    }

    // Update active list item based on current tab
    updateActiveListItem();
}

// Create a list item for a target
function createTargetListItem(target, query) {
    const li = document.createElement('li');
    li.title = target.username; // Tooltip when hovered
    li.dataset.username = target.username;

    // Create icon element
    const icon = document.createElement('img');
    icon.src = 'assets/user-profile.png';
    icon.alt = '';
    icon.classList.add('icon');

    // Create label element
    const label = document.createElement('span');
    label.classList.add('label');
    label.innerHTML = highlightText(target.username, query);

    // Set the text color based on the status
    if (['Hospital', 'In Hospital', 'Jail', 'In Jail', 'Federal Jail'].includes(target.status)) {
        label.style.color = 'red';
    } else {
        label.style.color = ''; // Default color
    }

    // Create favorite icon
    const favoriteIcon = document.createElement('img');
    favoriteIcon.src = target.favorite ? 'assets/starfull.png' : 'assets/starempty.png';
    favoriteIcon.alt = target.favorite ? 'Unfavorite' : 'Favorite';
    favoriteIcon.classList.add('target-favorite');

    // Event listener to toggle favorite status
    favoriteIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the li click event
        target.favorite = !target.favorite;
        // Update targets in the main process
        ipcRenderer.send('update-targets', targets);
        // Re-populate the lists to update the grouping
        populateTargetLists(filteredTargets);
    });

    // Assemble the list item
    li.appendChild(icon);
    li.appendChild(label);
    li.appendChild(favoriteIcon);

    // Left-click to load target in the current tab
    li.addEventListener('click', () => {
        loadTarget(target);
    });

    // Right-click to open contextual menu
    li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        ipcRenderer.send('open-context-menu', {
            type: 'sidebar',
            target: target
        });
    });

    return li;
}

// Function to highlight search query in the target name
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// Load a target by object
function loadTarget(target) {
    const webview = getActiveWebview();
    if (webview) {
        webview.loadURL(target.url);
        // Update the currentURL and target for the active tab
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (activeTab) {
            activeTab.currentURL = target.url;
            activeTab.currentTarget = target;
        }
        // Update active list item
        updateActiveListItem();
    } else {
        // If no webview is active, create a new tab
        createNewTab(target.url, target.username, target);
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    filteredTargets = targets.filter(target => target.username.toLowerCase().includes(query));
    populateTargetLists(filteredTargets);
});

// Initialize the first tab
createNewTab('https://www.torn.com');

// New Tab Button
if (newTabBtn) {
    newTabBtn.addEventListener('click', () => {
        createNewTab('https://www.torn.com');
    });
}

// Function to create a new tab
function createNewTab(url, title = 'New Tab', target = null) {
    const tabId = `tab-${Date.now()}`;

    // Create tab element
    const tabElement = document.createElement('div');
    tabElement.classList.add('tab');
    tabElement.id = tabId;
    tabElement.textContent = title;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.textContent = '✖';
    tabElement.appendChild(closeBtn);

    // Tab click event
    tabElement.addEventListener('click', () => {
        setActiveTab(tabId);
    });

    // Close button event
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tabId);
    });

    tabsContainer.appendChild(tabElement);

    // Create webview
    const webviewElement = document.createElement('webview');
    webviewElement.src = url;
    webviewElement.setAttribute('disableguestresize', '');
    webviewElement.classList.add('webview');
    webviewElement.id = `webview-${tabId}`;
    webviewElement.setAttribute('nodeintegration', 'false');
    webviewElement.setAttribute('contextIsolation', 'true');

    // Handle webview events
    webviewElement.addEventListener('page-title-updated', (e) => {
        tabElement.textContent = e.title;
        tabElement.appendChild(closeBtn);
    });

    webviewElement.addEventListener('did-start-loading', () => {
        loadingOverlay.style.display = 'flex';
    });

    webviewElement.addEventListener('did-stop-loading', () => {
        loadingOverlay.style.display = 'none';
    });

    // Listen for navigation events to update current URL and active list item
    webviewElement.addEventListener('did-navigate', (e) => {
        const tab = tabs.find((tab) => tab.id === tabId);
        if (tab) {
            tab.currentURL = e.url;
            tab.currentTarget = findTargetByUrl(e.url);
            if (activeTabId === tabId) {
                updateActiveListItem();
            }
        }
    });

    webviewElement.addEventListener('did-navigate-in-page', (e) => {
        const tab = tabs.find((tab) => tab.id === tabId);
        if (tab) {
            tab.currentURL = e.url;
            tab.currentTarget = findTargetByUrl(e.url);
            if (activeTabId === tabId) {
                updateActiveListItem();
            }
        }
    });

    // Handle context menu events from webview
    webviewElement.addEventListener('ipc-message', (event) => {
        if (event.channel === 'show-webview-context-menu') {
            const params = event.args[0];
            ipcRenderer.send('open-context-menu', {
                type: 'webview',
                params: params
            });
        } else {
            handleIpcMessage(event);
        }
    });

    // Append webview to container
    webviewContainer.appendChild(webviewElement);

    // Add to tabs array
    tabs.push({
        id: tabId,
        tabElement: tabElement,
        webviewElement: webviewElement,
        currentURL: url,
        currentTarget: target
    });

    // Set as active tab
    setActiveTab(tabId);
}

// Function to set active tab
function setActiveTab(tabId) {
    activeTabId = tabId;
    tabs.forEach((tab) => {
        if (tab.id === tabId) {
            tab.tabElement.classList.add('active');
            tab.webviewElement.classList.add('active');
        } else {
            tab.tabElement.classList.remove('active');
            tab.webviewElement.classList.remove('active');
        }
    });
    // Attach event listeners to the active webview
    attachWebviewEventListeners();
    // Update active list item based on the active tab
    updateActiveListItem();
}

// Function to close a tab
function closeTab(tabId) {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
        // Remove tab element
        tab.tabElement.remove();
        // Remove webview element
        tab.webviewElement.remove();
        // Remove from tabs array
        tabs = tabs.filter((t) => t.id !== tabId);
        // If the closed tab was active, set another tab as active
        if (activeTabId === tabId) {
            if (tabs.length > 0) {
                setActiveTab(tabs[tabs.length - 1].id);
            } else {
                // No tabs left; create a new tab
                createNewTab('https://www.torn.com');
            }
        }
    }
}

// Function to get the active webview
function getActiveWebview() {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    return activeTab ? activeTab.webviewElement : null;
}

// Function to find a target by URL
function findTargetByUrl(url) {
    return targets.find(target => target.url === url);
}

// Function to update the active list item based on the current URL
function updateActiveListItem() {
    // Remove 'active' class from all list items
    const allListItems = document.querySelectorAll('#favoritesList li, #targetList li');
    allListItems.forEach(li => li.classList.remove('active'));

    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab && activeTab.currentTarget) {
        const targetUsername = activeTab.currentTarget.username;
        // Find the corresponding list item
        const listItem = document.querySelector(`li[data-username="${targetUsername}"]`);
        if (listItem) {
            listItem.classList.add('active');
            // Optionally, scroll into view
            listItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}

// Update navigation buttons to use the active webview
homeBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview) {
        webview.loadURL('https://www.torn.com');
    }
});

prevBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoBack()) {
        webview.goBack();
    }
});

nextBtn.addEventListener('click', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoForward()) {
        webview.goForward();
    }
});

// Handle keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (e.target.tagName.toLowerCase() === 'input') {
        // Ignore when typing in input fields
        return;
    }

    // Sidebar and Theme Toggle Shortcuts
    if (e.ctrlKey && e.key === 'b') { // Ctrl + B to toggle sidebar
        toggleSidebarBtn.click();
    }

    if (e.ctrlKey && e.key === 't') { // Ctrl + T to toggle theme
        themeToggleBtn.click();
    }

    // New Tab Shortcut
    if (e.ctrlKey && e.key === 'n') { // Ctrl + N to open a new tab
        createNewTab('https://www.torn.com');
    }

    // Close Tab Shortcut
    if (e.ctrlKey && e.key === 'w') { // Ctrl + W to close current tab
        closeTab(activeTabId);
    }

    // Navigation and Refresh Shortcuts
    const webview = getActiveWebview();
    if (webview) {
        switch (e.key) {
            case 'Backspace':
                if (webview.canGoBack()) {
                    webview.goBack();
                }
                break;
            case 'F5':
                webview.reload();
                break;
            default:
                break;
        }
    }
});

// Handle webview events from the active webview
function attachWebviewEventListeners() {
    const webview = getActiveWebview();
    if (webview) {
        // Remove existing listeners to prevent duplicates
        webview.removeEventListener('ipc-message', handleIpcMessage);

        // Add new listener
        webview.addEventListener('ipc-message', handleIpcMessage);
    }
}

function handleIpcMessage(event) {
    if (event.channel === 'webview-keydown') {
        const e = event.args[0];
        handleWebviewKeyDown(e);
    } else if (event.channel === 'webview-mouseup') {
        const e = event.args[0];
        handleWebviewMouseUp(e);
    }
}

// Handle webview keyboard events
function handleWebviewKeyDown(e) {
    const webview = getActiveWebview();
    if (webview) {
        switch (e.key) {
            case 'Backspace':
                if (webview.canGoBack()) {
                    webview.goBack();
                }
                break;
            case 'F5':
                webview.reload();
                break;
            default:
                break;
        }
    }
}

// Handle webview mouse events
function handleWebviewMouseUp(e) {
    const webview = getActiveWebview();
    if (webview) {
        if (e.button === 3) { // Mouse back button
            if (webview.canGoBack()) {
                webview.goBack();
            }
        } else if (e.button === 4) { // Mouse forward button
            if (webview.canGoForward()) {
                webview.goForward();
            }
        }
    }
}

// Toggle Sidebar Functionality
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    saveSidebarState();
});

// Save Sidebar State to localStorage
function saveSidebarState() {
    try {
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    } catch (error) {
        console.error('Error saving sidebar state:', error);
    }
}

// Load Sidebar State from localStorage
function loadSidebarState() {
    try {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    } catch (error) {
        console.error('Error loading sidebar state:', error);
    }
}

// Theme Toggle Functionality with Persistence
themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    updateThemeIcon();
    saveThemePreference();
});

// Function to update the theme icon
function updateThemeIcon() {
    if (body.classList.contains('light-mode')) {
        themeIcon.src = 'assets/moon.png';
        themeIcon.alt = 'Dark Mode';
    } else {
        themeIcon.src = 'assets/sun.png';
        themeIcon.alt = 'Light Mode';
    }
}

// Function to save theme preference
function saveThemePreference() {
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

// Load Saved Theme on Startup
function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
    } catch (error) {
        console.error('Error loading saved theme:', error);
    }
    updateThemeIcon();
}

// Save and Load Group Heights
function saveGroupHeights() {
    try {
        const favoritesHeight = favoritesGroup.offsetHeight;
        const othersHeight = othersGroup.offsetHeight;
        const totalHeight = favoritesHeight + othersHeight;

        // Save the heights as percentages to handle different window sizes
        const favoritesRatio = favoritesHeight / totalHeight;
        const othersRatio = othersHeight / totalHeight;

        localStorage.setItem('favoritesRatio', favoritesRatio);
        localStorage.setItem('othersRatio', othersRatio);
    } catch (error) {
        console.error('Error saving group heights:', error);
    }
}

function loadGroupHeights() {
    try {
        const favoritesRatio = parseFloat(localStorage.getItem('favoritesRatio'));
        const othersRatio = parseFloat(localStorage.getItem('othersRatio'));

        if (!isNaN(favoritesRatio) && !isNaN(othersRatio)) {
            // Get the total available height
            const totalHeight = favoritesGroup.parentElement.offsetHeight - divider.offsetHeight;

            const favoritesHeight = totalHeight * favoritesRatio;
            const othersHeight = totalHeight * othersRatio;

            favoritesGroup.style.height = `${favoritesHeight}px`;
            othersGroup.style.height = `${othersHeight}px`;
        }
    } catch (error) {
        console.error('Error loading group heights:', error);
    }
}

// Adjust group heights when window is resized
window.addEventListener('resize', () => {
    // Recalculate heights based on saved ratios
    loadGroupHeights();
});

// Initialize the app
loadSidebarState();
loadSavedTheme();
loadGroupHeights(); // Load the group heights

// Handle IPC messages for opening target in new tab
ipcRenderer.on('open-target-in-new-tab', (event, data) => {
    const { target } = data;
    createNewTab(target.url, target.username, target);
});

// Handle IPC messages for opening target in current tab
ipcRenderer.on('open-target-in-current-tab', (event, data) => {
    const { url } = data;
    const webview = getActiveWebview();
    if (webview) {
        webview.loadURL(url);
        // Update current target in active tab
        const activeTab = tabs.find((tab) => tab.id === activeTabId);
        if (activeTab) {
            activeTab.currentURL = url;
            activeTab.currentTarget = findTargetByUrl(url);
        }
        updateActiveListItem();
    } else {
        // If no webview is active, create a new tab
        createNewTab(url);
    }
});

// Handle IPC messages for opening link in new tab from webview
ipcRenderer.on('open-link-in-new-tab', (event, url) => {
    createNewTab(url);
});

// Handle export success and failure
ipcRenderer.on('export-success', (event, filePath) => {
    alert(`Targets exported successfully to ${filePath}`);
});

ipcRenderer.on('export-failure', (event, errorMessage) => {
    alert(`Failed to export targets: ${errorMessage}`);
});

// Handle import success and failure
ipcRenderer.on('import-success', () => {
    alert('Targets imported successfully.');
    // Refresh the target list
    ipcRenderer.send('request-targets');
});

ipcRenderer.on('import-failure', (event, errorMessage) => {
    alert(`Failed to import targets: ${errorMessage}`);
});

// Handle webview navigation commands from main process
ipcRenderer.on('webview-go-back', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoBack()) {
        webview.goBack();
    }
});

ipcRenderer.on('webview-go-forward', () => {
    const webview = getActiveWebview();
    if (webview && webview.canGoForward()) {
        webview.goForward();
    }
});

ipcRenderer.on('webview-reload', () => {
    const webview = getActiveWebview();
    if (webview) {
        webview.reload();
    }
});

ipcRenderer.on('webview-inspect-element', (event, x, y) => {
    const webview = getActiveWebview();
    if (webview) {
        webview.inspectElement(x, y);
    }
});

// Export Targets
exportBtn.addEventListener('click', () => {
    ipcRenderer.send('export-targets');
});

// Import Targets
importBtn.addEventListener('click', () => {
    ipcRenderer.send('import-targets');
});

// Add Target Button
addTargetBtn.addEventListener('click', () => {
    ipcRenderer.send('open-add-target-dialog');
});

// Draggable Divider Functionality
let isDragging = false;
let startY = 0;
let startFavoritesHeight = 0;
let startOthersHeight = 0;

divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startFavoritesHeight = favoritesGroup.offsetHeight;
    startOthersHeight = othersGroup.offsetHeight;
    document.body.style.cursor = 'row-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dy = e.clientY - startY;
    const newFavoritesHeight = startFavoritesHeight + dy;
    const newOthersHeight = startOthersHeight - dy;

    // Set minimum heights to prevent collapse
    const minHeight = 50; // Minimum height in pixels
    if (newFavoritesHeight < minHeight || newOthersHeight < minHeight) return;

    favoritesGroup.style.height = `${newFavoritesHeight}px`;
    othersGroup.style.height = `${newOthersHeight}px`;

    e.preventDefault();
});

document.addEventListener('mouseup', (e) => {
    if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
        // Save the adjusted heights
        saveGroupHeights();
    }
});

// Sort Functionality

// Event listener for favorites sort icon
favoritesSortIcon.addEventListener('click', () => {
    favoritesSortOrder = favoritesSortOrder === 'asc' ? 'desc' : 'asc';
    populateTargetLists(filteredTargets);
    // Rotate the icon to indicate sort order
    updateSortIcon(favoritesSortIcon, favoritesSortOrder);
});

// Event listener for others sort icon
othersSortIcon.addEventListener('click', () => {
    othersSortOrder = othersSortOrder === 'asc' ? 'desc' : 'asc';
    populateTargetLists(filteredTargets);
    // Rotate the icon to indicate sort order
    updateSortIcon(othersSortIcon, othersSortOrder);
});

// Function to update sort icon rotation based on sort order
function updateSortIcon(iconElement, sortOrder) {
    if (sortOrder === 'asc') {
        iconElement.style.transform = 'rotate(0deg)';
    } else {
        iconElement.style.transform = 'rotate(180deg)';
    }
}

// Initialize sort icons
updateSortIcon(favoritesSortIcon, favoritesSortOrder);
updateSortIcon(othersSortIcon, othersSortOrder);

// API Key Button
apiKeyBtn.addEventListener('click', () => {
    ipcRenderer.send('open-api-key-dialog');
});

// Function to start updating player statuses every minute
function startUpdatingPlayerStatuses() {
    // Start the interval to update player statuses
    updatePlayerStatuses(); // Call immediately
    setInterval(updatePlayerStatuses, 60 * 1000); // Every minute
}

// Function to extract user ID from target URL
function extractUserIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        const XID = searchParams.get('XID');
        if (XID) {
            return XID;
        } else {
            // Try to extract from the hash
            // For example, if the URL is https://www.torn.com/profiles.php#/p=123456
            const hash = urlObj.hash;
            const match = hash.match(/p=(\d+)/);
            if (match && match[1]) {
                return match[1];
            } else {
                console.warn('Unable to extract user ID from URL:', url);
                return null;
            }
        }
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
}

// Function to update player statuses
function updatePlayerStatuses() {
    if (!apiKey) {
        console.error('API key is not set.');
        return;
    }

    console.log('Starting updatePlayerStatuses');

    // Split the targets into two batches
    const batchSize = Math.ceil(targets.length / 2);
    const start = currentBatchIndex * batchSize;
    const end = Math.min(start + batchSize, targets.length);
    const batchTargets = targets.slice(start, end);

    // Toggle between batches
    currentBatchIndex = (currentBatchIndex + 1) % 2;

    const userIdMap = {}; // Map of userId to target
    const userIds = batchTargets.map(target => {
        const userId = extractUserIdFromUrl(target.url);
        if (userId) {
            userIdMap[userId] = target;
            return userId;
        } else {
            console.warn(`Could not extract user ID from URL: ${target.url}`);
            return null;
        }
    }).filter(id => id !== null);

    console.log(`Collected ${userIds.length} user IDs in batch ${currentBatchIndex}`);

    if (userIds.length === 0) {
        console.log('No user IDs to update in this batch.');
        return;
    }

    const promises = userIds.map((userId, index) => {
        const url = `https://api.torn.com/user/${userId}?selections=profile&key=${apiKey}`;

        console.log(`Fetching user ${index + 1}/${userIds.length}: ${url}`);

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error from API:', data.error);
                    return;
                }

                if (!data.status || !data.status.state) {
                    console.warn(`Missing status data for user ID: ${userId}`);
                    return;
                }

                const status = data.status.state;

                // Update the target object
                const target = userIdMap[userId];
                if (target) {
                    target.status = status;
                    console.log(`Updated status for ${target.username} (ID: ${userId}): ${status}`);
                } else {
                    console.warn(`Target not found for user ID: ${userId}`);
                }
            })
            .catch(error => {
                console.error('Error fetching user status:', error);
            });
    });

    // After all requests are processed, update the UI
    Promise.all(promises).then(() => {
        console.log('All user statuses in batch updated. Updating UI.');
        populateTargetLists(filteredTargets);
    });
}
