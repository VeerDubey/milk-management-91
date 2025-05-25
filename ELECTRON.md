
# Milk Center Management System - Desktop Application

This is the desktop version of the Milk Center Management System, packaged with Electron to run as a standalone application on Windows, macOS, and Linux.

## Features

- Works completely offline
- Native file dialogs for data import/export
- All data stored locally on your device
- Full desktop integration

## Development

To run the application in development mode:

```bash
npm run electron:start
```

This will start both the Vite development server and Electron, allowing you to make changes and see them in real-time.

## Building the Application

### For all platforms (that your current OS supports):

```bash
npm run electron:build
```

### For specific platforms:

```bash
# Windows
npm run electron:package-win

# macOS (only works on macOS)
npm run electron:package-mac

# Linux
npm run electron:package-linux
```

The packaged applications will be available in the `dist_electron` directory.

## Notes

- The application stores all data in the local storage of the Electron application
- Regular backups are recommended using the built-in export functionality
- The application is designed to work completely offline

## System Requirements

- Windows 10 or later
- macOS 10.13 or later
- Linux (most modern distributions)
- 4GB RAM or more recommended
- 100MB disk space (plus space for your data)
