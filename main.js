// main.js
const { app, BrowserWindow, ipcMain, Menu, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let addTargetWindow;
let editTargetWindow;
let apiKeyWindow;

// Paths to JSON files in userData directory
function getTargetsPath() {
    return path.join(app.getPath('userData'), 'targets.json');
}

function getConfigPath() {
    return path.join(app.getPath('userData'), 'config.json');
}

// Read config from JSON file
function readConfig() {
    try {
        const configPath = getConfigPath();
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } else {
            return {};
        }
    } catch (error) {
        console.error('Error reading config data:', error);
        return {};
    }
}

// Write config to JSON file
function writeConfig(config) {
    try {
        const configPath = getConfigPath();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing config data:', error);
    }
}

// Read targets from JSON file
function readTargets() {
    try {
        const targetsPath = getTargetsPath();
        if (!fs.existsSync(targetsPath)) {
            fs.writeFileSync(targetsPath, JSON.stringify({ targets: [] }, null, 2), 'utf-8');
        }
        const data = fs.readFileSync(targetsPath, 'utf-8');
        const json = JSON.parse(data);
        return json.targets;
    } catch (error) {
        console.error('Error reading targets data:', error);
        return [];
    }
}

// Write targets to JSON file
function writeTargets(targets) {
    try {
        const targetsPath = getTargetsPath();
        fs.writeFileSync(targetsPath, JSON.stringify({ targets }, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing targets data:', error);
    }
}

// Function to create the main application window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,   // Enable Node.js integration
            contextIsolation: false, // Disable context isolation
            webviewTag: true,        // Enable <webview> tag
        },
        darkTheme: true,
        autoHideMenuBar: true, // Auto-hide menu bar
        icon: path.join(__dirname, 'assets', 'icon.png'), // Add app icon if needed
    });

    mainWindow.loadFile('index.html');

    // Maximize the window upon creation
    mainWindow.maximize();

    // Uncomment the line below to open DevTools for debugging
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Send existing targets to renderer once the main window has finished loading
    mainWindow.webContents.on('did-finish-load', () => {
        const targets = readTargets();
        mainWindow.webContents.send('send-targets', { targets });
    });
}

