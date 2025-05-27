
import React from 'react';
import { EnhancedTestingReport } from '@/components/testing/EnhancedTestingReport';

export default function TestingReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Testing & Deployment Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing suite and deployment readiness assessment
          </p>
        </div>
      </div>
      
      <EnhancedTestingReport />
    </div>
  );
}
