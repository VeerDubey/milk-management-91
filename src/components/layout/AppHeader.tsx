
import React from 'react';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  return (
    <header className="neo-noir-surface border-b border-border-color sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/28f4e98f-6710-4594-b4b9-244b3b660626.png" 
            alt="Naik Milk Distributors" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold neo-noir-gradient-text">
              Naik Milk Distributors
            </h1>
            <p className="text-xs neo-noir-text-muted">Since 1975</p>
          </div>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  );
}