// Function to create the Add Target dialog
function createAddTargetWindow() {
    if (addTargetWindow) {
        addTargetWindow.focus();
        return;
    }

    addTargetWindow = new BrowserWindow({
        width: 500,
        height: 550,
        parent: mainWindow,
        modal: true,
        show: false,
        center: true, // Ensure the window is centered
        autoHideMenuBar: true, // Auto-hide menu bar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    addTargetWindow.loadFile('targetdialog.html');

    addTargetWindow.once('ready-to-show', () => {
        addTargetWindow.show();
    });

    addTargetWindow.on('closed', () => {
        addTargetWindow = null;
    });
}

// Function to create the Edit Target dialog
function createEditTargetWindow(target) {
    if (editTargetWindow) {
        editTargetWindow.focus();
        return;
    }

    editTargetWindow = new BrowserWindow({
        width: 500,
        height: 550,
        parent: mainWindow,
        modal: true,
        show: false,
        center: true, // Ensure the window is centered
        autoHideMenuBar: true, // Auto-hide menu bar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    editTargetWindow.loadFile('editdialog.html');

    editTargetWindow.once('ready-to-show', () => {
        editTargetWindow.show();
        // Send the target data to the edit dialog
        editTargetWindow.webContents.send('edit-target-data', target);
    });

    editTargetWindow.on('closed', () => {
        editTargetWindow = null;
    });
}

// Function to create the API Key dialog
function createApiKeyWindow() {
    if (apiKeyWindow) {
        apiKeyWindow.focus();
        return;
    }

    apiKeyWindow = new BrowserWindow({
        width: 500,
        height: 400,
        parent: mainWindow,
        modal: true,
        show: false,
        center: true, // Ensure the window is centered
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    apiKeyWindow.loadFile('apikeydialog.html');

    apiKeyWindow.once('ready-to-show', () => {
        apiKeyWindow.show();
    });

    apiKeyWindow.on('closed', () => {
        apiKeyWindow = null;
    });
}

// Function to create a context menu
function createContextMenu(params) {
    let template = [];

    if (params.type === 'sidebar') {
        const target = params.target;
        template = [
            {
                label: target.favorite ? 'Remove from Favorites' : 'Add to Favorites',
                click: () => {
                    const targets = readTargets();
                    const targetIndex = targets.findIndex(t => t.username === target.username);
                    if (targetIndex !== -1) {
                        targets[targetIndex].favorite = !targets[targetIndex].favorite;
                        writeTargets(targets);
                        // Send updated targets back to renderer
                        mainWindow.webContents.send('send-targets', { targets });
                    }
                }
            },
            {
                label: 'Open in Current Tab',
                click: () => {
                    mainWindow.webContents.send('open-target-in-current-tab', { url: target.url });
                }
            },
            {
                label: 'Open in New Tab',
                click: () => {
                    mainWindow.webContents.send('open-target-in-new-tab', { target });
                }
            },
            { type: 'separator' },
            {
                label: 'Copy URL',
                click: () => {
                    clipboard.writeText(target.url);
                }
            },
            { type: 'separator' },
            {
                label: 'Edit',
                click: () => {
                    createEditTargetWindow(target); // Directly create the edit dialog
                }
            },
            {
                label: 'Delete',
                click: () => {
                    // Confirm deletion
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        buttons: ['Cancel', 'Delete'],
                        defaultId: 1,
                        cancelId: 0,
                        title: 'Confirm Deletion',
                        message: `Are you sure you want to delete target "${target.username}"?`,
                    }).then(result => {
                        if (result.response === 1) { // 'Delete' button index
                            deleteTarget(target.username); // Directly handle deletion
                        }
                    }).catch(err => {
                        console.error('Error showing deletion dialog:', err);
                    });
                }
            }
        ];
    } else if (params.type === 'webview') {
        const href = params.params.href;
        if (href) {
            // User right-clicked on a link
            template = [
                {
                    label: 'Open Link in New Tab',
                    click: () => {
                        mainWindow.webContents.send('open-link-in-new-tab', href);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Copy Link Address',
                    click: () => {
                        clipboard.writeText(href);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    click: () => {
                        mainWindow.webContents.send('reload-current-tab');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Inspect Element',
                    click: () => {
                        mainWindow.webContents.send('inspect-element', { x: params.params.x, y: params.params.y });
                    }
                }
            ];
        } else {
            // User right-clicked elsewhere
            template = [
                {
                    label: 'Reload',
                    click: () => {
                        mainWindow.webContents.send('reload-current-tab');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Inspect Element',
                    click: () => {
                        mainWindow.webContents.send('inspect-element', { x: params.params.x, y: params.params.y });
                    }
                }
            ];
        }
    }

    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: BrowserWindow.fromWebContents(mainWindow.webContents) });
}

// Function to delete a target
function deleteTarget(targetUsername) {
    try {
        let targets = readTargets();

        // Filter out the target to be deleted
        const updatedTargets = targets.filter(target => target.username !== targetUsername);

        if (updatedTargets.length === targets.length) {
            dialog.showErrorBox('Deletion Error', `Target "${targetUsername}" not found.`);
            return;
        }

        writeTargets(updatedTargets);

        // Notify main window to refresh targets
        if (mainWindow) {
            mainWindow.webContents.send('send-targets', { targets: updatedTargets });
        }

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Deletion Successful',
            message: `Target "${targetUsername}" has been deleted successfully.`,
        });
    } catch (error) {
        console.error('Error deleting target:', error);
        dialog.showErrorBox('Deletion Error', 'Failed to delete the target. Please check the console for details.');
    }
}

// Function to copy text to clipboard
function copyToClipboard(text) {
    clipboard.writeText(text);
    // Optionally, notify renderer of success
    // mainWindow.webContents.send('copy-to-clipboard-success');
}

// Function to handle exporting targets
async function handleExportTargets(event) {
    try {
        const targets = readTargets();
        const data = JSON.stringify({ targets }, null, 2);

        // Show save dialog
        const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
            title: 'Export Targets',
            defaultPath: 'targets.json',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (canceled || !filePath) return;

        // Write data to selected file
        fs.writeFileSync(filePath, data, 'utf-8');
        event.sender.send('export-success', filePath);
    } catch (error) {
        console.error('Error exporting targets:', error);
        event.sender.send('export-failure', error.message);
    }
}

// Function to handle importing targets
async function handleImportTargets(event) {
    try {
        // Show open dialog
        const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
            title: 'Import Targets',
            filters: [{ name: 'JSON Files', extensions: ['json'] }],
            properties: ['openFile']
        });

        if (canceled || filePaths.length === 0) return;

        const importPath = filePaths[0];
        const data = fs.readFileSync(importPath, 'utf-8');
        const importedJson = JSON.parse(data);

        // Validate imported data
        if (!Array.isArray(importedJson.targets)) {
            throw new Error('Invalid format: "targets" array not found.');
        }

        const existingTargets = readTargets();

        // Merge targets, avoiding duplicates
        const combinedTargets = [...existingTargets];

        importedJson.targets.forEach((newTarget) => {
            const exists = combinedTargets.some(
                (target) => target.username.toLowerCase() === newTarget.username.toLowerCase()
            );
            if (!exists) {
                combinedTargets.push(newTarget);
            }
        });

        writeTargets(combinedTargets);

        event.sender.send('import-success');

        // Notify main window to refresh targets
        if (mainWindow) {
            mainWindow.webContents.send('send-targets', { targets: combinedTargets });
        }
    } catch (error) {
        console.error('Error importing targets:', error);
        event.sender.send('import-failure', error.message);
    }
}

// Function to handle saving API key
function handleSaveApiKey(event, apiKey) {
    try {
        const config = readConfig();
        config.apiKey = apiKey;
        writeConfig(config);

        // Notify renderer process that API key is updated
        if (mainWindow) {
            mainWindow.webContents.send('api-key-updated', apiKey);
        }

        // Close the API key window
        if (apiKeyWindow) {
            apiKeyWindow.close();
        }

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'API Key Saved',
            message: 'Your API key has been saved successfully.',
        });
    } catch (error) {
        console.error('Error saving API key:', error);
        dialog.showErrorBox('API Key Error', 'Failed to save the API key. Please check the console for details.');
    }
}

