
# 🎯 Torn Chainer

![App Logo](https://github.com/skillerious/TornChainer/blob/main/logo/tornapplogonew.png)

Welcome to **Target Manager**, a powerful and user-friendly Electron-based application designed to help you manage your targets efficiently. Whether you're organizing your favorite websites, keeping track of important links, or simply browsing the web, Target Manager offers a seamless experience with a sleek interface and robust features.

## 🚀 Features

- **Tabbed Browsing:** Open multiple web pages in separate tabs, each with its own `<webview>`.
- **Favorites & Others:** Organize your targets into Favorites and Others for easy access.
- **Search Functionality:** Quickly find targets using the integrated search bar.
- **Add, Edit, Delete Targets:** Easily manage your list of targets with intuitive dialogs.
- **Context Menus:** Right-click on items to access quick actions like opening in a new tab or editing.
- **Drag-and-Drop Sidebar Divider:** Customize the height of Favorites and Others sections to suit your preferences.
- **Export & Import:** Backup your targets or import them from a JSON file effortlessly.
- **Dark & Light Themes:** Switch between dark and light modes with persistent settings.
- **Custom Scrollbars:** Enjoy consistent scrollbar styles across the sidebar and webviews.
- **Responsive Design:** The application starts maximized and adapts to different screen sizes.
- **Empty State Indicators:** Visual feedback when no targets are present in Favorites or Others.
- **Highlight Current Item:** The currently opened target in the Others list is highlighted for easy identification.
- **Sorting Icons:** Small sorting icons next to "Favorites" and "Others" enhance the UI and indicate sorting functionality.

## 📸 Screenshots

![Main Interface](https://github.com/skillerious/TornChainer/blob/main/logo/Screenshot%202024-11-10%20195637.png)
*Main interface showcasing Favorites and Others.*

![Add Target Dialog](https://github.com/skillerious/TornChainer/blob/main/logo/Screenshot%202024-11-10%20195650.png)
*Add Target dialog with additional fields.*

## 🛠️ Installation

### Prerequisites

- **Node.js** (v14 or later)
- **npm** (v6 or later)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/target-manager-electron-app.git
   cd target-manager-electron-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Application**

   ```bash
   npm start
   ```

## 🧩 Usage

### Adding a New Target

1. Click on the **Add Target** button in the sidebar.
2. Fill in the required fields in the dialog.
3. Click **Add** to save the target.

### Editing a Target

1. Right-click on a target in the **Favorites** or **Others** list.
2. Select **Edit** from the context menu.
3. Modify the necessary fields in the dialog.
4. Click **Save** to update the target.

### Deleting a Target

1. Right-click on the target you wish to delete.
2. Select **Delete** from the context menu.
3. Confirm the deletion in the prompt.

### Highlighting the Current Item

- The currently opened target in the **Others** list is highlighted, making it easy to identify which target is active.

### Managing Tabs

- **Open a New Tab:** Click the **+** button in the tab bar or use the shortcut `Ctrl + N`.
- **Close a Tab:** Click the **x** on the tab or use the shortcut `Ctrl + W`.
- **Navigate Tabs:** Use the **Home**, **Back**, and **Forward** buttons in the toolbar or keyboard shortcuts.

### Theme Switching

- Click on the **Theme Toggle** button (sun/moon icon) in the toolbar or use the shortcut `Ctrl + T` to switch between dark and light modes.

### Exporting & Importing Targets

- **Export Targets:** Use the export button to back up your target list to a JSON file.
- **Import Targets:** Use the import button to restore a list from a JSON file, which will merge with existing targets.

## ⚙️ Configuration

- The app's settings, including window size and theme, are saved between sessions for a seamless experience.
- Target data is stored locally in `targets.json` located in the user data directory.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature suggestions.

---

Thank you for using **Target Manager**! Happy organizing! 🎉
