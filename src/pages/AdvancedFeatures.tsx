
import React from 'react';
import { AdvancedFeatures } from '@/components/advanced/AdvancedFeatures';

export default function AdvancedFeaturesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Advanced Features
          </h1>
          <p className="text-muted-foreground">
            Explore and configure advanced business features
          </p>
        </div>
      </div>
      
      <AdvancedFeatures />
    </div>
  );
}
