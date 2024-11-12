// main.js
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let addTargetWindow;
let editTargetWindow;

// Function to get the path to targets.json in userData directory
function getTargetsPath() {
    return path.join(app.getPath('userData'), 'targets.json');
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
            preload: path.join(__dirname, 'preload.js') // Preload script
        },
        darkTheme: true,
        autoHideMenuBar: true, // Auto-hide menu bar
        icon: path.join(__dirname, 'assets', 'icon.png') // Add app icon if needed
    });

    mainWindow.loadFile('index.html');

    // Maximize the window upon creation
    mainWindow.maximize();

    // Uncomment the line below to open DevTools for debugging
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Ensure targets.json exists
    const targetsPath = getTargetsPath();
    if (!fs.existsSync(targetsPath)) {
        fs.writeFileSync(targetsPath, JSON.stringify({ "targets": [] }, null, 2), 'utf-8');
    }
}

// Function to create the Add Target dialog
function createAddTargetWindow() {
    addTargetWindow = new BrowserWindow({
        width: 400,
        height: 500, // Adjusted height to accommodate additional fields
        parent: mainWindow,
        modal: true,
        show: false,
        autoHideMenuBar: true, // Auto-hide menu bar
        menu: null, // Remove menu completely
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
    editTargetWindow = new BrowserWindow({
        width: 400,
        height: 500, // Adjusted height to accommodate additional fields
        parent: mainWindow,
        modal: true,
        show: false,
        autoHideMenuBar: true, // Auto-hide menu bar
        menu: null, // Remove menu completely
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
                        // **Send updated targets back to renderer**
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
                    require('electron').clipboard.writeText(target.url);
                }
            },
            { type: 'separator' },
            {
                label: 'Edit',
                click: () => {
                    ipcMain.emit('edit-target', mainWindow, target);
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
                            ipcMain.emit('delete-target', mainWindow, target.username);
                        }
                    });
                }
            }
        ];
    } else if (params.type === 'webview') {
        const href = params.params.href;
        if (href) {
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
                        require('electron').clipboard.writeText(href);
                    }
                }
            ];
        } else {
            // No link clicked; general context menu
            template = [
                {
                    label: 'Back',
                    click: () => {
                        mainWindow.webContents.send('webview-go-back');
                    }
                },
                {
                    label: 'Forward',
                    click: () => {
                        mainWindow.webContents.send('webview-go-forward');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    click: () => {
                        mainWindow.webContents.send('webview-reload');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Inspect Element',
                    click: () => {
                        mainWindow.webContents.send('webview-inspect-element', params.params.x, params.params.y);
                    }
                }
            ];
        }
    }

    const menu = Menu.buildFromTemplate(template);
    menu.popup(BrowserWindow.fromWebContents(mainWindow.webContents));
}

// Function to read targets from the JSON file
function readTargets() {
    try {
        const targetsPath = getTargetsPath();
        const data = fs.readFileSync(targetsPath, 'utf-8');
        const json = JSON.parse(data);
        return json.targets;
    } catch (error) {
        console.error('Error reading targets data:', error);
        return [];
    }
}

// Function to write targets to the JSON file
function writeTargets(targets) {
    try {
        const targetsPath = getTargetsPath();
        fs.writeFileSync(targetsPath, JSON.stringify({ "targets": targets }, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing targets data:', error);
    }
}

// Create the main window when Electron is ready
app.whenReady().then(() => {
    createMainWindow();

    // Listen for 'open-add-target-dialog' event from renderer
    ipcMain.on('open-add-target-dialog', () => {
        if (!addTargetWindow) {
            createAddTargetWindow();
        }
    });

    // Listen for 'add-target' event from target dialog
    ipcMain.on('add-target', (event, newTarget) => {
        const targetsPath = getTargetsPath();

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

            // **Notify main window to refresh targets**
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
    });

    // Listen for 'close-add-target-dialog' event from target dialog
    ipcMain.on('close-add-target-dialog', () => {
        if (addTargetWindow) {
            addTargetWindow.close();
        }
    });

    // Listen for 'edit-target' event to open edit dialog
    ipcMain.on('edit-target', (event, target) => {
        if (!editTargetWindow) {
            createEditTargetWindow(target);
        }
    });

    // Listen for 'update-target' event from edit dialog
    ipcMain.on('update-target', (event, { originalUsername, updatedTarget }) => {
        const targetsPath = getTargetsPath();

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

            // **Notify main window to refresh targets**
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
    });

    // Listen for 'delete-target' event to delete a target
    ipcMain.on('delete-target', (event, targetUsername) => {
        const targetsPath = getTargetsPath();

        try {
            let targets = readTargets();

            // Filter out the target to be deleted
            const updatedTargets = targets.filter(target => target.username !== targetUsername);

            if (updatedTargets.length === targets.length) {
                dialog.showErrorBox('Deletion Error', `Target "${targetUsername}" not found.`);
                return;
            }

            writeTargets(updatedTargets);

            // **Notify main window to refresh targets**
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
    });

    // Listen for 'request-targets' event from renderer
    ipcMain.on('request-targets', (event) => {
        const targets = readTargets();
        event.sender.send('send-targets', { targets });
    });

    // Listen for 'update-targets' event from renderer (e.g., when favorites are toggled)
    ipcMain.on('update-targets', (event, updatedTargets) => {
        writeTargets(updatedTargets);
        // **Send updated targets back to renderer**
        mainWindow.webContents.send('send-targets', { targets: updatedTargets });
    });

    // Listen for 'open-context-menu' event to show contextual menu
    ipcMain.on('open-context-menu', (event, data) => {
        createContextMenu(data);
    });

    // Handle 'open-link-in-new-tab' from context menu in webview
    ipcMain.on('open-link-in-new-tab', (event, url) => {
        mainWindow.webContents.send('open-link-in-new-tab', url);
    });

    // Handle 'open-target-in-new-tab' from context menu in sidebar
    ipcMain.on('open-target-in-new-tab', (event, target) => {
        mainWindow.webContents.send('open-target-in-new-tab', { target });
    });

    // **Export Targets**
    ipcMain.on('export-targets', async (event) => {
        const targetsPath = getTargetsPath();
        try {
            const data = fs.readFileSync(targetsPath, 'utf-8');

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
    });

    // **Import Targets**
    ipcMain.on('import-targets', async (event) => {
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

            // **Notify main window to refresh targets**
            if (mainWindow) {
                mainWindow.webContents.send('send-targets', { targets: combinedTargets });
            }
        } catch (error) {
            console.error('Error importing targets:', error);
            event.sender.send('import-failure', error.message);
        }
    });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// Re-create a window when the dock icon is clicked (macOS)
app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
