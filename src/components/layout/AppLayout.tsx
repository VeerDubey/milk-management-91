
import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isOpen} onClose={toggleSidebar} />
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'ml-0'}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
