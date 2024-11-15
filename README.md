# 🎯 Torn Chainer

![App Logo](https://github.com/skillerious/TornChainer/blob/main/logo/tornapplogonew.png)

Welcome to **Torn Chainer**, the essential tool for **Torn Online** enthusiasts! Whether you're tracking your rivals, managing your alliances, or keeping tabs on key players, Torn Chainer provides a streamlined and efficient way to organize and access your target profiles. Enhance your Torn experience by effortlessly managing your target URLs with our feature-rich and user-friendly application.

## 🚀 Features

- **Effortless Target Management:** Easily add, edit, and delete target profile URLs to keep your important players organized.
- **Categorization:** Organize your targets into customizable categories such as Rivals, Allies, Friends, and more for quick access.
- **Search & Filter:** Quickly find specific targets using the powerful search bar and advanced filtering options.
- **Favorites:** Mark your most important targets as favorites for instant access.
- **Bulk Import & Export:** Import multiple targets from a CSV or JSON file and export your entire list for backups or sharing.
- **Custom Tags:** Assign tags to your targets for enhanced organization and easy retrieval.
- **Notes & Annotations:** Add personal notes and annotations to each target profile for detailed tracking.
- **URL Validation:** Ensure all your target URLs are valid and up-to-date with automatic validation.
- **Dark & Light Themes:** Switch between dark and light modes to suit your preference, with settings saved between sessions.
- **Responsive Design:** Optimized for various screen sizes, ensuring a seamless experience on desktops, laptops, and tablets.
- **Context Menus:** Right-click on any target to access quick actions like opening the profile, editing details, or deleting the target.
- **Drag-and-Drop Reordering:** Organize your targets and categories with intuitive drag-and-drop functionality.
- **Backup & Restore:** Securely back up your data and restore it whenever needed to prevent data loss.
- **Multi-Language Support:** Available in multiple languages to cater to a global Torn community.
- **Notifications:** Receive alerts for specific events, such as when a favorite target updates their profile.
- **Integration with Torn API:** Seamlessly connect with Torn's API to fetch and display real-time data about your targets.
- **Analytics Dashboard:** Gain insights into your target management with interactive charts and statistics.
- **Secure Data Storage:** Your data is stored locally with encryption to ensure your information remains private and secure.

## 📸 Screenshots

![Main Interface](https://github.com/skillerious/TornChainer/blob/main/logo/newinterface.png)
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
   git clone https://github.com/skillerious/TornChainer.git
   cd TornChainer
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Application**

   ```bash
   npm start
   ```

4. **Build for Production**

   To create a production-ready build, run:

   ```bash
   npm run build
   ```

## 🧩 Usage

### Getting Started

1. **Launch Torn Chainer** by running `npm start` or using the built executable from the `dist` folder.
2. **Set Up Your Account:**
   - Navigate to the **Settings** tab.
   - Enter your Torn API token to enable integration and fetch real-time data.
3. **Explore the Dashboard:** View your categorized targets, favorites, and recent activity at a glance.

### Managing Targets

#### Adding a New Target

1. Click on the **Add Target** button in the sidebar.
2. Fill in the required fields:
   - **Profile URL:** Enter the URL of the Torn profile.
   - **Category:** Select or create a category (e.g., Rival, Ally).
   - **Tags:** Add relevant tags for better organization.
   - **Notes:** Add any personal notes or annotations.
3. Click **Save** to add the target to your list.

#### Editing a Target

1. Right-click on the target you wish to edit in the **Targets** list.
2. Select **Edit** from the context menu.
3. Modify the necessary fields in the dialog.
4. Click **Save** to update the target details.

#### Deleting a Target

1. Right-click on the target you wish to delete.
2. Select **Delete** from the context menu.
3. Confirm the deletion in the prompt.


### Categorizing Targets

1. Navigate to the **Categories** section in the sidebar.
2. Click **Add Category** to create a new category.
3. Drag and drop targets into the desired categories for better organization.
4. Rename or delete categories as needed by right-clicking on the category name.

### Using Search & Filter

1. Click on the **Search Bar** at the top of the **Targets** list.
2. Enter keywords, tags, or URLs to find specific targets.
3. Use the **Filter Options** to narrow down results based on categories, tags, or other criteria.

### Managing Favorites

1. To mark a target as a favorite, click the **⭐** icon next to the target.
2. Access all your favorites quickly from the **Favorites** section in the sidebar.
3. Remove a target from favorites by clicking the **⭐** icon again.

### Bulk Import & Export

#### Importing Targets

1. Navigate to **Settings** > **Backup & Restore**.
2. Click **Import** and select your CSV or JSON file containing target URLs.
3. Choose whether to merge with existing targets or overwrite them.
4. Click **Import** to add the targets to your list.

#### Exporting Targets

1. Go to **Settings** > **Backup & Restore**.
2. Click **Export** to download your targets as a CSV or JSON file.
3. Save the file to your preferred location for backups or sharing.

### Adding Custom Tags

1. Open the **Edit Target** dialog for the desired target.
2. In the **Tags** field, enter new tags separated by commas.
3. Click **Save** to apply the tags.
4. Use tags to filter and organize your targets efficiently.

### Adding Notes & Annotations

1. Open the **Edit Target** dialog for the desired target.
2. Enter your notes or annotations in the **Notes** field.
3. Click **Save** to store your notes.
4. Access your notes anytime by viewing the target's details.


### Switching Themes

- Click on the **Theme Toggle** button (sun/moon icon) in the toolbar or use the shortcut `Ctrl + T` to switch between dark and light modes.
- Your theme preference is saved and will persist across sessions.

### Backup & Restore

#### Backing Up Data

1. Navigate to **Settings** > **Backup & Restore**.
2. Click **Export** to save your data as a JSON or CSV file.
3. Store the backup file in a safe location.

#### Restoring Data

1. Go to **Settings** > **Backup & Restore**.
2. Click **Import** and select your previously saved backup file.
3. Choose whether to merge with existing data or replace it.
4. Click **Import** to restore your data.

### Integration with Torn API ⚠️ (Under Construction - Coming soon!) ⚠️

1. Obtain your Torn API token from your Torn account settings.
2. Navigate to **Settings** > **API Integration**.
3. Enter your API token and click **Connect**.
4. Torn Chainer will fetch and display real-time data related to your targets.

### Using the Analytics Dashboard

1. Click on the **Analytics** tab in the sidebar.
2. View interactive charts and statistics about your target management.
3. Analyze metrics such as the number of targets per category, tag distribution, and activity trends.
4. Use insights to optimize your target management strategy.

## ⚙️ Configuration

- **API Integration:**
  - Ensure your Torn API token is securely stored in the `config.json` file located in the user data directory.
  - The API integration allows Torn Chainer to fetch real-time data and updates for your targets.

- **Window Settings:**
  - The application remembers your window size and position for a consistent experience across sessions.

- **Theme Preferences:**
  - Your chosen theme (dark or light) is retained between launches.

- **Data Storage:**
  - All user data, including targets, categories, tags, and settings, are stored locally in the `data` directory.
  - Data is encrypted to ensure privacy and security.

- **Language Settings:**
  - Select your preferred language from the **Settings** > **Language** menu.
  - The application supports multiple languages to cater to a global user base.

## 📝 License

This project is licensed under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are highly appreciated! Whether it's reporting bugs, suggesting new features, or submitting pull requests, your input helps make **Torn Chainer** better for everyone.

### How to Contribute

1. **Fork the Repository**

   Click the **Fork** button at the top of this page to create your own copy of the repository.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/yourusername/TornChainer.git
   cd TornChainer
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Your Changes**

   Implement your feature or bug fix. Ensure your code follows the project's coding standards and includes appropriate documentation.

5. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature Description"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Open a Pull Request**

   Go to the original repository and click the **Compare & pull request** button. Provide a clear description of your changes and submit the pull request.

### Code of Conduct

Please adhere to the [Code of Conduct](CODE_OF_CONDUCT.md) when contributing to this project.

## 📚 Resources

- **Torn API Documentation:** [https://www.torn.com/api.html](https://www.torn.com/api.html)
- **Electron Documentation:** [https://www.electronjs.org/docs](https://www.electronjs.org/docs)
- **Node.js Documentation:** [https://nodejs.org/en/docs/](https://nodejs.org/en/docs/)
- **Contributing Guidelines:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issue Tracker:** [https://github.com/skillerious/TornChainer/issues](https://github.com/skillerious/TornChainer/issues)

## 🏆 Acknowledgements

- **Torn Online Community:** For providing a vibrant and engaging environment that inspired the creation of Torn Chainer.
- **Open Source Contributors:** For their invaluable tools and libraries that made this project possible.
- **Designers and Testers:** For helping create a user-friendly and polished application.

---

Thank you for choosing **Torn Chainer**! Empower your Torn gameplay by staying organized and connected with your targets. If you have any questions or need support, feel free to open an issue on our [GitHub repository](https://github.com/skillerious/TornChainer/issues).

Happy chaining! 🎉