// Function to handle updating a target
function handleUpdateTarget(event, { originalUsername, updatedTarget }) {
    try {
        const targets = readTargets();

        // If username has changed, check for duplicates
        if (originalUsername.toLowerCase() !== updatedTarget.username.toLowerCase()) {
            const exists = targets.some(target => target.username.toLowerCase() === updatedTarget.username.toLowerCase());
            if (exists) {
                dialog.showErrorBox('Update Error', 'Username already exists. Please choose a different username.');
                return;
            }
        }

        // Find the target to update
        const targetIndex = targets.findIndex(target => target.username === originalUsername);
        if (targetIndex === -1) {
            dialog.showErrorBox('Update Error', `Original target "${originalUsername}" not found.`);
            return;
        }

        // Preserve the favorite status
        updatedTarget.favorite = targets[targetIndex].favorite || false;

        // Update the target
        targets[targetIndex] = updatedTarget;
        writeTargets(targets);

        // Notify main window to refresh targets
        if (mainWindow) {
            mainWindow.webContents.send('send-targets', { targets });
        }

        // Close the edit dialog
        if (editTargetWindow) {
            editTargetWindow.close();
        }

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Update Successful',
            message: `Target "${originalUsername}" has been updated successfully.`,
        });
    } catch (error) {
        console.error('Error updating target:', error);
        dialog.showErrorBox('Update Error', 'Failed to update the target. Please check the console for details.');
    }
}

// Function to handle adding a new target
function handleAddTarget(event, newTarget) {
    try {
        const targets = readTargets();

        // Check if username already exists
        const exists = targets.some(target => target.username.toLowerCase() === newTarget.username.toLowerCase());
        if (exists) {
            dialog.showErrorBox('Addition Error', 'Username already exists. Please choose a different username.');
            return;
        }

        // Add new target
        targets.push(newTarget);
        writeTargets(targets);

        // Notify main window to refresh targets
        if (mainWindow) {
            mainWindow.webContents.send('send-targets', { targets });
        }

        // Close the add target dialog
        if (addTargetWindow) {
            addTargetWindow.close();
        }

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Addition Successful',
            message: `Target "${newTarget.username}" has been added successfully.`,
        });
    } catch (error) {
        console.error('Error adding new target:', error);
        dialog.showErrorBox('Addition Error', 'Failed to add the target. Please check the console for details.');
    }
}

// Function to handle opening links in new tabs
function handleOpenLinkInNewTab(event, url) {
    mainWindow.webContents.send('open-link-in-new-tab', url);
}

