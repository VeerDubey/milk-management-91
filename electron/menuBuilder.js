
import { app, Menu, shell } from 'electron';

const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin';

/**
 * Builds application menu for Electron
 */
class MenuBuilder {
  static buildMenu(mainWindow) {
    if (isDev) {
      // Add DevTools item in development
      mainWindow.webContents.on('context-menu', (_, props) => {
        const { x, y } = props;
        Menu.buildFromTemplate([
          {
            label: 'Inspect Element',
            click: () => {
              mainWindow.webContents.inspectElement(x, y);
            },
          },
        ]).popup({ window: mainWindow });
      });
    }

    const template = [
      // App menu (macOS only)
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
              ],
            },
          ]
        : []),
      // File menu
      {
        label: 'File',
        submenu: [
          {
            label: 'Export Data',
            click: () => {
              mainWindow.webContents.send('menu-export-data');
            },
          },
          {
            label: 'Import Data',
            click: () => {
              mainWindow.webContents.send('menu-import-data');
            },
          },
          { type: 'separator' },
          isMac ? { role: 'close' } : { role: 'quit' },
        ],
      },
      // Edit menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
                },
              ]
            : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
        ],
      },
      // View menu
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
          ...(isDev
            ? [
                { type: 'separator' },
                { role: 'toggleDevTools' },
              ]
            : []),
        ],
      },
      // Window menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'zoom' },
          ...(isMac
            ? [
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'window' },
              ]
            : [{ role: 'close' }]),
        ],
      },
      // Help menu
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              await shell.openExternal('https://example.com/help');
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    
    return menu;
  }
}

export default MenuBuilder;
