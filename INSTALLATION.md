
# Milk Center Management App - Installation Guide

This guide provides step-by-step instructions for installing and running the Milk Center Management desktop application.

## System Requirements

- Operating System: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+, Debian 10+)
- RAM: 4 GB minimum, 8 GB recommended
- Disk Space: 500 MB minimum
- Node.js: v16.0.0 or higher (for development only)
- npm: v7.0.0 or higher (for development only)

## Installation Instructions

### For End Users (Pre-built Application)

1. Download the installer for your platform:
   - **Windows**: MilkCenterManagement-Setup-x.x.x.exe
   - **macOS**: MilkCenterManagement-x.x.x.dmg
   - **Linux**: MilkCenterManagement-x.x.x.AppImage or .deb package

2. Run the installer:
   - **Windows**: Double-click the .exe file and follow the installation wizard
   - **macOS**: Open the .dmg file, drag the app to Applications folder
   - **Linux**: 
     - AppImage: Make it executable with `chmod +x MilkCenterManagement-x.x.x.AppImage` and run it
     - Debian/Ubuntu: Install with `sudo dpkg -i MilkCenterManagement_x.x.x_amd64.deb`

3. Launch the application from your desktop shortcut or applications menu.

4. On first run, the application will:
   - Create a database in your user data directory
   - Set up initial settings for offline operation
   - Guide you through initial setup (company information, etc.)

### For Developers (Building from Source)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/milk-center-management.git
   cd milk-center-management
   ```

2. Install dependencies:
   ```bash
   # Use our optimized installation script
   node install.js
   ```

3. Start development server:
   ```bash
   # Use our electron-scripts helper
   node electron-scripts.js start
   ```

4. Build for production:
   ```bash
   # For your current platform:
   node electron-scripts.js build
   
   # For specific platforms:
   node electron-scripts.js build-win    # Windows
   node electron-scripts.js build-mac    # macOS (requires macOS)
   node electron-scripts.js build-linux  # Linux
   ```

## Data Storage and Backup

- All data is stored locally in a SQLite database located in:
  - Windows: `%APPDATA%\milk-center-management\database\milk-centre.db`
  - macOS: `~/Library/Application Support/milk-center-management/database/milk-centre.db`
  - Linux: `~/.config/milk-center-management/database/milk-centre.db`

- To backup your data:
  1. Use the "Export Data" option in the app's Settings menu
  2. Store the exported JSON file in a safe location

- To restore from backup:
  1. Use the "Import Data" option in the app's Settings menu
  2. Select your backup JSON file

## Offline Operation

The app is designed for full offline operation:
- All data is stored locally in a SQLite database
- No internet connection is required for normal operation
- Changes made offline are stored in the local database

## Troubleshooting

### Common Issues

1. **App fails to start**
   - Check if you have sufficient disk space
   - Try reinstalling the application
   - Check system logs for errors

2. **Data not saving**
   - Ensure you have write permissions to the app data directory
   - Check disk space availability
   - Export your data as backup immediately

3. **Performance issues**
   - Large database: Consider archiving old data
   - Limited RAM: Close other applications when using the app

### Getting Help

If you encounter issues not covered here:
1. Check the FAQ in the Help menu of the application
2. Contact support at support@example.com
3. Visit our support website at https://example.com/support

## License

This software is provided under [License Name] license. See the LICENSE file for details.