// Function to handle opening targets in new tabs
function handleOpenTargetInNewTab(event, data) {
    const { target } = data;
    mainWindow.webContents.send('open-target-in-new-tab', { target });
}

// Function to handle reloading the current tab
function handleReloadCurrentTab(event) {
    mainWindow.webContents.send('reload-current-tab');
}

// Function to handle inspecting elements
function handleInspectElement(event, coords) {
    mainWindow.webContents.inspectElement(coords.x, coords.y);
}

// Function to handle context menu opening
function handleOpenContextMenu(event, data) {
    createContextMenu(data);
}

// Function to handle copying to clipboard
function handleCopyToClipboard(event, text) {
    copyToClipboard(text);
}

// Create the main application window when Electron is ready
function createApp() {
    createMainWindow();

    // Read config to check for API key
    const config = readConfig();
    if (!config.apiKey) {
        // Open the API key input dialog
        createApiKeyWindow();
    }

    // Listen for 'open-add-target-dialog' event from renderer
    ipcMain.on('open-add-target-dialog', () => {
        createAddTargetWindow();
    });

    // Listen for 'add-target' event from add target dialog
    ipcMain.on('add-target', (event, newTarget) => {
        handleAddTarget(event, newTarget);
    });

    // Listen for 'close-add-target-dialog' event from add target dialog
    ipcMain.on('close-add-target-dialog', () => {
        if (addTargetWindow) {
            addTargetWindow.close();
        }
    });

    // Listen for 'open-edit-target-dialog' event from renderer
    ipcMain.on('open-edit-target-dialog', (event, target) => {
        createEditTargetWindow(target);
    });

    // Listen for 'update-target' event from edit target dialog
    ipcMain.on('update-target', (event, data) => {
        handleUpdateTarget(event, data);
    });

    // Listen for 'close-edit-target-dialog' event from edit target dialog
    ipcMain.on('close-edit-target-dialog', () => {
        if (editTargetWindow) {
            editTargetWindow.close();
        }
    });

    // Listen for 'open-api-key-dialog' event from renderer
    ipcMain.on('open-api-key-dialog', () => {
        createApiKeyWindow();
    });

    // Listen for 'save-api-key' event from API key dialog
    ipcMain.on('save-api-key', (event, apiKey) => {
        handleSaveApiKey(event, apiKey);
    });

    // Listen for 'request-api-key' event from renderer
    ipcMain.on('request-api-key', (event) => {
        const config = readConfig();
        event.sender.send('send-api-key', config.apiKey || null);
    });

    // Listen for 'copy-to-clipboard' event from renderer
    ipcMain.on('copy-to-clipboard', (event, text) => {
        handleCopyToClipboard(event, text);
    });

    // Listen for 'open-context-menu' event from renderer
    ipcMain.on('open-context-menu', (event, data) => {
        handleOpenContextMenu(event, data);
    });

    // Listen for 'export-targets' event from renderer
    ipcMain.on('export-targets', (event) => {
        handleExportTargets(event);
    });

    // Listen for 'import-targets' event from renderer
    ipcMain.on('import-targets', (event) => {
        handleImportTargets(event);
    });

    // Listen for 'open-link-in-new-tab' event from context menu
    ipcMain.on('open-link-in-new-tab', (event, url) => {
        handleOpenLinkInNewTab(event, url);
    });

    // Listen for 'open-target-in-new-tab' event from context menu
    ipcMain.on('open-target-in-new-tab', (event, data) => {
        handleOpenTargetInNewTab(event, data);
    });

    // Listen for 'reload-current-tab' event from context menu
    ipcMain.on('reload-current-tab', () => {
        handleReloadCurrentTab();
    });

    // Listen for 'inspect-element' event from context menu
    ipcMain.on('inspect-element', (event, coords) => {
        handleInspectElement(event, coords);
    });
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Focus the main window if a second instance is launched
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // Create app when ready
    app.whenReady().then(createApp);

    // Handle app lifecycle events
    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
}

// Initialize targets.json if it doesn't exist
app.on('ready', () => {
    const targetsPath = getTargetsPath();
    if (!fs.existsSync(targetsPath)) {
        fs.writeFileSync(targetsPath, JSON.stringify({ targets: [] }, null, 2), 'utf-8');
    }
});
