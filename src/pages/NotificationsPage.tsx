
import React from 'react';
import { NotificationService } from '@/components/automation/NotificationService';

export default function NotificationsPage() {
  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold neo-noir-gradient-text">
              Notifications & Automation
            </h1>
            <p className="neo-noir-text-muted">
              Configure SMS, Email, and WhatsApp notifications for automated customer communication
            </p>
          </div>
        </div>

        <NotificationService />
      </div>
    </div>
  );
}
