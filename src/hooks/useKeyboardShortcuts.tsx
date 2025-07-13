
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfigService from '@/services/ConfigService';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const config = ConfigService.getInstance();

  useEffect(() => {
    const shortcuts: ShortcutAction[] = [
      {
        key: 'n',
        ctrlKey: true,
        action: () => navigate('/order-entry'),
        description: 'New Order (Ctrl+N)'
      },
      {
        key: 'p',
        ctrlKey: true,
        action: () => window.print(),
        description: 'Print (Ctrl+P)'
      },
      {
        key: 's',
        ctrlKey: true,
        action: () => {
          // Save current form if available
          const event = new CustomEvent('keyboard-save');
          window.dispatchEvent(event);
        },
        description: 'Save (Ctrl+S)'
      },
      {
        key: 'd',
        ctrlKey: true,
        action: () => navigate('/dashboard'),
        description: 'Dashboard (Ctrl+D)'
      },
      {
        key: 'o',
        ctrlKey: true,
        action: () => navigate('/orders'),
        description: 'Orders (Ctrl+O)'
      },
      {
        key: 'c',
        ctrlKey: true,
        action: () => navigate('/customers'),
        description: 'Customers (Ctrl+C)'
      },
      {
        key: 'i',
        ctrlKey: true,
        action: () => navigate('/invoices'),
        description: 'Invoices (Ctrl+I)'
      },
      {
        key: 'r',
        ctrlKey: true,
        action: () => navigate('/reports'),
        description: 'Reports (Ctrl+R)'
      },
      {
        key: 'F1',
        action: () => {
          // Show help/shortcuts modal
          const event = new CustomEvent('show-shortcuts');
          window.dispatchEvent(event);
        },
        description: 'Show Shortcuts (F1)'
      }
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!config.getConfig().uiSettings.enableKeyboardShortcuts) return;

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatch = !!shortcut.altKey === event.altKey;
        const shiftMatch = !!shortcut.shiftKey === event.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, config]);

  return {
    shortcuts: [
      'Ctrl+N - New Order',
      'Ctrl+P - Print',
      'Ctrl+S - Save',
      'Ctrl+D - Dashboard',
      'Ctrl+O - Orders',
      'Ctrl+C - Customers',
      'Ctrl+I - Invoices',
      'Ctrl+R - Reports',
      'F1 - Show Shortcuts'
    ]
  };
};
