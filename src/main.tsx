import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ElectronDetector } from './components/ElectronDetector.tsx';
import { OfflineStorageService } from './services/OfflineStorageService';
import { MessagingProvider } from './contexts/MessagingContext';

// Enhanced global error handler with more details
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error message:', event.error?.message);
  console.error('Error stack:', event.error?.stack);
  console.error('Error occurred at:', event.filename, 'line:', event.lineno, 'column:', event.colno);
});

// Enhanced unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Rejection stack:', event.reason?.stack);
});

console.log('Starting application initialization');
console.log('React version:', React.version);
console.log('Environment:', import.meta.env.MODE);

// Initialize offline storage service
OfflineStorageService.initialize();

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    console.log('Creating root element');
    const root = createRoot(rootElement);
    
    console.log('Rendering app to DOM');
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <ElectronDetector />
          <MessagingProvider>
            <App />
          </MessagingProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('React app successfully mounted');
  } catch (error) {
    console.error('Critical error mounting React app:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    });
    
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: red;">Failed to load application</h2>
        <p>An error occurred while loading the application.</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; max-width: 800px; margin: 10px auto; overflow: auto;">
          ${error instanceof Error ? error.message : 'Unknown error'}
        </pre>
        <button onclick="window.location.reload()" style="background: #4b5563; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Reload Application
        </button>
      </div>
    `;
  }
} else {
  console.error('Root element with ID "root" not found in the document');
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2 style="color: red;">Application initialization failed</h2>
      <p>The root element was not found in the document.</p>
    </div>
  `;
}

// Cleanup when application unloads
window.addEventListener('beforeunload', () => {
  OfflineStorageService.cleanup();
});
