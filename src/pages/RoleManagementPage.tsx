
import React from 'react';
import { RoleManagement } from '@/components/access/RoleManagement';

export default function RoleManagementPage() {
  return (
    <div className="neo-noir-bg min-h-screen">
      <div className="container mx-auto py-6 space-y-6">
        <RoleManagement />
      </div>
    </div>
  );
}
