
import React from 'react';
import { BusinessIntelligence } from '@/components/dashboard/BusinessIntelligence';

export default function BusinessIntelligencePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Business Intelligence
          </h1>
          <p className="text-muted-foreground">
            Advanced analytics and insights for your dairy business
          </p>
        </div>
      </div>
      
      <BusinessIntelligence />
    </div>
  );
}
